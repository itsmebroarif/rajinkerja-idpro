<template>
  <div 
    class="dex-os-workspace"
    :class="[`wallpaper-${currentWallpaper}`, { 'is-fullscreen': isWindowMaximized }]"
    @click="handleDesktopClick"
    @contextmenu.prevent="openContextMenu($event, 'desktop')"
  >
    <!-- Desktop Background Canvas / Wallpaper -->
    <div class="dex-wallpaper-layer">
      <!-- Subtle Samsung DeX Cosmic Glow Orbs -->
      <div class="dex-glow-orb dex-glow-1"></div>
      <div class="dex-glow-orb dex-glow-2"></div>
      <div class="dex-grid-pattern"></div>
    </div>

    <!-- Desktop Watermark & Brand Widget (Samsung DeX Style) -->
    <div class="dex-desktop-header-brand d-none d-md-flex align-items-center justify-content-between px-4 pt-3">
      <div class="d-flex align-items-center gap-2.5 dex-brand-pill">
        <div class="dex-samsung-badge">
          <i class="bi bi-display me-1 text-info"></i>
          <span>DeX MODE</span>
        </div>
        <div class="text-white-50 small">
          <strong class="text-white">TaskArts OS</strong> &bull; Workspace Aktif by Kafeinarts
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button 
          @click.stop="openWallpaperModal = true" 
          class="btn btn-sm dex-glass-btn text-white rounded-pill px-3 py-1 d-flex align-items-center gap-1.5"
          title="Ganti Wallpaper DeX"
        >
          <i class="bi bi-image"></i>
          <span class="small d-none d-lg-inline">Wallpaper</span>
        </button>

        <button 
          @click.stop="exitDesktopMode" 
          class="btn btn-sm dex-exit-btn text-white rounded-pill px-3 py-1 d-flex align-items-center gap-1.5"
          title="Kembali ke Mode Aplikasi Biasa"
        >
          <i class="bi bi-arrow-return-left"></i>
          <span class="small fw-semibold">Keluar DeX (Mode App)</span>
        </button>
      </div>
    </div>

    <!-- SAMSUNG DeX DESKTOP ICONS GRID (PERSIS MIRIP SAMSUNG DeX) -->
    <!-- In Samsung DeX, icons flow in vertical columns starting from top-left -->
    <div class="dex-icons-column-grid" @click.self="selectedIconId = null">
      <div
        v-for="app in desktopApps"
        :key="app.id"
        class="dex-app-icon-item"
        :class="{ 'is-selected': selectedIconId === app.id, 'is-open': isAppOpen(app.to) }"
        @click.stop="selectAppIcon(app)"
        @dblclick.stop="launchApp(app)"
        @contextmenu.prevent.stop="openContextMenu($event, 'icon', app)"
        :title="`${app.name} (${app.badge || 'Aplikasi'}) - Klik 2x untuk buka`"
      >
        <div class="dex-icon-squircle shadow-sm" :style="{ '--app-accent': app.color }">
          <i :class="app.icon" class="dex-app-icon"></i>
          <span v-if="app.badgeCount && app.badgeCount()" class="dex-icon-badge">
            {{ app.badgeCount() }}
          </span>
          <span v-else-if="app.badgeDot" class="dex-icon-badge-dot"></span>
        </div>
        <span class="dex-app-label text-truncate">{{ app.name }}</span>
      </div>
    </div>

    <!-- ACTIVE WINDOW FRAME (WINDOWS & SAMSUNG DeX STYLE) -->
    <transition name="dex-window-pop">
      <div 
        v-if="currentOpenWindow && !isWindowMinimized"
        class="dex-window-container shadow-2xl"
        :class="{ 
          'is-maximized': isWindowMaximized, 
          'is-floating': !isWindowMaximized,
          'is-focused': true
        }"
        :style="floatingWindowStyle"
        @click.stop="bringToFront"
      >
        <!-- Window Titlebar (Header) -->
        <div 
          class="dex-window-titlebar d-flex align-items-center justify-content-between px-3"
          @dblclick="toggleMaximize"
          @mousedown="startWindowDrag"
        >
          <!-- Left: App Icon & Title -->
          <div class="d-flex align-items-center gap-2 overflow-hidden user-select-none">
            <div class="dex-titlebar-icon-box" :style="{ backgroundColor: currentOpenWindow.color }">
              <i :class="currentOpenWindow.icon" class="text-white fs-7"></i>
            </div>
            <div class="lh-1 text-truncate">
              <span class="fw-bold fs-7 text-white d-block text-truncate">{{ currentOpenWindow.name }}</span>
              <small class="text-white-50" style="font-size: 10px;">{{ currentOpenWindow.category }} &bull; TaskArts Window</small>
            </div>
          </div>

          <!-- Middle: Window Route Breadcrumb / Quick Actions -->
          <div class="d-none d-md-flex align-items-center gap-2">
            <span class="badge dex-window-badge text-white-50">
              <i class="bi bi-link-45deg me-1"></i>{{ currentOpenWindow.to }}
            </span>
          </div>

          <!-- Right: Windows / DeX Control Buttons (Minimize, Maximize/Restore, Close) -->
          <div class="dex-window-controls d-flex align-items-center gap-1.5 user-select-none">
            <!-- Minimize Button -->
            <button 
              type="button" 
              class="dex-win-btn btn-minimize" 
              @click.stop="minimizeWindow" 
              title="Minimalkan ke Taskbar (_)"
            >
              <i class="bi bi-dash-lg"></i>
            </button>

            <!-- Maximize / Restore Button -->
            <button 
              type="button" 
              class="dex-win-btn btn-maximize" 
              @click.stop="toggleMaximize" 
              :title="isWindowMaximized ? 'Pulihkan Ukuran Jendela' : 'Perbesar Jendela Maksimal (□)'"
            >
              <i :class="isWindowMaximized ? 'bi bi-window-stack' : 'bi bi-square'"></i>
            </button>

            <!-- Close Button -->
            <button 
              type="button" 
              class="dex-win-btn btn-close-win" 
              @click.stop="closeWindow" 
              title="Tutup Jendela (✕)"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Window Sub-Header / Quick Toolbar -->
        <div class="dex-window-subbar d-flex align-items-center justify-content-between px-3 py-1.5 border-bottom">
          <div class="d-flex align-items-center gap-2 overflow-auto text-nowrap">
            <button 
              v-for="app in runningWindows" 
              :key="app.id"
              @click.stop="switchActiveWindow(app)"
              class="dex-win-tab-pill d-flex align-items-center gap-1.5"
              :class="{ 'is-active': currentOpenWindow.id === app.id }"
            >
              <i :class="app.icon" class="fs-7" :style="{ color: app.color }"></i>
              <span class="small fw-medium">{{ app.name }}</span>
              <span 
                class="dex-tab-close-icon ms-1" 
                @click.stop="removeRunningWindow(app.id)"
                title="Tutup Tab"
              >
                &times;
              </span>
            </button>
          </div>

          <div class="d-flex align-items-center gap-1.5 ms-2 flex-shrink-0">
            <button 
              class="btn btn-sm dex-tiny-btn text-muted" 
              @click="reloadActiveComponent" 
              title="Muat Ulang Jendela"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button 
              class="btn btn-sm dex-tiny-btn text-muted" 
              @click="openInExternalView" 
              title="Buka Layar Penuh Standar"
            >
              <i class="bi bi-box-arrow-up-right"></i>
            </button>
          </div>
        </div>

        <!-- Window Scrollable Viewport Body (Hosts the Vue Router View Content) -->
        <div class="dex-window-body" id="dex-window-body-element">
          <slot></slot>
        </div>
      </div>
    </transition>

    <!-- SAMSUNG DeX APPS LAUNCHER DRAWER (9 DOTS START MENU) -->
    <transition name="dex-drawer-slide">
      <div 
        v-if="isAppsDrawerOpen" 
        class="dex-apps-launcher-drawer shadow-2xl"
        @click.stop
      >
        <!-- Drawer Header with Search & Profile -->
        <div class="dex-drawer-header p-3 border-bottom">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2.5">
              <div class="dex-user-avatar shadow-sm">
                <span>K</span>
              </div>
              <div class="lh-1">
                <span class="fw-bold text-white fs-6 d-block">Kafeinarts Workspace</span>
                <small class="text-white-50" style="font-size: 11px;">Arif Permana &bull; DeX App Drawer</small>
              </div>
            </div>

            <div class="d-flex align-items-center gap-1.5">
              <button 
                @click="exitDesktopMode" 
                class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 text-white border-danger-subtle d-flex align-items-center gap-1"
                style="font-size: 11px;"
                title="Keluar ke Mode App"
              >
                <i class="bi bi-power"></i> Keluar DeX
              </button>
              <button 
                @click="isAppsDrawerOpen = false" 
                class="btn btn-sm btn-light border-0 rounded-circle text-muted p-1"
                title="Tutup Menu"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <!-- Live Search Input -->
          <div class="dex-drawer-search-box d-flex align-items-center rounded-pill px-3 py-1.5">
            <i class="bi bi-search text-white-50 me-2"></i>
            <input 
              v-model="drawerSearchQuery"
              ref="drawerSearchInput"
              type="text" 
              class="dex-search-input flex-grow-1 border-0 bg-transparent text-white shadow-none" 
              placeholder="Cari semua aplikasi, fitur, atau modul..."
            />
            <button 
              v-if="drawerSearchQuery" 
              @click="drawerSearchQuery = ''" 
              class="btn btn-link text-white-50 p-0 text-decoration-none"
            >
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </div>

          <!-- Category Filter Pills -->
          <div class="d-flex align-items-center gap-1.5 mt-2.5 overflow-auto pb-1 text-nowrap dex-category-pills">
            <button 
              v-for="cat in drawerCategories" 
              :key="cat.id"
              @click="selectedCategory = cat.id"
              class="btn btn-sm dex-cat-pill"
              :class="{ 'is-active': selectedCategory === cat.id }"
            >
              <i :class="cat.icon" class="me-1"></i>{{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Drawer Apps Grid Body -->
        <div class="dex-drawer-grid-body p-3">
          <div v-if="filteredDrawerApps.length === 0" class="text-center py-5 text-white-50">
            <i class="bi bi-search fs-2 d-block mb-2 opacity-50"></i>
            <span>Tidak ditemukan aplikasi "{{ drawerSearchQuery }}"</span>
          </div>

          <div v-else class="dex-drawer-apps-grid">
            <div 
              v-for="app in filteredDrawerApps" 
              :key="app.id"
              class="dex-drawer-app-card"
              @click="launchAppFromDrawer(app)"
            >
              <div class="dex-drawer-app-icon shadow-sm" :style="{ backgroundColor: app.color }">
                <i :class="app.icon"></i>
              </div>
              <div class="dex-drawer-app-info">
                <span class="dex-drawer-app-name text-truncate">{{ app.name }}</span>
                <span class="dex-drawer-app-cat text-truncate">{{ app.category }}</span>
              </div>
              <span v-if="isAppOpen(app.to)" class="dex-running-dot" title="Aplikasi sedang berjalan"></span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- SAMSUNG DeX QUICK SETTINGS / CALENDAR TRAY POPUP -->
    <transition name="dex-tray-pop">
      <div 
        v-if="isQuickSettingsOpen" 
        class="dex-quick-settings-tray shadow-2xl"
        @click.stop
      >
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
          <div class="lh-1">
            <span class="fw-bold text-white fs-6 d-block">{{ formattedTime }}</span>
            <small class="text-white-50">{{ formattedFullDate }}</small>
          </div>
          <button @click="isQuickSettingsOpen = false" class="btn btn-sm btn-link text-white-50 p-0">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="p-3">
          <!-- Quick Status Tiles (DeX Control Center Style) -->
          <div class="dex-status-tiles-grid mb-3">
            <div 
              class="dex-tile-item"
              :class="{ 'is-active': isWifiOn }"
              @click="isWifiOn = !isWifiOn"
            >
              <i :class="isWifiOn ? 'bi bi-wifi' : 'bi bi-wifi-off'"></i>
              <span>Wi-Fi Online</span>
            </div>

            <div 
              class="dex-tile-item"
              :class="{ 'is-active': isAudioOn }"
              @click="isAudioOn = !isAudioOn"
            >
              <i :class="isAudioOn ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill'"></i>
              <span>{{ isAudioOn ? 'Suara Aktif' : 'Mute' }}</span>
            </div>

            <div 
              class="dex-tile-item"
              :class="{ 'is-active': true }"
              @click="toggleThemeFromDex"
            >
              <i :class="themeModeIcon"></i>
              <span>{{ themeModeLabel }}</span>
            </div>

            <div 
              class="dex-tile-item is-active"
              @click="openWallpaperModal = true; isQuickSettingsOpen = false"
            >
              <i class="bi bi-palette-fill"></i>
              <span>Wallpaper</span>
            </div>
          </div>

          <!-- Brightness & Volume Sliders -->
          <div class="mb-2.5">
            <div class="d-flex justify-content-between text-white-50 small mb-1">
              <span><i class="bi bi-brightness-high me-1"></i>Kecerahan Layar DeX</span>
              <span>{{ brightnessLevel }}%</span>
            </div>
            <input 
              type="range" 
              v-model="brightnessLevel" 
              min="40" 
              max="100" 
              class="form-range dex-slider" 
            />
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between text-white-50 small mb-1">
              <span><i class="bi bi-volume-up me-1"></i>Volume Suara Sistem</span>
              <span>{{ volumeLevel }}%</span>
            </div>
            <input 
              type="range" 
              v-model="volumeLevel" 
              min="0" 
              max="100" 
              class="form-range dex-slider" 
            />
          </div>

          <!-- System Storage & Battery Information -->
          <div class="dex-sys-info-box p-2.5 rounded-3 mb-2">
            <div class="d-flex align-items-center justify-content-between text-white small mb-1.5">
              <span><i class="bi bi-battery-charging text-success me-1"></i>Baterai & Daya</span>
              <span class="text-success fw-bold">100% Terhubung</span>
            </div>
            <div class="d-flex align-items-center justify-content-between text-white small">
              <span><i class="bi bi-hdd-stack text-info me-1"></i>Storage Lokal</span>
              <span class="text-white-50">{{ isStorageFullState ? 'Penuh' : 'Aman (Tersedia)' }}</span>
            </div>
          </div>

          <button 
            @click="exitDesktopMode" 
            class="btn btn-sm btn-danger w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
          >
            <i class="bi bi-box-arrow-left"></i> Keluar dari Mode Desktop (Kembali ke App)
          </button>
        </div>
      </div>
    </transition>

    <!-- RECENT APPS / TASK SWITCHER MODAL -->
    <transition name="dex-modal-fade">
      <div 
        v-if="isTaskSwitcherOpen" 
        class="dex-task-switcher-overlay d-flex align-items-center justify-content-center"
        @click="isTaskSwitcherOpen = false"
      >
        <div class="dex-task-switcher-modal p-4 text-center" @click.stop>
          <div class="d-flex align-items-center justify-content-between mb-3 text-white">
            <h5 class="m-0 fw-bold"><i class="bi bi-window-stack me-2 text-info"></i>Aplikasi Sedang Berjalan</h5>
            <button 
              v-if="runningWindows.length > 0" 
              @click="closeAllWindows" 
              class="btn btn-sm btn-outline-light rounded-pill px-3 py-1"
            >
              Tutup Semua
            </button>
          </div>

          <div v-if="runningWindows.length === 0" class="py-5 text-white-50">
            <i class="bi bi-laptop fs-1 d-block mb-2 opacity-50"></i>
            <p>Tidak ada jendela aplikasi yang aktif.</p>
            <button @click="isTaskSwitcherOpen = false; isAppsDrawerOpen = true" class="btn btn-sm btn-primary rounded-pill px-4">
              Buka Aplikasi dari Launcher
            </button>
          </div>

          <div v-else class="dex-task-cards-row">
            <div 
              v-for="app in runningWindows" 
              :key="app.id"
              class="dex-task-preview-card"
              @click="switchActiveWindow(app); isTaskSwitcherOpen = false"
            >
              <div class="dex-task-card-header d-flex align-items-center justify-content-between p-2">
                <div class="d-flex align-items-center gap-1.5">
                  <i :class="app.icon" :style="{ color: app.color }"></i>
                  <span class="small fw-bold text-white text-truncate">{{ app.name }}</span>
                </div>
                <button 
                  class="btn btn-sm p-0 text-white-50 hover-white" 
                  @click.stop="removeRunningWindow(app.id)"
                >
                  &times;
                </button>
              </div>
              <div class="dex-task-card-body d-flex flex-column align-items-center justify-content-center py-4">
                <div class="dex-task-big-icon mb-2" :style="{ backgroundColor: app.color }">
                  <i :class="app.icon" class="text-white fs-3"></i>
                </div>
                <span class="badge bg-secondary-subtle text-secondary small">{{ app.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- WALLPAPER PICKER MODAL -->
    <transition name="dex-modal-fade">
      <div 
        v-if="openWallpaperModal" 
        class="dex-task-switcher-overlay d-flex align-items-center justify-content-center"
        @click="openWallpaperModal = false"
      >
        <div class="dex-wallpaper-picker-modal p-4" @click.stop>
          <div class="d-flex align-items-center justify-content-between mb-3 text-white border-bottom pb-2.5">
            <h5 class="m-0 fw-bold"><i class="bi bi-palette-fill me-2 text-warning"></i>Pilih Wallpaper Samsung DeX</h5>
            <button @click="openWallpaperModal = false" class="btn btn-sm btn-link text-white-50 p-0">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="dex-wallpaper-grid mb-3">
            <div 
              v-for="wp in wallpaperList" 
              :key="wp.id"
              class="dex-wp-option-card"
              :class="{ 'is-selected': currentWallpaper === wp.id }"
              @click="setWallpaper(wp.id)"
            >
              <div class="dex-wp-preview" :class="`preview-${wp.id}`">
                <i v-if="currentWallpaper === wp.id" class="bi bi-check-circle-fill dex-wp-checked text-primary"></i>
              </div>
              <span class="small fw-semibold text-white d-block mt-1.5 text-center">{{ wp.name }}</span>
            </div>
          </div>

          <div class="text-end">
            <button @click="openWallpaperModal = false" class="btn btn-sm btn-primary rounded-pill px-4 py-1.5">
              Terapkan Wallpaper
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- DESKTOP CONTEXT MENU (RIGHT CLICK) -->
    <div 
      v-if="contextMenu.visible" 
      class="dex-context-menu shadow-2xl"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <template v-if="contextMenu.type === 'desktop'">
        <button class="dex-context-item" @click="refreshDesktop">
          <i class="bi bi-arrow-clockwise me-2 text-info"></i> Segarkan Desktop (Refresh)
        </button>
        <button class="dex-context-item" @click="openWallpaperModal = true; closeContextMenu()">
          <i class="bi bi-image me-2 text-primary"></i> Ganti Wallpaper DeX...
        </button>
        <div class="dex-context-divider"></div>
        <button class="dex-context-item" @click="minimizeAll">
          <i class="bi bi-aspect-ratio me-2 text-warning"></i> Tampilkan Desktop (Minimalkan Semua)
        </button>
        <button class="dex-context-item" @click="restoreActive">
          <i class="bi bi-window me-2 text-success"></i> Tampilkan Jendela Aktif
        </button>
        <div class="dex-context-divider"></div>
        <button class="dex-context-item text-danger" @click="exitDesktopMode">
          <i class="bi bi-box-arrow-left me-2 text-danger"></i> Keluar ke Mode App Standar
        </button>
      </template>

      <template v-else-if="contextMenu.type === 'icon' && contextMenu.targetApp">
        <button class="dex-context-item fw-bold text-white" @click="launchApp(contextMenu.targetApp); closeContextMenu()">
          <i :class="contextMenu.targetApp.icon" class="me-2" :style="{ color: contextMenu.targetApp.color }"></i>
          Buka {{ contextMenu.targetApp.name }}
        </button>
        <button class="dex-context-item" @click="isWindowMaximized = true; launchApp(contextMenu.targetApp); closeContextMenu()">
          <i class="bi bi-window-fullscreen me-2 text-info"></i> Buka Maksimal (Fullscreen)
        </button>
        <div class="dex-context-divider"></div>
        <button class="dex-context-item" @click="closeContextMenu">
          <i class="bi bi-info-circle me-2 text-muted"></i> Kategori: {{ contextMenu.targetApp.category }}
        </button>
      </template>
    </div>

    <!-- SAMSUNG DeX TASKBAR (BOTTOM DOCK BAR) -->
    <nav class="dex-taskbar shadow-2xl user-select-none" @click.stop>
      <!-- LEFT SECTION: DeX 9-Dots Apps Button, Task Switcher, Home Button -->
      <div class="dex-taskbar-left d-flex align-items-center">
        <!-- 1. Apps Launcher Button (DeX 9-Dots Grid) -->
        <button 
          type="button"
          class="dex-taskbar-btn dex-apps-launcher-btn"
          :class="{ 'is-active': isAppsDrawerOpen }"
          @click.stop="toggleAppsDrawer"
          title="Buka Menu Aplikasi (Samsung DeX Apps Drawer)"
        >
          <div class="dex-nine-dots">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
        </button>

        <!-- 2. Recent Apps / Task Switcher Button (DeX ||| Style) -->
        <button 
          type="button"
          class="dex-taskbar-btn"
          :class="{ 'is-active': isTaskSwitcherOpen }"
          @click.stop="toggleTaskSwitcher"
          title="Aplikasi Berjalan / Recent Tasks (|||)"
        >
          <i class="bi bi-window-stack fs-6"></i>
        </button>

        <!-- 3. Home Button (Minimizes all windows to see desktop) -->
        <button 
          type="button"
          class="dex-taskbar-btn"
          @click.stop="minimizeAll"
          title="Tampilkan Desktop (Home)"
        >
          <i class="bi bi-circle fs-6"></i>
        </button>

        <!-- Divider line -->
        <div class="dex-taskbar-divider mx-1"></div>
      </div>

      <!-- MIDDLE SECTION: Running Apps / Window Tabs on Taskbar -->
      <div class="dex-taskbar-middle d-flex align-items-center gap-1 overflow-x-auto">
        <button 
          v-for="app in runningWindows" 
          :key="app.id"
          class="dex-taskbar-app-item d-flex align-items-center gap-2"
          :class="{ 
            'is-active': currentOpenWindow && currentOpenWindow.id === app.id && !isWindowMinimized,
            'is-minimized': isWindowMinimized && currentOpenWindow && currentOpenWindow.id === app.id
          }"
          @click="handleTaskbarAppClick(app)"
          :title="`${app.name} - Klik untuk alihkan / minimalkan`"
        >
          <div class="dex-taskbar-app-icon" :style="{ color: app.color }">
            <i :class="app.icon"></i>
          </div>
          <span class="dex-taskbar-app-title text-truncate d-none d-sm-inline">{{ app.name }}</span>
          <span class="dex-active-indicator"></span>
        </button>
      </div>

      <!-- RIGHT SECTION: DeX System Tray, Clock, Status, & Exit Button -->
      <div class="dex-taskbar-right d-flex align-items-center gap-1">
        <!-- Quick Status Icons (WiFi, Sound, Battery, Theme) -->
        <div class="dex-tray-status-group d-flex align-items-center px-2 py-1 rounded-pill" @click="isQuickSettingsOpen = !isQuickSettingsOpen">
          <i :class="isWifiOn ? 'bi bi-wifi text-white' : 'bi bi-wifi-off text-white-50'" class="fs-7 me-2" title="Wi-Fi"></i>
          <i :class="isAudioOn ? 'bi bi-volume-up text-white' : 'bi bi-volume-mute text-white-50'" class="fs-7 me-2" title="Volume"></i>
          <i class="bi bi-battery-charging text-success fs-7 me-2" title="Baterai 100%"></i>
          <span class="badge bg-danger rounded-pill p-1 me-1" v-if="pendingTasksCount" style="font-size: 8px;">
            {{ pendingTasksCount }}
          </span>
        </div>

        <!-- Clock & Date Box (Click opens quick settings) -->
        <div 
          class="dex-clock-box d-flex flex-column align-items-end justify-content-center px-2.5 py-1 rounded-2 cursor-pointer"
          @click.stop="isQuickSettingsOpen = !isQuickSettingsOpen"
          title="Klik untuk Pengaturan Cepat & Kalender"
        >
          <span class="dex-clock-time fw-bold text-white">{{ formattedTime }}</span>
          <span class="dex-clock-date text-white-50">{{ formattedDate }}</span>
        </div>

        <!-- Prominent Exit DeX Button -->
        <button 
          type="button"
          class="dex-taskbar-exit-btn d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 ms-1"
          @click.stop="exitDesktopMode"
          title="Keluar dari Samsung DeX ke Mode Aplikasi Biasa"
        >
          <i class="bi bi-arrow-return-left text-white"></i>
          <span class="small fw-bold text-white d-none d-md-inline">Keluar DeX</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'DesktopDexWorkspace',
  emits: ['exit-desktop-mode'],
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    // Wallpaper Management
    const defaultWp = localStorage.getItem('ft_dex_wallpaper') || 'dex-cosmic';
    const currentWallpaper = ref(defaultWp);
    const openWallpaperModal = ref(false);

    const wallpaperList = [
      { id: 'dex-cosmic', name: 'DeX Cosmic Blue' },
      { id: 'dex-nebula', name: 'Galaxy Nebula Dark' },
      { id: 'dex-emerald', name: 'Emerald Aurora OneUI' },
      { id: 'dex-graphite', name: 'Graphite Windows Dark' },
      { id: 'dex-sunset', name: 'Twilight Purple Glow' }
    ];

    const setWallpaper = (wpId) => {
      currentWallpaper.value = wpId;
      localStorage.setItem('ft_dex_wallpaper', wpId);
      openWallpaperModal.value = false;
    };

    // System Status States
    const isWifiOn = ref(true);
    const isAudioOn = ref(true);
    const brightnessLevel = ref(100);
    const volumeLevel = ref(80);
    const isStorageFullState = computed(() => store.getters.isStorageFull || false);
    const pendingTasksCount = computed(() => store.getters.pendingTasksCount || 0);

    // Clock state
    const currentTime = ref(new Date());
    let timerInterval = null;

    onMounted(() => {
      timerInterval = setInterval(() => {
        currentTime.value = new Date();
      }, 1000);
    });

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval);
    });

    const formattedTime = computed(() => {
      return currentTime.value.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    });

    const formattedDate = computed(() => {
      return currentTime.value.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      });
    });

    const formattedFullDate = computed(() => {
      return currentTime.value.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    });

    // Theme Management
    const themeMode = computed(() => store.getters.getThemeMode || 'light');
    const themeModeIcon = computed(() => {
      if (themeMode.value === 'oled') return 'bi-circle-fill text-dark';
      if (themeMode.value === 'dark') return 'bi-moon-stars-fill text-info';
      return 'bi-sun-fill text-warning';
    });
    const themeModeLabel = computed(() => {
      if (themeMode.value === 'oled') return 'OLED Black';
      if (themeMode.value === 'dark') return 'Dark Mode';
      return 'Light Mode';
    });

    const toggleThemeFromDex = () => {
      let next = 'light';
      if (themeMode.value === 'light') next = 'dark';
      else if (themeMode.value === 'dark') next = 'oled';
      else next = 'light';
      store.dispatch('setThemeMode', next);
    };

    // Desktop Apps Registry (Organized in vertical columns just like Samsung DeX)
    const desktopApps = [
      // Column 1: Core Office & Workspace
      { id: 'dashboard', name: 'Dashboard', to: '/', icon: 'bi-grid-1x2-fill', color: '#2563eb', category: 'Workspace' },
      { id: 'todo', name: 'To-Do & Kanban', to: '/todo', icon: 'bi-kanban-fill', color: '#f59e0b', category: 'Workspace', badgeCount: () => pendingTasksCount.value },
      { id: 'project', name: 'Proyek & Kontrak', to: '/project', icon: 'bi-briefcase-fill', color: '#0284c7', category: 'Workspace' },
      { id: 'job-tracker', name: 'Lamaran Kerja', to: '/job-tracker', icon: 'bi-briefcase-fill', color: '#0ea5e9', category: 'Workspace' },
      { id: 'medium-draft', name: 'Medium Draft', to: '/medium-draft', icon: 'bi-medium', color: '#10b981', category: 'Workspace' },
      { id: 'surat', name: 'Surat Generator', to: '/surat', icon: 'bi-file-earmark-richtext-fill', color: '#2563eb', category: 'Workspace' },

      // Column 2: Financial & Accounting (PSAK/IFRS)
      { id: 'finance-cashflow', name: 'Arus Kas Bank', to: '/finance-cashflow', icon: 'bi-cash-coin', color: '#2563eb', category: 'Keuangan' },
      { id: 'finance-reports', name: 'Laporan PSAK', to: '/finance-reports', icon: 'bi-file-earmark-spreadsheet-fill', color: '#0284c7', category: 'Keuangan' },
      { id: 'finance-ap-ar', name: 'Hutang / Piutang', to: '/finance-ap-ar', icon: 'bi-arrow-left-right', color: '#059669', category: 'Keuangan' },
      { id: 'finance-expenses', name: 'OCR & Klaim Biaya', to: '/finance-expenses', icon: 'bi-receipt-cutoff', color: '#ea580c', category: 'Keuangan' },
      { id: 'finance-budgeting', name: 'Anggaran Bisnis', to: '/finance-budgeting', icon: 'bi-pie-chart-fill', color: '#7c3aed', category: 'Keuangan' },
      { id: 'finance-security', name: 'Audit & Keamanan', to: '/finance-security', icon: 'bi-shield-lock-fill', color: '#dc2626', category: 'Keuangan' },

      // Column 3: Team Collaboration & Google Workspace
      { id: 'contacts', name: 'Kontak & Google Hub', to: '/contacts', icon: 'bi-person-lines-fill', color: '#16a34a', category: 'Tim', badgeText: 'Google' },
      { id: 'team-bulletin', name: '1. Buletin Internal', to: '/team-bulletin', icon: 'bi-megaphone-fill', color: '#2563eb', category: 'Tim' },
      { id: 'team-channels', name: '2. Saluran Diskusi', to: '/team-channels', icon: 'bi-hash', color: '#0ea5e9', category: 'Tim' },
      { id: 'team-assets', name: '3. Aset Bersama', to: '/team-assets', icon: 'bi-folder-symlink-fill', color: '#10b981', category: 'Tim' },
      { id: 'team-ticketing', name: '4. Tiket Permintaan', to: '/team-ticketing', icon: 'bi-ticket-perforated-fill', color: '#f59e0b', category: 'Tim' },
      { id: 'team-calendar', name: '5. Google Cal Tim', to: '/team-calendar', icon: 'bi-calendar-check-fill', color: '#4f46e5', category: 'Tim' },
      { id: 'team-expertise', name: '6. Direktori Tim', to: '/team-expertise', icon: 'bi-award-fill', color: '#e11d48', category: 'Tim' },

      // Column 4: Productivity Tools
      { id: 'chat-ai', name: 'AI Assistant', to: '/chat-ai', icon: 'bi-robot', color: '#0891b2', category: 'Produktivitas' },
      { id: 'cv', name: 'CV & Resume ATS', to: '/cv', icon: 'bi-person-vcard-fill', color: '#059669', category: 'Produktivitas' },
      { id: 'camera', name: 'Kamera & Scan', to: '/camera', icon: 'bi-camera-fill', color: '#e11d48', category: 'Produktivitas' },
      { id: 'quick-capture', name: 'Quick Capture', to: '/quick-capture', icon: 'bi-lightning-charge-fill', color: '#f59e0b', category: 'Produktivitas' },
      { id: 'calendar', name: 'Kalender Kerja', to: '/calendar', icon: 'bi-calendar3', color: '#ea580c', category: 'Produktivitas' },
      { id: 'time-suite', name: 'Time & Pomodoro', to: '/time-suite', icon: 'bi-clock-history', color: '#16a34a', category: 'Produktivitas' },

      // Column 5: Personal & System
      { id: 'auth', name: 'Akun & Role', to: '/auth', icon: 'bi-shield-lock-fill', color: '#4f46e5', category: 'Sistem' },
      { id: 'drive-vault', name: 'Google Drive', to: '/drive-vault', icon: 'bi-google', color: '#10b981', category: 'Sistem' },
      { id: 'notes', name: 'Sticky Notes', to: '/notes', icon: 'bi-journal-text', color: '#64748b', category: 'Tools' },
      { id: 'diary', name: 'Jurnal Cerita', to: '/diary', icon: 'bi-book-half', color: '#ca8a04', category: 'Tools' },
      { id: 'code-notes', name: 'Code Snippets', to: '/code-notes', icon: 'bi-code-slash', color: '#0284c7', category: 'Tools' },
      { id: 'games', name: 'Games 3D', to: '/games', icon: 'bi-controller', color: '#9333ea', category: 'Tools' },
      { id: 'storage', name: 'Storage & Kuota', to: '/storage', icon: 'bi-hdd-stack-fill', color: '#0284c7', category: 'Sistem' },
      { id: 'preferences', name: 'Pengaturan DeX', to: '/preferences', icon: 'bi-sliders', color: '#2563eb', category: 'Sistem' }
    ];

    // Window Management State
    const selectedIconId = ref(null);
    const isWindowMaximized = ref(true);
    const isWindowMinimized = ref(false);
    const isAppsDrawerOpen = ref(false);
    const isQuickSettingsOpen = ref(false);
    const isTaskSwitcherOpen = ref(false);

    // Context Menu State
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      type: 'desktop',
      targetApp: null
    });

    const openContextMenu = (e, type, app = null) => {
      contextMenu.value = {
        visible: true,
        x: Math.min(e.clientX, window.innerWidth - 220),
        y: Math.min(e.clientY, window.innerHeight - 250),
        type,
        targetApp: app
      };
      isAppsDrawerOpen.value = false;
      isQuickSettingsOpen.value = false;
    };

    const closeContextMenu = () => {
      contextMenu.value.visible = false;
    };

    const handleDesktopClick = () => {
      closeContextMenu();
      isAppsDrawerOpen.value = false;
      isQuickSettingsOpen.value = false;
      selectedIconId.value = null;
    };

    // Find current app from route
    const getAppForRoute = (path) => {
      const match = desktopApps.find(a => a.to === path);
      if (match) return match;
      const prefixMatch = desktopApps.find(a => a.to !== '/' && path.startsWith(a.to));
      if (prefixMatch) return prefixMatch;
      return desktopApps[0]; // fallback to Dashboard
    };

    const runningWindows = ref([getAppForRoute(route.path)]);
    const currentOpenWindow = ref(getAppForRoute(route.path));

    // Watch route changes to sync active window
    watch(() => route.path, (newPath) => {
      const app = getAppForRoute(newPath);
      if (!runningWindows.value.some(w => w.id === app.id)) {
        runningWindows.value.push(app);
      }
      currentOpenWindow.value = app;
      isWindowMinimized.value = false;
    });

    const isAppOpen = (toPath) => {
      return runningWindows.value.some(w => w.to === toPath);
    };

    const selectAppIcon = (app) => {
      selectedIconId.value = app.id;
    };

    const launchApp = (app) => {
      selectedIconId.value = app.id;
      if (!runningWindows.value.some(w => w.id === app.id)) {
        runningWindows.value.push(app);
      }
      currentOpenWindow.value = app;
      isWindowMinimized.value = false;
      if (route.path !== app.to) {
        router.push(app.to);
      }
      closeContextMenu();
    };

    const launchAppFromDrawer = (app) => {
      isAppsDrawerOpen.value = false;
      launchApp(app);
    };

    const switchActiveWindow = (app) => {
      currentOpenWindow.value = app;
      isWindowMinimized.value = false;
      if (route.path !== app.to) {
        router.push(app.to);
      }
    };

    const removeRunningWindow = (appId) => {
      runningWindows.value = runningWindows.value.filter(w => w.id !== appId);
      if (currentOpenWindow.value && currentOpenWindow.value.id === appId) {
        if (runningWindows.value.length > 0) {
          switchActiveWindow(runningWindows.value[runningWindows.value.length - 1]);
        } else {
          currentOpenWindow.value = null;
        }
      }
    };

    const closeAllWindows = () => {
      runningWindows.value = [];
      currentOpenWindow.value = null;
      isTaskSwitcherOpen.value = false;
    };

    const minimizeWindow = () => {
      isWindowMinimized.value = true;
    };

    const toggleMaximize = () => {
      isWindowMaximized.value = !isWindowMaximized.value;
    };

    const closeWindow = () => {
      if (currentOpenWindow.value) {
        removeRunningWindow(currentOpenWindow.value.id);
      }
    };

    const minimizeAll = () => {
      isWindowMinimized.value = true;
      isAppsDrawerOpen.value = false;
      isQuickSettingsOpen.value = false;
    };

    const restoreActive = () => {
      if (currentOpenWindow.value) {
        isWindowMinimized.value = false;
      } else if (runningWindows.value.length > 0) {
        switchActiveWindow(runningWindows.value[0]);
      } else {
        launchApp(desktopApps[0]);
      }
      closeContextMenu();
    };

    const bringToFront = () => {
      isWindowMinimized.value = false;
    };

    const handleTaskbarAppClick = (app) => {
      if (currentOpenWindow.value && currentOpenWindow.value.id === app.id) {
        // Toggle minimize/restore if already active
        isWindowMinimized.value = !isWindowMinimized.value;
      } else {
        switchActiveWindow(app);
      }
    };

    const toggleAppsDrawer = () => {
      isAppsDrawerOpen.value = !isAppsDrawerOpen.value;
      isQuickSettingsOpen.value = false;
      isTaskSwitcherOpen.value = false;
      closeContextMenu();
    };

    const toggleTaskSwitcher = () => {
      isTaskSwitcherOpen.value = !isTaskSwitcherOpen.value;
      isAppsDrawerOpen.value = false;
      isQuickSettingsOpen.value = false;
      closeContextMenu();
    };

    const refreshDesktop = () => {
      closeContextMenu();
      const temp = currentWallpaper.value;
      currentWallpaper.value = '';
      nextTick(() => {
        currentWallpaper.value = temp;
      });
    };

    const reloadActiveComponent = () => {
      const current = route.fullPath;
      router.replace('/empty').then(() => {
        router.replace(current);
      }).catch(() => {
        window.location.reload();
      });
    };

    const openInExternalView = () => {
      emit('exit-desktop-mode');
    };

    const exitDesktopMode = () => {
      emit('exit-desktop-mode');
    };

    // Apps Drawer Categorization & Search Filter
    const drawerSearchQuery = ref('');
    const selectedCategory = ref('all');

    const drawerCategories = [
      { id: 'all', label: 'Semua', icon: 'bi-grid-fill' },
      { id: 'Workspace', label: 'Workspace', icon: 'bi-briefcase-fill' },
      { id: 'Keuangan', label: 'Keuangan', icon: 'bi-cash-coin' },
      { id: 'Tim', label: 'Tim & Kolaborasi', icon: 'bi-people-fill' },
      { id: 'Produktivitas', label: 'Produktivitas', icon: 'bi-lightning-fill' },
      { id: 'Tools', label: 'Tools', icon: 'bi-tools' },
      { id: 'Sistem', label: 'Sistem', icon: 'bi-gear-fill' }
    ];

    const filteredDrawerApps = computed(() => {
      let list = desktopApps;
      if (selectedCategory.value !== 'all') {
        list = list.filter(a => a.category === selectedCategory.value);
      }
      const q = drawerSearchQuery.value.trim().toLowerCase();
      if (!q) return list;
      return list.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.category.toLowerCase().includes(q) ||
        a.to.toLowerCase().includes(q)
      );
    });

    // Window Dragging Implementation
    const floatingWindowStyle = computed(() => {
      if (isWindowMaximized.value) return {};
      return {
        width: '92vw',
        maxWidth: '1240px',
        height: '84vh',
        maxHeight: '820px'
      };
    });

    const startWindowDrag = (e) => {
      // Basic dragging support for floating window
      if (isWindowMaximized.value) return;
      // Allow user to position if needed
    };

    return {
      currentWallpaper,
      wallpaperList,
      setWallpaper,
      openWallpaperModal,
      isWifiOn,
      isAudioOn,
      brightnessLevel,
      volumeLevel,
      isStorageFullState,
      pendingTasksCount,
      formattedTime,
      formattedDate,
      formattedFullDate,
      themeMode,
      themeModeIcon,
      themeModeLabel,
      toggleThemeFromDex,
      desktopApps,
      selectedIconId,
      isWindowMaximized,
      isWindowMinimized,
      isAppsDrawerOpen,
      isQuickSettingsOpen,
      isTaskSwitcherOpen,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      handleDesktopClick,
      runningWindows,
      currentOpenWindow,
      isAppOpen,
      selectAppIcon,
      launchApp,
      launchAppFromDrawer,
      switchActiveWindow,
      removeRunningWindow,
      closeAllWindows,
      minimizeWindow,
      toggleMaximize,
      closeWindow,
      minimizeAll,
      restoreActive,
      bringToFront,
      handleTaskbarAppClick,
      toggleAppsDrawer,
      toggleTaskSwitcher,
      refreshDesktop,
      reloadActiveComponent,
      openInExternalView,
      exitDesktopMode,
      drawerSearchQuery,
      selectedCategory,
      drawerCategories,
      filteredDrawerApps,
      floatingWindowStyle,
      startWindowDrag
    };
  }
};
</script>

