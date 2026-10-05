<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD Overlay -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">CUAN WARKOP</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">Rp {{ cuan.toLocaleString() }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">PELANGGAN PUAS</small>
          <span class="fs-5 fw-bold text-success font-monospace">😊 {{ servedCount }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">COMBO STREAK</small>
          <span class="badge bg-danger rounded-pill px-2.5 py-1 font-monospace fs-6">🔥 x{{ streak }}</span>
        </div>
        <div class="d-none d-md-block">
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">REPUTASI WARKOP</small>
          <div class="progress" style="width: 80px; height: 8px;">
            <div class="progress-bar bg-warning" :style="{ width: reputation + '%' }"></div>
          </div>
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

    <!-- Active Customer Order Floating Card -->
    <div v-if="isPlaying && !isGameOver && currentOrder" class="position-absolute top-16 start-50 translate-middle-x z-3 bg-white text-dark rounded-4 shadow-lg p-3 border-2 border-warning" style="top: 80px; min-width: 320px; max-width: 90%;">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-4">{{ currentOrder.avatar }}</span>
          <div>
            <strong class="d-block text-dark leading-tight">{{ currentOrder.customerName }}</strong>
            <small class="text-muted" style="font-size: 0.75rem;">Minta: <strong>{{ currentOrder.title }}</strong></small>
          </div>
        </div>
        <span class="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill">+Rp {{ currentOrder.reward.toLocaleString() }}</span>
      </div>

      <!-- Customer Patience Bar -->
      <div class="progress rounded-pill mb-2" style="height: 6px;">
        <div
          class="progress-bar rounded-pill"
          :class="orderPatience > 50 ? 'bg-success' : orderPatience > 20 ? 'bg-warning' : 'bg-danger'"
          :style="{ width: orderPatience + '%' }"
        ></div>
      </div>

      <!-- Required Recipe Ingredients -->
      <div class="d-flex align-items-center gap-1.5 flex-wrap small">
        <span class="text-muted">Resep:</span>
        <span
          v-for="(ing, idx) in currentOrder.recipe"
          :key="idx"
          class="badge px-2 py-1 rounded-pill border"
          :class="preparedIngredients.includes(ing) ? 'bg-success text-white border-success' : 'bg-light text-dark border-secondary'"
        >
          <i v-if="preparedIngredients.includes(ing)" class="bi bi-check-lg me-1"></i>
          {{ ing }}
        </span>
      </div>
    </div>

    <!-- 3D Canvas Area -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 520px;"></div>

    <!-- Warkop Barista Kitchen Prep Table (Bottom Overlay) -->
    <div v-if="isPlaying && !isGameOver" class="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-90 backdrop-blur border-top border-secondary border-opacity-30 z-3">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
        <!-- Ingredients Clickable Buttons -->
        <div class="d-flex flex-wrap align-items-center gap-2">
          <button
            v-for="item in availableIngredients"
            :key="item.id"
            class="btn btn-sm rounded-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm transition-all"
            :class="preparedIngredients.includes(item.label) ? 'btn-success text-white' : 'btn-outline-light bg-dark bg-opacity-50'"
            @click="toggleIngredient(item.label)"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>

        <!-- Action: Serve / Clear -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold" @click="clearPrepTable">
            <i class="bi bi-x-circle me-1"></i> Kosongkan
          </button>
          <button
            class="btn btn-sm btn-warning text-dark rounded-pill px-4 py-2 fw-extrabold shadow d-flex align-items-center gap-1.5"
            @click="serveOrder"
          >
            <i class="bi bi-cup-hot-fill fs-5"></i>
            <span>SAJIKAN PESANAN!</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Start / GameOver Overlay -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">☕🍜🏮</span>
        <h3 class="fw-extrabold text-warning mb-1">WARKOP SIMULATOR 3D</h3>
        <p class="text-light opacity-75 small max-w-sm mb-0">Rasakan asyiknya jadi Abang Warkop Indonesia! Sajikan Kopi Tubruk, Kopi Susu Panas, Es Teh Manis, Indomie Telor, dan Gorengan renyah sebelum kesabaran pelanggan habis.</p>
      </div>

      <div v-if="isGameOver" class="mb-4 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">WARKOP TUTUP SEMENTARA!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">Rp {{ cuan.toLocaleString() }}</div>
        <small class="text-light opacity-75">Pelanggan Puas: {{ servedCount }} Orang</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2.5 fs-5 text-dark" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Buka Warkop Lagi' : 'Buka Warung Kopi' }}
      </button>

      <!-- Help Tip -->
      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small">
        <i class="bi bi-lightbulb-fill text-warning me-1"></i> Tips: Klik bahan yang sesuai dengan pesanan pelanggan di atas, lalu tekan <strong>Sajikan Pesanan</strong>!
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'WarkopSimulator3D',
  setup() {
    const canvasContainer = ref(null);
    const cuan = ref(0);
    const servedCount = ref(0);
    const streak = ref(0);
    const reputation = ref(100);

    const isPlaying = ref(false);
    const isPaused = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    const currentOrder = ref(null);
    const orderPatience = ref(100);
    const preparedIngredients = ref([]);

    let scene, camera, renderer, animationFrameId;
    let coffeeGlassMesh, indomieBowlMesh, kerupukTinMesh, kettleMesh;
    let patienceTimer = null;

    const availableIngredients = [
      { id: 'kopi', label: 'Bubuk Kopi', icon: '🫘' },
      { id: 'air_panas', label: 'Air Panas', icon: '♨️' },
      { id: 'susu', label: 'Susu Kental', icon: '🥛' },
      { id: 'teh', label: 'Daun Teh', icon: '🫖' },
      { id: 'es', label: 'Es Batu', icon: '🧊' },
      { id: 'mi', label: 'Indomie', icon: '🍜' },
      { id: 'telor', label: 'Telor Rebus', icon: '🥚' },
      { id: 'gorengan', label: 'Gorengan Bakwan', icon: '🥟' }
    ];

    const menuBook = [
      {
        id: 'kopi_tubruk',
        title: 'Kopi Tubruk Panas',
        avatar: '🧔',
        customerName: 'Pak RT',
        recipe: ['Bubuk Kopi', 'Air Panas'],
        reward: 5000
      },
      {
        id: 'kopi_susu',
        title: 'Kopi Susu Manis',
        avatar: '👨‍💼',
        customerName: 'Mas Proyek',
        recipe: ['Bubuk Kopi', 'Susu Kental', 'Air Panas'],
        reward: 8000
      },
      {
        id: 'es_teh',
        title: 'Es Teh Manis Jumbo',
        avatar: '🧑‍🎓',
        customerName: 'Anak Kuliahan',
        recipe: ['Daun Teh', 'Air Panas', 'Es Batu'],
        reward: 6000
      },
      {
        id: 'indomie_telor',
        title: 'Indomie Telor Kornet',
        avatar: '💻',
        customerName: 'Programmer Lembur',
        recipe: ['Indomie', 'Telor Rebus', 'Air Panas'],
        reward: 15000
      },
      {
        id: 'ngopi_gorengan',
        title: 'Kopi Susu & Gorengan',
        avatar: '🛵',
        customerName: 'Bang Ojol',
        recipe: ['Bubuk Kopi', 'Susu Kental', 'Air Panas', 'Gorengan Bakwan'],
        reward: 12000
      }
    ];

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const togglePause = () => {
      isPaused.value = !isPaused.value;
      if (!isPaused.value) {
        animate();
      }
    };

    const toggleIngredient = (label) => {
      if (!isPlaying.value || isPaused.value) return;
      const idx = preparedIngredients.value.indexOf(label);
      if (idx !== -1) {
        preparedIngredients.value.splice(idx, 1);
        playSound('select');
      } else {
        preparedIngredients.value.push(label);
        playSound('click');

        // Coffee glass bounce animation when adding drink ingredient
        if (coffeeGlassMesh && (label.includes('Kopi') || label.includes('Air'))) {
          coffeeGlassMesh.position.y = 1.6;
          setTimeout(() => {
            if (coffeeGlassMesh) coffeeGlassMesh.position.y = 1.35;
          }, 150);
        }
      }
    };

    const clearPrepTable = () => {
      preparedIngredients.value = [];
      playSound('select');
    };

    const spawnNextOrder = () => {
      if (patienceTimer) clearInterval(patienceTimer);
      preparedIngredients.value = [];

      const randomDish = menuBook[Math.floor(Math.random() * menuBook.length)];
      currentOrder.value = { ...randomDish };
      orderPatience.value = 100;

      // Patience timer count down
      const intervalMs = 250;
      const decayPerTick = 1.2;
      patienceTimer = setInterval(() => {
        if (!isPlaying.value || isPaused.value) return;
        orderPatience.value -= decayPerTick;

        if (orderPatience.value <= 0) {
          // Customer leaves unhappy
          clearInterval(patienceTimer);
          playSound('hit');
          streak.value = 0;
          reputation.value = Math.max(0, reputation.value - 20);

          if (reputation.value <= 0) {
            isGameOver.value = true;
            isPlaying.value = false;
          } else {
            spawnNextOrder();
          }
        }
      }, intervalMs);
    };

    const serveOrder = () => {
      if (!isPlaying.value || isPaused.value || !currentOrder.value) return;

      const req = currentOrder.value.recipe;
      const current = preparedIngredients.value;

      // Check if current ingredients contain all recipe requirements
      const isCorrect = req.length === current.length && req.every(r => current.includes(r));

      if (isCorrect) {
        // Success!
        if (patienceTimer) clearInterval(patienceTimer);
        const bonus = Math.floor(currentOrder.value.reward * (orderPatience.value / 100) * 0.5);
        cuan.value += currentOrder.value.reward + bonus;
        servedCount.value++;
        streak.value++;
        reputation.value = Math.min(100, reputation.value + 10);

        playSound('coin');

        // Customer satisfied, spawn next
        setTimeout(() => {
          spawnNextOrder();
        }, 300);
      } else {
        // Wrong order!
        playSound('hit');
        reputation.value = Math.max(0, reputation.value - 10);
        streak.value = 0;
      }
    };

    const createWarkopScene = () => {
      // 1. Counter Table (Meja Bar Kayu Warkop)
      const counterGeo = new THREE.BoxGeometry(16, 2.4, 4);
      const counterMat = new THREE.MeshStandardMaterial({
        color: 0x5c3820,
        roughness: 0.7
      });
      const counter = new THREE.Mesh(counterGeo, counterMat);
      counter.position.set(0, 0, 0);
      counter.receiveShadow = true;
      scene.add(counter);

      // 2. Banner Warkop Barokah 24 Jam (Belakang Meja)
      const bannerGeo = new THREE.PlaneGeometry(12, 2.5);
      const bannerMat = new THREE.MeshStandardMaterial({ color: 0x15803d }); // Hijau Warkop
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, 4, -4);
      scene.add(banner);

      // 3. Kaleng Kerupuk Putih (Iconic Cracker Tin)
      const tinGeo = new THREE.BoxGeometry(1.8, 2.5, 1.8);
      const tinMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
      kerupukTinMesh = new THREE.Mesh(tinGeo, tinMat);
      kerupukTinMesh.position.set(-5, 2.45, -0.5);
      kerupukTinMesh.castShadow = true;
      scene.add(kerupukTinMesh);

      // 4. Teko Air Panas Stainless Steel (Kettle)
      const kettleGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.8, 16);
      const kettleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
      kettleMesh = new THREE.Mesh(kettleGeo, kettleMat);
      kettleMesh.position.set(4.5, 2.1, -0.6);
      kettleMesh.castShadow = true;
      scene.add(kettleMesh);

      // 5. Gelas Kopi Kaca Bergagang
      const glassGeo = new THREE.CylinderGeometry(0.5, 0.4, 1.1, 12);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x3e2723,
        roughness: 0.1,
        transmission: 0.6,
        thickness: 0.4
      });
      coffeeGlassMesh = new THREE.Mesh(glassGeo, glassMat);
      coffeeGlassMesh.position.set(-1.2, 1.75, 0.8);
      coffeeGlassMesh.castShadow = true;
      scene.add(coffeeGlassMesh);

      // 6. Piring & Gorengan (Bakwan & Pisang Goreng)
      const plateGeo = new THREE.CylinderGeometry(1.3, 1.1, 0.15, 16);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.set(1.5, 1.3, 0.6);
      plate.receiveShadow = true;
      scene.add(plate);

      // Gorengan items on plate
      const gorenganGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
      const gorenganMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
      for (let g = 0; g < 3; g++) {
        const gMesh = new THREE.Mesh(gorenganGeo, gorenganMat);
        gMesh.position.set(1.1 + g * 0.4, 1.5, 0.4 + (g % 2) * 0.3);
        gMesh.rotation.y = g * 0.5;
        scene.add(gMesh);
      }
    };

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth;
      const height = 520;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x18181b); // Warm cozy night ambiance

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 4.8, 9.5);
      camera.lookAt(0, 1.6, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;

      canvasContainer.value.innerHTML = '';
      canvasContainer.value.appendChild(renderer.domElement);

      // Warm Cozy Lighting (Lampu Bohlam Kuning Warkop)
      const ambLight = new THREE.AmbientLight(0xffedd5, 0.8);
      scene.add(ambLight);

      const lampLight = new THREE.PointLight(0xfbbf24, 2.5, 20);
      lampLight.position.set(0, 6, 2);
      lampLight.castShadow = true;
      scene.add(lampLight);

      createWarkopScene();

      window.addEventListener('resize', handleResize);
    };

    const handleResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const width = canvasContainer.value.clientWidth;
      const height = 520;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const animate = () => {
      if (!isPlaying.value || isPaused.value) return;
      animationFrameId = requestAnimationFrame(animate);

      // Gentle steaming idle bob for kettle and glass
      const t = Date.now() * 0.003;
      if (kettleMesh) {
        kettleMesh.rotation.y += 0.003;
      }
      if (coffeeGlassMesh) {
        coffeeGlassMesh.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    const startGame = () => {
      cuan.value = 0;
      servedCount.value = 0;
      streak.value = 0;
      reputation.value = 100;
      isPlaying.value = true;
      isPaused.value = false;
      isGameOver.value = false;

      spawnNextOrder();
      playSound('powerup');
      animate();
    };

    const resetGame = () => {
      cancelAnimationFrame(animationFrameId);
      if (patienceTimer) clearInterval(patienceTimer);
      isPlaying.value = false;
      isPaused.value = false;
      isGameOver.value = false;
      currentOrder.value = null;
      preparedIngredients.value = [];
      renderer.render(scene, camera);
    };

    onMounted(() => {
      initThree();
    });

    onUnmounted(() => {
      cancelAnimationFrame(animationFrameId);
      if (patienceTimer) clearInterval(patienceTimer);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
      }
    });

    return {
      canvasContainer,
      cuan,
      servedCount,
      streak,
      reputation,
      isPlaying,
      isPaused,
      isGameOver,
      muted,
      currentOrder,
      orderPatience,
      preparedIngredients,
      availableIngredients,
      toggleSound,
      togglePause,
      toggleIngredient,
      clearPrepTable,
      serveOrder,
      startGame,
      resetGame
    };
  }
};
</script>

<style scoped>
.backdrop-blur {
  backdrop-filter: blur(10px);
}
.inset-0 {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.max-w-sm {
  max-width: 440px;
}
.max-w-xs {
  max-width: 320px;
}
</style>
