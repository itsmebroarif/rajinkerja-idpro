<template>
  <div id="app" :class="['app-container', (themeMode === 'dark' || themeMode === 'oled') ? 'dark-theme dark-mode' : 'light-theme', themeMode === 'oled' ? 'oled-theme' : '', isPinkMode ? 'pink-mode' : 'blue-mode']" :style="{ '--primary-color': accentColor }">
    <!-- Global Toast Notifications -->
    <AppNotifications />

    <!-- Desktop Material Navigation Drawer -->
    <aside :class="['sidebar-nav', { collapsed: isCollapsed }]">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-brand p-3 d-flex align-items-center justify-content-between">
        <router-link to="/" class="text-decoration-none d-flex align-items-center gap-2.5 overflow-hidden" v-if="!isCollapsed">
          <div class="brand-icon-wrapper shadow-sm">
            <img src="/logo.svg" alt="TaskArts Logo" class="brand-logo-img" />
          </div>
          <div class="lh-1 text-truncate">
            <span class="fw-extrabold text-app fs-5 d-block brand-title" style="letter-spacing: -0.4px;">
              Task<span class="brand-accent" :style="{ color: accentColor }">Arts</span>
            </span>
            <div class="d-flex align-items-center gap-1.5 mt-1">
              <span class="brand-badge-kafeinarts">
                <i class="bi bi-stars me-1 text-warning"></i>By Kafeinarts
              </span>
            </div>
          </div>
        </router-link>

        <div v-else class="mx-auto">
          <router-link to="/" class="brand-icon-wrapper shadow-sm" title="TaskArts By Kafeinarts">
            <img src="/logo.svg" alt="TaskArts Logo" class="brand-logo-img" />
          </router-link>
        </div>

        <button class="btn btn-sm btn-sidebar-toggle text-sub p-1.5 rounded-circle border-0 icon-hover" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'">
          <i :class="isCollapsed ? 'bi bi-layout-sidebar-reverse fs-5' : 'bi bi-layout-sidebar fs-5'"></i>
        </button>
      </div>

      <!-- Quick Search Bar (When Expanded) -->
      <div v-if="!isCollapsed" class="sidebar-search-box px-3 py-2">
        <div class="search-input-group d-flex align-items-center rounded-pill px-2.5 py-1">
          <i class="bi bi-search text-muted me-2" style="font-size: 11px;"></i>
          <input 
            v-model="sidebarSearch" 
            type="text" 
            class="search-input flex-grow-1 border-0 bg-transparent shadow-none" 
            placeholder="Cari fitur / menu..." 
            style="font-size: 12px;"
          />
          <button v-if="sidebarSearch" @click="sidebarSearch = ''" class="btn btn-link text-muted p-0 ms-1 text-decoration-none" title="Bersihkan">
            <i class="bi bi-x-circle-fill" style="font-size: 12px;"></i>
          </button>
          <span v-else class="badge bg-light text-muted border px-1.5 py-0.5 rounded" style="font-size: 9px;">Ctrl+K</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-links p-2 flex-grow-1">
        <div v-if="filteredNavGroups.length === 0" class="text-center py-4 px-2 text-muted small">
          <i class="bi bi-search fs-4 d-block mb-1 opacity-50"></i>
          Tidak ada menu "{{ sidebarSearch }}"
        </div>

        <div v-for="(group, gIdx) in filteredNavGroups" :key="group.title || gIdx" class="sidebar-group-block mb-1">
          <!-- Section Header -->
          <div v-if="!isCollapsed" class="sidebar-section-header d-flex align-items-center justify-content-between">
            <span>{{ group.title }}</span>
            <span class="badge rounded-pill bg-light text-muted border px-1.5 py-0.5" style="font-size: 9px;">{{ group.items.length }}</span>
          </div>
          <div v-else-if="gIdx > 0" class="sidebar-divider my-1.5"></div>

          <!-- Items in Group -->
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="material-nav-link"
            :title="item.label"
          >
            <div class="nav-icon-box" :style="{ '--item-color': item.color }">
              <i :class="item.icon" class="nav-icon"></i>
            </div>
            <span v-if="!isCollapsed" class="nav-label text-truncate flex-grow-1">{{ item.label }}</span>
            
            <!-- Dynamic Count Badge -->
            <span v-if="!isCollapsed && item.badge && item.badge()" class="badge rounded-pill ms-auto small fw-bold" :class="item.badgeClass || 'bg-primary text-white'">
              {{ item.badge() }}
            </span>
            <!-- Static Badge Text -->
            <span v-else-if="!isCollapsed && item.badgeText" class="badge rounded-pill ms-auto small fw-bold" :class="item.badgeClass || 'bg-light text-dark border'">
              {{ item.badgeText }}
            </span>
          </router-link>
        </div>
      </nav>

      <!-- Sidebar Footer (Expanded) -->
      <div class="sidebar-footer p-2.5 border-top divider-color" v-if="!isCollapsed">
        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 footer-user-pill mb-2">
          <div class="d-flex align-items-center gap-2 overflow-hidden">
            <div class="avatar-kafeinarts">
              <span>K</span>
            </div>
            <div class="lh-1 text-truncate">
              <span class="fw-bold fs-7 text-app d-block text-truncate">Kafeinarts</span>
              <small class="text-success fw-semibold" style="font-size: 10px;">● Workspace Siap</small>
            </div>
          </div>
          <router-link to="/preferences" class="btn btn-sm btn-ghost p-1 text-sub" title="Pengaturan Sistem">
            <i class="bi bi-gear-fill"></i>
          </router-link>
        </div>

        <div class="d-flex gap-1.5">
          <router-link to="/preferences" class="btn btn-sm btn-outline-theme rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5" style="font-size: 11.5px;">
            <i class="bi bi-palette"></i> Tema
          </router-link>
          <button @click="showDukungModal = true" class="btn btn-sm btn-success-subtle text-success border border-success-subtle rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 px-3 py-1.5" style="font-size: 11.5px;" title="Dukung Pengembang">
            <i class="bi bi-heart-fill"></i> Dukung
          </button>
        </div>
      </div>

      <!-- Sidebar Footer (Collapsed) -->
      <div class="sidebar-footer p-2 border-top divider-color text-center" v-else>
        <button @click="showDukungModal = true" class="btn btn-sm btn-light border rounded-circle p-0 mb-2" style="width: 38px; height: 38px;" title="☕ Dukung Dev">
          <i class="bi bi-heart-fill text-danger fs-6"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div :class="['main-content', { expanded: isCollapsed }]">
      <!-- Material Design 3 Top App Bar Header -->
      <header class="top-header m3-top-app-bar border-bottom px-3 px-md-4 py-2 d-flex align-items-center justify-content-between sticky-top shadow-xs">
        <div class="d-flex align-items-center gap-2">
          <!-- MOBILE: If on subpage, show prominent Back to Home button! -->
          <router-link
            v-if="route.path !== '/'"
            to="/"
            class="btn btn-sm m3-back-btn d-flex align-items-center gap-1.5 fw-bold shadow-xs"
            title="Kembali ke Beranda (Dashboard)"
          >
            <i class="bi bi-arrow-left fs-6"></i>
            <span>Home</span>
          </router-link>

          <!-- MOBILE: If on Home, show drawer hamburger toggle -->
          <button
            v-else
            class="btn btn-sm btn-icon-m3 d-md-none rounded-circle"
            @click="mobileDrawer = true"
            title="Buka Menu Navigasi"
          >
            <i class="bi bi-list fs-5"></i>
          </button>

          <!-- DESKTOP: Sidebar collapse toggle -->
          <button
            class="btn btn-sm btn-icon-m3 d-none d-md-flex rounded-circle me-1"
            @click="isCollapsed = !isCollapsed"
            :title="isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'"
          >
            <i :class="isCollapsed ? 'bi bi-layout-sidebar-reverse' : 'bi bi-layout-sidebar'"></i>
          </button>
          
          <!-- Dynamic Breadcrumb / Page Title Badge -->
          <div class="d-flex align-items-center gap-2 page-breadcrumb-pill">
            <!-- Desktop Back-to-home Breadcrumb link -->
            <router-link
              v-if="route.path !== '/'"
              to="/"
              class="d-none d-md-inline text-sub text-decoration-none hover-primary small fw-semibold breadcrumb-home-link"
              title="Ke Dashboard Home"
            >
              <i class="bi bi-house-door me-1"></i>Home
            </router-link>
            <span v-if="route.path !== '/'" class="d-none d-md-inline text-muted small opacity-50">/</span>

            <span class="page-title-badge"><i :class="currentPageIcon"></i></span>
            <span class="fw-bold text-app fs-6 page-title-text text-truncate" style="max-width: 220px;">
              {{ currentPageTitle }}
            </span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <!-- Quick Capture Launcher -->
          <router-link to="/quick-capture" class="btn btn-sm btn-light border rounded-pill px-3 py-1.5 d-none d-sm-flex align-items-center gap-1.5 quick-search-pill text-sub" title="Quick Capture (Catatan & Alarm)">
            <i class="bi bi-lightning-charge-fill text-warning"></i>
            <span class="small fw-semibold">Quick Capture</span>
            <kbd class="badge bg-secondary-subtle text-secondary py-0.5 px-1.5 ms-1 border" style="font-size: 10px;">⚡</kbd>
          </router-link>

          <!-- Quick Camera Shortcut Button -->
          <router-link to="/camera" class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center header-icon-btn" title="Scan Dokumen & Kamera">
            <i class="bi bi-camera-fill text-secondary fs-6"></i>
          </router-link>

          <!-- Quick Mood Tracker & Alarm Shortcut Button -->
          <router-link to="/mood" class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center header-icon-btn" title="Kamera Mood & Alarm Kerja">
            <i class="bi bi-emoji-smile-fill text-danger fs-6"></i>
          </router-link>

          <!-- Budget Alert Warning if exceeded -->
          <router-link to="/finance" v-if="isBudgetExceeded" class="badge bg-danger-subtle text-danger border border-danger rounded-circle p-0 d-flex align-items-center justify-content-center header-icon-btn text-decoration-none" title="Peringatan: Pengeluaran Melebihi Anggaran!">
            <i class="bi bi-exclamation-triangle-fill fs-6"></i>
          </router-link>

          <!-- Accent Mode Switcher Button (Blue Mode vs Pink Mode) -->
          <button 
            @click="toggleBluePinkMode" 
            class="btn btn-sm btn-light border rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5 header-icon-btn text-nowrap"
            :title="isPinkMode ? 'Mode Pink Aktif (Klik untuk ganti ke Blue Mode)' : 'Mode Blue Aktif (Klik untuk ganti ke Pink Mode)'"
            style="font-size: 11.5px; height: 32px; width: auto;"
          >
            <span class="rounded-circle d-inline-block" :style="{ width: '10px', height: '10px', backgroundColor: accentColor, boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }"></span>
            <span class="fw-bold d-none d-sm-inline" :style="{ color: isPinkMode ? '#ec4899' : '#2563eb' }">
              {{ isPinkMode ? '🌸 Pink' : '🔵 Blue' }}
            </span>
          </button>

          <!-- Theme Switcher Button (Light / Dark / OLED True Black) -->
          <button 
            @click="toggleThemeMode" 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center header-icon-btn" 
            :title="themeMode === 'light' ? 'Mode Terang (Klik untuk Dark Slate)' : (themeMode === 'dark' ? 'Mode Gelap Slate (Klik untuk OLED True Black)' : 'True Black OLED (Klik untuk Mode Terang)')"
          >
            <i v-if="themeMode === 'light'" class="bi bi-sun-fill text-warning fs-6"></i>
            <i v-else-if="themeMode === 'dark'" class="bi bi-moon-stars-fill text-info fs-6"></i>
            <i v-else class="bi bi-circle-fill text-white bg-dark rounded-circle border border-secondary p-0.5" style="font-size: 10px;"></i>
          </button>

          <!-- Storage Link -->
          <router-link
            to="/storage"
            class="btn btn-sm border rounded-circle p-0 d-flex align-items-center justify-content-center header-icon-btn position-relative"
            :class="isStorageFullState ? 'btn-danger text-white' : 'btn-light text-secondary'"
            title="Kapasitas & Kuota Storage"
          >
            <i class="bi bi-hdd-stack-fill fs-6" :class="isStorageFullState ? 'text-white' : 'text-primary'"></i>
            <span v-if="isStorageFullState" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
          </router-link>

          <!-- Preferences Link -->
          <router-link to="/preferences" class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center header-icon-btn" title="Pengaturan Aplikasi">
            <i class="bi bi-gear-fill text-primary fs-6"></i>
          </router-link>
        </div>
      </header>

      <!-- Mobile Offcanvas Drawer -->
      <transition name="overlay-fade">
        <div class="offcanvas-overlay" v-if="mobileDrawer" @click="mobileDrawer = false"></div>
      </transition>
      
      <transition name="drawer-slide">
        <div class="mobile-drawer p-3" v-if="mobileDrawer">
          <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
            <div class="d-flex align-items-center gap-2">
              <div class="brand-icon-wrapper shadow-sm">
                <img src="/logo.svg" alt="TaskArts Logo" class="brand-logo-img" />
              </div>
              <div class="lh-1">
                <span class="fw-bold fs-5 text-app">Task<span :style="{ color: accentColor }">Arts</span></span>
                <small class="brand-badge-kafeinarts d-block mt-0.5">By Kafeinarts</small>
              </div>
            </div>
            <button class="btn btn-sm btn-light border rounded-circle shadow-sm" @click="mobileDrawer = false" title="Tutup Menu">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Mobile Search Filter -->
          <div class="mb-3">
            <div class="search-input-group d-flex align-items-center rounded-pill px-2.5 py-1.5 border">
              <i class="bi bi-search text-muted me-2" style="font-size: 12px;"></i>
              <input 
                v-model="sidebarSearch" 
                type="text" 
                class="search-input flex-grow-1 border-0 bg-transparent shadow-none" 
                placeholder="Cari menu..." 
                style="font-size: 13px;"
              />
            </div>
          </div>

          <nav class="d-flex flex-column gap-1" @click="mobileDrawer = false">
            <div v-for="(group, gIdx) in filteredNavGroups" :key="group.title || gIdx" class="mb-2">
              <div class="sidebar-section-header px-1 pt-1">{{ group.title }}</div>
              <router-link 
                v-for="item in group.items" 
                :key="item.to" 
                :to="item.to" 
                class="material-nav-link"
              >
                <div class="nav-icon-box me-2.5" :style="{ '--item-color': item.color }">
                  <i :class="item.icon" class="nav-icon"></i>
                </div>
                <span>{{ item.label }}</span>
                <span v-if="item.badge && item.badge()" class="badge rounded-pill ms-auto small fw-bold" :class="item.badgeClass || 'bg-primary text-white'">
                  {{ item.badge() }}
                </span>
                <span v-else-if="item.badgeText" class="badge rounded-pill ms-auto small fw-bold" :class="item.badgeClass || 'bg-light text-dark border'">
                  {{ item.badgeText }}
                </span>
              </router-link>
            </div>
          </nav>

          <div class="p-2 border-top mt-3">
            <button @click="mobileDrawer = false; showDukungModal = true" class="btn btn-sm btn-success w-100 rounded-pill fw-semibold text-center d-flex align-items-center justify-content-center gap-1.5 shadow-xs py-2">
              <i class="bi bi-heart-fill text-white"></i> ☕ Dukung Dev (Kafeinarts)
            </button>
          </div>
        </div>
      </transition>

      <!-- Dukung Dev Modal Popup (Bank & E-Wallet) -->
      <DukungDevModal v-model="showDukungModal" />

      <!-- Main Router View Container with Snappy Lightweight Fade-Slide Animation -->
      <div class="p-3 p-md-4 main-view-viewport">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <!-- Material Design 3 Mobile Bottom Navigation Bar -->
      <nav class="m3-bottom-nav d-md-none border-top fixed-bottom d-flex justify-content-around align-items-center shadow-lg">
        <router-link to="/" class="m3-bottom-nav-item" :class="{ active: route.path === '/' }">
          <div class="m3-nav-indicator">
            <i class="bi bi-grid-fill"></i>
          </div>
          <span class="m3-nav-label">Home</span>
        </router-link>

        <router-link to="/todo" class="m3-bottom-nav-item" :class="{ active: route.path.startsWith('/todo') || route.path.startsWith('/tasks') }">
          <div class="m3-nav-indicator position-relative">
            <i class="bi bi-check2-square"></i>
            <span v-if="pendingTasksCount" class="m3-badge-dot">{{ pendingTasksCount > 99 ? '99+' : pendingTasksCount }}</span>
          </div>
          <span class="m3-nav-label">To-Do</span>
        </router-link>

        <router-link to="/finance" class="m3-bottom-nav-item" :class="{ active: route.path.startsWith('/finance') }">
          <div class="m3-nav-indicator position-relative">
            <i class="bi bi-wallet2"></i>
            <span v-if="isBudgetExceeded" class="m3-badge-alert">!</span>
          </div>
          <span class="m3-nav-label">Kas</span>
        </router-link>

        <router-link to="/surat" class="m3-bottom-nav-item" :class="{ active: route.path.startsWith('/surat') }">
          <div class="m3-nav-indicator">
            <i class="bi bi-file-earmark-richtext-fill"></i>
          </div>
          <span class="m3-nav-label">Surat</span>
        </router-link>

        <button type="button" class="m3-bottom-nav-item btn-clean" @click="mobileDrawer = true">
          <div class="m3-nav-indicator">
            <i class="bi bi-grid-3x3-gap-fill"></i>
          </div>
          <span class="m3-nav-label">Menu</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import AppNotifications from './components/AppNotifications.vue';