<style scoped>
/* =========================================================
   SAMSUNG DeX DESKTOP WORKSPACE STYLES
   ========================================================= */
.dex-os-workspace {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  overflow: hidden;
  background-color: #090e17;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  user-select: none;
  display: flex;
  flex-direction: column;
}

/* Wallpapers */
.wallpaper-dex-cosmic {
  background: radial-gradient(circle at 80% 20%, #1e1b4b 0%, #0f172a 50%, #020617 100%);
}

.wallpaper-dex-nebula {
  background: radial-gradient(circle at 20% 80%, #311042 0%, #090d16 60%, #020408 100%);
}

.wallpaper-dex-emerald {
  background: radial-gradient(circle at 70% 30%, #064e3b 0%, #022c22 45%, #050505 100%);
}

.wallpaper-dex-graphite {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%);
}

.wallpaper-dex-sunset {
  background: radial-gradient(circle at 50% 10%, #4c0519 0%, #1e1b4b 55%, #030712 100%);
}

.dex-wallpaper-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.dex-glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.dex-glow-1 {
  top: 10%;
  right: 15%;
  width: 380px;
  height: 380px;
  background: #3b82f6;
}

.dex-glow-2 {
  bottom: 20%;
  left: 10%;
  width: 320px;
  height: 320px;
  background: #8b5cf6;
}

.dex-grid-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.4;
}

/* Desktop Header Brand Bar */
.dex-desktop-header-brand {
  position: relative;
  z-index: 10;
  height: 48px;
}

.dex-samsung-badge {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 3px 10px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dex-glass-btn {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.2s ease;
}

.dex-glass-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
}

.dex-exit-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.4);
  transition: all 0.2s ease;
}

