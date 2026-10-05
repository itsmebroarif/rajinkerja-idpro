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
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">TARGET HANCUR</small>
          <span class="fs-5 fw-bold text-success font-monospace">{{ kills }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">AMUNISI PELURU</small>
          <span class="badge" :class="ammo > 2 ? 'bg-primary' : 'bg-danger'" style="font-size: 0.85rem;">
            {{ isReloading ? 'RELOADING...' : `${ammo} / ${maxAmmo}` }}
          </span>
        </div>
        <div class="d-none d-md-block">
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">ARMOR TANK</small>
          <div class="progress" style="width: 90px; height: 8px;">
            <div class="progress-bar bg-success" :style="{ width: health + '%' }"></div>
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

    <!-- 3D Canvas Area -->
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 520px; cursor: crosshair;"></div>

    <!-- Crosshair in center during play -->
    <div v-if="isPlaying && !isGameOver && !isPaused" class="position-absolute top-50 start-50 translate-middle pointer-events-none z-2 text-warning opacity-75">
      <i class="bi bi-crosshair fs-3"></i>
    </div>

    <!-- Start / Game Over Overlay Screen -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">🛡️💥🚜</span>
        <h3 class="fw-extrabold text-warning mb-1">3D TANK BATTLE ARENA</h3>
        <p class="text-light opacity-75 small max-w-sm mb-0">Kendalikan Tank Baja 3D Anda! Hancurkan menara radar musuh, drone pengintai, dan bunker lapis baja dengan meriam presisi tinggi.</p>
      </div>

      <div v-if="isGameOver" class="mb-4 bg-danger bg-opacity-25 border border-danger p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-danger mb-1">MISI BERAKHIR!</h5>
        <div class="display-6 fw-extrabold font-monospace text-warning mb-1">{{ score }} Poin</div>
        <small class="text-light opacity-75">Target Hancur: {{ kills }} unit | Rekor Terbaik: {{ highScore }}</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2.5 fs-5" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Mainkan Lagi' : 'Mulai Pertempuran Tank' }}
      </button>

      <!-- Desktop & Mobile Control Guide -->
      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small d-flex flex-wrap justify-content-center gap-3">
        <span><i class="bi bi-keyboard me-1"></i> Maju/Mundur: <strong>W / S / Panah</strong></span>
        <span><i class="bi bi-arrows-expand me-1"></i> Putar Tank: <strong>A / D</strong></span>
        <span><i class="bi bi-bullseye me-1"></i> Tembak Meriam: <strong>Spasi / Klik Kiri</strong></span>
        <span><i class="bi bi-arrow-repeat me-1"></i> Isi Peluru: <strong>R</strong></span>
      </div>
    </div>

    <!-- On-Screen Mobile Touch Controls -->
    <div v-if="isPlaying && !isGameOver" class="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between align-items-end z-3 pointer-events-none">
      <!-- Movement D-Pad -->
      <div class="d-flex flex-column align-items-center gap-1 pointer-events-auto">
        <button class="btn btn-dark bg-opacity-75 text-warning border-secondary rounded-3 p-2.5 shadow" style="width: 50px; height: 50px;" @touchstart.prevent="setMove('forward', true)" @touchend.prevent="setMove('forward', false)" @mousedown.prevent="setMove('forward', true)" @mouseup.prevent="setMove('forward', false)">
          <i class="bi bi-arrow-up-circle-fill fs-4"></i>
        </button>
        <div class="d-flex gap-2">
          <button class="btn btn-dark bg-opacity-75 text-warning border-secondary rounded-3 p-2.5 shadow" style="width: 50px; height: 50px;" @touchstart.prevent="setMove('left', true)" @touchend.prevent="setMove('left', false)" @mousedown.prevent="setMove('left', true)" @mouseup.prevent="setMove('left', false)">
            <i class="bi bi-arrow-left-circle-fill fs-4"></i>
          </button>
          <button class="btn btn-dark bg-opacity-75 text-warning border-secondary rounded-3 p-2.5 shadow" style="width: 50px; height: 50px;" @touchstart.prevent="setMove('backward', true)" @touchend.prevent="setMove('backward', false)" @mousedown.prevent="setMove('backward', true)" @mouseup.prevent="setMove('backward', false)">
            <i class="bi bi-arrow-down-circle-fill fs-4"></i>
          </button>
          <button class="btn btn-dark bg-opacity-75 text-warning border-secondary rounded-3 p-2.5 shadow" style="width: 50px; height: 50px;" @touchstart.prevent="setMove('right', true)" @touchend.prevent="setMove('right', false)" @mousedown.prevent="setMove('right', true)" @mouseup.prevent="setMove('right', false)">
            <i class="bi bi-arrow-right-circle-fill fs-4"></i>
          </button>
        </div>
      </div>

      <!-- Action Buttons (Fire & Reload) -->
      <div class="d-flex gap-2 pointer-events-auto">
        <button class="btn btn-secondary bg-opacity-75 text-white border-secondary rounded-circle shadow p-2" style="width: 54px; height: 54px;" @click="reloadAmmo" title="Isi Peluru">
          <i class="bi bi-arrow-repeat fs-5"></i>
        </button>
        <button class="btn btn-danger text-white border-danger rounded-circle shadow-lg p-2 fw-bold" style="width: 68px; height: 68px;" @click="fireCannon" title="Tembak Meriam">
          <i class="bi bi-crosshair fs-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'Tank3D',
  setup() {
    const canvasContainer = ref(null);
    const score = ref(0);
    const kills = ref(0);
    const highScore = ref(parseInt(localStorage.getItem('tank3d_highscore') || '0', 10));
    const health = ref(100);
    const ammo = ref(6);
    const maxAmmo = 6;
    const isReloading = ref(false);
    const isPlaying = ref(false);
    const isPaused = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    let scene, camera, renderer, animationFrameId;
    let tankGroup, tankTurret, tankBarrel;
    let targets = [];
    let bullets = [];
    let particles = [];

    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    let tankRotation = 0;
    let tankSpeed = 0;
    const maxSpeed = 0.22;
    const accel = 0.015;
    const friction = 0.94;
    const turnSpeed = 0.045;

    const setMove = (dir, val) => {
      keys[dir] = val;
    };

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const togglePause = () => {
      isPaused.value = !isPaused.value;
      if (!isPaused.value) {
        animate();
      }
    };

    const reloadAmmo = () => {
      if (isReloading.value || ammo.value === maxAmmo) return;
      isReloading.value = true;
      playSound('select');
      setTimeout(() => {
        ammo.value = maxAmmo;
        isReloading.value = false;
        playSound('powerup');
      }, 1200);
    };

    const createTank = () => {
      tankGroup = new THREE.Group();

      // Tank Body (Chassis)
      const bodyGeo = new THREE.BoxGeometry(2.4, 0.8, 3.4);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2e5a27,
        roughness: 0.6,
        metalness: 0.3
      });
      const tankBody = new THREE.Mesh(bodyGeo, bodyMat);
      tankBody.position.y = 0.6;
      tankBody.castShadow = true;
      tankBody.receiveShadow = true;
      tankGroup.add(tankBody);

      // Treads (Left & Right)
      const treadGeo = new THREE.BoxGeometry(0.5, 0.6, 3.6);
      const treadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
      
      const leftTread = new THREE.Mesh(treadGeo, treadMat);
      leftTread.position.set(-1.3, 0.3, 0);
      leftTread.castShadow = true;
      tankGroup.add(leftTread);

      const rightTread = new THREE.Mesh(treadGeo, treadMat);
      rightTread.position.set(1.3, 0.3, 0);
      rightTread.castShadow = true;
      tankGroup.add(rightTread);

      // Turret
      const turretGeo = new THREE.CylinderGeometry(0.9, 1.05, 0.65, 12);
      const turretMat = new THREE.MeshStandardMaterial({
        color: 0x3d7034,
        roughness: 0.5,
        metalness: 0.4
      });
      tankTurret = new THREE.Mesh(turretGeo, turretMat);
      tankTurret.position.set(0, 1.25, -0.2);
      tankTurret.castShadow = true;
      tankGroup.add(tankTurret);

      // Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.2, 8);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 });
      tankBarrel = new THREE.Mesh(barrelGeo, barrelMat);
      tankBarrel.rotation.x = Math.PI / 2;
      tankBarrel.position.set(0, 0.05, -1.2);
      tankBarrel.castShadow = true;
      tankTurret.add(tankBarrel);

      tankGroup.position.set(0, 0, 0);
      scene.add(tankGroup);
    };

    const spawnTargets = () => {
      // Clear old targets
      targets.forEach(t => scene.remove(t.mesh));
      targets = [];

      const targetCount = 10;
      for (let i = 0; i < targetCount; i++) {
        const type = Math.random() > 0.4 ? 'bunker' : 'radar';
        const group = new THREE.Group();

        if (type === 'bunker') {
          // Destructible Bunker
          const baseGeo = new THREE.BoxGeometry(2, 1.6, 2);
          const baseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
          const bunker = new THREE.Mesh(baseGeo, baseMat);
          bunker.position.y = 0.8;
          bunker.castShadow = true;
          group.add(bunker);

          // Roof antenna
          const domeGeo = new THREE.SphereGeometry(0.7, 8, 8);
          const domeMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
          const dome = new THREE.Mesh(domeGeo, domeMat);
          dome.position.y = 1.8;
          group.add(dome);
        } else {
          // Radar Station
          const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
          const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
          const pole = new THREE.Mesh(poleGeo, poleMat);
          pole.position.y = 1.5;
          pole.castShadow = true;
          group.add(pole);

          const dishGeo = new THREE.CylinderGeometry(0.9, 0.1, 0.4, 12);
          const dishMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
          const dish = new THREE.Mesh(dishGeo, dishMat);
          dish.position.y = 3.1;
          dish.rotation.z = 0.5;
          group.add(dish);
        }

        // Random position spread across arena
        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 26;
        group.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        scene.add(group);

        targets.push({
          mesh: group,
          radius: 1.4,
          hp: type === 'bunker' ? 2 : 1,
          points: type === 'bunker' ? 150 : 100
        });
      }
    };

    const fireCannon = () => {
      if (!isPlaying.value || isGameOver.value || isPaused.value) return;
      if (ammo.value <= 0) {
        reloadAmmo();
        return;
      }

      ammo.value--;
      playSound('laser');

      // Create cannon shell projectile
      const bulletGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const bulletMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xff8800,
        emissiveIntensity: 0.8
      });
      const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);

      // Calculate world position & forward direction from barrel tip
      const barrelTip = new THREE.Vector3();
      tankBarrel.getWorldPosition(barrelTip);
      bulletMesh.position.copy(barrelTip);

      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(tankGroup.quaternion);

      scene.add(bulletMesh);
      bullets.push({
        mesh: bulletMesh,
        velocity: direction.clone().multiplyScalar(1.1),
        life: 60
      });

      // Recoil effect
      tankBarrel.position.z = -0.9;
      setTimeout(() => {
        if (tankBarrel) tankBarrel.position.z = -1.2;
      }, 100);

      // Muzzle flash particle
      createExplosion(barrelTip, 0xffa500, 6);
    };

    const createExplosion = (pos, color = 0xff4500, count = 15) => {
      for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(0.12 + Math.random() * 0.15, 6, 6);
        const mat = new THREE.MeshBasicMaterial({ color });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        scene.add(p);

        particles.push({
          mesh: p,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.4,
            Math.random() * 0.35 + 0.1,
            (Math.random() - 0.5) * 0.4
          ),
          life: 25 + Math.random() * 15
        });
      }
    };

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth;
      const height = 520;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111827);
      scene.fog = new THREE.FogExp2(0x111827, 0.018);

      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 150);
      camera.position.set(0, 12, 18);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      canvasContainer.value.innerHTML = '';
      canvasContainer.value.appendChild(renderer.domElement);

      // Ground Arena
      const groundGeo = new THREE.PlaneGeometry(100, 100, 30, 30);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.85
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Arena Grid Line Overlay
      const grid = new THREE.GridHelper(100, 50, 0x0284c7, 0x334155);
      grid.position.y = 0.02;
      scene.add(grid);

      // Arena Boundary Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const wallGeo1 = new THREE.BoxGeometry(100, 3, 2);
      const wallGeo2 = new THREE.BoxGeometry(2, 3, 100);

      const w1 = new THREE.Mesh(wallGeo1, wallMat); w1.position.set(0, 1.5, -50); scene.add(w1);
      const w2 = new THREE.Mesh(wallGeo1, wallMat); w2.position.set(0, 1.5, 50); scene.add(w2);
      const w3 = new THREE.Mesh(wallGeo2, wallMat); w3.position.set(-50, 1.5, 0); scene.add(w3);
      const w4 = new THREE.Mesh(wallGeo2, wallMat); w4.position.set(50, 1.5, 0); scene.add(w4);

      // Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
      dirLight.position.set(30, 50, 30);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // Tank and Targets
      createTank();
      spawnTargets();

      // Click to shoot
      renderer.domElement.addEventListener('click', fireCannon);

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('resize', handleResize);
    };

    const handleKeyDown = (e) => {
      if (!isPlaying.value || isPaused.value) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
      if (e.code === 'Space') {
        e.preventDefault();
        fireCannon();
      }
      if (e.code === 'KeyR') reloadAmmo();
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
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

      // Tank Physics & Movement
      if (keys.left) tankRotation += turnSpeed;
      if (keys.right) tankRotation -= turnSpeed;
      tankGroup.rotation.y = tankRotation;

      if (keys.forward) {
        tankSpeed = Math.min(maxSpeed, tankSpeed + accel);
      } else if (keys.backward) {
        tankSpeed = Math.max(-maxSpeed * 0.6, tankSpeed - accel);
      } else {
        tankSpeed *= friction;
      }

      const moveVec = new THREE.Vector3(0, 0, -tankSpeed).applyAxisAngle(new THREE.Vector3(0, 1, 0), tankRotation);
      tankGroup.position.add(moveVec);

      // Clamp tank within arena boundary
      tankGroup.position.x = Math.max(-46, Math.min(46, tankGroup.position.x));
      tankGroup.position.z = Math.max(-46, Math.min(46, tankGroup.position.z));

      // Third-person camera follow
      const camOffset = new THREE.Vector3(0, 8, 14).applyAxisAngle(new THREE.Vector3(0, 1, 0), tankRotation);
      camera.position.lerp(tankGroup.position.clone().add(camOffset), 0.1);
      camera.lookAt(tankGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

      // Update Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.mesh.position.add(b.velocity);
        b.life--;

        // Check collision with targets
        let hit = false;
        for (let j = targets.length - 1; j >= 0; j--) {
          const t = targets[j];
          const dist = b.mesh.position.distanceTo(t.mesh.position);
          if (dist < t.radius) {
            hit = true;
            t.hp--;
            createExplosion(b.mesh.position, 0xff5500, 18);
            playSound('hit');

            if (t.hp <= 0) {
              // Target Destroyed
              createExplosion(t.mesh.position, 0xffaa00, 30);
              playSound('score');
              scene.remove(t.mesh);
              targets.splice(j, 1);
              kills.value++;
              score.value += t.points;

              // Respawn wave if all destroyed
              if (targets.length === 0) {
                spawnTargets();
                playSound('powerup');
              }
            }
            break;
          }
        }

        if (hit || b.life <= 0 || b.mesh.position.y < 0) {
          scene.remove(b.mesh);
          bullets.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.vel);
        p.vel.y -= 0.015; // Gravity
        p.mesh.scale.multiplyScalar(0.95);
        p.life--;

        if (p.life <= 0 || p.mesh.scale.x < 0.05) {
          scene.remove(p.mesh);
          particles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    const startGame = () => {
      score.value = 0;
      kills.value = 0;
      health.value = 100;
      ammo.value = maxAmmo;
      isGameOver.value = false;
      isPaused.value = false;
      isPlaying.value = true;

      tankRotation = 0;
      tankSpeed = 0;
      if (tankGroup) {
        tankGroup.position.set(0, 0, 0);
        tankGroup.rotation.y = 0;
      }

      spawnTargets();
      playSound('powerup');
      animate();
    };

    const resetGame = () => {
      cancelAnimationFrame(animationFrameId);
      bullets.forEach(b => scene.remove(b.mesh));
      bullets = [];
      particles.forEach(p => scene.remove(p.mesh));
      particles = [];
      isPlaying.value = false;
      isGameOver.value = false;
      isPaused.value = false;
      score.value = 0;
      kills.value = 0;
      ammo.value = maxAmmo;
      health.value = 100;
      if (tankGroup) tankGroup.position.set(0, 0, 0);
      renderer.render(scene, camera);
    };

    onMounted(() => {
      initThree();
    });

    onUnmounted(() => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
      }
    });

    return {
      canvasContainer,
      score,
      kills,
      highScore,
      health,
      ammo,
      maxAmmo,
      isReloading,
      isPlaying,
      isPaused,
      isGameOver,
      muted,
      toggleSound,
      togglePause,
      reloadAmmo,
      fireCannon,
      setMove,
      startGame,
      resetGame
    };
  }
};
</script>

<style scoped>
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-auto {
  pointer-events: auto;
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