import DukungDevModal from './components/DukungDevModal.vue';
import { saveNightlySnapshot, cleanLegacyLocalStorageSnapshot } from './utils/backupStorage';
import { isStorageFull } from './utils/storageManager';

export default {
  name: 'App',
  components: {
    AppNotifications,
    DukungDevModal
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const isCollapsed = ref(false);
    const mobileDrawer = ref(false);
    const showDukungModal = ref(false);
    const sidebarSearch = ref('');
    const isStorageFullState = ref(isStorageFull());

    const updateStorageState = () => {
      isStorageFullState.value = isStorageFull();
    };

    const pendingTasksCount = computed(() => store.getters.pendingTasksCount);
    const activeProjectsCount = computed(() => store.getters.activeProjectsCount);
    const totalClientsCount = computed(() => store.getters.totalClientsCount);
    const isBudgetExceeded = computed(() => store.getters.isBudgetExceeded);
    const themeMode = computed(() => store.getters.getThemeMode);
    const accentColor = computed(() => store.getters.getAccentColor);

    // Grouped navigation definition for structured elegant presentation
    const navGroups = [
      {
        title: 'WORKSPACE & PROYEK',
        items: [
          { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill', color: '#2563eb' },
          { to: '/job-tracker', label: 'Simpan Lamaran Kerja', icon: 'bi-briefcase-fill', color: '#0ea5e9', badgeText: 'Glints/LinkedIn', badgeClass: 'bg-primary text-white' },
          { to: '/medium-draft', label: 'Medium Draft Suite', icon: 'bi-medium', color: '#10b981', badgeText: 'Siap Copas', badgeClass: 'bg-success text-white' },
          { to: '/todo', label: 'To-Do & Kanban', icon: 'bi-kanban-fill', color: '#f59e0b', badge: () => pendingTasksCount.value, badgeClass: 'bg-warning text-dark' },
          { to: '/project', label: 'Proyek & Kontrak', icon: 'bi-briefcase-fill', color: '#0284c7', badge: () => activeProjectsCount.value, badgeClass: 'bg-info text-dark' },
          { to: '/camera', label: 'Kamera & Scan Dokumen', icon: 'bi-camera-fill', color: '#e11d48' },
          { to: '/surat', label: 'Surat Generator', icon: 'bi-file-earmark-richtext-fill', color: '#2563eb' },
          { to: '/cv', label: 'CV & Resume Builder', icon: 'bi-person-vcard-fill', color: '#059669' },
          { to: '/videos', label: 'Tonton & Sync Video', icon: 'bi-play-btn-fill', color: '#dc2626', badgeText: 'YouTube', badgeClass: 'bg-danger text-white' }
        ]
      },
      {
        title: 'TIM & KOMUNIKASI',
        items: [
          { to: '/contacts', label: 'Kontak Tim & WA', icon: 'bi-person-lines-fill', color: '#059669', badge: () => totalClientsCount.value, badgeClass: 'bg-success text-white' },
          { to: '/chat-ai', label: 'Live Chat AI Assistant', icon: 'bi-robot', color: '#0891b2', badgeText: 'AI', badgeClass: 'bg-info text-dark' }
        ]
      },
      {
        title: 'KEUANGAN & DATA',
        items: [
          { to: '/finance', label: 'Keuangan & Tracker', icon: 'bi-wallet2', color: '#2563eb', badge: () => isBudgetExceeded.value ? 'Over Budget' : null, badgeClass: 'bg-danger text-white' },
          { to: '/rab', label: 'RAB & Kas Kegiatan', icon: 'bi-calculator-fill', color: '#059669', badgeText: 'NEW', badgeClass: 'bg-success text-white' },
          { to: '/invoice', label: 'Invoice Generator', icon: 'bi-receipt', color: '#6366f1' },
          { to: '/sql', label: 'SQL Data Export', icon: 'bi-database-fill-gear', color: '#d97706' }
        ]
      },
      {
        title: 'AGENDA & PRODUKTIVITAS',
        items: [
          { to: '/productivity-insights', label: 'Productivity Insights', icon: 'bi-bar-chart-line-fill', color: '#2563eb', badgeText: 'D3.js', badgeClass: 'bg-primary text-white' },
          { to: '/quick-capture', label: 'Quick Capture Notes', icon: 'bi-lightning-charge-fill', color: '#f59e0b' },
          { to: '/calendar', label: 'Kalender & Agenda', icon: 'bi-calendar3', color: '#ea580c' },
          { to: '/time-suite', label: 'Time Suite & Pomodoro', icon: 'bi-clock-history', color: '#16a34a' },
          { to: '/selfie', label: 'Selfie for Happiness', icon: 'bi-camera-reels-fill', color: '#e11d48' },
          { to: '/mood', label: 'Kamera Mood & Alarm', icon: 'bi-emoji-smile-fill', color: '#f43f5e' },
          { to: '/notes', label: 'Notes & Scratchpad', icon: 'bi-journal-text', color: '#64748b' },
          { to: '/diary', label: 'Diary & Jurnal Cerita', icon: 'bi-book-half', color: '#ca8a04', badgeText: 'Foto', badgeClass: 'bg-warning text-dark' },
          { to: '/code-notes', label: 'Code Snippets', icon: 'bi-code-slash', color: '#0284c7' },
          { to: '/games', label: '3D Games & Simulator', icon: 'bi-controller', color: '#9333ea' }
        ]
      },
      {
        title: 'SISTEM & PANDUAN',
        items: [
          { to: '/storage', label: 'Storage & Kuota', icon: 'bi-hdd-stack-fill', color: '#0284c7', badge: () => isStorageFullState.value ? 'Penuh!' : null, badgeClass: 'bg-danger text-white' },
          { to: '/preferences', label: 'Preferences & Tema', icon: 'bi-sliders', color: '#2563eb' },
          { to: '/faq', label: 'Info & Hidden Features', icon: 'bi-question-circle-fill', color: '#0891b2' },
          { to: '/developer', label: 'View Developer', icon: 'bi-person-badge-fill', color: '#2563eb', badgeText: 'PRO', badgeClass: 'bg-primary text-white' }
        ]
      }
    ];

    // Reactive filter when user types in sidebar search box
    const filteredNavGroups = computed(() => {
      const q = sidebarSearch.value.trim().toLowerCase();
      if (!q) return navGroups;
      return navGroups
        .map(g => ({
          ...g,
          items: g.items.filter(item =>
            item.label.toLowerCase().includes(q) ||
            item.to.toLowerCase().includes(q) ||
            g.title.toLowerCase().includes(q)
          )
        }))
        .filter(g => g.items.length > 0);
    });

    // Dynamic Title & Icon based on Active Route
    const routeTitles = {
      '/': { title: 'Dashboard Executive', icon: 'bi-grid-1x2-fill' },
      '/job-tracker': { title: 'Simpan Lamaran Kerja (Glints/LinkedIn)', icon: 'bi-briefcase-fill' },
      '/medium-draft': { title: 'Medium Draft & Story Builder', icon: 'bi-medium' },
      '/todo': { title: 'To-Do & Kanban OS', icon: 'bi-kanban-fill' },
      '/project': { title: 'Proyek & Kontrak', icon: 'bi-briefcase-fill' },
      '/camera': { title: 'Kamera Scan Dokumen', icon: 'bi-camera-fill' },
      '/surat': { title: 'Surat Generator Resmi', icon: 'bi-file-earmark-richtext-fill' },
      '/cv': { title: 'CV & Resume Builder ATS', icon: 'bi-person-vcard-fill' },
      '/videos': { title: 'Tonton & Sync Video Hub', icon: 'bi-play-btn-fill' },
      '/contacts': { title: 'Kontak Tim & Broadcast WA', icon: 'bi-person-lines-fill' },
      '/chat-ai': { title: 'Live Chat AI Assistant', icon: 'bi-robot' },
      '/finance': { title: 'Keuangan & Money Tracker', icon: 'bi-wallet2' },
      '/rab': { title: 'RAB & Kas Kegiatan', icon: 'bi-calculator-fill' },
      '/invoice': { title: 'Invoice Generator (PDF)', icon: 'bi-receipt' },
      '/sql': { title: 'SQL Data Export & Runner', icon: 'bi-database-fill-gear' },
      '/productivity-insights': { title: 'Productivity Insights (D3.js)', icon: 'bi-bar-chart-line-fill' },
      '/quick-capture': { title: 'Quick Capture & Alarms', icon: 'bi-lightning-charge-fill' },
      '/calendar': { title: 'Kalender & Agenda Kerja', icon: 'bi-calendar3' },
      '/time-suite': { title: 'Time Suite & Pomodoro', icon: 'bi-clock-history' },
      '/selfie': { title: 'Selfie for Happiness', icon: 'bi-camera-reels-fill' },
      '/mood': { title: 'Kamera Mood & Alarm Kerja', icon: 'bi-emoji-smile-fill' },
      '/notes': { title: 'Sticky Notes & Scratchpad', icon: 'bi-journal-text' },
      '/diary': { title: 'Diary & Jurnal Cerita Harian', icon: 'bi-book-half' },
      '/code-notes': { title: 'Code Snippets & Tech Notes', icon: 'bi-code-slash' },
      '/games': { title: '3D Games & Simulator', icon: 'bi-controller' },
      '/storage/view': { title: 'Inspeksi Kunci & Detail JSON', icon: 'bi-code-square' },
      '/storage': { title: 'Storage & Kapasitas Local Storage', icon: 'bi-hdd-stack-fill' },
      '/preferences': { title: 'Preferences & Pengaturan', icon: 'bi-sliders' },
      '/faq': { title: 'Panduan & Hidden Features', icon: 'bi-question-circle-fill' },
      '/developer': { title: 'Developer Portfolio', icon: 'bi-person-badge-fill' }
    };

    const currentPageTitle = computed(() => {
      const path = route.path;
      if (routeTitles[path]) return routeTitles[path].title;
      for (const key of Object.keys(routeTitles)) {
        if (key !== '/' && path.startsWith(key)) return routeTitles[key].title;
      }
      return 'TaskArts';
    });

    const currentPageIcon = computed(() => {
      const path = route.path;
      if (routeTitles[path]) return routeTitles[path].icon;
      for (const key of Object.keys(routeTitles)) {
        if (key !== '/' && path.startsWith(key)) return routeTitles[key].icon;
      }
      return 'bi-app-indicator';
    });

    const applyThemeToBody = (mode) => {
      document.body.classList.remove('light-theme', 'dark-theme', 'oled-theme', 'dark-mode');

      if (mode === 'oled') {
        document.body.classList.add('oled-theme', 'dark-mode');
        document.body.style.backgroundColor = '#000000';
        document.body.style.color = '#ffffff';
      } else if (mode === 'dark') {
        document.body.classList.add('dark-theme', 'dark-mode');
        document.body.style.backgroundColor = '#090d16';
        document.body.style.color = '#f1f5f9';
      } else {
        document.body.classList.add('light-theme');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      }
    };

    watch(themeMode, (newVal) => {
      applyThemeToBody(newVal);
    }, { immediate: true });

    // Keyboard shortcut handler (Ctrl+K or Cmd+K)
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchEl = document.querySelector('.search-input');
        if (searchEl) {
          searchEl.focus();
          searchEl.select();
        }
      }
    };

    onMounted(() => {
      applyThemeToBody(themeMode.value);
      window.addEventListener('keydown', handleKeydown);

      // Clean up legacy monolithic snapshot from localStorage to release quota back to app
      cleanLegacyLocalStorageSnapshot();

      // Automated Nightly Backup Check (Persisted in IndexedDB to prevent QuotaExceededError)
      try {
        const isNightlyEnabled = localStorage.getItem('ft_auto_nightly_backup') !== 'false';
        if (isNightlyEnabled) {
          const lastBackup = localStorage.getItem('ft_last_nightly_backup_date');
          const today = new Date().toISOString().split('T')[0];
          if (lastBackup !== today) {
            let videos = [];
            let customFolders = [];
            try {
              videos = JSON.parse(localStorage.getItem('ft_saved_video_hub_list') || '[]');
            } catch (e) {}
            try {
              customFolders = JSON.parse(localStorage.getItem('ft_custom_folders') || '[]');
            } catch (e) {}

            const fullState = {
              app: 'TaskArts',
              version: '2.5',
              exportDate: new Date().toISOString(),
              rabItems: store.getters.getRabItems || [],
              rabIncomes: store.getters.getRabIncomes || [],
              rabExpenses: store.getters.getRabExpenses || [],
              tasks: store.getters.getTasks || [],
              projects: store.getters.getProjects || [],
              transactions: store.getters.getTransactions || [],
              invoices: store.getters.getInvoices || [],
              contacts: store.getters.getContacts || [],
              habits: store.getters.getHabits || [],
              notes: store.getters.getNotes || [],
              events: store.getters.getEvents || [],
              codeNotes: store.getters.getCodeNotes || [],
              suratList: store.getters.getSuratList || [],
              cvData: store.getters.getCvData || {},
              userProfile: store.getters.getUserProfile || {},
              myBusiness: store.getters.getMyBusiness || {},
              moodLogs: store.getters.getMoodLogs || [],
              workAlarms: store.getters.getWorkAlarms || [],
              selfieGallery: store.getters.getSelfieGallery || [],
              videos,
              customFolders,
              themeMode: store.getters.getThemeMode,
              accentColor: store.getters.getAccentColor,
              budgetThreshold: store.getters.getBudgetThreshold,
              welcomeBanner: store.getters.getWelcomeBanner,
              geminiApiKey: store.getters.getGeminiApiKey,
              aiProvider: store.getters.getAiProvider,
              aiModel: store.getters.getAiModel
            };

            // Save to IndexedDB safely without crashing
            saveNightlySnapshot(fullState).catch((backupErr) => {
              console.warn('Nightly backup snapshot error:', backupErr);
            });
          }
        }
      } catch (err) {
        console.warn('Automated nightly backup check encountered error:', err);
      }

      // Listen for PWA Install Prompt Event
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPwaPrompt = e;
        window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
      });

      // Global Listener to open Dukung Dev Modal
      window.addEventListener('open-dukung-dev', () => {
        showDukungModal.value = true;
      });

      // Storage quota listeners
      window.addEventListener('storage-quota-updated', updateStorageState);
      window.addEventListener('storage-quota-full', updateStorageState);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('storage-quota-updated', updateStorageState);
      window.removeEventListener('storage-quota-full', updateStorageState);
    });

    const isPinkMode = computed(() => {
      const c = (accentColor.value || '').toLowerCase();
      return c === '#ec4899' || c === '#f43f5e' || c === '#db2777' || c === '#e11d48';
    });

    const toggleBluePinkMode = () => {
      if (isPinkMode.value) {
        store.dispatch('setAccentColor', '#2563eb');
        store.dispatch('showNotification', {
          type: 'info',
          title: '🔵 Blue Mode Aktif',
          message: 'Aksen warna diubah ke Material Royal Blue (#2563eb).'
        });
      } else {
        store.dispatch('setAccentColor', '#ec4899');
        store.dispatch('showNotification', {
          type: 'info',
          title: '🌸 Pink Mode Aktif',
          message: 'Aksen warna diubah ke Sakura Rose Pink (#ec4899).'
        });
      }
    };

    // Keep document attributes & styles in sync with theme and accent color
    watch(themeMode, (mode) => {
      const isDark = mode === 'dark' || mode === 'oled';
      document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark-mode', 'dark-theme');
        document.body.classList.add('dark-mode', 'dark-theme');
      } else {
        document.documentElement.classList.remove('dark-mode', 'dark-theme');
        document.body.classList.remove('dark-mode', 'dark-theme');
      }
      if (mode === 'oled') {
        document.documentElement.classList.add('oled-theme');
        document.body.classList.add('oled-theme');
      } else {
        document.documentElement.classList.remove('oled-theme');
        document.body.classList.remove('oled-theme');
      }
    }, { immediate: true });

    watch(accentColor, (color) => {
      if (color) {
        document.documentElement.style.setProperty('--primary-color', color);
        document.body.style.setProperty('--primary-color', color);
      }
    }, { immediate: true });

    const toggleThemeMode = () => {
      let next = 'light';
      if (themeMode.value === 'light') next = 'dark';
      else if (themeMode.value === 'dark') next = 'oled';
      else next = 'light';
      store.dispatch('setThemeMode', next);
    };

    return {
      route,
      isCollapsed,
      mobileDrawer,
      showDukungModal,
      sidebarSearch,
      filteredNavGroups,
      currentPageTitle,
      currentPageIcon,
      pendingTasksCount,
      activeProjectsCount,
      totalClientsCount,
      isBudgetExceeded,
      themeMode,
      accentColor,
      isPinkMode,
      isStorageFullState,
      toggleBluePinkMode,
      toggleThemeMode
    };
  }
};
</script>