.dex-exit-btn:hover {
  background: linear-gradient(135deg, #f87171, #ef4444);
  transform: translateY(-1px);
}

/* =========================================================
   SAMSUNG DeX DESKTOP ICONS GRID
   Vertical columns flowing from top to bottom (Left to Right)
   ========================================================= */
.dex-icons-column-grid {
  position: absolute;
  top: 56px;
  left: 20px;
  bottom: 60px;
  right: 20px;
  z-index: 5;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, 92px);
  grid-auto-columns: 88px;
  gap: 12px 10px;
  align-content: start;
  pointer-events: auto;
}

.dex-app-icon-item {
  width: 86px;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  position: relative;
}

.dex-app-icon-item:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
}

.dex-app-icon-item.is-selected {
  background: rgba(59, 130, 246, 0.3);
  outline: 1px solid rgba(147, 197, 253, 0.6);
}

.dex-icon-squircle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--app-accent), rgba(15, 23, 42, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease;
}

.dex-app-icon-item:hover .dex-icon-squircle {
  transform: scale(1.06);
}

.dex-app-icon {
  font-size: 22px;
  color: #ffffff;
}

.dex-icon-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  border: 2px solid #0f172a;
}

.dex-icon-badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  background: #3b82f6;
  border-radius: 50%;
  border: 2px solid #0f172a;
}

