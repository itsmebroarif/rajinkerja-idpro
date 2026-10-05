<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-success-subtle text-success fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-people-fill me-1"></i> Team & Client OS
          </span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-whatsapp me-1"></i> WA Broadcast Ready
          </span>
        </div>
        <h2 class="fw-extrabold mb-1 text-dark">Kontak Tim & Broadcast WhatsApp</h2>
        <p class="text-muted mb-0">Kelola kontak tim internal, rekan kerja, dan klien. Ajak ketemuan di lokasi santai dengan bahasa casual sehari-hari & broadcast pesan WA ke banyak kontak sekaligus.</p>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-warning text-dark px-3 py-2 rounded-3 fw-semibold" @click="exportContactsJson" title="Backup Kontak ke JSON">
          <i class="bi bi-filetype-json text-warning me-1"></i> Export JSON
        </button>
        <button class="btn btn-outline-info text-dark px-3 py-2 rounded-3 fw-semibold" @click="triggerImportContactsJson" title="Import Kontak dari JSON">
          <i class="bi bi-upload text-info me-1"></i> Import JSON
        </button>
        <input type="file" ref="contactsJsonInput" accept=".json" class="d-none" @change="onContactsJsonSelected" />

        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm" @click="openMeetupModal()">
          <i class="bi bi-cup-hot-fill text-success fs-5"></i>
          <span>☕ Ajak Ketemuan</span>
        </button>

        <button class="btn btn-success px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm text-white" @click="openBroadcastModal()">
          <i class="bi bi-broadcast fs-5"></i>
          <span>📢 Broadcast WA</span>
        </button>

        <button class="btn btn-outline-primary px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel
        </button>

        <button
          class="btn btn-primary px-4 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
          @click="toggleShowForm"
        >
          <i :class="showForm ? 'bi bi-x-lg' : 'bi bi-person-plus-fill'" class="fs-5"></i>
          <span>{{ showForm ? 'Tutup Form' : 'Tambah Kontak' }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Quick Selector (Semua / Tim Internal / Klien) -->
    <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2 bg-white p-2 rounded-4 shadow-sm border">
      <div class="btn-group p-1" role="group">
        <button
          class="btn btn-sm px-3 py-2 rounded-3 fw-bold transition-all"
          :class="activeTab === 'all' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'"
          @click="activeTab = 'all'"
        >
          <i class="bi bi-people me-1"></i> Semua Kontak ({{ contacts.length }})
        </button>
        <button
          class="btn btn-sm px-3 py-2 rounded-3 fw-bold transition-all"
          :class="activeTab === 'team' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'"
          @click="activeTab = 'team'"
        >
          <i class="bi bi-person-badge-fill me-1"></i> 👥 Tim Internal ({{ teamCount }})
        </button>
        <button
          class="btn btn-sm px-3 py-2 rounded-3 fw-bold transition-all"
          :class="activeTab === 'client' ? 'btn-info text-white shadow-sm' : 'btn-light text-dark'"
          @click="activeTab = 'client'"
        >
          <i class="bi bi-briefcase-fill me-1"></i> 💼 Klien & Partner ({{ clientCount }})
        </button>
      </div>

      <div class="d-flex align-items-center gap-2 pe-2" v-if="teamCount === 0">
        <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold" @click="seedSampleTeam">
          <i class="bi bi-plus-circle me-1"></i> + Tambah Sample Tim (Demo)
        </button>
      </div>
    </div>

    <!-- Inline Form Panel (Single / Bulk Input) -->
    <div v-if="showForm" class="card border-0 shadow-lg rounded-4 mb-4 bg-white border-start border-4 border-primary">
      <div class="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
        <div class="btn-group" role="group">
          <button
            class="btn btn-sm px-3 py-1.5 fw-bold"
            :class="formTab === 'single' ? 'btn-primary text-white' : 'btn-outline-primary'"
            @click="formTab = 'single'"
          >
            <i class="bi bi-person-lines-fill me-1"></i> Input Tunggal {{ isEditing ? '(Edit Kontak)' : '' }}
          </button>
          <button
            v-if="!isEditing"
            class="btn btn-sm px-3 py-1.5 fw-bold"
            :class="formTab === 'bulk' ? 'btn-primary text-white' : 'btn-outline-primary'"
            @click="formTab = 'bulk'"
          >
            <i class="bi bi-file-earmark-spreadsheet me-1"></i> Bulk Input (Banyak Kontak)
          </button>
        </div>
        <button type="button" class="btn-close" @click="showForm = false"></button>
      </div>

      <div class="card-body p-4">
        <!-- SINGLE FORM -->
        <form v-if="formTab === 'single'" @submit.prevent="saveContact">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold">Nama Lengkap / Rekan <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.name }"
                v-model="form.name"
                placeholder="Contoh: Rian Prasetyo / Budi Santoso"
              />
              <div class="invalid-feedback" v-if="formErrors.name">{{ formErrors.name }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Jabatan / Perusahaan / Divisi</label>
              <input type="text" class="form-control" v-model="form.company" placeholder="Contoh: Lead Developer / PT Teknologi Nusantara" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Alamat Email</label>
              <input
                type="email"
                class="form-control"
                :class="{ 'is-invalid': formErrors.email }"
                v-model="form.email"
                placeholder="kontak@perusahaan.com"
              />
              <div class="invalid-feedback" v-if="formErrors.email">{{ formErrors.email }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Nomor WhatsApp / Telepon <span class="text-success"><i class="bi bi-whatsapp"></i></span></label>
              <input type="text" class="form-control" v-model="form.phone" placeholder="081234567890" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Kategori / Relasi</label>
              <select class="form-select" v-model="form.category">
                <option value="Tim Internal">👥 Tim Internal (Core Team)</option>
                <option value="Rekan Kerja">🤝 Rekan Kerja / Freelancer</option>
                <option value="Corporate Client">💼 Corporate Client</option>
                <option value="VIP Client">⭐ VIP Client</option>
                <option value="SME / UMKM">🏪 SME / UMKM</option>
                <option value="Agency">🏢 Agency Partner</option>
                <option value="Personal">👤 Personal Client</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Status Kontak</label>
              <select class="form-select" v-model="form.status">
                <option value="Active">Active / Ready</option>
                <option value="VIP">⭐ VIP Status</option>
                <option value="Lead">Potential Lead</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-bold">Alamat / Lokasi Domisili</label>
              <input type="text" class="form-control" v-model="form.address" placeholder="Jl. Sudirman No. 45, Jakarta / BSD City Tangerang" />
            </div>

            <div class="col-12">
              <label class="form-label fw-bold">Catatan Khusus / Preferensi Ngopi</label>
              <textarea class="form-control" rows="2" v-model="form.notes" placeholder="Role teknis, tempat ngopi favorit, jadwal meeting, dsb..."></textarea>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3 fw-bold" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-primary px-4 rounded-3 fw-bold shadow-sm">
                {{ isEditing ? 'Simpan Perubahan' : 'Simpan Kontak' }}
              </button>
            </div>
          </div>
        </form>

        <!-- BULK FORM -->
        <form v-else @submit.prevent="saveBulkContacts">
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info py-2 small mb-2 rounded-3">
                Format per baris: <strong>Nama, Perusahaan/Jabatan, Email, Telepon</strong> (Atau cukup nama saja per baris).
              </div>
              <label class="form-label fw-bold">Daftar Kontak (Satu per baris) <span class="text-danger">*</span></label>
              <textarea
                class="form-control font-monospace"
                rows="5"
                placeholder="Rian Prasetyo, Lead Developer, rian@rajinkerja.id, 081398765432&#10;Dinda Kirana, UI/UX Designer, dinda@rajinkerja.id, 085712345678"
                v-model="bulkText"
                :class="{ 'is-invalid': bulkError }"
              ></textarea>
              <div class="invalid-feedback" v-if="bulkError">{{ bulkError }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Kategori Default</label>
              <select class="form-select" v-model="bulkDefault.category">
                <option value="Tim Internal">Tim Internal</option>
                <option value="Corporate Client">Corporate Client</option>
                <option value="Rekan Kerja">Rekan Kerja</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold">Status Default</label>
              <select class="form-select" v-model="bulkDefault.status">
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3 fw-bold" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-bold text-white shadow-sm">
                Simpan Semua Kontak (Bulk)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Search Bar & Category Filter -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control bg-light border-start-0 py-2"
                placeholder="Cari berdasarkan nama, jabatan, perusahaan, atau email..."
                v-model="searchQuery"
              />
              <button class="btn btn-light border" v-if="searchQuery" @click="searchQuery = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="col-md-3">
            <select class="form-select bg-light py-2" v-model="filterCategory">
              <option value="">Semua Kategori</option>
              <option value="Tim Internal">👥 Tim Internal</option>
              <option value="Rekan Kerja">🤝 Rekan Kerja</option>
              <option value="Corporate Client">💼 Corporate Client</option>
              <option value="VIP Client">⭐ VIP Client</option>
              <option value="SME / UMKM">🏪 SME / UMKM</option>
              <option value="Agency">🏢 Agency Partner</option>
              <option value="Personal">👤 Personal Client</option>
            </select>
          </div>

          <div class="col-md-3 text-end">
            <button class="btn btn-outline-secondary w-100 py-2 rounded-3 fw-semibold" @click="resetSearch">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Search
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Selection Bar & Actions -->
    <div v-if="selectedIds.length > 0" class="alert alert-primary d-flex flex-wrap justify-content-between align-items-center rounded-4 shadow-sm mb-4 py-3 px-4">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-square fs-4 text-primary"></i>
        <span class="fw-extrabold fs-6 text-primary">{{ selectedIds.length }} Kontak Terpilih</span>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-sm btn-success rounded-pill px-3 py-1.5 fw-bold text-white shadow-sm d-flex align-items-center gap-1" @click="openBroadcastModalWithSelected()">
          <i class="bi bi-broadcast"></i> Kirim WA Broadcast
        </button>

        <button class="btn btn-sm btn-outline-success rounded-pill px-3 py-1.5 fw-bold bg-white" @click="openMeetupModalWithSelected()">
          <i class="bi bi-cup-hot-fill"></i> Ajak Ketemuan Tim
        </button>

        <button class="btn btn-sm btn-danger rounded-pill px-3 py-1.5 fw-bold shadow-sm" @click="confirmBulkDelete">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
        <button class="btn btn-sm btn-light rounded-pill px-3 py-1.5 fw-semibold border" @click="selectedIds = []">
          Batal Pilih
        </button>
      </div>
    </div>

    <!-- Client / Team Cards Grid -->
    <div class="row g-3 mb-4" v-if="filteredContacts.length > 0">
      <div v-for="c in filteredContacts" :key="c.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-card position-relative overflow-hidden" :class="isTeam(c) ? 'border-start border-4 border-success' : 'border-start border-4 border-primary'">
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" class="form-check-input mt-0" :value="c.id" v-model="selectedIds" />
                  <span class="badge px-3 py-1 rounded-pill small fw-bold" :class="isTeam(c) ? 'bg-success-subtle text-success border border-success' : 'bg-primary-subtle text-primary border border-primary'">
                    {{ isTeam(c) ? '👥 ' + c.category : '💼 ' + (c.category || 'General') }}
                  </span>
                </div>
                <span :class="getStatusBadgeClass(c.status)" class="badge px-3 py-1 rounded-pill small">
                  {{ c.status || 'Active' }}
                </span>
              </div>

              <!-- Contact Avatar & Info -->
              <div class="d-flex align-items-center gap-3 my-2">
                <div class="avatar-circle rounded-circle d-flex align-items-center justify-content-center text-white fw-extrabold fs-5 shadow-sm" :style="{ backgroundColor: getAvatarColor(c.name) }">
                  {{ getInitials(c.name) }}
                </div>
                <div class="min-w-0">
                  <h5 class="fw-extrabold text-dark mb-0 text-truncate">{{ c.name }}</h5>
                  <div class="small fw-bold text-muted text-truncate" v-if="c.company">
                    <i :class="isTeam(c) ? 'bi bi-person-badge text-success me-1' : 'bi bi-building text-primary me-1'"></i>{{ c.company }}
                  </div>
                </div>
              </div>

              <!-- Details -->
              <div class="small text-secondary d-flex flex-column gap-1.5 my-3 bg-light p-3 rounded-3">
                <div v-if="c.phone" class="d-flex align-items-center justify-content-between">
                  <span class="text-muted"><i class="bi bi-telephone text-success me-1"></i> WA:</span>
                  <a :href="'https://wa.me/' + cleanPhone(c.phone)" target="_blank" class="text-decoration-none text-success fw-bold">
                    {{ c.phone }} <i class="bi bi-whatsapp ms-1"></i>
                  </a>
                </div>

                <div v-if="c.email" class="d-flex align-items-center justify-content-between">
                  <span class="text-muted"><i class="bi bi-envelope text-primary me-1"></i> Email:</span>
                  <a :href="'mailto:' + c.email" class="text-decoration-none text-dark fw-medium text-truncate" style="max-width: 170px;">{{ c.email }}</a>
                </div>

                <div v-if="c.address" class="d-flex align-items-start gap-1 text-muted pt-1 border-top">
                  <i class="bi bi-geo-alt text-muted mt-0.5"></i>
                  <span class="small">{{ c.address }}</span>
                </div>
              </div>

              <p class="small text-muted bg-warning-subtle text-warning-emphasis p-2 rounded-3 mb-0" v-if="c.notes">
                <i class="bi bi-sticky-fill me-1 text-warning"></i>{{ c.notes }}
              </p>
            </div>

            <!-- Card Actions -->
            <div class="pt-3 mt-3 border-top d-flex justify-content-between align-items-center gap-2">
              <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1" @click="openMeetupModal(c)">
                <i class="bi bi-cup-hot-fill"></i> Ajak Ketemuan
              </button>

              <div class="d-flex gap-1">
                <a :href="'https://wa.me/' + cleanPhone(c.phone)" target="_blank" v-if="c.phone" class="btn btn-sm btn-success text-white rounded-circle" title="Chat WA Direct">
                  <i class="bi bi-whatsapp"></i>
                </a>
                <button class="btn btn-sm btn-light text-primary rounded-circle border" @click="editContact(c)" title="Edit Kontak">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger rounded-circle border" @click="confirmDeleteContact(c)" title="Hapus Kontak">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
      <i class="bi bi-person-x display-1 text-muted opacity-50"></i>
      <h4 class="fw-bold mt-3 text-dark">Tidak Ada Kontak Ditemukan</h4>
      <p class="text-muted">Gunakan tombol di atas untuk menambahkan kontak tim atau klien baru Anda.</p>
      <div class="d-flex justify-content-center gap-2 mt-2">
        <button class="btn btn-success text-white rounded-3 px-4 py-2 fw-bold" @click="seedSampleTeam">
          <i class="bi bi-person-plus-fill me-1"></i> Tambah Sample Tim Demo
        </button>
        <button class="btn btn-primary rounded-3 px-4 py-2 fw-bold" @click="openAddModal">
          <i class="bi bi-plus-lg me-1"></i> Input Kontak Manual
        </button>
      </div>
    </div>

    <!-- 1. IN-PAGE PANEL: AJAK KETEMUAN / MEETING (NO MODAL OVERLAY) -->
    <transition name="fade-slide">
      <div v-if="meetupModal.show" class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-white p-4">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="p-3 bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 48px; height: 48px;">
              <i class="bi bi-cup-hot-fill fs-3"></i>
            </div>
            <div>
              <h5 class="fw-extrabold text-success mb-0">☕ Ajak Ketemuan Tim & Rekan</h5>
              <small class="text-muted fw-semibold">Pesan ajakan santai + lokasi & waktu ketemuan</small>
            </div>
          </div>
          <button type="button" class="btn-close" @click="closeMeetupModal" aria-label="Close"></button>
        </div>

        <div class="row g-3">
          <div class="col-12">
            <label class="form-label fw-bold small">Pilih Kontak / Tim Target</label>
            <select class="form-select fw-semibold" v-model="meetupModal.targetContactId" @change="onMeetupTargetChange">
              <option v-for="c in contacts" :key="c.id" :value="c.id">
                {{ isTeam(c) ? '👥 ' + c.name + ' (' + (c.company || 'Tim') + ')' : '💼 ' + c.name + ' (' + (c.company || 'Klien') + ')' }} — {{ c.phone || 'No WA' }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small">Jenis Ketemuan</label>
            <select class="form-select" v-model="meetupModal.type" @change="updateMeetupMessage">
              <option value="coffee">☕ Ngopi Santai (Coffee Shop)</option>
              <option value="lunch">🍕 Makan Siang / Dinner (Resto)</option>
              <option value="work">💼 Briefing / Rapat Kerja (Office)</option>
              <option value="online">💻 Google Meet / Call Online</option>
              <option value="brainstorm">🎯 Brainstorming Ide Baru</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small">Waktu & Tanggal Ketemuan</label>
            <input type="text" class="form-control" v-model="meetupModal.time" placeholder="Contoh: Besok jam 14.00" @input="updateMeetupMessage" />
            <div class="d-flex gap-1 mt-1 flex-wrap">
              <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill small" @click="setMeetupTimePreset('Hari ini jam 16.00')">Hari ini jam 4 sore</button>
              <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill small" @click="setMeetupTimePreset('Besok jam 14.00')">Besok jam 2 siang</button>
              <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill small" @click="setMeetupTimePreset('Jumat ini jam 15.30')">Jumat sore</button>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small">Lokasi Tempat Ketemuan</label>
            <input type="text" class="form-control" v-model="meetupModal.location" placeholder="Contoh: Starbucks Senayan" @input="updateMeetupMessage" />
            <div class="d-flex gap-1 mt-1 flex-wrap">
              <button type="button" class="btn btn-xs btn-outline-success py-0 px-2 rounded-pill small" @click="setMeetupLocationPreset('☕ Starbucks terdekat')">☕ Starbucks</button>
              <button type="button" class="btn btn-xs btn-outline-success py-0 px-2 rounded-pill small" @click="setMeetupLocationPreset('🥤 Kopi Kenangan')">🥤 Kopi Kenangan</button>
              <button type="button" class="btn btn-xs btn-outline-success py-0 px-2 rounded-pill small" @click="setMeetupLocationPreset('🏢 Ruang Meeting Kantor')">🏢 Ruang Meeting Kantor</button>
              <button type="button" class="btn btn-xs btn-outline-success py-0 px-2 rounded-pill small" @click="setMeetupLocationPreset('💻 Google Meet Call')">💻 Google Meet</button>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small">Gaya Bahasa</label>
            <div class="btn-group w-100" role="group">
              <button type="button" class="btn btn-sm py-1.5 fw-semibold" :class="meetupModal.tone === 'gaul' ? 'btn-success text-white' : 'btn-outline-success'" @click="setTone('gaul')">😎 Gaul Santai</button>
              <button type="button" class="btn btn-sm py-1.5 fw-semibold" :class="meetupModal.tone === 'friendly' ? 'btn-success text-white' : 'btn-outline-success'" @click="setTone('friendly')">🤝 Casual Kerja</button>
              <button type="button" class="btn btn-sm py-1.5 fw-semibold" :class="meetupModal.tone === 'direct' ? 'btn-success text-white' : 'btn-outline-success'" @click="setTone('direct')">⚡ Singkat Direct</button>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small">Draft Pesan WhatsApp</label>
            <textarea class="form-control font-monospace p-3 bg-light border-success-subtle" rows="4" v-model="meetupModal.customMessage"></textarea>
          </div>

          <div class="col-12 d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" class="btn btn-light px-4 py-2 rounded-pill fw-bold border" @click="closeMeetupModal">Tutup</button>
            <button type="button" class="btn btn-success px-4 py-2 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center gap-2" @click="sendMeetupWhatsApp">
              <i class="bi bi-whatsapp fs-5"></i>
              <span>Kirim via WhatsApp Direct</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 2. IN-PAGE PANEL: BROADCAST WHATSAPP (NO MODAL OVERLAY) -->
    <transition name="fade-slide">
      <div v-if="broadcastModal.show" class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-white p-4">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="p-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 48px; height: 48px;">
              <i class="bi bi-broadcast fs-3"></i>
            </div>
            <div>
              <h5 class="fw-extrabold text-primary mb-0">📢 Broadcast WhatsApp ke Banyak Kontak</h5>
              <small class="text-muted fw-semibold">Kirim pesan personalisasi ke seluruh tim / klien sekaligus</small>
            </div>
          </div>
          <button type="button" class="btn-close" @click="closeBroadcastModal" aria-label="Close"></button>
        </div>

        <div class="row g-3">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label fw-bold small mb-0">Pilih Penerima Broadcast ({{ broadcastSelectedIds.length }} Terpilih)</label>
              <div class="d-flex gap-1">
                <button type="button" class="btn btn-xs btn-outline-primary rounded-pill py-0 px-2 small" @click="selectAllTeamBroadcast">Semua Tim</button>
                <button type="button" class="btn btn-xs btn-outline-primary rounded-pill py-0 px-2 small" @click="selectAllClientsBroadcast">Semua Klien</button>
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill py-0 px-2 small" @click="selectAllBroadcast">Pilih Semua</button>
              </div>
            </div>

            <div class="bg-light p-3 rounded-3 border overflow-auto" style="max-height: 140px;">
              <div class="row g-2">
                <div v-for="c in contacts" :key="c.id" class="col-md-6 col-lg-4">
                  <div class="form-check p-2 bg-white rounded-2 border d-flex align-items-center gap-2">
                    <input type="checkbox" class="form-check-input mt-0 ms-1" :value="c.id" v-model="broadcastSelectedIds" :id="'bc_' + c.id" />
                    <label class="form-check-label small fw-bold text-truncate cursor-pointer" :for="'bc_' + c.id">
                      {{ isTeam(c) ? '👥 ' + c.name : '💼 ' + c.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small">Template Broadcast</label>
            <div class="d-flex gap-2 flex-wrap">
              <button type="button" class="btn btn-sm rounded-pill px-3 fw-bold" :class="broadcastTemplate === 'ketemuan' ? 'btn-success text-white' : 'btn-outline-success'" @click="setBroadcastTemplate('ketemuan')">☕ Ajak Ketemuan</button>
              <button type="button" class="btn btn-sm rounded-pill px-3 fw-bold" :class="broadcastTemplate === 'update' ? 'btn-primary text-white' : 'btn-outline-primary'" @click="setBroadcastTemplate('update')">📢 Info Update</button>
              <button type="button" class="btn btn-sm rounded-pill px-3 fw-bold" :class="broadcastTemplate === 'reminder' ? 'btn-warning text-dark' : 'btn-outline-warning'" @click="setBroadcastTemplate('reminder')">🗓️ Reminder Agenda</button>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small">Isi Pesan Template (Tag <code class="text-danger">{nama}</code>)</label>
            <textarea class="form-control font-monospace p-3" rows="3" v-model="broadcastMessageTemplate"></textarea>
          </div>

          <div class="col-12" v-if="broadcastSelectedContacts.length > 0">
            <div class="card border border-primary-subtle bg-primary bg-opacity-10 rounded-3 p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold text-primary small">
                  🚀 Console Pengiriman WA ({{ currentBroadcastIndex + 1 }} / {{ broadcastSelectedContacts.length }})
                </span>
                <span class="badge bg-primary text-white fw-bold">
                  Target: {{ currentBroadcastContact ? currentBroadcastContact.name : '-' }}
                </span>
              </div>

              <div class="p-3 bg-white rounded-3 border mb-3">
                <div class="small font-monospace text-dark whitespace-pre-wrap">{{ getPersonalizedBroadcastMessage(currentBroadcastContact) }}</div>
              </div>

              <div class="d-flex gap-2">
                <a :href="getBroadcastWaUrl(currentBroadcastContact)" target="_blank" class="btn btn-success fw-bold text-white px-4 py-2 rounded-pill flex-grow-1 shadow-sm d-flex align-items-center justify-content-center gap-2" @click="markCurrentBroadcastSent">
                  <i class="bi bi-whatsapp fs-5"></i>
                  <span>Kirim WA ke {{ currentBroadcastContact ? currentBroadcastContact.name : '' }}</span>
                </a>
                <button type="button" class="btn btn-outline-primary px-3 py-2 rounded-pill fw-bold" @click="nextBroadcastContact" :disabled="currentBroadcastIndex >= broadcastSelectedContacts.length - 1">
                  Lanjut ➡️
                </button>
              </div>
            </div>
          </div>

          <div class="col-12 text-end pt-2 border-top">
            <button type="button" class="btn btn-light px-4 py-2 rounded-pill fw-bold border" @click="closeBroadcastModal">Tutup Broadcast</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 3. IN-PAGE CONFIRMATION DELETE CONTACT (NO MODAL OVERLAY) -->
    <transition name="fade-slide">
      <div v-if="deleteModal.show" class="card border border-2 border-danger shadow-lg rounded-4 overflow-hidden mb-4 bg-white p-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="p-3 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
              <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            </div>
            <div>
              <h5 class="fw-bold text-danger mb-1">Konfirmasi Hapus Kontak</h5>
              <p v-if="deleteModal.type === 'single'" class="small text-muted mb-0">
                Hapus kontak "<strong>{{ deleteModal.targetName }}</strong>"?
              </p>
              <p v-else class="small text-muted mb-0">
                Hapus <strong>{{ deleteModal.count }} kontak terpilih</strong> secara permanen?
              </p>
            </div>
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button type="button" class="btn btn-light px-4 py-2 rounded-pill fw-bold border" @click="closeDeleteModal">Batal</button>
            <button type="button" class="btn btn-danger px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2" @click="executeDelete">
              <i class="bi bi-trash-fill"></i>
              <span>Ya, Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-success border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2 font-semibold">
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
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export default {
  name: 'ContactsView',
  setup() {
    const store = useStore();
    const router = useRouter();

    const searchQuery = ref('');
    const filterCategory = ref('');
    const activeTab = ref('all'); // 'all' | 'team' | 'client'
    const showForm = ref(false);
    const formTab = ref('single');
    const isEditing = ref(false);
    const editingId = ref(null);
    const selectedIds = ref([]);

    const toast = ref({ show: false, message: '' });

    const form = ref({
      name: '',
      company: '',
      email: '',
      phone: '',
      category: 'Tim Internal',
      status: 'Active',
      address: '',
      notes: ''
    });

    const formErrors = ref({});
    const bulkText = ref('');
    const bulkError = ref('');
    const bulkDefault = ref({
      category: 'Tim Internal',
      status: 'Active'
    });

    const contacts = computed(() => store.getters.getContacts);

    const isTeam = (c) => {
      const cat = (c.category || '').toLowerCase();
      return cat.includes('tim') || cat.includes('rekan') || cat.includes('internal') || cat.includes('developer') || cat.includes('designer');
    };

    const teamCount = computed(() => contacts.value.filter(c => isTeam(c)).length);
    const clientCount = computed(() => contacts.value.filter(c => !isTeam(c)).length);

    const filteredContacts = computed(() => {
      return contacts.value.filter(c => {
        // Tab Filter
        if (activeTab.value === 'team' && !isTeam(c)) return false;
        if (activeTab.value === 'client' && isTeam(c)) return false;

        // Search Query
        const query = searchQuery.value.toLowerCase();
        const matchesQuery =
          !query ||
          c.name.toLowerCase().includes(query) ||
          (c.company && c.company.toLowerCase().includes(query)) ||
          (c.email && c.email.toLowerCase().includes(query));

        // Category Filter
        const matchesCat = !filterCategory.value || c.category === filterCategory.value;

        return matchesQuery && matchesCat;
      });
    });

    const showToastMsg = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    // 1. MEETUP MODAL STATE & LOGIC
    const meetupModal = ref({
      show: false,
      targetContactId: null,
      type: 'coffee',
      location: 'Starbucks terdekat',
      time: 'Besok jam 14.00',
      topic: 'ngobrolin kerjaan & fitur baru',
      tone: 'gaul',
      customMessage: ''
    });

    const openMeetupModal = (c = null) => {
      let target = c;
      if (!target && contacts.value.length > 0) {
        target = contacts.value[0];
      }
      meetupModal.value = {
        show: true,
        targetContactId: target ? target.id : null,
        type: 'coffee',
        location: '☕ Starbucks terdekat',
        time: 'Besok jam 14.00',
        topic: 'ngobrolin kerjaan & fitur baru',
        tone: 'gaul',
        customMessage: ''
      };
      updateMeetupMessage();
    };

    const openMeetupModalWithSelected = () => {
      if (selectedIds.value.length > 0) {
        const target = contacts.value.find(c => c.id === selectedIds.value[0]);
        openMeetupModal(target);
      } else {
        openMeetupModal();
      }
    };

    const closeMeetupModal = () => {
      meetupModal.value.show = false;
    };

    const onMeetupTargetChange = () => {
      updateMeetupMessage();
    };

    const setMeetupTimePreset = (t) => {
      meetupModal.value.time = t;
      updateMeetupMessage();
    };

    const setMeetupLocationPreset = (loc) => {
      meetupModal.value.location = loc;
      updateMeetupMessage();
    };

    const setTone = (t) => {
      meetupModal.value.tone = t;
      updateMeetupMessage();
    };

    const updateMeetupMessage = () => {
      const target = contacts.value.find(c => String(c.id) === String(meetupModal.value.targetContactId));
      const name = target ? target.name : 'Bro';
      const loc = meetupModal.value.location || 'lokasi santai';
      const time = meetupModal.value.time || 'waktu luangmu';
      const topic = meetupModal.value.topic || 'kerjaan';

      if (meetupModal.value.tone === 'gaul') {
        meetupModal.value.customMessage = `Halo bro/sis ${name}! Woy, ketemuan yuk di ${loc} pas ${time}. Kita ngobrol santai sekalian bahas ${topic}. Bisa ga bro? Kabarin ya! 👍`;
      } else if (meetupModal.value.tone === 'friendly') {
        meetupModal.value.customMessage = `Halo ${name}, mau ngajak ngopi santai nih di ${loc} tanggal ${time}. Mau sekalian diskusikan ${topic}. Agendamu aman ga? Let me know ya!`;
      } else {
        meetupModal.value.customMessage = `Bro ${name}, ada waktu ga tanggal ${time}? Ketemuan di ${loc} yuk buat bahas ${topic}. Cya!`;
      }
    };

    const sendMeetupWhatsApp = () => {
      const target = contacts.value.find(c => String(c.id) === String(meetupModal.value.targetContactId));
      if (!target || !target.phone) {
        showToastMsg('Nomor WhatsApp kontak belum diisi!');
        return;
      }
      const phone = cleanPhone(target.phone);
      const text = encodeURIComponent(meetupModal.value.customMessage);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      showToastMsg(`Membuka WhatsApp untuk ${target.name}...`);
      closeMeetupModal();
    };

    // 2. BROADCAST MODAL STATE & LOGIC
    const broadcastModal = ref({
      show: false
    });
    const broadcastSelectedIds = ref([]);
    const broadcastTemplate = ref('ketemuan');
    const broadcastMessageTemplate = ref('');
    const currentBroadcastIndex = ref(0);

    const openBroadcastModal = () => {
      broadcastSelectedIds.value = contacts.value.map(c => c.id);
      broadcastTemplate.value = 'ketemuan';
      setBroadcastTemplate('ketemuan');
      currentBroadcastIndex.value = 0;
      broadcastModal.value.show = true;
    };

    const openBroadcastModalWithSelected = () => {
      broadcastSelectedIds.value = [...selectedIds.value];
      broadcastTemplate.value = 'update';
      setBroadcastTemplate('update');
      currentBroadcastIndex.value = 0;
      broadcastModal.value.show = true;
    };

    const closeBroadcastModal = () => {
      broadcastModal.value.show = false;
    };

    const selectAllTeamBroadcast = () => {
      broadcastSelectedIds.value = contacts.value.filter(c => isTeam(c)).map(c => c.id);
    };

    const selectAllClientsBroadcast = () => {
      broadcastSelectedIds.value = contacts.value.filter(c => !isTeam(c)).map(c => c.id);
    };

    const selectAllBroadcast = () => {
      broadcastSelectedIds.value = contacts.value.map(c => c.id);
    };

    const setBroadcastTemplate = (type) => {
      broadcastTemplate.value = type;
      if (type === 'ketemuan') {
        broadcastMessageTemplate.value = `Halo {nama}! Woy, mau ngajak ngopi & ketemuan tim nih besok jam 16.00 di Starbucks terdekat buat bahas agenda minggu ini. Agendamu aman ga? Let me know ya! 👍`;
      } else if (type === 'update') {
        broadcastMessageTemplate.value = `Halo {nama}! Ini broadcast pengumuman tim: Tolong pastikan daftar tugas & progress proyek minggu ini sudah dirapikan ya. Thanks & semangat! 🚀`;
      } else if (type === 'reminder') {
        broadcastMessageTemplate.value = `Halo {nama}! Pengingat agenda rapat & briefing tim kita besok pagi jam 09.00 ya. Mohon hadir tepat waktu. Terima kasih!`;
      } else {
        broadcastMessageTemplate.value = `Halo {nama}, berikut update pesan penting dari tim kami.`;
      }
    };

    const broadcastSelectedContacts = computed(() => {
      return contacts.value.filter(c => broadcastSelectedIds.value.includes(c.id));
    });

    const currentBroadcastContact = computed(() => {
      if (broadcastSelectedContacts.value.length === 0) return null;
      return broadcastSelectedContacts.value[currentBroadcastIndex.value] || broadcastSelectedContacts.value[0];
    });

    const getPersonalizedBroadcastMessage = (c) => {
      if (!c) return '';
      const name = c.name || 'Rekan';
      const company = c.company || '';
      return broadcastMessageTemplate.value
        .replace(/{nama}/g, name)
        .replace(/{perusahaan}/g, company);
    };

    const getBroadcastWaUrl = (c) => {
      if (!c || !c.phone) return '#';
      const phone = cleanPhone(c.phone);
      const text = encodeURIComponent(getPersonalizedBroadcastMessage(c));
      return `https://wa.me/${phone}?text=${text}`;
    };

    const nextBroadcastContact = () => {
      if (currentBroadcastIndex.value < broadcastSelectedContacts.value.length - 1) {
        currentBroadcastIndex.value++;
      }
    };

    const markCurrentBroadcastSent = () => {
      showToastMsg(`Pesan broadcast dikirim ke ${currentBroadcastContact.value ? currentBroadcastContact.value.name : 'kontak'}`);
      if (currentBroadcastIndex.value < broadcastSelectedContacts.value.length - 1) {
        currentBroadcastIndex.value++;
      }
    };

    // 3. DELETE CONFIRMATION MODAL STATE
    const deleteModal = ref({
      show: false,
      type: 'single', // 'single' | 'bulk'
      targetId: null,
      targetName: '',
      count: 0
    });

    const confirmDeleteContact = (c) => {
      deleteModal.value = {
        show: true,
        type: 'single',
        targetId: c.id,
        targetName: c.name,
        count: 1
      };
    };

    const confirmBulkDelete = () => {
      if (selectedIds.value.length === 0) return;
      deleteModal.value = {
        show: true,
        type: 'bulk',
        targetId: null,
        targetName: '',
        count: selectedIds.value.length
      };
    };

    const closeDeleteModal = () => {
      deleteModal.value.show = false;
    };

    const executeDelete = () => {
      if (deleteModal.value.type === 'single') {
        store.dispatch('deleteContact', deleteModal.value.targetId);
        showToastMsg('Kontak berhasil dihapus.');
      } else {
        store.dispatch('deleteContactsBulk', selectedIds.value);
        showToastMsg(`${selectedIds.value.length} kontak berhasil dihapus.`);
        selectedIds.value = [];
      }
      closeDeleteModal();
    };

    // FORM & SEEDING ACTIONS
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
        company: '',
        email: '',
        phone: '',
        category: 'Tim Internal',
        status: 'Active',
        address: '',
        notes: ''
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const editContact = (c) => {
      isEditing.value = true;
      editingId.value = c.id;
      formErrors.value = {};
      form.value = { ...c };
      formTab.value = 'single';
      showForm.value = true;
    };

    const saveContact = () => {
      formErrors.value = {};
      if (!form.value.name || !form.value.name.trim()) {
        formErrors.value.name = 'Nama lengkap / rekan wajib diisi!';
        return;
      }

      if (form.value.email && !form.value.email.includes('@')) {
        formErrors.value.email = 'Format email tidak valid!';
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateContact', { ...form.value, id: editingId.value });
        showToastMsg('Data kontak berhasil diperbarui!');
      } else {
        store.dispatch('addContact', form.value);
        showToastMsg('Kontak baru berhasil ditambahkan!');
      }
      showForm.value = false;
    };

    const saveBulkContacts = () => {
      bulkError.value = '';
      if (!bulkText.value || !bulkText.value.trim()) {
        bulkError.value = 'Tuliskan minimal 1 nama kontak!';
        return;
      }

      const lines = bulkText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const listToAdd = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0] || 'Kontak Baru',
          company: parts[1] || '',
          email: parts[2] || '',
          phone: parts[3] || '',
          category: bulkDefault.value.category,
          status: bulkDefault.value.status,
          notes: ''
        };
      });

      store.dispatch('addContactsBulk', listToAdd);
      showToastMsg(`Berhasil menambahkan ${listToAdd.length} kontak secara bulk!`);
      bulkText.value = '';
      showForm.value = false;
    };

    const seedSampleTeam = () => {
      const sampleTeam = [
        {
          name: 'Rian Prasetyo',
          company: 'Lead Developer',
          email: 'rian.dev@rajinkerja.id',
          phone: '081398765432',
          category: 'Tim Internal',
          status: 'Active',
          address: 'BSD City, Tangerang Selatan',
          notes: 'Full-Stack Lead. Suka ngopi Janji Jiwa.'
        },
        {
          name: 'Dinda Kirana',
          company: 'UI/UX Designer',
          email: 'dinda.design@rajinkerja.id',
          phone: '085712345678',
          category: 'Tim Internal',
          status: 'VIP',
          address: 'Kebayoran Baru, Jakarta Selatan',
          notes: 'Senior UI/UX Illustrator.'
        },
        {
          name: 'Bimo Wicaksono',
          company: 'Project Manager',
          email: 'bimo.pm@rajinkerja.id',
          phone: '081211223344',
          category: 'Tim Internal',
          status: 'Active',
          address: 'Tebet, Jakarta Selatan',
          notes: 'Kordinasi sprint & client liaison.'
        }
      ];

      store.dispatch('addContactsBulk', sampleTeam);
      showToastMsg('3 Anggota Tim Demo berhasil ditambahkan!');
    };

    const resetSearch = () => {
      searchQuery.value = '';
      filterCategory.value = '';
      activeTab.value = 'all';
    };

    const cleanPhone = (phone) => {
      if (!phone) return '';
      let cleaned = phone.replace(/[^0-9]/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
      }
      return cleaned;
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'VIP':
          return 'bg-warning text-dark fw-bold';
        case 'Active':
          return 'bg-success text-white';
        case 'Lead':
          return 'bg-primary text-white';
        case 'Inactive':
          return 'bg-secondary text-white';
        default:
          return 'bg-light text-dark border';
      }
    };

    const getInitials = (name) => {
      if (!name) return 'K';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
      const colors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#e11d48', '#4f46e5'];
      let hash = 0;
      for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    const exportToExcel = () => {
      const exportData = contacts.value.map((c, idx) => ({
        No: idx + 1,
        Nama: c.name,
        Perusahaan_Jabatan: c.company || '-',
        Email: c.email || '-',
        Telepon: c.phone || '-',
        Kategori: c.category || '-',
        Status: c.status || '-',
        Alamat: c.address || '-',
        Catatan: c.notes || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Kontak');
      XLSX.writeFile(workbook, 'daftar_kontak_tim_klien.xlsx');
      showToastMsg('File Excel daftar kontak berhasil diunduh!');
    };

    const contactsJsonInput = ref(null);

    const exportContactsJson = () => {
      try {
        const payload = {
          app: 'TaskArts',
          type: 'contacts_backup',
          version: '2.5',
          exportDate: new Date().toISOString(),
          contacts: contacts.value
        };
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Kontak_TaskArts_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Export Kontak Berhasil!',
          text: `${contacts.value.length} kontak berhasil diunduh sebagai JSON.`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Export JSON',
          text: err.message
        });
      }
    };

    const triggerImportContactsJson = () => {
      if (contactsJsonInput.value) {
        contactsJsonInput.value.value = '';
        contactsJsonInput.value.click();
      }
    };

    const onContactsJsonSelected = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const incomingContacts = parsed.contacts || (Array.isArray(parsed) ? parsed : (parsed.klien || parsed.kontak || []));

          if (!incomingContacts || incomingContacts.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Format Kontak Tidak Ditemukan',
              text: 'Berkas JSON ini tidak memiliki array data kontak yang valid.'
            });
            return;
          }

          Swal.fire({
            title: 'Pulihkan Data Kontak?',
            html: `
              <div class="text-start p-2 bg-light rounded border mb-2 small">
                <p class="mb-1"><strong>Jumlah Kontak:</strong> ${incomingContacts.length} data</p>
                <p class="mb-0"><strong>Contoh:</strong> ${incomingContacts[0]?.name || '-'}</p>
              </div>
              <p class="small text-muted mb-0">Apakah Anda ingin memulihkan atau menambahkan kontak dari berkas JSON ini?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Pulihkan Kontak',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d'
          }).then((result) => {
            if (result.isConfirmed) {
              store.dispatch('importContactsData', incomingContacts);
              Swal.fire({
                icon: 'success',
                title: 'Data Kontak Berhasil Dipulihkan!',
                text: `${incomingContacts.length} kontak telah tersimpan.`,
                timer: 2000,
                showConfirmButton: false
              });
            }
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Berkas Tidak Valid',
            text: 'Gagal membaca berkas JSON: ' + err.message
          });
        }
      };
      reader.readAsText(file);
    };

    return {
      searchQuery,
      filterCategory,
      activeTab,
      showForm,
      formTab,
      isEditing,
      form,
      formErrors,
      bulkText,
      bulkError,
      bulkDefault,
      selectedIds,
      contacts,
      teamCount,
      clientCount,
      filteredContacts,
      isTeam,
      toast,
      toggleShowForm,
      openAddModal,
      editContact,
      saveContact,
      saveBulkContacts,
      seedSampleTeam,
      resetSearch,
      cleanPhone,
      getStatusBadgeClass,
      getInitials,
      getAvatarColor,
      exportToExcel,
      contactsJsonInput,
      exportContactsJson,
      triggerImportContactsJson,
      onContactsJsonSelected,

      // Meetup Modal
      meetupModal,
      openMeetupModal,
      openMeetupModalWithSelected,
      closeMeetupModal,
      onMeetupTargetChange,
      setMeetupTimePreset,
      setMeetupLocationPreset,
      setTone,
      updateMeetupMessage,
      sendMeetupWhatsApp,

      // Broadcast Modal
      broadcastModal,
      broadcastSelectedIds,
      broadcastTemplate,
      broadcastMessageTemplate,
      currentBroadcastIndex,
      broadcastSelectedContacts,
      currentBroadcastContact,
      openBroadcastModal,
      openBroadcastModalWithSelected,
      closeBroadcastModal,
      selectAllTeamBroadcast,
      selectAllClientsBroadcast,
      selectAllBroadcast,
      setBroadcastTemplate,
      getPersonalizedBroadcastMessage,
      getBroadcastWaUrl,
      nextBroadcastContact,
      markCurrentBroadcastSent,

      // Delete Modal
      deleteModal,
      confirmDeleteContact,
      confirmBulkDelete,
      closeDeleteModal,
      executeDelete
    };
  }
};
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.avatar-circle {
  width: 46px;
  height: 46px;
  min-width: 46px;
}

.cursor-pointer {
  cursor: pointer;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>