<style>
/* Global Anti-Horizontal Scroll & Mobile Constraints */
html, body, #app, .app-container {
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

.main-content {
  max-width: 100% !important;
  overflow-x: hidden !important;
}
/* CSS Variables & Themes */
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 76px;
  --primary-color: #2563eb;
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --border-color: #e2e8f0;

  --sidebar-bg: #ffffff;
  --sidebar-text: #475569;
  --sidebar-hover-bg: #f1f5f9;
  --sidebar-active-bg: var(--primary-color);
  --sidebar-active-text: #ffffff;
  --sidebar-divider: #e2e8f0;
  --sidebar-header-color: #94a3b8;
  --sidebar-border: #e2e8f0;
}

/* Light Theme Variables */
.light-theme {
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --bg-hover: #f1f5f9;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --border-color: #e2e8f0;

  --sidebar-bg: #ffffff;
  --sidebar-text: #475569;
  --sidebar-hover-bg: #f1f5f9;
  --sidebar-active-bg: var(--primary-color);
  --sidebar-active-text: #ffffff;
  --sidebar-divider: #e2e8f0;
  --sidebar-header-color: #94a3b8;
  --sidebar-border: #e2e8f0;
}

/* Dark Theme Variables (Slate Charcoal) */
.dark-theme {
  --bg-app: #090d16;
  --bg-surface: #131b2e;
  --bg-card: #131b2e;
  --bg-input: #1a233a;
  --bg-hover: rgba(255, 255, 255, 0.08);
  --text-main: #f1f5f9;
  --text-sub: #94a3b8;
  --border-color: #1e293b;

  --sidebar-bg: #0d1322;
  --sidebar-text: #94a3b8;
  --sidebar-hover-bg: rgba(255, 255, 255, 0.06);
  --sidebar-active-bg: var(--primary-color);
  --sidebar-active-text: #ffffff;
  --sidebar-divider: #1e293b;
  --sidebar-header-color: #64748b;
  --sidebar-border: #1e293b;
}

