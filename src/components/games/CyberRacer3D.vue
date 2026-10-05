<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD Overlay -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SKOR</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">{{ Math.floor(score) }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">HIGH SCORE</small>
          <span class="fs-5 fw-bold text-info font-monospace">{{ highScore }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">KECEPATAN</small>
          <span class="badge bg-danger rounded-pill px-2 py-1 font-monospace">{{ Math.floor(speed * 100) }} KM/H</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
        <button v-if="isPlaying && !isGameOver" class="btn btn-sm btn-warning fw-bold rounded-pill px-3" @click="togglePause">
          <i :class="isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'"></i> {{ isPaused ? 'Lanjut' : 'Jeda' }}
        </button>
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white" @click="resetGame">
          <i class="bi bi-arrow-counterclockwise"></i> Reset
        </button>
      </div>
    </div>

    <!-- 3D Canvas Area -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 480px; cursor: pointer;"></div>

    <!-- Start / Game Over Overlay Screen -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🏎️⚡</span>
        <h3 class="fw-extrabold text-warning mb-1">CYBER RACER 3D</h3>
        <p class="text-light opacity-75 small max-w-sm">Kendalikan mobil neon Anda di jalan tol 3D. Hindari rintangan merah dan ambil kristal energi kuning!</p>
      </div>

      <div v-if="isGameOver" class="mb-4 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">GAME OVER!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ Math.floor(score) }}</div>
        <small class="text-light opacity-75">Rekor Terbaik: {{ highScore }}</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Main Lagi' : 'Mulai Balapan 3D' }}
      </button>

      <!-- Desktop & Mobile Control Guide -->
      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small d-flex gap-4">
        <span><i class="bi bi-keyboard me-1"></i> Kir/Kan: <strong>A / D</strong> atau <strong>Panah ← →</strong></span>
        <span><i class="bi bi-phone me-1"></i> Layar Sentuh: Tombol Bawah</span>
      </div>
    </div>

    <!-- On-Screen Mobile Touch Controls -->
    <div v-if="isPlaying && !isGameOver" class="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between z-3 pointer-events-none">
      <button class="btn btn-dark bg-opacity-75 text-warning border-warning rounded-circle p-3 shadow-lg pointer-events-auto" style="width: 64px; height: 64px;" @touchstart.prevent="moveLeft" @mousedown.prevent="moveLeft">
        <i class="bi bi-arrow-left-circle-fill fs-3"></i>
      </button>
      <button class="btn btn-dark bg-opacity-75 text-warning border-warning rounded-circle p-3 shadow-lg pointer-events-auto" style="width: 64px; height: 64px;" @touchstart.prevent="moveRight" @mousedown.prevent="moveRight">
        <i class="bi bi-arrow-right-circle-fill fs-3"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'CyberRacer3D',
  setup() {
    const canvasContainer = ref(null);
    const score = ref(0);
    const highScore = ref(parseInt(localStorage.getItem('cr3d_highscore') || '0'));
    const speed = ref(0.25);
    const isPlaying = ref(false);
    const isPaused = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, animationFrameId;
    let playerVehicle, roadGrid, obstacles = [], coins = [], particles = [];
    let playerTargetX = 0;
    let playerCurrentX = 0;
    const laneWidth = 2.2;
    const maxLane = 1; // 3 lanes: -1, 0, 1
    let currentLane = 0;

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a16);
      scene.fog = new THREE.FogExp2(0x0a0a16, 0.025);

      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.set(0, 3.5, 6.5);
      camera.lookAt(0, 1, -10);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      canvasContainer.value.appendChild(renderer.domElement);

      // Bright Vivid Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 1.0);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 15, 10);
      scene.add(dirLight);

      // Neon Road Surface
      const roadGeo = new THREE.PlaneGeometry(10, 100);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.2, metalness: 0.8 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.z = -40;
      scene.add(road);

      // Road Side Neon Lines
      const lineGeo = new THREE.BoxGeometry(0.1, 0.1, 100);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const leftLine = new THREE.Mesh(lineGeo, lineMat);
      leftLine.position.set(-3.5, 0.05, -40);
      const rightLine = new THREE.Mesh(lineGeo, lineMat);
      rightLine.position.set(3.5, 0.05, -40);
      scene.add(leftLine);
      scene.add(rightLine);

      // Player 3D Vehicle (Futuristic Cyber Car)
      const carGroup = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0055, metalness: 0.9, roughness: 0.1 });
      const carBody = new THREE.Mesh(bodyGeo, bodyMat);
      carBody.position.y = 0.3;
      carGroup.add(carBody);

      // Windshield
      const glassGeo = new THREE.BoxGeometry(1.0, 0.3, 0.8);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 1, roughness: 0, opacity: 0.8, transparent: true });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 0.55, -0.1);
      carGroup.add(glass);

      // Rear Glowing Engines
      const engineGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
      const engineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const eng1 = new THREE.Mesh(engineGeo, engineMat);
      eng1.rotation.x = Math.PI / 2;
      eng1.position.set(-0.35, 0.3, 1.0);
      const eng2 = eng1.clone();
      eng2.position.set(0.35, 0.3, 1.0);
      carGroup.add(eng1);
      carGroup.add(eng2);

      carGroup.position.set(0, 0, 0);
      playerVehicle = carGroup;
      scene.add(playerVehicle);

      // Render initial frame
      renderer.render(scene, camera);

      // Resize listener
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', onKeyDown);
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const w = canvasContainer.value.clientWidth;
      const h = canvasContainer.value.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const spawnObstacle = () => {
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const obsGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const obsMat = new THREE.MeshStandardMaterial({ color: 0xff1133, emissive: 0x660011, roughness: 0.3 });
      const obs = new THREE.Mesh(obsGeo, obsMat);
      obs.position.set(lane * laneWidth, 0.6, -60);
      scene.add(obs);
      obstacles.push(obs);
    };

    const spawnCoin = () => {
      const lane = Math.floor(Math.random() * 3) - 1;
      const coinGeo = new THREE.OctahedronGeometry(0.5, 0);
      const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, metalness: 0.9, roughness: 0.1 });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(lane * laneWidth, 0.8, -60);
      scene.add(coin);
      coins.push(coin);
    };

    const startGame = () => {
      score.value = 0;
      speed.value = 0.3;
      currentLane = 0;
      playerTargetX = 0;
      playerCurrentX = 0;
      isGameOver.value = false;
      isPaused.value = false;
      isPlaying.value = true;

      // Clear existing obstacles and coins
      obstacles.forEach(o => scene.remove(o));
      coins.forEach(c => scene.remove(c));
      obstacles = [];
      coins = [];

      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const togglePause = () => {
      isPaused.value = !isPaused.value;
      if (!isPaused.value) animate();
    };

    const resetGame = () => {
      isPlaying.value = false;
      isGameOver.value = false;
      score.value = 0;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const moveLeft = () => {
      if (!isPlaying.value || isGameOver.value || isPaused.value) return;
      if (currentLane > -maxLane) {
        currentLane--;
        playerTargetX = currentLane * laneWidth;
        playSound('click');
      }
    };

    const moveRight = () => {
      if (!isPlaying.value || isGameOver.value || isPaused.value) return;
      if (currentLane < maxLane) {
        currentLane++;
        playerTargetX = currentLane * laneWidth;
        playSound('click');
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
    };

    const animate = () => {
      if (!isPlaying.value || isPaused.value || isGameOver.value) return;

      animationFrameId = requestAnimationFrame(animate);

      // Increase score and speed gradually
      score.value += speed.value * 0.8;
      speed.value += 0.00015;

      // Smooth player lane transition
      playerCurrentX += (playerTargetX - playerCurrentX) * 0.2;
      playerVehicle.position.x = playerCurrentX;
      playerVehicle.rotation.z = (playerCurrentX - playerTargetX) * 0.15; // Lean into turn

      // Random Spawns
      if (Math.random() < 0.035) spawnObstacle();
      if (Math.random() < 0.02) spawnCoin();

      // Move Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.z += speed.value * 12;
        obs.rotation.x += 0.02;

        // Collision Check with Player
        if (Math.abs(obs.position.z - playerVehicle.position.z) < 1.2 &&
            Math.abs(obs.position.x - playerVehicle.position.x) < 0.9) {
          // Crash!
          playSound('explosion');
          isGameOver.value = true;
          isPlaying.value = false;
          if (score.value > highScore.value) {
            highScore.value = Math.floor(score.value);
            localStorage.setItem('cr3d_highscore', highScore.value.toString());
          }
          return;
        }

        // Remove offscreen
        if (obs.position.z > 10) {
          scene.remove(obs);
          obstacles.splice(i, 1);
        }
      }

      // Move Coins
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.position.z += speed.value * 12;
        c.rotation.y += 0.05;

        // Collision Check
        if (Math.abs(c.position.z - playerVehicle.position.z) < 1.2 &&
            Math.abs(c.position.x - playerVehicle.position.x) < 0.9) {
          playSound('coin');
          score.value += 50;
          scene.remove(c);
          coins.splice(i, 1);
          continue;
        }

        if (c.position.z > 10) {
          scene.remove(c);
          coins.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
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
      score,
      highScore,
      speed,
      isPlaying,
      isPaused,
      isGameOver,
      muted,
      toggleSound,
      startGame,
      togglePause,
      resetGame,
      moveLeft,
      moveRight
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
