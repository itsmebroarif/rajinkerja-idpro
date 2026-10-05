<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-4">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">KAMU</small>
          <span class="fs-3 fw-extrabold text-info font-monospace">{{ playerScore }}</span>
        </div>
        <div class="fs-4 text-secondary font-monospace">:</div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">AI LAWAN</small>
          <span class="fs-3 fw-extrabold text-danger font-monospace">{{ aiScore }}</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white" @click="startGame">
          <i class="bi bi-arrow-counterclockwise me-1"></i> Restart
        </button>
      </div>
    </div>

    <!-- 3D Canvas Area -->
    <div
      ref="canvasContainer"
      class="w-100 position-relative"
      style="height: 480px; cursor: ns-resize;"
      @mousemove="onMouseMove"
      @touchmove.prevent="onTouchMove"
    ></div>

    <!-- Start / Game Over Screen -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🏓⚡</span>
        <h3 class="fw-extrabold text-warning mb-1">3D PONG TABLE TENNIS</h3>
        <p class="text-light opacity-75 small max-w-sm">Geser pemukul Anda untuk membalas pukulan bola 3D melawan AI!</p>
      </div>

      <div v-if="isGameOver" class="mb-3 p-3 rounded-4 w-100 max-w-xs" :class="playerScore > aiScore ? 'bg-success bg-opacity-25 border border-success' : 'bg-danger bg-opacity-25 border border-danger'">
        <h5 class="fw-bold mb-1" :class="playerScore > aiScore ? 'text-success' : 'text-danger'">
          {{ playerScore > aiScore ? '🎉 KAMU MENANG!' : '🤖 AI MENANG!' }}
        </h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ playerScore }} - {{ aiScore }}</div>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Main Lagi' : 'Mulai Tanding 3D' }}
      </button>

      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small">
        <i class="bi bi-mouse me-1"></i> Geser kursor ke atas / bawah untuk menggerakkan raket
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'Pong3D',
  setup() {
    const canvasContainer = ref(null);
    const playerScore = ref(0);
    const aiScore = ref(0);
    const isPlaying = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, animationFrameId;
    let playerPaddle, aiPaddle, ball;
    let ballDir = new THREE.Vector3(0.14, 0.08, 0);

    const tableWidth = 10;
    const tableHeight = 6;

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.value.appendChild(renderer.domElement);

      // Bright Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
      hemiLight.position.set(0, 15, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(0, 8, 12);
      scene.add(dirLight);

      // Table Mesh
      const tableGeo = new THREE.BoxGeometry(tableWidth, tableHeight, 0.2);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.z = -0.2;
      scene.add(table);

      // Player Paddle
      const pGeo = new THREE.BoxGeometry(0.3, 1.6, 0.4);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
      playerPaddle = new THREE.Mesh(pGeo, pMat);
      playerPaddle.position.set(-tableWidth / 2 + 0.5, 0, 0);
      scene.add(playerPaddle);

      // AI Paddle
      const aiMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b });
      aiPaddle = new THREE.Mesh(pGeo, aiMat);
      aiPaddle.position.set(tableWidth / 2 - 0.5, 0, 0);
      scene.add(aiPaddle);

      // Ball
      const bGeo = new THREE.SphereGeometry(0.3, 32, 32);
      const bMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04 });
      ball = new THREE.Mesh(bGeo, bMat);
      ball.position.set(0, 0, 0);
      scene.add(ball);

      renderer.render(scene, camera);

      window.addEventListener('resize', onWindowResize);
    };

    const startGame = () => {
      playerScore.value = 0;
      aiScore.value = 0;
      isGameOver.value = false;
      isPlaying.value = true;

      ball.position.set(0, 0, 0);
      ballDir.set(0.14, (Math.random() - 0.5) * 0.1, 0);

      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const updatePaddlePos = (clientY) => {
      if (!canvasContainer.value || !playerPaddle) return;
      const rect = canvasContainer.value.getBoundingClientRect();
      const relY = 1 - (clientY - rect.top) / rect.height; // 0 to 1
      const targetY = (relY - 0.5) * tableHeight;
      playerPaddle.position.y = Math.max(-tableHeight / 2 + 0.8, Math.min(tableHeight / 2 - 0.8, targetY));
    };

    const onMouseMove = (e) => updatePaddlePos(e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) updatePaddlePos(e.touches[0].clientY);
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const animate = () => {
      if (!isPlaying.value || isGameOver.value) return;

      animationFrameId = requestAnimationFrame(animate);

      // Ball Movement
      ball.position.add(ballDir);

      // AI Movement (Track ball y)
      aiPaddle.position.y += (ball.position.y - aiPaddle.position.y) * 0.08;
      aiPaddle.position.y = Math.max(-tableHeight / 2 + 0.8, Math.min(tableHeight / 2 - 0.8, aiPaddle.position.y));

      // Bounce Top / Bottom Walls
      if (ball.position.y <= -tableHeight / 2 + 0.3 || ball.position.y >= tableHeight / 2 - 0.3) {
        ballDir.y *= -1;
        playSound('click');
      }

      // Bounce Player Paddle
      if (ball.position.x <= playerPaddle.position.x + 0.3 &&
          ball.position.x >= playerPaddle.position.x - 0.2 &&
          Math.abs(ball.position.y - playerPaddle.position.y) <= 1.0) {
        ballDir.x = Math.abs(ballDir.x); // bounce right
        ballDir.y = (ball.position.y - playerPaddle.position.y) * 0.15;
        playSound('hit');
      }

      // Bounce AI Paddle
      if (ball.position.x >= aiPaddle.position.x - 0.3 &&
          ball.position.x <= aiPaddle.position.x + 0.2 &&
          Math.abs(ball.position.y - aiPaddle.position.y) <= 1.0) {
        ballDir.x = -Math.abs(ballDir.x); // bounce left
        ballDir.y = (ball.position.y - aiPaddle.position.y) * 0.15;
        playSound('hit');
      }

      // Player Misses (AI Scores)
      if (ball.position.x <= -tableWidth / 2 - 0.5) {
        aiScore.value++;
        playSound('fail');
        if (aiScore.value >= 5) {
          isGameOver.value = true;
          isPlaying.value = false;
        } else {
          ball.position.set(0, 0, 0);
          ballDir.set(0.14, (Math.random() - 0.5) * 0.1, 0);
        }
      }

      // AI Misses (Player Scores)
      if (ball.position.x >= tableWidth / 2 + 0.5) {
        playerScore.value++;
        playSound('score');
        if (playerScore.value >= 5) {
          isGameOver.value = true;
          isPlaying.value = false;
          playSound('win');
        } else {
          ball.position.set(0, 0, 0);
          ballDir.set(-0.14, (Math.random() - 0.5) * 0.1, 0);
        }
      }

      renderer.render(scene, camera);
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const w = canvasContainer.value.clientWidth;
      const h = canvasContainer.value.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    onMounted(() => {
      initThree();
    });

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) renderer.dispose();
    });

    return {
      canvasContainer,
      playerScore,
      aiScore,
      isPlaying,
      isGameOver,
      muted,
      toggleSound,
      startGame,
      onMouseMove,
      onTouchMove
    };
  }
};
</script>

<style scoped>
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.max-w-sm { max-width: 24rem; }
.max-w-xs { max-width: 20rem; }
</style>