/* OLED True Black Theme Variables (Pure #000000 High Contrast) */
.oled-theme {
  --bg-app: #000000;
  --bg-surface: #0a0a0a;
  --bg-card: #0d0d0d;
  --bg-input: #171717;
  --bg-hover: #222222;
  --text-main: #ffffff;
  --text-sub: #d4d4d8;
  --border-color: #27272a;

  --sidebar-bg: #000000;
  --sidebar-text: #a1a1aa;
  --sidebar-hover-bg: #18181b;
  --sidebar-active-bg: var(--primary-color);
  --sidebar-active-text: #ffffff;
  --sidebar-divider: #27272a;
  --sidebar-header-color: #71717a;
  --sidebar-border: #27272a;
}

body {
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  margin: 0;
  padding: 0;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* =========================================================
   Unified High-Contrast Dark Mode & Readability Engine
   Supports: .dark-mode, .dark-theme, and [data-bs-theme="dark"]
   ========================================================= */

/* Typography & Text Contrast Overhauls */
.dark-mode h1, .dark-theme h1,
.dark-mode h2, .dark-theme h2,
.dark-mode h3, .dark-theme h3,
.dark-mode h4, .dark-theme h4,
.dark-mode h5, .dark-theme h5,
.dark-mode h6, .dark-theme h6,
.dark-mode .h1, .dark-theme .h1,
.dark-mode .h2, .dark-theme .h2,
.dark-mode .h3, .dark-theme .h3,
.dark-mode .h4, .dark-theme .h4,
.dark-mode .h5, .dark-theme .h5,
.dark-mode .h6, .dark-theme .h6,
.dark-mode .card-title, .dark-theme .card-title,
.dark-mode .modal-title, .dark-theme .modal-title,
.dark-mode .offcanvas-title, .dark-theme .offcanvas-title {
  color: #f8fafc !important;
}

/* Invert dark text utility classes to high-contrast white/slate, except inside bright colored badges */
.dark-mode .text-dark:not(.badge.bg-warning):not(.badge.bg-warning-subtle):not(.badge.bg-info):not(.badge.bg-info-subtle),
.dark-theme .text-dark:not(.badge.bg-warning):not(.badge.bg-warning-subtle):not(.badge.bg-info):not(.badge.bg-info-subtle),
.dark-mode .text-black, .dark-theme .text-black,
.dark-mode .text-body, .dark-theme .text-body,
.dark-mode .text-main, .dark-theme .text-main,
.dark-mode .text-app, .dark-theme .text-app,
.dark-mode strong:not(.badge *):not(.badge),
.dark-theme strong:not(.badge *):not(.badge),
.dark-mode b, .dark-theme b {
  color: #f1f5f9 !important;
}

/* Secondary & Muted text: crisp slate-400 / zinc-300 with > 5:1 contrast against dark surfaces */
.dark-mode .text-muted, .dark-theme .text-muted,
.dark-mode .text-secondary, .dark-theme .text-secondary,
.dark-mode .text-sub, .dark-theme .text-sub,
.dark-mode small.text-muted, .dark-theme small.text-muted,
.dark-mode .small.text-muted, .dark-theme .small.text-muted,
.dark-mode .text-body-secondary, .dark-theme .text-body-secondary {
  color: #94a3b8 !important;
}

/* Form labels and legends */
.dark-mode label, .dark-theme label,
.dark-mode .form-label, .dark-theme .form-label,
.dark-mode .col-form-label, .dark-theme .col-form-label,
.dark-mode legend, .dark-theme legend {
  color: #e2e8f0 !important;
}

/* Surfaces, Cards, Modals, Dropdowns, Offcanvas */
.dark-mode .bg-white, .dark-theme .bg-white,
.dark-mode .card:not(.pwa-pure-black-card), .dark-theme .card:not(.pwa-pure-black-card),
.dark-mode .content-card, .dark-theme .content-card,
.dark-mode .top-header, .dark-theme .top-header,
.dark-mode .modal-content, .dark-theme .modal-content,
.dark-mode .mobile-bottom-bar, .dark-theme .mobile-bottom-bar,
.dark-mode .accordion-item, .dark-theme .accordion-item,
.dark-mode .offcanvas, .dark-theme .offcanvas,
.dark-mode .offcanvas-body, .dark-theme .offcanvas-body,
.dark-mode .dropdown-menu, .dark-theme .dropdown-menu,
.dark-mode .list-group-item, .dark-theme .list-group-item {
  background-color: var(--bg-surface) !important;
  color: var(--text-main) !important;
  border-color: var(--border-color) !important;
}

.dark-mode .card-header, .dark-theme .card-header,
.dark-mode .card-footer, .dark-theme .card-footer {
  background-color: var(--bg-surface) !important;
  color: var(--text-main) !important;
  border-color: var(--border-color) !important;
}

/* Light backgrounds inversion */
.dark-mode .bg-light, .dark-theme .bg-light,
.dark-mode .bg-body-tertiary, .dark-theme .bg-body-tertiary,
.dark-mode .bg-body-secondary, .dark-theme .bg-body-secondary,
.dark-mode .table-light, .dark-theme .table-light,
.dark-mode .preview-box, .dark-theme .preview-box,
.dark-mode .search-input-group, .dark-theme .search-input-group {
  background-color: var(--bg-input) !important;
  color: var(--text-main) !important;
  border-color: var(--border-color) !important;
}

/* Form Inputs, Selects, and Textareas */
.dark-mode .form-control, .dark-theme .form-control,
.dark-mode .form-select, .dark-theme .form-select,
.dark-mode textarea, .dark-theme textarea {
  background-color: var(--bg-input) !important;
  color: #ffffff !important;
  border-color: var(--border-color) !important;
}

.dark-mode .form-control::placeholder, .dark-theme .form-control::placeholder,
.dark-mode textarea::placeholder, .dark-theme textarea::placeholder {
  color: #94a3b8 !important;
  opacity: 1 !important;
}

.dark-mode .form-control:focus, .dark-theme .form-control:focus,
.dark-mode .form-select:focus, .dark-theme .form-select:focus,
.dark-mode textarea:focus, .dark-theme textarea:focus {
  background-color: var(--bg-input) !important;
  color: #ffffff !important;
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.25) !important;
}

