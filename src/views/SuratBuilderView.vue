<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner (no-print) -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border no-print">
      <div>
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span class="badge bg-danger text-white fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-file-earmark-check-fill me-1"></i> Persuratan Resmi Indonesia
          </span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
          <span class="badge bg-primary text-white fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-image me-1"></i> Custom Logo Kop Surat
          </span>
          <span class="badge bg-success text-white fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-people-fill me-1"></i> Bulk Mail Merge (Multi-Penerima)
          </span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">Generator Surat Resmi & Desain Kop Surat Custom</h2>
        <p class="text-muted mb-0">Buat surat kedinasan, lamaran, izin, dan perjanjian kerja untuk 1 orang maupun <strong>massal / banyak penerima sekaligus</strong> dengan Kop Surat otomatis dan cetak PDF standar instansi.</p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <!-- Cek Draft Laporan & Surat Button -->
        <button class="btn btn-outline-primary rounded-pill px-3.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm" @click="openDraftsModal" title="Periksa daftar draft dan laporan yang sudah dikerjakan">
          <i class="bi bi-folder2-open text-primary"></i>
          <span>Cek Draft ({{ draftsList.length }})</span>
        </button>
        <button class="btn btn-outline-warning text-dark rounded-pill px-3 fw-semibold" @click="exportSuratJson" title="Download data Surat sebagai JSON">
          <i class="bi bi-filetype-json text-warning me-1"></i> Export JSON
        </button>
        <button class="btn btn-outline-info text-dark rounded-pill px-3 fw-semibold" @click="triggerImportSuratJson" title="Import data Surat dari JSON">
          <i class="bi bi-upload text-info me-1"></i> Import JSON
        </button>
        <input type="file" ref="suratJsonInput" accept=".json" class="d-none" @change="onSuratJsonSelected" />
        <button class="btn btn-outline-success rounded-pill px-3 fw-semibold" @click="saveLetter(false)" :title="currentDraftId ? 'Perbarui draft yang sedang dibuka' : 'Simpan surat ke arsip draft'">
          <i class="bi bi-floppy me-1"></i> {{ currentDraftId ? 'Perbarui Draft' : 'Simpan Draft' }}
        </button>
        <button v-if="currentDraftId" class="btn btn-xs btn-outline-secondary rounded-pill px-2.5 fw-semibold" @click="saveLetter(true)" title="Simpan sebagai draft baru (salinan terpisah)">
          <i class="bi bi-plus-circle me-1"></i> Simpan Draft Baru
        </button>
        <button v-if="suratMode === 'single'" class="btn btn-success rounded-pill px-3.5 fw-bold shadow-sm" @click="openWaModal">
          <i class="bi bi-whatsapp me-1"></i> Kirim via WA
        </button>
        <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5" :disabled="isPdfLoading" @click="printCurrentMode">
          <span v-if="isPdfLoading" class="spinner-border spinner-border-sm text-white" role="status"></span>
          <i v-else class="bi bi-printer"></i>
          <span>{{ isPdfLoading ? 'Menyiapkan Surat...' : (suratMode === 'bulk' ? 'Buka Semua Surat (Bulk PDF A4)' : 'Cetak / Buka PDF A4') }}</span>
        </button>
      </div>
    </div>

    <!-- Mode Selector: Single Letter vs Bulk Multi-Penerima (no-print) -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-2 mb-4 no-print">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 px-2 py-1">
        <div class="btn-group p-1 bg-light rounded-pill border" role="group">
          <button
            type="button"
            class="btn rounded-pill px-4 py-1.5 fw-bold small transition-all"
            :class="suratMode === 'single' ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'"
            @click="suratMode = 'single'"
          >
            <i class="bi bi-file-earmark-text me-1.5"></i> Mode Tunggal (1 Surat)
          </button>
          <button
            type="button"
            class="btn rounded-pill px-4 py-1.5 fw-bold small transition-all"
            :class="suratMode === 'bulk' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'"
            @click="suratMode = 'bulk'"
          >
            <i class="bi bi-people-fill me-1.5"></i> Mode Massal / Bulk Multi-Penerima ({{ bulkRecipients.length }} Orang)
          </button>
        </div>

        <div v-if="suratMode === 'bulk'" class="d-flex align-items-center gap-2">
          <span class="badge bg-success-subtle text-success fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-layers-fill me-1"></i> {{ bulkRecipients.length }} Penerima Terdaftar
          </span>
          <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" @click="openBulkBroadcastModal">
            <i class="bi bi-whatsapp me-1"></i> Broadcast WA Massal
          </button>
        </div>
      </div>
    </div>

    <!-- Letter Templates Gallery Carousel / Grid (no-print) -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 no-print">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 class="fw-bold text-dark mb-0"><i class="bi bi-collection text-primary me-2"></i>Pilih 12 Template Surat Siap Pakai</h5>
          <small class="text-muted">Template akan mengisi struktur Kop, perihal, dan draf isi surat secara otomatis.</small>
        </div>
        <div class="d-flex gap-1">
          <button
            v-for="cat in templateCategories"
            :key="cat.id"
            class="btn btn-xs rounded-pill px-2.5 py-1"
            :class="activeTemplateCat === cat.id ? 'btn-primary fw-bold' : 'btn-light border text-muted'"
            @click="activeTemplateCat = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="row g-3">
        <div v-for="tmpl in filteredTemplates" :key="tmpl.id" class="col-6 col-md-4 col-lg-3">
          <div
            class="card h-100 border-2 rounded-3 p-3 cursor-pointer transition-all text-center hover-shadow"
            :class="selectedTemplateId === tmpl.id ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-light'"
            @click="selectTemplate(tmpl)"
          >
            <div class="p-2 rounded-circle bg-white shadow-sm d-inline-block mx-auto mb-2" style="width: 44px; height: 44px;">
              <i :class="tmpl.icon" class="fs-4 text-primary"></i>
            </div>
            <h6 class="fw-bold text-dark small mb-1 text-truncate">{{ tmpl.title }}</h6>
            <span class="badge bg-secondary-subtle text-secondary small rounded-pill">{{ tmpl.category }}</span>
            <small class="d-block text-muted mt-1" style="font-size: 10px;">{{ tmpl.desc }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- BULK RECIPIENTS MANAGEMENT PANEL (Shown only in Bulk Mode)-->
    <!-- ======================================================== -->
    <div v-if="suratMode === 'bulk'" class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 no-print border-start border-success border-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2 border-bottom pb-3">
        <div>
          <h5 class="fw-bold text-dark mb-0">
            <i class="bi bi-people-fill text-success me-2"></i>Daftar Penerima Surat Massal (Bulk Mail Merge)
          </h5>
          <small class="text-muted">
            Gunakan variabel berikut di Master Surat:
            <code class="text-primary fw-bold mx-1">\{\{nama\}\}</code>,
            <code class="text-primary fw-bold mx-1">\{\{jabatan\}\}</code>,
            <code class="text-primary fw-bold mx-1">\{\{instansi\}\}</code>,
            <code class="text-primary fw-bold mx-1">\{\{nomor_surat\}\}</code>,
            <code class="text-primary fw-bold mx-1">\{\{alamat\}\}</code>,
            <code class="text-primary fw-bold mx-1">\{\{catatan\}\}</code>
          </small>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="showBulkImportModal = true">
            <i class="bi bi-clipboard-plus me-1"></i> Paste CSV / Format Teks
          </button>
          <button class="btn btn-sm btn-outline-success rounded-pill px-3" @click="importFromContacts">
            <i class="bi bi-person-lines-fill me-1"></i> Ambil dari Kontak Tim
          </button>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="autoGenerateLetterNumbers">
            <i class="bi bi-123 me-1"></i> Auto Nomor Urut
          </button>
          <button class="btn btn-sm btn-success rounded-pill px-3" @click="addRecipientRow">
            <i class="bi bi-plus-lg me-1"></i> Tambah Penerima
          </button>
        </div>
      </div>

      <!-- Recipients Table -->
      <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
        <table class="table table-hover table-bordered align-middle small mb-0">
          <thead class="table-light sticky-top">
            <tr>
              <th style="width: 45px;" class="text-center">No</th>
              <th style="width: 180px;">Nama Penerima <span class="text-danger">*</span></th>
              <th style="width: 160px;">Jabatan</th>
              <th style="width: 180px;">Instansi / Alamat</th>
              <th style="width: 140px;">No. WhatsApp</th>
              <th style="width: 170px;">Nomor Surat Spesifik</th>
              <th style="width: 150px;">Catatan Tambahan</th>
              <th style="width: 90px;" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rec, idx) in bulkRecipients" :key="rec.id" :class="{ 'table-primary bg-opacity-10': activeBulkIndex === idx }">
              <td class="text-center fw-bold text-muted">{{ idx + 1 }}</td>
              <td>
                <input type="text" class="form-control form-control-sm" v-model="rec.name" placeholder="Nama Lengkap" />
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" v-model="rec.title" placeholder="Jabatan / Posisi" />
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" v-model="rec.company" placeholder="Instansi / PT / Di Tempat" />
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" v-model="rec.phone" placeholder="081234567890" />
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" v-model="rec.number" placeholder="001/SK/RK/VIII/2026" />
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" v-model="rec.notes" placeholder="Opsional" />
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    :class="{ 'btn-primary text-white': activeBulkIndex === idx }"
                    @click="activeBulkIndex = idx"
                    title="Pratinjau Surat Ini"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="removeRecipientRow(idx)"
                    :disabled="bulkRecipients.length <= 1"
                    title="Hapus Penerima"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
        <span class="small text-muted">
          Total <strong>{{ bulkRecipients.length }}</strong> penerima siap dicetak secara massal dengan pemisah halaman otomatis.
        </span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="clearBulkRecipients" :disabled="bulkRecipients.length <= 1">
            <i class="bi bi-x-circle me-1"></i> Reset Daftar Penerima
          </button>
        </div>
      </div>
    </div>

    <!-- Main Editor & Preview Grid -->
    <div class="row g-4">
      <!-- Left Form Controls (no-print) -->
      <div class="col-lg-5 no-print">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 class="fw-bold text-dark mb-0">
              <i class="bi bi-pencil-square text-primary me-2"></i>{{ suratMode === 'bulk' ? 'Master Pengaturan Surat' : 'Pengaturan & Isi Surat' }}
            </h5>
            <span v-if="suratMode === 'bulk'" class="badge bg-success rounded-pill small">Master Mail Merge</span>
          </div>

          <!-- Active Draft Indicator Banner -->
          <div v-if="currentDraft" class="alert alert-primary py-2 px-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 shadow-xs">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-check-fill text-primary fs-5"></i>
              <div>
                <div class="fw-bold small text-dark">Draft Aktif: {{ currentDraft.title || (currentDraft.data && currentDraft.data.subject) || 'Surat' }}</div>
                <div class="text-muted" style="font-size: 11px;">
                  Terakhir disimpan: {{ formatDateTime(currentDraft.updatedAt || currentDraft.createdAt) }} • Status: <span class="text-success fw-semibold">{{ currentDraft.status || 'Selesai Dikerjakan' }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-1.5">
              <button type="button" class="btn btn-xs btn-primary rounded-pill px-2.5 fw-bold" @click="saveLetter(false)" title="Perbarui draft ini">
                <i class="bi bi-floppy me-1"></i> Perbarui
              </button>
              <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2" @click="createNewDraft" title="Mulai lembar surat baru">
                <i class="bi bi-plus-lg"></i> Baru
              </button>
            </div>
          </div>

          <!-- Nav Tabs for Form: Kop Surat, Kertas & Margin A4, Metadata, Isi & Tanda Tangan -->
          <ul class="nav nav-pills nav-fill mb-3 bg-light p-1 rounded-3">
            <li class="nav-item">
              <button class="nav-link py-1.5 small fw-semibold" :class="{ active: formTab === 'kop' }" @click="formTab = 'kop'">
                <i class="bi bi-image me-1"></i> Kop & Logo
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-1.5 small fw-semibold" :class="{ active: formTab === 'margin' }" @click="formTab = 'margin'">
                <i class="bi bi-aspect-ratio me-1"></i> Kertas & Margin
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-1.5 small fw-semibold" :class="{ active: formTab === 'meta' }" @click="formTab = 'meta'">
                <i class="bi bi-card-heading me-1"></i> Metadata
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-1.5 small fw-semibold" :class="{ active: formTab === 'body' }" @click="formTab = 'body'">
                <i class="bi bi-text-paragraph me-1"></i> Isi Surat
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-1.5 small fw-semibold" :class="{ active: formTab === 'sign' }" @click="formTab = 'sign'">
                <i class="bi bi-pen me-1"></i> TTD & Cap
              </button>
            </li>
          </ul>

          <!-- TAB 1: KOP SURAT & LOGO CUSTOMIZATION -->
          <div v-show="formTab === 'kop'">
            <div class="form-check form-switch mb-3 bg-light p-3 rounded-3 border">
              <input class="form-check-input" type="checkbox" id="enableKop" v-model="letter.showKop" />
              <label class="form-check-label fw-bold text-dark small" for="enableKop">
                Aktifkan Kop Surat Resmi (Header Instansi)
              </label>
            </div>

            <div v-if="letter.showKop" class="p-3 bg-light border rounded-3 mb-3">
              <!-- Logo Upload, Status, & Hapus Logo (Tanpa Logo) -->
              <div class="mb-3 p-2.5 bg-white border rounded-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-bold text-dark small mb-0">Logo Kop Surat</label>
                  <span v-if="currentLogoSrc" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
                    <i class="bi bi-image me-1"></i>Logo Terpasang
                  </span>
                  <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill small">
                    <i class="bi bi-slash-circle me-1"></i>Tanpa Logo (Kop Polos)
                  </span>
                </div>

                <div class="d-flex flex-wrap align-items-center gap-2 mb-2.5">
                  <input type="file" ref="logoInput" accept="image/*" class="d-none" @change="onLogoSelected" />
                  <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold" @click="$refs.logoInput.click()">
                    <i class="bi bi-upload me-1"></i> Upload Logo Baru
                  </button>
                  
                  <!-- Tombol Hapus Logo (Bisa Dihapus Kapan Saja) -->
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
                    @click="clearLogo"
                    :disabled="!currentLogoSrc"
                    title="Hapus logo agar kop surat tampil polos tanpa logo"
                  >
                    <i class="bi bi-trash me-1"></i> Hapus Logo (Tanpa Logo)
                  </button>
                </div>

                <!-- Ready Preset Logos -->
                <div class="small text-muted mb-1.5">Atau pilih Logo Preset Instansi:</div>
                <div class="d-flex flex-wrap gap-1.5">
                  <button
                    v-for="preset in logoPresets"
                    :key="preset.id"
                    type="button"
                    class="btn btn-xs rounded-pill transition-all"
                    :class="(letter.kopLogoPreset === preset.id && !letter.kopLogo) || (preset.id === 'none' && !currentLogoSrc) ? 'btn-dark fw-bold shadow-xs' : 'btn-outline-secondary'"
                    @click="applyLogoPreset(preset)"
                  >
                    {{ preset.name }}
                  </button>
                </div>
              </div>

              <!-- Posisi Logo & Ukuran Slider -->
              <div v-if="currentLogoSrc" class="row g-2 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Posisi Logo</label>
                  <select class="form-select form-select-sm" v-model="letter.kopLogoPosition">
                    <option value="left">Kiri (Standar Instansi)</option>
                    <option value="center">Tengah Atas</option>
                    <option value="right">Kanan</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Ukuran Tinggi Logo: {{ letter.kopLogoHeight || 60 }}px</label>
                  <input type="range" class="form-range" min="30" max="110" step="5" v-model.number="letter.kopLogoHeight" />
                </div>
              </div>

              <!-- Data Teks Kop Surat -->
              <div class="mb-2">
                <label class="form-label fw-bold text-dark small">Nama Instansi / Perusahaan Utama</label>
                <input type="text" class="form-control form-control-sm fw-bold" v-model="letter.kopName" placeholder="PEMERINTAH KOTA / PT RAJINKERJA INDONESIA" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-bold text-dark small">Sub-Instansi / Divisi / Tagline</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.kopSubname" placeholder="DINAS KOMUNIKASI & INFORMATIKA / DIVISI TEKNOLOGI" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-bold text-dark small">Alamat Lengkap & Kode Pos</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.kopAddress" placeholder="Jl. Jend. Sudirman No. 88, Jakarta Selatan 12190" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-dark small">Kontak (Telepon, Email, Website)</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.kopContact" placeholder="Telp: (021) 555-1234 | Email: sekretariat@instansi.go.id" />
              </div>

              <!-- Model Garis Pembatas Kop -->
              <div>
                <label class="form-label fw-bold text-dark small">Model Garis Pembatas Kop</label>
                <select class="form-select form-select-sm" v-model="letter.kopStyle">
                  <option value="double">Garis Ganda Resmi (Tebal-Tipis Standar)</option>
                  <option value="single">Garis Tunggal Modern</option>
                  <option value="thick">Garis Tunggal Tebal</option>
                  <option value="none">Tanpa Garis Pembatas</option>
                </select>
              </div>
            </div>
          </div>

          <!-- TAB 2: KERTAS & MARGIN RESMI -->
          <div v-show="formTab === 'margin'">
            <!-- Alert Info -->
            <div class="alert alert-info py-2 px-3 rounded-3 small mb-3 border-info-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <i class="bi bi-aspect-ratio-fill me-1.5 text-info"></i>
                <strong>Format Kertas:</strong> {{ currentPaperInfo.name }} ({{ currentPaperInfo.widthMm }} × {{ currentPaperInfo.heightMm }} mm) — {{ letter.paperOrientation === 'landscape' ? 'Mendatar (Landscape)' : 'Tegak (Portrait)' }}
              </div>
              <span class="badge bg-primary text-white fw-bold">{{ (letter.paperSize || 'A4').toUpperCase() }}</span>
            </div>

            <!-- 1. Pilihan Ukuran Kertas Resmi -->
            <div class="mb-3 p-3 bg-light border rounded-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-bold text-dark small mb-0">1. Pilihan Ukuran Kertas</label>
                <span class="text-muted" style="font-size: 11px;">Presisi Cetak & PDF</span>
              </div>
              <div class="row g-2">
                <div v-for="p in paperSizesList" :key="p.id" class="col-6 col-sm-4">
                  <div
                    class="p-2.5 rounded-3 border text-center cursor-pointer transition-all h-100 d-flex flex-column justify-content-between"
                    :class="letter.paperSize === p.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-dark hover-shadow'"
                    @click="letter.paperSize = p.id"
                  >
                    <div>
                      <div class="fw-bold fs-6">{{ p.name }}</div>
                      <div class="small" :class="letter.paperSize === p.id ? 'text-white-50' : 'text-muted'" style="font-size: 11px;">
                        {{ p.widthMm }} × {{ p.heightMm }} mm
                      </div>
                    </div>
                    <div class="mt-1.5">
                      <span v-if="p.id === 'a4'" class="badge" :class="letter.paperSize === p.id ? 'bg-white text-primary fw-bold' : 'bg-success-subtle text-success border border-success-subtle'" style="font-size: 9.5px;">
                        Standar Nasional (A4)
                      </span>
                      <span v-else-if="p.id === 'f4'" class="badge" :class="letter.paperSize === p.id ? 'bg-white text-primary fw-bold' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'" style="font-size: 9.5px;">
                        HVS Folio / Dinas
                      </span>
                      <span v-else class="badge" :class="letter.paperSize === p.id ? 'bg-white text-primary fw-bold' : 'bg-light text-secondary border'" style="font-size: 9.5px;">
                        Dokumen Bisnis
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Orientasi Kertas -->
              <div class="mt-3 pt-2.5 border-top">
                <label class="form-label fw-bold text-dark small mb-1.5">Orientasi Halaman</label>
                <div class="btn-group w-100">
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="letter.paperOrientation !== 'landscape' ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'"
                    @click="letter.paperOrientation = 'portrait'"
                  >
                    <i class="bi bi-file-earmark me-1"></i> Tegak / Portrait (Standar Surat)
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="letter.paperOrientation === 'landscape' ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'"
                    @click="letter.paperOrientation = 'landscape'"
                  >
                    <i class="bi bi-file-earmark-spreadsheet me-1"></i> Mendatar / Landscape (Tabel & Memo)
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Preset Margin Resmi Indonesia -->
            <div class="mb-3 p-3 bg-light border rounded-3">
              <label class="form-label fw-bold text-dark small mb-1">2. Preset Jarak Margin Resmi Indonesia</label>
              <div class="d-grid gap-1.5">
                <button
                  type="button"
                  class="btn btn-sm text-start rounded-3 d-flex justify-content-between align-items-center"
                  :class="letter.marginPreset === 'official' ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'"
                  @click="applyMarginPreset('official')"
                >
                  <span><strong>Standar Kedinasan (Tata Naskah Dinas RI)</strong><br><small style="font-size: 11px;">Atas 20mm, Bawah 20mm, Kiri 25mm (Arsip/Ordner), Kanan 20mm</small></span>
                  <i v-if="letter.marginPreset === 'official'" class="bi bi-check-circle-fill"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm text-start rounded-3 d-flex justify-content-between align-items-center"
                  :class="letter.marginPreset === 'symmetric' ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'"
                  @click="applyMarginPreset('symmetric')"
                >
                  <span><strong>Standar Simetris</strong><br><small style="font-size: 11px;">Atas 20mm, Bawah 20mm, Kiri 20mm, Kanan 20mm</small></span>
                  <i v-if="letter.marginPreset === 'symmetric'" class="bi bi-check-circle-fill"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm text-start rounded-3 d-flex justify-content-between align-items-center"
                  :class="letter.marginPreset === 'compact' ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'"
                  @click="applyMarginPreset('compact')"
                >
                  <span><strong>Ringkas / Muat 1 Halaman</strong><br><small style="font-size: 11px;">Atas 15mm, Bawah 15mm, Kiri 20mm, Kanan 15mm</small></span>
                  <i v-if="letter.marginPreset === 'compact'" class="bi bi-check-circle-fill"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm text-start rounded-3 d-flex justify-content-between align-items-center"
                  :class="letter.marginPreset === 'wide' ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'"
                  @click="applyMarginPreset('wide')"
                >
                  <span><strong>Ekstra Lebar (Banyak Lampiran)</strong><br><small style="font-size: 11px;">Atas 25mm, Bawah 25mm, Kiri 30mm, Kanan 20mm</small></span>
                  <i v-if="letter.marginPreset === 'wide'" class="bi bi-check-circle-fill"></i>
                </button>
              </div>
            </div>

            <!-- 3. Custom Millimeter Margins -->
            <div class="mb-3 p-3 bg-light border rounded-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-bold text-dark small mb-0">3. Penyesuaian Jarak Margin Milimeter (mm)</label>
                <button type="button" class="btn btn-xs btn-outline-info" @click="showMarginGuides = !showMarginGuides">
                  <i class="bi bi-bounding-box-circles me-1"></i> {{ showMarginGuides ? 'Sembunyikan Garis Panduan' : 'Lihat Garis Panduan di Kertas' }}
                </button>
              </div>
              <div class="row g-2">
                <div class="col-6">
                  <label class="small text-muted mb-0">Jarak Margin Atas (Top)</label>
                  <div class="input-group input-group-sm">
                    <input type="number" min="5" max="60" class="form-control" v-model.number="letter.marginTop" @change="letter.marginPreset = 'custom'" />
                    <span class="input-group-text">mm</span>
                  </div>
                </div>
                <div class="col-6">
                  <label class="small text-muted mb-0">Jarak Margin Bawah (Bottom)</label>
                  <div class="input-group input-group-sm">
                    <input type="number" min="5" max="60" class="form-control" v-model.number="letter.marginBottom" @change="letter.marginPreset = 'custom'" />
                    <span class="input-group-text">mm</span>
                  </div>
                </div>
                <div class="col-6">
                  <label class="small text-muted mb-0">Jarak Margin Kiri (Left / Arsip)</label>
                  <div class="input-group input-group-sm">
                    <input type="number" min="5" max="60" class="form-control" v-model.number="letter.marginLeft" @change="letter.marginPreset = 'custom'" />
                    <span class="input-group-text">mm</span>
                  </div>
                </div>
                <div class="col-6">
                  <label class="small text-muted mb-0">Jarak Margin Kanan (Right)</label>
                  <div class="input-group input-group-sm">
                    <input type="number" min="5" max="60" class="form-control" v-model.number="letter.marginRight" @change="letter.marginPreset = 'custom'" />
                    <span class="input-group-text">mm</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Tipografi Kertas -->
            <div class="p-3 bg-light border rounded-3">
              <label class="form-label fw-bold text-dark small mb-2">4. Tipografi & Ukuran Teks Standar Surat</label>
              <div class="row g-2">
                <div class="col-md-7">
                  <label class="small text-muted mb-0">Jenis Font</label>
                  <select class="form-select form-select-sm" v-model="letter.fontFamily">
                    <option value="'Times New Roman', Times, serif">Times New Roman (Standar Resmi)</option>
                    <option value="'Bookman Old Style', Georgia, serif">Bookman Old Style (Klasik Kedinasan)</option>
                    <option value="Arial, Helvetica, sans-serif">Arial (Modern Bersih)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Kontemporer)</option>
                    <option value="Garamond, serif">Garamond (Elegan)</option>
                  </select>
                </div>
                <div class="col-md-5">
                  <label class="small text-muted mb-0">Ukuran Font Dasar</label>
                  <select class="form-select form-select-sm" v-model="letter.fontSize">
                    <option value="15">12 pt (15px) Standar</option>
                    <option value="14">11 pt (14px) Proporsional</option>
                    <option value="13">10.5 pt (13px) Rapat</option>
                    <option value="16">13 pt (16px) Besar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: METADATA & PENERIMA -->
          <div v-show="formTab === 'meta'">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Nomor Surat Master</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.number" placeholder="001/SK/RK/VIII/2026" />
                <small v-if="suratMode === 'bulk'" class="text-muted" style="font-size: 11px;">Akan ditimpa jika penerima memiliki nomor spesifik.</small>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Kota & Tanggal Surat</label>
                <div class="input-group input-group-sm">
                  <input type="text" class="form-control" v-model="letter.city" placeholder="Jakarta" style="max-width: 90px;" />
                  <input type="date" class="form-control" v-model="letter.date" />
                </div>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Lampiran (Opsional)</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.attachment" placeholder="1 (Satu) Berkas Proposal" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Perihal / Hal Surat</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.subject" placeholder="Surat Penawaran Kerjasama" />
              </div>
            </div>

            <div v-if="suratMode === 'single'" class="mb-3">
              <label class="form-label fw-bold text-dark small">Penerima / Kepada Yth.</label>
              <input type="text" class="form-control form-control-sm mb-1" v-model="letter.recipientName" placeholder="Bapak / Ibu Pimpinan PT Mitra Utama" />
              <input type="text" class="form-control form-control-sm mb-1" v-model="letter.recipientTitle" placeholder="Direktur Operasional / HRD Manager" />
              <input type="text" class="form-control form-control-sm mb-1" v-model="letter.recipientAddress" placeholder="Di Tempat / Jakarta Selatan" />
            </div>
            <div v-else class="alert alert-success py-2 px-3 small mb-3">
              <i class="bi bi-info-circle-fill me-1"></i> Data penerima diatur secara dinamis pada <strong>Daftar Penerima Surat Massal</strong> di atas.
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark small">Salam Pembuka</label>
              <input type="text" class="form-control form-control-sm" v-model="letter.salutation" placeholder="Dengan hormat," />
            </div>
          </div>

          <!-- TAB 3: ISI & NARASI SURAT -->
          <div v-show="formTab === 'body'">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label fw-bold text-dark small mb-0">Isi Surat / Narasi Utama</label>
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-xs btn-outline-primary rounded-pill px-2 py-0.5" @click="insertNewParagraph" title="Tambah Paragraf Baru">
                  <i class="bi bi-plus-circle me-1"></i> + Paragraf
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2 py-0.5 ms-1" @click="insertBulletList" title="Tambah Poin Rincian">
                  <i class="bi bi-list-task me-1"></i> + Poin
                </button>
              </div>
            </div>

            <div v-if="suratMode === 'bulk'" class="d-flex flex-wrap gap-1 mb-2">
              <span class="badge bg-light text-dark border cursor-pointer" @click="insertPlaceholder('\{\{nama\}\}')" title="Klik untuk sisipkan">+ \{\{nama\}\}</span>
              <span class="badge bg-light text-dark border cursor-pointer" @click="insertPlaceholder('\{\{jabatan\}\}')" title="Klik untuk sisipkan">+ \{\{jabatan\}\}</span>
              <span class="badge bg-light text-dark border cursor-pointer" @click="insertPlaceholder('\{\{instansi\}\}')" title="Klik untuk sisipkan">+ \{\{instansi\}\}</span>
              <span class="badge bg-light text-dark border cursor-pointer" @click="insertPlaceholder('\{\{nomor_surat\}\}')" title="Klik untuk sisipkan">+ \{\{nomor_surat\}\}</span>
            </div>

            <textarea class="form-control form-control-sm border-2 rounded-3 font-sans" rows="11" v-model="letter.bodyContent" placeholder="Tuliskan isi surat lengkap di sini..."></textarea>
            <div class="form-text small text-muted mt-1" style="font-size: 0.78rem;">
              <i class="bi bi-info-circle text-primary me-1"></i>Tekan <code>Enter</code> 2x untuk membuat alinea baru yang menjorok otomatis.
            </div>

            <div class="mt-3">
              <label class="form-label fw-bold text-dark small">Salam Penutup</label>
              <input type="text" class="form-control form-control-sm" v-model="letter.closing" placeholder="Hormat kami," />
            </div>
          </div>

          <!-- TAB 4: TANDA TANGAN & STEMPEL CAP -->
          <div v-show="formTab === 'sign'">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Nama Penandatangan</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.signerName" placeholder="Arif Permana, S.Kom" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Jabatan Penandatangan</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.signerTitle" placeholder="Direktur Utama" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">NIP / NIK / No. Karyawan (Opsional)</label>
                <input type="text" class="form-control form-control-sm" v-model="letter.signerNip" placeholder="NIP. 19850115 201001 1 002" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Posisi Tanda Tangan</label>
                <select class="form-select form-select-sm" v-model="letter.signaturePosition">
                  <option value="right">Kanan Bawah (Standar)</option>
                  <option value="left">Kiri Bawah</option>
                  <option value="center">Tengah Bawah</option>
                </select>
              </div>
            </div>

            <!-- Upload Signature & Stamp Image -->
            <div class="p-3 bg-light border rounded-3 mb-3">
              <label class="form-label fw-bold text-dark small">Gambar Tanda Tangan / Stempel Digital (Opsional)</label>
              <div class="d-flex align-items-center gap-2 mb-2">
                <input type="file" ref="signInput" accept="image/*" class="d-none" @change="onSignSelected" />
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="$refs.signInput.click()">
                  <i class="bi bi-pen me-1"></i> Upload TTD (PNG Transparan)
                </button>
                <button v-if="letter.signatureImage" type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2" @click="letter.signatureImage = ''" title="Hapus TTD">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <span v-if="letter.signatureImage" class="badge bg-success-subtle text-success small mb-2 d-inline-block">Gambar TTD Terpasang</span>
            </div>

            <!-- Tembusan / CC Section -->
            <div class="mb-2">
              <label class="form-label fw-bold text-dark small">Tembusan Surat (Opsional - Pisahkan dengan Enter)</label>
              <textarea class="form-control form-control-sm" rows="2" v-model="letter.ccText" placeholder="1. Direktur Keuangan&#10;2. Arsip Bagian Umum"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Live Printable Preview -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
          <!-- Preview Header Bar (no-print) -->
          <div class="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-2.5 mb-2.5 no-print gap-2">
            <div class="d-flex align-items-center flex-wrap gap-2">
              <span class="fw-bold text-dark"><i class="bi bi-file-earmark-richtext text-primary me-1"></i> Live Document Preview</span>
              <span class="badge bg-light text-dark border small">{{ activeTemplateTitle }}</span>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle small fw-bold">{{ currentPaperInfo.name }}</span>
              <span v-if="suratMode === 'bulk'" class="badge bg-success text-white small">
                Penerima #{{ activeBulkIndex + 1 }} dari {{ bulkRecipients.length }}
              </span>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <!-- Bulk Recipient Selector Controls -->
              <div v-if="suratMode === 'bulk' && bulkRecipients.length > 1" class="btn-group btn-group-sm me-1">
                <button class="btn btn-outline-secondary" :disabled="activeBulkIndex <= 0" @click="activeBulkIndex--">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="btn btn-light border px-2 fw-semibold" style="font-size: 12px;">
                  {{ activeBulkRecipient ? (activeBulkRecipient.name || 'Penerima ' + (activeBulkIndex + 1)) : '-' }}
                </button>
                <button class="btn btn-outline-secondary" :disabled="activeBulkIndex >= bulkRecipients.length - 1" @click="activeBulkIndex++">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>

              <button v-if="suratMode === 'single'" class="btn btn-sm btn-success rounded-pill px-3 fw-bold" @click="openWaModal">
                <i class="bi bi-whatsapp me-1"></i> Kirim WA
              </button>
              <button class="btn btn-sm btn-primary rounded-pill px-3.5 fw-bold shadow-sm d-flex align-items-center gap-1.5" :disabled="isPdfLoading" @click="printCurrentMode">
                <span v-if="isPdfLoading" class="spinner-border spinner-border-sm text-white" role="status"></span>
                <i v-else class="bi bi-printer"></i>
                <span>{{ isPdfLoading ? 'Menyiapkan...' : (suratMode === 'bulk' ? 'Buka Semua (' + bulkRecipients.length + ' Surat ' + currentPaperInfo.name + ')' : 'Cetak / Buka PDF ' + currentPaperInfo.name) }}</span>
              </button>
            </div>
          </div>

          <!-- Quick Controls Bar (no-print) -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 bg-light border rounded-3 mb-2.5 no-print">
            <div class="d-flex flex-wrap align-items-center gap-2">
              <div class="d-flex align-items-center gap-1">
                <label class="small text-muted fw-bold mb-0">Ukuran:</label>
                <select class="form-select form-select-sm border-primary fw-semibold text-primary py-0.5" v-model="letter.paperSize" style="width: auto; font-size: 12px;">
                  <option v-for="p in paperSizesList" :key="p.id" :value="p.id">{{ p.name }} ({{ p.widthMm }}×{{ p.heightMm }} mm)</option>
                </select>
              </div>
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn" :class="letter.paperOrientation !== 'landscape' ? 'btn-primary text-white fw-semibold' : 'btn-outline-secondary bg-white'" @click="letter.paperOrientation = 'portrait'" title="Tegak (Portrait)">
                  <i class="bi bi-file-earmark me-1"></i> Tegak
                </button>
                <button type="button" class="btn" :class="letter.paperOrientation === 'landscape' ? 'btn-primary text-white fw-semibold' : 'btn-outline-secondary bg-white'" @click="letter.paperOrientation = 'landscape'" title="Mendatar (Landscape)">
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i> Mendatar
                </button>
              </div>
              <button type="button" class="btn btn-sm" :class="showMarginGuides ? 'btn-info text-white fw-semibold' : 'btn-outline-secondary bg-white'" @click="showMarginGuides = !showMarginGuides" title="Batas Margin Garis Putus-Putus">
                <i class="bi bi-bounding-box-circles me-1"></i> {{ showMarginGuides ? 'Garis Margin: ON' : 'Garis Margin' }}
              </button>
            </div>
            <div class="d-flex align-items-center gap-1.5">
              <label class="small text-muted fw-bold mb-0">Zoom:</label>
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-secondary bg-white px-2" :disabled="previewZoom <= 50" @click="previewZoom = Math.max(50, previewZoom - 10)" title="Perkecil Zoom">-</button>
                <button type="button" class="btn btn-light border px-2 fw-semibold" style="min-width: 48px; font-size: 11.5px;" @click="previewZoom = 100" title="Reset 100%">{{ previewZoom }}%</button>
                <button type="button" class="btn btn-outline-secondary bg-white px-2" :disabled="previewZoom >= 150" @click="previewZoom = Math.min(150, previewZoom + 10)" title="Perbesar Zoom">+</button>
              </div>
            </div>
          </div>

          <!-- Document Info Strip (no-print) -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-1.5 rounded-2 bg-white border mb-3 text-muted no-print" style="font-size: 11.5px;">
            <div>
              <i class="bi bi-aspect-ratio text-primary me-1"></i> <strong>Kertas:</strong> {{ currentPaperInfo.name }} ({{ currentPaperInfo.widthMm }} × {{ currentPaperInfo.heightMm }} mm) • {{ letter.paperOrientation === 'landscape' ? 'Mendatar (Landscape)' : 'Tegak (Portrait)' }}
            </div>
            <div>
              <i class="bi bi-arrows-collapse text-secondary me-1"></i> <strong>Jarak Margin:</strong> Atas {{ letter.marginTop || 20 }}mm • Bawah {{ letter.marginBottom || 20 }}mm • Kiri {{ letter.marginLeft || 25 }}mm • Kanan {{ letter.marginRight || 20 }}mm
            </div>
          </div>

          <!-- Document Desk Workbench (Visual A4 Canvas) -->
          <div class="preview-desk-workbench rounded-3 p-3 p-md-4 overflow-auto">
            <div class="d-inline-block text-start" :style="previewTransformStyle">
              <!-- ======================================================== -->
              <!-- 1. SINGLE MODE PRINTABLE LETTER PAPER                    -->
              <!-- ======================================================== -->
              <div v-if="suratMode === 'single'" id="letterPrintArea" class="letter-paper bg-white text-dark mx-auto" :style="letterPaperInlineStyles">
                <!-- Margin Guide Overlay (Visual Margin Boundary) -->
                <div
                  v-if="showMarginGuides"
                  class="margin-guide-overlay no-print"
                  :style="{
                    top: (letter.marginTop || 20) + 'mm',
                    bottom: (letter.marginBottom || 20) + 'mm',
                    left: (letter.marginLeft || 25) + 'mm',
                    right: (letter.marginRight || 20) + 'mm'
                  }"
                >
                  <span class="margin-guide-tag">📐 Batas Margin: Atas {{ letter.marginTop || 20 }}mm | Kiri {{ letter.marginLeft || 25 }}mm | Kanan {{ letter.marginRight || 20 }}mm | Bawah {{ letter.marginBottom || 20 }}mm</span>
                </div>
            <!-- KOP SURAT HEADER -->
            <div v-if="letter.showKop" class="kop-header-container mb-4" :class="'kop-align-' + (letter.kopLogoPosition || 'left')">
              <div class="d-flex align-items-center justify-content-between gap-3 mb-2" :class="{ 'flex-column text-center': letter.kopLogoPosition === 'center', 'flex-row-reverse': letter.kopLogoPosition === 'right' }">
                <div v-if="currentLogoSrc" class="kop-logo-wrapper flex-shrink-0">
                  <img :src="currentLogoSrc" :style="{ height: (letter.kopLogoHeight || 60) + 'px', maxWidth: '140px', objectFit: 'contain' }" alt="Logo Kop" />
                </div>
                <div class="kop-text-wrapper flex-grow-1 text-center">
                  <h3 class="fw-extrabold mb-0 tracking-wide text-uppercase" style="letter-spacing: 1px; font-size: 1.25rem;">
                    {{ letter.kopName || 'PT RAJINKERJA GLOBAL INDONESIA' }}
                  </h3>
                  <div v-if="letter.kopSubname" class="fw-bold text-secondary small text-uppercase mb-0.5" style="letter-spacing: 0.5px;">
                    {{ letter.kopSubname }}
                  </div>
                  <p class="small text-muted mb-0 lh-sm" style="font-size: 0.78rem;">
                    {{ letter.kopAddress || 'Jl. Jend. Sudirman No. 88, Jakarta Selatan | Telp: (021) 555-1234' }}
                  </p>
                  <p v-if="letter.kopContact" class="small text-muted mb-0 lh-sm" style="font-size: 0.78rem;">
                    {{ letter.kopContact }}
                  </p>
                </div>
                <div v-if="currentLogoSrc && letter.kopLogoPosition === 'left'" style="width: 60px;" class="d-none d-md-block"></div>
              </div>

              <!-- Kop Divider Lines -->
              <div v-if="letter.kopStyle === 'double'" class="kop-divider-double"></div>
              <div v-else-if="letter.kopStyle === 'thick'" class="kop-divider-thick"></div>
              <div v-else-if="letter.kopStyle === 'single'" class="kop-divider-single"></div>
            </div>

            <!-- Letter Metadata (Tanggal & Nomor) -->
            <div class="d-flex justify-content-between align-items-baseline mb-4">
              <div>
                <div><strong>Nomor:</strong> {{ letter.number || '001/SK/RK/VIII/2026' }}</div>
                <div v-if="letter.attachment"><strong>Lampiran:</strong> {{ letter.attachment }}</div>
                <div><strong>Perihal:</strong> {{ letter.subject || 'Surat Penawaran Kerjasama' }}</div>
              </div>
              <div class="text-end">
                <div>{{ letter.city || 'Jakarta' }}, {{ formattedDate }}</div>
              </div>
            </div>

            <!-- Recipient Block -->
            <div class="mb-4">
              <div>Kepada Yth.</div>
              <strong>{{ letter.recipientName || 'Bapak / Ibu Pimpinan' }}</strong>
              <div v-if="letter.recipientTitle">{{ letter.recipientTitle }}</div>
              <div>{{ letter.recipientAddress || 'Di Tempat' }}</div>
            </div>

            <!-- Salutation & Body -->
            <div class="mb-4">
              <p class="mb-3">{{ letter.salutation || 'Dengan hormat,' }}</p>
              <div v-if="bodyParagraphs.length > 0" class="d-flex flex-column gap-2">
                <div
                  v-for="(para, idx) in bodyParagraphs"
                  :key="idx"
                  class="lh-base text-dark"
                  :style="{
                    textAlign: 'justify',
                    textIndent: isListParagraph(para) ? '0' : '2rem',
                    whiteSpace: 'pre-line',
                    marginBottom: '0.75rem'
                  }"
                >
                  {{ para }}
                </div>
              </div>
              <div v-else class="lh-base text-muted fst-italic">
                (Isi surat masih kosong...)
              </div>
            </div>

            <!-- Closing & Signatures -->
            <div class="d-flex mt-5 pt-3 no-break" :class="{ 'justify-content-end': letter.signaturePosition === 'right', 'justify-content-start': letter.signaturePosition === 'left', 'justify-content-center': letter.signaturePosition === 'center' }">
              <div class="text-center" style="min-width: 220px;">
                <p class="mb-2">{{ letter.closing || 'Hormat Kami,' }}</p>
                <div v-if="letter.signatureImage" class="my-1">
                  <img :src="letter.signatureImage" style="max-height: 65px; object-fit: contain;" alt="Tanda Tangan" />
                </div>
                <div v-else style="height: 60px;"></div>
                <strong class="d-block border-bottom border-dark pb-1 text-uppercase">{{ letter.signerName || 'Arif Permana, S.Kom' }}</strong>
                <span class="small text-muted d-block mt-1">{{ letter.signerTitle || 'Direktur Utama' }}</span>
                <span v-if="letter.signerNip" class="small text-muted d-block" style="font-size: 11px;">{{ letter.signerNip }}</span>
              </div>
            </div>

            <!-- Tembusan / CC (Optional) -->
            <div v-if="letter.ccText && letter.ccText.trim()" class="mt-4 pt-3 border-top small text-muted no-break">
              <strong>Tembusan:</strong>
              <div class="white-space-pre-line">{{ letter.ccText }}</div>
            </div>
          </div>

              <!-- ======================================================== -->
              <!-- 2. BULK MODE PRINTABLE AREA (Multi-Letter Pages)          -->
              <!-- ======================================================== -->
              <div v-else id="letterBulkPrintArea" class="bulk-print-container">
                <!-- In Web UI: Shows active recipient or all -->
                <div
                  v-for="(rec, recIdx) in (isPrintingAll ? bulkRecipients : [activeBulkRecipient || bulkRecipients[0]])"
                  :key="rec ? rec.id : recIdx"
                  class="letter-paper bg-white text-dark mx-auto mb-4 print-page-break"
                  :style="letterPaperInlineStyles"
                >
                  <!-- Margin Guide Overlay (Visual Margin Boundary) -->
                  <div
                    v-if="showMarginGuides"
                    class="margin-guide-overlay no-print"
                    :style="{
                      top: (letter.marginTop || 20) + 'mm',
                      bottom: (letter.marginBottom || 20) + 'mm',
                      left: (letter.marginLeft || 25) + 'mm',
                      right: (letter.marginRight || 20) + 'mm'
                    }"
                  >
                    <span class="margin-guide-tag">📐 Batas Margin: Atas {{ letter.marginTop || 20 }}mm | Kiri {{ letter.marginLeft || 25 }}mm | Kanan {{ letter.marginRight || 20 }}mm | Bawah {{ letter.marginBottom || 20 }}mm</span>
                  </div>
              <!-- KOP SURAT HEADER -->
              <div v-if="letter.showKop" class="kop-header-container mb-4" :class="'kop-align-' + (letter.kopLogoPosition || 'left')">
                <div class="d-flex align-items-center justify-content-between gap-3 mb-2" :class="{ 'flex-column text-center': letter.kopLogoPosition === 'center', 'flex-row-reverse': letter.kopLogoPosition === 'right' }">
                  <div v-if="currentLogoSrc" class="kop-logo-wrapper flex-shrink-0">
                    <img :src="currentLogoSrc" :style="{ height: (letter.kopLogoHeight || 60) + 'px', maxWidth: '140px', objectFit: 'contain' }" alt="Logo Kop" />
                  </div>
                  <div class="kop-text-wrapper flex-grow-1 text-center">
                    <h3 class="fw-extrabold mb-0 tracking-wide text-uppercase" style="letter-spacing: 1px; font-size: 1.25rem;">
                      {{ letter.kopName || 'PT RAJINKERJA GLOBAL INDONESIA' }}
                    </h3>
                    <div v-if="letter.kopSubname" class="fw-bold text-secondary small text-uppercase mb-0.5" style="letter-spacing: 0.5px;">
                      {{ letter.kopSubname }}
                    </div>
                    <p class="small text-muted mb-0 lh-sm" style="font-size: 0.78rem;">
                      {{ letter.kopAddress || 'Jl. Jend. Sudirman No. 88, Jakarta Selatan | Telp: (021) 555-1234' }}
                    </p>
                    <p v-if="letter.kopContact" class="small text-muted mb-0 lh-sm" style="font-size: 0.78rem;">
                      {{ letter.kopContact }}
                    </p>
                  </div>
                  <div v-if="currentLogoSrc && letter.kopLogoPosition === 'left'" style="width: 60px;" class="d-none d-md-block"></div>
                </div>

                <!-- Kop Divider Lines -->
                <div v-if="letter.kopStyle === 'double'" class="kop-divider-double"></div>
                <div v-else-if="letter.kopStyle === 'thick'" class="kop-divider-thick"></div>
                <div v-else-if="letter.kopStyle === 'single'" class="kop-divider-single"></div>
              </div>

              <!-- Letter Metadata (Tanggal & Nomor) -->
              <div class="d-flex justify-content-between align-items-baseline mb-4">
                <div>
                  <div><strong>Nomor:</strong> {{ (rec && rec.number) ? rec.number : (letter.number || '001/SK/RK/VIII/2026') }}</div>
                  <div v-if="letter.attachment"><strong>Lampiran:</strong> {{ letter.attachment }}</div>
                  <div><strong>Perihal:</strong> {{ letter.subject || 'Surat Penawaran Kerjasama' }}</div>
                </div>
                <div class="text-end">
                  <div>{{ letter.city || 'Jakarta' }}, {{ formattedDate }}</div>
                </div>
              </div>

              <!-- Recipient Block -->
              <div class="mb-4">
                <div>Kepada Yth.</div>
                <strong>{{ (rec && rec.name) ? rec.name : 'Bapak / Ibu Pimpinan' }}</strong>
                <div v-if="rec && rec.title">{{ rec.title }}</div>
                <div>{{ (rec && rec.company) ? rec.company : 'Di Tempat' }}</div>
              </div>

              <!-- Salutation & Body with Dynamic Variable Replacements -->
              <div class="mb-4">
                <p class="mb-3">{{ renderDynamicText(letter.salutation, rec) || 'Dengan hormat,' }}</p>
                <div v-if="getRenderedBodyParagraphs(rec).length > 0" class="d-flex flex-column gap-2">
                  <div
                    v-for="(para, pIdx) in getRenderedBodyParagraphs(rec)"
                    :key="pIdx"
                    class="lh-base text-dark"
                    :style="{
                      textAlign: 'justify',
                      textIndent: isListParagraph(para) ? '0' : '2rem',
                      whiteSpace: 'pre-line',
                      marginBottom: '0.75rem'
                    }"
                  >
                    {{ para }}
                  </div>
                </div>
                <div v-else class="lh-base text-muted fst-italic">
                  (Isi surat masih kosong...)
                </div>
              </div>

              <!-- Closing & Signatures -->
              <div class="d-flex mt-5 pt-3 no-break" :class="{ 'justify-content-end': letter.signaturePosition === 'right', 'justify-content-start': letter.signaturePosition === 'left', 'justify-content-center': letter.signaturePosition === 'center' }">
                <div class="text-center" style="min-width: 220px;">
                  <p class="mb-2">{{ letter.closing || 'Hormat Kami,' }}</p>
                  <div v-if="letter.signatureImage" class="my-1">
                    <img :src="letter.signatureImage" style="max-height: 65px; object-fit: contain;" alt="Tanda Tangan" />
                  </div>
                  <div v-else style="height: 60px;"></div>
                  <strong class="d-block border-bottom border-dark pb-1 text-uppercase">{{ letter.signerName || 'Arif Permana, S.Kom' }}</strong>
                  <span class="small text-muted d-block mt-1">{{ letter.signerTitle || 'Direktur Utama' }}</span>
                  <span v-if="letter.signerNip" class="small text-muted d-block" style="font-size: 11px;">{{ letter.signerNip }}</span>
                </div>
              </div>

              <!-- Tembusan / CC (Optional) -->
              <div v-if="letter.ccText && letter.ccText.trim()" class="mt-4 pt-3 border-top small text-muted no-break">
                <strong>Tembusan:</strong>
                <div class="white-space-pre-line">{{ renderDynamicText(letter.ccText, rec) }}</div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 1: BULK CSV / TEXT IMPORTER (no-print)             -->
    <!-- ======================================================== -->
    <div v-if="showBulkImportModal" class="card border-0 shadow-lg rounded-4 p-4 my-4 bg-white border-top border-primary border-4 no-print">
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h5 class="fw-bold mb-0 text-dark">
          <i class="bi bi-clipboard-plus text-primary me-2"></i> Paste Banyak Penerima Sekaligus (Bulk CSV Importer)
        </h5>
        <button type="button" class="btn-close" @click="showBulkImportModal = false"></button>
      </div>

      <div class="alert alert-info py-2 px-3 small mb-3">
        <div class="fw-bold mb-1"><i class="bi bi-info-circle-fill me-1"></i> Format Baris (Pisahkan dengan koma atau tab):</div>
        <code>Nama Penerima, Jabatan, Instansi/Alamat, Nomor WhatsApp, Nomor Surat (Opsional)</code>
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold text-dark small">Tempel Data Teks di Bawah:</label>
        <textarea
          class="form-control font-monospace border-2 rounded-3 small"
          rows="6"
          v-model="bulkImportRawText"
          placeholder="Budi Santoso, Direktur Keuangan, PT Reksa Finance, 081234567890, 001/SK/RK/VIII/2026&#10;Rian Prasetyo, Project Lead, Studio Digital, 081398765432, 002/SK/RK/VIII/2026&#10;Dinda Kirana, Head of Design, Kreatif Nusantara, 085712345678, 003/SK/RK/VIII/2026"
        ></textarea>
      </div>

      <div class="d-flex justify-content-between align-items-center border-top pt-3">
        <button type="button" class="btn btn-outline-secondary rounded-pill px-3" @click="showBulkImportModal = false">Batal</button>
        <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" @click="processBulkImport">
          <i class="bi bi-check2-circle me-1"></i> Tambahkan ke Daftar Penerima
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: BULK WHATSAPP BROADCAST (no-print)              -->
    <!-- ======================================================== -->
    <div v-if="showBulkBroadcastModal" class="card border-0 shadow-lg rounded-4 p-4 my-4 bg-white border-top border-success border-4 no-print">
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h5 class="fw-bold mb-0 text-dark">
          <i class="bi bi-whatsapp text-success me-2"></i> Broadcast WhatsApp Massal ({{ bulkRecipients.length }} Penerima)
        </h5>
        <button type="button" class="btn-close" @click="showBulkBroadcastModal = false"></button>
      </div>

      <p class="small text-muted mb-3">
        Kirimkan naskah surat resmi ini secara langsung ke nomor WhatsApp masing-masing penerima dengan variabel nama yang disesuaikan secara otomatis:
      </p>

      <div class="table-responsive mb-3" style="max-height: 350px; overflow-y: auto;">
        <table class="table table-hover table-bordered align-middle small mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 40px;" class="text-center">No</th>
              <th>Nama Penerima</th>
              <th>Instansi / Jabatan</th>
              <th>Nomor WhatsApp</th>
              <th style="width: 140px;" class="text-center">Kirim Surat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rec, idx) in bulkRecipients" :key="rec.id">
              <td class="text-center fw-bold text-muted">{{ idx + 1 }}</td>
              <td class="fw-semibold text-dark">{{ rec.name || 'Penerima ' + (idx + 1) }}</td>
              <td>{{ rec.company || rec.title || '-' }}</td>
              <td>
                <span v-if="rec.phone" class="badge bg-light text-dark border">{{ rec.phone }}</span>
                <span v-else class="text-danger small fst-italic">Belum ada no HP</span>
              </td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-xs btn-success rounded-pill px-3 fw-bold"
                  :disabled="!rec.phone"
                  @click="sendWaToRecipient(rec)"
                >
                  <i class="bi bi-whatsapp me-1"></i> Kirim WA
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-end border-top pt-3">
        <button type="button" class="btn btn-light rounded-pill px-4" @click="showBulkBroadcastModal = false">Tutup</button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 3: SINGLE WHATSAPP SENDER (no-print)               -->
    <!-- ======================================================== -->
    <div v-if="showWaModal" class="card border-0 shadow-lg rounded-4 p-4 my-4 bg-white border-top border-success border-4 no-print">
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h5 class="fw-bold mb-0 text-dark">
          <i class="bi bi-whatsapp text-success me-2"></i> Kirim Surat via WhatsApp
        </h5>
        <button type="button" class="btn-close" @click="closeWaModal"></button>
      </div>

      <div class="p-2">
        <div class="mb-3">
          <label class="form-label fw-bold text-dark small">Pilih Sumber Nomor Tujuan WhatsApp</label>
          <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" name="waMode" id="waModeContact" value="contact" v-model="waRecipientMode" />
            <label class="btn btn-outline-success fw-semibold" for="waModeContact">
              <i class="bi bi-person-lines-fill me-1"></i> Pilih dari Kontak Tim & WA
            </label>

            <input type="radio" class="btn-check" name="waMode" id="waModeManual" value="manual" v-model="waRecipientMode" />
            <label class="btn btn-outline-success fw-semibold" for="waModeManual">
              <i class="bi bi-pencil-square me-1"></i> Input Nomor Manual
            </label>
          </div>
        </div>

        <div v-if="waRecipientMode === 'contact'" class="mb-3 bg-light p-3 rounded-3 border">
          <label class="form-label fw-bold text-dark small">Daftar Kontak Tim / Client</label>
          <div v-if="contactsList.length > 0">
            <select class="form-select form-select-sm border-2" v-model="selectedContactId" @change="onSelectContact">
              <option value="">-- Pilih Anggota Tim / Client --</option>
              <option v-for="c in contactsList" :key="c.id" :value="c.id">
                {{ c.name }} - {{ c.company || 'Umum' }} ({{ c.phone || 'Tanpa no hp' }})
              </option>
            </select>
          </div>
          <div v-else class="text-muted small">
            Belum ada kontak tersimpan. Silakan pilih opsi input manual atau tambah kontak di menu Kontak Tim.
          </div>
        </div>

        <div v-else class="mb-3 bg-light p-3 rounded-3 border">
          <label class="form-label fw-bold text-dark small">Nomor Telepon / WhatsApp Tujuan</label>
          <input
            type="text"
            class="form-control form-control-sm border-2"
            v-model="manualPhone"
            placeholder="Contoh: 081234567890 / 6281234567890"
          />
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label fw-bold text-dark small mb-0">Preview Pesan Teks Surat</label>
            <button type="button" class="btn btn-xs btn-link text-decoration-none text-success" @click="resetWaMessage">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Teks
            </button>
          </div>
          <textarea class="form-control font-monospace border-2 rounded-3 small" rows="8" v-model="waCustomMessage"></textarea>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-2">
        <button type="button" class="btn btn-outline-secondary rounded-pill px-3" @click="copyWaMessage">
          <i class="bi bi-clipboard me-1"></i> Salin Teks
        </button>
        <div>
          <button type="button" class="btn btn-light rounded-pill px-3 me-2" @click="closeWaModal">Batal</button>
          <button type="button" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm" @click="sendWhatsApp">
            <i class="bi bi-whatsapp me-1"></i> Kirim via WhatsApp
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 3: CEK DRAFT & RIWAYAT LAPORAN / SURAT (no-print)  -->
    <!-- ======================================================== -->
    <div v-if="showDraftsModal" class="card border-0 shadow-lg rounded-4 p-4 my-4 bg-white border-top border-primary border-4 no-print">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-3 gap-2">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-primary text-white rounded-pill px-2.5 py-1">
              <i class="bi bi-folder2-open me-1"></i> Drafts & Reports
            </span>
            <span class="badge bg-light text-dark border rounded-pill">{{ draftsList.length }} Laporan / Surat Tersimpan</span>
          </div>
          <h4 class="fw-bold mb-0 text-dark">
            📂 Cek Draft & Riwayat Laporan yang Sudah Dikerjakan
          </h4>
          <p class="text-muted small mb-0">Lihat semua arsip surat & laporan yang pernah dikerjakan, lanjutkan edit, atau cetak cepat ke format PDF A4.</p>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold" @click="createNewDraft">
            <i class="bi bi-plus-lg me-1"></i> Mulai Surat Baru
          </button>
          <button type="button" class="btn-close" @click="showDraftsModal = false"></button>
        </div>
      </div>

      <!-- Search & Filter Category -->
      <div class="row g-3 mb-3 align-items-center">
        <div class="col-md-7">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
            <input
              type="text"
              class="form-control border-start-0"
              v-model="draftSearchQuery"
              placeholder="Cari berdasarkan judul, perihal, nomor surat, atau nama penerima..."
            />
            <button v-if="draftSearchQuery" class="btn btn-outline-secondary" type="button" @click="draftSearchQuery = ''">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        <div class="col-md-5 d-flex gap-1 justify-content-md-end flex-wrap">
          <button
            type="button"
            class="btn btn-sm rounded-pill px-3"
            :class="draftFilter === 'all' ? 'btn-primary fw-bold' : 'btn-light border text-muted'"
            @click="draftFilter = 'all'"
          >
            Semua ({{ draftsList.length }})
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-pill px-3"
            :class="draftFilter === 'single' ? 'btn-primary fw-bold' : 'btn-light border text-muted'"
            @click="draftFilter = 'single'"
          >
            Tunggal ({{ singleDraftsCount }})
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-pill px-3"
            :class="draftFilter === 'bulk' ? 'btn-primary fw-bold' : 'btn-light border text-muted'"
            @click="draftFilter = 'bulk'"
          >
            Massal / Bulk ({{ bulkDraftsCount }})
          </button>
        </div>
      </div>

      <!-- Drafts List Cards -->
      <div v-if="filteredDrafts.length > 0" class="d-flex flex-column gap-2.5" style="max-height: 480px; overflow-y: auto;">
        <div
          v-for="draft in filteredDrafts"
          :key="draft.id"
          class="p-3 rounded-3 border transition-all"
          :class="currentDraftId === draft.id ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-light hover-bg-white border-light-subtle'"
        >
          <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2">
            <div class="flex-grow-1">
              <div class="d-flex flex-wrap align-items-center gap-1.5 mb-1.5">
                <span v-if="currentDraftId === draft.id" class="badge bg-primary text-white rounded-pill small">
                  <i class="bi bi-pencil-fill me-1"></i>Sedang Dibuka di Editor
                </span>
                <span class="badge" :class="draft.mode === 'bulk' ? 'bg-success text-white' : 'bg-secondary text-white'">
                  <i :class="draft.mode === 'bulk' ? 'bi bi-people-fill' : 'bi bi-file-earmark-text'" class="me-1"></i>
                  {{ draft.mode === 'bulk' ? 'Mode Massal' : 'Mode Tunggal' }}
                </span>
                <span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill">
                  <i class="bi bi-clock-history me-1"></i>{{ formatDateTime(draft.updatedAt || draft.createdAt) }}
                </span>
                <span v-if="draft.data && (draft.data.kopLogo || (draft.data.kopLogoPreset && draft.data.kopLogoPreset !== 'none'))" class="badge bg-light text-muted border">
                  <i class="bi bi-image me-1"></i>Dengan Logo
                </span>
                <span v-else class="badge bg-light text-muted border">
                  <i class="bi bi-slash-circle me-1"></i>Tanpa Logo
                </span>
                <span class="badge bg-success-subtle text-success border border-success-subtle">
                  {{ draft.status || 'Selesai Dikerjakan' }}
                </span>
              </div>

              <h6 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                {{ draft.title || (draft.data && draft.data.subject) || 'Surat Tanpa Judul' }}
              </h6>

              <div class="small text-muted d-flex flex-wrap gap-x-3 gap-y-1">
                <div><i class="bi bi-hash text-primary me-1"></i>No: <strong>{{ (draft.data && draft.data.number) || draft.number || '-' }}</strong></div>
                <div><i class="bi bi-calendar3 text-primary me-1"></i>Tanggal: <strong>{{ (draft.data && draft.data.date) || draft.date || '-' }}</strong></div>
                <div><i class="bi bi-person text-primary me-1"></i>Penerima: <strong>{{ (draft.data && draft.data.recipientName) || draft.recipient || '-' }}</strong></div>
                <div v-if="draft.mode === 'bulk' && draft.bulkRecipients"><i class="bi bi-people text-success me-1"></i>Total: <strong>{{ draft.bulkRecipients.length }} Penerima</strong></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap align-items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                class="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-xs"
                @click="loadDraftToEditor(draft)"
                title="Muat draft ke editor untuk diedit kembali"
              >
                <i class="bi bi-pencil-square me-1"></i> Buka di Editor
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary rounded-pill px-2.5"
                @click="printDraftDirect(draft)"
                title="Buka pratinjau cetak PDF A4 langsung"
              >
                <i class="bi bi-printer me-1"></i> Cetak A4
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary rounded-pill px-2.5"
                @click="duplicateDraft(draft)"
                title="Salin / Duplikasi draft ini"
              >
                <i class="bi bi-files"></i> Duplikat
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger rounded-pill px-2.5"
                @click="deleteDraft(draft.id)"
                title="Hapus draft dari arsip"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 bg-light rounded-4 border">
        <div class="display-6 text-muted mb-2">📂</div>
        <h6 class="fw-bold text-dark mb-1">Tidak ada draft yang cocok</h6>
        <p class="text-muted small mb-3">Belum ada laporan atau surat yang tersimpan dengan kata kunci pencarian tersebut.</p>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" @click="createNewDraft">
          <i class="bi bi-plus-lg me-1"></i> Buat Surat Baru Sekarang
        </button>
      </div>

      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border-top pt-3 mt-3 gap-2">
        <span class="small text-muted">
          Draft tersimpan otomatis di penyimpanan lokal browser Anda secara aman dan privat.
        </span>
        <button type="button" class="btn btn-light rounded-pill px-3" @click="showDraftsModal = false">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue';
