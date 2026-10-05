<template>
  <div class="dashboard-container" data-aos="fade-up">
    <!-- =========================================================
         MOBILE DASHBOARD: MATERIAL DESIGN QUICK ACCESS LAUNCHER (d-md-none)
         ========================================================= -->
    <div class="mobile-dashboard d-md-none">
      <!-- 1. M3 Greeting & Header Card -->
      <div class="m3-card m3-card-tonal p-3.5 mb-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-1.5">
            <span class="m3-chip-brand">
              <i class="bi bi-stars text-warning me-1"></i>By Kafeinarts
            </span>
            <span v-if="isBudgetExceeded" class="badge bg-danger rounded-pill px-2 py-0.5 small fw-bold">
              Over Budget
            </span>
          </div>
          <div class="m3-time-chip">
            <i class="bi bi-clock me-1 text-primary"></i>{{ currentTimeFormatted }}
          </div>
        </div>

        <h2 class="fw-extrabold text-main mb-1 fs-5">
          {{ greetingTime }}, <span class="text-primary">{{ displayName }}</span> 👋
        </h2>
        <p class="text-sub small mb-3 lh-sm">Workspace terpadu & pintasan aplikasi kerja harian Anda.</p>

        <!-- Glance KPI Stats Strip -->
        <div class="m3-stats-strip d-flex align-items-center justify-content-between gap-1 p-2 rounded-3 mb-3">
          <router-link to="/todo" class="m3-stat-item flex-fill text-center text-decoration-none">
            <div class="m3-stat-value text-primary">{{ pendingTasksCount }}</div>
            <div class="m3-stat-label">Pending Task</div>
          </router-link>
          <div class="m3-stat-divider"></div>
          <router-link to="/project" class="m3-stat-item flex-fill text-center text-decoration-none">
            <div class="m3-stat-value text-info">{{ activeProjectsCount }}</div>
            <div class="m3-stat-label">Proyek Aktif</div>
          </router-link>
          <div class="m3-stat-divider"></div>
          <router-link to="/finance" class="m3-stat-item flex-fill text-center text-decoration-none">
            <div class="m3-stat-value" :class="netProfit >= 0 ? 'text-success' : 'text-danger'">
              {{ formatCurrencyShort(netProfit) }}
            </div>
            <div class="m3-stat-label">Saldo Kas</div>
          </router-link>
        </div>

        <!-- Quick Fast Actions -->
        <div class="d-flex gap-2">
          <button @click="openTaskModal" class="btn btn-sm btn-primary rounded-pill flex-fill py-2 fw-bold d-flex align-items-center justify-content-center gap-1.5 shadow-xs">
            <i class="bi bi-plus-circle-fill"></i> + Tugas
          </button>
          <button @click="openTransactionModal" class="btn btn-sm btn-outline-theme rounded-pill flex-fill py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5">
            <i class="bi bi-wallet2 text-success"></i> + Kas
          </button>
        </div>
      </div>

      <!-- 2. Search & Filter Bar -->
      <div class="mb-3 px-0.5">
        <div class="m3-search-bar d-flex align-items-center rounded-pill px-3 py-2 border mb-2.5">
          <i class="bi bi-search text-muted me-2 fs-6"></i>
          <input
            v-model="mobileSearch"
            type="text"
            class="border-0 bg-transparent flex-grow-1 shadow-none outline-none text-main"
            placeholder="Cari fitur (Surat, CV, To-Do, Kas, WA...)"
            style="font-size: 13px;"
          />
          <button v-if="mobileSearch" @click="mobileSearch = ''" class="btn btn-link p-0 text-muted">
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>

        <!-- Category Horizontal Scroll Pills (Material 3 Filter Chips) -->
        <div class="m3-category-scroll d-flex gap-1.5 overflow-x-auto pb-1">
          <button
            v-for="cat in mobileCategories"
            :key="cat.id"
            class="m3-chip"
            :class="{ active: mobileCategory === cat.id }"
            @click="mobileCategory = cat.id"
          >
            <i :class="cat.icon"></i>
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- 3. Quick Access App Icons Grid (Material You / Vuetify Style Launcher) -->
      <div class="mb-3.5">
        <div class="d-flex align-items-center justify-content-between px-1 mb-2.5">
          <span class="text-sub fw-bold small text-uppercase" style="letter-spacing: 0.5px; font-size: 11px;">
            Pintasan Aplikasi & Fitur
          </span>
          <span class="badge bg-light text-muted border rounded-pill small">{{ filteredQuickApps.length }} Fitur</span>
        </div>

        <div v-if="filteredQuickApps.length === 0" class="text-center py-5 m3-card p-4">
          <i class="bi bi-search fs-3 text-muted mb-2 d-block opacity-50"></i>
          <div class="fw-bold text-main">Tidak ditemukan "{{ mobileSearch }}"</div>
          <p class="text-sub small mb-2">Coba kata kunci lain atau pilih kategori lain</p>
          <button @click="mobileSearch = ''; mobileCategory = 'all'" class="btn btn-sm btn-outline-primary rounded-pill">
            Reset Pencarian
          </button>
        </div>

        <div v-else class="m3-app-grid">
          <router-link
            v-for="app in filteredQuickApps"
            :key="app.id"
            :to="app.to"
            class="m3-app-item text-decoration-none"
          >
            <div class="m3-app-icon-squircle" :style="{ background: app.bgGradient }">
              <i :class="app.icon" class="m3-app-icon text-white"></i>
              <!-- Contextual badge on top-right -->
              <span v-if="app.badge && app.badge()" class="m3-app-badge" :class="app.badgeClass || 'bg-danger text-white'">
                {{ app.badge() }}
              </span>
            </div>
            <span class="m3-app-label text-main text-truncate">{{ app.title }}</span>
          </router-link>
        </div>
      </div>

      <!-- 4. Quick Urgent Task Widget (Mobile) -->
      <div class="m3-card p-3 mb-3">
        <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-theme">
          <div class="d-flex align-items-center gap-1.5">
            <i class="bi bi-fire text-danger fs-6"></i>
            <span class="fw-bold text-main small">Tugas Prioritas Segera</span>
          </div>
          <router-link to="/todo" class="small text-primary text-decoration-none fw-semibold">
            Buka To-Do <i class="bi bi-chevron-right small"></i>
          </router-link>
        </div>

        <div v-if="topUrgentTasks.length === 0" class="text-center py-2 text-muted small">
          <i class="bi bi-check2-circle text-success me-1"></i> Tidak ada tugas mendesak hari ini. Mantap!
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <div
            v-for="task in topUrgentTasks"
            :key="task.id"
            class="d-flex align-items-center gap-2 p-2 rounded-3 m3-task-row"
          >
            <input
              type="checkbox"
              :checked="task.done"
              @change="toggleTaskDone(task.id)"
              class="form-check-input mt-0 cursor-pointer"
            />
            <div class="flex-grow-1 text-truncate">
              <div class="text-main fw-semibold small text-truncate" :class="{ 'text-decoration-line-through text-muted': task.done }">
                {{ task.name }}
              </div>
              <div class="text-sub d-flex align-items-center gap-1" style="font-size: 10.5px;">
                <span class="badge bg-danger-subtle text-danger px-1 py-0 rounded">{{ task.level }}</span>
                <span>{{ task.deadline || 'Hari ini' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================
         DESKTOP DASHBOARD (d-none d-md-block)
         ========================================================= -->
    <div class="desktop-dashboard d-none d-md-block">
      <!-- 1. EXECUTIVE HERO HEADER -->
      <div class="executive-hero-card mb-4">
      <div class="hero-inner p-4 p-lg-5">
        <div class="row align-items-center g-4">
          <!-- Left: Greeting & Status -->
          <div class="col-lg-7 col-xl-8">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span class="badge-hero-capsule">
                <i class="bi bi-shield-check me-1.5 text-primary"></i>
                <span>TaskArts Workspace</span>
              </span>
              <span class="badge-hero-kafeinarts">
                <i class="bi bi-stars me-1 text-warning"></i>
                <span>By Kafeinarts</span>
              </span>
              <span v-if="isBudgetExceeded" class="badge-hero-alert">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                <span>Budget Exceeded</span>
              </span>
            </div>

            <h1 class="hero-title fw-extrabold mb-2">
              {{ greetingTime }}, <span class="text-gradient-primary">{{ displayName }}</span>
            </h1>
            <p class="hero-subtitle mb-4 text-muted">
              {{ welcomeBanner.subtitle || 'Pusat kendali produktivitas terpadu untuk mengelola proyek, to-do list, surat resmi, dan keuangan harian Anda.' }}
            </p>

            <!-- Quick Action Launcher Buttons -->
            <div class="d-flex flex-wrap align-items-center gap-2.5">
              <button
                type="button"
                class="btn btn-primary rounded-pill px-3.5 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                @click="openTaskModal"
              >
                <i class="bi bi-plus-circle-fill"></i>
                <span>Tambah Tugas Cepat</span>
              </button>

              <button
                type="button"
                class="btn btn-outline-primary rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-2"
                @click="openTransactionModal"
              >
                <i class="bi bi-wallet2"></i>
                <span>Catat Transaksi</span>
              </button>

              <router-link
                to="/surat"
                class="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
              >
                <i class="bi bi-file-earmark-richtext-fill text-primary"></i>
                <span>Buat Surat</span>
              </router-link>
            </div>
          </div>

          <!-- Right: Live Real-time Clock & System Snapshot -->
          <div class="col-lg-5 col-xl-4">
            <div class="system-snapshot-box p-3.5 p-sm-4 rounded-4 shadow-sm position-relative overflow-hidden">
              <div class="snapshot-card-ambient-glow"></div>

              <!-- Header: Live Pulse Indicator & Timezone Chip -->
              <div class="d-flex align-items-center justify-content-between mb-3 pb-2.5 border-bottom border-theme position-relative">
                <div class="d-flex align-items-center gap-2">
                  <div class="pulse-indicator-wrapper">
                    <span class="pulse-indicator-core"></span>
                    <span class="pulse-indicator-wave"></span>
                  </div>
                  <span class="small fw-extrabold text-sub text-uppercase tracking-wider snapshot-header-title">WAKTU AKTIF & TANGGAL</span>
                </div>
                <div class="d-flex align-items-center gap-1.5">
                  <span class="badge timezone-chip px-2.5 py-1 rounded-pill small fw-bold d-flex align-items-center gap-1.5 shadow-xs">
                    <i :class="timeOfDayIcon"></i>
                    <span>WIB (UTC+7)</span>
                  </span>
                </div>
              </div>

              <!-- Digital Clock Display Face -->
              <div class="live-clock-display-card mb-3 position-relative p-2.5 rounded-3">
                <div class="d-flex align-items-baseline justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-baseline gap-1">
                    <span class="clock-time-digits font-mono fw-extrabold">{{ currentHour }}:{{ currentMinute }}</span>
                    <span class="clock-seconds-badge font-mono fw-bold">:{{ currentSeconds }}</span>
                  </div>
                  <div class="greeting-time-pill small fw-bold px-2.5 py-1 rounded-pill">
                    {{ greetingTime }}
                  </div>
                </div>
                <div class="clock-date-row d-flex align-items-center gap-2 mt-2 pt-1 text-sub small fw-semibold">
                  <i class="bi bi-calendar3 text-primary fs-6"></i>
                  <span class="date-full-text">{{ currentDateFormatted }}</span>
                </div>
              </div>

              <!-- Quick Health Indicator -->
              <div class="mini-metrics-grid position-relative">
                <router-link to="/finance" class="mini-metric-item text-decoration-none">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="metric-label">Status Arus Kas</span>
                    <i class="bi bi-wallet2 text-sub small"></i>
                  </div>
                  <div class="metric-value text-truncate" :class="netProfit >= 0 ? 'text-success' : 'text-danger'">
                    {{ formatCurrency(netProfit) }}
                  </div>
                </router-link>
                <router-link to="/todo" class="mini-metric-item text-decoration-none">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="metric-label">Tugas Pending</span>
                    <i class="bi bi-check2-circle text-sub small"></i>
                  </div>
                  <div class="metric-value text-warning-emphasis fw-bold text-truncate">
                    {{ pendingTasksCount }} Tugas
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. EXECUTIVE 4-PILLAR KPI METRIC CARDS -->
    <div class="row g-3 mb-4">
      <!-- Card 1: Active Projects -->
      <div class="col-12 col-sm-6 col-xl-3">
        <router-link to="/project" class="kpi-card text-decoration-none">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="kpi-icon-box bg-primary-subtle text-primary">
              <i class="bi bi-briefcase-fill"></i>
            </div>
            <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small fw-bold">
              {{ activeProjectsCount }} Berjalan
            </span>
          </div>
          <div class="kpi-title text-sub small fw-bold text-uppercase">Proyek & Kontrak</div>
          <div class="kpi-value fw-extrabold text-main my-1">{{ activeProjectsCount }}</div>
          <div class="kpi-footer d-flex align-items-center justify-content-between text-sub small pt-2 border-top border-theme">
            <span>Lihat Timeline & Dokumen</span>
            <i class="bi bi-arrow-right text-primary"></i>
          </div>
        </router-link>
      </div>

      <!-- Card 2: Pending Tasks -->
      <div class="col-12 col-sm-6 col-xl-3">
        <router-link to="/todo" class="kpi-card text-decoration-none">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="kpi-icon-box bg-warning-subtle text-warning-emphasis">
              <i class="bi bi-kanban-fill"></i>
            </div>
            <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1 small fw-bold">
              {{ urgentTasksCount }} Prioritas
            </span>
          </div>
          <div class="kpi-title text-sub small fw-bold text-uppercase">Tugas & Kanban</div>
          <div class="kpi-value fw-extrabold text-main my-1">{{ pendingTasksCount }}</div>
          <div class="kpi-footer d-flex align-items-center justify-content-between text-sub small pt-2 border-top border-theme">
            <span>Buka 5 Mode Kanban</span>
            <i class="bi bi-arrow-right text-warning"></i>
          </div>
        </router-link>
      </div>

      <!-- Card 3: Cash Flow / Money Tracker -->
      <div class="col-12 col-sm-6 col-xl-3">
        <router-link to="/finance" class="kpi-card text-decoration-none">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="kpi-icon-box bg-success-subtle text-success">
              <i class="bi bi-wallet2"></i>
            </div>
            <span class="badge" :class="netProfit >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
              {{ netProfit >= 0 ? '+ Surplus' : '- Defisit' }}
            </span>
          </div>
          <div class="kpi-title text-sub small fw-bold text-uppercase">Saldo Bersih Kas</div>
          <div class="kpi-value fw-extrabold text-main my-1 text-truncate" :title="formatCurrency(netProfit)">
            {{ formatCurrency(netProfit) }}
          </div>
          <div class="kpi-footer d-flex align-items-center justify-content-between text-sub small pt-2 border-top border-theme">
            <span>Pemasukan: {{ formatCurrency(totalIncome) }}</span>
            <i class="bi bi-arrow-right text-success"></i>
          </div>
        </router-link>
      </div>

      <!-- Card 4: Clients & Contacts -->
      <div class="col-12 col-sm-6 col-xl-3">
        <router-link to="/contacts" class="kpi-card text-decoration-none">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="kpi-icon-box bg-info-subtle text-info">
              <i class="bi bi-person-lines-fill"></i>
            </div>
            <span class="badge bg-info-subtle text-info rounded-pill px-2.5 py-1 small fw-bold">
              Broadcast WA
            </span>
          </div>
          <div class="kpi-title text-sub small fw-bold text-uppercase">Kontak & Klien</div>
          <div class="kpi-value fw-extrabold text-main my-1">{{ totalClientsCount }}</div>
          <div class="kpi-footer d-flex align-items-center justify-content-between text-sub small pt-2 border-top border-theme">
            <span>Kelola Hubungan Klien</span>
            <i class="bi bi-arrow-right text-info"></i>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 3. DASHBOARD WORKSPACE TABS -->
    <div class="workspace-tabs-wrapper mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 border-bottom border-theme">
        <div class="nav-pills-dashboard d-flex align-items-center gap-2">
          <button
            type="button"
            class="dash-tab-btn"
            :class="{ active: activeTab === 'tasks' }"
            @click="activeTab = 'tasks'"
          >
            <i class="bi bi-check2-circle me-1.5"></i>
            <span>Tugas & Aktivitas</span>
            <span class="tab-count-pill ms-1">{{ pendingTasksCount }}</span>
          </button>

          <button
            type="button"
            class="dash-tab-btn"
            :class="{ active: activeTab === 'launchpad' }"
            @click="activeTab = 'launchpad'"
          >
            <i class="bi bi-grid-fill me-1.5"></i>
            <span>Pusat Fitur (Launchpad)</span>
          </button>

          <button
            type="button"
            class="dash-tab-btn"
            :class="{ active: activeTab === 'visual' }"
            @click="activeTab = 'visual'"
          >
            <i class="bi bi-boxes me-1.5"></i>
            <span>Analytics & 3D Studio</span>
            <span class="badge bg-primary text-white ms-1 small" style="font-size: 10px;">Three.js</span>
          </button>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-theme rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
            @click="refreshDataToast"
          >
            <i class="bi bi-arrow-clockwise"></i>
            <span>Segarkan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 4. TAB CONTENTS -->

    <!-- TAB 1: TASKS & REAL-TIME ACTIVITY -->
    <div v-show="activeTab === 'tasks'" class="tab-content-pane">
      <div class="row g-4">
        <!-- Left: Immediate Tasks & Fast Inline Task Adder -->
        <div class="col-lg-7 col-xl-8">
          <div class="content-card p-4">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom border-theme">
              <div class="d-flex align-items-center gap-2">
                <div class="section-icon-box bg-primary-subtle text-primary">
                  <i class="bi bi-list-task"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0 text-main">Tugas Mendesak & Prioritas</h5>
                  <small class="text-sub">Fokus pada agenda penting hari ini</small>
                </div>
              </div>

              <!-- Filter Selector -->
              <div class="d-flex align-items-center gap-1.5 bg-theme-subtle p-1 rounded-pill border border-theme">
                <button
                  type="button"
                  class="btn-filter-pill"
                  :class="{ active: taskFilter === 'all' }"
                  @click="taskFilter = 'all'"
                >
                  Semua ({{ allTasksList.length }})
                </button>
                <button
                  type="button"
                  class="btn-filter-pill"
                  :class="{ active: taskFilter === 'pending' }"
                  @click="taskFilter = 'pending'"
                >
                  Pending ({{ pendingTasksCount }})
                </button>
                <button
                  type="button"
                  class="btn-filter-pill"
                  :class="{ active: taskFilter === 'urgent' }"
                  @click="taskFilter = 'urgent'"
                >
                  Penting
                </button>
              </div>
            </div>

            <!-- Fast Inline Task Creator -->
            <form @submit.prevent="submitFastTask" class="fast-task-form mb-4">
              <div class="input-group search-input-group rounded-3 p-1">
                <span class="input-group-text bg-transparent border-0 text-primary ps-2">
                  <i class="bi bi-plus-lg"></i>
                </span>
                <input
                  v-model="fastTaskTitle"
                  type="text"
                  class="form-control bg-transparent border-0 shadow-none text-main"
                  placeholder="Tulis tugas baru lalu tekan Enter (cth: Review kontrak klien PT ABC)..."
                  required
                />
                <select v-model="fastTaskLevel" class="form-select bg-transparent border-0 shadow-none text-sub w-auto py-1" style="max-width: 120px;">
                  <option value="Penting">🔴 Penting</option>
                  <option value="Menengah">🟡 Menengah</option>
                  <option value="Rendah">🟢 Rendah</option>
                </select>
                <button type="submit" class="btn btn-primary rounded-2 px-3 fw-bold">
                  Simpan
                </button>
              </div>
            </form>

            <!-- Task List Display -->
            <div v-if="filteredTasks.length > 0" class="d-flex flex-column gap-2.5">
              <div
                v-for="task in filteredTasks"
                :key="task.id"
                class="task-item-row p-3 rounded-3 d-flex align-items-center justify-content-between gap-3"
                :class="{ 'task-done': task.done }"
              >
                <div class="d-flex align-items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    class="form-check-input task-check-input"
                    :checked="task.done"
                    @change="toggleTaskDone(task.id)"
                    :id="'task-' + task.id"
                  />
                  <label :for="'task-' + task.id" class="d-block cursor-pointer mb-0">
                    <span
                      class="task-title fw-bold text-main d-block text-truncate"
                      :class="{ 'text-decoration-line-through text-muted': task.done }"
                    >
                      {{ task.name }}
                    </span>
                    <div class="d-flex align-items-center gap-2 mt-0.5 text-sub small">
                      <span class="badge bg-secondary-subtle text-secondary px-2 py-0.5 rounded-pill" style="font-size: 11px;">
                        {{ task.projectTag || 'Umum' }}
                      </span>
                      <span>Target: {{ task.deadline || 'Hari ini' }}</span>
                    </div>
                  </label>
                </div>

                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                  <span :class="badgeClass(task.level)" class="badge px-2.5 py-1 rounded-pill small fw-bold">
                    {{ task.level }}
                  </span>
                  <router-link to="/todo" class="btn-icon-subtle" title="Buka di Kanban">
                    <i class="bi bi-box-arrow-up-right"></i>
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-task-box text-center py-5 rounded-4 border border-dashed border-theme">
              <div class="empty-icon-circle mx-auto mb-3 text-muted">
                <i class="bi bi-check2-all fs-2"></i>
              </div>
              <h6 class="fw-bold text-main mb-1">Tidak Ada Tugas di Filter Ini</h6>
              <p class="small text-sub mb-3">Semua agenda prioritas saat ini telah selesai atau belum ditambahkan.</p>
              <button
                type="button"
                class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold"
                @click="openTaskModal"
              >
                + Buat Tugas Baru
              </button>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-theme">
              <span class="text-sub small">Menampilkan {{ filteredTasks.length }} tugas</span>
              <router-link to="/todo" class="text-primary text-decoration-none fw-bold small d-flex align-items-center gap-1">
                <span>Buka Seluruh 5 Mode Tampilan To-Do</span>
                <i class="bi bi-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Right: Recent Financial Transactions & Daily Motivation -->
        <div class="col-lg-5 col-xl-4">
          <!-- Recent Transactions Card -->
          <div class="content-card p-4 mb-4">
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-theme">
              <div class="d-flex align-items-center gap-2">
                <div class="section-icon-box bg-success-subtle text-success">
                  <i class="bi bi-receipt-cutoff"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 text-main">Arus Kas Terkini</h6>
                  <small class="text-sub">Catatan mutasi terbaru</small>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-success rounded-pill px-2.5 py-1 small fw-bold"
                @click="openTransactionModal"
              >
                + Catat
              </button>
            </div>

            <div v-if="recentTransactions.length > 0" class="d-flex flex-column gap-2">
              <div
                v-for="item in recentTransactions"
                :key="item.id"
                class="tx-item-row p-2.5 rounded-3 d-flex align-items-center justify-content-between"
              >
                <div class="d-flex align-items-center gap-2.5 min-w-0">
                  <div
                    class="tx-direction-icon"
                    :class="item.type === 'income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
                  >
                    <i :class="item.type === 'income' ? 'bi bi-arrow-down-left' : 'bi bi-arrow-up-right'"></i>
                  </div>
                  <div class="text-truncate">
                    <div class="fw-bold text-main small text-truncate">{{ item.description || item.category || 'Mutasi Kas' }}</div>
                    <div class="text-sub" style="font-size: 11px;">{{ item.date }} • {{ item.category }}</div>
                  </div>
                </div>
                <div
                  class="fw-bold text-nowrap small"
                  :class="item.type === 'income' ? 'text-success' : 'text-danger'"
                >
                  {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 text-sub small border border-dashed border-theme rounded-3">
              Belum ada mutasi tercatat. Klik tombol '+ Catat' untuk merekam transaksi kas.
            </div>

            <router-link
              to="/finance"
              class="btn btn-outline-theme w-100 rounded-pill mt-3 py-2 small fw-bold d-flex align-items-center justify-content-center gap-1.5"
            >
              <span>Buka Financial Tracker Lengkap</span>
              <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: SMART APP LAUNCHPAD -->
    <div v-show="activeTab === 'launchpad'" class="tab-content-pane">
      <div class="launchpad-container">
        <div class="row g-4">
          <!-- Group 1: Workspace & Proyek -->
          <div class="col-12 col-md-6 col-xl-3">
            <div class="launchpad-group-card p-4 h-100">
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-theme">
                <div class="group-badge-icon bg-primary text-white">
                  <i class="bi bi-kanban"></i>
                </div>
                <h6 class="fw-bold mb-0 text-main">Workspace & Proyek</h6>
              </div>
              <div class="d-flex flex-column gap-2">
                <router-link to="/todo" class="launch-item">
                  <div class="launch-icon text-warning"><i class="bi bi-check2-square"></i></div>
                  <div>
                    <div class="launch-label">To-Do & Kanban OS</div>
                    <small class="launch-sub">5 mode tampilan tugas</small>
                  </div>
                </router-link>
                <router-link to="/project" class="launch-item">
                  <div class="launch-icon text-primary"><i class="bi bi-briefcase-fill"></i></div>
                  <div>
                    <div class="launch-label">Proyek & Kontrak</div>
                    <small class="launch-sub">Milestones & progress</small>
                  </div>
                </router-link>
                <router-link to="/calendar" class="launch-item">
                  <div class="launch-icon text-info"><i class="bi bi-calendar3"></i></div>
                  <div>
                    <div class="launch-label">Kalender & Agenda</div>
                    <small class="launch-sub">Jadwal deadline kerja</small>
                  </div>
                </router-link>
                <router-link to="/time-suite" class="launch-item">
                  <div class="launch-icon text-success"><i class="bi bi-clock-history"></i></div>
                  <div>
                    <div class="launch-label">Time Suite & Pomodoro</div>
                    <small class="launch-sub">Fokus sesi & stopwatch</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Group 2: Dokumen & Generator -->
          <div class="col-12 col-md-6 col-xl-3">
            <div class="launchpad-group-card p-4 h-100">
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-theme">
                <div class="group-badge-icon bg-success text-white">
                  <i class="bi bi-file-earmark-text-fill"></i>
                </div>
                <h6 class="fw-bold mb-0 text-main">Dokumen & Legal</h6>
              </div>
              <div class="d-flex flex-column gap-2">
                <router-link to="/surat" class="launch-item">
                  <div class="launch-icon text-primary"><i class="bi bi-file-earmark-richtext-fill"></i></div>
                  <div>
                    <div class="launch-label">Surat Generator Resmi</div>
                    <small class="launch-sub">Kop surat, tanda tangan, PDF A4</small>
                  </div>
                </router-link>
                <router-link to="/cv" class="launch-item">
                  <div class="launch-icon text-success"><i class="bi bi-person-vcard-fill"></i></div>
                  <div>
                    <div class="launch-label">CV & Resume Builder ATS</div>
                    <small class="launch-sub">Standar lamaran kerja modern</small>
                  </div>
                </router-link>
                <router-link to="/invoice" class="launch-item">
                  <div class="launch-icon text-indigo"><i class="bi bi-receipt"></i></div>
                  <div>
                    <div class="launch-label">Invoice Generator</div>
                    <small class="launch-sub">Tagihan klien & pembayaran</small>
                  </div>
                </router-link>
                <router-link to="/camera" class="launch-item">
                  <div class="launch-icon text-danger"><i class="bi bi-camera-fill"></i></div>
                  <div>
                    <div class="launch-label">Kamera & Scan Dokumen</div>
                    <small class="launch-sub">Digitalisasi berkas fisik</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Group 3: Keuangan & Komunikasi -->
          <div class="col-12 col-md-6 col-xl-3">
            <div class="launchpad-group-card p-4 h-100">
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-theme">
                <div class="group-badge-icon bg-warning text-dark">
                  <i class="bi bi-cash-stack"></i>
                </div>
                <h6 class="fw-bold mb-0 text-main">Keuangan & Relasi</h6>
              </div>
              <div class="d-flex flex-column gap-2">
                <router-link to="/finance" class="launch-item">
                  <div class="launch-icon text-success"><i class="bi bi-wallet2"></i></div>
                  <div>
                    <div class="launch-label">Money Tracker</div>
                    <small class="launch-sub">Catat pemasukan & pengeluaran</small>
                  </div>
                </router-link>
                <router-link to="/rab" class="launch-item">
                  <div class="launch-icon text-primary"><i class="bi bi-calculator-fill"></i></div>
                  <div>
                    <div class="launch-label">RAB & Kas Kegiatan</div>
                    <small class="launch-sub">Rencana anggaran operasional</small>
                  </div>
                </router-link>
                <router-link to="/contacts" class="launch-item">
                  <div class="launch-icon text-info"><i class="bi bi-person-lines-fill"></i></div>
                  <div>
                    <div class="launch-label">Kontak Tim & WA Broadcast</div>
                    <small class="launch-sub">Kirim pesan WhatsApp instan</small>
                  </div>
                </router-link>
                <router-link to="/chat-ai" class="launch-item">
                  <div class="launch-icon text-teal"><i class="bi bi-robot"></i></div>
                  <div>
                    <div class="launch-label">Live Chat AI Assistant</div>
                    <small class="launch-sub">Tanya jawab & ide cerdas</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Group 4: Kreativitas & Produktivitas -->
          <div class="col-12 col-md-6 col-xl-3">
            <div class="launchpad-group-card p-4 h-100">
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-theme">
                <div class="group-badge-icon bg-info text-white">
                  <i class="bi bi-pencil-square"></i>
                </div>
                <h6 class="fw-bold mb-0 text-main">Ide & Relaksasi</h6>
              </div>
              <div class="d-flex flex-column gap-2">
                <router-link to="/quick-capture" class="launch-item">
                  <div class="launch-icon text-warning"><i class="bi bi-lightning-charge-fill"></i></div>
                  <div>
                    <div class="launch-label">Quick Capture</div>
                    <small class="launch-sub">Catat ide kilat & alarm</small>
                  </div>
                </router-link>
                <router-link to="/notes" class="launch-item">
                  <div class="launch-icon text-secondary"><i class="bi bi-journal-text"></i></div>
                  <div>
                    <div class="launch-label">Sticky Notes & Scratchpad</div>
                    <small class="launch-sub">Markdown & draft ide</small>
                  </div>
                </router-link>
                <router-link to="/diary" class="launch-item">
                  <div class="launch-icon text-warning"><i class="bi bi-book-half"></i></div>
                  <div>
                    <div class="launch-label">Diary & Jurnal Cerita</div>
                    <small class="launch-sub">Cerita harian & kenangan foto</small>
                  </div>
                </router-link>
                <router-link to="/games" class="launch-item">
                  <div class="launch-icon text-purple"><i class="bi bi-controller"></i></div>
                  <div>
                    <div class="launch-label">3D Games & Simulator</div>
                    <small class="launch-sub">Refreshment & game kantor</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: VISUAL ANALYTICS & 3D STUDIO -->
    <div v-show="activeTab === 'visual'" class="tab-content-pane">
      <div class="content-card p-4 mb-4">
        <!-- Sub-switcher for Visual Studios -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-3 border-bottom border-theme">
          <div>
            <h5 class="fw-bold mb-1 text-main">
              <i class="bi bi-boxes me-2 text-primary"></i>Visual Analytics & 3D Interactive Hub
            </h5>
            <small class="text-sub">Eksplorasi metrik produktivitas dan visualisasi 3D kantor Anda</small>
          </div>

          <div class="d-flex align-items-center gap-2 bg-theme-subtle p-1 rounded-pill border border-theme">
            <button
              type="button"
              class="btn-sub-tab"
              :class="{ active: activeVisualTab === 'productivity' }"
              @click="activeVisualTab = 'productivity'"
            >
              <i class="bi bi-bar-chart-fill me-1"></i>
              <span>Produktivitas D3.js</span>
            </button>
            <button
              type="button"
              class="btn-sub-tab"
              :class="{ active: activeVisualTab === 'frame' }"
              @click="activeVisualTab = 'frame'"
            >
              <i class="bi bi-palette-fill me-1"></i>
              <span>Bingkai Motivasi 3D</span>
            </button>
            <button
              type="button"
              class="btn-sub-tab"
              :class="{ active: activeVisualTab === 'workspace' }"
              @click="activeVisualTab = 'workspace'"
            >
              <i class="bi bi-display me-1"></i>
              <span>3D Setup Simulator</span>
            </button>
          </div>
        </div>

        <!-- Render active visual component -->
        <div v-if="activeVisualTab === 'productivity'">
          <ProductivityDashboard />
        </div>

        <div v-else-if="activeVisualTab === 'frame'">
          <MotivationalFrame3D />
        </div>

        <div v-else-if="activeVisualTab === 'workspace'">
          <Workspace3DSimulator />
        </div>
      </div>
    </div>
    </div> <!-- /desktop-dashboard -->

    <!-- QUICK TASK MODAL -->
    <div
      v-if="showTaskModal"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center"
      @click.self="showTaskModal = false"
    >
      <div class="modal-dialog-custom content-card p-4 rounded-4 shadow-lg" style="max-width: 500px; width: 90%;">
        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-theme">
          <div class="d-flex align-items-center gap-2">
            <div class="section-icon-box bg-primary-subtle text-primary">
              <i class="bi bi-plus-circle-fill"></i>
            </div>
            <h5 class="fw-bold mb-0 text-main">Tambah Tugas Baru</h5>
          </div>
          <button type="button" class="btn-close" @click="showTaskModal = false"></button>
        </div>

        <form @submit.prevent="submitModalTask">
          <div class="mb-3">
            <label class="form-label small fw-bold text-sub">Nama / Deskripsi Tugas</label>
            <input
              v-model="modalTaskName"
              type="text"
              class="form-control"
              placeholder="Contoh: Selesaikan revisi laporan keuangan triwulan..."
              required
            />
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold text-sub">Tingkat Prioritas</label>
              <select v-model="modalTaskLevel" class="form-select">
                <option value="Penting">🔴 Penting (Urgent)</option>
                <option value="Menengah">🟡 Menengah (Normal)</option>
                <option value="Rendah">🟢 Rendah (Low)</option>
              </select>
            </div>

            <div class="col-6">
              <label class="form-label small fw-bold text-sub">Kategori / Proyek</label>
              <input
                v-model="modalTaskProject"
                type="text"
                class="form-control"
                placeholder="Umum / Proyek A"
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-bold text-sub">Target Deadline</label>
            <input
              v-model="modalTaskDeadline"
              type="date"
              class="form-control"
            />
          </div>

          <div class="d-flex align-items-center justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-outline-theme rounded-pill px-3 py-1.5"
              @click="showTaskModal = false"
            >
              Batal
            </button>
            <button type="submit" class="btn btn-primary rounded-pill px-4 py-1.5 fw-bold">
              Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- QUICK TRANSACTION MODAL -->
    <div
      v-if="showTxModal"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center"
      @click.self="showTxModal = false"
    >
      <div class="modal-dialog-custom content-card p-4 rounded-4 shadow-lg" style="max-width: 500px; width: 90%;">
        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-theme">
          <div class="d-flex align-items-center gap-2">
            <div class="section-icon-box bg-success-subtle text-success">
              <i class="bi bi-wallet2"></i>
            </div>
            <h5 class="fw-bold mb-0 text-main">Catat Transaksi Kas Cepat</h5>
          </div>
          <button type="button" class="btn-close" @click="showTxModal = false"></button>
        </div>

        <form @submit.prevent="submitModalTx">
          <div class="mb-3">
            <label class="form-label small fw-bold text-sub">Tipe Transaksi</label>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn flex-fill fw-bold rounded-pill"
                :class="modalTxType === 'income' ? 'btn-success text-white' : 'btn-outline-theme'"
                @click="modalTxType = 'income'"
              >
                <i class="bi bi-arrow-down-left me-1"></i>Pemasukan (Income)
              </button>
              <button
                type="button"
                class="btn flex-fill fw-bold rounded-pill"
                :class="modalTxType === 'expense' ? 'btn-danger text-white' : 'btn-outline-theme'"
                @click="modalTxType = 'expense'"
              >
                <i class="bi bi-arrow-up-right me-1"></i>Pengeluaran (Expense)
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold text-sub">Nominal (Rp)</label>
            <input
              v-model.number="modalTxAmount"
              type="number"
              min="1"
              step="1000"
              class="form-control fw-bold"
              placeholder="Contoh: 250000"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold text-sub">Keterangan Transaksi</label>
            <input
              v-model="modalTxDesc"
              type="text"
              class="form-control"
              placeholder="Contoh: Honor desain logo, Biaya internet..."
              required
            />
          </div>

          <div class="row g-2 mb-4">
            <div class="col-6">
              <label class="form-label small fw-bold text-sub">Kategori</label>
              <select v-model="modalTxCategory" class="form-select">
                <option value="Operasional">Operasional</option>
                <option value="Proyek & Jasa">Proyek & Jasa</option>
                <option value="Gaji & Honor">Gaji & Honor</option>
                <option value="Peralatan">Peralatan & Aset</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div class="col-6">
              <label class="form-label small fw-bold text-sub">Tanggal</label>
              <input
                v-model="modalTxDate"
                type="date"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-outline-theme rounded-pill px-3 py-1.5"
              @click="showTxModal = false"
            >
              Batal
            </button>
            <button type="submit" class="btn btn-success text-white rounded-pill px-4 py-1.5 fw-bold">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useStore } from 'vuex';

const ProductivityDashboard = defineAsyncComponent(() => import('@/components/ProductivityDashboard.vue'));
const Workspace3DSimulator = defineAsyncComponent(() => import('@/components/Workspace3DSimulator.vue'));
const MotivationalFrame3D = defineAsyncComponent(() => import('@/components/MotivationalFrame3D.vue'));

export default {
  name: 'HomeView',
  components: {
    ProductivityDashboard,
    MotivationalFrame3D,
    Workspace3DSimulator
  },
  setup() {
    const store = useStore();

    // Mobile Launcher Reactive State
    const mobileSearch = ref('');
    const mobileCategory = ref('all');

    const mobileCategories = [
      { id: 'all', label: 'Semua Fitur', icon: 'bi-grid-fill' },
      { id: 'work', label: 'Tugas & Proyek', icon: 'bi-briefcase-fill' },
      { id: 'docs', label: 'Surat & Dokumen', icon: 'bi-file-earmark-richtext-fill' },
      { id: 'finance', label: 'Keuangan & Kas', icon: 'bi-wallet2' },
      { id: 'comm', label: 'Tim & Chat AI', icon: 'bi-people-fill' },
      { id: 'tools', label: 'Alat Produktif', icon: 'bi-lightning-charge-fill' },
      { id: 'media', label: 'Media & Hiburan', icon: 'bi-controller' }
    ];

    // Active Navigation Tabs (Desktop)
    const activeTab = ref('tasks'); // 'tasks', 'launchpad', 'visual'
    const activeVisualTab = ref('productivity'); // 'productivity', 'frame', 'workspace'
    const taskFilter = ref('pending'); // 'all', 'pending', 'urgent'

    // Fast inline task
    const fastTaskTitle = ref('');
    const fastTaskLevel = ref('Penting');

    // Modals
    const showTaskModal = ref(false);
    const modalTaskName = ref('');
    const modalTaskLevel = ref('Penting');
    const modalTaskProject = ref('Umum');
    const modalTaskDeadline = ref(new Date().toISOString().split('T')[0]);

    const showTxModal = ref(false);
    const modalTxType = ref('income');
    const modalTxAmount = ref(null);
    const modalTxDesc = ref('');
    const modalTxCategory = ref('Operasional');
    const modalTxDate = ref(new Date().toISOString().split('T')[0]);

    // Live Clock State
    const now = ref(new Date());
    let timer = null;

    onMounted(() => {
      timer = setInterval(() => {
        now.value = new Date();
      }, 1000);
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const currentTimeFormatted = computed(() => {
      return now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });

    const currentDateFormatted = computed(() => {
      return now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    });

    const currentHour = computed(() => {
      return String(now.value.getHours()).padStart(2, '0');
    });

    const currentMinute = computed(() => {
      return String(now.value.getMinutes()).padStart(2, '0');
    });

    const currentSeconds = computed(() => {
      return String(now.value.getSeconds()).padStart(2, '0');
    });

    const timeOfDayIcon = computed(() => {
      const h = now.value.getHours();
      if (h >= 5 && h < 11) return 'bi bi-sun-fill text-warning';
      if (h >= 11 && h < 15) return 'bi bi-brightness-high-fill text-warning';
      if (h >= 15 && h < 18) return 'bi bi-sunset-fill text-warning-emphasis';
      return 'bi bi-moon-stars-fill text-primary';
    });

    // Time-based Greeting
    const greetingTime = computed(() => {
      const hour = now.value.getHours();
      if (hour >= 4 && hour < 11) return 'Selamat Pagi';
      if (hour >= 11 && hour < 15) return 'Selamat Siang';
      if (hour >= 15 && hour < 18) return 'Selamat Sore';
      return 'Selamat Malam';
    });

    const myBusiness = computed(() => store.getters.getMyBusiness);
    const welcomeBanner = computed(() => store.getters.getWelcomeBanner);
    const displayName = computed(() => {
      return myBusiness.value?.owner || 'Rekan Kerja';
    });

    // Store Metrics
    const pendingTasksCount = computed(() => store.getters.pendingTasksCount);
    const activeProjectsCount = computed(() => store.getters.activeProjectsCount);
    const totalClientsCount = computed(() => store.getters.totalClientsCount);
    const totalIncome = computed(() => store.getters.totalIncome);
    const totalExpense = computed(() => store.getters.totalExpense);
    const netProfit = computed(() => store.getters.netProfit);
    const isBudgetExceeded = computed(() => store.getters.isBudgetExceeded);
    const budgetThreshold = computed(() => store.getters.getBudgetThreshold);

    const allTasksList = computed(() => store.getters.getTasks || []);

    const urgentTasksCount = computed(() => {
      return allTasksList.value.filter(t => !t.done && (t.level === 'Penting' || t.level === 'Tinggi')).length;
    });

    // Filtered Tasks for Tab 1
    const filteredTasks = computed(() => {
      const list = allTasksList.value;
      if (taskFilter.value === 'pending') {
        return list.filter(t => !t.done);
      }
      if (taskFilter.value === 'urgent') {
        return list.filter(t => !t.done && (t.level === 'Penting' || t.level === 'Tinggi'));
      }
      return list;
    });

    // Recent Transactions
    const recentTransactions = computed(() => {
      const txs = store.getters.getTransactions || [];
      return txs.slice(-4).reverse();
    });

    // Actions
    const toggleTaskDone = (id) => {
      store.dispatch('toggleTask', id);
    };

    const submitFastTask = () => {
      if (!fastTaskTitle.value.trim()) return;
      store.dispatch('addTask', {
        name: fastTaskTitle.value.trim(),
        level: fastTaskLevel.value,
        projectTag: 'Umum',
        deadline: new Date().toISOString().split('T')[0],
        done: false
      });
      fastTaskTitle.value = '';
    };

    const openTaskModal = () => {
      modalTaskName.value = '';
      modalTaskLevel.value = 'Penting';
      modalTaskProject.value = 'Umum';
      modalTaskDeadline.value = new Date().toISOString().split('T')[0];
      showTaskModal.value = true;
    };

    const submitModalTask = () => {
      if (!modalTaskName.value.trim()) return;
      store.dispatch('addTask', {
        name: modalTaskName.value.trim(),
        level: modalTaskLevel.value,
        projectTag: modalTaskProject.value || 'Umum',
        deadline: modalTaskDeadline.value,
        done: false
      });
      showTaskModal.value = false;
    };

    const openTransactionModal = () => {
      modalTxAmount.value = null;
      modalTxDesc.value = '';
      modalTxDate.value = new Date().toISOString().split('T')[0];
      showTxModal.value = true;
    };

    const submitModalTx = () => {
      if (!modalTxAmount.value || modalTxAmount.value <= 0) return;
      store.dispatch('addTransaction', {
        type: modalTxType.value,
        amount: Number(modalTxAmount.value),
        description: modalTxDesc.value.trim() || modalTxCategory.value,
        category: modalTxCategory.value,
        date: modalTxDate.value
      });
      showTxModal.value = false;
    };

    const refreshDataToast = () => {
      // Visual feedback
      const btn = event?.currentTarget;
      if (btn) {
        btn.classList.add('opacity-50');
        setTimeout(() => btn.classList.remove('opacity-50'), 400);
      }
    };

    // Mobile Quick Access Apps Launcher Catalog
    const quickAccessApps = [
      // Tugas & Proyek
      { id: 'todo', title: 'To-Do List', category: 'work', icon: 'bi-check2-square', to: '/todo', bgGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', badge: () => pendingTasksCount.value ? `${pendingTasksCount.value}` : null, badgeClass: 'bg-primary' },
      { id: 'project', title: 'Proyek Kerja', category: 'work', icon: 'bi-briefcase-fill', to: '/project', bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)', badge: () => activeProjectsCount.value ? `${activeProjectsCount.value}` : null, badgeClass: 'bg-info' },
      { id: 'calendar', title: 'Kalender', category: 'work', icon: 'bi-calendar3', to: '/calendar', bgGradient: 'linear-gradient(135deg, #ea580c, #c2410c)' },
      { id: 'time-suite', title: 'Pomodoro', category: 'work', icon: 'bi-clock-history', to: '/time-suite', bgGradient: 'linear-gradient(135deg, #16a34a, #15803d)' },

      // Dokumen & Surat
      { id: 'surat', title: 'Surat Resmi', category: 'docs', icon: 'bi-file-earmark-richtext-fill', to: '/surat', bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', badge: () => 'Kop', badgeClass: 'bg-primary' },
      { id: 'cv', title: 'CV ATS', category: 'docs', icon: 'bi-person-vcard-fill', to: '/cv', bgGradient: 'linear-gradient(135deg, #10b981, #047857)', badge: () => 'ATS', badgeClass: 'bg-success' },
      { id: 'invoice', title: 'Invoice', category: 'docs', icon: 'bi-receipt', to: '/invoice', bgGradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
      { id: 'camera', title: 'Scan Kamera', category: 'docs', icon: 'bi-camera-fill', to: '/camera', bgGradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },

      // Keuangan & Kas
      { id: 'finance', title: 'Kas & Finansial', category: 'finance', icon: 'bi-wallet2', to: '/finance', bgGradient: 'linear-gradient(135deg, #2563eb, #1e40af)', badge: () => isBudgetExceeded.value ? '!' : null, badgeClass: 'bg-danger' },
      { id: 'rab', title: 'RAB Anggaran', category: 'finance', icon: 'bi-calculator-fill', to: '/rab', bgGradient: 'linear-gradient(135deg, #059669, #065f46)', badge: () => 'NEW', badgeClass: 'bg-success' },
      { id: 'sql', title: 'SQL Studio', category: 'finance', icon: 'bi-database-fill-gear', to: '/sql', bgGradient: 'linear-gradient(135deg, #d97706, #b45309)' },

      // Tim & Komunikasi
      { id: 'contacts', title: 'Kontak & Tim', category: 'comm', icon: 'bi-person-lines-fill', to: '/contacts', bgGradient: 'linear-gradient(135deg, #10b981, #059669)', badge: () => 'WA', badgeClass: 'bg-success' },
      { id: 'chat-ai', title: 'Chat AI Asisten', category: 'comm', icon: 'bi-robot', to: '/chat-ai', bgGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', badge: () => 'AI', badgeClass: 'bg-info' },

      // Alat Produktif
      { id: 'quick-capture', title: 'Quick Capture', category: 'tools', icon: 'bi-lightning-charge-fill', to: '/quick-capture', bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      { id: 'productivity-insights', title: 'Insights D3', category: 'tools', icon: 'bi-bar-chart-line-fill', to: '/productivity-insights', bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', badge: () => 'D3', badgeClass: 'bg-primary' },
      { id: 'notes', title: 'Sticky Notes', category: 'tools', icon: 'bi-journal-text', to: '/notes', bgGradient: 'linear-gradient(135deg, #64748b, #475569)' },
      { id: 'code-notes', title: 'Code Snippets', category: 'tools', icon: 'bi-code-slash', to: '/code-notes', bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)' },

      // Media & Hiburan
      { id: 'diary', title: 'Diary & Jurnal', category: 'media', icon: 'bi-book-half', to: '/diary', bgGradient: 'linear-gradient(135deg, #ca8a04, #a16207)' },
      { id: 'videos', title: 'Video Sync', category: 'media', icon: 'bi-play-btn-fill', to: '/videos', bgGradient: 'linear-gradient(135deg, #dc2626, #991b1b)' },
      { id: 'games', title: '3D Games', category: 'media', icon: 'bi-controller', to: '/games', bgGradient: 'linear-gradient(135deg, #9333ea, #7e22ce)' },
      { id: 'mood', title: 'Kamera Mood', category: 'media', icon: 'bi-emoji-smile-fill', to: '/mood', bgGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },

      // Sistem & Preferensi
      { id: 'preferences', title: 'Pengaturan', category: 'tools', icon: 'bi-sliders', to: '/preferences', bgGradient: 'linear-gradient(135deg, #475569, #334155)' },
      { id: 'faq', title: 'Panduan FAQ', category: 'tools', icon: 'bi-question-circle-fill', to: '/faq', bgGradient: 'linear-gradient(135deg, #0891b2, #0e7490)' },
      { id: 'developer', title: 'Developer', category: 'tools', icon: 'bi-person-badge-fill', to: '/developer', bgGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }
    ];

    const filteredQuickApps = computed(() => {
      let list = quickAccessApps;
      if (mobileCategory.value !== 'all') {
        list = list.filter(app => app.category === mobileCategory.value);
      }
      const q = mobileSearch.value.trim().toLowerCase();
      if (q) {
        list = list.filter(app =>
          app.title.toLowerCase().includes(q) ||
          app.id.toLowerCase().includes(q)
        );
      }
      return list;
    });

    const topUrgentTasks = computed(() => {
      return allTasksList.value
        .filter(t => !t.done)
        .slice(0, 3);
    });

    const formatCurrencyShort = (val) => {
      if (!val || isNaN(val)) return 'Rp 0';
      if (Math.abs(val) >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + ' M';
      if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' jt';
      if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(0) + ' rb';
      return 'Rp ' + val.toLocaleString('id-ID');
    };

    const formatCurrency = (val) => {
      if (isNaN(val) || val === null || val === undefined) val = 0;
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const badgeClass = (level) => {
      switch (level) {
        case 'Penting':
        case 'Tinggi':
          return 'bg-danger text-white';
        case 'Menengah':
          return 'bg-warning text-dark';
        default:
          return 'bg-secondary text-white';
      }
    };

    return {
      mobileSearch,
      mobileCategory,
      mobileCategories,
      quickAccessApps,
      filteredQuickApps,
      topUrgentTasks,
      formatCurrencyShort,
      activeTab,
      activeVisualTab,
      taskFilter,
      fastTaskTitle,
      fastTaskLevel,
      showTaskModal,
      modalTaskName,
      modalTaskLevel,
      modalTaskProject,
      modalTaskDeadline,
      showTxModal,
      modalTxType,
      modalTxAmount,
      modalTxDesc,
      modalTxCategory,
      modalTxDate,
      currentTimeFormatted,
      currentDateFormatted,
      currentHour,
      currentMinute,
      currentSeconds,
      timeOfDayIcon,
      greetingTime,
      myBusiness,
      welcomeBanner,
      displayName,
      pendingTasksCount,
      activeProjectsCount,
      totalClientsCount,
      totalIncome,
      totalExpense,
      netProfit,
      isBudgetExceeded,
      budgetThreshold,
      allTasksList,
      urgentTasksCount,
      filteredTasks,
      recentTransactions,
      toggleTaskDone,
      submitFastTask,
      openTaskModal,
      submitModalTask,
      openTransactionModal,
      submitModalTx,
      refreshDataToast,
      formatCurrency,
      badgeClass
    };
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
}

/* =========================================================
   MOBILE DASHBOARD & MATERIAL DESIGN LAUNCHER STYLES
   ========================================================= */
.mobile-dashboard {
  padding-bottom: 24px;
}

.m3-chip-brand {
  display: inline-flex;
  align-items: center;
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.m3-time-chip {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-main);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.m3-stats-strip {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}

.m3-stat-item {
  padding: 4px;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.m3-stat-item:active {
  transform: scale(0.95);
}

.m3-stat-value {
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
}

.m3-stat-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 1px;
}

.m3-stat-divider {
  width: 1px;
  height: 28px;
  background-color: var(--border-color);
  opacity: 0.6;
}

.m3-search-bar {
  background: var(--bg-surface);
  border-color: var(--border-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.m3-search-bar:focus-within {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.m3-category-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.m3-category-scroll::-webkit-scrollbar {
  display: none;
}

/* 4-Column Material Icon Grid (Vuetify / Quasar Style) */
.m3-app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 8px;
}

@media (max-width: 340px) {
  .m3-app-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.m3-app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  cursor: pointer;
  user-select: none;
  padding: 4px 2px;
  border-radius: 12px;
  transition: transform 0.16s cubic-bezier(0.2, 0, 0, 1);
}

.m3-app-item:active {
  transform: scale(0.91);
}

.m3-app-icon-squircle {
  width: 58px;
  height: 58px;
  border-radius: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.14);
  transition: transform 0.16s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.16s ease;
}

.m3-app-item:hover .m3-app-icon-squircle {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.2);
}

.m3-app-icon {
  font-size: 26px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
}

.m3-app-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  border-radius: 9999px;
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 5px;
  line-height: 1.1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  border: 1.5px solid var(--bg-surface);
}

.m3-app-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  margin-top: 6px;
  width: 100%;
  text-align: center;
  line-height: 1.2;
  letter-spacing: -0.1px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.m3-task-row {
  background: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  transition: all 0.15s;
}

.m3-task-row:hover {
  border-color: rgba(37, 99, 235, 0.3);
}

/* =========================================================
   DESKTOP DASHBOARD STYLES
   ========================================================= */
/* Executive Hero Header */
.executive-hero-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

.badge-hero-capsule {
  display: inline-flex;
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 9999px;
  padding: 3px 12px;
  font-size: 11.5px;
  font-weight: 700;
}

.badge-hero-kafeinarts {
  display: inline-flex;
  align-items: center;
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 9999px;
  padding: 3px 12px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.badge-hero-alert {
  display: inline-flex;
  align-items: center;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 9999px;
  padding: 3px 12px;
  font-size: 11.5px;
  font-weight: 700;
}

.hero-title {
  font-size: 28px;
  letter-spacing: -0.5px;
  color: var(--text-main);
}

.text-gradient-primary {
  color: var(--primary-color);
}

.hero-subtitle {
  font-size: 14.5px;
  line-height: 1.6;
  max-width: 650px;
}

/* Digital Clock & Snapshot Box */
.system-snapshot-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.system-snapshot-box:hover {
  border-color: var(--primary-color);
  box-shadow: 0 6px 24px -2px rgba(0, 0, 0, 0.08);
}

.snapshot-card-ambient-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  opacity: 0.12;
  pointer-events: none;
  border-radius: 50%;
}

.pulse-indicator-wrapper {
  position: relative;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-indicator-core {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  z-index: 2;
}

.pulse-indicator-wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #10b981;
  opacity: 0.75;
  animation: pulse-wave 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse-wave {
  0% { transform: scale(0.9); opacity: 0.8; }
  70%, 100% { transform: scale(2.4); opacity: 0; }
}

.snapshot-header-title {
  font-size: 11px;
  letter-spacing: 0.8px;
}

.timezone-chip {
  background: var(--sidebar-hover-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  font-size: 11px;
}

.live-clock-display-card {
  background: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
}

.clock-time-digits {
  font-size: 32px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
  color: var(--text-main);
}

.clock-seconds-badge {
  font-size: 16px;
  color: var(--primary-color);
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

.greeting-time-pill {
  background: var(--bg-surface);
  color: var(--text-sub);
  border: 1px solid var(--border-color);
  font-size: 11.5px;
}

.clock-date-row {
  border-top: 1px dashed var(--border-color);
}

.date-full-text {
  font-size: 12.5px;
  letter-spacing: 0.2px;
}

.mini-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mini-metric-item {
  background: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.mini-metric-item:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.metric-label {
  font-size: 11px;
  color: var(--text-sub);
  font-weight: 600;
}

.metric-value {
  font-size: 13.5px;
  font-weight: 800;
  margin-top: 1px;
}

/* KPI Metric Cards */
.kpi-card {
  display: block;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 18px 20px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px -4px rgba(37, 99, 235, 0.12);
}

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.kpi-title {
  letter-spacing: 0.5px;
  font-size: 11.5px;
}

.kpi-value {
  font-size: 24px;
  letter-spacing: -0.5px;
}

/* Dashboard Tab Navigation */
.dash-tab-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-sub);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.dash-tab-btn:hover {
  color: var(--text-main);
  background: var(--sidebar-hover-bg);
}

.dash-tab-btn.active {
  background: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.tab-count-pill {
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
}

.dash-tab-btn:not(.active) .tab-count-pill {
  background: var(--sidebar-hover-bg);
  color: var(--text-main);
}

/* Content Cards */
.content-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
}

.section-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

/* Filter Pills */
.btn-filter-pill {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  color: var(--text-sub);
  transition: all 0.2s ease;
}

.btn-filter-pill.active {
  background: var(--bg-surface);
  color: var(--primary-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Task Item Row */
.task-item-row {
  background: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  transition: all 0.15s ease;
}

.task-item-row:hover {
  border-color: var(--primary-color);
  transform: translateX(2px);
}

.task-check-input {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  cursor: pointer;
}

.task-title {
  font-size: 14px;
}

.task-done {
  opacity: 0.65;
}

.btn-icon-subtle {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  text-decoration: none;
}

.btn-icon-subtle:hover {
  background: var(--bg-surface);
  color: var(--primary-color);
}

/* Transactions Rows */
.tx-item-row {
  background: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
}

.tx-direction-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

/* Launchpad Grid */
.launchpad-group-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
}

.group-badge-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.launch-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--sidebar-hover-bg);
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: all 0.2s ease;
}

.launch-item:hover {
  border-color: var(--primary-color);
  transform: translateX(3px);
  background: var(--bg-surface);
}

.launch-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.launch-label {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
}

.launch-sub {
  font-size: 11px;
  color: var(--text-sub);
  display: block;
}

/* Sub-Tab Switcher in Visual Studio */
.btn-sub-tab {
  background: transparent;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 9999px;
  color: var(--text-sub);
  transition: all 0.2s ease;
}

.btn-sub-tab.active {
  background: var(--bg-surface);
  color: var(--primary-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Modal Custom Styling */
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1060;
  padding: 16px;
}

/* Theme compatibility helpers */
.text-main { color: var(--text-main); }
.text-sub { color: var(--text-sub); }
.border-theme { border-color: var(--border-color) !important; }
.bg-theme-subtle { background-color: var(--sidebar-hover-bg); }
.btn-outline-theme {
  border: 1px solid var(--border-color);
  color: var(--text-main);
  background: transparent;
}
.btn-outline-theme:hover {
  background: var(--sidebar-hover-bg);
}
</style>