.dark-mode .input-group-text, .dark-theme .input-group-text {
  background-color: var(--bg-input) !important;
  color: #cbd5e1 !important;
  border-color: var(--border-color) !important;
}

/* Tables */
.dark-mode .table, .dark-theme .table {
  --bs-table-bg: transparent;
  --bs-table-color: #f1f5f9;
  --bs-table-hover-bg: rgba(255, 255, 255, 0.06);
  --bs-table-hover-color: #ffffff;
  --bs-table-border-color: var(--border-color);
  color: #f1f5f9 !important;
}

.dark-mode .table th, .dark-theme .table th {
  background-color: var(--bg-surface) !important;
  color: #f8fafc !important;
  border-color: var(--border-color) !important;
}

.dark-mode .table td, .dark-theme .table td {
  color: #e2e8f0 !important;
  border-color: var(--border-color) !important;
}

.dark-mode .table-hover tbody tr:hover, .dark-theme .table-hover tbody tr:hover,
.dark-mode .table-hover tbody tr:hover td, .dark-theme .table-hover tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: #ffffff !important;
}

/* Buttons */
.btn-white {
  background-color: #ffffff;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-white:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.dark-mode .btn-white,
.dark-theme .btn-white {
  background-color: var(--bg-surface) !important;
  color: #f1f5f9 !important;
  border-color: var(--border-color) !important;
}

.dark-mode .btn-white:hover,
.dark-theme .btn-white:hover {
  background-color: var(--bg-hover) !important;
  color: #ffffff !important;
  border-color: var(--primary-color) !important;
}

.oled-theme .btn-white {
  background-color: #171717 !important;
  color: #ffffff !important;
  border-color: #27272a !important;
}

.oled-theme .btn-white:hover {
  background-color: #27272a !important;
  color: #ffffff !important;
  border-color: var(--primary-color) !important;
}

.dark-mode .btn-light, .dark-theme .btn-light {
  background-color: var(--bg-input) !important;
  color: #f1f5f9 !important;
  border-color: var(--border-color) !important;
}

.dark-mode .btn-light:hover, .dark-theme .btn-light:hover {
  background-color: var(--bg-hover) !important;
  color: #ffffff !important;
}

.dark-mode .btn-outline-secondary, .dark-theme .btn-outline-secondary {
  border-color: var(--border-color) !important;
  color: #cbd5e1 !important;
}

.dark-mode .btn-outline-secondary:hover, .dark-theme .btn-outline-secondary:hover {
  background-color: var(--bg-hover) !important;
  color: #ffffff !important;
}

.dark-mode .modal-header, .dark-theme .modal-header,
.dark-mode .modal-footer, .dark-theme .modal-footer {
  border-color: var(--border-color) !important;
}

.dark-mode .btn-close, .dark-theme .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%) !important;
}

