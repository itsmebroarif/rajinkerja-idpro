<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SKOR ULAR</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">{{ score }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">PANJANG ULAR</small>
          <span class="fs-5 fw-bold text-success font-monospace">{{ snakeLength }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">REKOR TERTINGGI</small>
          <span class="fs-5 fw-bold text-info font-monospace">{{ highScore }}</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
      </div>
    </div>

    <!-- 3D Canvas Area -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 480px;"></div>

    <!-- Start / Game Over Screen -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🐍⚡</span>
        <h3 class="fw-extrabold text-warning mb-1">3D SNAKE ARENA</h3>
        <p class="text-light opacity-75 small max-w-sm">Kendalikan ular 3D mengelilingi lapangan voxel dan makan apel neon merah!</p>
      </div>

      <div v-if="isGameOver" class="mb-3 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">GAME OVER!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ score }} Poin</div>
        <small class="text-light opacity-75">Panjang Ular: {{ snakeLength }}</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Main Lagi' : 'Mulai Ular 3D' }}
      </button>

      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small">
        <i class="bi bi-keyboard me-1"></i> Panah / WASD / D-Pad Tombol Sentuh di Layar
      </div>
    </div>

    <!-- On-Screen Touch D-Pad for Mobile -->
    <div v-if="isPlaying && !isGameOver" class="position-absolute bottom-0 end-0 p-3 z-3 pointer-events-none">
      <div class="d-flex flex-column align-items-center gap-1 pointer-events-auto bg-dark bg-opacity-50 p-2 rounded-4 border border-secondary border-opacity-50">
        <button class="btn btn-sm btn-outline-warning rounded-3 px-3 py-2 fw-bold" @touchstart.prevent="setDir('UP')" @mousedown.prevent="setDir('UP')">▲</button>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-warning rounded-3 px-3 py-2 fw-bold" @touchstart.prevent="setDir('LEFT')" @mousedown.prevent="setDir('LEFT')">◄</button>
          <button class="btn btn-sm btn-outline-warning rounded-3 px-3 py-2 fw-bold" @touchstart.prevent="setDir('RIGHT')" @mousedown.prevent="setDir('RIGHT')">►</button>
        </div>
        <button class="btn btn-sm btn-outline-warning rounded-3 px-3 py-2 fw-bold" @touchstart.prevent="setDir('DOWN')" @mousedown.prevent="setDir('DOWN')">▼</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'Snake3D',
  setup() {
    const canvasContainer = ref(null);
    const score = ref(0);
    const snakeLength = ref(3);
    const highScore = ref(parseInt(localStorage.getItem('snake3d_highscore') || '0'));
    const isPlaying = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, animationFrameId, gameLoopInterval;
    let snakeMeshes = [];
    let foodMesh;
    let snakeBody = [
      { x: 0, z: 0 },
      { x: 0, z: 1 },
      { x: 0, z: 2 }
    ];
    let dir = { x: 0, z: -1 };
    let foodPos = { x: 3, z: -3 };
    const gridSize = 14;

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x022c22);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 14, 12);
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
      dirLight.position.set(5, 12, 8);
      scene.add(dirLight);

      // Grid Platform
      const gridGeo = new THREE.BoxGeometry(gridSize, 0.4, gridSize);
      const gridMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 });
      const grid = new THREE.Mesh(gridGeo, gridMat);
      grid.position.y = -0.2;
      scene.add(grid);

      // Food Mesh
      const foodGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const foodMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, roughness: 0.1 });
      foodMesh = new THREE.Mesh(foodGeo, foodMat);
      foodMesh.position.set(foodPos.x, 0.4, foodPos.z);
      scene.add(foodMesh);

      renderSnake();
      renderer.render(scene, camera);

      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', onKeyDown);
    };

    const spawnFood = () => {
      let x = Math.floor(Math.random() * (gridSize - 2)) - (gridSize / 2 - 1);
      let z = Math.floor(Math.random() * (gridSize - 2)) - (gridSize / 2 - 1);
      foodPos = { x, z };
      foodMesh.position.set(x, 0.4, z);
    };

    const setDir = (d) => {
      if (d === 'UP' && dir.z === 0) dir = { x: 0, z: -1 };
      if (d === 'DOWN' && dir.z === 0) dir = { x: 0, z: 1 };
      if (d === 'LEFT' && dir.x === 0) dir = { x: -1, z: 0 };
      if (d === 'RIGHT' && dir.x === 0) dir = { x: 1, z: 0 };
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setDir('UP');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setDir('DOWN');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setDir('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDir('RIGHT');
    };

    const renderSnake = () => {
      snakeMeshes.forEach(m => scene.remove(m));
      snakeMeshes = [];

      snakeBody.forEach((seg, idx) => {
        const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const mat = new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0xfacc15 : 0x10b981,
          roughness: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(seg.x, 0.4, seg.z);
        scene.add(mesh);
        snakeMeshes.push(mesh);
      });
    };

    const stepSnake = () => {
      if (!isPlaying.value || isGameOver.value) return;

      const head = { x: snakeBody[0].x + dir.x, z: snakeBody[0].z + dir.z };

      // Wall Collision
      const halfGrid = gridSize / 2;
      if (head.x <= -halfGrid || head.x >= halfGrid || head.z <= -halfGrid || head.z >= halfGrid) {
        gameOver();
        return;
      }

      // Self Collision
      for (let i = 0; i < snakeBody.length; i++) {
        if (snakeBody[i].x === head.x && snakeBody[i].z === head.z) {
          gameOver();
          return;
        }
      }

      snakeBody.unshift(head);

      // Eat Food
      if (head.x === foodPos.x && head.z === foodPos.z) {
        score.value += 10;
        snakeLength.value = snakeBody.length;
        playSound('coin');
        spawnFood();
      } else {
        snakeBody.pop();
      }

      renderSnake();
    };

    const gameOver = () => {
      playSound('explosion');
      isGameOver.value = true;
      isPlaying.value = false;
      if (score.value > highScore.value) {
        highScore.value = score.value;
        localStorage.setItem('snake3d_highscore', highScore.value.toString());
      }
    };

    const startGame = () => {
      score.value = 0;
      snakeLength.value = 3;
      dir = { x: 0, z: -1 };
      snakeBody = [
        { x: 0, z: 0 },
        { x: 0, z: 1 },
        { x: 0, z: 2 }
      ];

      isGameOver.value = false;
      isPlaying.value = true;

      spawnFood();
      renderSnake();

      if (gameLoopInterval) clearInterval(gameLoopInterval);
      gameLoopInterval = setInterval(stepSnake, 180);

      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const animate = () => {
      if (!isPlaying.value || isGameOver.value) return;

      animationFrameId = requestAnimationFrame(animate);

      if (foodMesh) foodMesh.rotation.y += 0.03;

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
      if (gameLoopInterval) clearInterval(gameLoopInterval);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeyDown);
      if (renderer) renderer.dispose();
    });

    return {
      canvasContainer,
      score,
      snakeLength,
      highScore,
      isPlaying,
      isGameOver,
      muted,
      toggleSound,
      startGame,
      setDir
    };
  }
};
</script>

<style scoped>
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.max-w-sm { max-width: 24rem; }
.max-w-xs { max-width: 20rem; }
.pointer-events-none { pointer-events: none; }
.pointer-events-auto { pointer-events: auto; }
</style>