.dex-app-label {
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.8);
  max-width: 82px;
  text-align: center;
}

/* =========================================================
   WINDOWS & DeX WINDOW SYSTEM
   ========================================================= */
.dex-window-container {
  position: absolute;
  z-index: 50;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(28px);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
  transition: border-radius 0.2s ease;
}

.dex-window-container.is-maximized {
  top: 0;
  left: 0;
  right: 0;
  bottom: 52px;
  width: 100vw !important;
  height: calc(100vh - 52px) !important;
  max-width: 100vw !important;
  max-height: calc(100vh - 52px) !important;
  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}

.dex-window-container.is-floating {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.dex-window-titlebar {
  height: 44px;
  background: rgba(2, 6, 23, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  cursor: grab;
}

.dex-titlebar-icon-box {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dex-window-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
}

.dex-win-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s ease;
}

.dex-win-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.dex-win-btn.btn-close-win:hover {
  background: #ef4444;
  color: #ffffff;
}

.dex-window-subbar {
  background: rgba(15, 23, 42, 0.9);
  height: 38px;
  flex-shrink: 0;
}

.dex-win-tab-pill {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 12px;
}

.dex-win-tab-pill.is-active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #ffffff;
  font-weight: 600;
}

.dex-tab-close-icon {
  opacity: 0.6;
  font-size: 14px;
}

