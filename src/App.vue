<template>
  <div id="app" :class="['app-container', (themeMode === 'dark' || themeMode === 'oled') ? 'dark-theme dark-mode' : 'light-theme', themeMode === 'oled' ? 'oled-theme' : '', isPinkMode ? 'pink-mode' : 'blue-mode']" :style="{ '--primary-color': accentColor }">
    <!-- Global Toast Notifications -->
    <AppNotifications />

    <!-- Dukung Dev Modal Popup (Bank & E-Wallet) -->
    <DukungDevModal v-model="showDukungModal" />

    <!-- Konfirmasi Logout Modal Dialog (Aesthetic & Interactive) -->
    <LogoutConfirmModal 
      v-model="showLogoutModal" 
      :current-user="currentUser" 
      :user-role="userRole" 
      @confirm="confirmLogout" 
    />

    <!-- =========================================================
         SAMSUNG DeX / WINDOWS DESKTOP OS MODE
         Persis mirip Samsung DeX dengan icon placement vertikal & taskbar
         ========================================================= -->
    <template v-if="isDesktopMode && showNavigation">
      <DesktopDexWorkspace @exit-desktop-mode="disableDesktopMode">
        <div class="p-3 p-md-4 main-view-viewport">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </DesktopDexWorkspace>
    </template>

    <!-- =========================================================
         STANDARD APP MODE (Material 3 Sidebar Navigation & Top Bar)
         ========================================================= -->
    <template v-else>
      <!-- Desktop Material Navigation Drawer: Hanya tampil jika sudah login -->
      <aside v-if="showNavigation" :class="['sidebar-nav', { collapsed: isCollapsed, 'is-resizing': isResizingSidebar }]">
        <!-- Sidebar Brand Header -->
        <div class="sidebar-brand p-3 d-flex align-items-center justify-content-between">
          <router-link :to="currentUser ? '/home' : '/login'" class="text-decoration-none d-flex align-items-center gap-2.5 overflow-hidden" v-if="!isCollapsed">
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
            <router-link :to="currentUser ? '/home' : '/login'" class="brand-icon-wrapper shadow-sm" title="TaskArts By Kafeinarts">
              <img src="/logo.svg" alt="TaskArts Logo" class="brand-logo-img" />
            </router-link>
          </div>

          <div class="d-flex align-items-center gap-1">
            <button 
              v-if="!isCollapsed"
              class="btn btn-sm btn-sidebar-toggle text-sub p-1.5 rounded-circle border-0 icon-hover" 
              @click="resetSidebarWidth" 
              :title="sidebarWidth >= 350 ? 'Kembalikan ke Lebar Standar (280px)' : 'Perlebar Sidebar Membaca (360px)'"
            >
              <i :class="sidebarWidth >= 350 ? 'bi bi-arrows-angle-contract' : 'bi bi-arrows-angle-expand'" style="font-size: 13px;"></i>
            </button>
            <button class="btn btn-sm btn-sidebar-toggle text-sub p-1.5 rounded-circle border-0 icon-hover" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'">
              <i :class="isCollapsed ? 'bi bi-layout-sidebar-reverse fs-5' : 'bi bi-layout-sidebar fs-5'"></i>
            </button>
          </div>
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
            <!-- Section Header (Accordion Category) -->
            <div 
              v-if="!isCollapsed" 
              class="sidebar-section-header d-flex align-items-center justify-content-between cursor-pointer user-select-none"
              @click="toggleNavGroup(group.title)"
              :title="`Klik untuk toggle kategori ${group.title}`"
            >
              <div class="d-flex align-items-center gap-1.5">
                <i v-if="group.icon" :class="group.icon" class="sidebar-category-icon text-muted" style="font-size: 11px;"></i>
                <span class="sidebar-category-title">{{ group.title }}</span>
                <i 
                  class="bi bi-chevron-down ms-1 text-muted transition-transform" 
                  :class="{ 'rotate-180': !isNavGroupOpen(group.title) }" 
                  style="font-size: 9px;"
                ></i>
              </div>
              <span class="badge rounded-pill bg-light text-muted border px-1.5 py-0.5" style="font-size: 9px;">{{ group.items.length }}</span>
            </div>
            <div v-else-if="gIdx > 0" class="sidebar-divider my-1.5"></div>

            <!-- Items in Group (Collapsible via Accordion) -->
            <div v-show="isCollapsed || isNavGroupOpen(group.title)">
              <template v-for="item in group.items" :key="item.id || item.to">
                <!-- Dropdown / Submenu Parent Item -->
                <div v-if="item.children && item.children.length > 0" class="sidebar-dropdown-wrapper mb-1">
                  <div
                    class="material-nav-link sidebar-dropdown-toggle cursor-pointer"
                    :class="{
                      'dropdown-open': isDropdownOpen(item),
                      'active-parent': isParentActive(item)
                    }"
                    @click="toggleDropdown(item)"
                    :title="item.label"
                  >
                    <div class="nav-icon-box" :style="{ '--item-color': item.color }">
                      <i :class="item.icon" class="nav-icon"></i>
                    </div>
                    <span v-if="!isCollapsed" class="nav-label text-truncate flex-grow-1" :title="item.label">{{ item.label }}</span>

                    <!-- Module Count Badge -->
                    <span v-if="!isCollapsed && item.badgeText" class="badge rounded-pill ms-auto ms-1 small text-nowrap" :class="item.badgeClass || 'bg-light text-dark border'">
                      {{ item.badgeText }}
                    </span>

                    <!-- Submenu Accordion Chevron Indicator -->
                    <i 
                      v-if="!isCollapsed" 
                      class="bi bi-chevron-down ms-1.5 fs-7 transition-transform" 
                      :class="{ 'rotate-180': isDropdownOpen(item) }"
                    ></i>
                  </div>

                  <!-- Collapsible Submenu Items -->
                  <transition name="submenu-slide">
                    <div v-if="!isCollapsed && isDropdownOpen(item)" class="sidebar-submenu ps-2 pe-1 pt-1 pb-1">
                      <router-link
                        v-for="sub in item.children"
                        :key="sub.to"
                        :to="sub.to"
                        class="material-nav-link submenu-nav-link"
                        :title="sub.label"
                      >
                        <div class="submenu-icon-box me-2" :style="{ '--sub-color': sub.color }">
                          <i :class="sub.icon" class="sub-nav-icon"></i>
                        </div>
                        <span class="nav-label text-truncate flex-grow-1" :title="sub.label">{{ sub.label }}</span>
                        
                        <span v-if="sub.badge && sub.badge()" class="badge rounded-pill ms-auto ms-1 small fw-bold text-nowrap" :class="sub.badgeClass || 'bg-primary text-white'">
                          {{ sub.badge() }}
                        </span>
                        <span v-else-if="sub.badgeText" class="badge rounded-pill ms-auto ms-1 small fw-bold text-nowrap" :class="sub.badgeClass || 'bg-light text-dark border'">
                          {{ sub.badgeText }}
                        </span>
                      </router-link>
                    </div>
                  </transition>
                </div>

                <!-- Standard Single Route Item -->
                <router-link
                  v-else
                  :to="item.to"
                  class="material-nav-link"
                  :title="item.label"
                >
                  <div class="nav-icon-box" :style="{ '--item-color': item.color }">
                    <i :class="item.icon" class="nav-icon"></i>
                  </div>
                  <span v-if="!isCollapsed" class="nav-label text-truncate flex-grow-1" :title="item.label">{{ item.label }}</span>
                  
                  <!-- Dynamic Count Badge -->
                  <span v-if="!isCollapsed && item.badge && item.badge()" class="badge rounded-pill ms-auto ms-2 small fw-bold text-nowrap" :class="item.badgeClass || 'bg-primary text-white'">
                    {{ item.badge() }}
                  </span>
                  <!-- Static Badge Text -->
                  <span v-else-if="!isCollapsed && item.badgeText" class="badge rounded-pill ms-auto ms-2 small fw-bold text-nowrap" :class="item.badgeClass || 'bg-light text-dark border'">
                    {{ item.badgeText }}
                  </span>
                </router-link>
              </template>
            </div>
          </div>
        </nav>

        <!-- Sidebar Footer (Expanded) -->
        <div class="sidebar-footer p-2.5 border-top divider-color" v-if="!isCollapsed">
          <div class="d-flex align-items-center justify-content-between p-2 rounded-3 footer-user-pill mb-2">
            <router-link to="/auth" class="d-flex align-items-center gap-2 overflow-hidden text-decoration-none flex-grow-1 me-1.5" title="Lihat Profil & Akun">
              <div class="avatar-kafeinarts position-relative" :class="{ 'bg-success': currentUser, 'bg-primary': !currentUser }">
                <span v-if="!currentUser">K</span>
                <span v-else>{{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
              </div>
              <div class="lh-1 text-truncate">
                <span class="fw-bold fs-7 text-app d-block text-truncate">
                  {{ currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Akun Tamu' }}
                </span>
                <small class="fw-semibold" :class="currentUser ? 'text-success' : 'text-muted'" style="font-size: 10px;">
                  {{ currentUser ? `● Role: ${userRole}` : 'Masuk / Tetapkan Role' }}
                </small>
              </div>
            </router-link>

            <!-- Menu di samping Akun Tamu: Edit Profile & Logout -->
            <div class="d-flex align-items-center gap-1 flex-shrink-0">
              <!-- Tombol Preferences / Settings -->
              <router-link 
                to="/preferences" 
                class="btn btn-sm p-1.5 rounded-2 d-flex align-items-center justify-content-center footer-action-btn footer-edit-btn"
                title="Pengaturan & Preferensi Workspace"
                aria-label="Pengaturan"
              >
                <i class="bi bi-gear-fill" style="font-size: 12px;"></i>
              </router-link>

              <!-- Tombol Logout -->
              <button 
                type="button"
                @click="triggerLogout" 
                class="btn btn-sm p-1.5 rounded-2 d-flex align-items-center justify-content-center footer-action-btn footer-logout-btn"
                :title="currentUser ? 'Logout (Keluar Sesi)' : 'Keluar / Masuk Akun'"
                aria-label="Logout Akun"
              >
                <i class="bi bi-box-arrow-right" style="font-size: 12px;"></i>
              </button>
            </div>
          </div>

          <div class="d-flex align-items-center gap-1.5">
            <!-- Mode Desktop Switcher in Sidebar -->
            <button @click="enableDesktopMode" class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5 fw-semibold" style="font-size: 11.5px;" title="Aktifkan Mode Desktop Samsung DeX">
              <i class="bi bi-display"></i> Mode DeX
            </button>
            <button @click="showDukungModal = true" class="btn btn-sm btn-success-subtle text-success border border-success-subtle rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 px-3 py-1.5" style="font-size: 11.5px;" title="Dukung Pengembang">
              <i class="bi bi-heart-fill"></i> Dukung
            </button>
          </div>
        </div>

        <!-- Sidebar Footer (Collapsed) -->
        <div class="sidebar-footer p-2 border-top divider-color text-center d-flex flex-column align-items-center gap-1.5" v-else>
          <router-link to="/auth" class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-primary" style="width: 36px; height: 36px;" title="Edit Profil & Kelola Akun">
            <i class="bi bi-shield-lock-fill fs-6"></i>
          </router-link>
          <router-link to="/preferences" class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary" style="width: 36px; height: 36px;" title="Pengaturan">
            <i class="bi bi-gear-fill fs-6"></i>
          </router-link>
          <button @click="enableDesktopMode" class="btn btn-sm btn-outline-primary border rounded-circle p-0" style="width: 36px; height: 36px;" title="Mode Desktop Samsung DeX">
            <i class="bi bi-display fs-6"></i>
          </button>
          <button @click="showDukungModal = true" class="btn btn-sm btn-light border rounded-circle p-0" style="width: 36px; height: 36px;" title="☕ Dukung Dev">
            <i class="bi bi-heart-fill text-danger fs-6"></i>
          </button>
          <button @click="triggerLogout" class="btn btn-sm btn-light border rounded-circle p-0 text-danger d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;" title="Logout">
            <i class="bi bi-box-arrow-right fs-6"></i>
          </button>
        </div>

        <!-- Draggable Horizontal Resizer Bar on Right Border -->
        <div 
          v-if="!isCollapsed"
          class="sidebar-resizer"
          @mousedown="startSidebarResize"
          @touchstart="startSidebarResize"
          @dblclick="resetSidebarWidth"
          :title="`Tarik batas ini ke kanan/kiri (${sidebarWidth}px) • Klik 2x untuk toggle lebar`"
        >
          <div class="resizer-indicator-line"></div>
          <div class="resizer-handle-grip" :class="{ active: isResizingSidebar }">
            <i class="bi bi-grip-vertical"></i>
          </div>
          <div v-if="isResizingSidebar" class="sidebar-width-tooltip shadow-sm">
            {{ sidebarWidth }}px
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div :class="['main-content', { 
        'no-sidebar': !showNavigation,
        expanded: isCollapsed && showNavigation, 
        'is-resizing': isResizingSidebar && showNavigation,
        'is-sidebar-wide': sidebarWidth >= 330 && showNavigation,
        'is-sidebar-extra-wide': sidebarWidth >= 390 && showNavigation
      }]">
        <!-- Clean, Re-architectured Top App Bar (NAVBAR) -->
        <header v-if="showNavigation" class="top-header m3-top-app-bar border-bottom px-3 px-md-4 py-2 d-flex align-items-center justify-content-between sticky-top shadow-xs">
          <!-- Left: Sidebar Toggle & Clean Breadcrumb -->
          <div class="d-flex align-items-center gap-2">
            <!-- MOBILE: Back to Home button on subpage -->
            <router-link
              v-if="route.path !== '/home' && route.path !== '/' && route.path !== '/login'"
              to="/home"
              class="btn btn-sm m3-back-btn d-flex align-items-center gap-1.5 fw-bold shadow-xs"
              title="Kembali ke Beranda (Dashboard)"
            >
              <i class="bi bi-arrow-left fs-6"></i>
              <span>Home</span>
            </router-link>

            <!-- MOBILE & TABLET: Menu button to open bottom drawer -->
            <button
              class="btn btn-sm btn-icon-clean d-lg-none rounded-circle"
              @click="mobileDrawer = true"
              title="Buka Menu Navigasi"
            >
              <i class="bi bi-list fs-5"></i>
            </button>

            <!-- DESKTOP: Sidebar collapse toggle -->
            <button
              class="btn btn-sm btn-icon-clean d-none d-lg-flex rounded-circle"
              @click="isCollapsed = !isCollapsed"
              :title="isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'"
            >
              <i :class="isCollapsed ? 'bi bi-layout-sidebar-reverse' : 'bi bi-layout-sidebar'"></i>
            </button>
            
            <!-- Dynamic Clean Breadcrumb & Page Badge -->
            <div class="d-flex align-items-center gap-2 page-breadcrumb-clean ms-1">
              <router-link
                v-if="route.path !== '/home' && route.path !== '/' && route.path !== '/login'"
                to="/home"
                class="breadcrumb-back-chip d-none d-sm-flex align-items-center gap-1 text-decoration-none"
                title="Ke Dashboard Home"
              >
                <i class="bi bi-arrow-left-short fs-6"></i>
                <span>Home</span>
              </router-link>
              <span v-if="route.path !== '/home' && route.path !== '/' && route.path !== '/login'" class="breadcrumb-separator d-none d-sm-inline">/</span>

              <div class="page-title-badge-clean d-flex align-items-center gap-2">
                <span class="page-icon-box"><i :class="currentPageIcon"></i></span>
                <span class="fw-bold text-app fs-6 page-title-clean text-truncate">
                  {{ currentPageTitle }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Consolidated, Clean Action Cluster -->
          <div class="d-flex align-items-center gap-2">
            <!-- 1. Mode Desktop (Samsung DeX & Windows Style) -->
            <button 
              @click="enableDesktopMode" 
              class="btn btn-sm btn-dex-pill rounded-pill px-2.5 px-md-3 py-1.5 d-flex align-items-center gap-1.5 fw-semibold"
              title="Beralih ke Tampilan Desktop OS (Samsung DeX & Windows Style)"
              id="navbar-desktop-mode-btn"
            >
              <i class="bi bi-display text-primary"></i>
              <span class="d-none d-lg-inline">DeX Mode</span>
            </button>

            <!-- 2. Consolidated Aksi Cepat (Quick Tools Dropdown) -->
            <div class="position-relative">
              <button 
                type="button" 
                @click.stop="toggleQuickTools" 
                class="btn btn-sm btn-quick-tools rounded-pill px-2.5 px-md-3 py-1.5 d-flex align-items-center gap-1.5 fw-semibold"
                :class="{ active: isQuickToolsOpen }"
                title="Aksi & Alat Cepat"
                id="navbar-quick-tools-btn"
              >
                <i class="bi bi-grid-fill text-primary"></i>
                <span class="d-none d-md-inline">Aksi Cepat</span>
                <span v-if="isBudgetExceeded" class="quick-tools-alert-dot" title="Peringatan Anggaran!"></span>
                <i class="bi bi-chevron-down ms-0.5 fs-8 transition-transform" :class="{ 'rotate-180': isQuickToolsOpen }"></i>
              </button>

              <!-- Quick Tools Popover Dropdown -->
              <transition name="dropdown-popover">
                <div v-if="isQuickToolsOpen" @click.stop class="quick-tools-popover shadow-lg rounded-3 border p-2.5">
                  <div class="d-flex align-items-center justify-content-between px-2 py-1 mb-1 border-bottom pb-2">
                    <span class="fw-bold fs-7 text-muted text-uppercase tracking-wider">Aksi & Alat Cepat</span>
                    <button type="button" @click="closeNavbarDropdowns" class="btn btn-sm btn-link text-muted p-0 text-decoration-none">
                      <i class="bi bi-x-lg fs-7"></i>
                    </button>
                  </div>

                  <!-- Budget Exceeded Notice Banner inside Tools if triggered -->
                  <div v-if="isBudgetExceeded" class="alert alert-danger py-1.5 px-2.5 mb-2 rounded-2 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-1.5 small lh-1">
                      <i class="bi bi-exclamation-triangle-fill text-danger fs-6"></i>
                      <span class="fw-bold">Anggaran terlampaui!</span>
                    </div>
                    <router-link to="/finance" @click="closeNavbarDropdowns" class="btn btn-xs btn-danger text-white rounded-pill px-2 py-0.5 small fw-bold text-decoration-none">
                      Cek Kas
                    </router-link>
                  </div>

                  <div class="quick-tools-grid">
                    <router-link to="/quick-capture" @click="closeNavbarDropdowns" class="quick-tool-card text-decoration-none">
                      <div class="quick-tool-icon bg-warning-subtle text-warning">
                        <i class="bi bi-lightning-charge-fill"></i>
                      </div>
                      <div class="quick-tool-info">
                        <div class="quick-tool-title">Quick Capture</div>
                        <div class="quick-tool-desc">Catatan kilat & ide spontan</div>
                      </div>
                    </router-link>

                    <router-link to="/camera" @click="closeNavbarDropdowns" class="quick-tool-card text-decoration-none">
                      <div class="quick-tool-icon bg-danger-subtle text-danger">
                        <i class="bi bi-camera-fill"></i>
                      </div>
                      <div class="quick-tool-info">
                        <div class="quick-tool-title">Scan Dokumen</div>
                        <div class="quick-tool-desc">Kamera & OCR berkas</div>
                      </div>
                    </router-link>

                    <router-link to="/drive-vault" @click="closeNavbarDropdowns" class="quick-tool-card text-decoration-none">
                      <div class="quick-tool-icon bg-success-subtle text-success">
                        <i class="bi bi-google"></i>
                      </div>
                      <div class="quick-tool-info">
                        <div class="quick-tool-title">Google Drive Vault</div>
                        <div class="quick-tool-desc">Upload & sinkron cloud</div>
                      </div>
                    </router-link>

                    <router-link to="/mood" @click="closeNavbarDropdowns" class="quick-tool-card text-decoration-none">
                      <div class="quick-tool-icon bg-info-subtle text-info">
                        <i class="bi bi-emoji-smile-fill"></i>
                      </div>
                      <div class="quick-tool-info">
                        <div class="quick-tool-title">Mood & Alarm Kerja</div>
                        <div class="quick-tool-desc">Deteksi senyum & ritme kerja</div>
                      </div>
                    </router-link>
                  </div>
                </div>
              </transition>
            </div>

            <!-- 3. Appearance Controls (Compact Theme & Accent Pill) -->
            <div class="d-flex align-items-center gap-1.5 p-1 rounded-pill theme-accent-wrapper border">
              <!-- Accent Mode Switcher Button (Blue Mode vs Pink Mode) -->
              <button 
                type="button"
                @click="toggleBluePinkMode" 
                class="btn btn-sm btn-accent-toggle rounded-pill px-2 py-1 d-flex align-items-center gap-1.5"
                :title="isPinkMode ? 'Mode Pink Aktif (Klik untuk Blue Mode)' : 'Mode Blue Aktif (Klik untuk Pink Mode)'"
              >
                <span class="accent-dot" :style="{ backgroundColor: accentColor }"></span>
                <span class="accent-label fw-bold d-none d-xl-inline" :style="{ color: isPinkMode ? '#ec4899' : '#2563eb' }">
                  {{ isPinkMode ? 'Pink' : 'Blue' }}
                </span>
              </button>

              <!-- Theme Switcher Button (Light / Dark / OLED True Black) -->
              <button 
                type="button"
                @click="toggleThemeMode" 
                class="btn btn-sm btn-theme-toggle rounded-circle d-flex align-items-center justify-content-center" 
                :title="themeMode === 'light' ? 'Mode Terang (Klik untuk Dark Slate)' : (themeMode === 'dark' ? 'Mode Gelap Slate (Klik untuk OLED True Black)' : 'True Black OLED (Klik untuk Mode Terang)')"
              >
                <i v-if="themeMode === 'light'" class="bi bi-sun-fill text-warning fs-6"></i>
                <i v-else-if="themeMode === 'dark'" class="bi bi-moon-stars-fill text-info fs-6"></i>
                <i v-else class="bi bi-circle-fill text-white" style="font-size: 10px;"></i>
              </button>
            </div>

            <!-- 4. Consolidated User Profile & Workspace Hub (Replaces 4 scattered buttons) -->
            <div class="position-relative">
              <button 
                type="button" 
                @click.stop="toggleUserMenu"
                class="btn btn-sm navbar-user-chip rounded-pill p-1 pe-2.5 d-flex align-items-center gap-2 border"
                :class="{ active: isUserMenuOpen }"
                title="Menu Akun & Pengaturan"
                id="navbar-user-menu-btn"
              >
                <div class="user-chip-avatar position-relative" :class="{ 'bg-success': currentUser, 'bg-primary': !currentUser }">
                  <span v-if="!currentUser">K</span>
                  <span v-else>{{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
                  <span class="status-indicator" :class="currentUser ? 'status-online' : 'status-guest'"></span>
                </div>
                <div class="d-none d-sm-flex flex-column text-start lh-1 me-1">
                  <span class="fw-bold fs-7 text-app text-truncate" style="max-width: 105px;">
                    {{ currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Akun Tamu' }}
                  </span>
                  <span class="user-role-caption text-truncate" style="max-width: 105px;">
                    {{ userRole }}
                  </span>
                </div>
                <i class="bi bi-chevron-down text-muted fs-8 transition-transform" :class="{ 'rotate-180': isUserMenuOpen }"></i>
              </button>

              <!-- User Profile & Workspace Dropdown Popover -->
              <transition name="dropdown-popover">
                <div v-if="isUserMenuOpen" @click.stop class="navbar-user-popover shadow-lg rounded-3 border p-3">
                  <!-- User Header Card -->
                  <div class="d-flex align-items-center gap-2.5 pb-3 border-bottom">
                    <div class="popover-avatar-lg" :class="{ 'bg-success': currentUser, 'bg-primary': !currentUser }">
                      <span v-if="!currentUser">K</span>
                      <span v-else>{{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
                    </div>
                    <div class="lh-1 flex-grow-1 overflow-hidden">
                      <div class="fw-bold fs-6 text-app text-truncate">
                        {{ currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Akun Tamu' }}
                      </div>
                      <div class="text-muted small text-truncate mt-0.5" style="font-size: 11px;">
                        {{ currentUser?.email || 'Belum masuk akun' }}
                      </div>
                      <div class="mt-1.5">
                        <span class="badge rounded-pill" :class="currentUser?.isHostProject ? 'bg-warning text-dark fw-bold' : (currentUser ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-secondary-subtle text-secondary')">
                          {{ userRole }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Storage Bar Indicator Widget inside User Card -->
                  <div class="storage-bar-widget mt-2.5 p-2 rounded-2 border">
                    <div class="d-flex align-items-center justify-content-between small mb-1">
                      <span class="fw-semibold text-sub d-flex align-items-center gap-1">
                        <i class="bi bi-hdd-stack-fill text-primary"></i> Kuota Storage
                      </span>
                      <span class="small fw-bold" :class="storageStats.isFull ? 'text-danger' : (storageStats.isWarning ? 'text-warning' : 'text-muted')">
                        {{ storageStats.formattedUsed }} / {{ storageStats.formattedQuota }}
                      </span>
                    </div>
                    <div class="progress" style="height: 5px;">
                      <div 
                        class="progress-bar" 
                        :class="storageStats.isFull ? 'bg-danger' : (storageStats.isWarning ? 'bg-warning' : 'bg-primary')" 
                        :style="{ width: `${storageStats.percentUsed}%` }"
                      ></div>
                    </div>
                    <div class="text-end mt-1">
                      <router-link to="/storage" @click="closeNavbarDropdowns" class="small text-decoration-none text-primary fw-semibold" style="font-size: 11px;">
                        Kelola Ruang & Cadangan →
                      </router-link>
                    </div>
                  </div>

                  <!-- Navigation Action Items -->
                  <div class="user-popover-links mt-2 d-flex flex-column gap-1">
                    <router-link to="/auth" @click="closeNavbarDropdowns" class="user-popover-item text-decoration-none">
                      <i class="bi bi-shield-lock-fill text-primary fs-6"></i>
                      <div class="flex-grow-1">
                        <div class="popover-item-title">Akun & Role Cloud</div>
                        <div class="popover-item-desc">Firebase, profil, & hak akses</div>
                      </div>
                    </router-link>

                    <router-link to="/preferences" @click="closeNavbarDropdowns" class="user-popover-item text-decoration-none">
                      <i class="bi bi-gear-fill text-info fs-6"></i>
                      <div class="flex-grow-1">
                        <div class="popover-item-title">Pengaturan & Preferensi</div>
                        <div class="popover-item-desc">Tema, layout, & opsi workspace</div>
                      </div>
                    </router-link>

                    <button type="button" @click="showDukungModal = true; closeNavbarDropdowns()" class="user-popover-item btn-clean text-start">
                      <i class="bi bi-heart-fill text-danger fs-6"></i>
                      <div class="flex-grow-1">
                        <div class="popover-item-title">Dukung Developer</div>
                        <div class="popover-item-desc">Traktir kopi & apresiasi karya</div>
                      </div>
                    </button>
                  </div>

                  <!-- Divider & Logout Button -->
                  <div class="border-top pt-2 mt-2">
                    <button 
                      type="button" 
                      @click="triggerLogout(); closeNavbarDropdowns()" 
                      class="btn btn-sm btn-outline-danger w-100 rounded-pill py-1.5 d-flex align-items-center justify-content-center gap-1.5 fw-semibold"
                    >
                      <i class="bi bi-box-arrow-right"></i>
                      <span>{{ currentUser ? 'Keluar Sesi (Logout)' : 'Keluar Akun' }}</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </header>

        <!-- Mobile Bottom Sheet Navigation Menu (Slides Up From Bottom) -->
        <transition name="overlay-fade">
          <div class="offcanvas-overlay" v-if="showNavigation && mobileDrawer" @click="mobileDrawer = false"></div>
        </transition>
        
        <transition name="sheet-slide-up">
          <div class="mobile-bottom-sheet-menu px-3.5 pt-2 pb-4" v-if="showNavigation && mobileDrawer">
            <!-- Drag Handle Indicator -->
            <div class="mobile-sheet-drag-handle-bar mb-2" @click="mobileDrawer = false">
              <span class="mobile-sheet-drag-pill"></span>
            </div>

            <div class="d-flex justify-content-between align-items-center pb-2.5 border-bottom mb-2.5">
              <div class="d-flex align-items-center gap-2">
                <div class="brand-icon-wrapper shadow-sm">
                  <img src="/logo.svg" alt="TaskArts Logo" class="brand-logo-img" />
                </div>
                <div class="lh-1">
                  <span class="fw-bold fs-5 text-app">Task<span :style="{ color: accentColor }">Arts</span></span>
                  <small class="brand-badge-kafeinarts d-block mt-0.5">Menu & Navigasi</small>
                </div>
              </div>
              <button class="btn btn-sm btn-light border rounded-circle shadow-sm" @click="mobileDrawer = false" title="Tutup Menu">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Mobile User Status Pill with Edit Profile & Logout -->
            <div class="d-flex align-items-center justify-content-between p-2 rounded-3 footer-user-pill mb-2.5">
              <router-link to="/auth" @click="mobileDrawer = false" class="d-flex align-items-center gap-2 overflow-hidden text-decoration-none flex-grow-1 me-1.5" title="Lihat Status Akun & Profil">
                <div class="avatar-kafeinarts position-relative" :class="{ 'bg-success': currentUser, 'bg-primary': !currentUser }">
                  <span v-if="!currentUser">K</span>
                  <span v-else>{{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
                </div>
                <div class="lh-1 text-truncate">
                  <span class="fw-bold fs-7 text-app d-block text-truncate">
                    {{ currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Akun Tamu' }}
                  </span>
                  <small class="fw-semibold" :class="currentUser ? 'text-success' : 'text-muted'" style="font-size: 10px;">
                    {{ currentUser ? `● Role: ${userRole}` : 'Masuk / Tetapkan Role' }}
                  </small>
                </div>
              </router-link>

              <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <router-link 
                  to="/auth" 
                  @click="mobileDrawer = false"
                  class="btn btn-sm p-1.5 rounded-2 d-flex align-items-center justify-content-center footer-action-btn footer-edit-btn"
                  title="Edit Profil & Kelola Akun"
                  aria-label="Edit Profil"
                >
                  <i class="bi bi-pencil-square" style="font-size: 12px;"></i>
                </router-link>

                <button 
                  type="button"
                  @click="mobileDrawer = false; triggerLogout()" 
                  class="btn btn-sm p-1.5 rounded-2 d-flex align-items-center justify-content-center footer-action-btn footer-logout-btn"
                  :title="currentUser ? 'Logout (Keluar Sesi)' : 'Keluar / Masuk Akun'"
                  aria-label="Logout Akun"
                >
                  <i class="bi bi-box-arrow-right" style="font-size: 12px;"></i>
                </button>
              </div>
            </div>

            <!-- Mobile Search Filter -->
            <div class="mb-2.5">
              <div class="search-input-group d-flex align-items-center rounded-pill px-3 py-1.5 border bg-surface">
                <i class="bi bi-search text-muted me-2" style="font-size: 13px;"></i>
                <input 
                  v-model="sidebarSearch" 
                  type="text" 
                  class="search-input flex-grow-1 border-0 bg-transparent shadow-none" 
                  placeholder="Cari menu (Surat, To-Do, Kas, CV...)" 
                  style="font-size: 13px;"
                />
                <button v-if="sidebarSearch" @click="sidebarSearch = ''" class="btn btn-link p-0 text-muted ms-1 text-decoration-none">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </div>

            <div class="mobile-sheet-scroll-body">
              <nav class="d-flex flex-column gap-1">
                <div v-for="(group, gIdx) in filteredNavGroups" :key="group.title || gIdx" class="mb-2.5">
                  <div class="sidebar-section-header px-1 pt-1 pb-1.5 fw-bold text-uppercase" style="font-size: 11px; letter-spacing: 0.5px;">{{ group.title }}</div>
                  
                  <template v-for="item in group.items" :key="item.id || item.to">
                    <!-- Dropdown parent in Mobile Drawer -->
                    <div v-if="item.children && item.children.length > 0" class="sidebar-dropdown-wrapper mb-1">
                      <div
                        class="material-nav-link sidebar-dropdown-toggle cursor-pointer"
                        :class="{
                          'dropdown-open': isDropdownOpen(item),
                          'active-parent': isParentActive(item)
                        }"
                        @click.stop="toggleDropdown(item)"
                      >
                        <div class="nav-icon-box me-2.5" :style="{ '--item-color': item.color }">
                          <i :class="item.icon" class="nav-icon"></i>
                        </div>
                        <span class="fw-semibold text-truncate flex-grow-1">{{ item.label }}</span>
                        
                        <span v-if="item.badgeText" class="badge rounded-pill ms-auto ms-1 small" :class="item.badgeClass || 'bg-light text-dark border'">
                          {{ item.badgeText }}
                        </span>
                        
                        <i 
                          class="bi bi-chevron-down ms-1.5 fs-7 transition-transform" 
                          :class="{ 'rotate-180': isDropdownOpen(item) }"
                        ></i>
                      </div>

                      <!-- Submenu items in Mobile Drawer -->
                      <transition name="submenu-slide">
                        <div v-if="isDropdownOpen(item)" class="sidebar-submenu ps-2 pe-1 pt-1 pb-1">
                          <router-link
                            v-for="sub in item.children"
                            :key="sub.to"
                            :to="sub.to"
                            class="material-nav-link submenu-nav-link"
                            @click="mobileDrawer = false"
                          >
                            <div class="submenu-icon-box me-2" :style="{ '--sub-color': sub.color }">
                              <i :class="sub.icon" class="sub-nav-icon"></i>
                            </div>
                            <span class="nav-label text-truncate flex-grow-1">{{ sub.label }}</span>
                            <span v-if="sub.badge && sub.badge()" class="badge rounded-pill ms-auto small fw-bold" :class="sub.badgeClass || 'bg-primary text-white'">
                              {{ sub.badge() }}
                            </span>
                            <span v-else-if="sub.badgeText" class="badge rounded-pill ms-auto small fw-bold" :class="sub.badgeClass || 'bg-light text-dark border'">
                              {{ sub.badgeText }}
                            </span>
                          </router-link>
                        </div>
                      </transition>
                    </div>

                    <!-- Direct link in Mobile Drawer -->
                    <router-link 
                      v-else
                      :to="item.to" 
                      class="material-nav-link"
                      @click="mobileDrawer = false"
                    >
                      <div class="nav-icon-box me-2.5" :style="{ '--item-color': item.color }">
                        <i :class="item.icon" class="nav-icon"></i>
                      </div>
                      <span class="fw-medium">{{ item.label }}</span>
                      <span v-if="item.badge && item.badge()" class="badge rounded-pill ms-auto small fw-bold" :class="item.badgeClass || 'bg-primary text-white'">
                        {{ item.badge() }}
                      </span>
                      <span v-else-if="item.badgeText" class="badge rounded-pill ms-auto small fw-bold" :class="item.badgeClass || 'bg-light text-dark border'">
                        {{ item.badgeText }}
                      </span>
                    </router-link>
                  </template>
                </div>
              </nav>

              <div class="p-2 border-top mt-2 mb-1 d-flex flex-column gap-2">
                <button @click="mobileDrawer = false; enableDesktopMode()" class="btn btn-sm btn-outline-primary w-100 rounded-pill fw-semibold text-center d-flex align-items-center justify-content-center gap-1.5 py-2">
                  <i class="bi bi-display text-primary"></i> Beralih ke Mode Desktop (DeX)
                </button>
                <button @click="mobileDrawer = false; showDukungModal = true" class="btn btn-sm btn-success w-100 rounded-pill fw-semibold text-center d-flex align-items-center justify-content-center gap-1.5 shadow-xs py-2.5">
                  <i class="bi bi-heart-fill text-white"></i> ☕ Dukung Dev (Kafeinarts)
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Main Router View Container with Snappy Lightweight Fade-Slide Animation -->
        <div :class="['main-view-viewport', showNavigation ? 'p-3 p-md-4' : 'p-0 min-vh-100', { 'cards-stacked-mode': shouldStackCards && showNavigation }]">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>

        <!-- Material Design 3 Mobile Bottom Navigation Bar (Hanya tampil jika sudah login) -->
        <nav v-if="showNavigation" class="m3-bottom-nav d-lg-none border-top fixed-bottom d-flex justify-content-around align-items-center shadow-lg">
          <router-link to="/home" class="m3-bottom-nav-item" :class="{ active: route.path === '/home' }">
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
    </template>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import AppNotifications from './components/AppNotifications.vue';
import DukungDevModal from './components/DukungDevModal.vue';
import DesktopDexWorkspace from './components/DesktopDexWorkspace.vue';
import LogoutConfirmModal from './components/LogoutConfirmModal.vue';
import { saveNightlySnapshot, cleanLegacyLocalStorageSnapshot } from './utils/backupStorage';
import { isStorageFull, calculateStorageUsage } from './utils/storageManager';
import { auth, getUserProfileData, getHostSession, logoutUser } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'App',
  components: {
    AppNotifications,
    DukungDevModal,
    DesktopDexWorkspace,
    LogoutConfirmModal
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const isCollapsed = ref(false);
    const mobileDrawer = ref(false);
    const showDukungModal = ref(false);
    const sidebarSearch = ref('');
    const isStorageFullState = ref(isStorageFull());
    
    // Initial user authentication state check (synchronous to prevent layout jump)
    const initUser = () => {
      const host = getHostSession();
      if (host) return host;
      const userSessionStr = localStorage.getItem('taskarts_user_session');
      if (userSessionStr) {
        try {
          return JSON.parse(userSessionStr);
        } catch (e) {}
      }
      return auth.currentUser || null;
    };

    const currentUser = ref(initUser());
    const userRole = ref(currentUser.value?.isHostProject ? '👑 Host Project' : (currentUser.value?.role || 'Tamu'));

    // Global synchronous auth refresher
    const refreshAppAuthState = (explicitDetail = null) => {
      if (explicitDetail) {
        currentUser.value = explicitDetail;
        userRole.value = explicitDetail.isHostProject ? '👑 Host Project' : (explicitDetail.role || 'member');
        return;
      }
      const host = getHostSession();
      if (host) {
        currentUser.value = host;
        userRole.value = '👑 Host Project';
        return;
      }

      const userSessionStr = localStorage.getItem('taskarts_user_session');
      if (userSessionStr) {
        try {
          const parsed = JSON.parse(userSessionStr);
          currentUser.value = parsed;
          userRole.value = parsed.role || 'member';
          return;
        } catch (e) {}
      }

      const fbUser = auth.currentUser;
      if (fbUser) {
        currentUser.value = fbUser;
        getUserProfileData(fbUser.uid).then(prof => {
          if (prof?.role) userRole.value = prof.role;
        }).catch(() => {});
        userRole.value = 'member';
        return;
      }

      currentUser.value = null;
      userRole.value = 'Tamu';
    };

    const isAuthRoute = computed(() => {
      const p = route.path;
      return p === '/login' || p === '/register' || p === '/';
    });

    const isUserLoggedIn = computed(() => {
      if (currentUser.value) return true;
      const active = initUser();
      if (active) {
        currentUser.value = active;
        userRole.value = active.isHostProject ? '👑 Host Project' : (active.role || 'member');
        return true;
      }
      return false;
    });

    // Sidebar & Main Top App Bar only shown when user is logged in AND not on auth routes
    const showNavigation = computed(() => {
      return isUserLoggedIn.value && !isAuthRoute.value;
    });

    // Watch route changes to ensure state is synchronized when moving from /login to internal views
    watch(() => route.path, () => {
      refreshAppAuthState();
      if (window.innerWidth <= 992) {
        mobileDrawer.value = false;
      }
    }, { immediate: true });
    
    // -------------------------------------------------------------
    // Resizable Desktop Sidebar (Drag Left & Right to Adjust Width)
    // -------------------------------------------------------------
    const DEFAULT_SIDEBAR_WIDTH = 280;
    const MIN_SIDEBAR_WIDTH = 210;
    const MAX_SIDEBAR_WIDTH = 550;

    const savedWidth = parseInt(localStorage.getItem('taskarts_sidebar_width') || '', 10);
    const sidebarWidth = ref(
      !isNaN(savedWidth) && savedWidth >= MIN_SIDEBAR_WIDTH && savedWidth <= MAX_SIDEBAR_WIDTH
        ? savedWidth
        : DEFAULT_SIDEBAR_WIDTH
    );

    const isResizingSidebar = ref(false);

    const applySidebarWidth = (width) => {
      document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      document.body.style.setProperty('--sidebar-width', `${width}px`);
    };

    // Apply saved or default width immediately
    applySidebarWidth(sidebarWidth.value);

    const onSidebarResizeMove = (e) => {
      if (!isResizingSidebar.value) return;
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      if (!clientX) return;

      const dynamicMax = Math.min(MAX_SIDEBAR_WIDTH, Math.floor(window.innerWidth * 0.6));
      let newWidth = clientX;

      if (newWidth < MIN_SIDEBAR_WIDTH) newWidth = MIN_SIDEBAR_WIDTH;
      if (newWidth > dynamicMax) newWidth = dynamicMax;

      sidebarWidth.value = Math.round(newWidth);
      applySidebarWidth(sidebarWidth.value);
      localStorage.setItem('taskarts_sidebar_width', sidebarWidth.value.toString());
    };

    const stopSidebarResize = () => {
      if (!isResizingSidebar.value) return;
      isResizingSidebar.value = false;
      document.body.classList.remove('sidebar-resizing');
      window.removeEventListener('mousemove', onSidebarResizeMove);
      window.removeEventListener('mouseup', stopSidebarResize);
      window.removeEventListener('touchmove', onSidebarResizeMove);
      window.removeEventListener('touchend', stopSidebarResize);
    };

    const startSidebarResize = () => {
      if (isCollapsed.value) {
        isCollapsed.value = false;
      }
      isResizingSidebar.value = true;
      document.body.classList.add('sidebar-resizing');

      window.addEventListener('mousemove', onSidebarResizeMove, { passive: false });
      window.addEventListener('mouseup', stopSidebarResize);
      window.addEventListener('touchmove', onSidebarResizeMove, { passive: false });
      window.addEventListener('touchend', stopSidebarResize);
    };

    const resetSidebarWidth = () => {
      if (sidebarWidth.value >= 350) {
        sidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
      } else {
        sidebarWidth.value = 360;
      }
      applySidebarWidth(sidebarWidth.value);
      localStorage.setItem('taskarts_sidebar_width', sidebarWidth.value.toString());
      store.dispatch('showNotification', {
        type: 'info',
        title: '📏 Lebar Sidebar Disesuaikan',
        message: `Lebar sidebar diatur ke ${sidebarWidth.value}px agar teks menu nyaman dibaca.`
      });
    };

    const setSidebarWidthPreset = (targetWidth) => {
      if (isCollapsed.value) isCollapsed.value = false;
      sidebarWidth.value = targetWidth;
      applySidebarWidth(sidebarWidth.value);
      localStorage.setItem('taskarts_sidebar_width', sidebarWidth.value.toString());
    };

    // Desktop Mode State (Samsung DeX & Windows OS Style)
    const isDesktopMode = ref(localStorage.getItem('ft_desktop_mode') === 'true');

    const enableDesktopMode = () => {
      isDesktopMode.value = true;
      localStorage.setItem('ft_desktop_mode', 'true');
      store.dispatch('showNotification', {
        type: 'success',
        title: '🖥️ Mode Desktop OS Aktif',
        message: 'Tampilan Samsung DeX & Windows OS diaktifkan dengan penataan ikon DeX dan taskbar desktop.'
      });
    };

    const disableDesktopMode = () => {
      isDesktopMode.value = false;
      localStorage.setItem('ft_desktop_mode', 'false');
      store.dispatch('showNotification', {
        type: 'info',
        title: '📱 Mode Aplikasi Standar',
        message: 'Kembali ke tampilan navigasi sidebar & app mode standar.'
      });
    };

    const toggleDesktopMode = () => {
      if (isDesktopMode.value) {
        disableDesktopMode();
      } else {
        enableDesktopMode();
      }
    };

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
        icon: 'bi-grid-1x2-fill',
        items: [
          { to: '/home', label: 'Dashboard', icon: 'bi-grid-1x2-fill', color: '#2563eb' },
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
        icon: 'bi-people-fill',
        items: [
          {
            id: 'team-modules',
            label: 'Modul Tim & Komunikasi',
            icon: 'bi-people-fill',
            color: '#2563eb',
            badgeText: '6 Modul',
            badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
            to: '/team-collaboration',
            children: [
              { to: '/team-bulletin', label: '1. Buletin & Pengumuman', icon: 'bi-megaphone-fill', color: '#2563eb', badgeText: 'Top-Down', badgeClass: 'bg-primary text-white' },
              { to: '/team-channels', label: '2. Diskusi Saluran Tim', icon: 'bi-hash', color: '#0ea5e9', badgeText: 'Channels', badgeClass: 'bg-info text-dark' },
              { to: '/team-assets', label: '3. Repositori Dokumen/Aset', icon: 'bi-folder-symlink-fill', color: '#10b981', badgeText: 'Drive Hub', badgeClass: 'bg-success text-white' },
              { to: '/team-ticketing', label: '4. Tiket Permintaan Divisi', icon: 'bi-ticket-perforated-fill', color: '#f59e0b', badgeText: 'Request', badgeClass: 'bg-warning text-dark' },
              { to: '/team-calendar', label: '5. Google Cal & Ketersediaan', icon: 'bi-calendar-check-fill', color: '#4f46e5', badgeText: 'Google Cal', badgeClass: 'bg-primary text-white' },
              { to: '/team-expertise', label: '6. Direktori Keahlian Tim', icon: 'bi-award-fill', color: '#e11d48', badgeText: 'Skills', badgeClass: 'bg-danger text-white' }
            ]
          },
          { to: '/contacts', label: 'Kontak Tim & WA', icon: 'bi-person-lines-fill', color: '#059669', badge: () => totalClientsCount.value, badgeClass: 'bg-success text-white' },
          { to: '/chat-ai', label: 'Live Chat AI Assistant', icon: 'bi-robot', color: '#0891b2', badgeText: 'AI', badgeClass: 'bg-info text-dark' }
        ]
      },
      {
        title: 'KEUANGAN & DATA',
        icon: 'bi-bank',
        items: [
          {
            id: 'finance-modules',
            label: 'Sistem Keuangan Perusahaan',
            icon: 'bi-bank',
            color: '#059669',
            badgeText: '6 Modul',
            badgeClass: 'bg-success-subtle text-success border border-success-subtle',
            to: '/finance-cashflow',
            children: [
              { to: '/finance-cashflow', label: '1. Arus Kas & Rekonsiliasi', icon: 'bi-cash-coin', color: '#2563eb', badgeText: 'Realtime', badgeClass: 'bg-primary text-white' },
              { to: '/finance-ap-ar', label: '2. Hutang & Piutang (AP/AR)', icon: 'bi-arrow-left-right', color: '#059669', badgeText: 'Approval', badgeClass: 'bg-success text-white' },
              { to: '/finance-expenses', label: '3. Pengeluaran & OCR Klaim', icon: 'bi-receipt-cutoff', color: '#ea580c', badgeText: 'OCR', badgeClass: 'bg-warning text-dark' },
              { to: '/finance-budgeting', label: '4. Anggaran & Proyeksi', icon: 'bi-pie-chart-fill', color: '#7c3aed' },
              { to: '/finance-reports', label: '5. Laporan Keuangan PSAK', icon: 'bi-file-earmark-spreadsheet-fill', color: '#0284c7', badgeText: 'Audit', badgeClass: 'bg-info text-dark' },
              { to: '/finance-security', label: '6. Keamanan & Audit Trail', icon: 'bi-shield-lock-fill', color: '#dc2626', badgeText: 'RBAC', badgeClass: 'bg-danger text-white' }
            ]
          },
          { to: '/finance', label: 'Ringkasan Money Tracker', icon: 'bi-wallet2', color: '#475569' },
          { to: '/rab', label: 'RAB & Kas Kegiatan', icon: 'bi-calculator-fill', color: '#059669' },
          { to: '/invoice', label: 'Invoice Generator', icon: 'bi-receipt', color: '#6366f1' },
          { to: '/sql', label: 'SQL Data Export', icon: 'bi-database-fill-gear', color: '#d97706' }
        ]
      },
      {
        title: 'AGENDA & PRODUKTIVITAS',
        icon: 'bi-lightning-charge-fill',
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
        icon: 'bi-gear-wide-connected',
        items: [
          { to: '/login', label: 'Masuk Akun Tim', icon: 'bi-box-arrow-in-right', color: '#2563eb' },
          { to: '/auth', label: 'Akun, Role & Cloud', icon: 'bi-shield-lock-fill', color: '#4f46e5', badgeText: 'Firebase', badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle' },
          { to: '/drive-vault', label: 'Google Drive Vault', icon: 'bi-google', color: '#10b981', badgeText: 'Drive API', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
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
        .map(g => {
          const matchingItems = [];
          g.items.forEach(item => {
            if (item.children && item.children.length > 0) {
              const matchedSubs = item.children.filter(sub =>
                sub.label.toLowerCase().includes(q) ||
                sub.to.toLowerCase().includes(q)
              );
              if (
                matchedSubs.length > 0 ||
                item.label.toLowerCase().includes(q) ||
                (item.to && item.to.toLowerCase().includes(q))
              ) {
                matchingItems.push({
                  ...item,
                  children: matchedSubs.length > 0 ? matchedSubs : item.children,
                  _forceOpen: true
                });
              }
            } else {
              if (
                item.label.toLowerCase().includes(q) ||
                item.to.toLowerCase().includes(q) ||
                g.title.toLowerCase().includes(q)
              ) {
                matchingItems.push(item);
              }
            }
          });
          return {
            ...g,
            items: matchingItems
          };
        })
        .filter(g => g.items.length > 0);
    });

    // Sub-menus state (for clustered 1-6 menu groups)
    const expandedDropdowns = ref({
      'team-modules': true,
      'finance-modules': true
    });

    // Collapsible navigation groups in main sidebar
    const collapsedNavGroups = ref({});
    const isNavGroupOpen = (title) => {
      return !collapsedNavGroups.value[title];
    };
    const toggleNavGroup = (title) => {
      collapsedNavGroups.value[title] = !collapsedNavGroups.value[title];
    };

    // Logout Modal & Handler (Tombol Logout di samping Akun Tamu)
    const showLogoutModal = ref(false);
    const triggerLogout = () => {
      showLogoutModal.value = true;
    };
    const confirmLogout = async () => {
      showLogoutModal.value = false;
      try {
        await logoutUser();
      } catch (err) {
        console.warn('Logout notice:', err);
      }
      currentUser.value = null;
      userRole.value = 'Tamu';
      store.dispatch('showNotification', {
        type: 'info',
        title: '🔒 Sesi Berakhir',
        message: 'Anda telah berhasil logout dari akun.'
      });
      router.push('/login');
    };

    // Navbar Clean Popovers & Tools state
    const isQuickToolsOpen = ref(false);
    const isUserMenuOpen = ref(false);

    const toggleQuickTools = (e) => {
      if (e) e.stopPropagation();
      isUserMenuOpen.value = false;
      isQuickToolsOpen.value = !isQuickToolsOpen.value;
    };

    const toggleUserMenu = (e) => {
      if (e) e.stopPropagation();
      isQuickToolsOpen.value = false;
      isUserMenuOpen.value = !isUserMenuOpen.value;
    };

    const closeNavbarDropdowns = () => {
      isQuickToolsOpen.value = false;
      isUserMenuOpen.value = false;
    };

    // Storage Usage Stats for User Profile Popover
    const storageStats = ref({
      formattedUsed: '0 B',
      formattedQuota: '5 GB',
      percentUsed: 0,
      isWarning: false,
      isFull: false
    });

    const refreshStorageStats = () => {
      try {
        const info = calculateStorageUsage();
        if (info) {
          storageStats.value = {
            formattedUsed: info.formattedUsed || '0 B',
            formattedQuota: info.formattedQuota || '5 GB',
            percentUsed: Math.min(100, Math.round((info.percentUsed || 0) * 10) / 10),
            isWarning: info.isWarning || false,
            isFull: info.isFull || false
          };
        }
      } catch (e) {
        console.warn('Storage stats calculation note:', e);
      }
    };

    const isDropdownOpen = (item) => {
      if (!item || !item.id) return false;
      if (item._forceOpen) return true;
      return !!expandedDropdowns.value[item.id];
    };

    const isParentActive = (item) => {
      if (!item || !item.children) return false;
      const currentPath = route.path;
      return item.children.some(c => c.to === currentPath) || item.to === currentPath;
    };

    const toggleDropdown = (item) => {
      if (isCollapsed.value) {
        isCollapsed.value = false;
      }
      if (!item || !item.id) return;
      expandedDropdowns.value[item.id] = !expandedDropdowns.value[item.id];
    };

    // Auto-open parent dropdown when navigating to any child route
    watch(() => route.path, (newPath) => {
      closeNavbarDropdowns();
      refreshStorageStats();
      navGroups.forEach(g => {
        g.items.forEach(item => {
          if (item.children && item.id) {
            if (item.children.some(c => c.to === newPath) || item.to === newPath) {
              expandedDropdowns.value[item.id] = true;
            }
          }
        });
      });
    }, { immediate: true });

    // Window size tracker for responsive layout and stacking cards
    const windowInnerWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const onWindowResize = () => {
      windowInnerWidth.value = window.innerWidth;
    };

    // Auto-stack multi-column cards when sidebar is widened or content area is constrained
    const shouldStackCards = computed(() => {
      if (isCollapsed.value) return false;
      const effectiveContentWidth = windowInnerWidth.value - sidebarWidth.value;
      if (sidebarWidth.value >= 400 && windowInnerWidth.value < 1600) return true;
      if (sidebarWidth.value >= 320 && effectiveContentWidth < 1000) return true;
      if (effectiveContentWidth < 900) return true;
      return false;
    });

    // Dynamic Title & Icon based on Active Route
    const routeTitles = {
      '/': { title: 'Gerbang Autentikasi & Login', icon: 'bi-box-arrow-in-right' },
      '/login': { title: 'Gerbang Autentikasi & Login', icon: 'bi-box-arrow-in-right' },
      '/register': { title: 'Pendaftaran Akun Baru', icon: 'bi-person-plus-fill' },
      '/home': { title: 'Dashboard Executive', icon: 'bi-grid-1x2-fill' },
      '/dashboard': { title: 'Dashboard Executive', icon: 'bi-grid-1x2-fill' },
      '/job-tracker': { title: 'Simpan Lamaran Kerja (Glints/LinkedIn)', icon: 'bi-briefcase-fill' },
      '/medium-draft': { title: 'Medium Draft & Story Builder', icon: 'bi-medium' },
      '/todo': { title: 'To-Do & Kanban OS', icon: 'bi-kanban-fill' },
      '/project': { title: 'Proyek & Kontrak', icon: 'bi-briefcase-fill' },
      '/camera': { title: 'Kamera Scan Dokumen', icon: 'bi-camera-fill' },
      '/surat': { title: 'Surat Generator Resmi', icon: 'bi-file-earmark-richtext-fill' },
      '/cv': { title: 'CV & Resume Builder ATS', icon: 'bi-person-vcard-fill' },
      '/videos': { title: 'Tonton & Sync Video Hub', icon: 'bi-play-btn-fill' },
      '/contacts': { title: 'Kontak Tim & Broadcast WA', icon: 'bi-person-lines-fill' },
      '/team-bulletin': { title: '1. Pusat Informasi & Pengumuman Internal', icon: 'bi-megaphone-fill' },
      '/team-channels': { title: '2. Ruang Diskusi Berbasis Saluran (Channels)', icon: 'bi-hash' },
      '/team-assets': { title: '3. Repositori Aset & Dokumen Bersama', icon: 'bi-folder-symlink-fill' },
      '/team-ticketing': { title: '4. Sistem Permintaan Lintas Divisi (Ticketing)', icon: 'bi-ticket-perforated-fill' },
      '/team-calendar': { title: '5. Kalender Kolaborasi & Google Calendar', icon: 'bi-calendar-check-fill' },
      '/team-expertise': { title: '6. Direktori Keahlian & Pencarian Kompetensi', icon: 'bi-award-fill' },
      '/team-collaboration': { title: 'Modul Tim & Komunikasi (Kolaborasi Lintas Divisi)', icon: 'bi-people-fill' },
      '/chat-ai': { title: 'Live Chat AI Assistant', icon: 'bi-robot' },
      '/finance-cashflow': { title: '1. Arus Kas & Rekonsiliasi Bank', icon: 'bi-cash-coin' },
      '/finance-ap-ar': { title: '2. Hutang & Piutang (AP & AR)', icon: 'bi-arrow-left-right' },
      '/finance-expenses': { title: '3. Pengeluaran & Reimbursement', icon: 'bi-receipt-cutoff' },
      '/finance-budgeting': { title: '4. Penganggaran & Forecasting', icon: 'bi-pie-chart-fill' },
      '/finance-reports': { title: '5. Pelaporan Keuangan PSAK / IFRS', icon: 'bi-file-earmark-spreadsheet-fill' },
      '/finance-security': { title: '6. Keamanan & Jejak Audit (RBAC)', icon: 'bi-shield-lock-fill' },
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
      '/auth': { title: 'Firebase Auth & Role Management', icon: 'bi-shield-lock-fill' },
      '/drive-vault': { title: 'Google Drive Upload Vault', icon: 'bi-google' },
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
      window.addEventListener('resize', onWindowResize, { passive: true });

      // Window click listener to close navbar popovers when clicking outside
      window.addEventListener('click', closeNavbarDropdowns);
      refreshStorageStats();

      // Auth & Role Listener to keep reactive role & user state in navbar and sidebar
      refreshAppAuthState();
      const onAuthChangedHandler = (e) => {
        refreshAppAuthState(e?.detail);
      };
      window.addEventListener('taskarts-auth-changed', onAuthChangedHandler);
      window.addEventListener('storage', () => refreshAppAuthState());

      onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          refreshAppAuthState();
        } else if (!getHostSession() && !localStorage.getItem('taskarts_user_session')) {
          currentUser.value = null;
          userRole.value = 'Tamu';
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('click', closeNavbarDropdowns);
      window.removeEventListener('storage-quota-updated', updateStorageState);
      window.removeEventListener('storage-quota-full', updateStorageState);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onSidebarResizeMove);
      window.removeEventListener('mouseup', stopSidebarResize);
      window.removeEventListener('touchmove', onSidebarResizeMove);
      window.removeEventListener('touchend', stopSidebarResize);
      document.body.classList.remove('sidebar-resizing');
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
      toggleThemeMode,
      isDesktopMode,
      enableDesktopMode,
      disableDesktopMode,
      toggleDesktopMode,
      currentUser,
      userRole,
      sidebarWidth,
      isResizingSidebar,
      startSidebarResize,
      resetSidebarWidth,
      setSidebarWidthPreset,
      isDropdownOpen,
      isParentActive,
      toggleDropdown,
      expandedDropdowns,
      shouldStackCards,
      isNavGroupOpen,
      toggleNavGroup,
      showLogoutModal,
      triggerLogout,
      confirmLogout,
      showNavigation,
      isAuthRoute,
      isUserLoggedIn,
      isQuickToolsOpen,
      isUserMenuOpen,
      toggleQuickTools,
      toggleUserMenu,
      closeNavbarDropdowns,
      storageStats,
      refreshStorageStats
    };
  }
};
</script>

<style>
/* Mode Desktop Navbar Trigger Button */
.btn-dex-mode-navbar {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.25);
  color: var(--bs-body-color, #1e293b);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 12px;
}

.btn-dex-mode-navbar:hover {
  background: rgba(37, 99, 235, 0.16);
  border-color: #2563eb;
  color: #1d4ed8;
  transform: translateY(-1px);
}

.dark-theme .btn-dex-mode-navbar,
.oled-theme .btn-dex-mode-navbar {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(96, 165, 250, 0.35);
  color: #f1f5f9;
}

.dark-theme .btn-dex-mode-navbar:hover,
.oled-theme .btn-dex-mode-navbar:hover {
  background: rgba(59, 130, 246, 0.28);
  border-color: #60a5fa;
  color: #93c5fd;
}

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

.btn-outline-primary:hover,
.btn-outline-primary:focus,
.btn-outline-primary:active,
.btn-outline-primary.active,
.btn-outline-primary.show,
.btn-check:checked + .btn-outline-primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #ffffff !important;
}

.btn-outline-primary.active *,
.btn-outline-primary:active *,
.btn-outline-primary:hover *,
.btn-check:checked + .btn-outline-primary * {
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

/* Sidebar Drag Resizer & Handle */
.sidebar-resizer {
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
}

.resizer-indicator-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 4px;
  width: 2px;
  background-color: transparent;
  transition: background-color 0.15s ease;
}

.sidebar-resizer:hover .resizer-indicator-line,
.sidebar-nav.is-resizing .resizer-indicator-line {
  background-color: var(--primary-color, #2563eb);
}

.resizer-handle-grip {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 46px;
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--sidebar-border, #cbd5e1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--text-sub, #64748b);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s;
  pointer-events: none;
}

.sidebar-resizer:hover .resizer-handle-grip,
.sidebar-nav.is-resizing .resizer-handle-grip,
.resizer-handle-grip.active {
  opacity: 1;
  background-color: var(--primary-color, #2563eb);
  color: #ffffff;
  border-color: var(--primary-color, #2563eb);
}

.sidebar-width-tooltip {
  position: absolute;
  top: calc(50% + 36px);
  left: 14px;
  background: #0f172a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1070;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Instant synchronous resizing with no CSS animation lag */
.sidebar-nav.is-resizing,
.main-content.is-resizing,
body.sidebar-resizing .sidebar-nav,
body.sidebar-resizing .main-content {
  transition: none !important;
}

body.sidebar-resizing {
  user-select: none !important;
  cursor: col-resize !important;
}

body.sidebar-resizing * {
  user-select: none !important;
  cursor: col-resize !important;
}

.dark-theme .resizer-handle-grip,
.oled-theme .resizer-handle-grip {
  background-color: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.dark-theme .sidebar-resizer:hover .resizer-handle-grip,
.oled-theme .sidebar-resizer:hover .resizer-handle-grip,
.dark-theme .sidebar-nav.is-resizing .resizer-handle-grip,
.oled-theme .sidebar-nav.is-resizing .resizer-handle-grip {
  background-color: var(--primary-color, #2563eb);
  color: #ffffff;
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
  min-width: 0;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.nav-label {
  letter-spacing: -0.15px;
  line-height: 1.35;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
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

/* Submenu & Dropdown Accordion Styles */
.sidebar-dropdown-toggle {
  cursor: pointer;
  user-select: none;
}

.sidebar-dropdown-toggle.active-parent {
  background-color: var(--sidebar-hover-bg);
  color: var(--primary-color) !important;
  font-weight: 700;
}

.sidebar-dropdown-toggle .transition-transform {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar-dropdown-toggle .rotate-180 {
  transform: rotate(180deg);
}

.sidebar-submenu {
  margin-left: 14px;
  border-left: 2px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.submenu-nav-link {
  padding: 5.5px 8px !important;
  font-size: 12px !important;
  border-radius: 8px !important;
  margin-bottom: 1px !important;
  color: var(--sidebar-text);
  font-weight: 500;
}

.submenu-nav-link .nav-label {
  font-size: 12px !important;
  font-weight: 500;
}

.submenu-icon-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(148, 163, 184, 0.12);
  color: var(--sub-color, var(--primary-color));
  font-size: 11px;
  flex-shrink: 0;
}

.submenu-nav-link:hover .submenu-icon-box {
  background-color: rgba(37, 99, 235, 0.18);
  transform: scale(1.05);
}

.submenu-nav-link.router-link-active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text) !important;
  font-weight: 700;
}

.submenu-nav-link.router-link-active .submenu-icon-box {
  background-color: rgba(255, 255, 255, 0.28);
  color: #ffffff !important;
}

/* Submenu Slide Animation */
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  max-height: 400px;
}

.submenu-slide-enter-from,
.submenu-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
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

/* Sidebar Footer Action Buttons (Edit Profile & Logout di samping Akun Tamu) */
.footer-action-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--sidebar-divider, #e2e8f0);
  background-color: var(--bg-surface, #ffffff);
  color: var(--text-main, #334155);
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.footer-edit-btn:hover {
  background-color: rgba(37, 99, 235, 0.1);
  border-color: #2563eb;
  color: #2563eb;
  transform: translateY(-1px);
}

.footer-logout-btn {
  color: #ef4444;
}

.footer-logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  color: #dc2626;
  transform: translateY(-1px);
}

.dark-theme .footer-action-btn,
.oled-theme .footer-action-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--sidebar-divider, #334155);
  color: #cbd5e1;
}

.dark-theme .footer-edit-btn:hover,
.oled-theme .footer-edit-btn:hover {
  background-color: rgba(37, 99, 235, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
}

.dark-theme .footer-logout-btn,
.oled-theme .footer-logout-btn {
  color: #f87171;
}

.dark-theme .footer-logout-btn:hover,
.oled-theme .footer-logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

/* Page Breadcrumb & Header Clean Navigation */
.btn-icon-clean {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub, #64748b);
  border: 1px solid transparent;
  transition: all 0.18s ease;
  cursor: pointer;
}

.btn-icon-clean:hover {
  background-color: var(--sidebar-hover-bg, #f1f5f9);
  color: var(--text-main, #0f172a);
}

.page-breadcrumb-clean {
  font-size: 13px;
}

.breadcrumb-back-chip {
  padding: 3px 8px;
  border-radius: 9999px;
  background-color: var(--sidebar-hover-bg, #f1f5f9);
  color: var(--text-sub, #64748b);
  border: 1px solid var(--border-color, #e2e8f0);
  font-size: 11.5px;
  font-weight: 600;
  transition: all 0.18s ease;
}

.breadcrumb-back-chip:hover {
  color: var(--primary-color, #2563eb);
  border-color: var(--primary-color, #2563eb);
}

.breadcrumb-separator {
  color: var(--text-sub, #94a3b8);
  font-size: 12px;
}

.page-title-badge-clean {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-icon-box {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(37, 99, 235, 0.12);
  color: var(--primary-color, #2563eb);
  font-size: 13px;
}

.page-title-clean {
  letter-spacing: -0.2px;
}

/* DeX Pill in Navbar */
.btn-dex-pill {
  background-color: var(--sidebar-hover-bg, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  color: var(--text-main, #1e293b);
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-dex-pill:hover {
  background-color: rgba(37, 99, 235, 0.1);
  border-color: var(--primary-color, #2563eb);
  color: var(--primary-color, #2563eb);
}

/* Quick Tools Navbar Trigger & Popover */
.btn-quick-tools {
  background-color: var(--sidebar-hover-bg, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  color: var(--text-main, #1e293b);
  font-size: 12px;
  transition: all 0.2s ease;
  position: relative;
}

.btn-quick-tools:hover,
.btn-quick-tools.active {
  background-color: rgba(37, 99, 235, 0.12);
  border-color: var(--primary-color, #2563eb);
  color: var(--primary-color, #2563eb);
}

.quick-tools-alert-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #ef4444;
  display: inline-block;
  animation: pulse-alert 1.5s infinite;
}

@keyframes pulse-alert {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.25); }
}

.quick-tools-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 290px;
  background-color: var(--bg-surface, #ffffff);
  border-color: var(--border-color, #e2e8f0) !important;
  z-index: 1060;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.quick-tools-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-tool-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.18s ease;
  color: inherit;
}

.quick-tool-card:hover {
  background-color: var(--sidebar-hover-bg, #f8fafc);
  transform: translateX(2px);
}

.quick-tool-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.quick-tool-info {
  min-width: 0;
}

.quick-tool-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

.quick-tool-desc {
  font-size: 10.5px;
  color: var(--text-sub, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Theme & Accent Pill Controls */
.theme-accent-wrapper {
  background-color: var(--sidebar-hover-bg, #f1f5f9);
  border-color: var(--border-color, #e2e8f0) !important;
}

.btn-accent-toggle {
  background: transparent;
  border: none;
  font-size: 11px;
  padding: 3px 7px !important;
  color: var(--text-main, #1e293b);
  transition: all 0.18s ease;
}

.btn-accent-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.accent-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.btn-theme-toggle {
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  transition: all 0.18s ease;
}

.btn-theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Navbar User Chip & Dropdown */
.navbar-user-chip {
  background-color: var(--sidebar-hover-bg, #f1f5f9);
  border-color: var(--border-color, #e2e8f0) !important;
  color: var(--text-main, #1e293b);
  transition: all 0.2s ease;
}

.navbar-user-chip:hover,
.navbar-user-chip.active {
  border-color: var(--primary-color, #2563eb) !important;
  background-color: rgba(37, 99, 235, 0.08);
}

.user-chip-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #ffffff;
  font-weight: 800;
  font-size: 11.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
}

.status-online {
  background-color: #10b981;
}

.status-guest {
  background-color: #94a3b8;
}

.user-role-caption {
  font-size: 10px;
  color: var(--text-sub, #64748b);
  font-weight: 500;
}

.navbar-user-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 290px;
  background-color: var(--bg-surface, #ffffff);
  border-color: var(--border-color, #e2e8f0) !important;
  z-index: 1060;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.popover-avatar-lg {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #ffffff;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.storage-bar-widget {
  background-color: var(--sidebar-hover-bg, #f8fafc);
  border-color: var(--border-color, #e2e8f0) !important;
}

.user-popover-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.18s ease;
  color: inherit;
  border: none;
  background: transparent;
  width: 100%;
}

.user-popover-item:hover {
  background-color: var(--sidebar-hover-bg, #f1f5f9);
}

.popover-item-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main, #0f172a);
}

.popover-item-desc {
  font-size: 10px;
  color: var(--text-sub, #64748b);
}

/* Dropdown Popover Animations */
.dropdown-popover-enter-active,
.dropdown-popover-leave-active {
  transition: opacity 0.16s ease, transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-popover-enter-from,
.dropdown-popover-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* Sidebar Category Icons & Labels */
.sidebar-category-icon {
  opacity: 0.7;
}

.sidebar-category-title {
  font-weight: 800;
}

/* Dark and OLED Overrides for Popovers and Chips */
.dark-theme .quick-tools-popover,
.oled-theme .quick-tools-popover,
.dark-theme .navbar-user-popover,
.oled-theme .navbar-user-popover {
  background-color: var(--bg-surface, #1e293b);
  border-color: var(--border-color, #334155) !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.dark-theme .storage-bar-widget,
.oled-theme .storage-bar-widget {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: var(--border-color, #334155) !important;
}

.dark-theme .quick-tool-card:hover,
.oled-theme .quick-tool-card:hover,
.dark-theme .user-popover-item:hover,
.oled-theme .user-popover-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.dark-theme .status-indicator,
.oled-theme .status-indicator {
  border-color: var(--bg-surface, #1e293b);
}

/* Page Breadcrumb Pill (Legacy support) */
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

.main-content.no-sidebar {
  margin-left: 0 !important;
  padding-bottom: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
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

/* Sheet slide-up transition (Slide from bottom to top) */
.sheet-slide-up-enter-active,
.sheet-slide-up-leave-active {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}

.sheet-slide-up-enter-from,
.sheet-slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0.85;
}

/* Mobile Bottom Sheet Menu & Overlay */
.offcanvas-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1050;
}

.mobile-bottom-sheet-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: auto;
  max-height: 86vh;
  height: auto;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background-color: var(--sidebar-bg);
  z-index: 1060;
  box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.mobile-sheet-drag-handle-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 0 3px 0;
  cursor: pointer;
}

.mobile-sheet-drag-pill {
  width: 48px;
  height: 5px;
  border-radius: 9999px;
  background-color: var(--border-color);
  opacity: 0.85;
}

.mobile-sheet-scroll-body {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1 1 auto;
  max-height: calc(86vh - 120px);
  padding-right: 4px;
  overscroll-behavior: contain;
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

/* =========================================================
   Unified Responsive Layout, Spacing & Anti-Cramping Polish
   ========================================================= */
.main-view-viewport {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
  padding: 24px 28px 80px 28px;
  box-sizing: border-box;
  container-type: inline-size;
  container-name: main-viewport;
}

@media (min-width: 1400px) {
  .main-view-viewport {
    padding: 28px 36px 96px 36px;
  }
}

/* =========================================================================
   Responsive Card Stacking Engine (Prevents cramping when sidebar is wide)
   ========================================================================= */

/* Container Query: Automatically stack multi-column cards when main viewport width is constrained */
@container main-viewport (max-width: 980px) {
  .row > [class*="col-lg-6"],
  .row > [class*="col-xl-6"],
  .row > [class*="col-xxl-6"],
  .row > [class*="col-lg-7"],
  .row > [class*="col-lg-8"],
  .row > [class*="col-lg-5"],
  .row > [class*="col-xl-7"],
  .row > [class*="col-xl-8"],
  .row > [class*="col-xl-5"] {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    width: 100% !important;
  }
}

@container main-viewport (max-width: 840px) {
  .row > [class*="col-md-6"],
  .row > [class*="col-lg-4"],
  .row > [class*="col-xl-4"] {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    width: 100% !important;
  }
}

/* Dynamic State: Activates when user drags sidebar wider or on medium screens */
.main-view-viewport.cards-stacked-mode .row > [class*="col-lg-6"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-xl-6"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-xxl-6"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-lg-7"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-lg-8"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-lg-5"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-xl-7"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-xl-8"],
.main-view-viewport.cards-stacked-mode .row > [class*="col-xl-5"] {
  flex: 0 0 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}

.main-content.is-sidebar-extra-wide .main-view-viewport .row > [class*="col-lg-4"],
.main-content.is-sidebar-extra-wide .main-view-viewport .row > [class*="col-xl-4"] {
  flex: 0 0 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}

/* Generous breathing room when cards are stacked */
.main-view-viewport.cards-stacked-mode .row > [class*="col-"] > .card,
.main-content.is-sidebar-wide .main-view-viewport .row > [class*="col-"] > .card {
  margin-bottom: 1.5rem !important;
}

/* Generous Card Rhythms - Avoid nested feel and dense cramping */
.main-view-viewport .card {
  border-radius: 16px;
  border-color: var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.02);
  margin-bottom: 1.5rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.main-view-viewport .card-header {
  padding: 1.15rem 1.35rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-surface);
}

.main-view-viewport .card-body {
  padding: 1.35rem 1.35rem;
}

.main-view-viewport .card-footer {
  padding: 1rem 1.35rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-surface);
}

/* Form input spacing and touch targets */
.main-view-viewport .form-control,
.main-view-viewport .form-select {
  padding: 0.6rem 0.85rem;
  font-size: 13.5px;
  border-radius: 10px;
  border-color: var(--border-color);
}

.main-view-viewport .form-label {
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 0.4rem;
  color: var(--text-main);
  letter-spacing: -0.1px;
}

/* Action toolbars & button groups */
.main-view-viewport .d-flex.flex-wrap.gap-2 {
  align-items: center;
}

.main-view-viewport .btn {
  font-size: 13px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
}

/* Clean Responsive Tables */
.main-view-viewport .table-responsive {
  border-radius: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 0.75rem;
}

.main-view-viewport .table {
  vertical-align: middle;
  margin-bottom: 0;
}

.main-view-viewport .table th {
  padding: 12px 14px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  white-space: nowrap;
}

.main-view-viewport .table td {
  padding: 12px 14px;
  font-size: 13.5px;
}

/* Prevent squished pills, badges & chips */
.badge, .m3-chip {
  white-space: nowrap;
  letter-spacing: -0.1px;
}

@media (max-width: 991.98px) {
  .sidebar-nav {
    display: none !important;
  }
  .main-content {
    margin-left: 0 !important;
    padding-bottom: 96px !important;
  }

  /* Main viewport with generous breathing room away from device edges */
  .main-view-viewport {
    padding-left: 14px !important;
    padding-right: 14px !important;
    padding-top: 14px !important;
    padding-bottom: 96px !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  /* 1. Eliminate the edge-touching effect caused by Bootstrap row negative margins */
  .main-view-viewport .row {
    margin-left: -6px !important;
    margin-right: -6px !important;
  }
  .main-view-viewport .row > [class*="col-"] {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  /* 2. Responsive card padding: prevent desktop p-4/p-5 from crushing mobile inner space */
  .main-view-viewport .card {
    border-radius: 16px !important;
  }
  .main-view-viewport .card-body.p-4,
  .main-view-viewport .card.p-4,
  .main-view-viewport .p-4:not(.keep-pad-4) {
    padding: 1rem !important; /* 16px */
  }
  .main-view-viewport .card-header.p-4 {
    padding: 0.875rem 1rem !important;
  }
  .main-view-viewport .card-footer.p-4 {
    padding: 0.875rem 1rem !important;
  }
  .main-view-viewport .p-5 {
    padding: 1.25rem !important;
  }

  /* 3. Action button toolbars and menus across all views: full touch targets with no overlap */
  .main-view-viewport .d-flex.flex-wrap.gap-2 {
    width: 100% !important;
  }
  .main-view-viewport .d-flex.flex-wrap.gap-2 > .btn {
    flex: 1 1 auto;
    min-height: 40px;
    font-size: 13px;
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* 4. Tab navigation & pill menus: smooth horizontal scrolling without ugly scrollbars */
  .main-view-viewport .nav-tabs,
  .main-view-viewport .nav-pills {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 4px !important;
  }
  .main-view-viewport .nav-tabs::-webkit-scrollbar,
  .main-view-viewport .nav-pills::-webkit-scrollbar {
    display: none;
  }
  .main-view-viewport .nav-tabs .nav-link,
  .main-view-viewport .nav-pills .nav-link {
    white-space: nowrap !important;
    font-size: 13px !important;
    padding: 6px 14px !important;
  }

  /* 5. Mobile Bottom Sheet navigation item polish */
  .mobile-bottom-sheet-menu .material-nav-link {
    padding: 9px 12px;
    border-radius: 12px;
    margin-bottom: 3px;
    font-size: 13.5px;
    min-height: 44px;
  }

  /* 6. Mobile bottom navigation bar safe padding */
  .m3-bottom-nav {
    height: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
    padding: 4px 12px max(4px, env(safe-area-inset-bottom, 0px)) 12px !important;
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
