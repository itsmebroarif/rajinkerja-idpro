<template>
  <div class="container-fluid py-4" data-aos="fade-up">
    <!-- Top Nav / Back Banner -->
    <div class="card border-0 rounded-4 shadow-sm bg-white p-4 mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-outline-secondary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2" @click="goBack">
            <i class="bi bi-arrow-left fs-5"></i>
            <span>Kembali</span>
          </button>
          <div class="border-start ps-3">
            <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span class="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill">
                <i class="bi bi-palette-fill me-1"></i> Studio Kustomisasi Bingkai
              </span>
              <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill">
                Halaman Penuh (Full-Page)
              </span>
            </div>
            <h2 class="fw-extrabold text-dark mb-0">🖼️ Kustomisasi Bingkai 3D & Motivasi Kerja</h2>
          </div>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <button class="btn btn-outline-danger rounded-3 px-3 py-2 fw-semibold" @click="resetToDefault">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Default
          </button>
          <button class="btn btn-primary rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm" @click="saveChanges">
            <i class="bi bi-check2-circle fs-5"></i>
            <span>Simpan & Terapkan Bingkai</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Studio Layout: 3D Stage on Left, Customizer Options on Right -->
    <div class="row g-4">
      <!-- Left Column: Interactive 3D Frame Preview -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 position-sticky" style="top: 20px;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <span>Pratinjau Langsung 3D</span>
              <span class="badge bg-success-subtle text-success small rounded-pill px-2.5 py-0.5">Real-Time</span>
            </h5>
            <span class="small text-muted font-monospace"><i class="bi bi-arrows-move me-1"></i> Putar & geser kursor</span>
          </div>

          <!-- 3D Canvas Stage -->
          <div 
            class="stage-container rounded-4 border position-relative overflow-hidden mb-3"
            ref="stageRef"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div ref="canvasContainerRef" class="w-100 h-100" style="min-height: 420px;"></div>

            <!-- Top Overlays -->
            <div class="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between pointer-events-none">
              <span class="badge bg-white bg-opacity-90 text-dark border shadow-xs px-2.5 py-1 rounded-pill small fw-bold">
                {{ currentFrameStyleLabel }} | {{ currentLightingModeLabel }}
              </span>
              <button 
                class="btn btn-sm btn-white bg-white shadow-xs rounded-circle p-2 text-secondary pointer-events-auto"
                @click="resetCamera"
                title="Reset Posisi Kamera"
              >
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>

            <!-- Plaque Preview -->
            <div class="position-absolute bottom-0 start-0 w-100 p-3 pointer-events-none">
              <div class="bg-white bg-opacity-95 p-2.5 rounded-3 border shadow-sm pointer-events-auto">
                <span class="fw-bold text-dark small d-block">{{ form.title || 'Tujuan Utama Bekerja' }}</span>
                <p class="text-secondary small mb-0 fst-italic" style="font-size: 11px;">"{{ form.quote || 'Semangat bekerja!' }}"</p>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Bar of Photos -->
          <div class="p-3 bg-light rounded-3 border">
            <span class="small fw-bold text-dark d-block mb-2">Pilih Foto Aktif yang Ingin Dikustomisasi:</span>
            <div class="d-flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <div 
                v-for="(photo, idx) in photosList" 
                :key="photo.id"
                class="photo-thumb rounded-3 border cursor-pointer position-relative flex-shrink-0 overflow-hidden"
                :class="{ 'ring-active border-primary': activeIndex === idx }"
                style="width: 70px; height: 50px;"
                @click="selectActivePhoto(idx)"
              >
                <img :src="photo.src" alt="Thumbnail" class="w-100 h-100 object-fit-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings, Styles & Controls -->
      <div class="col-lg-6">
        <!-- Section 1: Frame Material & Style -->
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-palette text-primary fs-4"></i>
            <span>1. Pilihan Gaya & Material Bingkai 3D</span>
          </h5>

          <div class="row g-2 mb-3">
            <div v-for="style in frameStyles" :key="style.id" class="col-6 col-sm-4">
              <div 
                class="p-3 rounded-3 border cursor-pointer style-card h-100 transition-all"
                :class="{ 'selected-option border-primary bg-primary-subtle': form.frameStyle === style.id }"
                @click="setFrameStyle(style.id)"
              >
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="color-preview-circle shadow-xs" :style="{ background: style.previewColor }"></span>
                  <span class="small fw-bold text-dark">{{ style.name }}</span>
                </div>
                <small class="text-muted d-block" style="font-size: 11px;">{{ style.desc }}</small>
              </div>
            </div>
          </div>

          <!-- Orientation Mode -->
          <div class="pt-3 border-top">
            <label class="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
              <i class="bi bi-aspect-ratio text-success"></i> Bentuk Bingkai (Orientasi):
            </label>
            <div class="btn-group w-100" role="group">
              <button 
                type="button" 
                class="btn btn-sm py-2"
                :class="form.orientation === 'landscape' ? 'btn-primary fw-bold' : 'btn-outline-secondary'"
                @click="setOrientation('landscape')"
              >
                <i class="bi bi-layout-sidebar-inset-reverse me-1"></i> Landscape (Mendatar)
              </button>
              <button 
                type="button" 
                class="btn btn-sm py-2"
                :class="form.orientation === 'portrait' ? 'btn-primary fw-bold' : 'btn-outline-secondary'"
                @click="setOrientation('portrait')"
              >
                <i class="bi bi-layout-sidebar-inset me-1"></i> Portrait (Tegak)
              </button>
              <button 
                type="button" 
                class="btn btn-sm py-2"
                :class="form.orientation === 'square' ? 'btn-primary fw-bold' : 'btn-outline-secondary'"
                @click="setOrientation('square')"
              >
                <i class="bi bi-square me-1"></i> Persegi (1:1)
              </button>
            </div>
          </div>
        </div>

        <!-- Section 2: Studio Lighting & Atmosphere -->
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-sun text-warning fs-4"></i>
            <span>2. Pencahayaan Studio (Lighting Preset)</span>
          </h5>

          <div class="row g-2">
            <div v-for="light in lightingModes" :key="light.id" class="col-sm-6">
              <div 
                class="p-3 rounded-3 border cursor-pointer style-card h-100 transition-all d-flex align-items-center justify-content-between"
                :class="{ 'selected-option border-warning bg-warning-subtle': form.lightingMode === light.id }"
                @click="setLightingMode(light.id)"
              >
                <div class="d-flex align-items-center gap-2.5">
                  <span class="fs-4">{{ light.icon }}</span>
                  <div>
                    <span class="small fw-bold text-dark d-block">{{ light.name }}</span>
                    <span class="text-muted" style="font-size: 11px;">{{ light.desc }}</span>
                  </div>
                </div>
                <i v-if="form.lightingMode === light.id" class="bi bi-check-circle-fill text-warning fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Motivation Text & Dedication Plaque -->
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-pencil-square text-info fs-4"></i>
            <span>3. Kata-Kata Motivasi & Target Bekerja</span>
          </h5>

          <div class="mb-3">
            <label class="form-label fw-bold text-dark small mb-1">
              🎯 Judul Motivasi / Untuk Siapa Kamu Bekerja:
            </label>
            <input 
              type="text" 
              class="form-control rounded-3"
              v-model="form.title"
              placeholder="Misal: Untuk Senyuman Ibu & Masa Depan Keluarga ❤️"
            />
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold text-dark small mb-1">
              ✍️ Pesan Pengingat Saat Lelah (Quote Dedikasi):
            </label>
            <textarea 
              class="form-control rounded-3" 
              rows="3"
              v-model="form.quote"
              placeholder="Tuliskan kata-kata yang membakar semangatmu ketika sedang burnout..."
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold text-dark small mb-1">
              🚀 Target Finansial / Impian Terdekat:
            </label>
            <input 
              type="text" 
              class="form-control rounded-3"
              v-model="form.targetGoal"
              placeholder="Misal: Beli Rumah Impian 2026 / Naik Umroh Bareng Ortu 🕋"
            />
          </div>
        </div>

        <!-- Section 4: Foto Manajemen & Presets -->
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-camera-fill text-danger fs-4"></i>
            <span>4. Ganti Foto / Unggah Foto Baru</span>
          </h5>

          <div class="p-3 bg-light rounded-3 border mb-3">
            <div class="d-flex flex-column flex-sm-row gap-2">
              <button class="btn btn-primary rounded-3 px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" @click="triggerFileInput">
                <i class="bi bi-cloud-arrow-up-fill"></i>
                <span>Upload Foto dari Komputer</span>
              </button>
              <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileUpload" />

              <button 
                v-if="photosList.length > 1"
                class="btn btn-outline-danger rounded-3 px-3 py-2 fw-semibold"
                @click="deleteCurrentPhoto"
              >
                <i class="bi bi-trash me-1"></i> Hapus Foto Ini
              </button>
            </div>
            <small class="text-muted mt-2 d-block">Format: JPG, PNG, WEBP, GIF. Foto akan otomatis dioptimasi.</small>
          </div>

          <!-- Presets Gallery -->
          <label class="form-label fw-bold text-dark small mb-2">Atau Pilih dari Preset Inspirasi Populer:</label>
          <div class="row g-2">
            <div v-for="preset in presetsList" :key="preset.id" class="col-6 col-sm-3">
              <div 
                class="preset-item rounded-3 border overflow-hidden cursor-pointer position-relative ratio ratio-4x3 hover-scale"
                @click="applyPreset(preset)"
              >
                <img :src="preset.src" :alt="preset.title" class="object-fit-cover" />
                <div class="preset-overlay position-absolute bottom-0 start-0 w-100 p-1.5 bg-dark bg-opacity-75 text-white small text-center text-truncate">
                  {{ preset.shortName }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Save Bar -->
        <div class="d-flex justify-content-between align-items-center pt-3">
          <button class="btn btn-outline-secondary rounded-3 px-4 py-2.5 fw-bold" @click="goBack">
            Batal
          </button>
          <button class="btn btn-success rounded-3 px-5 py-2.5 fw-extrabold shadow" @click="saveChanges">
            <i class="bi bi-check2-all me-1"></i> Simpan Semua Perubahan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';

const STORAGE_KEY = 'rk_3d_motivational_booster';

const DEFAULT_PHOTOS = [
  {
    id: 'family-dream',
    shortName: 'Keluarga Bahagia',
    title: 'Untuk Senyuman Keluarga Tercinta ❤️',
    quote: 'Setiap baris kode, setiap tetes keringat hari ini, adalah untuk kebahagiaan mereka di masa depan.',
    targetGoal: 'Target: Membahagiakan Keluarga & Rumah Impian 🏠',
    orientation: 'landscape',
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'dream-home',
    shortName: 'Rumah Impian',
    title: 'Wujudkan Hunian Nyaman & Masa Depan 🏡',
    quote: 'Kerja keras tak pernah mengkhianati hasil. Terus fokus dan jangan menyerah!',
    targetGoal: 'Target: DP Rumah Impian 2026',
    orientation: 'landscape',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'graduation-career',
    shortName: 'Target Karir & Wisuda',
    title: 'Mencapai Puncak Karir & Prestasi Tertinggi 🎓',
    quote: 'Disiplin hari ini adalah kunci kebebasan finansial esok hari.',
    targetGoal: 'Target: Lead Developer & Sertifikasi Internasional',
    orientation: 'portrait',
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80'
  }
];

const PRESETS = [
  {
    id: 'preset-family',
    shortName: 'Keluarga',
    title: 'Untuk Kebahagiaan Keluarga ❤️',
    quote: 'Mereka adalah alasan terbesarku untuk terus bangkit setiap hari.',
    targetGoal: 'Target: Masa Depan Anak & Keluarga',
    orientation: 'landscape',
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-home',
    shortName: 'Rumah Idaman',
    title: 'Rumah Impian Masa Depan 🏠',
    quote: 'Bangun istana masa depan dengan kerja cerdas dan tabungan konsisten.',
    targetGoal: 'Target: Hunian Idaman 2026',
    orientation: 'landscape',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-car',
    shortName: 'Mobil Impian',
    title: 'Mobil & Liburan Bersama 🚗',
    quote: 'Nikmati setiap proses perjuangan sampai impian menjadi kenyataan.',
    targetGoal: 'Target: Kendaraan Impian',
    orientation: 'landscape',
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-umroh',
    shortName: 'Tanah Suci / Umroh',
    title: 'Ziarah & Umroh Bersama Orang Tua 🕋',
    quote: 'Niat suci yang tulus akan selalu dimudahkan jalannya oleh Yang Maha Kuasa.',
    targetGoal: 'Target: Berangkatkan Orang Tua ke Tanah Suci',
    orientation: 'portrait',
    src: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&auto=format&fit=crop&q=80'
  }
];

export default {
  name: 'MotivationFrameSettingsView',
  setup() {
    const router = useRouter();
    const stageRef = ref(null);
    const canvasContainerRef = ref(null);
    const fileInput = ref(null);

    const photosList = ref([...DEFAULT_PHOTOS]);
    const activeIndex = ref(0);
    const presetsList = ref(PRESETS);

    const form = ref({
      frameStyle: 'gold',
      lightingMode: 'daylight',
      orientation: 'landscape',
      title: '',
      quote: '',
      targetGoal: ''
    });

    const frameStyles = [
      { id: 'gold', name: 'Emas Mewah', desc: 'Metallic gold dengan kilau hangat', previewColor: '#eab308' },
      { id: 'wood', name: 'Kayu Oak', desc: 'Tekstur kayu cokelat hangat alami', previewColor: '#854d0e' },
      { id: 'black', name: 'Hitam Modern', desc: 'Minimalis matte gelap elegan', previewColor: '#1e293b' },
      { id: 'rose', name: 'Rose Gold', desc: 'Tembaga manis berkilau lembut', previewColor: '#f43f5e' },
      { id: 'silver', name: 'Silver Titanium', desc: 'Logam perak futuristik mengkilap', previewColor: '#94a3b8' },
      { id: 'white', name: 'Putih Minimalis', desc: 'Kesan bersih studio Scandinavian', previewColor: '#f8fafc' }
    ];

    const lightingModes = [
      { id: 'daylight', name: 'Studio Terang', desc: 'Cahaya netral jernih & foto jelas terlihat', icon: '☀️' },
      { id: 'golden', name: 'Golden Hour', desc: 'Nuansa senja hangat penuh kehangatan', icon: '🌅' },
      { id: 'cyber', name: 'Cyber Neon', desc: 'Aura futuristik dengan aksen biru & ungu', icon: '✨' },
      { id: 'soft', name: 'Lembut & Teduh', desc: 'Pencahayaan difus nyaman di mata', icon: '☁️' }
    ];

    const currentFrameStyleLabel = computed(() => {
      const f = frameStyles.find(s => s.id === form.value.frameStyle);
      return f ? f.name : 'Bingkai 3D';
    });

    const currentLightingModeLabel = computed(() => {
      const l = lightingModes.find(s => s.id === form.value.lightingMode);
      return l ? l.name : 'Studio Terang';
    });

    // Three.js State
    let scene, camera, renderer, animationFrameId;
    let frameGroup, outerFrameMesh, innerMatMesh, photoMesh, glassMesh, standMesh;
    let mainLight, ambientLight, fillLight;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let currentRotation = { x: 0.05, y: -0.15 };

    const loadSavedData = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.photos) && parsed.photos.length > 0) {
            photosList.value = parsed.photos;
          }
          if (parsed.frameStyle) form.value.frameStyle = parsed.frameStyle;
          if (parsed.lightingMode) form.value.lightingMode = parsed.lightingMode;
          if (typeof parsed.activeIndex === 'number' && parsed.activeIndex < photosList.value.length) {
            activeIndex.value = parsed.activeIndex;
          }
        }
      } catch (e) {
        console.error('Error loading booster data', e);
      }
      syncActivePhotoForm();
    };

    const syncActivePhotoForm = () => {
      const current = photosList.value[activeIndex.value] || photosList.value[0];
      if (current) {
        form.value.title = current.title || '';
        form.value.quote = current.quote || '';
        form.value.targetGoal = current.targetGoal || '';
        form.value.orientation = current.orientation || 'landscape';
      }
    };

    const selectActivePhoto = (idx) => {
      // Save current form into active photo first
      saveFormToActivePhoto();
      activeIndex.value = idx;
      syncActivePhotoForm();
      update3DTexture();
      buildFrame3D();
    };

    const saveFormToActivePhoto = () => {
      const current = photosList.value[activeIndex.value];
      if (current) {
        current.title = form.value.title;
        current.quote = form.value.quote;
        current.targetGoal = form.value.targetGoal;
        current.orientation = form.value.orientation;
      }
    };

    // Three.js Construction
    const initThreeScene = () => {
      if (!canvasContainerRef.value) return;

      const width = canvasContainerRef.value.clientWidth || 500;
      const height = canvasContainerRef.value.clientHeight || 420;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.8);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      canvasContainerRef.value.innerHTML = '';
      canvasContainerRef.value.appendChild(renderer.domElement);

      // Lighting
      ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
      mainLight.position.set(5, 8, 7);
      mainLight.castShadow = true;
      scene.add(mainLight);

      fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
      fillLight.position.set(-5, -2, 4);
      scene.add(fillLight);

      // Frame Group
      frameGroup = new THREE.Group();
      frameGroup.rotation.x = currentRotation.x;
      frameGroup.rotation.y = currentRotation.y;
      scene.add(frameGroup);

      buildFrame3D();
      applyLightingMode(form.value.lightingMode);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();
    };

    const getFrameDimensions = (orientation) => {
      if (orientation === 'portrait') {
        return { frameW: 3.6, frameH: 4.6, matW: 3.0, matH: 4.0, photoW: 2.8, photoH: 3.8, depth: 0.25 };
      } else if (orientation === 'square') {
        return { frameW: 4.0, frameH: 4.0, matW: 3.4, matH: 3.4, photoW: 3.2, photoH: 3.2, depth: 0.25 };
      }
      return { frameW: 5.0, frameH: 3.5, matW: 4.4, matH: 2.9, photoW: 4.2, photoH: 2.7, depth: 0.25 };
    };

    const getFrameMaterial = (styleId) => {
      switch (styleId) {
        case 'wood':
          return new THREE.MeshStandardMaterial({ color: 0x6e3d16, roughness: 0.65, metalness: 0.1 });
        case 'black':
          return new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.3 });
        case 'rose':
          return new THREE.MeshStandardMaterial({ color: 0xdf8a8a, roughness: 0.3, metalness: 0.7 });
        case 'silver':
          return new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.85 });
        case 'white':
          return new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.4, metalness: 0.05 });
        case 'gold':
        default:
          return new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.8 });
      }
    };

    const buildFrame3D = () => {
      if (!frameGroup) return;

      while (frameGroup.children.length > 0) {
        frameGroup.remove(frameGroup.children[0]);
      }

      const orientation = form.value.orientation || 'landscape';
      const dims = getFrameDimensions(orientation);

      // Outer Frame
      const frameGeo = new THREE.BoxGeometry(dims.frameW, dims.frameH, dims.depth);
      const frameMat = getFrameMaterial(form.value.frameStyle);
      outerFrameMesh = new THREE.Mesh(frameGeo, frameMat);
      outerFrameMesh.castShadow = true;
      frameGroup.add(outerFrameMesh);

      // Inner Mat
      const matGeo = new THREE.PlaneGeometry(dims.matW, dims.matH);
      const matMat = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.8 });
      innerMatMesh = new THREE.Mesh(matGeo, matMat);
      innerMatMesh.position.z = dims.depth / 2 + 0.005;
      frameGroup.add(innerMatMesh);

      // Photo Mesh
      const photoGeo = new THREE.PlaneGeometry(dims.photoW, dims.photoH);
      const photoMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.05
      });

      photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = dims.depth / 2 + 0.01;
      frameGroup.add(photoMesh);

      // Glass Cover
      const glassGeo = new THREE.PlaneGeometry(dims.matW, dims.matH);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9
      });
      glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.z = dims.depth / 2 + 0.02;
      frameGroup.add(glassMesh);

      // Base Stand
      const standGeo = new THREE.BoxGeometry(dims.frameW * 0.7, 0.12, 0.8);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      standMesh = new THREE.Mesh(standGeo, standMat);
      standMesh.position.set(0, -dims.frameH / 2 - 0.08, -0.2);
      frameGroup.add(standMesh);

      update3DTexture();
    };

    const update3DTexture = () => {
      const cur = photosList.value[activeIndex.value];
      if (!cur || !photoMesh) return;

      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      loader.load(cur.src, (texture) => {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        if (photoMesh && photoMesh.material) {
          photoMesh.material.map = texture;
          photoMesh.material.needsUpdate = true;
        }
      });
    };

    const applyLightingMode = (mode) => {
      if (!ambientLight || !mainLight || !fillLight) return;
      if (mode === 'golden') {
        ambientLight.color.setHex(0xffedd5);
        mainLight.color.setHex(0xfbbf24);
        mainLight.intensity = 1.6;
        fillLight.color.setHex(0xf97316);
      } else if (mode === 'cyber') {
        ambientLight.color.setHex(0xe0e7ff);
        mainLight.color.setHex(0x38bdf8);
        mainLight.intensity = 1.7;
        fillLight.color.setHex(0xa855f7);
      } else if (mode === 'soft') {
        ambientLight.color.setHex(0xf1f5f9);
        mainLight.color.setHex(0xffffff);
        mainLight.intensity = 1.1;
        fillLight.color.setHex(0x94a3b8);
      } else {
        // Daylight
        ambientLight.color.setHex(0xffffff);
        mainLight.color.setHex(0xffffff);
        mainLight.intensity = 1.5;
        fillLight.color.setHex(0xdbeafe);
      }
    };

    // Actions
    const setFrameStyle = (styleId) => {
      form.value.frameStyle = styleId;
      buildFrame3D();
    };

    const setLightingMode = (modeId) => {
      form.value.lightingMode = modeId;
      applyLightingMode(modeId);
    };

    const setOrientation = (orient) => {
      form.value.orientation = orient;
      buildFrame3D();
    };

    const resetCamera = () => {
      currentRotation.x = 0.05;
      currentRotation.y = -0.15;
      if (frameGroup) {
        frameGroup.rotation.x = currentRotation.x;
        frameGroup.rotation.y = currentRotation.y;
      }
    };

    // Mouse & Touch Controls
    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging || !frameGroup) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      currentRotation.y += deltaX * 0.008;
      currentRotation.x += deltaY * 0.008;
      frameGroup.rotation.x = currentRotation.x;
      frameGroup.rotation.y = currentRotation.y;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || !frameGroup || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      currentRotation.y += deltaX * 0.008;
      currentRotation.x += deltaY * 0.008;
      frameGroup.rotation.x = currentRotation.x;
      frameGroup.rotation.y = currentRotation.y;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    // File Upload & Presets
    const triggerFileInput = () => {
      if (fileInput.value) fileInput.value.click();
    };

    const handleFileUpload = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawSrc = ev.target.result;
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          const aspect = w / h;

          let detectedOrient = 'landscape';
          if (aspect < 0.88) detectedOrient = 'portrait';
          else if (aspect >= 0.88 && aspect <= 1.15) detectedOrient = 'square';

          const newPhoto = {
            id: 'custom-' + Date.now(),
            shortName: file.name.replace(/\.[^/.]+$/, ''),
            title: file.name.replace(/\.[^/.]+$/, ''),
            quote: 'Bekerja dengan dedikasi tinggi demi masa depan terbaik!',
            targetGoal: 'Target Prestasi & Keberhasilan',
            orientation: detectedOrient,
            src: rawSrc
          };

          photosList.value.unshift(newPhoto);
          activeIndex.value = 0;
          syncActivePhotoForm();
          buildFrame3D();
          window.alert(`Foto "${newPhoto.title}" berhasil diunggah!`);
        };
        img.src = rawSrc;
      };
      reader.readAsDataURL(file);
    };

    const applyPreset = (preset) => {
      const newPhoto = { ...preset, id: 'preset-' + Date.now() };
      photosList.value.unshift(newPhoto);
      activeIndex.value = 0;
      syncActivePhotoForm();
      buildFrame3D();
    };

    const deleteCurrentPhoto = () => {
      if (photosList.value.length <= 1) {
        window.alert('Harus tersisa minimal 1 foto dalam koleksi.');
        return;
      }
      if (window.confirm('Apakah Anda yakin ingin menghapus foto motivasi ini?')) {
        photosList.value.splice(activeIndex.value, 1);
        if (activeIndex.value >= photosList.value.length) {
          activeIndex.value = photosList.value.length - 1;
        }
        syncActivePhotoForm();
        buildFrame3D();
      }
    };

    const resetToDefault = () => {
      if (window.confirm('Reset seluruh kustomisasi bingkai ke pengaturan bawaan?')) {
        photosList.value = JSON.parse(JSON.stringify(DEFAULT_PHOTOS));
        activeIndex.value = 0;
        form.value.frameStyle = 'gold';
        form.value.lightingMode = 'daylight';
        syncActivePhotoForm();
        buildFrame3D();
        applyLightingMode('daylight');
      }
    };

    const saveChanges = () => {
      saveFormToActivePhoto();
      const payload = {
        photos: photosList.value,
        activeIndex: activeIndex.value,
        frameStyle: form.value.frameStyle,
        lightingMode: form.value.lightingMode,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.alert('Pengaturan bingkai 3D & motivasi kerja berhasil disimpan!');
      router.push('/home');
    };

    const goBack = () => {
      router.push('/home');
    };

    onMounted(() => {
      loadSavedData();
      initThreeScene();
    });

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    });

    return {
      stageRef,
      canvasContainerRef,
      fileInput,
      photosList,
      activeIndex,
      presetsList,
      form,
      frameStyles,
      lightingModes,
      currentFrameStyleLabel,
      currentLightingModeLabel,
      selectActivePhoto,
      setFrameStyle,
      setLightingMode,
      setOrientation,
      resetCamera,
      triggerFileInput,
      handleFileUpload,
      applyPreset,
      deleteCurrentPhoto,
      resetToDefault,
      saveChanges,
      goBack,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd
    };
  }
};
</script>

<style scoped>
.stage-container {
  background: radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%);
  cursor: grab;
}
.stage-container:active {
  cursor: grabbing;
}
.style-card {
  transition: all 0.2s ease;
}
.style-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
}
.selected-option {
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
}
.color-preview-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.15);
  display: inline-block;
}
.photo-thumb {
  transition: all 0.2s ease;
}
.photo-thumb:hover {
  transform: scale(1.05);
}
.ring-active {
  box-shadow: 0 0 0 3px #0284c7;
}
.hover-scale:hover img {
  transform: scale(1.08);
  transition: transform 0.3s ease;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