.dark-mode .border, .dark-theme .border,
.dark-mode .border-top, .dark-theme .border-top,
.dark-mode .border-bottom, .dark-theme .border-bottom,
.dark-mode .border-start, .dark-theme .border-start,
.dark-mode .border-end, .dark-theme .border-end,
.dark-mode .border-2, .dark-theme .border-2 {
  border-color: var(--border-color) !important;
}

/* Badges */
.dark-mode .badge.bg-light, .dark-theme .badge.bg-light {
  background-color: var(--bg-input) !important;
  color: #f1f5f9 !important;
  border: 1px solid var(--border-color) !important;
}

.dark-mode .badge.bg-white, .dark-theme .badge.bg-white {
  background-color: var(--bg-surface) !important;
  color: #f1f5f9 !important;
  border: 1px solid var(--border-color) !important;
}

.dark-mode .badge.bg-warning, .dark-theme .badge.bg-warning,
.dark-mode .badge.bg-warning-subtle, .dark-theme .badge.bg-warning-subtle {
  background-color: #f59e0b !important;
  color: #0f172a !important;
}

.dark-mode .badge.bg-info, .dark-theme .badge.bg-info,
.dark-mode .badge.bg-info-subtle, .dark-theme .badge.bg-info-subtle {
  background-color: #06b6d4 !important;
  color: #0f172a !important;
}

