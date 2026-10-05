<template>
  <div class="container-fluid p-0" data-aos="fade-up">

    <!-- ========================================== -->
    <!-- VIEW MODE 1: DEDICATED GAME ARENA PAGE (/games/:id) -->
    <!-- ========================================== -->
    <div v-if="activeGameId" class="game-arena-page">
      <!-- Header Navigation Bar -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-3 p-md-4 rounded-4 shadow-sm border">
        <div class="d-flex align-items-center gap-3">
          <router-link to="/games" class="btn btn-outline-dark rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
            <i class="bi bi-arrow-left-circle-fill fs-5 text-primary"></i> Hub Game
          </router-link>
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-danger text-white fw-bold px-2.5 py-1 rounded-pill">🎮 3D Three.js Game</span>
              <span class="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill">{{ currentGameMeta.category }}</span>
            </div>
            <h3 class="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
              <span>{{ currentGameMeta.icon }}</span> {{ currentGameMeta.title }}
            </h3>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary rounded-pill px-3 fw-semibold text-nowrap" @click="toggleFullscreen">
            <i class="bi bi-arrows-fullscreen me-1"></i> Layar Penuh
          </button>
        </div>
      </div>

      <!-- MAIN GAME STAGE CONTAINER -->
      <div class="row g-4 mb-4">
        <div class="col-lg-9 col-xl-9">
          <!-- Dynamic 3D Game Renderer Component -->
          <component :is="activeGameComponent" />

          <!-- GAME CONTROLS & INSTRUCTIONS GUIDE CARD -->
          <div class="card border-0 shadow-sm rounded-4 mt-4 bg-white">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                <i class="bi bi-controller text-primary fs-4"></i> Panduan Kontrol & Cara Bermain
              </h5>
              <p class="text-muted small mb-3">{{ currentGameMeta.description }}</p>

              <div class="row g-3">
                <div class="col-md-4">
                  <div class="p-3 rounded-3 bg-light border h-100">
                    <small class="fw-bold text-dark d-block mb-1"><i class="bi bi-keyboard text-danger me-1"></i> Keyboard</small>
                    <small class="text-muted">{{ currentGameMeta.controls.keyboard }}</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="p-3 rounded-3 bg-light border h-100">
                    <small class="fw-bold text-dark d-block mb-1"><i class="bi bi-mouse text-info me-1"></i> Mouse / Klik</small>
                    <small class="text-muted">{{ currentGameMeta.controls.mouse }}</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="p-3 rounded-3 bg-light border h-100">
                    <small class="fw-bold text-dark d-block mb-1"><i class="bi bi-phone text-success me-1"></i> HP / Layar Sentuh</small>
                    <small class="text-muted">{{ currentGameMeta.controls.touch }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR: RECOMMENDED OTHER GAMES -->
        <div class="col-lg-3 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-3">
            <h6 class="fw-bold text-dark mb-3 px-1"><i class="bi bi-grid-fill text-warning me-1"></i> Game Lainnya</h6>
            <div class="d-flex flex-column gap-2">
              <router-link
                v-for="g in otherGames"
                :key="g.id"
                :to="'/games/' + g.id"
                class="btn btn-light text-start p-2.5 rounded-3 border-0 d-flex align-items-center gap-2 hover-up transition-all"
              >
                <span class="fs-4">{{ g.icon }}</span>
                <div class="overflow-hidden">
                  <span class="fw-bold text-dark d-block text-truncate small">{{ g.title }}</span>
                  <small class="text-muted d-block" style="font-size: 0.72rem;">{{ g.category }}</small>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- ========================================== -->
    <!-- VIEW MODE 2: OVERVIEW GALLERY HUB (/games) -->
    <!-- ========================================== -->
    <div v-else class="game-gallery-hub">
      <!-- Header Banner -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-danger text-white fw-bold px-3 py-1.5 rounded-pill">🎮 3D Three.js Arcade</span>
            <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">TaskArts Anti-Stres</span>
          </div>
          <h2 class="fw-extrabold mb-1 text-dark">🕹️ 3D Game Hub & Arcade Gallery</h2>
          <p class="text-muted mb-0">Nikmati koleksi game 3D interaktif Three.js cepat & cantik untuk meregangkan otak saat istirahat kerja.</p>
        </div>

        <!-- Search Input -->
        <div class="d-flex align-items-center gap-2">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control bg-light border-start-0" v-model="searchQuery" placeholder="Cari game 3D..." />
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="d-flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hidden">
        <button
          v-for="cat in categories"
          :key="cat"
          class="btn rounded-pill px-3 py-1.5 fw-bold text-nowrap transition-all"
          :class="selectedCategory === cat ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Games Cards Grid -->
      <div class="row g-3 mb-4">
        <div v-for="game in filteredGames" :key="game.id" class="col-sm-6 col-md-4 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white hover-up transition-all">
            <div class="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="p-3 rounded-4 bg-light border d-inline-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                    <span class="fs-2">{{ game.icon }}</span>
                  </div>
                  <span class="badge bg-light text-dark border px-2.5 py-1 fw-bold small">{{ game.category }}</span>
                </div>
                <h5 class="fw-bold text-dark mb-1">{{ game.title }}</h5>
                <p class="small text-muted mb-3 lh-sm">{{ game.description }}</p>
              </div>

              <router-link :to="'/games/' + game.id" class="btn btn-primary rounded-pill w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-2">
                <i class="bi bi-play-circle-fill fs-5"></i> Mainkan Game
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import CyberRacer3D from '@/components/games/CyberRacer3D.vue';
import BrickBreaker3D from '@/components/games/BrickBreaker3D.vue';
import TowerBuilder3D from '@/components/games/TowerBuilder3D.vue';
import AimTrainer3D from '@/components/games/AimTrainer3D.vue';
import Snake3D from '@/components/games/Snake3D.vue';
import TicTacToe3D from '@/components/games/TicTacToe3D.vue';
import Pong3D from '@/components/games/Pong3D.vue';
import Memory3D from '@/components/games/Memory3D.vue';
import SpeedClicker from '@/components/games/SpeedClicker.vue';
import Tank3D from '@/components/games/Tank3D.vue';
import TowerAttack3D from '@/components/games/TowerAttack3D.vue';
import WarkopSimulator3D from '@/components/games/WarkopSimulator3D.vue';

export default {
  name: 'GamesView',
  components: {
    CyberRacer3D,
    BrickBreaker3D,
    TowerBuilder3D,
    AimTrainer3D,
    Snake3D,
    TicTacToe3D,
    Pong3D,
    Memory3D,
    SpeedClicker,
    Tank3D,
    TowerAttack3D,
    WarkopSimulator3D
  },
  setup() {
    const route = useRoute();
    const searchQuery = ref('');
    const selectedCategory = ref('Semua');

    const categories = ['Semua', '3D Arcade', 'Reflex', 'Strategy', 'Brain', 'Simulation'];

    const games = ref([
      {
        id: 'tank-3d',
        title: '3D Tank',
        icon: '🛡️',
        category: '3D Arcade',
        description: 'Kendalikan tank baja 3D dengan meriam balistik. Hancurkan menara radar dan bunker musuh!',
        controls: {
          keyboard: 'W/A/S/D atau Tombol Panah untuk gerak, Spasi untuk tembak, R isi peluru',
          mouse: 'Klik Kiri untuk menembak meriam tank',
          touch: 'D-pad arah di kiri bawah & tombol tembak di kanan'
        },
        component: Tank3D
      },
      {
        id: 'tower-attack',
        title: 'Petualang Mas (Tower Attack)',
        icon: '⚔️',
        category: 'Strategy',
        description: 'Serbu benteng dan menara kerajaan musuh bersama Sang Petualang Mas dengan Keris Emas & Panah Sakti!',
        controls: {
          keyboard: 'Spasi / Klik untuk serang, Tombol 1, 2, 3 untuk jurus sakti',
          mouse: 'Klik menara musuh untuk meluncurkan serangan pedang',
          touch: 'Ketuk layar / tombol jurus di bawah'
        },
        component: TowerAttack3D
      },
      {
        id: 'warkop-3d',
        title: 'Warkop Simulator 3D',
        icon: '☕',
        category: 'Simulation',
        description: 'Simulasi Abang Warkop Indonesia 3D! Buat Kopi Tubruk, Kopi Susu, Es Teh, Indomie & Gorengan renyah.',
        controls: {
          keyboard: 'Klik mouse pada bahan resep',
          mouse: 'Klik bahan-bahan pesanan lalu klik Sajikan Pesanan',
          touch: 'Sentuh bahan makanan & tombol sajikan'
        },
        component: WarkopSimulator3D
      },
      {
        id: 'cyber-racer',
        title: '3D Cyber Racer',
        icon: '🏎️',
        category: '3D Arcade',
        description: 'Kendalikan mobil neon 3D melintasi jalan tol futuristik. Hindari rintangan merah dan kumpulkan kristal!',
        controls: {
          keyboard: 'Panah ← / → atau Tombol A / D',
          mouse: 'Gunakan Tombol On-screen',
          touch: 'Sentuh Tombol Kiri / Kanan di bawah layar'
        },
        component: CyberRacer3D
      },
      {
        id: 'brick-breaker',
        title: '3D Brick Breaker',
        icon: '🧱',
        category: '3D Arcade',
        description: 'Pantulkan bola 3D dengan pemukul sleek untuk menghancurkan seluruh susunan bata neon!',
        controls: {
          keyboard: 'Gunakan kursor mouse untuk pergerakan halus',
          mouse: 'Geser mouse ke kiri/kanan',
          touch: 'Sentuh dan geser jari di area layar'
        },
        component: BrickBreaker3D
      },
      {
        id: 'tower-builder',
        title: '3D Tower Builder',
        icon: '🧩',
        category: 'Strategy',
        description: 'Tumpuk balok 3D tepat sejajar di atas menara. Potong bagian balok yang tidak sejajar!',
        controls: {
          keyboard: 'Tekan Tombol Spasi',
          mouse: 'Klik Kiri di mana saja',
          touch: 'Ketuk layar hp di mana saja'
        },
        component: TowerBuilder3D
      },
      {
        id: 'aim-trainer',
        title: '3D Aim Trainer Shooter',
        icon: '🎯',
        category: 'Reflex',
        description: 'Uji kecepatan refleks tembakan target 3D dalam waktu 30 detik!',
        controls: {
          keyboard: 'Kombinasi dengan klik mouse',
          mouse: 'Klik Kiri langsung pada bola target',
          touch: 'Ketuk bola target secara presisi'
        },
        component: AimTrainer3D
      },
      {
        id: 'snake-3d',
        title: '3D Snake Arena',
        icon: '🐍',
        category: '3D Arcade',
        description: 'Kendalikan ular voxel 3D mengelilingi platform dan makan apel neon merah.',
        controls: {
          keyboard: 'Panah ↑ ↓ ← → atau WASD',
          mouse: 'Gunakan D-Pad On-screen',
          touch: 'Ketuk Tombol D-Pad di kanan bawah'
        },
        component: Snake3D
      },
      {
        id: 'ttt-3d',
        title: '3D Tic-Tac-Toe vs AI',
        icon: '❌',
        category: 'Strategy',
        description: 'Mainkan tic-tac-toe 3D interaktif melawan kecerdasan buatan.',
        controls: {
          keyboard: 'Gunakan mouse untuk memilih petak',
          mouse: 'Klik petak papan 3D',
          touch: 'Ketuk petak papan 3D'
        },
        component: TicTacToe3D
      },
      {
        id: 'pong-3d',
        title: '3D Pong Table Tennis',
        icon: '🏓',
        category: '3D Arcade',
        description: 'Tenis meja retro 3D dengan efek pantulan bola dan AI lawan cerdas.',
        controls: {
          keyboard: 'Gunakan gerak kursor vertikal',
          mouse: 'Geser mouse ke atas/bawah',
          touch: 'Geser jari vertikal di layar'
        },
        component: Pong3D
      },
      {
        id: 'memory-3d',
        title: '3D Memory Card Flip',
        icon: '🧠',
        category: 'Brain',
        description: 'Putar kartu 3D dan temukan pasangan warna yang identik.',
        controls: {
          keyboard: 'Gunakan mouse untuk memilih kartu',
          mouse: 'Klik kartu untuk memutar 180 derajat',
          touch: 'Ketuk kartu untuk memutar'
        },
        component: Memory3D
      },
      {
        id: 'speed-clicker',
        title: 'Speed Clicker Blitz',
        icon: '⚡',
        category: 'Reflex',
        description: 'Uji Kecepatan klik jari tangan Anda dalam 10 detik!',
        controls: {
          keyboard: 'Klik mouse secepatnya',
          mouse: 'Klik tombol merah berulang kali',
          touch: 'Gunakan 2 jari bergantian di layar'
        },
        component: SpeedClicker
      }
    ]);

    const activeGameId = computed(() => route.params.id);

    const currentGameMeta = computed(() => {
      if (!activeGameId.value) return null;
      return games.value.find(g => g.id === activeGameId.value) || games.value[0];
    });

    const activeGameComponent = computed(() => {
      if (!currentGameMeta.value) return CyberRacer3D;
      return currentGameMeta.value.component;
    });

    const otherGames = computed(() => {
      if (!activeGameId.value) return games.value;
      return games.value.filter(g => g.id !== activeGameId.value);
    });

    const filteredGames = computed(() => {
      return games.value.filter(g => {
        const matchCategory = selectedCategory.value === 'Semua' || g.category === selectedCategory.value;
        const matchSearch = !searchQuery.value || g.title.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchCategory && matchSearch;
      });
    });

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    };

    return {
      searchQuery,
      selectedCategory,
      categories,
      games,
      activeGameId,
      currentGameMeta,
      activeGameComponent,
      otherGames,
      filteredGames,
      toggleFullscreen
    };
  }
};
</script>

<style scoped>
.hover-up:hover { transform: translateY(-4px); }
.scrollbar-hidden::-webkit-scrollbar { display: none; }
.scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
</style>