.dex-tab-close-icon:hover {
  opacity: 1;
  color: #ef4444;
}

.dex-tiny-btn {
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.dex-tiny-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Window Content Body (Houses the Vue View / Component) */
.dex-window-body {
  flex-grow: 1;
  overflow-y: auto;
  background: var(--bs-body-bg, #f8fafc);
  color: var(--bs-body-color, #0f172a);
}

/* Dark/OLED mode support for window body */
:global(.dark-mode) .dex-window-body {
  background-color: #090d16 !important;
  color: #f1f5f9 !important;
}

:global(.oled-theme) .dex-window-body {
  background-color: #000000 !important;
  color: #ffffff !important;
}

/* =========================================================
   SAMSUNG DeX TASKBAR (BOTTOM BAR)
   ========================================================= */
.dex-taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: rgba(10, 15, 29, 0.92);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 100;
}

.dex-taskbar-left {
  gap: 2px;
}

.dex-taskbar-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  cursor: pointer;
}

.dex-taskbar-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.dex-taskbar-btn.is-active {
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}

/* Samsung DeX Iconic 9-Dots App Launcher Icon */
.dex-nine-dots {
  display: grid;
  grid-template-columns: repeat(3, 4px);
  grid-template-rows: repeat(3, 4px);
  gap: 3.5px;
}

.dex-nine-dots span {
  width: 4px;
  height: 4px;
  background-color: #ffffff;
  border-radius: 1px;
}

.dex-taskbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
}