import Swal from 'sweetalert2';
import { useStore } from 'vuex';
import { sendOnDeviceNotification } from '../utils/notification';
import { openPrintableDocumentInNewTab, PAPER_SIZES } from '../utils/pdfTabOpener';

export default {
  name: 'SuratBuilderView',
  setup() {
    const store = useStore();

    const suratMode = ref('single'); // 'single' | 'bulk'
    const isPrintingAll = ref(false);
    const formTab = ref('kop');
    const selectedTemplateId = ref('lamaran');
    const activeTemplateCat = ref('all');

    // Bulk Mail Merge State
    const activeBulkIndex = ref(0);
    const showBulkImportModal = ref(false);
    const showBulkBroadcastModal = ref(false);
    const bulkImportRawText = ref('');

    const bulkRecipients = ref([
      {
        id: 'rec_1',
        name: 'Budi Santoso, S.E.',
        title: 'Direktur Keuangan',
        company: 'PT Reksa Finance Indonesia',
        phone: '081234567890',
        number: '001/SK/RK/VIII/2026',
        notes: ''
      },
      {
        id: 'rec_2',
        name: 'Rian Prasetyo, S.Kom',
        title: 'Lead Project Manager',
        company: 'Studio Kreatif Nusantara',
        phone: '081398765432',
        number: '002/SK/RK/VIII/2026',
        notes: ''
      },
      {
        id: 'rec_3',
        name: 'Dinda Kirana, M.Ds.',
        title: 'Head of Product Design',
        company: 'PT Cipta Visual Kreasi',
        phone: '085712345678',
        number: '003/SK/RK/VIII/2026',
        notes: ''
      }
    ]);

    const activeBulkRecipient = computed(() => {
      if (!bulkRecipients.value.length) return null;
      if (activeBulkIndex.value >= bulkRecipients.value.length) {
        return bulkRecipients.value[0];
      }
      return bulkRecipients.value[activeBulkIndex.value];
    });

    const templateCategories = [
      { id: 'all', name: 'Semua (12)' },
      { id: 'karir', name: 'Karier & HRD' },
      { id: 'bisnis', name: 'Bisnis & Kontrak' },
      { id: 'dinas', name: 'Kedinasan & Resmi' }
    ];

    const logoPresets = [
      { id: 'none', name: '🚫 Tanpa Logo (Kop Polos)', url: '' },
      { id: 'logo_app', name: 'Logo TaskArts', url: '/logo.svg' },
      { id: 'logo_garuda', name: 'Lambang Garuda RI', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Coat_of_arms_of_Indonesia_Garuda_Pancasila.svg/200px-Coat_of_arms_of_Indonesia_Garuda_Pancasila.svg.png' },
      { id: 'logo_corp', name: 'Gedung Korporat', url: 'https://cdn-icons-png.flaticon.com/512/2942/2942821.png' },
      { id: 'logo_tech', name: 'Startup Tech Node', url: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png' },
      { id: 'logo_edu', name: 'Institusi Pendidikan', url: 'https://cdn-icons-png.flaticon.com/512/2997/2997295.png' }
    ];

    // 12 Comprehensive Letter Templates
    const letterTemplates = [
      {
        id: 'lamaran',
        title: 'Surat Lamaran Kerja',
        category: 'karir',
        categoryLabel: 'Karier',
        icon: 'bi-briefcase-fill',
        desc: 'Standar lamaran kerja profesional',
        subject: 'Lamaran Pekerjaan - Senior Frontend Developer',
        recipientName: 'Bapak / Ibu Pimpinan HRD',
        recipientTitle: 'Head of Talent Acquisition',
        recipientAddress: 'PT Teknologi Digital Nusantara\nJakarta Selatan',
        bodyContent: 'Berdasarkan informasi lowongan pekerjaan yang saya peroleh, melalui surat ini saya bermaksud mengajukan diri untuk bergabung dengan PT Teknologi Digital Nusantara sebagai Senior Frontend Developer.\n\nSaya memiliki pengalaman profesional lebih dari 4 tahun dalam merancang dan mengembangkan aplikasi berbasis web modern menggunakan Vue.js, TypeScript, dan Progressive Web Apps (PWA). Selama berkarir, saya terbiasa berkolaborasi dalam tim agile, memimpin arsitektur antarmuka pengguna, serta mengoptimalkan performa web hingga 40%.\n\nBesar harapan saya untuk diberikan kesempatan wawancara agar dapat menjelaskan lebih mendalam mengenai kualifikasi dan kontribusi yang dapat saya berikan bagi kemajuan perusahaan Bapak/Ibu.'
      },
      {
        id: 'resign',
        title: 'Surat Pengunduran Diri (Resign)',
        category: 'karir',
        categoryLabel: 'Karier',
        icon: 'bi-box-arrow-right',
        desc: 'Pengunduran diri 1-month notice',
        subject: 'Surat Permohonan Pengunduran Diri Kerja',
        recipientName: 'Bapak / Ibu Pimpinan Manajemen',
        recipientTitle: 'Human Resources Division',
        recipientAddress: 'PT TaskArts Global Indonesia\nDi Tempat',
        bodyContent: 'Melalui surat ini, saya menyampaikan permohonan pengunduran diri saya dari posisi Senior Software Engineer di PT TaskArts Global Indonesia terhitung efektif per tanggal 30 September 2026.\n\nSaya mengucapkan terima kasih yang sebesar-besarnya atas kesempatan berharga, pengalaman kerja, serta bimbingan yang telah diberikan selama masa kerja saya. Saya memohon maaf apabila terdapat tutur kata atau perbuatan yang kurang berkenan selama saya bertugas.\n\nSebelum tanggal efektif pengunduran diri, saya berkomitmen untuk menyelesaikan seluruh tanggung jawab yang ada serta melakukan serah terima pekerjaan (handover) kepada rekan tim dengan sebaik-baiknya.'
      },
      {
        id: 'pakelaring',
        title: 'Surat Keterangan Kerja (Pakelaring)',
        category: 'karir',
        categoryLabel: 'HRD',
        icon: 'bi-file-earmark-person-fill',
        desc: 'Surat referensi masa bakti kerja',
        subject: 'Surat Keterangan Pengalaman Kerja',
        recipientName: 'Pihak yang Berkepentingan',
        recipientTitle: 'Instansi / Perusahaan Terkait',
        recipientAddress: 'Di Tempat',
        bodyContent: 'Menerangkan dengan sebenarnya bahwa:\n\nNama : {{nama}}\nJabatan : {{jabatan}}\nMasa Kerja : 15 Januari 2023 s.d 30 Juli 2026\n\nAdalah benar pernah bekerja di perusahaan kami dan telah menyelesaikan masa tugasnya dengan predikat sangat baik.\n\nSelama bertugas, yang bersangkutan senantiasa menunjukkan dedikasi, loyalitas, integritas, dan profesionalisme yang tinggi. Kami mengucapkan terima kasih atas segala kontribusi positif yang telah diberikan dan mendoakan kesuksesan dalam karir selanjutnya.'
      },
      {
        id: 'penawaran',
        title: 'Surat Penawaran Bisnis (Quotation)',
        category: 'bisnis',
        categoryLabel: 'Bisnis',
        icon: 'bi-tags-fill',
        desc: 'Penawaran jasa, produk & harga',
        subject: 'Penawaran Jasa Pembuatan Aplikasi & Sistem Dashboard OS',
        recipientName: 'Bapak / Ibu Direktur Utama',
        recipientTitle: 'Direksi Manajemen',
        recipientAddress: 'PT Solusi Bisnis Abadi\nJakarta',
        bodyContent: 'Sehubungan dengan kebutuhan peningkatan efisiensi digital operasional perusahaan Bapak/Ibu, bersama surat ini kami dari TaskArts Studio bermaksud mengajukan proposal penawaran jasa pembuatan Web Application & Management Task OS.\n\nAdapun rincian paket layanan yang kami tawarkan meliputi:\n1. Desain Antarmuka UI/UX Modern & Responsif\n2. Modul Manajemen Proyek, Kanban & Pelacakan Arus Kas\n3. Integrasi Single Page Application & Local Offline Persistence\n4. Garansi Pemeliharaan & Pelatihan Tim selama 3 Bulan\n\nTotal investasi yang kami tawarkan adalah sebesar Rp 25.000.000 (Dua Puluh Lima Juta Rupiah). Kami sangat terbuka untuk berdiskusi lebih lanjut guna menyesuaikan spesifikasi kebutuhan Bapak/Ibu.'
      },
      {
        id: 'izin',
        title: 'Surat Permohonan Izin / Cuti',
        category: 'karir',
        categoryLabel: 'Karier',
        icon: 'bi-calendar-check-fill',
        desc: 'Izin tidak masuk kerja / sakit',
        subject: 'Permohonan Izin Tidak Masuk Kerja (Cuti Tahunan)',
        recipientName: 'Bapak / Ibu Manager Operasional',
        recipientTitle: 'Head of Division',
        recipientAddress: 'PT TaskArts Studio\nDi Tempat',
        bodyContent: 'Melalui surat ini, saya yang bertanda tangan di bawah ini mengajukan permohonan izin cuti kerja selama 3 (tiga) hari kerja, terhitung mulai tanggal 20 Agustus 2026 sampai dengan 22 Agustus 2026 karena adanya keperluan keluarga di luar kota.\n\nSelama masa cuti tersebut, tugas harian darurat telah saya koordinasikan dengan rekan satu tim. Saya akan kembali masuk bekerja seperti biasa pada hari Senin, 25 Agustus 2026.\n\nDemikian surat permohonan izin ini saya sampaikan. Atas perhatian dan izin yang diberikan, saya ucapkan terima kasih.'
      },
      {
        id: 'undangan',
        title: 'Surat Undangan Rapat / Dinas',
        category: 'dinas',
        categoryLabel: 'Kedinasan',
        icon: 'bi-envelope-paper-fill',
        desc: 'Undangan rapat formal kedinasan',
        subject: 'Undangan Rapat Koordinasi Evaluasi Kinerja Triwulan III',
        recipientName: 'Bapak / Ibu Kepala Divisi & Unit Kerja',
        recipientTitle: 'Pimpinan Bagian',
        recipientAddress: 'Di Tempat',
        bodyContent: 'Dalam rangka meninjau pencapaian target kinerja serta penyusunan Rencana Anggaran Biaya (RAB) kuartal mendatang, bersama surat ini kami mengundang Bapak/Ibu untuk hadir pada rapat koordinasi yang akan diselenggarakan pada:\n\nHari / Tanggal : Kamis, 27 Agustus 2026\nWaktu : 09.00 WIB - 12.00 WIB\nTempat : Ruang Rapat Utama Lt. 3 / Zoom Meeting Room\nAgenda : Evaluasi Proyek & Finalisasi Anggaran Kerja\n\nMengingat pentingnya agenda pembahasan tersebut, dimohon kehadiran Bapak/Ibu tepat pada waktunya dengan membawa berkas laporan divisi masing-masing.'
      },
      {
        id: 'tugas',
        title: 'Surat Perintah Tugas (SPTD)',
        category: 'dinas',
        categoryLabel: 'Kedinasan',
        icon: 'bi-card-checklist',
        desc: 'Surat penugasan resmi dinas',
        subject: 'Surat Perintah Tugas Dinas Lapangan (SPTD)',
        recipientName: 'Pegawai yang Ditugaskan',
        recipientTitle: 'Tim Implementasi Lapangan',
        recipientAddress: 'Di Tempat',
        bodyContent: 'Berdasarkan agenda implementasi sistem teknologi terpadu, Direksi memberikan perintah penugasan kepada:\n\nNama : {{nama}}\nJabatan : {{jabatan}}\nInstansi : {{instansi}}\n\nUntuk melaksanakan tugas peninjauan infrastruktur dan sosialisasi modul digital di lokasi proyek per tanggal 1 s.d 5 September 2026. Biaya akomodasi dan transportasi ditanggung oleh anggaran operasional dinas sesuai ketentuan yang berlaku.\n\nSetelah melaksanakan tugas ini, yang bersangkutan diwajibkan menyusun dan menyerahkan laporan pertanggungjawaban kegiatan tertulis paling lambat 3 (tiga) hari kerja setelah masa penugasan berakhir.'
      },
      {
        id: 'kuasa',
        title: 'Surat Kuasa Kedinasan / Khusus',
        category: 'dinas',
        categoryLabel: 'Kedinasan',
        icon: 'bi-shield-shaded',
        desc: 'Pemberian kuasa perwakilan resmi',
        subject: 'Surat Kuasa Khusus Pengambilan Dokumen & Legalitas',
        recipientName: 'Pihak yang Berwenang / Terkait',
        recipientTitle: 'Instansi Pelayanan Publik',
        recipientAddress: 'Di Tempat',
        bodyContent: 'Saya yang bertanda tangan di bawah ini memberikan kuasa penuh kepada:\n\nNama Penerima Kuasa : {{nama}}\nJabatan : {{jabatan}}\nAlamat : {{instansi}}\n\nUntuk mewakili, mengurus, menandatangani, dan mengambil seluruh berkas dokumen legalitas perusahaan di hadapan notaris / instansi berwenang terkait perpanjangan izin usaha operasional.\n\nSurat kuasa ini dibuat dengan sebenarnya tanpa ada paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.'
      },
      {
        id: 'rekomendasi',
        title: 'Surat Rekomendasi Kerja / Studi',
        category: 'karir',
        categoryLabel: 'Karier',
        icon: 'bi-star-fill',
        desc: 'Rekomendasi beasiswa / karir',
        subject: 'Surat Rekomendasi Profesional & Prestasi',
        recipientName: 'Komite Seleksi / HRD Recruiter',
        recipientTitle: 'Admission & Selection Committee',
        recipientAddress: 'Di Tempat',
        bodyContent: 'Dengan ini saya memberikan rekomendasi penuh kepada {{nama}} (Jabatan: {{jabatan}}) atas kinerjanya yang luar biasa selama bertugas di bawah supervisi saya di {{instansi}}.\n\nYang bersangkutan memiliki keahlian teknis yang sangat solid, integritas kerja tinggi, serta kemampuan problem-solving yang cepat dan inovatif. Saya meyakini bahwa {{nama}} akan mampu memberikan kontribusi unggul bagi institusi / program yang Bapak/Ibu pimpin.'
      },
      {
        id: 'pernyataan',
        title: 'Surat Pernyataan Bermaterai',
        category: 'dinas',
        categoryLabel: 'Kedinasan',
        icon: 'bi-journal-check',
        desc: 'Pernyataan kesanggupan / resmi',
        subject: 'Surat Pernyataan Kesanggupan Mematuhi Ketentuan Perusahaan',
        recipientName: 'Manajemen Perusahaan',
        recipientTitle: 'Dewan Direksi',
        recipientAddress: 'PT TaskArts Global Indonesia\nDi Tempat',
        bodyContent: 'Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa:\n\n1. Sanggup mematuhi seluruh peraturan perusahaan dan menjaga kerahasiaan data (Non-Disclosure Agreement).\n2. Tidak akan menyalahgunakan fasilitas dan akses sistem kantor untuk kepentingan pribadi.\n3. Bersedia menerima sanksi sesuai hukum yang berlaku apabila terbukti melanggar pernyataan ini.\n\nDemikian surat pernyataan ini saya buat dengan sadar dan penuh rasa tanggung jawab.'
      },
      {
        id: 'peringatan',
        title: 'Surat Peringatan (SP-1)',
        category: 'karir',
        categoryLabel: 'HRD',
        icon: 'bi-exclamation-triangle-fill',
        desc: 'Surat teguran kedisiplinan kerja',
        subject: 'Surat Peringatan Pertama (SP-1) - Kedisiplinan Kerja',
        recipientName: 'Karyawan yang Bersangkutan',
        recipientTitle: 'Staff Operasional',
        recipientAddress: 'Di Tempat',
        bodyContent: 'Surat Peringatan Pertama (SP-1) ini diterbitkan kepada {{nama}} (Jabatan: {{jabatan}}) sehubungan dengan adanya pelanggaran disiplin kerja berupa ketidakhadiran tanpa keterangan sah selama 3 hari berturut-turut.\n\nKami berharap saudara dapat segera melakukan perbaikan kinerja dan disiplin kerja. Apabila dalam masa 6 (enam) bulan ke depan terulang pelanggaran serupa, maka perusahaan akan menerbitkan sanksi Surat Peringatan tingkat selanjutnya sesuai SOP ketenagakerjaan.'
      },
      {
        id: 'mou',
        title: 'Surat Perjanjian Kerjasama (MoU)',
        category: 'bisnis',
        categoryLabel: 'Bisnis',
        icon: 'bi-handshake-fill',
        desc: 'Memorandum of Understanding',
        subject: 'Nota Kesepahaman (MoU) Kemitraan Strategis Digital',
        recipientName: 'Pimpinan Mitra Kerjasama',
        recipientTitle: 'Managing Partner',
        recipientAddress: 'PT Mitra Sinergi Bersama\nJakarta',
        bodyContent: 'Pada hari ini sepakat mengadakan nota kesepahaman (MoU) mengenai kolaborasi integrasi sistem aplikasi produktivitas dan penyediaan solusi workflow cerdas.\n\nKedua belah pihak sepakat untuk saling mendukung sumber daya, pertukaran keahlian teknis, dan promosi bersama guna menciptakan ekosistem kerja digital yang lebih produktif dan efisien di Indonesia.'
      }
    ];

    const letter = ref({
      showKop: true,
      kopLogo: '',
      kopLogoPreset: 'logo_app',
      kopLogoPosition: 'left',
      kopLogoHeight: 60,
      kopStyle: 'double',
      kopName: 'PT RAJINKERJA GLOBAL INDONESIA',
      kopSubname: 'PLATFORM DIGITAL ORGANIZER - BY KAFEINARTS',
      kopAddress: 'Gedung Menara Rajin Lt. 15, Jl. Jend. Sudirman Kav. 88, Jakarta Selatan 12190',
      kopContact: 'Telp: (021) 555-8899 | Email: halo@rajinkerja.id | Website: www.rajinkerja.id',
      number: '001/SK/RK/VIII/2026',
      city: 'Jakarta',
      date: new Date().toISOString().split('T')[0],
      attachment: '1 (Satu) Berkas Lampiran',
      subject: 'Surat Penawaran Kerjasama Pengembangan Sistem',
      recipientName: 'Bapak Budi Santoso, S.E.',
      recipientTitle: 'Direktur Utama',
      recipientAddress: 'PT Solusi Mandiri Nusantara\nJakarta Selatan',
      salutation: 'Dengan hormat,',
      bodyContent: 'Sehubungan dengan rencana peningkatan efisiensi kerja tim dan operasional perusahaan Bapak/Ibu, bersama surat ini kami bermaksud mengajukan penawaran kerjasama implementasi TaskArts Task OS.\n\nSistem kami telah dirancang dengan standar performa modern yang mencakup modul To-Do Kanban, Rencana Anggaran Biaya (RAB), Pelacak Arus Kas, dan Pembuat Surat & CV ATS otomatis.\n\nBesar harapan kami untuk dapat mempresentasikan keunggulan sistem ini di hadapan tim manajemen Bapak/Ibu. Atas perhatian dan kerjasamanya, kami sampaikan terima kasih.',
      closing: 'Hormat kami,',
      signerName: 'Arif Permana, S.Kom',
      signerTitle: 'Direktur Utama',
      signerNip: 'NIK: RK-2026-001',
      signaturePosition: 'right',
      signatureImage: '',
      ccText: '1. Direktur Operasional\n2. Arsip Bagian Sekretariat',
      paperSize: 'a4',
      paperOrientation: 'portrait',
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 25,
      marginRight: 20,
      marginPreset: 'official',
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: '14'
    });

    const paperSizesList = computed(() => Object.values(PAPER_SIZES));

    const currentPaperInfo = computed(() => {
      const key = (letter.value.paperSize || 'a4').toLowerCase();
      return PAPER_SIZES[key] || PAPER_SIZES.a4;
    });

    const previewZoom = ref(100);
    const showMarginGuides = ref(false);

    const previewTransformStyle = computed(() => {
      const scale = (previewZoom.value || 100) / 100;
      return {
        transform: scale !== 1 ? `scale(${scale})` : 'none',
        transformOrigin: 'top center',
        transition: 'transform 0.15s ease-out'
      };
    });

    const currentLogoSrc = computed(() => {
      if (letter.value.kopLogo) return letter.value.kopLogo;
      if (letter.value.kopLogoPreset && letter.value.kopLogoPreset !== 'none') {
        const found = logoPresets.find(p => p.id === letter.value.kopLogoPreset);
        return found ? found.url : '';
      }
      return '';
    });

    const letterPaperInlineStyles = computed(() => {
      const paper = currentPaperInfo.value;
      const isLandscape = letter.value.paperOrientation === 'landscape';
      const widthMm = isLandscape ? paper.heightMm : paper.widthMm;
      const minHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

      const top = letter.value.marginTop ?? 20;
      const btm = letter.value.marginBottom ?? 20;
      const lft = letter.value.marginLeft ?? 25;
      const rgt = letter.value.marginRight ?? 20;
      const font = letter.value.fontFamily || "'Times New Roman', Times, serif";
      const size = (letter.value.fontSize || 14) + 'px';

      return {
        width: `${widthMm}mm`,
        minHeight: `${minHeightMm}mm`,
        paddingTop: `${top}mm`,
        paddingBottom: `${btm}mm`,
        paddingLeft: `${lft}mm`,
        paddingRight: `${rgt}mm`,
        fontFamily: font,
        fontSize: size,
        boxSizing: 'border-box'
      };
    });

    const applyMarginPreset = (presetKey) => {
      letter.value.marginPreset = presetKey;
      if (presetKey === 'official') {
        letter.value.marginTop = 20;
        letter.value.marginBottom = 20;
        letter.value.marginLeft = 25;
        letter.value.marginRight = 20;
      } else if (presetKey === 'symmetric') {
        letter.value.marginTop = 20;
        letter.value.marginBottom = 20;
        letter.value.marginLeft = 20;
        letter.value.marginRight = 20;
      } else if (presetKey === 'compact') {
        letter.value.marginTop = 15;
        letter.value.marginBottom = 15;
        letter.value.marginLeft = 20;
        letter.value.marginRight = 15;
      } else if (presetKey === 'wide') {
        letter.value.marginTop = 25;
        letter.value.marginBottom = 25;
        letter.value.marginLeft = 30;
        letter.value.marginRight = 20;
      }
    };

    const filteredTemplates = computed(() => {
      if (activeTemplateCat.value === 'all') return letterTemplates;
      return letterTemplates.filter(t => t.category === activeTemplateCat.value);
    });

    const activeTemplateTitle = computed(() => {
      const found = letterTemplates.find(t => t.id === selectedTemplateId.value);
      return found ? found.title : 'Kustom Surat';
    });

    const formattedDate = computed(() => {
      if (!letter.value.date) return '';
      try {
        const d = new Date(letter.value.date);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return letter.value.date;
      }
    });

    const bodyParagraphs = computed(() => {
      if (!letter.value.bodyContent) return [];
      return letter.value.bodyContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    });

    const isListParagraph = (para) => {
      const trimmed = para.trim();
      return trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') ||
             trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('Nama :') || trimmed.startsWith('Hari /');
    };

    // Dynamic Variable Replacer for Bulk Mail Merge
    const renderDynamicText = (text, recipient) => {
      if (!text) return '';
      if (!recipient) return text;
      let res = text;
      res = res.replace(/\{\{\s*nama\s*\}\}/gi, recipient.name || letter.value.recipientName || 'Bapak/Ibu');
      res = res.replace(/\{\{\s*jabatan\s*\}\}/gi, recipient.title || letter.value.recipientTitle || 'Pimpinan');
      res = res.replace(/\{\{\s*instansi\s*\}\}/gi, recipient.company || letter.value.recipientAddress || 'Di Tempat');
      res = res.replace(/\{\{\s*perusahaan\s*\}\}/gi, recipient.company || 'Di Tempat');
      res = res.replace(/\{\{\s*alamat\s*\}\}/gi, recipient.company || letter.value.recipientAddress || 'Di Tempat');
      res = res.replace(/\{\{\s*nomor_surat\s*\}\}/gi, recipient.number || letter.value.number || '');
      res = res.replace(/\{\{\s*tanggal\s*\}\}/gi, formattedDate.value || '');
      res = res.replace(/\{\{\s*catatan\s*\}\}/gi, recipient.notes || '');
      return res;
    };

    const getRenderedBodyParagraphs = (recipient) => {
      if (!letter.value.bodyContent) return [];
      const rendered = renderDynamicText(letter.value.bodyContent, recipient);
      return rendered.split(/\n\n+/).filter(p => p.trim().length > 0);
    };

    const insertPlaceholder = (tag) => {
      letter.value.bodyContent += ' ' + tag;
    };

    const selectTemplate = (tmpl) => {
      selectedTemplateId.value = tmpl.id;
      letter.value.subject = tmpl.subject;
      if (suratMode.value === 'single') {
        letter.value.recipientName = tmpl.recipientName;
        letter.value.recipientTitle = tmpl.recipientTitle;
        letter.value.recipientAddress = tmpl.recipientAddress;
      }
      letter.value.bodyContent = tmpl.bodyContent;

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Template "${tmpl.title}" Dimuat!`,
        showConfirmButton: false,
        timer: 1800
      });
    };

    const logoInput = ref(null);

    const onLogoSelected = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        letter.value.kopLogo = ev.target.result;
        letter.value.kopLogoPreset = '';
      };
      reader.readAsDataURL(file);
    };

    const applyLogoPreset = (preset) => {
      letter.value.kopLogoPreset = preset.id;
      letter.value.kopLogo = '';
      if (preset.id === 'none') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Kop Diatur Tanpa Logo (Kop Polos)',
          showConfirmButton: false,
          timer: 1500
        });
      }
    };

    const clearLogo = () => {
      letter.value.kopLogo = '';
      letter.value.kopLogoPreset = 'none';
      if (logoInput.value) {
        logoInput.value.value = '';
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Logo Kop Dihapus (Kop Polos)',
        showConfirmButton: false,
        timer: 1500
      });
    };

    const onSignSelected = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        letter.value.signatureImage = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    const insertNewParagraph = () => {
      letter.value.bodyContent += '\n\nParagraf baru telah ditambahkan di sini...';
    };

    const insertBulletList = () => {
      letter.value.bodyContent += '\n\n1. Poin rincian pertama\n2. Poin rincian kedua\n3. Poin rincian ketiga';
    };

    // Bulk Management Functions
    const addRecipientRow = () => {
      const nextNum = bulkRecipients.value.length + 1;
      const padded = String(nextNum).padStart(3, '0');
      bulkRecipients.value.push({
        id: 'rec_' + Date.now() + Math.random().toString(36).substr(2, 4),
        name: 'Penerima Baru ' + nextNum,
        title: 'Jabatan / Posisi',
        company: 'Instansi / Perusahaan',
        phone: '',
        number: `${padded}/SK/RK/VIII/2026`,
        notes: ''
      });
      activeBulkIndex.value = bulkRecipients.value.length - 1;
    };

    const removeRecipientRow = (idx) => {
      if (bulkRecipients.value.length <= 1) return;
      bulkRecipients.value.splice(idx, 1);
      if (activeBulkIndex.value >= bulkRecipients.value.length) {
        activeBulkIndex.value = bulkRecipients.value.length - 1;
      }
    };

    const clearBulkRecipients = () => {
      Swal.fire({
        title: 'Reset Daftar Penerima?',
        text: 'Semua baris penerima akan dikosongkan kembali menjadi 1 penerima default.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          bulkRecipients.value = [
            {
              id: 'rec_1',
              name: 'Bapak / Ibu Pimpinan',
              title: 'Direktur Utama',
              company: 'PT Mitra Utama',
              phone: '',
              number: '001/SK/RK/VIII/2026',
              notes: ''
            }
          ];
          activeBulkIndex.value = 0;
        }
      });
    };

    const autoGenerateLetterNumbers = () => {
      const basePrefix = prompt('Masukkan Format Awalan Nomor Surat (Contoh: SK/RK/VIII/2026):', 'SK/RK/VIII/2026');
      if (!basePrefix) return;
      bulkRecipients.value.forEach((rec, idx) => {
        const num = String(idx + 1).padStart(3, '0');
        rec.number = `${num}/${basePrefix}`;
      });
      Swal.fire({
        icon: 'success',
        title: 'Nomor Surat Terbentuk!',
        text: `Berhasil membuat ${bulkRecipients.value.length} nomor surat urut otomatis.`,
        timer: 1500,
        showConfirmButton: false
      });
    };

    const importFromContacts = () => {
      const contacts = store.getters.getContacts || [];
      if (!contacts.length) {
        Swal.fire({
          icon: 'info',
          title: 'Kontak Tim Masih Kosong',
          text: 'Belum ada kontak tersimpan di menu Kontak Tim & WA. Anda bisa menambahkannya di sana atau gunakan fitur Paste CSV.'
        });
        return;
      }

      let count = 0;
      contacts.forEach(c => {
        const nextNum = bulkRecipients.value.length + 1;
        const padded = String(nextNum).padStart(3, '0');
        bulkRecipients.value.push({
          id: 'rec_' + Date.now() + Math.random().toString(36).substr(2, 4),
          name: c.name || 'Penerima',
          title: c.category || 'Client / Mitra',
          company: c.company || c.address || 'Di Tempat',
          phone: c.phone || '',
          number: `${padded}/SK/RK/VIII/2026`,
          notes: c.notes || ''
        });
        count++;
      });

      Swal.fire({
        icon: 'success',
        title: 'Kontak Diimpor!',
        text: `Berhasil memasukkan ${count} kontak ke daftar penerima surat massal.`,
        timer: 2000,
        showConfirmButton: false
      });
    };

    const processBulkImport = () => {
      if (!bulkImportRawText.value.trim()) {
        Swal.fire('Data Kosong', 'Silakan tempel teks daftar penerima terlebih dahulu.', 'warning');
        return;
      }

      const lines = bulkImportRawText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let added = 0;

      lines.forEach((line, idx) => {
        // split by comma or tab or pipe
        const parts = line.split(/[,|\t]+/).map(p => p.trim());
        if (parts.length > 0 && parts[0]) {
          const nextNum = bulkRecipients.value.length + 1;
          const padded = String(nextNum).padStart(3, '0');
          bulkRecipients.value.push({
            id: 'rec_' + (Date.now() + idx) + Math.random().toString(36).substr(2, 4),
            name: parts[0] || 'Penerima ' + nextNum,
            title: parts[1] || 'Jabatan',
            company: parts[2] || 'Instansi / PT',
            phone: parts[3] || '',
            number: parts[4] || `${padded}/SK/RK/VIII/2026`,
            notes: parts[5] || ''
          });
          added++;
        }
      });

      showBulkImportModal.value = false;
      bulkImportRawText.value = '';

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Menambahkan!',
        text: `${added} penerima telah ditambahkan ke daftar bulk mail merge.`
      });
    };

    const openBulkBroadcastModal = () => {
      showBulkBroadcastModal.value = true;
    };

    const sendWaToRecipient = (rec) => {
      if (!rec.phone) return;
      let cleanPhone = rec.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('08')) {
        cleanPhone = '628' + cleanPhone.slice(2);
      }
      const renderedBody = renderDynamicText(letter.value.bodyContent, rec);
      const text = `*${letter.value.subject || 'Surat Resmi'}*\n` +
        `Nomor: ${rec.number || letter.value.number}\n` +
        `Kepada Yth. *${rec.name}* (${rec.title || ''})\n` +
        `${rec.company || ''}\n\n` +
        `${letter.value.salutation || 'Dengan hormat,'}\n\n` +
        `${renderedBody}\n\n` +
        `${letter.value.closing || 'Hormat kami,'}\n` +
        `*${letter.value.signerName}*\n${letter.value.signerTitle}`;

      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    };

    // Print Logic (Single vs Bulk) with Exact Paper Size and Margins
    const isPdfLoading = ref(false);

    const getDocPrintStyles = () => {
      const paper = currentPaperInfo.value;
      const isLandscape = letter.value.paperOrientation === 'landscape';
      const widthMm = isLandscape ? paper.heightMm : paper.widthMm;
      const minHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

      const mTop = letter.value.marginTop ?? 20;
      const mBottom = letter.value.marginBottom ?? 20;
      const mLeft = letter.value.marginLeft ?? 25;
      const mRight = letter.value.marginRight ?? 20;
      const font = letter.value.fontFamily || "'Times New Roman', Times, serif";
      const fSize = (letter.value.fontSize || 14) + 'px';

      return `
        @page {
          size: ${widthMm}mm ${minHeightMm}mm;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .letter-paper {
          width: ${widthMm}mm !important;
          max-width: ${widthMm}mm !important;
          min-height: ${minHeightMm}mm !important;
          box-sizing: border-box !important;
          padding-top: ${mTop}mm !important;
          padding-bottom: ${mBottom}mm !important;
          padding-left: ${mLeft}mm !important;
          padding-right: ${mRight}mm !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          font-family: ${font} !important;
          font-size: ${fSize} !important;
          line-height: 1.6 !important;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .kop-divider-double {
          margin-top: 8px !important;
          margin-bottom: 16px !important;
          border-top: 3px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
          height: 5px !important;
        }
        .kop-divider-thick {
          margin-top: 8px !important;
          margin-bottom: 16px !important;
          border-top: 3px solid #000000 !important;
        }
        .kop-divider-single {
          margin-top: 8px !important;
          margin-bottom: 16px !important;
          border-top: 1px solid #1e293b !important;
        }
        .no-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .bulk-print-container > .letter-paper,
        .print-page-break {
          page-break-after: always !important;
          break-after: page !important;
          margin-bottom: 0 !important;
        }
        .bulk-print-container > .letter-paper:last-child,
        .print-page-break:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
      `;
    };

    const getA4PrintStyles = getDocPrintStyles;

    const printCurrentMode = () => {
      if (isPdfLoading.value) return;
      isPdfLoading.value = true;

      setTimeout(() => {
        const docCustomStyles = getDocPrintStyles();
        const paper = currentPaperInfo.value;

        if (suratMode.value === 'bulk') {
          isPrintingAll.value = true;
          nextTick(() => {
            const title = `Surat_Massal_${bulkRecipients.value.length}_Penerima_${paper.name}`;
            openPrintableDocumentInNewTab({
              title,
              elementId: 'letterBulkPrintArea',
              customStyles: docCustomStyles,
              autoPrint: true,
              paperSize: letter.value.paperSize || 'a4',
              paperOrientation: letter.value.paperOrientation || 'portrait',
              marginTop: letter.value.marginTop ?? 20,
              marginBottom: letter.value.marginBottom ?? 20,
              marginLeft: letter.value.marginLeft ?? 25,
              marginRight: letter.value.marginRight ?? 20
            });
            isPrintingAll.value = false;
            isPdfLoading.value = false;
          });
        } else {
          const title = `Surat_${letter.value.subject || 'Resmi'}_${paper.name}`;
          openPrintableDocumentInNewTab({
            title,
            elementId: 'letterPrintArea',
            customStyles: docCustomStyles,
            autoPrint: true,
            paperSize: letter.value.paperSize || 'a4',
            paperOrientation: letter.value.paperOrientation || 'portrait',
            marginTop: letter.value.marginTop ?? 20,
            marginBottom: letter.value.marginBottom ?? 20,
            marginLeft: letter.value.marginLeft ?? 25,
            marginRight: letter.value.marginRight ?? 20
          });
          isPdfLoading.value = false;
        }
      }, 350);
    };

    const printLetter = () => {
      printCurrentMode();
    };

    // ==========================================================
    // DRAFT & REPORT MANAGEMENT (Cek Draft & Laporan Dikerjakan)
    // ==========================================================
    const showDraftsModal = ref(false);
    const currentDraftId = ref(null);
    const draftSearchQuery = ref('');
    const draftFilter = ref('all'); // 'all' | 'single' | 'bulk'

    const draftsList = computed(() => {
      return store.state.suratList || [];
    });

    const currentDraft = computed(() => {
      if (!currentDraftId.value) return null;
      return draftsList.value.find(d => d.id === currentDraftId.value) || null;
    });

    const singleDraftsCount = computed(() => {
      return draftsList.value.filter(d => d.mode !== 'bulk').length;
    });

    const bulkDraftsCount = computed(() => {
      return draftsList.value.filter(d => d.mode === 'bulk').length;
    });

    const filteredDrafts = computed(() => {
      let list = draftsList.value;
      if (draftFilter.value === 'single') {
        list = list.filter(d => d.mode !== 'bulk');
      } else if (draftFilter.value === 'bulk') {
        list = list.filter(d => d.mode === 'bulk');
      }
      if (draftSearchQuery.value.trim()) {
        const q = draftSearchQuery.value.toLowerCase();
        list = list.filter(d => {
          const title = (d.title || '').toLowerCase();
          const recipient = (d.recipient || (d.data && d.data.recipientName) || '').toLowerCase();
          const number = (d.number || (d.data && d.data.number) || '').toLowerCase();
          const subject = (d.data && d.data.subject ? d.data.subject : '').toLowerCase();
          return title.includes(q) || recipient.includes(q) || number.includes(q) || subject.includes(q);
        });
      }
      return list;
    });

    const formatDateTime = (isoStr) => {
      if (!isoStr) return '-';
      try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return isoStr;
      }
    };

    const openDraftsModal = () => {
      showDraftsModal.value = true;
    };

    const loadDraftToEditor = (draft) => {
      if (!draft) return;
      currentDraftId.value = draft.id;
      if (draft.mode) {
        suratMode.value = draft.mode;
      }
      if (draft.data) {
        letter.value = {
          ...letter.value,
          ...JSON.parse(JSON.stringify(draft.data))
        };
      }
      if (draft.bulkRecipients && Array.isArray(draft.bulkRecipients)) {
        bulkRecipients.value = JSON.parse(JSON.stringify(draft.bulkRecipients));
        activeBulkIndex.value = 0;
      }
      showDraftsModal.value = false;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Draft "${draft.title}" Berhasil Dimuat!`,
        text: 'Naskah surat siap diedit dan dicetak ke format A4.',
        showConfirmButton: false,
        timer: 2000
      });
    };

    const printDraftDirect = (draft) => {
      loadDraftToEditor(draft);
      nextTick(() => {
        setTimeout(() => {
          printCurrentMode();
        }, 350);
      });
    };

    const duplicateDraft = (draft) => {
      const duplicated = {
        ...JSON.parse(JSON.stringify(draft)),
        id: 'surat_' + Date.now(),
        title: (draft.title || 'Surat') + ' (Salinan)',
        status: 'Selesai Dikerjakan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.dispatch('addSurat', duplicated);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Draft Berhasil Diduplikasi!',
        showConfirmButton: false,
        timer: 1800
      });
    };

    const deleteDraft = (draftId) => {
      Swal.fire({
        title: 'Hapus Laporan / Draft Ini?',
        text: 'Draft ini akan dihapus permanen dari arsip persuratan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc3545'
      }).then((res) => {
        if (res.isConfirmed) {
          store.dispatch('deleteSurat', draftId);
          if (currentDraftId.value === draftId) {
            currentDraftId.value = null;
          }
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Draft Berhasil Dihapus',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
    };

    const createNewDraft = () => {
      currentDraftId.value = null;
      letter.value.subject = 'Surat Baru';
      letter.value.number = '001/SK/RK/' + new Date().getFullYear();
      letter.value.date = new Date().toISOString().split('T')[0];
      showDraftsModal.value = false;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Lembar Surat Baru Siap',
        showConfirmButton: false,
        timer: 1500
      });
    };

    const saveLetter = (saveAsNew = false) => {
      const isExisting = !saveAsNew && currentDraftId.value;
      const idToUse = isExisting ? currentDraftId.value : 'surat_' + Date.now();
      const nowIso = new Date().toISOString();

      const suratObj = {
        id: idToUse,
        title: letter.value.subject || 'Surat Resmi',
        recipient: suratMode.value === 'bulk' ? `Massal (${bulkRecipients.value.length} Penerima)` : (letter.value.recipientName || 'Penerima'),
        date: letter.value.date,
        number: letter.value.number,
        mode: suratMode.value,
        status: 'Selesai Dikerjakan',
        data: JSON.parse(JSON.stringify(letter.value)),
        bulkRecipients: JSON.parse(JSON.stringify(bulkRecipients.value)),
        updatedAt: nowIso
      };

      if (isExisting) {
        store.dispatch('updateSurat', suratObj);
      } else {
        suratObj.createdAt = nowIso;
        store.dispatch('addSurat', suratObj);
        currentDraftId.value = idToUse;
      }

      sendOnDeviceNotification('Surat Berhasil Disimpan', {
        body: `Dokumen "${letter.value.subject}" berhasil disimpan ke sistem arsip persuratan.`
      });

      Swal.fire({
        icon: 'success',
        title: isExisting ? 'Draft Berhasil Diperbarui!' : 'Draft Surat Tersimpan!',
        text: 'Naskah surat dan pengaturan margin A4 tersimpan rapi dalam arsip laporan yang sudah dikerjakan.',
        timer: 2000,
        showConfirmButton: false
      });
    };

    // WhatsApp Single Modal
    const showWaModal = ref(false);
    const waRecipientMode = ref('contact');
    const selectedContactId = ref('');
    const selectedContactPhone = ref('');
    const manualPhone = ref('');
    const waCustomMessage = ref('');

    const contactsList = computed(() => store.getters.getContacts || []);

    const buildDefaultWaMessage = () => {
      const body = letter.value.bodyContent || '';
      return `*${letter.value.subject || 'Surat Resmi'}*\n` +
        `Nomor: ${letter.value.number || '-'}\n` +
        `Kepada Yth. *${letter.value.recipientName || 'Bapak/Ibu'}*\n` +
        `${letter.value.recipientTitle ? letter.value.recipientTitle + '\n' : ''}` +
        `${letter.value.recipientAddress ? letter.value.recipientAddress + '\n' : ''}\n` +
        `${letter.value.salutation || 'Dengan hormat,'}\n\n` +
        `${body}\n\n` +
        `${letter.value.closing || 'Hormat Kami,'}\n` +
        `*${letter.value.signerName || 'Pimpinan'}*\n` +
        `${letter.value.signerTitle || ''}`;
    };

    const openWaModal = () => {
      waCustomMessage.value = buildDefaultWaMessage();
      if (contactsList.value.length > 0) {
        selectedContactId.value = contactsList.value[0].id;
        selectedContactPhone.value = contactsList.value[0].phone || '';
      }
      showWaModal.value = true;
    };

    const closeWaModal = () => {
      showWaModal.value = false;
    };

    const resetWaMessage = () => {
      waCustomMessage.value = buildDefaultWaMessage();
    };

    const onSelectContact = () => {
      const found = contactsList.value.find(c => c.id === selectedContactId.value);
      if (found) {
        selectedContactPhone.value = found.phone || '';
      }
    };

    const sendWhatsApp = () => {
      let targetPhone = waRecipientMode.value === 'contact' ? selectedContactPhone.value : manualPhone.value;
      if (!targetPhone) {
        Swal.fire({
          icon: 'warning',
          title: 'Nomor WhatsApp Kosong',
          text: 'Silakan pilih kontak yang memiliki nomor HP atau masukkan nomor secara manual.'
        });
        return;
      }

      let clean = targetPhone.replace(/[^0-9]/g, '');
      if (clean.startsWith('08')) {
        clean = '628' + clean.slice(2);
      } else if (clean.startsWith('+62')) {
        clean = clean.slice(1);
      }

      const text = encodeURIComponent(waCustomMessage.value);
      const url = `https://wa.me/${clean}?text=${text}`;
      window.open(url, '_blank');
      showWaModal.value = false;
    };

    const copyWaMessage = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(waCustomMessage.value).then(() => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Teks Surat Disalin!',
            showConfirmButton: false,
            timer: 1500
          });
        });
      }
    };

    // JSON Export / Import
    const suratJsonInput = ref(null);

    const exportSuratJson = () => {
      const payload = {
        app: 'TaskArts',
        module: 'SuratBuilder',
        suratMode: suratMode.value,
        exportedAt: new Date().toISOString(),
        letter: letter.value,
        bulkRecipients: bulkRecipients.value,
        selectedTemplateId: selectedTemplateId.value
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `surat-rajinkerja-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      Swal.fire({
        icon: 'success',
        title: 'JSON Berhasil Diunduh!',
        text: 'Berkas cadangan data surat & kop berhasil diekspor.',
        timer: 1800,
        showConfirmButton: false
      });
    };

    const triggerImportSuratJson = () => {
      if (suratJsonInput.value) {
        suratJsonInput.value.click();
      }
    };

    const onSuratJsonSelected = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          const incomingLetter = parsed.letter || parsed;

          Swal.fire({
            title: 'Muat Data Surat?',
            html: `
              <div class="text-start p-2 bg-light rounded border mb-2 small">
                <p class="mb-1"><strong>Perihal:</strong> ${incomingLetter.subject || '-'}</p>
                <p class="mb-1"><strong>Instansi:</strong> ${incomingLetter.kopName || '-'}</p>
                <p class="mb-0"><strong>Penerima:</strong> ${parsed.bulkRecipients ? parsed.bulkRecipients.length + ' Orang (Bulk)' : (incomingLetter.recipientName || '-')}</p>
              </div>
              <p class="small text-muted mb-0">Apakah Anda ingin memuat data surat ini ke editor?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Muat Data Surat',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0d6efd'
          }).then((result) => {
            if (result.isConfirmed) {
              if (incomingLetter) {
                letter.value = { ...letter.value, ...incomingLetter };
                if (parsed.selectedTemplateId) selectedTemplateId.value = parsed.selectedTemplateId;
                if (parsed.suratMode) suratMode.value = parsed.suratMode;
              }
              if (parsed.bulkRecipients && Array.isArray(parsed.bulkRecipients)) {
                bulkRecipients.value = parsed.bulkRecipients;
              }
              saveLetter();
              Swal.fire({
                icon: 'success',
                title: 'Data Surat Berhasil Dimuat!',
                timer: 2000,
                showConfirmButton: false
              });
            }
          });
        } catch (err) {
          Swal.fire('Berkas Tidak Valid', 'Gagal membaca berkas JSON: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };

    return {
      suratMode,
      isPrintingAll,
      formTab,
      selectedTemplateId,
      activeTemplateCat,
      templateCategories,
      letterTemplates,
      filteredTemplates,
      activeTemplateTitle,
      logoPresets,
      currentLogoSrc,
      logoInput,
      clearLogo,
      letter,
      letterPaperInlineStyles,
      applyMarginPreset,
      formattedDate,
      bodyParagraphs,
      isListParagraph,
      renderDynamicText,
      getRenderedBodyParagraphs,
      insertPlaceholder,
      insertNewParagraph,
      insertBulletList,
      selectTemplate,
      onLogoSelected,
      applyLogoPreset,
      onSignSelected,
      saveLetter,
      isPdfLoading,
      printCurrentMode,
      printLetter,
      // Paper, Preview & Zoom
      paperSizesList,
      currentPaperInfo,
      previewZoom,
      showMarginGuides,
      previewTransformStyle,
      // Drafts & Reports Management
      showDraftsModal,
      currentDraftId,
      currentDraft,
      draftSearchQuery,
      draftFilter,
      draftsList,
      singleDraftsCount,
      bulkDraftsCount,
      filteredDrafts,
      formatDateTime,
      openDraftsModal,
      loadDraftToEditor,
      printDraftDirect,
      duplicateDraft,
      deleteDraft,
      createNewDraft,
      // Bulk State & Methods
      activeBulkIndex,
      activeBulkRecipient,
      bulkRecipients,
      showBulkImportModal,
      showBulkBroadcastModal,
      bulkImportRawText,
      addRecipientRow,
      removeRecipientRow,
      clearBulkRecipients,
      autoGenerateLetterNumbers,
      importFromContacts,
      processBulkImport,
      openBulkBroadcastModal,
      sendWaToRecipient,
      // WA Single
      showWaModal,
      waRecipientMode,
      selectedContactId,
      selectedContactPhone,
      manualPhone,
      waCustomMessage,
      contactsList,
      openWaModal,
      closeWaModal,
      resetWaMessage,
      onSelectContact,
      sendWhatsApp,
      copyWaMessage,
      suratJsonInput,
      exportSuratJson,
      triggerImportSuratJson,
      onSuratJsonSelected
    };
  }
};
</script>