/* High-Contrast Subtle Badges */
.dark-mode .bg-primary-subtle, .dark-theme .bg-primary-subtle {
  background-color: rgba(37, 99, 235, 0.22) !important;
  color: #93c5fd !important;
}

.dark-mode .bg-success-subtle, .dark-theme .bg-success-subtle {
  background-color: rgba(16, 185, 129, 0.22) !important;
  color: #6ee7b7 !important;
}

.dark-mode .bg-danger-subtle, .dark-theme .bg-danger-subtle {
  background-color: rgba(225, 29, 72, 0.22) !important;
  color: #fda4af !important;
}

/* =========================================================
   True Black OLED Specific Overrides (Pure #000000 Power Saving)
   ========================================================= */
.oled-theme,
.oled-theme body,
.oled-theme .app-container,
.oled-theme .main-content,
.oled-theme .sidebar-nav,
.oled-theme .mobile-drawer,
.oled-theme .top-header,
.oled-theme .mobile-bottom-bar {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.oled-theme .bg-white,
.oled-theme .card:not(.pwa-pure-black-card),
.oled-theme .content-card,
.oled-theme .modal-content,
.oled-theme .dropdown-menu,
.oled-theme .accordion-item,
.oled-theme .offcanvas,
.oled-theme .offcanvas-body {
  background-color: #0d0d0d !important;
  border-color: #262626 !important;
  color: #ffffff !important;
}

.oled-theme .bg-light,
.oled-theme .bg-body-tertiary,
.oled-theme .bg-body-secondary,
.oled-theme .input-group-text,
.oled-theme .preview-box,
.oled-theme .search-input-group {
  background-color: #171717 !important;
  color: #ffffff !important;
  border-color: #333333 !important;
}

.oled-theme .form-control,
.oled-theme .form-select,
.oled-theme textarea {
  background-color: #121212 !important;
  color: #ffffff !important;
  border-color: #383838 !important;
}

.oled-theme .form-control::placeholder,
.oled-theme textarea::placeholder {
  color: #a1a1aa !important;
}

.oled-theme .border,
.oled-theme .border-top,
.oled-theme .border-bottom,
.oled-theme .border-start,
.oled-theme .border-end,
.oled-theme .border-2 {
  border-color: #262626 !important;
}

.oled-theme .btn-light {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  border-color: #333333 !important;
}

.oled-theme .btn-light:hover {
  background-color: #292929 !important;
}

/* =========================================================
   Primary Accent Color Overrides (Blue Mode, Pink Mode, Palette)
   ========================================================= */
.btn-primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #ffffff !important;
}

.btn-primary:hover,
.btn-primary:focus,
.btn-primary:active {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  filter: brightness(0.92);
  color: #ffffff !important;
}

.btn-outline-primary {
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
}

.btn-outline-primary:hover {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #ffffff !important;
}

.text-primary {
  color: var(--primary-color) !important;
}

.bg-primary {
  background-color: var(--primary-color) !important;
}

.border-primary {
  border-color: var(--primary-color) !important;
}

.badge.bg-primary {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
}

.nav-pills .nav-link.active {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
}

.form-check-input:checked {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.link-primary {
  color: var(--primary-color) !important;
}

/* Pink Mode Specific Refinements */
.pink-mode .brand-accent {
  color: #ec4899 !important;
}

.pink-mode .bg-primary-subtle {
  background-color: rgba(236, 72, 153, 0.15) !important;
  color: #ec4899 !important;
}

.pink-mode.dark-mode .bg-primary-subtle,
.pink-mode.dark-theme .bg-primary-subtle,
.pink-mode .dark-mode .bg-primary-subtle,
.pink-mode .dark-theme .bg-primary-subtle {
  background-color: rgba(236, 72, 153, 0.25) !important;
  color: #f472b6 !important;
}

/* Modals backdrop styling */
.modal-backdrop {
  background-color: rgba(15, 23, 42, 0.7);
}

.modal-backdrop.show {
  opacity: 0.7 !important;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-main);
}

/* Material Design Sidebar Drawer */
.sidebar-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(0.2, 0, 0, 1), background-color 0.3s ease;
  z-index: 1040;
  border-right: 1px solid var(--sidebar-border);
}

.sidebar-nav.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-brand {
  border-bottom: 1px solid var(--sidebar-divider);
}

.sidebar-links {
  overflow-y: auto;
}

.sidebar-section-header {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  color: var(--sidebar-header-color);
  text-transform: uppercase;
  padding: 14px 12px 6px 12px;
}

.sidebar-divider {
  height: 1px;
  background-color: var(--sidebar-divider);
  margin: 10px 6px;
  opacity: 0.85;
}

.material-nav-link {
  display: flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 10px;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.material-nav-link:hover {
  background-color: var(--sidebar-hover-bg);
  color: var(--text-main);
  transform: translateX(3px);
}

.material-nav-link.router-link-active,
.material-nav-link.router-link-exact-active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text) !important;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}