/* Middle: Running Apps Items on Taskbar */
.dex-taskbar-middle {
  flex-grow: 1;
  padding: 0 8px;
}

.dex-taskbar-app-item {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  max-width: 170px;
}

.dex-taskbar-app-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.dex-taskbar-app-item.is-active {
  background: rgba(59, 130, 246, 0.22);
  border-color: rgba(59, 130, 246, 0.4);
  color: #ffffff;
  font-weight: 600;
}

.dex-taskbar-app-item.is-minimized {
  opacity: 0.65;
}

.dex-active-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  border-radius: 2px;
  background: transparent;
}

.dex-taskbar-app-item.is-active .dex-active-indicator {
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

/* Right: System Tray */
.dex-tray-status-group {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.15s ease;
}

.dex-tray-status-group:hover {
  background: rgba(255, 255, 255, 0.12);
}

.dex-clock-box {
  line-height: 1.1;
  transition: background 0.15s ease;
}

.dex-clock-box:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dex-clock-time {
  font-size: 12px;
}

.dex-clock-date {
  font-size: 10px;
}

.dex-taskbar-exit-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  cursor: pointer;
  transition: all 0.15s ease;
}

.dex-taskbar-exit-btn:hover {
  background: #dc2626;
  border-color: #ef4444;
}

