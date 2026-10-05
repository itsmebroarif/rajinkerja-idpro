<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD Overlay -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SKOR</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">{{ score }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">NYAWA</small>
          <div class="d-flex gap-1 text-danger">
            <i v-for="n in lives" :key="n" class="bi bi-heart-fill fs-5"></i>
          </div>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">HIGH SCORE</small>
          <span class="fs-5 fw-bold text-info font-monospace">{{ highScore }}</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
        <button v-if="isPlaying && !isGameOver" class="btn btn-sm btn-warning fw-bold rounded-pill px-3" @click="togglePause">
          <i :class="isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'"></i> {{ isPaused ? 'Lanjut' : 'Jeda' }}
        </button>
      </div>
    </div>

    <!-- 3D Canvas Container -->
    <div
      ref="canvasContainer"
      class="w-100 position-relative"
      style="height: 480px; cursor: e-resize;"
      @mousemove="onMouseMove"
      @touchmove.prevent="onTouchMove"
    ></div>

    <!-- Start / Game Over Screen -->
    <div v-if="!isPlaying || isGameOver || isWin" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🧱⚡</span>
        <h3 class="fw-extrabold text-warning mb-1">3D BRICK BREAKER</h3>
        <p class="text-light opacity-75 small max-w-sm">Geser pemukul Anda untuk memantulkan bola 3D dan hancurkan semua susunan bata neon!</p>
      </div>

      <div v-if="isGameOver" class="mb-3 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">GAME OVER!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ score }}</div>
        <small class="text-light opacity-75">High Score: {{ highScore }}</small>
      </div>

      <div v-if="isWin" class="mb-3 bg-success bg-opacity-25 border border-success p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-success mb-1">🎉 SEMUA BATA HANCUR!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ score }}</div>
        <small class="text-light opacity-75">Kerja Bagus!</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver || isWin ? 'Main Lagi' : 'Mulai Game 3D' }}
      </button>

      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small">
        <i class="bi bi-mouse me-1"></i> Geser kursor/sentuh layar untuk menggerakkan pemukul
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'BrickBreaker3D',
  setup() {
    const canvasContainer = ref(null);
    const score = ref(0);
    const lives = ref(3);
    const highScore = ref(parseInt(localStorage.getItem('bb3d_highscore') || '0'));
    const isPlaying = ref(false);
    const isPaused = ref(false);
    const isGameOver = ref(false);
    const isWin = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, animationFrameId;
    let paddle, ball, bricks = [];
    let ballDir = new THREE.Vector3(0.12, 0.16, 0);
    const paddleWidth = 2.4;
    const arenaWidth = 10;
    const arenaHeight = 12;

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0c18);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 14);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.value.appendChild(renderer.domElement);

      // Bright Ambient & Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
      hemiLight.position.set(0, 20, 10);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(0, 8, 12);
      scene.add(dirLight);

      // Arena Frame Border
      const frameGeo = new THREE.BoxGeometry(arenaWidth + 0.4, arenaHeight + 0.4, 0.2);
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      scene.add(frame);

      // 3D Paddle
      const paddleGeo = new THREE.BoxGeometry(paddleWidth, 0.4, 0.6);
      const paddleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, roughness: 0.2 });
      paddle = new THREE.Mesh(paddleGeo, paddleMat);
      paddle.position.set(0, -arenaHeight / 2 + 1, 0);
      scene.add(paddle);

      // 3D Ball
      const ballGeo = new THREE.SphereGeometry(0.35, 32, 32);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, roughness: 0.1 });
      ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(0, -arenaHeight / 2 + 1.8, 0);
      scene.add(ball);

      spawnBricks();
      renderer.render(scene, camera);

      window.addEventListener('resize', onWindowResize);
    };

    const spawnBricks = () => {
      bricks.forEach(b => scene.remove(b));
      bricks = [];

      const rows = 4;
      const cols = 7;
      const brickW = 1.2;
      const brickH = 0.5;
      const colors = [0xef4444, 0xf97316, 0xeab308, 0x10b981];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bGeo = new THREE.BoxGeometry(brickW, brickH, 0.5);
          const bMat = new THREE.MeshStandardMaterial({
            color: colors[r % colors.length],
            roughness: 0.2,
            metalness: 0.5
          });
          const b = new THREE.Mesh(bGeo, bMat);
          const x = (c - (cols - 1) / 2) * (brickW + 0.15);
          const y = arenaHeight / 2 - 1.5 - r * (brickH + 0.2);
          b.position.set(x, y, 0);
          scene.add(b);
          bricks.push(b);
        }
      }
    };

    const startGame = () => {
      score.value = 0;
      lives.value = 3;
      isGameOver.value = false;
      isWin.value = false;
      isPaused.value = false;
      isPlaying.value = true;

      paddle.position.x = 0;
      ball.position.set(0, -arenaHeight / 2 + 1.8, 0);
      ballDir.set((Math.random() - 0.5) * 0.1, 0.16, 0);

      spawnBricks();
      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const togglePause = () => {
      isPaused.value = !isPaused.value;
      if (!isPaused.value) animate();
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const updatePaddlePos = (clientX) => {
      if (!canvasContainer.value || !paddle) return;
      const rect = canvasContainer.value.getBoundingClientRect();
      const relX = (clientX - rect.left) / rect.width; // 0 to 1
      const targetX = (relX - 0.5) * arenaWidth;
      paddle.position.x = Math.max(-arenaWidth / 2 + paddleWidth / 2, Math.min(arenaWidth / 2 - paddleWidth / 2, targetX));
    };

    const onMouseMove = (e) => {
      updatePaddlePos(e.clientX);
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        updatePaddlePos(e.touches[0].clientX);
      }
    };

    const animate = () => {
      if (!isPlaying.value || isPaused.value || isGameOver.value || isWin.value) return;

      animationFrameId = requestAnimationFrame(animate);

      // Move Ball
      ball.position.add(ballDir);

      // Wall Bounce Left/Right
      if (ball.position.x <= -arenaWidth / 2 + 0.3 || ball.position.x >= arenaWidth / 2 - 0.3) {
        ballDir.x *= -1;
        playSound('click');
      }

      // Wall Bounce Top
      if (ball.position.y >= arenaHeight / 2 - 0.3) {
        ballDir.y *= -1;
        playSound('click');
      }

      // Paddle Collision
      if (ball.position.y <= paddle.position.y + 0.4 &&
          ball.position.y >= paddle.position.y - 0.2 &&
          Math.abs(ball.position.x - paddle.position.x) <= paddleWidth / 2 + 0.3) {
        ballDir.y = Math.abs(ballDir.y); // bounce up
        const hitOffset = (ball.position.x - paddle.position.x) / (paddleWidth / 2);
        ballDir.x = hitOffset * 0.18; // angle bounce
        playSound('hit');
      }

      // Ball Missed Bottom
      if (ball.position.y <= -arenaHeight / 2 - 1) {
        lives.value--;
        playSound('fail');
        if (lives.value <= 0) {
          isGameOver.value = true;
          isPlaying.value = false;
          if (score.value > highScore.value) {
            highScore.value = score.value;
            localStorage.setItem('bb3d_highscore', highScore.value.toString());
          }
          return;
        } else {
          // Reset ball
          ball.position.set(paddle.position.x, -arenaHeight / 2 + 1.8, 0);
          ballDir.set((Math.random() - 0.5) * 0.1, 0.16, 0);
        }
      }

      // Brick Collisions
      for (let i = bricks.length - 1; i >= 0; i--) {
        const b = bricks[i];
        if (Math.abs(ball.position.x - b.position.x) < 0.75 &&
            Math.abs(ball.position.y - b.position.y) < 0.45) {
          ballDir.y *= -1;
          scene.remove(b);
          bricks.splice(i, 1);
          score.value += 20;
          playSound('score');

          if (bricks.length === 0) {
            isWin.value = true;
            isPlaying.value = false;
            playSound('win');
            if (score.value > highScore.value) {
              highScore.value = score.value;
              localStorage.setItem('bb3d_highscore', highScore.value.toString());
            }
            return;
          }
          break;
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
      score,
      lives,
      highScore,
      isPlaying,
      isPaused,
      isGameOver,
      isWin,
      muted,
      toggleSound,
      startGame,
      togglePause,
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
