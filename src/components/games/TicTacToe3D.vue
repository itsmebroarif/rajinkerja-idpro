<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">STATUS PERMAIINAN</small>
          <span class="fs-5 fw-extrabold text-warning">{{ statusText }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SKOR KAMU (X)</small>
          <span class="fs-5 fw-bold text-info font-monospace">{{ playerWins }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">SKOR AI (O)</small>
          <span class="fs-5 fw-bold text-danger font-monospace">{{ aiWins }}</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white" @click="resetBoard">
          <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Papan
        </button>
      </div>
    </div>

    <!-- 3D Canvas -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 480px; cursor: pointer;" @click="onCanvasClick"></div>

    <!-- Instructions Banner -->
    <div class="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 text-center text-white-50 border-top border-secondary border-opacity-25 z-3 small">
      <i class="bi bi-mouse me-1"></i> Klik pada petak papan 3D di atas untuk meletakkan simbol <strong>X</strong>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound } from '@/utils/gameAudio';

export default {
  name: 'TicTacToe3D',
  setup() {
    const canvasContainer = ref(null);
    const statusText = ref('Giliran Kamu (X)');
    const playerWins = ref(0);
    const aiWins = ref(0);

    let scene, camera, renderer, raycaster, mouse, animationFrameId;
    let boardGrid = Array(9).fill(null); // 'X', 'O', or null
    let cellMeshes = [];
    let placedMeshes = [];

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 700;
      const height = canvasContainer.value.clientHeight || 480;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 7, 7);
      camera.lookAt(0, 0, 0);

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

      createBoard();

      window.addEventListener('resize', onWindowResize);
    };

    const createBoard = () => {
      cellMeshes.forEach(m => scene.remove(m));
      cellMeshes = [];

      for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;

        const geo = new THREE.BoxGeometry(1.4, 0.2, 1.4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          metalness: 0.5
        });
        const cell = new THREE.Mesh(geo, mat);
        cell.position.set((col - 1) * 1.6, 0, (row - 1) * 1.6);
        cell.userData = { index: i };
        scene.add(cell);
        cellMeshes.push(cell);
      }
    };

    const placeSymbol = (index, symbol) => {
      if (boardGrid[index]) return;
      boardGrid[index] = symbol;

      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = (col - 1) * 1.6;
      const z = (row - 1) * 1.6;

      if (symbol === 'X') {
        const group = new THREE.Group();
        const geo = new THREE.BoxGeometry(0.3, 0.3, 1.2);
        const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });

        const bar1 = new THREE.Mesh(geo, mat);
        bar1.rotation.y = Math.PI / 4;
        const bar2 = new THREE.Mesh(geo, mat);
        bar2.rotation.y = -Math.PI / 4;

        group.add(bar1);
        group.add(bar2);
        group.position.set(x, 0.5, z);
        scene.add(group);
        placedMeshes.push(group);
        playSound('click');
      } else {
        const geo = new THREE.TorusGeometry(0.4, 0.12, 16, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b });
        const torus = new THREE.Mesh(geo, mat);
        torus.rotation.x = Math.PI / 2;
        torus.position.set(x, 0.5, z);
        scene.add(torus);
        placedMeshes.push(torus);
        playSound('score');
      }

      checkWinner();
    };

    const checkWinner = () => {
      const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      for (let combo of wins) {
        const [a, b, c] = combo;
        if (boardGrid[a] && boardGrid[a] === boardGrid[b] && boardGrid[a] === boardGrid[c]) {
          if (boardGrid[a] === 'X') {
            statusText.value = '🎉 KAMU MENANG!';
            playerWins.value++;
            playSound('win');
          } else {
            statusText.value = '🤖 AI MENANG!';
            aiWins.value++;
            playSound('fail');
          }
          return true;
        }
      }

      if (boardGrid.every(cell => cell !== null)) {
        statusText.value = '🤝 HASIL SERI!';
        return true;
      }

      return false;
    };

    const aiMove = () => {
      const emptyIndices = boardGrid.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (emptyIndices.length > 0) {
        const rand = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        placeSymbol(rand, 'O');
        if (!statusText.value.includes('MENANG') && !statusText.value.includes('SERI')) {
          statusText.value = 'Giliran Kamu (X)';
        }
      }
    };

    const onCanvasClick = (e) => {
      if (!canvasContainer.value || statusText.value.includes('MENANG') || statusText.value.includes('SERI')) return;

      const rect = canvasContainer.value.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cellMeshes);

      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.index;
        if (!boardGrid[idx]) {
          placeSymbol(idx, 'X');
          if (!statusText.value.includes('MENANG') && !statusText.value.includes('SERI')) {
            statusText.value = 'AI Sedang Berpikir...';
            setTimeout(aiMove, 400);
          }
        }
      }
    };

    const resetBoard = () => {
      boardGrid = Array(9).fill(null);
      statusText.value = 'Giliran Kamu (X)';
      placedMeshes.forEach(m => scene.remove(m));
      placedMeshes = [];
      playSound('select');
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      placedMeshes.forEach(m => {
        m.rotation.y += 0.01;
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
      animate();
    });

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) renderer.dispose();
    });

    return {
      canvasContainer,
      statusText,
      playerWins,
      aiWins,
      onCanvasClick,
      resetBoard
    };
  }
};
</script>

<style scoped>
</style>
