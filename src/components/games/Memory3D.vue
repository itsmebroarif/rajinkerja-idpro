<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-4">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">PASANGAN COCOK</small>
          <span class="fs-4 fw-extrabold text-warning font-monospace">{{ matchesCount }} / {{ totalPairs }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">JUMLAH LANGKAH</small>
          <span class="fs-4 fw-extrabold text-info font-monospace">{{ moves }}</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-light rounded-circle p-2" @click="toggleSound" :title="muted ? 'Unmute' : 'Mute'">
          <i :class="muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white" @click="startGame">
          <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Kartu
        </button>
      </div>
    </div>

    <!-- 3D Canvas Area -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 480px; cursor: pointer;" @click="onCanvasClick"></div>

    <!-- Win Screen Overlay -->
    <div v-if="isWin" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🎉🧠</span>
        <h3 class="fw-extrabold text-warning mb-1">SEMUA KARTU COCOK!</h3>
        <p class="text-light opacity-75 small max-w-sm">Daya ingat Anda sangat hebat! Berhasil menyelesaikan dalam {{ moves }} langkah.</p>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> Main Lagi
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'Memory3D',
  setup() {
    const canvasContainer = ref(null);
    const moves = ref(0);
    const matchesCount = ref(0);
    const totalPairs = 6;
    const isWin = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, raycaster, mouse, animationFrameId;
    let cardMeshes = [];
    let flippedCards = [];
    let isProcessing = false;

    const colors = [0xef4444, 0xf97316, 0xfacc15, 0x10b981, 0x06b6d4, 0x8b5cf6];

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 10);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.value.appendChild(renderer.domElement);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Bright Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
      hemiLight.position.set(0, 15, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 12, 8);
      scene.add(dirLight);

      window.addEventListener('resize', onWindowResize);
    };

    const startGame = () => {
      moves.value = 0;
      matchesCount.value = 0;
      isWin.value = false;
      flippedCards = [];
      isProcessing = false;

      cardMeshes.forEach(c => scene.remove(c));
      cardMeshes = [];

      let pairValues = [];
      for (let i = 0; i < totalPairs; i++) {
        pairValues.push(i, i);
      }
      pairValues.sort(() => Math.random() - 0.5);

      const cols = 4;
      const rows = 3;
      const cardW = 1.4;
      const cardH = 1.9;

      for (let i = 0; i < pairValues.length; i++) {
        const val = pairValues[i];
        const r = Math.floor(i / cols);
        const c = i % cols;

        const group = new THREE.Group();

        // Card Back
        const backGeo = new THREE.BoxGeometry(cardW, cardH, 0.1);
        const backMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const back = new THREE.Mesh(backGeo, backMat);

        // Card Front Emblem
        const frontGeo = new THREE.BoxGeometry(cardW - 0.2, cardH - 0.2, 0.12);
        const frontMat = new THREE.MeshStandardMaterial({ color: colors[val], emissive: colors[val], roughness: 0.2 });
        const front = new THREE.Mesh(frontGeo, frontMat);
        front.position.z = -0.02;

        group.add(back);
        group.add(front);

        const x = (c - (cols - 1) / 2) * (cardW + 0.3);
        const y = (1 - r) * (cardH + 0.3);
        group.position.set(x, y, 0);

        group.userData = { id: i, val: val, isFlipped: false, isMatched: false };
        scene.add(group);
        cardMeshes.push(group);
      }

      playSound('select');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    };

    const flipCard = (card) => {
      if (card.userData.isFlipped || card.userData.isMatched || isProcessing) return;

      card.userData.isFlipped = true;
      flippedCards.push(card);
      playSound('click');

      if (flippedCards.length === 2) {
        moves.value++;
        isProcessing = true;
        const [c1, c2] = flippedCards;

        if (c1.userData.val === c2.userData.val) {
          c1.userData.isMatched = true;
          c2.userData.isMatched = true;
          matchesCount.value++;
          playSound('score');
          flippedCards = [];
          isProcessing = false;

          if (matchesCount.value === totalPairs) {
            isWin.value = true;
            playSound('win');
          }
        } else {
          setTimeout(() => {
            c1.userData.isFlipped = false;
            c2.userData.isFlipped = false;
            flippedCards = [];
            isProcessing = false;
          }, 900);
        }
      }
    };

    const onCanvasClick = (e) => {
      if (!canvasContainer.value || isProcessing) return;

      const rect = canvasContainer.value.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData.id && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData.id !== undefined) {
          flipCard(parent);
        }
      }
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      cardMeshes.forEach(card => {
        const targetRot = card.userData.isFlipped ? Math.PI : 0;
        card.rotation.y += (targetRot - card.rotation.y) * 0.15;
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
      startGame();
    });

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) renderer.dispose();
    });

    return {
      canvasContainer,
      moves,
      matchesCount,
      totalPairs,
      isWin,
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
</style>