/* =========================================================
   DeX APPS LAUNCHER DRAWER (START MENU)
   ========================================================= */
.dex-apps-launcher-drawer {
  position: absolute;
  bottom: 58px;
  left: 10px;
  width: 440px;
  max-width: calc(100vw - 20px);
  height: 560px;
  max-height: calc(100vh - 70px);
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  backdrop-filter: blur(32px);
  z-index: 150;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dex-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  color: white;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dex-drawer-search-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dex-cat-pill {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 11px;
  padding: 3px 10px;
  transition: all 0.15s ease;
}

.dex-cat-pill.is-active {
  background: #2563eb;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
}

.dex-drawer-grid-body {
  flex-grow: 1;
  overflow-y: auto;
}

.dex-drawer-apps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.dex-drawer-app-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}

.dex-drawer-app-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.dex-drawer-app-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.dex-drawer-app-info {
  line-height: 1.2;
  overflow: hidden;
}

.dex-drawer-app-name {
  font-size: 12.5px;
  font-weight: 600;
  color: white;
  display: block;
}

.dex-drawer-app-cat {
  font-size: 10px;
  color: #94a3b8;
  display: block;
}

.dex-running-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: #38bdf8;
  border-radius: 50%;
  box-shadow: 0 0 6px #38bdf8;
}

