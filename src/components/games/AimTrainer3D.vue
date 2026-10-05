<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SKOR</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">{{ score }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SISA WAKTU</small>
          <span class="fs-4 fw-extrabold text-danger font-monospace">{{ timeLeft }}s</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">AKURASI</small>
          <span class="fs-5 fw-bold text-info font-monospace">{{ accuracy }}%</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
      </div>
    </div>

    <!-- 3D Canvas Container -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 480px; cursor: crosshair;" @click="onCanvasClick"></div>

    <!-- Start / Game Over Screen -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🎯⚡</span>
        <h3 class="fw-extrabold text-warning mb-1">3D AIM TRAINER & SHOOTER</h3>
        <p class="text-light opacity-75 small max-w-sm">Tembak bola target 3D secepat dan seakurat mungkin dalam waktu 30 detik!</p>
      </div>

      <div v-if="isGameOver" class="mb-3 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">SESI SELESAI!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ score }} Poin</div>
        <div class="d-flex justify-content-around mt-2 text-light small">
          <span>Akurasi: <strong>{{ accuracy }}%</strong></span>
          <span>Hit: <strong>{{ totalHits }}</strong></span>
        </div>
        <small class="text-light opacity-75 d-block mt-2">Rekor Terbaik: {{ highScore }} Poin</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Ulangi Latihan' : 'Mulai Latihan Tembak 3D' }}
      </button>

      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small">
        <i class="bi bi-crosshair me-1"></i> Klik kursor langsung pada bola target yang muncul
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'AimTrainer3D',
  setup() {
    const canvasContainer = ref(null);
    const score = ref(0);
    const timeLeft = ref(30);
    const totalClicks = ref(0);
    const totalHits = ref(0);
    const highScore = ref(parseInt(localStorage.getItem('aim3d_highscore') || '0'));
    const isPlaying = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, raycaster, mouse, animationFrameId, timerInterval;
    let activeTargets = [];

    const accuracy = computed(() => {
      if (totalClicks.value === 0) return 100;
      return Math.round((totalHits.value / totalClicks.value) * 100);
    });

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.set(0, 0, 8);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.value.appendChild(renderer.domElement);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Bright Ambient & Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
      hemiLight.position.set(0, 15, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 12, 8);
      scene.add(dirLight);

      for (let i = 0; i < 3; i++) spawnTarget();
      renderer.render(scene, camera);

      window.addEventListener('resize', onWindowResize);
    };

    const spawnTarget = () => {
      if (activeTargets.length >= 4) return;

      const geo = new THREE.SphereGeometry(0.5, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        roughness: 0.1,
        metalness: 0.8
      });
      const target = new THREE.Mesh(geo, mat);

      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 5;
      const z = (Math.random() - 0.5) * 2;

      target.position.set(x, y, z);
      scene.add(target);
      activeTargets.push(target);
    };

    const startGame = () => {
      score.value = 0;
      timeLeft.value = 30;
      totalClicks.value = 0;
      totalHits.value = 0;
      isGameOver.value = false;
      isPlaying.value = true;

      activeTargets.forEach(t => scene.remove(t));
      activeTargets = [];

      for (let i = 0; i < 3; i++) spawnTarget();

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          clearInterval(timerInterval);
          isGameOver.value = true;
          isPlaying.value = false;
          playSound('win');
          if (score.value > highScore.value) {
            highScore.value = score.value;
            localStorage.setItem('aim3d_highscore', highScore.value.toString());
          }
        }
      }, 1000);

      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const onCanvasClick = (e) => {
      if (!isPlaying.value || isGameOver.value || !canvasContainer.value) return;

      totalClicks.value++;
      const rect = canvasContainer.value.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(activeTargets);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        scene.remove(hitObj);
        activeTargets = activeTargets.filter(t => t !== hitObj);

        totalHits.value++;
        score.value += 100;
        playSound('laser');

        spawnTarget();
        spawnTarget();
      } else {
        playSound('click');
      }
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const animate = () => {
      if (!isPlaying.value || isGameOver.value) return;

      animationFrameId = requestAnimationFrame(animate);

      activeTargets.forEach(t => {
        t.rotation.y += 0.02;
      });

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
      if (timerInterval) clearInterval(timerInterval);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) renderer.dispose();
    });

    return {
      canvasContainer,
      score,
      timeLeft,
      totalHits,
      accuracy,
      highScore,
      isPlaying,
      isGameOver,
      muted,
      toggleSound,
      startGame,
      onCanvasClick
    };
  }
};
</script>

<style scoped>
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.max-w-sm { max-width: 24rem; }
.max-w-xs { max-width: 20rem; }
</style>