/* Brand styling & Kafeinarts Signature */
.brand-icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 3px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.brand-icon-wrapper:hover {
  transform: scale(1.04);
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  letter-spacing: -0.4px;
}

.brand-badge-kafeinarts {
  display: inline-flex;
  align-items: center;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 2px 7px;
  border-radius: 6px;
}

/* Sidebar Search Box */
.sidebar-search-box {
  border-bottom: 1px solid var(--sidebar-divider);
}

.search-input-group {
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--sidebar-divider);
  transition: all 0.2s ease;
}

.search-input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.search-input {
  color: var(--text-main);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-sub);
  opacity: 0.7;
}

/* Nav item icon box */
.nav-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(148, 163, 184, 0.12);
  color: var(--item-color, var(--primary-color));
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 14.5px;
  transition: all 0.2s ease;
}

.material-nav-link:hover .nav-icon-box {
  background-color: rgba(37, 99, 235, 0.18);
  transform: scale(1.05);
}

.material-nav-link.router-link-active .nav-icon-box {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff !important;
}

.avatar-kafeinarts {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
  flex-shrink: 0;
}

.footer-user-pill {
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--sidebar-divider);
}

/* Page Breadcrumb Pill */
.page-breadcrumb-pill {
  padding: 5px 13px;
  border-radius: 9999px;
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
}

.page-title-badge {
  font-size: 14px;
  color: var(--primary-color);
}

.header-icon-btn {
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
}

.header-icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.08);
}

.btn-sidebar-toggle:hover {
  background-color: var(--sidebar-hover-bg);
  color: var(--text-main);
}

.text-app {
  color: var(--text-main);
}

.btn-outline-theme {
  border-color: var(--sidebar-divider);
  color: var(--sidebar-text);
}

.btn-outline-theme:hover {
  background-color: var(--sidebar-hover-bg);
  color: var(--text-main);
}

.divider-color {
  border-color: var(--sidebar-divider) !important;
}

/* Main Content Area */
.main-content {
  margin-left: var(--sidebar-width);
  flex: 1;
  min-width: 0;
  transition: margin-left 0.25s cubic-bezier(0.2, 0, 0, 1);
  padding-bottom: 60px;
  background-color: var(--bg-app);
}

.main-content.expanded {
  margin-left: var(--sidebar-collapsed-width);
}

.top-header {
  height: 64px;
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  z-index: 1020;
}

/* Route Transitions - Snappy SPA Feel (No Lag) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.15s cubic-bezier(0.2, 0, 0, 1), transform 0.15s cubic-bezier(0.2, 0, 0, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Overlay transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Drawer slide transition */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* Mobile Drawer & Overlay */
.offcanvas-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1050;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 290px;
  background-color: var(--sidebar-bg);
  z-index: 1060;
  overflow-y: auto;
  box-shadow: 6px 0 24px rgba(0, 0, 0, 0.22);
}

/* Material Design 3 Top App Bar & Back Button */
.m3-top-app-bar {
  height: 64px;
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1020;
}

.m3-back-btn {
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  color: var(--primary-color) !important;
  border-radius: 9999px;
  padding: 5px 12px;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.18s cubic-bezier(0.2, 0, 0, 1);
}

.m3-back-btn:hover {
  background-color: rgba(37, 99, 235, 0.12);
  transform: translateX(-2px);
}

.m3-back-btn:active {
  transform: scale(0.95);
}

.btn-icon-m3 {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  transition: all 0.18s cubic-bezier(0.2, 0, 0, 1);
}

.btn-icon-m3:hover {
  background-color: var(--border-color);
  color: var(--primary-color);
}

.btn-icon-m3:active {
  transform: scale(0.92);
}

.breadcrumb-home-link:hover {
  color: var(--primary-color) !important;
}

/* Material Design 3 Mobile Bottom Navigation Bar */
.m3-bottom-nav {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  height: 66px;
  padding: 4px 10px;
  z-index: 1030;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
}

.m3-bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  text-decoration: none;
  padding: 2px 8px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  flex: 1;
  max-width: 76px;
  transition: all 0.18s cubic-bezier(0.2, 0, 0, 1);
}

.btn-clean {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.m3-nav-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  font-size: 16px;
}

.m3-nav-label {
  font-size: 10.5px;
  font-weight: 600;
  margin-top: 2px;
  transition: all 0.2s ease;
  letter-spacing: -0.1px;
}

.m3-bottom-nav-item:active {
  transform: scale(0.94);
}

.m3-bottom-nav-item.active {
  color: var(--primary-color);
}

.m3-bottom-nav-item.active .m3-nav-indicator {
  background-color: rgba(37, 99, 235, 0.15);
  color: var(--primary-color);
}

.dark-mode .m3-bottom-nav-item.active .m3-nav-indicator {
  background-color: rgba(37, 99, 235, 0.28);
  color: #60a5fa;
}

.m3-bottom-nav-item.active .m3-nav-label {
  font-weight: 800;
}

.m3-badge-dot {
  position: absolute;
  top: -4px;
  right: 6px;
  background-color: #ef4444;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 9999px;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.m3-badge-alert {
  position: absolute;
  top: -3px;
  right: 8px;
  background-color: #dc2626;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-badge 1.5s infinite;
}

@keyframes pulse-badge {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Material Design 3 Cards, Surfaces & Chips (Manual Vuetify / Quasar Style) */
.m3-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1), border-color 0.2s ease;
}

.m3-card-elevated {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
}

.m3-card-tonal {
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.m3-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.2, 0, 0, 1);
  user-select: none;
  white-space: nowrap;
}

.m3-chip:hover {
  background-color: rgba(37, 99, 235, 0.08);
  color: var(--text-main);
  border-color: rgba(37, 99, 235, 0.2);
}

.m3-chip:active {
  transform: scale(0.95);
}

.m3-chip.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
}

@media (max-width: 768px) {
  .sidebar-nav {
    display: none;
  }
  .main-content {
    margin-left: 0 !important;
    padding-bottom: 84px !important;
  }
  .main-view-viewport {
    padding-left: 12px !important;
    padding-right: 12px !important;
    padding-bottom: 30px !important;
  }
}

@media print {
  /* 1. Completely hide all navigation, headers, footers, notifications, buttons, and form panels */
  .sidebar-nav,
  .top-header,
  .mobile-bottom-bar,
  .no-print,
  .print-hide,
  .app-notifications,
  .offcanvas-overlay,
  .mobile-drawer,
  .modal,
  .toast,
  .swal2-container,
  .btn,
  .nav-pills,
  .nav-tabs,
  .form-switch,
  .alert,
  header,
  aside,
  footer {
    display: none !important;
  }

  /* 2. Reset html, body, and top-level containers for full page printing */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .app-container,
  #app,
  .main-content {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    width: 100% !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }

  .container-fluid,
  .container {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .row {
    margin: 0 !important;
    display: block !important;
  }

  .col-12, .col-lg-5, .col-lg-6, .col-lg-7, .col-md-6 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* 3. Page break and formatting utilities */
  .page-break-always {
    page-break-after: always !important;
    break-after: page !important;
  }

  .print-page-break {
    page-break-after: always !important;
    break-after: page !important;
    display: block !important;
  }

  .print-page-break:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .no-break {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* 4. Remove shadows and borders from cards during print */
  .card, .shadow, .shadow-sm {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
  }
}
</style>
