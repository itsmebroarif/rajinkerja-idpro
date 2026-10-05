<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">TINGGI MENARA</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">{{ stackHeight }} LT</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">COMBO PERFECT</small>
          <span class="fs-5 fw-bold text-success font-monospace">{{ combo }}x</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">REKOR TERTINGGI</small>
          <span class="fs-5 fw-bold text-info font-monospace">{{ highScore }} LT</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
      </div>
    </div>

    <!-- 3D Canvas Area -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 480px; cursor: pointer;" @click="placeBlock"></div>

    <!-- Start / Game Over Overlay -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🧩⚡</span>
        <h3 class="fw-extrabold text-warning mb-1">3D TOWER BUILDER</h3>
        <p class="text-light opacity-75 small max-w-sm">Tumpuk balok 3D tepat di atas satu sama lain! Ketuk layar saat posisi tepat pas sejajar.</p>
      </div>

      <div v-if="isGameOver" class="mb-3 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">MENARA ROBOH!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ stackHeight }} Lantai</div>
        <small class="text-light opacity-75">Rekor Terbaik: {{ highScore }} Lantai</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click.stop="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Mulai Ulang' : 'Mulai Susun Menara' }}
      </button>

      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small">
        <i class="bi bi-hand-index-thumb me-1"></i> Klik di mana saja / Tekan Spasi untuk menjatuhkan balok
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'TowerBuilder3D',
  setup() {
    const canvasContainer = ref(null);
    const stackHeight = ref(0);
    const combo = ref(0);
    const highScore = ref(parseInt(localStorage.getItem('tb3d_highscore') || '0'));
    const isPlaying = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, animationFrameId;
    let stack = [];
    let currentBlock = null;
    let currentBlockDirection = 'x';
    let blockMoveSpeed = 0.08;
    let blockPos = 0;
    let moveBounds = 3.5;
    let blockHeight = 0.5;
    let currentBlockWidth = 3;
    let currentBlockDepth = 3;

    const colors = [0xef4444, 0xf97316, 0xfacc15, 0x10b981, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xec4899];

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 100);
      camera.position.set(6, 7, 6);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.value.appendChild(renderer.domElement);

      // Bright Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(8, 15, 10);
      scene.add(dirLight);

      addBaseBlock();
      renderer.render(scene, camera);

      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', onKeyDown);
    };

    const addBaseBlock = () => {
      stack.forEach(b => scene.remove(b));
      stack = [];

      const geo = new THREE.BoxGeometry(3, blockHeight, 3);
      const mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const base = new THREE.Mesh(geo, mat);
      base.position.set(0, 0, 0);
      scene.add(base);
      stack.push(base);

      currentBlockWidth = 3;
      currentBlockDepth = 3;
    };

    const spawnNextBlock = () => {
      const prevBlock = stack[stack.length - 1];
      const y = prevBlock.position.y + blockHeight;

      currentBlockDirection = currentBlockDirection === 'x' ? 'z' : 'x';
      const color = colors[stack.length % colors.length];

      const geo = new THREE.BoxGeometry(currentBlockWidth, blockHeight, currentBlockDepth);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2 });
      currentBlock = new THREE.Mesh(geo, mat);

      if (currentBlockDirection === 'x') {
        currentBlock.position.set(-moveBounds, y, prevBlock.position.z);
      } else {
        currentBlock.position.set(prevBlock.position.x, y, -moveBounds);
      }

      blockPos = -moveBounds;
      scene.add(currentBlock);
    };

    const startGame = () => {
      stackHeight.value = 0;
      combo.value = 0;
      blockMoveSpeed = 0.08;
      isGameOver.value = false;
      isPlaying.value = true;

      addBaseBlock();
      spawnNextBlock();

      camera.position.set(6, 7, 6);
      camera.lookAt(0, 0, 0);

      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const placeBlock = () => {
      if (!isPlaying.value || isGameOver.value || !currentBlock) return;

      const prevBlock = stack[stack.length - 1];
      let diff = 0;

      if (currentBlockDirection === 'x') {
        diff = currentBlock.position.x - prevBlock.position.x;
      } else {
        diff = currentBlock.position.z - prevBlock.position.z;
      }

      const absDiff = Math.abs(diff);
      const isPerfect = absDiff < 0.12;

      if (isPerfect) {
        // Snap perfect
        if (currentBlockDirection === 'x') currentBlock.position.x = prevBlock.position.x;
        else currentBlock.position.z = prevBlock.position.z;
        combo.value++;
        playSound('score');
      } else {
        combo.value = 0;
        const currentDimension = currentBlockDirection === 'x' ? currentBlockWidth : currentBlockDepth;
        const overlap = currentDimension - absDiff;

        if (overlap <= 0) {
          // Completely missed!
          playSound('explosion');
          isGameOver.value = true;
          isPlaying.value = false;
          if (stackHeight.value > highScore.value) {
            highScore.value = stackHeight.value;
            localStorage.setItem('tb3d_highscore', highScore.value.toString());
          }
          return;
        }

        // Slice block
        if (currentBlockDirection === 'x') {
          currentBlockWidth = overlap;
          currentBlock.scale.x = currentBlockWidth / 3;
          currentBlock.position.x = prevBlock.position.x + diff / 2;
        } else {
          currentBlockDepth = overlap;
          currentBlock.scale.z = currentBlockDepth / 3;
          currentBlock.position.z = prevBlock.position.z + diff / 2;
        }
        playSound('hit');
      }

      stack.push(currentBlock);
      stackHeight.value++;
      blockMoveSpeed += 0.003;

      // Adjust Camera upwards smoothly
      camera.position.y += blockHeight;

      spawnNextBlock();
    };

    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        placeBlock();
      }
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const animate = () => {
      if (!isPlaying.value || isGameOver.value || !currentBlock) return;

      animationFrameId = requestAnimationFrame(animate);

      blockPos += blockMoveSpeed;
      if (blockPos > moveBounds || blockPos < -moveBounds) {
        blockMoveSpeed = -blockMoveSpeed;
      }

      const prevBlock = stack[stack.length - 1];
      if (currentBlockDirection === 'x') {
        currentBlock.position.x = prevBlock.position.x + blockPos;
      } else {
        currentBlock.position.z = prevBlock.position.z + blockPos;
      }

      renderer.render(scene, camera);
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const w = canvasContainer.value.clientWidth;
      const h = canvasContainer.value.clientHeight;
      renderer.setSize(w, h);
    };

    onMounted(() => {
      initThree();
    });

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeyDown);
      if (renderer) renderer.dispose();
    });

    return {
      canvasContainer,
      stackHeight,
      combo,
      highScore,
      isPlaying,
      isGameOver,
      muted,
      toggleSound,
      startGame,
      placeBlock
    };
  }
};
</script>

<style scoped>
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.max-w-sm { max-width: 24rem; }
.max-w-xs { max-width: 20rem; }
</style>