<style scoped>
.preview-desk-workbench {
  background-color: #334155;
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  border: 1px solid #1e293b;
  min-height: 700px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px 20px 48px 20px;
}

.letter-paper {
  box-sizing: border-box !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.15) !important;
  border-radius: 2px !important;
  position: relative !important;
  margin-left: auto !important;
  margin-right: auto !important;
  line-height: 1.6;
}

.margin-guide-overlay {
  position: absolute;
  border: 1.5px dashed #0284c7;
  pointer-events: none;
  z-index: 50;
  background-color: rgba(2, 132, 199, 0.03);
  box-shadow: inset 0 0 0 1px rgba(2, 132, 199, 0.1);
}

.margin-guide-tag {
  position: absolute;
  top: -24px;
  left: 0;
  background: #0284c7;
  color: #ffffff;
  font-size: 10.5px;
  font-family: monospace;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
}

/* Kop Surat Divider Lines */
.kop-divider-double {
  margin-top: 8px;
  margin-bottom: 16px;
  border-top: 3px solid #000000;
  border-bottom: 1px solid #000000;
  height: 5px;
}

.kop-divider-thick {
  margin-top: 8px;
  margin-bottom: 16px;
  border-top: 3px solid #000000;
}

.kop-divider-single {
  margin-top: 8px;
  margin-bottom: 16px;
  border-top: 1px solid #1e293b;
}

.kop-align-left .kop-text-wrapper {
  text-align: center;
}

.kop-align-center .kop-text-wrapper {
  text-align: center;
}

.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}

.btn-xs {
  font-size: 11.5px;
  padding: 0.2rem 0.5rem;
}

.cursor-pointer {
  cursor: pointer;
}

.white-space-pre-line {
  white-space: pre-line;
}

/* ======================================================== */
/* MEDIA PRINT (Dynamic page size and margins)              */
/* ======================================================== */
@media print {
  .no-print,
  .print-hide {
    display: none !important;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .letter-paper {
    box-shadow: none !important;
    border: none !important;
    margin: 0 auto !important;
    background: #ffffff !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .print-page-break {
    page-break-after: always !important;
    break-after: page !important;
    display: block !important;
    margin: 0 !important;
  }

  .print-page-break:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .no-break {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
</style>
