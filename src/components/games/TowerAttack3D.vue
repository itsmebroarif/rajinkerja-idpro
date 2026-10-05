<template>
  <div class="game-container w-100 position-relative rounded-4 overflow-hidden bg-dark shadow-lg">
    <!-- Top HUD Overlay -->
    <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center bg-dark bg-opacity-75 text-white z-3 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div>
          <small class="text-warning d-block fw-bold" style="font-size: 0.7rem;">STAGE / LANTAI</small>
          <span class="fs-4 fw-extrabold text-white font-monospace">Stage {{ stage }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">EMAS PETUALANG</small>
          <span class="fs-5 fw-bold text-warning font-monospace">🪙 {{ gold.toLocaleString() }}</span>
        </div>
        <div>
          <small class="text-secondary d-block fw-bold" style="font-size: 0.7rem;">TOTAL MENARA JEBOL</small>
          <span class="badge bg-success rounded-pill px-2.5 py-1 font-monospace fs-6">🏰 {{ towersDestroyed }}</span>
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
    <div ref="canvasContainer" class="w-100 position-relative" style="height: 520px; cursor: pointer;" @click="onCanvasClick"></div>

    <!-- Action Skills Bar & Upgrades (Bottom overlay during play) -->
    <div v-if="isPlaying && !isGameOver" class="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-80 backdrop-blur border-top border-secondary border-opacity-25 z-3">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <!-- Special Skills Buttons -->
        <div class="d-flex align-items-center gap-2">
          <!-- Skill 1: Tusukan Keris Emas -->
          <button
            class="btn btn-sm px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow"
            :class="skill1Cd <= 0 ? 'btn-warning text-dark' : 'btn-secondary disabled'"
            :disabled="skill1Cd > 0"
            @click="useSkill1"
          >
            <span>🗡️ Tusukan Keris Emas</span>
            <span v-if="skill1Cd > 0" class="badge bg-dark text-white rounded-pill">{{ skill1Cd }}s</span>
          </button>

          <!-- Skill 2: Hujan Panah Petualang -->
          <button
            class="btn btn-sm px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow"
            :class="skill2Cd <= 0 ? 'btn-info text-dark' : 'btn-secondary disabled'"
            :disabled="skill2Cd > 0"
            @click="useSkill2"
          >
            <span>🏹 Hujan Panah</span>
            <span v-if="skill2Cd > 0" class="badge bg-dark text-white rounded-pill">{{ skill2Cd }}s</span>
          </button>

          <!-- Skill 3: Aura Emas Mas -->
          <button
            class="btn btn-sm px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow"
            :class="skill3Cd <= 0 ? 'btn-danger text-white' : 'btn-secondary disabled'"
            :disabled="skill3Cd > 0"
            @click="useSkill3"
          >
            <span>⚡ Aura Emas (2x ATK)</span>
            <span v-if="skill3Cd > 0" class="badge bg-dark text-white rounded-pill">{{ skill3Cd }}s</span>
            <span v-else-if="auraActive" class="badge bg-warning text-dark rounded-pill animate-pulse">AKTIF</span>
          </button>
        </div>

        <!-- Upgrade Stats with Gold -->
        <div class="d-flex align-items-center gap-2">
          <button
            class="btn btn-sm btn-outline-warning rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5"
            :class="{ disabled: gold < atkUpgradeCost }"
            :disabled="gold < atkUpgradeCost"
            @click="upgradeAtk"
          >
            <i class="bi bi-shield-shaded"></i>
            <span>Upgrade ATK (+{{ atkLevel * 10 }})</span>
            <span class="badge bg-warning text-dark font-monospace">{{ atkUpgradeCost }}g</span>
          </button>

          <!-- Tap to Attack CTA -->
          <button class="btn btn-sm btn-primary rounded-pill px-4 py-2 fw-extrabold shadow d-flex align-items-center gap-1 text-white" @click="heroAttack">
            <i class="bi bi-lightning-fill"></i>
            <span>SERANG! (TAP)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Start / Victory Screen Overlay -->
    <div v-if="!isPlaying || isGameOver" class="position-absolute inset-0 bg-dark bg-opacity-85 d-flex flex-column align-items-center justify-content-center text-white z-3 p-4 text-center">
      <div class="mb-3">
        <span class="fs-1 d-block mb-2">⚔️🏰✨</span>
        <h3 class="fw-extrabold text-warning mb-1">PETUALANG MAS: TOWER ATTACK</h3>
        <p class="text-light opacity-75 small max-w-sm mb-0">Bantu Sang Petualang Mas menyerang dan merebut menara-menara benteng musuh! Gunakan Keris Sakti, panggil bala bantuan panah, dan hancurkan setiap lantai menara.</p>
      </div>

      <div v-if="isGameOver" class="mb-4 bg-warning bg-opacity-20 border border-warning p-3 rounded-4 w-100 max-w-xs">
        <h5 class="fw-bold text-warning mb-1">MISI SELESAI!</h5>
        <div class="display-6 fw-extrabold font-monospace text-white mb-1">Stage {{ stage }}</div>
        <small class="text-light opacity-75">Menara Dihancurkan: {{ towersDestroyed }} | Emas: {{ gold }}</small>
      </div>

      <button class="btn btn-warning btn-lg rounded-pill px-5 fw-extrabold shadow-lg py-2.5 fs-5 text-dark" @click="startGame">
        <i class="bi bi-play-circle-fill me-2"></i> {{ isGameOver ? 'Serbu Lagi' : 'Mulai Serbuan Menara' }}
      </button>

      <!-- Desktop & Mobile Control Guide -->
      <div class="mt-4 pt-3 border-top border-secondary border-opacity-50 text-secondary small d-flex flex-wrap justify-content-center gap-3">
        <span><i class="bi bi-mouse me-1"></i> Klik Menara / Tekan <strong>Spasi</strong> untuk Menyerang</span>
        <span><i class="bi bi-keyboard me-1"></i> Shortcut Skill: <strong>1, 2, 3</strong></span>
        <span><i class="bi bi-phone me-1"></i> Sentuh / Tap Layar berulang kali</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { playSound, toggleMuteSound, isSoundMuted } from '@/utils/gameAudio';

export default {
  name: 'TowerAttack3D',
  setup() {
    const canvasContainer = ref(null);
    const stage = ref(1);
    const gold = ref(0);
    const towersDestroyed = ref(0);
    const atkLevel = ref(1);
    const atkUpgradeCost = ref(50);
    const baseDamage = ref(25);

    const isPlaying = ref(false);
    const isPaused = ref(false);
    const isGameOver = ref(false);
    const muted = ref(isSoundMuted());

    // Skills cooldown
    const skill1Cd = ref(0);
    const skill2Cd = ref(0);
    const skill3Cd = ref(0);
    const auraActive = ref(false);

    let scene, camera, renderer, animationFrameId;
    let heroGroup, swordMesh;
    let towers = [];
    let projectiles = [];
    let particles = [];
    let floatingTexts = [];

    const toggleSound = () => {
      muted.value = toggleMuteSound();
    };

    const togglePause = () => {
      isPaused.value = !isPaused.value;
      if (!isPaused.value) {
        animate();
      }
    };

    const upgradeAtk = () => {
      if (gold.value < atkUpgradeCost.value) return;
      gold.value -= atkUpgradeCost.value;
      atkLevel.value++;
      baseDamage.value = Math.floor(25 * Math.pow(1.3, atkLevel.value - 1));
      atkUpgradeCost.value = Math.floor(50 * Math.pow(1.4, atkLevel.value - 1));
      playSound('powerup');
    };

    const createHeroMas = () => {
      heroGroup = new THREE.Group();

      // Body (Golden Armor)
      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.4, 1.4, 8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Golden yellow
        metalness: 0.7,
        roughness: 0.3
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.2;
      body.castShadow = true;
      heroGroup.add(body);

      // Head / Blangkon
      const headGeo = new THREE.SphereGeometry(0.38, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 2.1;
      head.castShadow = true;
      heroGroup.add(head);

      // Golden Keris / Sword
      const bladeGeo = new THREE.BoxGeometry(0.12, 1.3, 0.25);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.2
      });
      swordMesh = new THREE.Mesh(bladeGeo, bladeMat);
      swordMesh.position.set(0.7, 1.5, 0.3);
      swordMesh.rotation.z = -0.4;
      swordMesh.castShadow = true;
      heroGroup.add(swordMesh);

      // Cape
      const capeGeo = new THREE.PlaneGeometry(0.9, 1.2);
      const capeMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, side: THREE.DoubleSide });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, 1.2, -0.45);
      heroGroup.add(cape);

      // Aura light
      const auraLight = new THREE.PointLight(0xffd700, 1.5, 6);
      auraLight.position.set(0, 1.5, 0);
      heroGroup.add(auraLight);

      heroGroup.position.set(-6, 0, 4);
      heroGroup.rotation.y = 0.5;
      scene.add(heroGroup);
    };

    const spawnTowerWave = () => {
      // Clear old towers
      towers.forEach(t => scene.remove(t.group));
      towers = [];

      const towerCount = Math.min(3 + stage.value, 5);
      const towerTypes = [
        { name: 'Menara Pos Depan', hpMult: 1, color: 0x64748b, scale: 1 },
        { name: 'Benteng Pengawal', hpMult: 1.6, color: 0x475569, scale: 1.2 },
        { name: 'Menara Benteng Utama', hpMult: 2.5, color: 0x334155, scale: 1.5 }
      ];

      for (let i = 0; i < towerCount; i++) {
        const type = towerTypes[Math.min(i, towerTypes.length - 1)];
        const group = new THREE.Group();

        // Tower Base & Pillars
        const baseHeight = 5 * type.scale;
        const baseGeo = new THREE.CylinderGeometry(1.4 * type.scale, 1.8 * type.scale, baseHeight, 8);
        const baseMat = new THREE.MeshStandardMaterial({
          color: type.color,
          roughness: 0.8
        });
        const towerBase = new THREE.Mesh(baseGeo, baseMat);
        towerBase.position.y = baseHeight / 2;
        towerBase.castShadow = true;
        towerBase.receiveShadow = true;
        group.add(towerBase);

        // Tower Roof Cone
        const roofGeo = new THREE.ConeGeometry(2 * type.scale, 2.2 * type.scale, 8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b }); // Red roof
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = baseHeight + 1.1 * type.scale;
        roof.castShadow = true;
        group.add(roof);

        // Flag
        const flagPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6);
        const flagPoleMat = new THREE.MeshBasicMaterial({ color: 0xd4d4d8 });
        const flagPole = new THREE.Mesh(flagPoleGeo, flagPoleMat);
        flagPole.position.y = baseHeight + 2.5 * type.scale;
        group.add(flagPole);

        const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
        const flagMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0.4, baseHeight + 2.5 * type.scale, 0);
        group.add(flag);

        // Position towers along the defense line
        const posX = 4 + (i * 5.2);
        const posZ = -3 + (i % 2 === 0 ? 3 : -2);
        group.position.set(posX, 0, posZ);

        scene.add(group);

        const maxHp = Math.floor(120 * type.hpMult * Math.pow(1.35, stage.value - 1));
        towers.push({
          group,
          name: type.name,
          hp: maxHp,
          maxHp: maxHp,
          x: posX,
          z: posZ,
          rewardGold: 30 * stage.value * (i + 1),
          height: baseHeight
        });
      }
    };

    const heroAttack = () => {
      if (!isPlaying.value || isPaused.value || towers.length === 0) return;

      // Find first live tower to attack
      const targetTower = towers[0];
      if (!targetTower) return;

      // Sword slash animation
      if (swordMesh) {
        swordMesh.rotation.x = -1.2;
        setTimeout(() => {
          if (swordMesh) swordMesh.rotation.x = 0;
        }, 120);
      }

      // Shoot Golden Energy Blade projectile
      const projGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const projMat = new THREE.MeshStandardMaterial({
        color: 0xffe066,
        emissive: 0xffa500,
        emissiveIntensity: 1
      });
      const proj = new THREE.Mesh(projGeo, projMat);
      proj.position.copy(heroGroup.position).add(new THREE.Vector3(1, 1.5, 0));
      scene.add(proj);

      const targetPos = targetTower.group.position.clone().add(new THREE.Vector3(0, targetTower.height / 2, 0));
      const dir = targetPos.clone().sub(proj.position).normalize();

      const mult = auraActive.value ? 2 : 1;
      const isCrit = Math.random() < 0.25;
      const dmg = Math.floor(baseDamage.value * mult * (isCrit ? 2.2 : 1));

      projectiles.push({
        mesh: proj,
        targetTower,
        dir,
        speed: 0.9,
        dmg,
        isCrit
      });

      playSound('laser');
    };

    const useSkill1 = () => {
      // Tusukan Keris Emas (Mega Single Damage)
      if (skill1Cd.value > 0 || towers.length === 0) return;
      skill1Cd.value = 8;
      const timer = setInterval(() => {
        skill1Cd.value--;
        if (skill1Cd.value <= 0) clearInterval(timer);
      }, 1000);

      playSound('powerup');
      const target = towers[0];
      if (target) {
        // Massive golden beam
        createBurst(target.group.position, 0xffd700, 35);
        target.hp -= baseDamage.value * 4;
        checkTowerHp(target);
      }
    };

    const useSkill2 = () => {
      // Hujan Panah (AoE to all towers)
      if (skill2Cd.value > 0 || towers.length === 0) return;
      skill2Cd.value = 14;
      const timer = setInterval(() => {
        skill2Cd.value--;
        if (skill2Cd.value <= 0) clearInterval(timer);
      }, 1000);

      playSound('hit');
      towers.forEach(t => {
        createBurst(t.group.position.clone().add(new THREE.Vector3(0, t.height, 0)), 0x38bdf8, 20);
        t.hp -= Math.floor(baseDamage.value * 2.5);
      });

      for (let i = towers.length - 1; i >= 0; i--) {
        checkTowerHp(towers[i]);
      }
    };

    const useSkill3 = () => {
      // Aura Emas Mas (2x ATK for 6s)
      if (skill3Cd.value > 0) return;
      skill3Cd.value = 18;
      auraActive.value = true;
      playSound('powerup');

      setTimeout(() => {
        auraActive.value = false;
      }, 6000);

      const timer = setInterval(() => {
        skill3Cd.value--;
        if (skill3Cd.value <= 0) clearInterval(timer);
      }, 1000);
    };

    const checkTowerHp = (t) => {
      if (t.hp <= 0) {
        // Tower destroyed!
        createBurst(t.group.position, 0xef4444, 40);
        scene.remove(t.group);
        const idx = towers.indexOf(t);
        if (idx !== -1) towers.splice(idx, 1);

        gold.value += t.rewardGold;
        towersDestroyed.value++;
        playSound('score');

        // Check if wave cleared
        if (towers.length === 0) {
          stage.value++;
          gold.value += stage.value * 100;
          playSound('powerup');
          setTimeout(() => {
            spawnTowerWave();
          }, 800);
        }
      }
    };

    const createBurst = (pos, color = 0xffaa00, count = 20) => {
      for (let i = 0; i < count; i++) {
        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos).add(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        ));
        scene.add(p);

        particles.push({
          mesh: p,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.4 + 0.1,
            (Math.random() - 0.5) * 0.5
          ),
          life: 30
        });
      }
    };

    const onCanvasClick = () => {
      heroAttack();
    };

    const initThree = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth;
      const height = 520;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a); // Midnight sky
      scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
      camera.position.set(-3, 10, 22);
      camera.lookAt(8, 2, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      canvasContainer.value.innerHTML = '';
      canvasContainer.value.appendChild(renderer.domElement);

      // Ground (Battlefield Terrain)
      const groundGeo = new THREE.PlaneGeometry(100, 60);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.9
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Stone Path
      const pathGeo = new THREE.PlaneGeometry(12, 50);
      const pathMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.rotation.z = Math.PI / 2;
      path.position.set(10, 0.02, 0);
      scene.add(path);

      // Lights
      const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
      scene.add(ambLight);

      const moonLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
      moonLight.position.set(-15, 30, 20);
      moonLight.castShadow = true;
      scene.add(moonLight);

      createHeroMas();
      spawnTowerWave();

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleResize);
    };

    const handleKeyDown = (e) => {
      if (!isPlaying.value || isPaused.value) return;
      if (e.code === 'Space') {
        e.preventDefault();
        heroAttack();
      }
      if (e.code === 'Digit1') useSkill1();
      if (e.code === 'Digit2') useSkill2();
      if (e.code === 'Digit3') useSkill3();
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

      // Idle hero breathing animation
      if (heroGroup) {
        heroGroup.position.y = Math.sin(Date.now() * 0.005) * 0.08;
      }

      // Update projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.add(p.dir.clone().multiplyScalar(p.speed));

        const targetPos = p.targetTower.group.position.clone().add(new THREE.Vector3(0, p.targetTower.height / 2, 0));
        if (p.mesh.position.distanceTo(targetPos) < 1.8) {
          // Hit tower!
          createBurst(targetPos, p.isCrit ? 0xff0000 : 0xffbb00, p.isCrit ? 22 : 12);
          playSound('hit');
          p.targetTower.hp -= p.dmg;
          checkTowerHp(p.targetTower);

          scene.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.mesh.position.add(pt.vel);
        pt.vel.y -= 0.02;
        pt.life--;
        if (pt.life <= 0) {
          scene.remove(pt.mesh);
          particles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    const startGame = () => {
      stage.value = 1;
      gold.value = 0;
      towersDestroyed.value = 0;
      atkLevel.value = 1;
      baseDamage.value = 25;
      atkUpgradeCost.value = 50;
      isPlaying.value = true;
      isPaused.value = false;
      isGameOver.value = false;
      skill1Cd.value = 0;
      skill2Cd.value = 0;
      skill3Cd.value = 0;
      auraActive.value = false;

      spawnTowerWave();
      playSound('powerup');
      animate();
    };

    const resetGame = () => {
      cancelAnimationFrame(animationFrameId);
      projectiles.forEach(p => scene.remove(p.mesh));
      projectiles = [];
      particles.forEach(pt => scene.remove(pt.mesh));
      particles = [];
      isPlaying.value = false;
      isPaused.value = false;
      isGameOver.value = false;
      stage.value = 1;
      gold.value = 0;
      towersDestroyed.value = 0;
      spawnTowerWave();
      renderer.render(scene, camera);
    };

    onMounted(() => {
      initThree();
    });

    onUnmounted(() => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
      }
    });

    return {
      canvasContainer,
      stage,
      gold,
      towersDestroyed,
      atkLevel,
      atkUpgradeCost,
      skill1Cd,
      skill2Cd,
      skill3Cd,
      auraActive,
      isPlaying,
      isPaused,
      isGameOver,
      muted,
      toggleSound,
      togglePause,
      upgradeAtk,
      heroAttack,
      useSkill1,
      useSkill2,
      useSkill3,
      onCanvasClick,
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
