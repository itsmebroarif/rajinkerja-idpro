<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-1.5 rounded-pill">Task Manager Pro</span>
          <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill">6 View Modes</span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">To-Do & Daily Productivity Tracker</h2>
        <p class="text-muted mb-0">Kelola tugas harian, kelompokkan ke folder/proyek, pantau deadline & tingkat produktivitas harian Anda.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel
        </button>
        <button
          class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          @click="toggleShowForm"
        >
          <i :class="showForm ? 'bi bi-x-lg' : 'bi bi-plus-lg'" class="fs-5"></i>
          <span>{{ showForm ? 'Tutup Form' : 'Tambah / Bulk Input' }}</span>
        </button>
      </div>
    </div>

    <!-- DAILY PRODUCTIVITY & TASK SUMMARY HEADER -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden border-start border-4 border-primary">
      <div class="card-body p-4">
        <div class="row align-items-center g-4">
          <!-- Left: Big Counter Display -->
          <div class="col-lg-5 col-md-6 border-end-md">
            <div class="d-flex align-items-center gap-3">
              <div class="p-3 bg-primary-subtle text-primary rounded-4 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                <i class="bi bi-check2-circle fs-1 fw-bold"></i>
              </div>
              <div>
                <span class="text-uppercase text-muted fw-bold small tracking-wide">Daily Productivity Ratio</span>
                <div class="d-flex align-items-baseline gap-2">
                  <span class="display-5 fw-extrabold text-primary mb-0">{{ completedCount }}</span>
                  <span class="fs-4 text-muted fw-bold">/ {{ tasks.length }}</span>
                  <span class="badge rounded-pill ms-2 px-3 py-1.5 fw-bold" :class="productivityBadge.class">
                    {{ productivityBadge.label }}
                  </span>
                </div>
                <div class="small text-muted mt-1 fw-medium">
                  <strong>{{ completedCount }} task selesai</strong> dari total {{ tasks.length }} tugas harian Anda.
                </div>
              </div>
            </div>
          </div>

          <!-- Middle: Progress Meter -->
          <div class="col-lg-4 col-md-6">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="fw-bold text-dark small"><i class="bi bi-speedometer2 text-primary me-1"></i> % Pencapaian Hari Ini</span>
              <span class="fw-extrabold text-primary fs-6">{{ completionPercent }}% Selesai</span>
            </div>
            <div class="progress rounded-pill shadow-inner" style="height: 14px; background-color: #f1f5f9;">
              <div
                class="progress-bar bg-gradient-success progress-bar-striped progress-bar-animated rounded-pill"
                role="progressbar"
                :style="{ width: completionPercent + '%' }"
              ></div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2 small">
              <span class="text-muted"><i class="bi bi-check-circle-fill text-success me-1"></i> {{ completedCount }} Selesai</span>
              <span class="text-muted"><i class="bi bi-hourglass-split text-warning me-1"></i> {{ pendingCount }} Pending</span>
            </div>
          </div>

          <!-- Right: Urgent / Overdue & Clear Action -->
          <div class="col-lg-3 col-md-12 text-lg-end bg-light-subtle p-3 rounded-3 border">
            <div class="d-flex align-items-center justify-content-lg-end gap-2 mb-2">
              <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
              <span class="fw-bold text-danger">Status Deadline:</span>
            </div>
            <div class="fw-extrabold fs-5" :class="urgentOrOverdueCount > 0 ? 'text-danger' : 'text-success'">
              <span v-if="urgentOrOverdueCount > 0">🚨 {{ urgentOrOverdueCount }} Task Perlu Perhatian!</span>
              <span v-else>✅ Semua Deadline Aman</span>
            </div>
            <small class="text-muted d-block mt-1">
              {{ urgentOverdueLabel }}
            </small>

            <button v-if="completedCount > 0" class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-3 w-100" @click="clearCompleted">
              <i class="bi bi-trash me-1"></i> Bersihkan {{ completedCount }} Task Selesai
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Inline Collapsible Form Panel (Single / Bulk Input) -->
    <div v-if="showForm" class="card border-0 shadow-lg rounded-4 mb-4 bg-white border-start border-4 border-primary">
      <div class="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="btn-group" role="group">
            <button
              class="btn btn-sm px-3 py-1 fw-semibold"
              :class="formTab === 'single' ? 'btn-primary' : 'btn-outline-primary'"
              @click="formTab = 'single'"
            >
              <i class="bi bi-pencil-square me-1"></i> Input Tunggal {{ isEditing ? '(Edit)' : '' }}
            </button>
            <button
              v-if="!isEditing"
              class="btn btn-sm px-3 py-1 fw-semibold"
              :class="formTab === 'bulk' ? 'btn-primary' : 'btn-outline-primary'"
              @click="formTab = 'bulk'"
            >
              <i class="bi bi-stack me-1"></i> Input Bulk (Banyak Task)
            </button>
          </div>
        </div>
        <button type="button" class="btn-close" @click="showForm = false" aria-label="Close"></button>
      </div>

      <div class="card-body p-4">
        <!-- SINGLE ITEM FORM -->
        <form v-if="formTab === 'single'" @submit.prevent="saveTask">
          <div class="row g-3">
            <div class="col-md-7">
              <label class="form-label fw-bold">Nama Tugas / Activity <span class="text-danger">*</span></label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.name }"
                  placeholder="Contoh: Selesaikan Wireframe UI Landing Page"
                  v-model="form.name"
                />
                <button
                  type="button"
                  class="btn btn-outline-danger border-2"
                  :class="{ 'active bg-danger text-white': isListening }"
                  @click="toggleSpeechRecognition('name')"
                  title="Dikte Suara (Voice Speech Input)"
                >
                  <i :class="isListening ? 'bi bi-mic-fill' : 'bi bi-mic'"></i>
                  <span v-if="isListening" class="small ms-1 fw-bold">Merekam...</span>
                </button>
              </div>
              <div class="invalid-feedback" v-if="formErrors.name">{{ formErrors.name }}</div>
            </div>

            <!-- Custom Project Folder / Category Selector -->
            <div class="col-md-5">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold mb-0">📁 Project Folder / Kategori</label>
                <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none fw-bold" @click="promptAddCustomFolder">
                  <i class="bi bi-folder-plus me-1"></i>+ Folder Baru
                </button>
              </div>
              <div class="input-group">
                <select class="form-select" v-model="form.category">
                  <option v-for="folder in projectFolders" :key="folder" :value="folder">
                    📁 {{ folder }}
                  </option>
                </select>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Atau ketik folder baru..."
                  v-model="form.customCategoryInput"
                  @input="onCustomFolderInput"
                />
              </div>
            </div>

            <div class="col-md-4">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold mb-0">Tingkat Prioritas</label>
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-primary fw-bold text-decoration-none"
                  @click="runSmartPriorityAi"
                >
                  <i class="bi bi-cpu-fill text-primary me-1"></i>✨ Smart Priority AI
                </button>
              </div>
              <select class="form-select" v-model="form.level">
                <option value="Menengah">Menengah (Sedang)</option>
                <option value="Penting">🔥 Penting / Urgent</option>
                <option value="Biasa">Biasa (Rendah)</option>
              </select>
              <div v-if="smartPriorityReason" class="small text-primary mt-1 fw-semibold">
                {{ smartPriorityReason }}
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-bold">Sub-Tag / Label Tambahan</label>
              <input type="text" class="form-control" placeholder="Contoh: Mobile, UI/UX" v-model="form.projectTag" />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-bold">Status Kolom Kanban</label>
              <select class="form-select" v-model="form.statusColumn">
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed / Selesai</option>
              </select>
            </div>

            <!-- Due Date Picker with Presets -->
            <div class="col-md-6">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold mb-0">Target Deadline / Due Date <span class="text-danger">*</span></label>
                <span class="small text-muted">Tanggal Penyelesaian</span>
              </div>
              <input
                type="date"
                class="form-control form-control-lg border-2 fs-6 mb-2"
                :class="{ 'is-invalid': formErrors.deadline }"
                v-model="form.deadline"
              />
              <div class="invalid-feedback" v-if="formErrors.deadline">{{ formErrors.deadline }}</div>

              <!-- Quick Due Date Presets -->
              <div class="d-flex flex-wrap gap-1">
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1" @click="setFormDeadline('today')">
                  📅 Hari Ini
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1" @click="setFormDeadline('tomorrow')">
                  ⏰ Besok
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1" @click="setFormDeadline('in3days')">
                  📆 +3 Hari
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1" @click="setFormDeadline('nextweek')">
                  🗓️ Minggu Depan
                </button>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Frekuensi Berulang (Recurring)</label>
              <select class="form-select mb-2" v-model="form.recurring">
                <option value="none">Tidak Berulang (Sekali)</option>
                <option value="daily">Harian (Daily)</option>
                <option value="weekly">Mingguan (Weekly)</option>
                <option value="monthly">Bulanan (Monthly)</option>
              </select>

              <label class="form-label fw-bold small mb-1">Kategori Matriks Eisenhower</label>
              <select class="form-select" v-model="form.eisenhower">
                <option value="do_first">🔥 Kerjakan Sekarang (Penting & Mendesak)</option>
                <option value="schedule">📅 Jadwalkan (Penting, Tidak Mendesak)</option>
                <option value="delegate">👥 Delegasikan (Mendesak, Tidak Penting)</option>
                <option value="eliminate">🧹 Eliminasi (Tidak Penting & Tidak Mendesak)</option>
              </select>
            </div>

            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold mb-0">Catatan / Detail Pekerjaan</label>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill px-3 py-0.5"
                  :class="{ 'active bg-danger text-white': isListening }"
                  @click="toggleSpeechRecognition('notes')"
                >
                  <i :class="isListening ? 'bi bi-mic-fill' : 'bi bi-mic'"></i>
                  <span>{{ isListening ? 'Merekam Suara...' : 'Dikte Suara (Notes)' }}</span>
                </button>
              </div>
              <textarea class="form-control" rows="2" placeholder="Detail petunjuk, tautan, atau syarat pekerjaan..." v-model="form.notes"></textarea>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-primary px-4 rounded-3 fw-semibold shadow-sm">
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Tugas' }}
              </button>
            </div>
          </div>
        </form>

        <!-- BULK INPUT FORM -->
        <form v-else @submit.prevent="saveBulkTasks">
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info py-2 small mb-2 d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill fs-5"></i>
                <span>Tulis atau paste daftar nama tugas (1 nama tugas per baris). Semua akan dimasukkan sekaligus!</span>
              </div>
              <label class="form-label fw-semibold">Daftar Task (Satu per baris) <span class="text-danger">*</span></label>
              <textarea
                class="form-control font-monospace"
                rows="5"
                placeholder="Design logo landing page&#10;Kirim email penawaran ke Pak Budi&#10;Selesaikan skema database PostgreSQL"
                v-model="bulkText"
                :class="{ 'is-invalid': bulkError }"
              ></textarea>
              <div class="invalid-feedback" v-if="bulkError">{{ bulkError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">📁 Project Folder Default</label>
              <select class="form-select" v-model="bulkDefault.category">
                <option v-for="folder in projectFolders" :key="folder" :value="folder">
                  📁 {{ folder }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Prioritas Default</label>
              <select class="form-select" v-model="bulkDefault.level">
                <option value="Menengah">Menengah</option>
                <option value="Penting">Penting</option>
                <option value="Biasa">Biasa</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Target Deadline Default</label>
              <input type="date" class="form-control" v-model="bulkDefault.deadline" />
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-semibold shadow-sm">
                <i class="bi bi-stack me-1"></i> Simpan Semua Task (Bulk)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- VIEW MODE SWITCHER & CUSTOM FOLDER CATEGORY TOOLBAR -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3">
        <!-- View Mode Navigation Tabs -->
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3 pb-3 border-bottom">
          <div class="btn-group flex-wrap" role="group">
            <button
              class="btn btn-outline-primary px-3 py-2 fw-semibold"
              :class="{ active: currentViewMode === 'list' }"
              @click="currentViewMode = 'list'"
            >
              <i class="bi bi-list-ul me-1"></i> 1. Standard List
            </button>
            <button
              class="btn btn-outline-primary px-3 py-2 fw-semibold"
              :class="{ active: currentViewMode === 'kanban' }"
              @click="currentViewMode = 'kanban'"
            >
              <i class="bi bi-kanban me-1"></i> 2. Kanban Board
            </button>
            <button
              class="btn btn-outline-primary px-3 py-2 fw-semibold"
              :class="{ active: currentViewMode === 'eisenhower' }"
              @click="currentViewMode = 'eisenhower'"
            >
              <i class="bi bi-grid-fill me-1"></i> 3. Matriks Eisenhower
            </button>
            <button
              class="btn btn-outline-primary px-3 py-2 fw-semibold"
              :class="{ active: currentViewMode === 'timeline' }"
              @click="currentViewMode = 'timeline'"
            >
              <i class="bi bi-calendar-range me-1"></i> 4. Timeline Deadline
            </button>

            <!-- NEW VIEW MODE 5: FOLDER & CATEGORY GROUP -->
            <button
              class="btn btn-outline-primary px-3 py-2 fw-semibold"
              :class="{ active: currentViewMode === 'folder' }"
              @click="currentViewMode = 'folder'"
            >
              <i class="bi bi-folder-fill me-1"></i> 5. Kelompok Folder
            </button>

            <button
              class="btn btn-outline-primary px-3 py-2 fw-semibold"
              :class="{ active: currentViewMode === 'compact' }"
              @click="currentViewMode = 'compact'"
            >
              <i class="bi bi-check-square me-1"></i> 6. Checklist Ringkas
            </button>
          </div>

          <!-- Search Box -->
          <div class="input-group" style="max-width: 260px;">
            <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control bg-light border-start-0" placeholder="Cari task / tag..." v-model="searchQuery" />
          </div>
        </div>

        <!-- Custom Project Folder / Category Pill Switcher Bar -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-1 overflow-x-auto py-1 flex-grow-1 style-scroll-horizontal">
            <span class="small fw-bold text-muted me-2 text-nowrap"><i class="bi bi-folder2 me-1"></i>Filter Folder:</span>
            <button
              class="btn btn-xs rounded-pill px-3 py-1 fw-bold text-nowrap transition-all"
              :class="selectedCategory === 'all' ? 'btn-primary shadow-sm' : 'btn-light border text-dark'"
              @click="selectedCategory = 'all'"
            >
              📁 Semua Folder ({{ tasks.length }})
            </button>
            <button
              v-for="folder in projectFolders"
              :key="folder"
              class="btn btn-xs rounded-pill px-3 py-1 fw-bold text-nowrap transition-all"
              :class="selectedCategory === folder ? 'btn-primary shadow-sm' : 'btn-light border text-dark'"
              @click="selectedCategory = folder"
            >
              📁 {{ folder }} ({{ getTaskCountInFolder(folder) }})
            </button>
          </div>

          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold text-nowrap ms-auto" @click="promptAddCustomFolder">
            <i class="bi bi-folder-plus me-1"></i>+ Tambah Folder Custom
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Action Toolbar (When 1 or more items selected) -->
    <div v-if="selectedIds.length > 0" class="alert alert-primary d-flex flex-wrap justify-content-between align-items-center rounded-4 shadow-sm mb-4 py-2 px-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-square fs-5"></i>
        <span class="fw-bold">{{ selectedIds.length }} task terpilih</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success rounded-pill px-3" @click="bulkMarkDone">
          <i class="bi bi-check-all me-1"></i> Tandai Selesai
        </button>
        <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDelete">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
        <button class="btn btn-sm btn-light rounded-pill px-3" @click="selectedIds = []">
          Batal Pilih
        </button>
      </div>
    </div>

    <!-- VIEW MODE 1: Standard Table / List -->
    <div v-if="currentViewMode === 'list'" class="card border-0 shadow-sm rounded-4 bg-white">
      <div class="card-body p-0">
        <div class="table-responsive" v-if="filteredTasks.length > 0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px;" class="text-center">
                  <input type="checkbox" class="form-check-input" :checked="isAllSelected" @change="toggleSelectAll" />
                </th>
                <th style="width: 50px;" class="text-center">#</th>
                <th style="width: 50px;">Status</th>
                <th>Nama Kegiatan / Tugas</th>
                <th>Project Folder</th>
                <th>Tag</th>
                <th>Prioritas</th>
                <th>Recurring</th>
                <th>Target Deadline</th>
                <th class="text-end pe-4" style="width: 140px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, index) in filteredTasks" :key="task.id" :class="{ 'bg-light opacity-75': task.done }">
                <td class="text-center">
                  <input type="checkbox" class="form-check-input" :value="task.id" v-model="selectedIds" />
                </td>
                <td class="text-center text-muted fw-bold">{{ index + 1 }}</td>
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input style-checkbox"
                    :checked="task.done"
                    @change="toggleTaskDone(task.id)"
                  />
                </td>
                <td>
                  <router-link :to="'/tasks/' + task.id" class="text-decoration-none">
                    <div class="fw-bold hover-primary text-dark" :class="{ 'text-decoration-line-through text-muted': task.done }">
                      {{ task.name }}
                    </div>
                  </router-link>
                  <small class="text-muted d-block text-truncate" style="max-width: 320px;" v-if="task.notes">{{ task.notes }}</small>
                </td>
                <td>
                  <span class="badge rounded-pill px-2.5 py-1.5 fw-semibold" :class="getCategoryBadgeClass(task.category)">
                    📁 {{ task.category || 'Work' }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border px-2 py-1 rounded-pill">
                    <i class="bi bi-tag-fill me-1 text-primary"></i>{{ task.projectTag || 'Umum' }}
                  </span>
                </td>
                <td>
                  <span :class="badgeClass(task.level)" class="px-3 py-1 rounded-pill small fw-bold">
                    {{ task.level }}
                  </span>
                </td>
                <td>
                  <span v-if="task.recurring && task.recurring !== 'none'" class="badge bg-info-subtle text-info fw-semibold px-2 py-1 rounded-pill small">
                    <i class="bi bi-repeat me-1"></i>{{ task.recurring }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <!-- Due Date Visual Indicator with RED TEXT for Overdue or Approaching -->
                  <div :class="getDeadlineInfo(task.deadline, task.done).textClass" class="small">
                    <i class="bi bi-calendar-event me-1"></i>
                    <span>{{ getDeadlineInfo(task.deadline, task.done).label }}</span>
                  </div>
                </td>
                <td class="text-end pe-4">
                  <div class="d-flex justify-content-end gap-1">
                    <router-link :to="'/tasks/' + task.id" class="btn btn-sm btn-light text-info rounded-circle" title="Detail Preview Tugas">
                      <i class="bi bi-eye-fill"></i>
                    </router-link>
                    <button class="btn btn-sm btn-light text-primary rounded-circle" @click="editTask(task)" title="Edit Tugas">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger rounded-circle" @click="removeTask(task.id)" title="Hapus Tugas">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
          <p class="text-muted mb-0">Tidak ada tugas ditemukan pada filter ini.</p>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 2: Kanban Board -->
    <div v-else-if="currentViewMode === 'kanban'" class="row g-3">
      <div v-for="col in kanbanColumns" :key="col.id" class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 px-3">
            <div class="d-flex align-items-center gap-2">
              <span class="badge rounded-pill px-3 py-2" :class="col.badgeBg">{{ col.title }}</span>
              <span class="fw-bold small text-muted">({{ getTaskCountInCol(col.id) }})</span>
            </div>
            <button class="btn btn-sm btn-light rounded-circle" @click="openAddForCol(col.id)" title="Tambah di kolom ini">
              <i class="bi bi-plus-lg"></i>
            </button>
          </div>
          <div class="card-body p-2 min-vh-25">
            <div
              v-for="task in getTasksInCol(col.id)"
              :key="task.id"
              class="card border shadow-sm rounded-3 mb-2 p-3 hover-card"
              :class="{ 'border-success bg-success-subtle opacity-75': task.done, 'border-danger border-2': getDeadlineInfo(task.deadline, task.done).isDanger }"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input style-checkbox"
                    :checked="task.done"
                    @change="toggleTaskDone(task.id)"
                  />
                  <label class="form-check-label fw-bold ms-1" :class="{ 'text-decoration-line-through text-muted': task.done }">
                    {{ task.name }}
                  </label>
                </div>
              </div>
              <p class="text-muted small mb-2" v-if="task.notes">{{ task.notes }}</p>
              
              <div class="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top gap-1 style-mini">
                <span class="badge rounded-pill px-2 py-0.5" :class="getCategoryBadgeClass(task.category)">
                  📁 {{ task.category || 'Work' }}
                </span>
                <span class="badge bg-light text-dark border">{{ task.projectTag || 'Umum' }}</span>
                <span :class="badgeClass(task.level)" class="px-2 py-0.5 rounded-pill fw-bold">{{ task.level }}</span>
              </div>

              <!-- Kanban Deadline Pill with RED TEXT if overdue or approaching -->
              <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                <span class="badge" :class="getDeadlineInfo(task.deadline, task.done).badgeClass">
                  <i class="bi bi-clock me-1"></i>{{ getDeadlineInfo(task.deadline, task.done).label }}
                </span>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-light btn-sm px-2"
                    v-if="getPrevCol(col.id)"
                    @click="moveTaskCol(task, getPrevCol(col.id))"
                    title="Mundur Kolom"
                  >
                    <i class="bi bi-arrow-left"></i>
                  </button>
                  <button
                    class="btn btn-light btn-sm px-2"
                    v-if="getNextCol(col.id)"
                    @click="moveTaskCol(task, getNextCol(col.id))"
                    title="Maju Kolom"
                  >
                    <i class="bi bi-arrow-right"></i>
                  </button>
                </div>
                <div class="d-flex gap-1">
                  <router-link :to="'/tasks/' + task.id" class="btn btn-sm btn-light text-info px-2" title="Detail Preview">
                    <i class="bi bi-eye-fill"></i>
                  </router-link>
                  <button class="btn btn-sm btn-light text-primary px-2" @click="editTask(task)" title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger px-2" @click="removeTask(task.id)" title="Hapus">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 3: Matriks Eisenhower -->
    <div v-else-if="currentViewMode === 'eisenhower'" class="row g-3">
      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-danger shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-danger"><i class="bi bi-fire me-2"></i>🔥 1. Kerjakan Sekarang (Do First)</h6>
          <p class="text-muted small mb-2">Penting & Mendesak</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('do_first')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div class="d-flex align-items-center gap-2">
                <input type="checkbox" class="form-check-input" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done, 'text-danger fw-bold': getDeadlineInfo(t.deadline, t.done).isDanger }">
                  {{ t.name }}
                </span>
              </div>
              <span class="badge" :class="getDeadlineInfo(t.deadline, t.done).badgeClass">
                {{ getDeadlineInfo(t.deadline, t.done).label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-primary shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-primary"><i class="bi bi-calendar-event me-2"></i>📅 2. Jadwalkan (Schedule)</h6>
          <p class="text-muted small mb-2">Penting, Tidak Mendesak</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('schedule')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div class="d-flex align-items-center gap-2">
                <input type="checkbox" class="form-check-input" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done, 'text-danger fw-bold': getDeadlineInfo(t.deadline, t.done).isDanger }">
                  {{ t.name }}
                </span>
              </div>
              <span class="badge" :class="getDeadlineInfo(t.deadline, t.done).badgeClass">
                {{ getDeadlineInfo(t.deadline, t.done).label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-warning shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-warning"><i class="bi bi-people me-2"></i>👥 3. Delegasikan (Delegate)</h6>
          <p class="text-muted small mb-2">Mendesak, Tidak Penting</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('delegate')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div class="d-flex align-items-center gap-2">
                <input type="checkbox" class="form-check-input" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done, 'text-danger fw-bold': getDeadlineInfo(t.deadline, t.done).isDanger }">
                  {{ t.name }}
                </span>
              </div>
              <span class="badge" :class="getDeadlineInfo(t.deadline, t.done).badgeClass">
                {{ getDeadlineInfo(t.deadline, t.done).label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-secondary shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-secondary"><i class="bi bi-trash me-2"></i>🧹 4. Eliminasi (Eliminate)</h6>
          <p class="text-muted small mb-2">Tidak Penting & Tidak Mendesak</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('eliminate')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div class="d-flex align-items-center gap-2">
                <input type="checkbox" class="form-check-input" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done, 'text-danger fw-bold': getDeadlineInfo(t.deadline, t.done).isDanger }">
                  {{ t.name }}
                </span>
              </div>
              <span class="badge" :class="getDeadlineInfo(t.deadline, t.done).badgeClass">
                {{ getDeadlineInfo(t.deadline, t.done).label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 4: Timeline Deadline -->
    <div v-else-if="currentViewMode === 'timeline'" class="card border-0 shadow-sm rounded-4 bg-white p-4">
      <h6 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history me-2 text-primary"></i>Timeline Deadline Pekerjaan</h6>
      <div v-for="(groupTasks, dateStr) in timelineGroupedTasks" :key="dateStr" class="mb-4">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge px-3 py-2 rounded-pill" :class="getDeadlineInfo(dateStr, false).isDanger ? 'bg-danger text-white fw-bold' : 'bg-primary text-white'">
            <i class="bi bi-calendar3 me-1"></i>{{ formatDate(dateStr) }}
          </span>
          <span class="small fw-bold" :class="getDeadlineInfo(dateStr, false).textClass">
            ({{ groupTasks.length }} task) - {{ getDeadlineInfo(dateStr, false).label }}
          </span>
        </div>
        <div class="row g-2 ps-3 border-start border-3 ms-2" :class="getDeadlineInfo(dateStr, false).isDanger ? 'border-danger' : 'border-primary'">
          <div v-for="t in groupTasks" :key="t.id" class="col-md-6">
            <div class="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
              <div>
                <span class="fw-bold d-block" :class="{ 'text-decoration-line-through text-muted': t.done, 'text-danger': getDeadlineInfo(t.deadline, t.done).isDanger }">
                  {{ t.name }}
                </span>
                <div class="d-flex align-items-center gap-1 mt-1">
                  <span class="badge rounded-pill px-2 py-0.5" :class="getCategoryBadgeClass(t.category)">
                    📁 {{ t.category || 'Work' }}
                  </span>
                  <span class="badge bg-white text-dark border small">{{ t.projectTag || 'Umum' }}</span>
                </div>
              </div>
              <button class="btn btn-sm rounded-circle" :class="t.done ? 'btn-success' : 'btn-outline-secondary'" @click="toggleTaskDone(t.id)">
                <i :class="t.done ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NEW VIEW MODE 5: CUSTOM PROJECT FOLDER & CATEGORY GROUP -->
    <div v-else-if="currentViewMode === 'folder'" class="row g-4">
      <div v-for="folder in projectFolders" :key="folder" class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100 overflow-hidden border-top border-4 border-primary">
          <div class="card-header bg-transparent border-bottom p-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <div class="p-2 bg-primary-subtle text-primary rounded-3">
                <i class="bi bi-folder-fill fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-dark">📁 {{ folder }}</h6>
                <small class="text-muted">{{ getTasksInFolder(folder).length }} Tugas Terdaftar</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success-subtle text-success fw-bold rounded-pill px-3 py-1">
                {{ getFolderCompletedCount(folder) }} / {{ getTasksInFolder(folder).length }} Selesai
              </span>
            </div>
          </div>

          <div class="card-body p-3">
            <div v-if="getTasksInFolder(folder).length > 0" class="list-group list-group-flush">
              <div
                v-for="t in getTasksInFolder(folder)"
                :key="t.id"
                class="list-group-item px-2 py-2.5 d-flex justify-content-between align-items-center border-bottom bg-transparent"
              >
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" class="form-check-input style-checkbox" :checked="t.done" @change="toggleTaskDone(t.id)" />
                  <div>
                    <span class="fw-semibold text-dark d-block" :class="{ 'text-decoration-line-through text-muted': t.done }">
                      {{ t.name }}
                    </span>
                    <span class="small text-muted" v-if="t.projectTag">
                      <i class="bi bi-tag-fill text-primary me-1"></i>{{ t.projectTag }}
                    </span>
                  </div>
                </div>

                <div class="text-end">
                  <span class="badge d-block mb-1" :class="getDeadlineInfo(t.deadline, t.done).badgeClass">
                    {{ getDeadlineInfo(t.deadline, t.done).label }}
                  </span>
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-xs btn-light text-primary" @click="editTask(t)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-xs btn-light text-danger" @click="removeTask(t.id)"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted small">
              <i class="bi bi-folder2-open fs-3 d-block mb-1 opacity-50"></i>
              Belum ada tugas di folder ini.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 6: Checklist Ringkas -->
    <div v-else-if="currentViewMode === 'compact'" class="card border-0 shadow-sm rounded-4 bg-white p-4">
      <h6 class="fw-bold text-dark mb-3"><i class="bi bi-check-square-fill text-success me-2"></i>Checklist Pekerjaan Ringkas</h6>
      <div class="list-group list-group-flush">
        <div
          v-for="t in filteredTasks"
          :key="t.id"
          class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
        >
          <div class="d-flex align-items-center gap-2">
            <input type="checkbox" class="form-check-input style-checkbox" :checked="t.done" @change="toggleTaskDone(t.id)" />
            <span class="fw-semibold" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge rounded-pill px-2 py-0.5" :class="getCategoryBadgeClass(t.category)">
              📁 {{ t.category || 'Work' }}
            </span>
            <span class="badge bg-light text-dark border small">{{ t.projectTag }}</span>
            <span :class="getDeadlineInfo(t.deadline, t.done).textClass" class="small fw-bold">
              {{ getDeadlineInfo(t.deadline, t.done).label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-success border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { safeSetItem } from '../utils/storageManager';

export default {
  name: 'TodoList',
  setup() {
    const store = useStore();

    const currentViewMode = ref('list');
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    const showForm = ref(false);
    const formTab = ref('single'); // 'single' | 'bulk'
    const isEditing = ref(false);
    const editingId = ref(null);
    const selectedIds = ref([]);

    // Web Speech API Voice Recognition
    const isListening = ref(false);
    let recognition = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const toggleSpeechRecognition = (field = 'notes') => {
      if (!SpeechRecognition) {
        if (typeof showToast === 'function') {
          showToast('Browser Anda tidak mendukung Web Speech API atau butuh izin mikrofon.');
        } else {
          alert('Browser Anda tidak mendukung Web Speech API atau memerlukan izin mikrofon.');
        }
        return;
      }

      if (isListening.value) {
        if (recognition) recognition.stop();
        isListening.value = false;
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = true;

      isListening.value = true;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (field === 'name') {
          form.value.name = transcript;
        } else {
          form.value.notes = (form.value.notes ? form.value.notes + ' ' : '') + transcript;
        }
      };

      recognition.onerror = () => {
        isListening.value = false;
      };

      recognition.onend = () => {
        isListening.value = false;
      };

      recognition.start();
    };

    // Smart Priority AI Suggestion Engine
    const smartPriorityReason = ref('');

    const runSmartPriorityAi = () => {
      const nameStr = ((form.value.name || '') + ' ' + (form.value.notes || '')).toLowerCase();
      if (!nameStr.trim()) {
        smartPriorityReason.value = '⚠️ Masukkan nama atau detail tugas untuk analisa AI.';
        return;
      }

      const urgentKeywords = ['urgent', 'penting', 'secepatnya', 'asap', 'klien', 'bug', 'error', 'bayar', 'invoice', 'atasan', 'presentasi', 'critical', 'mendesak', 'deadline'];
      const lowKeywords = ['santai', 'nanti', 'opsional', 'baca', 'rutin', 'nonton', 'hobi', 'resep', 'iseng'];

      const isUrgent = urgentKeywords.some(kw => nameStr.includes(kw));
      const isLow = lowKeywords.some(kw => nameStr.includes(kw));

      if (isUrgent) {
        form.value.level = 'Penting';
        form.value.eisenhower = 'do_first';
        smartPriorityReason.value = '✨ AI: Terdeteksi kata kunci mendesak. Level disesuaikan ke Penting (Urgent).';
      } else if (isLow) {
        form.value.level = 'Biasa';
        form.value.eisenhower = 'eliminate';
        smartPriorityReason.value = '✨ AI: Aktivitas santai/opsional. Level disesuaikan ke Biasa (Low).';
      } else {
        form.value.level = 'Menengah';
        form.value.eisenhower = 'schedule';
        smartPriorityReason.value = '✨ AI: Tugas standar. Level disesuaikan ke Menengah (Medium).';
      }
    };

    const toast = ref({ show: false, message: '' });

    // SweetAlert2 Handlers for Task & Folder Actions
    const confirmDeleteTask = (taskOrId) => {
      let targetTask = null;
      if (typeof taskOrId === 'object' && taskOrId !== null) {
        targetTask = taskOrId;
      } else {
        targetTask = tasks.value.find(t => String(t.id) === String(taskOrId));
      }
      const targetId = targetTask ? targetTask.id : taskOrId;
      const targetTitle = targetTask ? targetTask.name : 'Tugas ini';

      Swal.fire({
        title: 'Hapus Tugas?',
        html: `Hapus tugas <strong>"${targetTitle}"</strong> secara permanen?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteTask', targetId);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Tugas berhasil dihapus.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      });
    };

    const confirmBulkDelete = () => {
      if (selectedIds.value.length === 0) return;
      Swal.fire({
        title: 'Hapus Masal Tugas?',
        html: `Hapus <strong>${selectedIds.value.length} tugas terpilih</strong> secara permanen?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus Semua',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteTasksBulk', selectedIds.value);
          selectedIds.value = [];
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Tugas terpilih berhasil dihapus.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      });
    };

    const confirmClearCompleted = () => {
      if (completedCount.value === 0) return;
      Swal.fire({
        title: 'Bersihkan Task Selesai?',
        html: `Bersihkan <strong>${completedCount.value} tugas yang telah selesai</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Bersihkan',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          const completedIds = tasks.value.filter(t => t.done || t.statusColumn === 'done').map(t => t.id);
          if (completedIds.length > 0) {
            store.dispatch('deleteTasksBulk', completedIds);
            Swal.fire({
              icon: 'success',
              title: 'Dibersihkan!',
              text: 'Semua tugas selesai berhasil dibersihkan.',
              timer: 1800,
              showConfirmButton: false
            });
          }
        }
      });
    };

    // Custom Project Folders list state
    const DEFAULT_FOLDERS = ['Work', 'Personal', 'Urgent', 'Client Project', 'Routine', 'Marketing', 'Development'];
    const projectFolders = ref([]);

    const loadFolders = () => {
      try {
        const stored = localStorage.getItem('ft_custom_folders');
        if (stored) {
          projectFolders.value = JSON.parse(stored);
        } else {
          projectFolders.value = [...DEFAULT_FOLDERS];
          safeSetItem('ft_custom_folders', projectFolders.value);
        }
      } catch (e) {
        projectFolders.value = [...DEFAULT_FOLDERS];
      }
    };

    const addCustomFolder = (folderName) => {
      if (!folderName || !folderName.trim()) return;
      const clean = folderName.trim();
      if (!projectFolders.value.includes(clean)) {
        projectFolders.value.push(clean);
        safeSetItem('ft_custom_folders', projectFolders.value);
        showToastMsg(`Folder proyek "${clean}" berhasil ditambahkan!`);
      }
    };

    const promptAddCustomFolder = () => {
      Swal.fire({
        title: 'Folder / Kategori Baru',
        input: 'text',
        inputLabel: 'Masukkan nama Project Folder baru:',
        inputPlaceholder: 'misal: Marketing, Desain, Client A...',
        showCancelButton: true,
        confirmButtonText: 'Simpan Folder',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#0d6efd',
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return 'Nama folder tidak boleh kosong!';
          }
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          addCustomFolder(result.value);
          form.value.category = result.value.trim();
        }
      });
    };

    const onCustomFolderInput = () => {
      if (form.value.customCategoryInput && form.value.customCategoryInput.trim()) {
        form.value.category = form.value.customCategoryInput.trim();
      }
    };

    onMounted(() => {
      loadFolders();
    });

    const form = ref({
      name: '',
      category: 'Work',
      customCategoryInput: '',
      level: 'Menengah',
      projectTag: 'Umum',
      deadline: new Date().toISOString().split('T')[0],
      notes: '',
      recurring: 'none',
      statusColumn: 'todo',
      eisenhower: 'do_first',
      done: false
    });

    const formErrors = ref({});

    const bulkText = ref('');
    const bulkError = ref('');
    const bulkDefault = ref({
      category: 'Work',
      projectTag: 'Umum',
      level: 'Menengah',
      deadline: new Date().toISOString().split('T')[0]
    });

    const kanbanColumns = [
      { id: 'backlog', title: 'Backlog', badgeBg: 'bg-secondary text-white' },
      { id: 'todo', title: 'To Do', badgeBg: 'bg-primary text-white' },
      { id: 'in_progress', title: 'In Progress', badgeBg: 'bg-warning text-dark' },
      { id: 'done', title: 'Completed', badgeBg: 'bg-success text-white' }
    ];

    const tasks = computed(() => store.getters.getTasks || []);
    const completedCount = computed(() => tasks.value.filter(t => t.done || t.statusColumn === 'done').length);
    const pendingCount = computed(() => tasks.value.filter(t => !t.done && t.statusColumn !== 'done').length);
    const completionPercent = computed(() => {
      if (tasks.value.length === 0) return 0;
      return Math.round((completedCount.value / tasks.value.length) * 100);
    });

    // Productivity Rating & Badge
    const productivityBadge = computed(() => {
      const pct = completionPercent.value;
      if (pct === 100) {
        return { label: '🔥 Outstanding! (100%)', class: 'bg-success text-white' };
      } else if (pct >= 70) {
        return { label: '⚡ Produktivitas Tinggi', class: 'bg-primary text-white' };
      } else if (pct >= 40) {
        return { label: '📈 Produktivitas Sedang', class: 'bg-info-subtle text-info-emphasis border border-info' };
      } else {
        return { label: '🌱 Ayo Mulai Selesaikan!', class: 'bg-warning-subtle text-warning-emphasis border border-warning' };
      }
    });

    // Deadline Info Helper (returns red text styling when overdue / approaching)
    const getDeadlineInfo = (deadlineStr, done) => {
      if (done) {
        return {
          status: 'completed',
          isDanger: false,
          isWarning: false,
          label: 'Selesai',
          badgeClass: 'bg-success-subtle text-success border border-success-subtle',
          textClass: 'text-muted'
        };
      }
      if (!deadlineStr) {
        return {
          status: 'none',
          isDanger: false,
          isWarning: false,
          label: 'Tanpa Deadline',
          badgeClass: 'bg-light text-muted border',
          textClass: 'text-muted'
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = new Date(deadlineStr);
      deadline.setHours(0, 0, 0, 0);

      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        const absDays = Math.abs(diffDays);
        return {
          status: 'overdue',
          isDanger: true,
          isWarning: false,
          label: `⚠️ Overdue (${absDays} hari lalu)`,
          badgeClass: 'bg-danger text-white fw-bold shadow-sm',
          textClass: 'text-danger fw-extrabold'
        };
      } else if (diffDays === 0) {
        return {
          status: 'today',
          isDanger: true,
          isWarning: false,
          label: '🔥 Deadline Hari Ini!',
          badgeClass: 'bg-danger text-white fw-bold shadow-sm',
          textClass: 'text-danger fw-extrabold'
        };
      } else if (diffDays === 1) {
        return {
          status: 'tomorrow',
          isDanger: true,
          isWarning: true,
          label: '⏰ Deadline Besok!',
          badgeClass: 'bg-warning-subtle text-danger border border-danger fw-bold',
          textClass: 'text-danger fw-bold'
        };
      } else {
        return {
          status: 'future',
          isDanger: false,
          isWarning: false,
          label: formatDate(deadlineStr),
          badgeClass: 'bg-light text-dark border',
          textClass: 'text-dark'
        };
      }
    };

    // Count urgent / overdue tasks
    const urgentOrOverdueCount = computed(() => {
      return tasks.value.filter(t => !t.done && getDeadlineInfo(t.deadline, false).isDanger).length;
    });

    const urgentOverdueLabel = computed(() => {
      if (urgentOrOverdueCount.value > 0) {
        return `${urgentOrOverdueCount.value} tugas telah melewati deadline atau jatuh tempo hari ini/besok.`;
      }
      return 'Semua tugas berada pada rentang waktu deadline yang aman.';
    });

    const filteredTasks = computed(() => {
      return tasks.value.filter(t => {
        const query = searchQuery.value.toLowerCase();
        const matchesQuery = !query ||
          t.name.toLowerCase().includes(query) ||
          (t.projectTag && t.projectTag.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query));

        const matchesCategory = selectedCategory.value === 'all' || (t.category || 'Work') === selectedCategory.value;

        return matchesQuery && matchesCategory;
      });
    });

    const isAllSelected = computed(() => {
      if (filteredTasks.value.length === 0) return false;
      return filteredTasks.value.every(t => selectedIds.value.includes(t.id));
    });

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedIds.value = [];
      } else {
        selectedIds.value = filteredTasks.value.map(t => t.id);
      }
    };

    const getTasksInCol = (colId) => {
      return filteredTasks.value.filter(t => (t.statusColumn || 'todo') === colId);
    };

    const getTaskCountInCol = (colId) => {
      return getTasksInCol(colId).length;
    };

    const getTasksInFolder = (folderName) => {
      return filteredTasks.value.filter(t => (t.category || 'Work') === folderName);
    };

    const getTaskCountInFolder = (folderName) => {
      return tasks.value.filter(t => (t.category || 'Work') === folderName).length;
    };

    const getFolderCompletedCount = (folderName) => {
      return getTasksInFolder(folderName).filter(t => t.done).length;
    };

    const getEisenhowerTasks = (quadrant) => {
      return filteredTasks.value.filter(t => (t.eisenhower || 'do_first') === quadrant);
    };

    const timelineGroupedTasks = computed(() => {
      const groups = {};
      filteredTasks.value.forEach(t => {
        const dateKey = t.deadline || 'Tanpa Deadline';
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(t);
      });
      return groups;
    });

    const showToastMsg = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    const toggleShowForm = () => {
      if (showForm.value) {
        showForm.value = false;
      } else {
        openAddModal();
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      formErrors.value = {};
      form.value = {
        name: '',
        category: 'Work',
        customCategoryInput: '',
        level: 'Menengah',
        projectTag: 'Umum',
        deadline: new Date().toISOString().split('T')[0],
        notes: '',
        recurring: 'none',
        statusColumn: 'todo',
        eisenhower: 'do_first',
        done: false
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const setFormDeadline = (type) => {
      const d = new Date();
      if (type === 'today') {
        // today
      } else if (type === 'tomorrow') {
        d.setDate(d.getDate() + 1);
      } else if (type === 'in3days') {
        d.setDate(d.getDate() + 3);
      } else if (type === 'nextweek') {
        d.setDate(d.getDate() + 7);
      }
      form.value.deadline = d.toISOString().split('T')[0];
    };

    const openAddForCol = (colId) => {
      openAddModal();
      form.value.statusColumn = colId;
    };

    const editTask = (task) => {
      isEditing.value = true;
      editingId.value = task.id;
      formErrors.value = {};
      form.value = {
        ...task,
        customCategoryInput: ''
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const saveTask = () => {
      formErrors.value = {};
      if (!form.value.name || !form.value.name.trim()) {
        formErrors.value.name = 'Nama tugas tidak boleh kosong!';
        return;
      }
      if (!form.value.deadline) {
        formErrors.value.deadline = 'Target deadline wajib diisi!';
        return;
      }

      // Add category to custom folders list if new
      if (form.value.category) {
        addCustomFolder(form.value.category);
      }

      if (isEditing.value) {
        store.dispatch('updateTask', { ...form.value, id: editingId.value });
        showToastMsg('Tugas berhasil diperbarui!');
      } else {
        store.dispatch('addTask', form.value);
        showToastMsg('Tugas baru berhasil ditambahkan!');
      }
      showForm.value = false;
    };

    const saveBulkTasks = () => {
      bulkError.value = '';
      if (!bulkText.value || !bulkText.value.trim()) {
        bulkError.value = 'Silakan tuliskan minimal 1 nama tugas!';
        return;
      }

      const lines = bulkText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        bulkError.value = 'Silakan tuliskan minimal 1 nama tugas valid!';
        return;
      }

      const targetCategory = bulkDefault.value.category || 'Work';
      addCustomFolder(targetCategory);

      const tasksToAdd = lines.map(name => ({
        name,
        category: targetCategory,
        projectTag: bulkDefault.value.projectTag || 'Umum',
        level: bulkDefault.value.level || 'Menengah',
        deadline: bulkDefault.value.deadline || new Date().toISOString().split('T')[0],
        statusColumn: 'todo',
        done: false
      }));

      store.dispatch('addTasksBulk', tasksToAdd);
      showToastMsg(`Berhasil menambahkan ${lines.length} tugas sekaligus!`);
      bulkText.value = '';
      showForm.value = false;
    };

    const toggleTaskDone = (id) => {
      store.dispatch('toggleTask', id);
    };

    const moveTaskCol = (task, newCol) => {
      if (!newCol) return;
      store.dispatch('updateTaskStatus', { id: task.id, statusColumn: newCol });
      showToastMsg(`Status dipindah ke ${newCol}`);
    };

    const getPrevCol = (colId) => {
      if (colId === 'done') return 'in_progress';
      if (colId === 'in_progress') return 'todo';
      if (colId === 'todo') return 'backlog';
      return null;
    };

    const getNextCol = (colId) => {
      if (colId === 'backlog') return 'todo';
      if (colId === 'todo') return 'in_progress';
      if (colId === 'in_progress') return 'done';
      return null;
    };

    const removeTask = (taskOrId) => {
      confirmDeleteTask(taskOrId);
    };

    const bulkDelete = () => {
      confirmBulkDelete();
    };

    const bulkMarkDone = () => {
      if (selectedIds.value.length === 0) return;
      selectedIds.value.forEach(id => {
        const t = tasks.value.find(item => item.id === id);
        if (t && !t.done) {
          store.dispatch('toggleTask', id);
        }
      });
      showToastMsg(`${selectedIds.value.length} tugas ditandai selesai.`);
      selectedIds.value = [];
    };

    const clearCompleted = () => {
      confirmClearCompleted();
    };

    const badgeClass = (level) => {
      switch (level) {
        case 'Penting':
          return 'bg-danger text-white';
        case 'Menengah':
          return 'bg-warning text-dark';
        default:
          return 'bg-secondary text-white';
      }
    };

    const getCategoryBadgeClass = (category) => {
      switch (category) {
        case 'Work':
          return 'bg-primary-subtle text-primary border border-primary-subtle';
        case 'Personal':
          return 'bg-purple-subtle text-purple border border-purple-subtle';
        case 'Urgent':
          return 'bg-danger text-white fw-bold shadow-sm';
        case 'Client':
        case 'Client Project':
          return 'bg-info-subtle text-info-emphasis border border-info-subtle';
        case 'Routine':
          return 'bg-success-subtle text-success border border-success-subtle';
        default:
          return 'bg-primary-subtle text-primary border border-primary-subtle';
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    const exportToExcel = () => {
      const exportData = tasks.value.map((t, idx) => ({
        No: idx + 1,
        NamaTugas: t.name,
        ProjectFolder: t.category || 'Work',
        ProyekTag: t.projectTag || 'Umum',
        Prioritas: t.level,
        Recurring: t.recurring || 'none',
        KolomStatus: t.statusColumn || 'todo',
        Deadline: t.deadline,
        Status: t.done ? 'Selesai' : 'Pending',
        Catatan: t.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Tugas');
      XLSX.writeFile(workbook, 'daftar_tugas_freelance.xlsx');
      showToastMsg('File Excel daftar tugas berhasil diunduh!');
    };

    return {
      currentViewMode,
      kanbanColumns,
      searchQuery,
      selectedCategory,
      projectFolders,
      promptAddCustomFolder,
      onCustomFolderInput,
      getTaskCountInFolder,
      getTasksInFolder,
      getFolderCompletedCount,
      tasks,
      filteredTasks,
      completedCount,
      pendingCount,
      completionPercent,
      productivityBadge,
      getDeadlineInfo,
      urgentOrOverdueCount,
      urgentOverdueLabel,
      getTasksInCol,
      getTaskCountInCol,
      getEisenhowerTasks,
      timelineGroupedTasks,
      showForm,
      formTab,
      isEditing,
      form,
      formErrors,
      setFormDeadline,
      bulkText,
      bulkError,
      bulkDefault,
      selectedIds,
      isAllSelected,
      toggleSelectAll,
      isListening,
      toggleSpeechRecognition,
      smartPriorityReason,
      runSmartPriorityAi,
      toast,
      getCategoryBadgeClass,
      toggleShowForm,
      openAddModal,
      openAddForCol,
      editTask,
      saveTask,
      saveBulkTasks,
      toggleTaskDone,
      moveTaskCol,
      getPrevCol,
      getNextCol,
      removeTask,
      bulkDelete,
      bulkMarkDone,
      clearCompleted,
      badgeClass,
      formatDate,
      exportToExcel
    };
  }
};
</script>

<style scoped>
.style-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.style-mini {
  font-size: 10.5px;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.min-vh-25 {
  min-height: 200px;
}

.hover-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}

.bg-purple-subtle {
  background-color: #f3e8ff;
}

.text-purple {
  color: #7e22ce;
}

.border-purple-subtle {
  border-color: #e9d5ff;
}

.bg-gradient-success {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.shadow-inner {
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}

.style-scroll-horizontal::-webkit-scrollbar {
  height: 4px;
}
.style-scroll-horizontal::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