/* =========================================================
   DeX QUICK SETTINGS TRAY POPUP
   ========================================================= */
.dex-quick-settings-tray {
  position: absolute;
  bottom: 58px;
  right: 10px;
  width: 320px;
  max-width: calc(100vw - 20px);
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  backdrop-filter: blur(32px);
  z-index: 150;
  overflow: hidden;
}

.dex-status-tiles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.dex-tile-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dex-tile-item.is-active {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
  color: white;
}

.dex-slider {
  height: 6px;
  accent-color: #38bdf8;
}

.dex-sys-info-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* =========================================================
   TASK SWITCHER / MODALS
   ========================================================= */
.dex-task-switcher-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  z-index: 200;
}

.dex-task-switcher-modal {
  width: 750px;
  max-width: 95vw;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.dex-task-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 480px;
  overflow-y: auto;
}

.dex-task-preview-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.dex-task-preview-card:hover {
  transform: translateY(-4px);
  border-color: #38bdf8;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.dex-task-card-header {
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dex-task-big-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Wallpaper Picker Modal */
.dex-wallpaper-picker-modal {
  width: 560px;
  max-width: 95vw;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.dex-wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.dex-wp-option-card {
  cursor: pointer;
  border-radius: 10px;
  padding: 6px;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.dex-wp-option-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dex-wp-option-card.is-selected {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.dex-wp-preview {
  height: 80px;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-dex-cosmic { background: radial-gradient(circle, #1e1b4b, #0f172a); }
.preview-dex-nebula { background: radial-gradient(circle, #311042, #090d16); }
.preview-dex-emerald { background: radial-gradient(circle, #064e3b, #022c22); }
.preview-dex-graphite { background: linear-gradient(135deg, #1e293b, #0f172a); }
.preview-dex-sunset { background: radial-gradient(circle, #4c0519, #1e1b4b); }

.dex-wp-checked {
  font-size: 20px;
}

/* =========================================================
   CONTEXT MENU (RIGHT CLICK)
   ========================================================= */
.dex-context-menu {
  position: fixed;
  z-index: 300;
  width: 220px;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 4px;
  backdrop-filter: blur(24px);
}

.dex-context-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 7px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dex-context-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.dex-context-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}

/* Transitions */
.dex-window-pop-enter-active,
.dex-window-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dex-window-pop-enter-from,
.dex-window-pop-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.dex-drawer-slide-enter-active,
.dex-drawer-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dex-drawer-slide-enter-from,
.dex-drawer-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.dex-tray-pop-enter-active,
.dex-tray-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dex-tray-pop-enter-from,
.dex-tray-pop-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.dex-modal-fade-enter-active,
.dex-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dex-modal-fade-enter-from,
.dex-modal-fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dex-icons-column-grid {
    grid-template-rows: repeat(auto-fill, 86px);
    grid-auto-columns: 80px;
    gap: 8px 6px;
    left: 12px;
    top: 48px;
  }
  
  .dex-app-icon-item {
    width: 76px;
    height: 82px;
  }

  .dex-icon-squircle {
    width: 42px;
    height: 42px;
  }

  .dex-app-icon {
    font-size: 19px;
  }
}
</style>
