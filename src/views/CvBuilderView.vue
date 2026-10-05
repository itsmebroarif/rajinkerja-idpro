<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner (no-print) -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border no-print">
      <div>
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span class="badge bg-success text-white fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-shield-check me-1"></i> 100% ATS-Friendly Standard
          </span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
          <span class="badge bg-primary text-white fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-grid-fill me-1"></i> 20 Varian Layout + Custom Builder
          </span>
          <span class="badge bg-info-subtle text-info fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-file-earmark-check me-1"></i> Auto-Fit 1 Halaman A4
          </span>
          <span class="badge bg-warning-subtle text-dark fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-stars me-1"></i> ATS Score: {{ currentAtsScore.score }}/100 ({{ currentAtsScore.grade }})
          </span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">ATS CV Builder, Custom Layout Studio & A4 Fixer</h2>
        <p class="text-muted mb-0">Rancang CV profesional dengan <strong>foto profil terpadu</strong>, <strong>20 pilihan template siap pakai</strong>, <strong>studio custom layout mandiri</strong>, dan <strong>penguncian pas rapi di 1 lembar A4</strong>.</p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <button class="btn btn-outline-warning text-dark rounded-pill px-3 fw-semibold" @click="exportCvJson" title="Download CV sebagai JSON">
          <i class="bi bi-filetype-json text-warning me-1"></i> Export JSON
        </button>
        <button class="btn btn-outline-info text-dark rounded-pill px-3 fw-semibold" @click="triggerImportCvJson" title="Import data CV dari JSON">
          <i class="bi bi-upload text-info me-1"></i> Import JSON
        </button>
        <input type="file" ref="cvJsonInput" accept=".json" class="d-none" @change="onCvJsonSelected" />
        <button class="btn btn-outline-success rounded-pill px-3 fw-semibold" @click="saveDraft">
          <i class="bi bi-floppy me-1"></i> {{ isSaving ? 'Tersimpan!' : 'Simpan Draft' }}
        </button>
        <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5" :disabled="isPdfLoading" @click="printCurrentMode">
          <span v-if="isPdfLoading" class="spinner-border spinner-border-sm text-white" role="status"></span>
          <i v-else class="bi bi-printer"></i>
          <span>{{ isPdfLoading ? 'Menyiapkan CV...' : (cvMode === 'bulk' ? 'Cetak Semua CV (' + bulkCandidates.length + ' Profil)' : 'Cetak / Buka CV (A4)') }}</span>
        </button>
      </div>
    </div>

    <!-- Mode Selector: Single CV vs Bulk Multi-Candidate (no-print) -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-2 mb-4 no-print">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 px-2 py-1">
        <div class="btn-group p-1 bg-light rounded-pill border" role="group">
          <button
            type="button"
            class="btn rounded-pill px-4 py-1.5 fw-bold small transition-all"
            :class="cvMode === 'single' ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'"
            @click="cvMode = 'single'"
          >
            <i class="bi bi-person-badge me-1.5"></i> Mode Tunggal (1 Kandidat)
          </button>
          <button
            type="button"
            class="btn rounded-pill px-4 py-1.5 fw-bold small transition-all"
            :class="cvMode === 'bulk' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'"
            @click="cvMode = 'bulk'"
          >
            <i class="bi bi-people-fill me-1.5"></i> Mode Multi-Kandidat / Bulk CV ({{ bulkCandidates.length }} Orang)
          </button>
        </div>

        <div v-if="cvMode === 'bulk'" class="d-flex align-items-center gap-2">
          <span class="badge bg-success-subtle text-success fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-layers-fill me-1"></i> {{ bulkCandidates.length }} Profil Terdaftar
          </span>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" @click="applyLayoutToAllCandidates" title="Terapkan Layout dan Warna Kandidat Aktif ke Seluruh Profil">
            <i class="bi bi-palette-fill me-1"></i> Samakan Layout Semua
          </button>
        </div>
      </div>
    </div>

    <!-- CANDIDATES BAR (Bulk Mode Only) -->
    <div v-if="cvMode === 'bulk'" class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 no-print border-start border-success border-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2 border-bottom pb-3">
        <div>
          <h5 class="fw-bold text-dark mb-0">
            <i class="bi bi-people-fill text-success me-2"></i>Daftar Profil Multi-Kandidat (Batch Generator)
          </h5>
          <small class="text-muted">Kelola beberapa profil CV sekaligus untuk berbagai posisi atau kandidat tim yang berbeda.</small>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="showBulkImportModal = true">
            <i class="bi bi-clipboard-plus me-1"></i> Paste Teks Kandidat
          </button>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="duplicateActiveCandidate">
            <i class="bi bi-copy me-1"></i> Duplikat Profil Ini
          </button>
          <button class="btn btn-sm btn-success rounded-pill px-3" @click="addNewCandidate">
            <i class="bi bi-plus-lg me-1"></i> + Tambah Kandidat
          </button>
        </div>
      </div>

      <!-- Candidate Selection Tabs -->
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <div
          v-for="(cand, idx) in bulkCandidates"
          :key="cand.id"
          class="btn-group btn-group-sm rounded-pill border p-1"
          :class="activeCandidateIndex === idx ? 'bg-primary text-white border-primary shadow-sm' : 'bg-light text-dark'"
        >
          <button
            type="button"
            class="btn btn-xs fw-bold px-3 text-truncate"
            :class="activeCandidateIndex === idx ? 'text-white' : 'text-dark'"
            style="max-width: 220px;"
            @click="activeCandidateIndex = idx"
          >
            <i class="bi bi-person me-1"></i> {{ cand.fullName || 'Kandidat ' + (idx + 1) }}
            <small class="fw-normal opacity-75 d-block" style="font-size: 10px;">{{ cand.jobTitle || 'Belum diisi' }}</small>
          </button>
          <button
            type="button"
            class="btn btn-xs px-2"
            :class="activeCandidateIndex === idx ? 'text-white hover-bg-white-20' : 'text-danger'"
            :disabled="bulkCandidates.length <= 1"
            @click="removeCandidate(idx)"
            title="Hapus Profil"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Wizard Navigation Stepper (no-print) -->
    <div class="card border-0 shadow-sm rounded-4 bg-white mb-4 p-3 overflow-x-auto no-print">
      <div class="d-flex justify-content-between align-items-center min-w-600 px-2">
        <button
          v-for="(step, idx) in steps"
          :key="step.id"
          type="button"
          class="btn border-0 d-flex align-items-center gap-2 p-2 rounded-3 text-start transition-all"
          :class="currentStep === idx + 1 ? 'bg-primary text-white fw-bold shadow-sm' : (currentStep > idx + 1 ? 'bg-success-subtle text-success fw-semibold' : 'text-muted')"
          @click="currentStep = idx + 1"
        >
          <span
            class="rounded-circle d-flex align-items-center justify-content-center fw-bold"
            :class="currentStep === idx + 1 ? 'bg-white text-primary' : (currentStep > idx + 1 ? 'bg-success text-white' : 'bg-light text-muted border')"
            style="width: 28px; height: 28px; font-size: 0.85rem;"
          >
            {{ idx + 1 }}
          </span>
          <span class="small">{{ step.name }}</span>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="row g-4">
      <!-- Left Column: Wizard Form & Layout Studio (no-print) -->
      <div class="col-lg-6 no-print" v-if="currentStep <= 5">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 class="fw-bold text-dark mb-0">
              <span v-if="cvMode === 'bulk'" class="badge bg-success me-2">Kandidat #{{ activeCandidateIndex + 1 }}</span>
              {{ steps[currentStep - 1].title }}
            </h5>
            <span class="badge bg-light text-dark border small">ATS: {{ currentAtsScore.score }}/100</span>
          </div>

          <!-- ======================================================== -->
          <!-- STEP 1: INFORMASI KONTAK & FOTO PROFIL                   -->
          <!-- ======================================================== -->
          <div v-if="currentStep === 1">
            <!-- PHOTO PROFILE UPLOADER & CUSTOMIZER BOX -->
            <div class="p-3 bg-light rounded-4 border mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="fw-bold text-dark small mb-0">
                  <i class="bi bi-camera-fill text-primary me-1.5"></i> Foto Profil CV (Opsional)
                </label>
                <div class="form-check form-switch m-0">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="showPhotoSwitch"
                    :checked="activeCv.showAvatar !== false"
                    @change="activeCv.showAvatar = $event.target.checked"
                  />
                  <label class="form-check-label small fw-semibold" for="showPhotoSwitch">Tampilkan Foto di CV</label>
                </div>
              </div>

              <div class="row g-3 align-items-center">
                <!-- Avatar Preview & Actions -->
                <div class="col-sm-auto text-center">
                  <div class="position-relative d-inline-block">
                    <img
                      v-if="activeCv.avatar"
                      :src="activeCv.avatar"
                      :class="activeAvatarPreviewShapeClass"
                      class="border border-2 border-primary shadow-sm"
                      style="width: 84px; height: 84px; object-fit: cover;"
                      alt="Foto Profil"
                    />
                    <div
                      v-else
                      class="rounded-circle bg-white border border-2 border-dashed d-flex flex-column align-items-center justify-content-center text-muted"
                      style="width: 84px; height: 84px;"
                    >
                      <i class="bi bi-person-fill fs-2 text-secondary opacity-50"></i>
                      <span style="font-size: 9px;">Belum Ada</span>
                    </div>

                    <button
                      v-if="activeCv.avatar"
                      type="button"
                      class="btn btn-danger btn-xs position-absolute top-0 end-0 rounded-circle p-1"
                      style="width: 22px; height: 22px; line-height: 1;"
                      @click="activeCv.avatar = ''"
                      title="Hapus Foto"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>

                <!-- Upload Controls & Camera -->
                <div class="col-sm">
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <input type="file" ref="avatarInput" accept="image/*" class="d-none" @change="onAvatarSelected" />
                    <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold shadow-sm" @click="$refs.avatarInput.click()">
                      <i class="bi bi-upload me-1"></i> Upload Foto
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="triggerSamplePhoto">
                      <i class="bi bi-magic me-1"></i> Foto Contoh
                    </button>
                  </div>
                  <div class="text-muted" style="font-size: 11px;">
                    Format JPG, PNG atau WEBP. Rekomendasi foto formal latar belakang polos / netral.
                  </div>
                </div>
              </div>

              <!-- Extra Photo Controls (if photo is uploaded) -->
              <div v-if="activeCv.avatar" class="mt-3 pt-3 border-top row g-2">
                <div class="col-6 col-md-4">
                  <label class="form-label text-muted small mb-1" style="font-size: 11px;">Bentuk Foto:</label>
                  <select class="form-select form-select-sm" :value="activeCv.avatarShape || 'circle'" @change="activeCv.avatarShape = $event.target.value">
                    <option value="circle">Bulat Sempurna (Circle)</option>
                    <option value="rounded">Kotak Membulat (Rounded)</option>
                    <option value="square">Persegi Tegas (Square)</option>
                    <option value="framed">Bingkai Aksen (Framed)</option>
                  </select>
                </div>

                <div class="col-6 col-md-4">
                  <label class="form-label text-muted small mb-1" style="font-size: 11px;">Ukuran Foto:</label>
                  <select class="form-select form-select-sm" :value="activeCv.avatarSize || 'md'" @change="activeCv.avatarSize = $event.target.value">
                    <option value="sm">Kecil (64px)</option>
                    <option value="md">Sedang (82px - Standar)</option>
                    <option value="lg">Besar (100px)</option>
                    <option value="xl">Ekstra Besar (118px)</option>
                  </select>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label text-muted small mb-1" style="font-size: 11px;">Posisi di Header:</label>
                  <select class="form-select form-select-sm" :value="activeCv.avatarPos || 'left'" @change="activeCv.avatarPos = $event.target.value">
                    <option value="left">Kiri Header</option>
                    <option value="center">Tengah Header</option>
                    <option value="right">Kanan Header</option>
                    <option value="sidebar">Di Dalam Sidebar</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Profile Info Fields -->
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Nama Lengkap <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="activeCv.fullName" placeholder="Contoh: Budi Pratama, S.Kom" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Judul Profesi / Position <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="activeCv.jobTitle" placeholder="Contoh: Senior Frontend Developer" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Email <span class="text-danger">*</span></label>
                <input type="email" class="form-control" v-model="activeCv.email" placeholder="budi.pratama@email.com" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Nomor Telepon / WA <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="activeCv.phone" placeholder="081234567890" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Kota / Domisili</label>
                <input type="text" class="form-control" v-model="activeCv.address" placeholder="Jakarta, Indonesia" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">LinkedIn URL</label>
                <input type="text" class="form-control" v-model="activeCv.linkedin" placeholder="linkedin.com/in/budipratama" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">GitHub / Portofolio</label>
                <input type="text" class="form-control" v-model="activeCv.github" placeholder="github.com/budipratama" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Website Pribadi</label>
                <input type="text" class="form-control" v-model="activeCv.website" placeholder="budipratama.dev" />
              </div>
              <div class="col-12">
                <label class="form-label fw-bold text-dark small">Ringkasan Profil / Summary ATS (3-4 Kalimat)</label>
                <textarea class="form-control" rows="4" v-model="activeCv.summary" placeholder="Rangkuman profesional mengenai pengalaman, pencapaian kunci, dan keahlian utama Anda..."></textarea>
                <div class="form-text small text-muted">Gunakan kata kunci industri untuk memaksimalkan skor pembacaan software ATS.</div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- STEP 2: PENGALAMAN KERJA                                 -->
          <!-- ======================================================== -->
          <div v-else-if="currentStep === 2">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h6 class="fw-bold text-dark mb-0">Daftar Pengalaman Kerja</h6>
              <button class="btn btn-sm btn-primary rounded-pill px-3" @click="addExperience">
                <i class="bi bi-plus-lg me-1"></i> Tambah Posisi
              </button>
            </div>

            <div v-if="!activeCv.experience || activeCv.experience.length === 0" class="text-center py-4 text-muted bg-light rounded-3">
              <i class="bi bi-briefcase fs-3 d-block mb-1"></i>
              Belum ada riwayat kerja. Klik "Tambah Posisi" di atas.
            </div>

            <div v-for="(exp, idx) in activeCv.experience" :key="idx" class="p-3 mb-3 border rounded-3 bg-light position-relative">
              <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 rounded-circle p-1" @click="removeExperience(idx)" title="Hapus">
                <i class="bi bi-x-lg"></i>
              </button>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Nama Perusahaan</label>
                  <input type="text" class="form-control form-control-sm" v-model="exp.company" placeholder="PT Teknologi Inovasi" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Jabatan / Posisi</label>
                  <input type="text" class="form-control form-control-sm" v-model="exp.position" placeholder="Senior Frontend Engineer" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Periode (Bulan/Tahun)</label>
                  <input type="text" class="form-control form-control-sm" v-model="exp.period" placeholder="Jan 2022 - Sekarang" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Lokasi</label>
                  <input type="text" class="form-control form-control-sm" v-model="exp.location" placeholder="Jakarta (Hybrid)" />
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold text-dark small">Deskripsi Tugas & Achievement (Gunakan Action Verbs & Metrik)</label>
                  <textarea class="form-control form-control-sm" rows="3" v-model="exp.description" placeholder="• Memimpin pengembangan 10+ modul aplikasi web Vue 3...&#10;• Meningkatkan kecepatan muat halaman sebesar 40% dan user retention 25%..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- STEP 3: RIWAYAT PENDIDIKAN                               -->
          <!-- ======================================================== -->
          <div v-else-if="currentStep === 3">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h6 class="fw-bold text-dark mb-0">Daftar Riwayat Pendidikan</h6>
              <button class="btn btn-sm btn-primary rounded-pill px-3" @click="addEducation">
                <i class="bi bi-plus-lg me-1"></i> Tambah Pendidikan
              </button>
            </div>

            <div v-if="!activeCv.education || activeCv.education.length === 0" class="text-center py-4 text-muted bg-light rounded-3">
              <i class="bi bi-mortarboard fs-3 d-block mb-1"></i>
              Belum ada riwayat pendidikan. Klik "Tambah Pendidikan" di atas.
            </div>

            <div v-for="(edu, idx) in activeCv.education" :key="idx" class="p-3 mb-3 border rounded-3 bg-light position-relative">
              <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 rounded-circle p-1" @click="removeEducation(idx)" title="Hapus">
                <i class="bi bi-x-lg"></i>
              </button>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Institusi / Universitas</label>
                  <input type="text" class="form-control form-control-sm" v-model="edu.institution" placeholder="Universitas Indonesia" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Gelar & Jurusan</label>
                  <input type="text" class="form-control form-control-sm" v-model="edu.degree" placeholder="S1 Teknik Informatika" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">Tahun / Periode</label>
                  <input type="text" class="form-control form-control-sm" v-model="edu.period" placeholder="2017 - 2021" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-dark small">IPK / GPA (Opsional)</label>
                  <input type="text" class="form-control form-control-sm" v-model="edu.gpa" placeholder="3.82 / 4.00" />
                </div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- STEP 4: SKILLS, BAHASA & SERTIFIKASI                     -->
          <!-- ======================================================== -->
          <div v-else-if="currentStep === 4">
            <div class="mb-3">
              <label class="form-label fw-bold text-dark small">Technical Skills & Keahlian Utama (Pisahkan dengan Koma)</label>
              <input type="text" class="form-control" :value="currentSkillsString" @input="updateActiveSkills" placeholder="Vue.js 3, TypeScript, Tailwind CSS, Node.js, REST API, Git, Docker" />
              <div class="form-text">Tips: Cantumkan 6-12 kata kunci relevan dengan lowongan yang dituju.</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark small">Kemampuan Bahasa (Pisahkan dengan Koma)</label>
              <input type="text" class="form-control" :value="currentLanguagesString" @input="updateActiveLanguages" placeholder="Bahasa Indonesia (Native), English (Professional Working)" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark small">Sertifikasi, Lisensi & Penghargaan</label>
              <textarea class="form-control" rows="3" :value="currentCertificationsString" @input="updateActiveCertifications" placeholder="• Google Certified Associate Cloud Engineer&#10;• Meta Front-End Developer Specialization&#10;• AWS Certified Solutions Architect"></textarea>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- STEP 5: 36 TEMPLATES + CUSTOM LAYOUT BUILDER             -->
          <!-- ======================================================== -->
          <div v-else-if="currentStep === 5">
            <!-- Layout Mode Switch: Presets vs Custom Studio -->
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <div class="btn-group p-1 bg-light rounded-pill border" role="group">
                <button
                  type="button"
                  class="btn rounded-pill px-3 py-1 fw-bold small"
                  :class="!isCustomModeActive ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'"
                  @click="setTemplateMode(false)"
                >
                  <i class="bi bi-grid-fill me-1"></i> 36 Template Desain
                </button>
                <button
                  type="button"
                  class="btn rounded-pill px-3 py-1 fw-bold small"
                  :class="isCustomModeActive ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'"
                  @click="setTemplateMode(true)"
                >
                  <i class="bi bi-sliders2-vertical me-1"></i> 🛠️ Custom Layout Studio
                </button>
              </div>

              <span class="badge bg-light text-dark border small">
                {{ isCustomModeActive ? 'Mode: Kustom Mandiri' : 'Preset: ' + activeTemplateInfo.name }}
              </span>
            </div>

            <!-- ---------------------------------------------------- -->
            <!-- SUB-VIEW A: 36 PRESET TEMPLATES                      -->
            <!-- ---------------------------------------------------- -->
            <div v-if="!isCustomModeActive">
              <!-- Filter Categories -->
              <div class="d-flex flex-wrap gap-1 mb-3">
                <button
                  v-for="cat in layoutCategories"
                  :key="cat.id"
                  class="btn btn-xs rounded-pill px-2.5 py-1"
                  :class="selectedCategory === cat.id ? 'btn-primary fw-bold' : 'btn-light border text-muted'"
                  @click="selectedCategory = cat.id"
                >
                  {{ cat.name }}
                </button>
              </div>

              <!-- Grid of 20 Layouts -->
              <div class="row g-2.5 mb-4" style="max-height: 380px; overflow-y: auto;">
                <div v-for="tmpl in filteredLayouts" :key="tmpl.id" class="col-6 col-md-4">
                  <div
                    class="card h-100 border-2 rounded-3 text-center p-2.5 cursor-pointer transition-all hover-shadow"
                    :class="activeCv.selectedTemplate === tmpl.id ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light-subtle bg-light'"
                    @click="selectLayoutForActiveCv(tmpl)"
                  >
                    <div class="p-2 rounded mb-2 border bg-white position-relative" :style="{ borderColor: tmpl.color }">
                      <span class="badge rounded-pill position-absolute top-0 end-0 m-1" :style="{ backgroundColor: tmpl.color, color: '#fff', fontSize: '9px' }">
                        {{ tmpl.type }}
                      </span>
                      <i :class="tmpl.icon" class="fs-4 d-block mb-1" :style="{ color: tmpl.color }"></i>
                      <div class="fw-bold text-truncate small" :style="{ color: tmpl.color }">{{ tmpl.name }}</div>
                    </div>
                    <small class="text-muted d-block lh-sm mb-1" style="font-size: 0.72rem;">{{ tmpl.description }}</small>
                    <span class="badge bg-dark rounded-pill small mt-auto" v-if="activeCv.selectedTemplate === tmpl.id">
                      <i class="bi bi-check2 me-0.5"></i> Aktif
                    </span>
                    <span class="badge bg-secondary-subtle text-secondary rounded-pill small mt-auto" v-else>Pilih</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ---------------------------------------------------- -->
            <!-- SUB-VIEW B: CUSTOM LAYOUT BUILDER STUDIO             -->
            <!-- ---------------------------------------------------- -->
            <div v-else class="custom-layout-studio p-3 bg-light rounded-4 border mb-4">
              <div class="alert alert-info py-2 px-3 small mb-3">
                <i class="bi bi-info-circle-fill me-1"></i>
                <strong>Custom Layout Studio:</strong> Atur kolom, urutan bagian, dan posisi elemen CV sesuai preferensi Anda.
              </div>

              <!-- 1. Struktur Kolom -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark small mb-1.5"><i class="bi bi-columns-gap me-1 text-primary"></i>1. Struktur Kolom CV:</label>
                <div class="row g-2">
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-sm w-100 rounded-3 border text-start p-2"
                      :class="activeCustomConfig.columnMode === 'single' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'"
                      @click="activeCustomConfig.columnMode = 'single'"
                    >
                      <i class="bi bi-square-fill me-1"></i> 1 Kolom Penuh (Single)
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-sm w-100 rounded-3 border text-start p-2"
                      :class="activeCustomConfig.columnMode === 'two_column' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'"
                      @click="activeCustomConfig.columnMode = 'two_column'"
                    >
                      <i class="bi bi-layout-split me-1"></i> 2 Kolom (Split Grid)
                    </button>
                  </div>
                </div>
              </div>

              <!-- 2. Pengaturan 2 Kolom (Jika aktif) -->
              <div v-if="activeCustomConfig.columnMode === 'two_column'" class="p-2.5 bg-white rounded-3 border mb-3">
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label text-muted small mb-1" style="font-size: 11px;">Posisi Sidebar:</label>
                    <select class="form-select form-select-sm" v-model="activeCustomConfig.sidebarPosition">
                      <option value="left">Sidebar di Kiri</option>
                      <option value="right">Sidebar di Kanan</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label text-muted small mb-1" style="font-size: 11px;">Rasio Lebar Kolom:</label>
                    <select class="form-select form-select-sm" v-model="activeCustomConfig.sidebarRatio">
                      <option value="30">30% Sidebar : 70% Utama</option>
                      <option value="35">35% Sidebar : 65% Utama</option>
                      <option value="40">40% Sidebar : 60% Utama</option>
                      <option value="50">50% : 50% Simetris</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 3. Header Styling -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark small mb-1.5"><i class="bi bi-card-heading me-1 text-primary"></i>2. Gaya Header & Nama:</label>
                <div class="row g-2">
                  <div class="col-6">
                    <select class="form-select form-select-sm" v-model="activeCustomConfig.headerAlign">
                      <option value="left">Rata Kiri (Standar)</option>
                      <option value="center">Rata Tengah (Center)</option>
                      <option value="right">Rata Kanan</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <div class="form-check form-switch pt-1">
                      <input class="form-check-input" type="checkbox" id="bannerSwitch" v-model="activeCustomConfig.headerBanner" />
                      <label class="form-check-label small fw-semibold" for="bannerSwitch">Banner Warna Penuh</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Reorder & Toggle Sections -->
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1.5">
                  <label class="form-label fw-bold text-dark small mb-0"><i class="bi bi-arrows-vertical me-1 text-primary"></i>3. Urutan & Visibilitas Bagian (Sections):</label>
                  <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-2" @click="resetSectionOrder">Reset Urutan</button>
                </div>

                <div class="d-flex flex-column gap-1.5">
                  <div
                    v-for="(secKey, idx) in activeCustomConfig.mainSections"
                    :key="secKey"
                    class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-white border"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-light text-dark border font-monospace" style="font-size: 10px;">#{{ idx + 1 }}</span>
                      <strong class="small text-dark">{{ getSectionNameLabel(secKey) }}</strong>
                    </div>

                    <div class="d-flex align-items-center gap-1">
                      <!-- Column assignment if 2-col mode -->
                      <select
                        v-if="activeCustomConfig.columnMode === 'two_column'"
                        class="form-select form-select-xs border-0 bg-light py-0 px-1 text-muted"
                        style="font-size: 10px; width: 85px;"
                        :value="isSectionInSidebar(secKey) ? 'sidebar' : 'main'"
                        @change="toggleSectionColumnPlacement(secKey, $event.target.value)"
                      >
                        <option value="main">Utama</option>
                        <option value="sidebar">Sidebar</option>
                      </select>

                      <!-- Move Up -->
                      <button
                        type="button"
                        class="btn btn-xs btn-outline-secondary p-1"
                        style="width: 24px; height: 24px; line-height: 1;"
                        :disabled="idx === 0"
                        @click="moveSectionUp(idx)"
                        title="Geser ke Atas"
                      >
                        <i class="bi bi-chevron-up"></i>
                      </button>

                      <!-- Move Down -->
                      <button
                        type="button"
                        class="btn btn-xs btn-outline-secondary p-1"
                        style="width: 24px; height: 24px; line-height: 1;"
                        :disabled="idx === activeCustomConfig.mainSections.length - 1"
                        @click="moveSectionDown(idx)"
                        title="Geser ke Bawah"
                      >
                        <i class="bi bi-chevron-down"></i>
                      </button>

                      <!-- Visibility Toggle -->
                      <button
                        type="button"
                        class="btn btn-xs p-1"
                        :class="activeCustomConfig.sectionVisibility[secKey] !== false ? 'btn-outline-primary' : 'btn-outline-danger'"
                        style="width: 24px; height: 24px; line-height: 1;"
                        @click="toggleSectionVisibility(secKey)"
                        :title="activeCustomConfig.sectionVisibility[secKey] !== false ? 'Sembunyikan' : 'Tampilkan'"
                      >
                        <i :class="activeCustomConfig.sectionVisibility[secKey] !== false ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. Gaya Heading / Judul Bagian -->
              <div>
                <label class="form-label fw-bold text-dark small mb-1.5"><i class="bi bi-brush me-1 text-primary"></i>4. Gaya Garis / Bingkai Judul Bagian:</label>
                <select class="form-select form-select-sm" v-model="activeHeadingStyle">
                  <option value="underline">Garis Bawah Solid (Underline ATS)</option>
                  <option value="left_bar">Garis Aksen di Kiri (Left Bar)</option>
                  <option value="boxed">Bingkai Kotak Halus (Boxed Frame)</option>
                  <option value="pill">Latar Kapsul Aksen (Pill Badge)</option>
                  <option value="minimal">Minimalis Tanpa Garis (Minimal)</option>
                </select>
              </div>
            </div>

            <!-- Custom Accent Color & Typography Bar -->
            <div class="p-3 bg-light rounded-4 border">
              <h6 class="fw-bold text-dark small mb-2"><i class="bi bi-sliders me-1 text-primary"></i>Kustomisasi Warna Aksen & Tipografi</h6>
              <div class="row g-2 align-items-center">
                <div class="col-md-6">
                  <label class="form-label text-muted small mb-1">Palet Warna Utama:</label>
                  <div class="d-flex flex-wrap gap-1.5 align-items-center">
                    <button
                      v-for="color in presetColors"
                      :key="color"
                      type="button"
                      class="rounded-circle border-0 p-0"
                      :style="{ width: '22px', height: '22px', backgroundColor: color, outline: activeCvColor === color ? '2px solid #000' : 'none' }"
                      @click="setActiveCvColor(color)"
                    ></button>
                    <input type="color" :value="activeCvColor" @input="e => setActiveCvColor(e.target.value)" class="form-control form-control-color form-control-sm p-0 border-0" style="width: 24px; height: 24px;" title="Pilih custom HEX" />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-muted small mb-1">Pilihan Tipografi Font:</label>
                  <select class="form-select form-select-sm" :value="activeCvFont" @change="e => setActiveCvFont(e.target.value)">
                    <option value="font-sans">Modern Sans (Plus Jakarta / Inter)</option>
                    <option value="font-serif">Classic Serif (Merriweather / Georgia)</option>
                    <option value="font-mono">Technical (Fira Code / Roboto Mono)</option>
                    <option value="font-modern">Creative Modern (Outfit / Poppins)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Wizard Controls Footer -->
          <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-4">
            <button class="btn btn-outline-secondary rounded-pill px-4" :disabled="currentStep === 1" @click="currentStep--">
              <i class="bi bi-chevron-left me-1"></i> Sebelumnya
            </button>
            <button class="btn btn-primary rounded-pill px-4 fw-bold" v-if="currentStep < 5" @click="currentStep++">
              Lanjut <i class="bi bi-chevron-right ms-1"></i>
            </button>
            <button class="btn btn-success rounded-pill px-4 fw-bold" v-else @click="saveDraft">
              <i class="bi bi-check-circle me-1"></i> Selesai & Simpan
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Live ATS CV Preview + A4 1-Page Optimizer Controls -->
      <div :class="currentStep > 5 ? 'col-12' : 'col-lg-6'">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 overflow-hidden">
          <!-- Live Preview Header Controls (no-print) -->
          <div class="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-2.5 mb-3 no-print gap-2">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-dark"><i class="bi bi-eye me-1 text-primary"></i> Live ATS CV Preview</span>
              <span class="badge bg-light text-dark border small fw-normal">
                {{ isCustomModeActive ? '🛠️ Custom Studio' : activeTemplateInfo.name }}
              </span>
              <span v-if="cvMode === 'bulk'" class="badge bg-success text-white small">
                Kandidat #{{ activeCandidateIndex + 1 }} dari {{ bulkCandidates.length }}
              </span>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <!-- Candidate Quick Switcher in Bulk Mode -->
              <div v-if="cvMode === 'bulk' && bulkCandidates.length > 1" class="btn-group btn-group-sm me-1">
                <button class="btn btn-outline-secondary" :disabled="activeCandidateIndex <= 0" @click="activeCandidateIndex--">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="btn btn-light border px-2 fw-semibold" style="font-size: 12px;">
                  {{ activeCv.fullName || 'Kandidat ' + (activeCandidateIndex + 1) }}
                </button>
                <button class="btn btn-outline-secondary" :disabled="activeCandidateIndex >= bulkCandidates.length - 1" @click="activeCandidateIndex++">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>

              <button v-if="currentStep > 5" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="currentStep = 1">
                <i class="bi bi-pencil me-1"></i> Edit Form
              </button>

              <!-- Single Candidate Print in Bulk Mode -->
              <button
                v-if="cvMode === 'bulk'"
                class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                :disabled="isPdfLoading"
                @click="printSingleCandidate"
                title="Cetak hanya lembar profil kandidat yang sedang aktif"
              >
                <i class="bi bi-person-badge"></i>
                <span class="d-none d-md-inline">Cetak Kandidat Ini</span>
              </button>

              <!-- Main Print Button -->
              <button
                class="btn btn-sm btn-primary rounded-pill px-3.5 fw-bold shadow-sm d-flex align-items-center gap-1.5"
                :disabled="isPdfLoading"
                @click="cvMode === 'bulk' ? printAllCandidates() : printCurrentMode()"
              >
                <span v-if="isPdfLoading" class="spinner-border spinner-border-sm text-white" role="status"></span>
                <i v-else class="bi bi-printer"></i>
                <span>{{ isPdfLoading ? 'Menyiapkan...' : (cvMode === 'bulk' ? 'Cetak Semua (' + bulkCandidates.length + ' Lembar A4)' : 'Cetak / Buka A4') }}</span>
              </button>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- A4 FIX & PAPER CONFIGURATION TOOLBAR (Surat Generator Style) -->
          <!-- ======================================================== -->
          <div class="p-2.5 bg-light rounded-3 border mb-2.5 no-print">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div class="d-flex flex-wrap align-items-center gap-2">
                <div class="d-flex align-items-center gap-1">
                  <label class="small text-muted fw-bold mb-0" style="font-size: 11.5px;">Ukuran:</label>
                  <select class="form-select form-select-sm border-primary fw-semibold text-primary py-0.5" v-model="cvPaperSize" style="width: auto; font-size: 11.5px;">
                    <option v-for="p in paperSizesList" :key="p.id" :value="p.id">{{ p.name }} ({{ p.widthMm }}×{{ p.heightMm }} mm)</option>
                  </select>
                </div>
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-xs" :class="cvPaperOrientation !== 'landscape' ? 'btn-primary text-white fw-semibold' : 'btn-outline-secondary bg-white'" @click="cvPaperOrientation = 'portrait'" title="Tegak (Portrait) - Standar ATS">
                    <i class="bi bi-file-earmark me-1"></i> Tegak
                  </button>
                  <button type="button" class="btn btn-xs" :class="cvPaperOrientation === 'landscape' ? 'btn-primary text-white fw-semibold' : 'btn-outline-secondary bg-white'" @click="cvPaperOrientation = 'landscape'" title="Mendatar (Landscape)">
                    <i class="bi bi-file-earmark-spreadsheet me-1"></i> Mendatar
                  </button>
                </div>
                <button type="button" class="btn btn-xs" :class="showMarginGuides ? 'btn-info text-white fw-semibold' : 'btn-outline-secondary bg-white'" @click="showMarginGuides = !showMarginGuides" title="Batas Margin Garis Putus-Putus">
                  <i class="bi bi-bounding-box-circles me-1"></i> {{ showMarginGuides ? 'Garis Margin: ON' : 'Garis Margin' }}
                </button>
              </div>

              <!-- A4 Status Meter & Auto-fit -->
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="badge rounded-pill px-2.5 py-1" :class="pageFitStatus.badgeClass" style="font-size: 11px;">
                  <i :class="pageFitStatus.icon" class="me-1"></i> {{ pageFitStatus.label }} (~{{ pageFitStatus.percent }}%)
                </span>
                <button
                  type="button"
                  class="btn btn-xs btn-outline-primary rounded-pill fw-bold px-2.5 py-1"
                  @click="autoFitToOnePage"
                  title="Otomatis sesuaikan skala agar pas 1 halaman A4"
                >
                  <i class="bi bi-magic me-1"></i> ⚡ Auto-Fit 1 Hal A4
                </button>
                <!-- Density Selector -->
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn btn-xs" :class="activeDensityMode === 'comfortable' ? 'btn-primary' : 'btn-light border'" @click="activeDensityMode = 'comfortable'" title="Jarak Lega">Lega</button>
                  <button type="button" class="btn btn-xs" :class="activeDensityMode === 'standard' ? 'btn-primary' : 'btn-light border'" @click="activeDensityMode = 'standard'" title="Jarak Standar">Standar</button>
                  <button type="button" class="btn btn-xs" :class="activeDensityMode === 'compact' ? 'btn-primary' : 'btn-light border'" @click="activeDensityMode = 'compact'" title="Jarak Padat">Padat</button>
                  <button type="button" class="btn btn-xs" :class="activeDensityMode === 'ultra_compact' ? 'btn-primary' : 'btn-light border'" @click="activeDensityMode = 'ultra_compact'" title="Jarak Ultra Padat">Ultra</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Document Info Strip (no-print, Surat Generator Style) -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-1.5 rounded-2 bg-white border mb-3 text-muted no-print shadow-xs" style="font-size: 11.5px;">
            <div>
              <i class="bi bi-aspect-ratio text-primary me-1"></i> <strong>Kertas CV:</strong> {{ (PAPER_SIZES[cvPaperSize] || PAPER_SIZES.a4).name }} ({{ (PAPER_SIZES[cvPaperSize] || PAPER_SIZES.a4).widthMm }} × {{ (PAPER_SIZES[cvPaperSize] || PAPER_SIZES.a4).heightMm }} mm) • {{ cvPaperOrientation === 'landscape' ? 'Mendatar (Landscape)' : 'Tegak (Portrait)' }}
            </div>
            <div>
              <i class="bi bi-check-circle-fill text-success me-1"></i> <strong>Standar ATS:</strong> Format A4 Proporsional • Otomatis Tab Baru & Cetak Bersih
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- RESPONSIVE ZOOM & SCALING TOOLBAR (no-print)             -->
          <!-- ======================================================== -->
          <div class="d-flex flex-wrap justify-content-between align-items-center bg-white p-2 px-2.5 rounded-3 border mb-3 no-print gap-2 shadow-xs">
            <div class="d-flex align-items-center gap-1.5 small text-muted">
              <i class="bi bi-display text-primary"></i>
              <span class="fw-semibold">Skala Pratinjau:</span>
              <span class="badge bg-primary text-white fw-bold px-2 py-0.5" style="font-size: 11px;">
                {{ previewZoom === 'auto' ? '📱 Pas Layar (' + Math.round(activePreviewScale * 100) + '%)' : previewZoom + '%' }}
              </span>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-1.5">
              <div class="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  class="btn btn-xs fw-semibold d-flex align-items-center gap-1"
                  :class="previewZoom === 'auto' ? 'btn-primary' : 'btn-light border'"
                  @click="previewZoom = 'auto'"
                  title="Otomatis sesuaikan skala CV agar pas di layar perangkat Anda (Sangat Cocok untuk HP/Mobile 720x1280)"
                >
                  <i class="bi bi-phone"></i> Pas Layar
                </button>
                <button
                  type="button"
                  class="btn btn-xs fw-semibold"
                  :class="previewZoom === '100' ? 'btn-primary' : 'btn-light border'"
                  @click="previewZoom = '100'"
                  title="Ukuran Asli 100%"
                >
                  100%
                </button>
                <button
                  type="button"
                  class="btn btn-xs fw-semibold"
                  :class="previewZoom === '80' ? 'btn-primary' : 'btn-light border'"
                  @click="previewZoom = '80'"
                >
                  80%
                </button>
                <button
                  type="button"
                  class="btn btn-xs fw-semibold"
                  :class="previewZoom === '65' ? 'btn-primary' : 'btn-light border'"
                  @click="previewZoom = '65'"
                >
                  65%
                </button>
                <button
                  type="button"
                  class="btn btn-xs fw-semibold"
                  :class="previewZoom === '50' ? 'btn-primary' : 'btn-light border'"
                  @click="previewZoom = '50'"
                >
                  50%
                </button>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 1. SINGLE MODE PRINTABLE AREA                            -->
          <!-- ======================================================== -->
          <div
            v-if="cvMode === 'single'"
            id="cvPrintArea"
            ref="previewScrollContainerEl"
            class="cv-preview-container-scroll position-relative"
          >
            <div class="cv-preview-scaler-stage" :style="previewScalerStageStyle">
              <div class="cv-preview-scaler-inner" :style="previewScalerInnerStyle">
                <CvLayoutRenderer
                  ref="singleRendererEl"
                  :cv="cv"
                  :layout-type="isCustomModeActive ? 'custom' : (cv.selectedTemplate || 'single_column')"
                  :active-color="activeCvColor"
                  :cv-font="activeCvFont"
                  :density-mode="activeDensityMode"
                  :heading-style="activeHeadingStyle"
                  :lock-single-page="lockSinglePage"
                  :show-page-guide="showMarginGuides"
                  :custom-layout-config="activeCustomConfig"
                />
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 2. BULK MULTI-CANDIDATE PRINTABLE AREA                   -->
          <!-- ======================================================== -->
          <div
            v-else
            id="cvBulkPrintArea"
            ref="previewScrollContainerEl"
            class="bulk-cv-container cv-preview-container-scroll position-relative"
          >
            <div class="cv-preview-scaler-stage" :style="previewScalerStageStyle">
              <div class="cv-preview-scaler-inner" :style="previewScalerInnerStyle">
                <div
                  v-for="(cand, cIdx) in (isPrintingAll ? bulkCandidates : [activeCv])"
                  :key="cand.id || cIdx"
                  class="print-page-break mb-4"
                >
                  <CvLayoutRenderer
                    :cv="cand"
                    :layout-type="cand.customLayoutActive ? 'custom' : (cand.selectedTemplate || 'single_column')"
                    :active-color="cand.customColor || '#1e293b'"
                    :cv-font="cand.cvFont || 'font-sans'"
                    :density-mode="cand.densityMode || activeDensityMode"
                    :heading-style="cand.headingStyle || activeHeadingStyle"
                    :lock-single-page="lockSinglePage"
                    :show-page-guide="showMarginGuides"
                    :custom-layout-config="cand.customLayoutConfig || activeCustomConfig"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL: BULK CANDIDATES TEXT IMPORTER (no-print)          -->
    <!-- ======================================================== -->
    <div v-if="showBulkImportModal" class="card border-0 shadow-lg rounded-4 p-4 my-4 bg-white border-top border-primary border-4 no-print">
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h5 class="fw-bold mb-0 text-dark">
          <i class="bi bi-clipboard-plus text-primary me-2"></i> Paste Banyak Profil Kandidat (Bulk Importer)
        </h5>
        <button type="button" class="btn-close" @click="showBulkImportModal = false"></button>
      </div>

      <div class="alert alert-info py-2 px-3 small mb-3">
        <div class="fw-bold mb-1"><i class="bi bi-info-circle-fill me-1"></i> Format Baris (Pisahkan dengan tanda pipa <code>|</code> atau koma):</div>
        <code>Nama Lengkap | Posisi / Jabatan | Email | Nomor HP | Kota Domisili | Keahlian Utama (pisahkan koma)</code>
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold text-dark small">Tempel Data Teks Kandidat di Bawah:</label>
        <textarea
          class="form-control font-monospace border-2 rounded-3 small"
          rows="6"
          v-model="bulkImportRawText"
          placeholder="Arif Permana, S.Kom | Software Engineer | arif.permana@email.com | 081234567890 | Jakarta | Vue 3, TypeScript, Node.js&#10;Dwi Retno.R, S.E. | Accountant & Admin | dwiretno.r@email.com | 081398765432 | Jakarta | Financial Reporting, Tax, Excel"
        ></textarea>
      </div>

      <div class="d-flex justify-content-between align-items-center border-top pt-3">
        <button type="button" class="btn btn-outline-secondary rounded-pill px-3" @click="showBulkImportModal = false">Batal</button>
        <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" @click="processBulkImport">
          <i class="bi bi-check2-circle me-1"></i> Tambahkan Profil ke Batch
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import Swal from 'sweetalert2';
import { useStore } from 'vuex';
import { sendOnDeviceNotification } from '../utils/notification';
import { openPrintableDocumentInNewTab, PAPER_SIZES } from '../utils/pdfTabOpener';
import CvLayoutRenderer from '../components/CvLayoutRenderer.vue';

export default {
  name: 'CvBuilderView',
  components: {
    CvLayoutRenderer
  },
  setup() {
    const store = useStore();
    const singleRendererEl = ref(null);
    const previewScrollContainerEl = ref(null);

    const cvMode = ref('single'); // 'single' | 'bulk'
    const isPrintingAll = ref(false);
    const currentStep = ref(1);
    const isSaving = ref(false);
    const selectedCategory = ref('all');
    const customColor = ref('#1e293b');
    const cvFont = ref('font-sans');

    // A4 Single Page Fit & Density State
    const activeDensityMode = ref('standard'); // 'comfortable' | 'standard' | 'compact' | 'ultra_compact'
    const activeHeadingStyle = ref('underline'); // 'underline' | 'boxed' | 'left_bar' | 'pill' | 'minimal'
    const lockSinglePage = ref(false);
    const showPageGuide = ref(true);

    // Paper Configuration (A4 Surat Generator Workflow)
    const paperSizesList = computed(() => Object.values(PAPER_SIZES));
    const cvPaperSize = ref('a4');
    const cvPaperOrientation = ref('portrait');
    const cvMarginTop = ref(8);
    const cvMarginBottom = ref(8);
    const cvMarginLeft = ref(10);
    const cvMarginRight = ref(10);
    const showMarginGuides = ref(false);

    // Mobile & Cross-Device Preview Zoom / Scale Controller
    const previewZoom = ref('auto'); // 'auto' | '100' | '80' | '65' | '50'
    const previewContainerWidth = ref(800);

    const updateContainerWidth = () => {
      if (previewScrollContainerEl.value) {
        previewContainerWidth.value = previewScrollContainerEl.value.clientWidth || 800;
      } else if (typeof window !== 'undefined') {
        previewContainerWidth.value = window.innerWidth < 768 ? (window.innerWidth - 36) : 800;
      }
    };

    let resizeObserver = null;
    onMounted(() => {
      nextTick(() => {
        updateContainerWidth();
      });
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updateContainerWidth, { passive: true });
      }
      if (typeof ResizeObserver !== 'undefined' && previewScrollContainerEl.value) {
        resizeObserver = new ResizeObserver(() => {
          updateContainerWidth();
        });
        resizeObserver.observe(previewScrollContainerEl.value);
      }
    });

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateContainerWidth);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    const activePreviewScale = computed(() => {
      if (previewZoom.value === '100') return 1;
      if (previewZoom.value === '80') return 0.80;
      if (previewZoom.value === '65') return 0.65;
      if (previewZoom.value === '50') return 0.50;

      // 'auto' mode for perfect responsive fit on mobile (720x1280, 360-720px)
      const containerW = previewContainerWidth.value || 800;
      const paddingOffset = (typeof window !== 'undefined' && window.innerWidth < 768) ? 16 : 24;
      const availableW = containerW - paddingOffset;
      if (availableW >= 794) return 1;
      return Math.min(1, Math.max(0.35, availableW / 794));
    });

    const previewScalerInnerStyle = computed(() => {
      const scale = activePreviewScale.value;
      if (scale >= 0.999) {
        return {
          width: '100%',
          maxWidth: '794px',
          margin: '0 auto'
        };
      }
      return {
        width: '794px',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        margin: '0 auto'
      };
    });

    const previewScalerStageStyle = computed(() => {
      const scale = activePreviewScale.value;
      if (scale >= 0.999) {
        return {
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        };
      }
      const approxHeight = 1120;
      return {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: `${Math.round(approxHeight * scale)}px`,
        marginBottom: `-${Math.round(approxHeight * (1 - scale))}px`
      };
    });

    // Custom Layout Studio State
    const isCustomModeActive = ref(false);

    // Bulk Mode State
    const activeCandidateIndex = ref(0);
    const showBulkImportModal = ref(false);
    const bulkImportRawText = ref('');

    // Sample Base64 avatar for instant test
    const sampleAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e2e8f0"/><circle cx="100" cy="80" r="40" fill="%23475569"/><path d="M40 180 C40 135, 160 135, 160 180" fill="%23334155"/></svg>';

    const bulkCandidates = ref([
      {
        id: 'cv_cand_1',
        fullName: 'Arif Permana, S.Kom',
        jobTitle: 'Software Engineer',
        email: 'arif.permana@email.com',
        phone: '081234567890',
        address: 'Jakarta, Indonesia',
        linkedin: 'linkedin.com/in/arifpermana',
        github: 'github.com/arifpermana',
        website: 'arifpermana.dev',
        avatar: sampleAvatar,
        showAvatar: true,
        avatarShape: 'circle',
        avatarSize: 'md',
        avatarPos: 'left',
        summary: 'Software Engineer berdedikasi tinggi dengan pengalaman 4+ tahun dalam merancang dan mengembangkan arsitektur web modern yang scalable, RESTful API, dan sistem full-stack yang andal menggunakan Vue 3, TypeScript, Node.js, dan cloud infrastructure.',
        experience: [
          {
            company: 'PT Solusi Teknologi Nusantara',
            position: 'Senior Software Engineer',
            period: '2022 - Sekarang',
            location: 'Jakarta Selatan',
            description: '• Memimpin perancangan dan implementasi 10+ layanan aplikasi berbasis web yang stabil dan terukur.\n• Mengembangkan REST API berkinerja tinggi serta mengoptimalkan query database hingga meningkatkan respons sistem sebesar 40%.\n• Mengelola arsitektur frontend modern menggunakan Vue 3, TypeScript, dan state management terintegrasi.'
          },
          {
            company: 'PT Inovasi Kode Indonesia',
            position: 'Software Engineer',
            period: '2020 - 2022',
            location: 'Jakarta',
            description: '• Mengembangkan arsitektur backend REST API dan frontend SPA dengan tingkat reliabilitas 99.9%.\n• Berkolaborasi dengan tim produk dan desainer dalam menghadirkan antarmuka pengguna yang intuitif dan responsif.'
          }
        ],
        education: [
          {
            institution: 'Universitas Indonesia',
            degree: 'S1 Teknik Informatika / Ilmu Komputer',
            period: '2016 - 2020',
            gpa: '3.84 / 4.00'
          }
        ],
        skills: ['Vue.js 3', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'RESTful API', 'Docker', 'Git'],
        languages: ['Bahasa Indonesia (Native)', 'English (Professional Working)'],
        certifications: ['Google Cloud Certified Associate Cloud Engineer', 'Meta Front-End Developer Certificate'],
        selectedTemplate: 'ats_clean_1',
        customColor: '#0d6efd',
        cvFont: 'font-sans',
        customLayoutActive: false,
        customLayoutConfig: {
          columnMode: 'single',
          sidebarPosition: 'left',
          sidebarRatio: '30',
          headerAlign: 'left',
          headerBanner: false,
          avatarPos: 'left',
          mainSections: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
          sidebarSections: ['contact', 'skills', 'languages', 'certifications'],
          sectionVisibility: {}
        }
      },
      {
        id: 'cv_cand_2',
        fullName: 'Dwi Retno.R, S.E.',
        jobTitle: 'Accountant & Admin',
        email: 'dwiretno.r@accounting.id',
        phone: '081398765432',
        address: 'Jakarta, Indonesia',
        linkedin: 'linkedin.com/in/dwiretnor',
        github: '',
        website: '',
        avatar: sampleAvatar,
        showAvatar: true,
        avatarShape: 'rounded',
        avatarSize: 'md',
        avatarPos: 'sidebar',
        summary: 'Profesional Akuntan dan Administrasi berpengalaman 5+ tahun dalam pengelolaan pembukuan, penyusunan laporan keuangan komprehensif, rekonsiliasi bank, kepatuhan perpajakan (PPh & PPN), serta efisiensi manajemen operasional administrasi kantor.',
        experience: [
          {
            company: 'PT Global Niaga Perkasa',
            position: 'Senior Accountant & Finance Admin',
            period: '2021 - Sekarang',
            location: 'Jakarta Pusat',
            description: '• Menyusun laporan keuangan bulanan, kuartalan, dan tahunan (Neraca, Laba Rugi, Arus Kas) dengan akurasi 100%.\n• Mengelola rekonsiliasi kas/bank harian dan mengaudit bukti transaksi keuangan operasional perusahaan.\n• Mengurus pelaporan pajak perusahaan (e-Faktur, PPh 21/23, e-SPT) secara tertib dan tepat waktu.'
          },
          {
            company: 'PT Mahakarya Mitra Usaha',
            position: 'Accounting & Administrative Staff',
            period: '2019 - 2021',
            location: 'Jakarta',
            description: '• Memproses invoicing, faktur penjualan, purchase order (PO), dan verifikasi pembayaran tagihan vendor.\n• Mengarsipkan seluruh dokumen keuangan dan administrasi perusahaan secara rapi dan sistematis.'
          }
        ],
        education: [
          {
            institution: 'Universitas Gadjah Mada',
            degree: 'S1 Akuntansi',
            period: '2015 - 2019',
            gpa: '3.80 / 4.00'
          }
        ],
        skills: ['Financial Reporting', 'General Ledger & Journaling', 'Tax Compliance (PPh & PPN)', 'Bank Reconciliation', 'Accurate & SAP', 'Microsoft Excel (Advanced)', 'Office Administration', 'Budgeting'],
        languages: ['Bahasa Indonesia (Native)', 'English (Intermediate / Professional)'],
        certifications: ['Brevet Pajak A & B Terakreditasi', 'Certified Junior Accountant (CJA)'],
        selectedTemplate: 'ats_sidebar_left_3',
        customColor: '#0f766e',
        cvFont: 'font-sans',
        customLayoutActive: false,
        customLayoutConfig: {
          columnMode: 'two_column',
          sidebarPosition: 'left',
          sidebarRatio: '35',
          headerAlign: 'left',
          headerBanner: false,
          avatarPos: 'sidebar',
          mainSections: ['summary', 'experience', 'education'],
          sidebarSections: ['contact', 'skills', 'languages', 'certifications'],
          sectionVisibility: {}
        }
      }
    ]);

    // Single mode primary CV
    const singleCv = ref({
      fullName: 'Arif Permana, S.Kom',
      jobTitle: 'Software Engineer',
      email: 'arif.permana@email.com',
      phone: '081234567890',
      address: 'Jakarta, Indonesia',
      linkedin: 'linkedin.com/in/arifpermana',
      github: 'github.com/arifpermana',
      website: 'arifpermana.dev',
      avatar: sampleAvatar,
      showAvatar: true,
      avatarShape: 'circle',
      avatarSize: 'md',
      avatarPos: 'left',
      summary: 'Software Engineer berdedikasi tinggi dengan pengalaman 4+ tahun dalam merancang dan mengembangkan arsitektur web modern yang scalable, RESTful API, dan sistem full-stack yang andal menggunakan Vue 3, TypeScript, Node.js, dan cloud infrastructure.',
      experience: [
        {
          company: 'PT Solusi Teknologi Nusantara',
          position: 'Senior Software Engineer',
          period: '2022 - Sekarang',
          location: 'Jakarta Selatan',
          description: '• Memimpin perancangan dan implementasi 10+ layanan aplikasi berbasis web yang stabil dan terukur.\n• Mengembangkan REST API berkinerja tinggi serta mengoptimalkan query database hingga meningkatkan respons sistem sebesar 40%.\n• Mengelola arsitektur frontend modern menggunakan Vue 3, TypeScript, dan state management terintegrasi.'
        },
        {
          company: 'PT Inovasi Kode Indonesia',
          position: 'Software Engineer',
          period: '2020 - 2022',
          location: 'Jakarta',
          description: '• Mengembangkan arsitektur backend REST API dan frontend SPA dengan tingkat reliabilitas 99.9%.\n• Berkolaborasi dengan tim produk dan desainer dalam menghadirkan antarmuka pengguna yang intuitif dan responsif.'
        }
      ],
      education: [
        {
          institution: 'Universitas Indonesia',
          degree: 'S1 Teknik Informatika / Ilmu Komputer',
          period: '2016 - 2020',
          gpa: '3.84 / 4.00'
        }
      ],
      skills: ['Vue.js 3', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'RESTful API', 'Docker', 'Git'],
      languages: ['Bahasa Indonesia (Native)', 'English (Professional Working)'],
      certifications: ['Google Cloud Certified Associate Cloud Engineer', 'Meta Front-End Developer Certificate'],
      selectedTemplate: 'ats_clean_1',
      customLayoutActive: false,
      customLayoutConfig: {
        columnMode: 'single',
        sidebarPosition: 'left',
        sidebarRatio: '30',
        headerAlign: 'left',
        headerBanner: false,
        avatarPos: 'left',
        mainSections: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
        sidebarSections: ['contact', 'skills', 'languages', 'certifications'],
        sectionVisibility: {}
      }
    });

    const activeCv = computed(() => {
      if (cvMode.value === 'single') {
        return singleCv.value;
      }
      if (!bulkCandidates.value.length) return singleCv.value;
      if (activeCandidateIndex.value >= bulkCandidates.value.length) {
        return bulkCandidates.value[0];
      }
      return bulkCandidates.value[activeCandidateIndex.value];
    });

    const activeCvColor = computed(() => {
      if (cvMode.value === 'single') return customColor.value;
      return activeCv.value.customColor || customColor.value;
    });

    const activeCvFont = computed(() => {
      if (cvMode.value === 'single') return cvFont.value;
      return activeCv.value.cvFont || cvFont.value;
    });

    const activeCustomConfig = computed(() => {
      if (!activeCv.value.customLayoutConfig) {
        activeCv.value.customLayoutConfig = {
          columnMode: 'single',
          sidebarPosition: 'left',
          sidebarRatio: '30',
          headerAlign: 'left',
          headerBanner: false,
          avatarPos: 'left',
          mainSections: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
          sidebarSections: ['contact', 'skills', 'languages', 'certifications'],
          sectionVisibility: {}
        };
      }
      return activeCv.value.customLayoutConfig;
    });

    const activeAvatarPreviewShapeClass = computed(() => {
      const shape = activeCv.value.avatarShape || 'circle';
      if (shape === 'rounded') return 'rounded-4';
      if (shape === 'square') return 'rounded-1';
      if (shape === 'framed') return 'rounded-3 border border-3';
      return 'rounded-circle';
    });

    const setActiveCvColor = (color) => {
      if (cvMode.value === 'single') {
        customColor.value = color;
      } else {
        activeCv.value.customColor = color;
      }
    };

    const setActiveCvFont = (font) => {
      if (cvMode.value === 'single') {
        cvFont.value = font;
      } else {
        activeCv.value.cvFont = font;
      }
    };

    const setTemplateMode = (customActive) => {
      isCustomModeActive.value = customActive;
      activeCv.value.customLayoutActive = customActive;
    };

    const selectLayoutForActiveCv = (tmpl) => {
      isCustomModeActive.value = false;
      activeCv.value.customLayoutActive = false;
      activeCv.value.selectedTemplate = tmpl.layout || tmpl.id;
      if (tmpl.color) {
        setActiveCvColor(tmpl.color);
      }
    };

    const applyLayoutToAllCandidates = () => {
      const activeTmpl = activeCv.value.selectedTemplate || 'ats_clean_1';
      const activeCol = activeCvColor.value;
      const activeFnt = activeCvFont.value;
      const customAct = isCustomModeActive.value;
      const customCfg = JSON.parse(JSON.stringify(activeCustomConfig.value));

      bulkCandidates.value.forEach(c => {
        c.selectedTemplate = activeTmpl;
        c.customColor = activeCol;
        c.cvFont = activeFnt;
        c.customLayoutActive = customAct;
        c.customLayoutConfig = JSON.parse(JSON.stringify(customCfg));
      });

      Swal.fire({
        icon: 'success',
        title: 'Layout Disinkronkan!',
        text: `Semua ${bulkCandidates.value.length} profil kandidat kini menggunakan layout, warna, dan struktur yang seragam.`,
        timer: 1800,
        showConfirmButton: false
      });
    };

    const steps = [
      { id: 1, name: 'Kontak & Foto', title: '1. Informasi Kontak & Foto Profil' },
      { id: 2, name: 'Pengalaman', title: '2. Pengalaman Kerja' },
      { id: 3, name: 'Pendidikan', title: '3. Riwayat Pendidikan' },
      { id: 4, name: 'Skills & Sertif', title: '4. Keahlian, Bahasa & Sertifikasi' },
      { id: 5, name: '36 Layout & Studio', title: '5. Pilih 36 Layout Desain & Custom Studio' }
    ];

    const layoutCategories = [
      { id: 'all', name: 'Semua (36)' },
      { id: 'single', name: 'Single Column ATS' },
      { id: 'sidebar', name: 'Sidebar & Split' },
      { id: 'executive', name: 'Executive & Finance' },
      { id: 'minimalist', name: 'Minimalist & Academic' },
      { id: 'tech', name: 'Tech, Modern & Creative' }
    ];

    const presetColors = [
      '#1e293b', // Slate Dark
      '#1e3a8a', // Royal Navy
      '#0f766e', // Teal Emerald
      '#7c3aed', // Purple Violet
      '#b91c1c', // Crimson Red
      '#431407', // Warm Walnut
      '#0369a1', // Sky Corporate
      '#059669', // Mint Green
      '#4f46e5', // Indigo Electric
      '#374151', // Charcoal
      '#b45309', // Amber Gold
      '#0d9488'  // Ocean Cyan
    ];

    // 36 Distinct Layout Variations
    const templates = [
      // CATEGORY: Single Column ATS
      {
        id: 'ats_clean_1',
        name: '1. Modern ATS Classic',
        category: 'single',
        type: 'Single Col',
        layout: 'single_column',
        icon: 'bi-file-earmark-text',
        color: '#1e293b',
        description: 'Single column standar ATS global. Sangat mudah dibaca parser recruitment.'
      },
      {
        id: 'ats_slate_5',
        name: '2. Nordic Minimalist Slate',
        category: 'single',
        type: 'Nordic Slate',
        layout: 'single_column',
        icon: 'bi-distribute-vertical',
        color: '#334155',
        description: 'Desain skandinavia bersih dengan pembatas garis halus & spacing rapi.'
      },
      {
        id: 'ats_compact_7',
        name: '3. Compact One-Page Fit',
        category: 'single',
        type: 'Compact 1-Page',
        layout: 'single_column',
        icon: 'bi-arrows-angle-contract',
        color: '#0f172a',
        description: 'Jarak padat teroptimasi khusus CV ringkas 1 lembar tanpa terpotong.'
      },
      {
        id: 'ats_tokyo_clean',
        name: '4. Tokyo Clean Minimal',
        category: 'single',
        type: 'Tokyo Clean',
        layout: 'single_column',
        icon: 'bi-record-circle',
        color: '#27272a',
        description: 'Aksen minimalis Jepang dengan ruang negatif lapang dan bullet bundar halus.'
      },
      {
        id: 'ats_stanford_tech',
        name: '5. Silicon Valley Tech ATS',
        category: 'single',
        type: 'Silicon ATS',
        layout: 'single_column',
        icon: 'bi-cpu',
        color: '#0284c7',
        description: 'Format tech company terverifikasi dengan penekanan pada dampak kuantitatif.'
      },
      {
        id: 'ats_skills_first_13',
        name: '6. Functional Skills-First',
        category: 'single',
        type: 'Functional',
        layout: 'skills_first',
        icon: 'bi-stars',
        color: '#d97706',
        description: 'Menampilkan kompetensi utama dan keahlian di atas sebelum riwayat karir.'
      },
      {
        id: 'ats_timeline_11',
        name: '7. Chronological Timeline Flow',
        category: 'single',
        type: 'Timeline',
        layout: 'timeline_flow',
        icon: 'bi-clock-history',
        color: '#2563eb',
        description: 'Alur kronologis vertikal dengan bullet titik sambung pada pengalaman kerja.'
      },

      // CATEGORY: Sidebar & Split
      {
        id: 'ats_sidebar_left_3',
        name: '8. Split Sidebar Left (30:70)',
        category: 'sidebar',
        type: 'Sidebar 30:70',
        layout: 'sidebar_left',
        icon: 'bi-layout-sidebar-inset',
        color: '#0f766e',
        description: 'Kolom kiri khusus kontak, foto & skills; kolom kanan kronologi karir.'
      },
      {
        id: 'ats_sidebar_right_4',
        name: '9. Split Sidebar Right (70:30)',
        category: 'sidebar',
        type: 'Sidebar 70:30',
        layout: 'sidebar_right',
        icon: 'bi-layout-sidebar-inset-reverse',
        color: '#0369a1',
        description: 'Pengalaman kerja di sisi kiri utama, ringkasan skill di sidebar kanan.'
      },
      {
        id: 'ats_two_tone_16',
        name: '10. Two-Tone Charcoal Sidebar',
        category: 'sidebar',
        type: 'Two-Tone Dark',
        layout: 'two_tone',
        icon: 'bi-circle-half',
        color: '#1e293b',
        description: 'Sidebar kontras solid bernuansa charcoal dengan panel konten putih bersih.'
      },
      {
        id: 'ats_startup_sleek_15',
        name: '11. Startup Indigo Split',
        category: 'sidebar',
        type: 'Startup Split',
        layout: 'sidebar_left',
        icon: 'bi-rocket-takeoff',
        color: '#4f46e5',
        description: 'Desain dinamis ala talenta tech startup dengan badge skill mencolok.'
      },
      {
        id: 'ats_dual_balanced_12',
        name: '12. Balanced 50/50 Dual Column',
        category: 'sidebar',
        type: 'Dual 50:50',
        layout: 'dual_balanced',
        icon: 'bi-layout-split',
        color: '#0d9488',
        description: 'Keseimbangan simetris dua kolom untuk riwayat kerja dan keahlian seimbang.'
      },
      {
        id: 'ats_scandi_split',
        name: '13. Scandinavian Ash Split',
        category: 'sidebar',
        type: 'Scandi Split',
        layout: 'sidebar_left',
        icon: 'bi-symmetry-vertical',
        color: '#475569',
        description: 'Panel sidebar berabu-abu lembut dengan tipografi rapi dan tenang.'
      },
      {
        id: 'ats_teal_corporate_split',
        name: '14. Ocean Teal Corporate Split',
        category: 'sidebar',
        type: 'Teal Corporate',
        layout: 'sidebar_left',
        icon: 'bi-water',
        color: '#0e7490',
        description: 'Sidebar bernuansa samudra teal formal dengan susunan keahlian terstruktur.'
      },
      {
        id: 'ats_engineering_split',
        name: '15. Engineering Frameworks Split',
        category: 'sidebar',
        type: 'Engineering',
        layout: 'sidebar_left',
        icon: 'bi-code-square',
        color: '#15803d',
        description: 'Sidebar khusus pengelompokan stack teknologi, tools, dan metodologi kerja.'
      },

      // CATEGORY: Executive & Finance
      {
        id: 'ats_executive_2',
        name: '16. Executive Navy Horizon',
        category: 'executive',
        type: 'Executive Navy',
        layout: 'single_column',
        icon: 'bi-award',
        color: '#1e3a8a',
        description: 'Header navy mewah dengan border tebal formal untuk posisi manajerial.'
      },
      {
        id: 'ats_emerald_17',
        name: '17. Emerald Consultant Pro',
        category: 'executive',
        type: 'Consultant',
        layout: 'single_column',
        icon: 'bi-gem',
        color: '#047857',
        description: 'Garis aksen hijau emerald formal khusus konsultan & penasihat korporat.'
      },
      {
        id: 'ats_boxed_executive_14',
        name: '18. Boxed Framed Executive',
        category: 'executive',
        type: 'Framed Boxed',
        layout: 'boxed',
        icon: 'bi-bounding-box-circles',
        color: '#334155',
        description: 'Border halus membingkai setiap sub-bagian CV secara terstruktur dan formal.'
      },
      {
        id: 'ats_crimson_director',
        name: '19. Royal Crimson Director',
        category: 'executive',
        type: 'Director Crimson',
        layout: 'single_column',
        icon: 'bi-shield-check',
        color: '#991b1b',
        description: 'Tata letak otoritatif crimson dengan penekanan kepemimpinan divisi.'
      },
      {
        id: 'ats_gold_finance',
        name: '20. Chartered Finance Gold',
        category: 'executive',
        type: 'Finance Gold',
        layout: 'single_column',
        icon: 'bi-cash-coin',
        color: '#b45309',
        description: 'Aksen emas hangat untuk profesional perbankan, akuntansi & investasi.'
      },
      {
        id: 'ats_consulting_mckinsey',
        name: '21. Strategy Advisory McKinsey',
        category: 'executive',
        type: 'Management Pro',
        layout: 'single_column',
        icon: 'bi-briefcase-fill',
        color: '#1e293b',
        description: 'Format konsultasi strategi level atas dengan poin dampak berbasis angka.'
      },
      {
        id: 'ats_healthcare_pro',
        name: '22. Healthcare & Clinical Pro',
        category: 'executive',
        type: 'Clinical / Medical',
        layout: 'single_column',
        icon: 'bi-heart-pulse',
        color: '#0891b2',
        description: 'Struktur medis profesional dengan penempatan STR, lisensi klinis & sertifikasi.'
      },
      {
        id: 'ats_legal_formal',
        name: '23. Legal & Compliance Formal',
        category: 'executive',
        type: 'Legal & Audit',
        layout: 'single_column',
        icon: 'bi-bank',
        color: '#3f3f46',
        description: 'Format formal untuk praktisi hukum, audit, compliance, dan regulasi korporat.'
      },

      // CATEGORY: Minimalist & Academic
      {
        id: 'ats_serif_8',
        name: '24. Harvard Academic Serif',
        category: 'minimalist',
        type: 'Academic Harvard',
        layout: 'single_column',
        icon: 'bi-mortarboard',
        color: '#431407',
        description: 'Tipografi Serif formal tradisional ala universitas ternama & publikasi riset.'
      },
      {
        id: 'ats_editorial_20',
        name: '25. Editorial Modern Serif',
        category: 'minimalist',
        type: 'Editorial Serif',
        layout: 'single_column',
        icon: 'bi-journal-richtext',
        color: '#18181b',
        description: 'Tata letak editorial majalah bisnis dengan hierarki tipografi tinggi.'
      },
      {
        id: 'ats_swiss_10',
        name: '26. Swiss High-Contrast',
        category: 'minimalist',
        type: 'Swiss Grid',
        layout: 'single_column',
        icon: 'bi-grid-1x2',
        color: '#000000',
        description: 'Arsitektur tipografi Swiss dengan kontras kuat dan keterbacaan tinggi.'
      },
      {
        id: 'ats_oxford_research',
        name: '27. Oxford Research Fellow',
        category: 'minimalist',
        type: 'Oxford Academic',
        layout: 'single_column',
        icon: 'bi-book-half',
        color: '#1e1b4b',
        description: 'Penekanan pada publikasi ilmiah, riset akademik, dan gelar formal.'
      },
      {
        id: 'ats_nordic_frost',
        name: '28. Nordic Frost Clean',
        category: 'minimalist',
        type: 'Nordic Frost',
        layout: 'single_column',
        icon: 'bi-snow',
        color: '#3b82f6',
        description: 'Desain sejuk dengan palet slate-blue minimalis bergaris batas halus.'
      },
      {
        id: 'ats_zenith_pure',
        name: '29. Zenith Pure Minimal',
        category: 'minimalist',
        type: 'Zenith Pure',
        layout: 'single_column',
        icon: 'bi-slash-circle',
        color: '#52525b',
        description: 'Tata letak paling murni tanpa ornamen berlebih untuk keterbacaan maksimal.'
      },

      // CATEGORY: Tech, Modern & Creative
      {
        id: 'ats_tech_6',
        name: '30. Tech Developer Emerald',
        category: 'tech',
        type: 'Tech Pro',
        layout: 'single_column',
        icon: 'bi-terminal',
        color: '#059669',
        description: 'Gaya emerald dengan badge keahlian coding & highlight kontribusi proyek.'
      },
      {
        id: 'ats_creative_banner_9',
        name: '31. Creative Accent Banner',
        category: 'tech',
        type: 'Accent Banner',
        layout: 'creative_banner',
        icon: 'bi-palette',
        color: '#7c3aed',
        description: 'Header blok warna modern berlatar kontras dengan isi kartu rapi.'
      },
      {
        id: 'ats_gradient_top_18',
        name: '32. Modern Gradient Horizon',
        category: 'tech',
        type: 'Gradient Horizon',
        layout: 'creative_banner',
        icon: 'bi-rainbow',
        color: '#6366f1',
        description: 'Header bergradasi elegan dengan perataan teks kontak modern.'
      },
      {
        id: 'ats_product_manager',
        name: '33. Modern Product Manager',
        category: 'tech',
        type: 'Product Manager',
        layout: 'single_column',
        icon: 'bi-kanban',
        color: '#2563eb',
        description: 'Penekanan metrik pencapaian produk, kepemimpinan tim & roadmapping.'
      },
      {
        id: 'ats_infographic_19',
        name: '34. Infographic Metrics Pro',
        category: 'tech',
        type: 'Metrics Pro',
        layout: 'dual_balanced',
        icon: 'bi-bar-chart-steps',
        color: '#0284c7',
        description: 'Pill badges dan indikator metrik rapi untuk menonjolkan keahlian teknis.'
      },
      {
        id: 'ats_studio_creative',
        name: '35. Studio Creative Minimal',
        category: 'tech',
        type: 'Studio Design',
        layout: 'creative_banner',
        icon: 'bi-vector-pen',
        color: '#db2777',
        description: 'Aksen fuchsia modern khusus desainer UI/UX, fotografer & industri kreatif.'
      },
      {
        id: 'ats_dark_modern',
        name: '36. Modern Charcoal Pro',
        category: 'tech',
        type: 'Modern Charcoal',
        layout: 'two_tone',
        icon: 'bi-moon-stars',
        color: '#0f172a',
        description: 'Nuansa gelap profesional bergaris tegas untuk insinyur sistem & arsitek cloud.'
      }
    ];

    const filteredLayouts = computed(() => {
      if (selectedCategory.value === 'all') return templates;
      return templates.filter(t => t.category === selectedCategory.value);
    });

    const activeTemplateInfo = computed(() => {
      const tmplId = activeCv.value.selectedTemplate || 'ats_clean_1';
      const found = templates.find(t => t.id === tmplId || t.layout === tmplId);
      return found || templates[0];
    });

    // Real-Time ATS Score Calculator
    const currentAtsScore = computed(() => {
      const data = activeCv.value;
      let score = 0;
      if (data.fullName && data.fullName.length > 3) score += 10;
      if (data.jobTitle) score += 10;
      if (data.email && data.phone) score += 10;
      if (data.summary && data.summary.length > 40) score += 15;
      if (data.experience && data.experience.length >= 1) score += 20;
      if (data.experience && data.experience.length >= 2) score += 5;
      if (data.education && data.education.length >= 1) score += 15;
      if (data.skills && data.skills.length >= 4) score += 15;

      let grade = 'Pemula';
      if (score >= 85) grade = 'Sangat Tinggi (ATS Grade A)';
      else if (score >= 70) grade = 'Baik (ATS Grade B)';
      else if (score >= 50) grade = 'Cukup (ATS Grade C)';

      return { score, grade };
    });

    // Real-Time Page Fit Meter Status
    const pageFitStatus = computed(() => {
      const expCount = (activeCv.value.experience || []).length;
      const eduCount = (activeCv.value.education || []).length;
      const skillCount = (activeCv.value.skills || []).length;
      const hasSummary = !!activeCv.value.summary;
      const hasPhoto = !!(activeCv.value.avatar && activeCv.value.showAvatar !== false);

      // Estimate base height weight points
      let weight = 240; // Base header
      if (hasPhoto) weight += 50;
      if (hasSummary) weight += 120;
      weight += expCount * 145;
      weight += eduCount * 75;
      weight += Math.min(skillCount * 12, 100);

      // Adjust for density
      if (activeDensityMode.value === 'comfortable') weight *= 1.15;
      else if (activeDensityMode.value === 'compact') weight *= 0.84;
      else if (activeDensityMode.value === 'ultra_compact') weight *= 0.72;

      // Target A4 height is ~1123px (usable area ~1020px)
      const percent = Math.min(Math.round((weight / 1020) * 100), 160);

      if (percent <= 95) {
        return {
          percent,
          label: 'Sempurna Pas 1 Halaman A4',
          badgeClass: 'bg-success text-white',
          icon: 'bi-check-circle-fill'
        };
      } else if (percent <= 104) {
        return {
          percent,
          label: 'Hampir Penuh (Optimal)',
          badgeClass: 'bg-primary text-white',
          icon: 'bi-info-circle-fill'
        };
      } else {
        return {
          percent,
          label: `Melebihi 1 Halaman (+${percent - 100}%)`,
          badgeClass: 'bg-warning text-dark',
          icon: 'bi-exclamation-triangle-fill'
        };
      }
    });

    // Auto-Fit 1 Page Magic Function
    const autoFitToOnePage = () => {
      const p = pageFitStatus.value.percent;
      if (p > 105) {
        activeDensityMode.value = 'ultra_compact';
      } else if (p > 95) {
        activeDensityMode.value = 'compact';
      } else {
        activeDensityMode.value = 'standard';
      }

      lockSinglePage.value = true;

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '⚡ Auto-Fit 1 Halaman A4 Diterapkan!',
        text: `Mode kerapatan disetel ke "${activeDensityMode.value.replace('_', ' ').toUpperCase()}" agar pas di 1 lembar.`,
        showConfirmButton: false,
        timer: 2000
      });
    };

    // Custom Section Reordering & Management
    const sectionNamesMap = {
      summary: 'Ringkasan Profil (Summary)',
      experience: 'Pengalaman Kerja (Experience)',
      education: 'Riwayat Pendidikan (Education)',
      skills: 'Keahlian Utama (Skills)',
      languages: 'Kemampuan Bahasa (Languages)',
      certifications: 'Sertifikasi & Lisensi (Certifications)',
      contact: 'Informasi Kontak (Contact Info)'
    };

    const getSectionNameLabel = (key) => sectionNamesMap[key] || key;

    const moveSectionUp = (idx) => {
      if (idx <= 0) return;
      const list = activeCustomConfig.value.mainSections;
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    };

    const moveSectionDown = (idx) => {
      const list = activeCustomConfig.value.mainSections;
      if (idx >= list.length - 1) return;
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    };

    const toggleSectionVisibility = (key) => {
      const vis = activeCustomConfig.value.sectionVisibility;
      vis[key] = vis[key] === false ? true : false;
    };

    const isSectionInSidebar = (key) => {
      const s = activeCustomConfig.value.sidebarSections || [];
      return s.includes(key);
    };

    const toggleSectionColumnPlacement = (key, targetCol) => {
      const cfg = activeCustomConfig.value;
      if (!cfg.sidebarSections) cfg.sidebarSections = [];

      if (targetCol === 'sidebar') {
        if (!cfg.sidebarSections.includes(key)) cfg.sidebarSections.push(key);
      } else {
        cfg.sidebarSections = cfg.sidebarSections.filter(k => k !== key);
      }
    };

    const resetSectionOrder = () => {
      activeCustomConfig.value.mainSections = ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'];
      activeCustomConfig.value.sidebarSections = ['contact', 'skills', 'languages', 'certifications'];
      activeCustomConfig.value.sectionVisibility = {};
    };

    // String Getters & Mutators for Active CV
    const currentSkillsString = computed(() => (activeCv.value.skills || []).join(', '));
    const currentLanguagesString = computed(() => (activeCv.value.languages || []).join(', '));
    const currentCertificationsString = computed(() => (activeCv.value.certifications || []).join('\n'));

    const updateActiveSkills = (e) => {
      activeCv.value.skills = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    };

    const updateActiveLanguages = (e) => {
      activeCv.value.languages = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    };

    const updateActiveCertifications = (e) => {
      activeCv.value.certifications = e.target.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    };

    const addExperience = () => {
      if (!activeCv.value.experience) activeCv.value.experience = [];
      activeCv.value.experience.push({
        company: '',
        position: '',
        period: '',
        location: '',
        description: ''
      });
    };

    const removeExperience = (idx) => {
      activeCv.value.experience.splice(idx, 1);
    };

    const addEducation = () => {
      if (!activeCv.value.education) activeCv.value.education = [];
      activeCv.value.education.push({
        institution: '',
        degree: '',
        period: '',
        gpa: ''
      });
    };

    const removeEducation = (idx) => {
      activeCv.value.education.splice(idx, 1);
    };

    const onAvatarSelected = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        activeCv.value.avatar = evt.target.result;
        activeCv.value.showAvatar = true;
        sendOnDeviceNotification('📸 Foto Profil Terpasang', {
          body: 'Foto berhasil diunggah ke formulir CV Anda.',
          type: 'success'
        });
      };
      reader.readAsDataURL(file);
    };

    const triggerSamplePhoto = () => {
      activeCv.value.avatar = sampleAvatar;
      activeCv.value.showAvatar = true;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Foto Sampel Terpasang!',
        showConfirmButton: false,
        timer: 1500
      });
    };

    // Bulk Management Functions
    const addNewCandidate = () => {
      const nextNum = bulkCandidates.value.length + 1;
      bulkCandidates.value.push({
        id: 'cv_cand_' + Date.now(),
        fullName: 'Kandidat ' + nextNum,
        jobTitle: 'Posisi / Profesi',
        email: 'kandidat' + nextNum + '@email.com',
        phone: '081234567890',
        address: 'Jakarta, Indonesia',
        linkedin: '',
        github: '',
        website: '',
        avatar: sampleAvatar,
        showAvatar: true,
        avatarShape: 'circle',
        avatarSize: 'md',
        summary: 'Rangkuman profesional profil kandidat...',
        experience: [
          {
            company: 'PT Perusahaan Reksa',
            position: 'Staff Profesional',
            period: '2023 - Sekarang',
            location: 'Jakarta',
            description: '• Melaksanakan tanggung jawab operasional dan pencapaian target kerja.'
          }
        ],
        education: [
          {
            institution: 'Universitas Indonesia',
            degree: 'S1 Sarjana',
            period: '2018 - 2022',
            gpa: '3.75'
          }
        ],
        skills: ['Manajemen Kerja', 'Komunikasi', 'Analisis Data', 'Problem Solving'],
        languages: ['Bahasa Indonesia (Native)', 'English (Conversational)'],
        certifications: [],
        selectedTemplate: 'ats_clean_1',
        customColor: '#1e293b',
        cvFont: 'font-sans'
      });
      activeCandidateIndex.value = bulkCandidates.value.length - 1;
    };

    const duplicateActiveCandidate = () => {
      const clone = JSON.parse(JSON.stringify(activeCv.value));
      clone.id = 'cv_cand_' + Date.now();
      clone.fullName = (clone.fullName || 'Kandidat') + ' (Salinan)';
      bulkCandidates.value.push(clone);
      activeCandidateIndex.value = bulkCandidates.value.length - 1;

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Profil Berhasil Diduplikasi!',
        showConfirmButton: false,
        timer: 1500
      });
    };

    const removeCandidate = (idx) => {
      if (bulkCandidates.value.length <= 1) return;
      bulkCandidates.value.splice(idx, 1);
      if (activeCandidateIndex.value >= bulkCandidates.value.length) {
        activeCandidateIndex.value = bulkCandidates.value.length - 1;
      }
    };

    const processBulkImport = () => {
      if (!bulkImportRawText.value.trim()) {
        Swal.fire('Data Kosong', 'Silakan tempel teks daftar kandidat terlebih dahulu.', 'warning');
        return;
      }

      const lines = bulkImportRawText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let added = 0;

      lines.forEach((line, idx) => {
        const parts = line.split(/[|,]+/).map(p => p.trim());
        if (parts.length > 0 && parts[0]) {
          const nextNum = bulkCandidates.value.length + 1;
          const skillsList = parts[5] ? parts[5].split(',').map(s => s.trim()).filter(s => s.length > 0) : ['Komunikasi', 'Kerja Tim', 'Teknis'];

          bulkCandidates.value.push({
            id: 'cv_cand_' + (Date.now() + idx),
            fullName: parts[0] || 'Kandidat ' + nextNum,
            jobTitle: parts[1] || 'Posisi Profesi',
            email: parts[2] || `kandidat${nextNum}@email.com`,
            phone: parts[3] || '081234567890',
            address: parts[4] || 'Indonesia',
            linkedin: '',
            github: '',
            website: '',
            avatar: sampleAvatar,
            showAvatar: true,
            avatarShape: 'circle',
            avatarSize: 'md',
            summary: `Profesional berdedikasi tinggi pada bidang ${parts[1] || 'industri'} dengan rekam jejak kerja yang solid.`,
            experience: [
              {
                company: 'PT Solusi Terpadu',
                position: parts[1] || 'Staff Profesional',
                period: '2022 - Sekarang',
                location: parts[4] || 'Indonesia',
                description: '• Bertanggung jawab atas pengelolaan proyek dan efisiensi operasional tim.'
              }
            ],
            education: [
              {
                institution: 'Perguruan Tinggi Terakreditasi',
                degree: 'Sarjana / S1',
                period: '2017 - 2021',
                gpa: '3.70'
              }
            ],
            skills: skillsList,
            languages: ['Bahasa Indonesia (Native)', 'English (Good)'],
            certifications: [],
            selectedTemplate: 'ats_clean_1',
            customColor: '#1e293b',
            cvFont: 'font-sans'
          });
          added++;
        }
      });

      showBulkImportModal.value = false;
      bulkImportRawText.value = '';

      Swal.fire({
        icon: 'success',
        title: 'Kandidat Ditambahkan!',
        text: `${added} profil baru berhasil dimasukkan ke Batch CV.`
      });
    };

    // Print & PDF New Tab Logic (True A4 Alignment - Surat Generator Workflow)
    const isPdfLoading = ref(false);

    const getCvPrintStyles = () => {
      const paper = PAPER_SIZES[cvPaperSize.value] || PAPER_SIZES.a4;
      const isLandscape = cvPaperOrientation.value === 'landscape';
      const widthMm = isLandscape ? paper.heightMm : paper.widthMm;
      const minHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

      const mTop = cvMarginTop.value ?? 8;
      const mBottom = cvMarginBottom.value ?? 8;
      const mLeft = cvMarginLeft.value ?? 10;
      const mRight = cvMarginRight.value ?? 10;

      return `
        @page {
          size: ${widthMm}mm ${minHeightMm}mm;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-workbench {
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
        }
        .print-container {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          transform: none !important;
        }
        .cv-preview-scaler-stage,
        .cv-preview-scaler-inner {
          transform: none !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
        }
        .cv-paper {
          width: ${widthMm}mm !important;
          max-width: ${widthMm}mm !important;
          min-height: ${minHeightMm}mm !important;
          box-sizing: border-box !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .bulk-print-container > .cv-paper,
        .bulk-cv-container .cv-paper,
        .print-page-break {
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          display: block !important;
          margin: 0 auto !important;
        }
        .bulk-print-container > .cv-paper:last-child,
        .bulk-cv-container .print-page-break:last-child,
        .print-page-break:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        .no-break,
        .cv-section,
        .cv-item,
        .cv-sub-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .a4-cutoff-marker,
        .no-print,
        .print-hide {
          display: none !important;
        }
        .a4-lock-single-page {
          max-height: none !important;
          overflow: visible !important;
        }
      `;
    };

    const printCurrentMode = () => {
      if (isPdfLoading.value) return;
      isPdfLoading.value = true;

      setTimeout(() => {
        const title = `CV_ATS_${singleCv.value.fullName ? singleCv.value.fullName.replace(/\s+/g, '_') : 'Kandidat'}_A4`;
        openPrintableDocumentInNewTab({
          title,
          elementId: 'cvPrintArea',
          customStyles: getCvPrintStyles(),
          autoPrint: true,
          paperSize: cvPaperSize.value || 'a4',
          paperOrientation: cvPaperOrientation.value || 'portrait',
          marginTop: cvMarginTop.value || 8,
          marginBottom: cvMarginBottom.value || 8,
          marginLeft: cvMarginLeft.value || 10,
          marginRight: cvMarginRight.value || 10
        });
        isPdfLoading.value = false;
      }, 350);
    };

    const printSingleCandidate = () => {
      if (isPdfLoading.value) return;
      isPdfLoading.value = true;
      isPrintingAll.value = false;

      setTimeout(() => {
        const name = activeCv.value.fullName ? activeCv.value.fullName.replace(/\s+/g, '_') : `Kandidat_${activeCandidateIndex.value + 1}`;
        const title = `CV_ATS_${name}_A4`;
        openPrintableDocumentInNewTab({
          title,
          elementId: 'cvBulkPrintArea',
          customStyles: getCvPrintStyles(),
          autoPrint: true,
          paperSize: cvPaperSize.value || 'a4',
          paperOrientation: cvPaperOrientation.value || 'portrait',
          marginTop: cvMarginTop.value || 8,
          marginBottom: cvMarginBottom.value || 8,
          marginLeft: cvMarginLeft.value || 10,
          marginRight: cvMarginRight.value || 10
        });
        isPdfLoading.value = false;
      }, 350);
    };

    const printAllCandidates = () => {
      if (isPdfLoading.value) return;
      isPdfLoading.value = true;
      isPrintingAll.value = true;

      setTimeout(() => {
        nextTick(() => {
          const title = `Batch_CV_ATS_${bulkCandidates.value.length}_Kandidat_A4`;
          openPrintableDocumentInNewTab({
            title,
            elementId: 'cvBulkPrintArea',
            customStyles: getCvPrintStyles(),
            autoPrint: true,
            paperSize: cvPaperSize.value || 'a4',
            paperOrientation: cvPaperOrientation.value || 'portrait',
            marginTop: cvMarginTop.value || 8,
            marginBottom: cvMarginBottom.value || 8,
            marginLeft: cvMarginLeft.value || 10,
            marginRight: cvMarginRight.value || 10
          });
          isPrintingAll.value = false;
          isPdfLoading.value = false;
        });
      }, 350);
    };

    const saveDraft = () => {
      if (cvMode.value === 'single') {
        store.dispatch('saveCvData', singleCv.value);
      } else {
        store.dispatch('saveBulkCvList', bulkCandidates.value);
      }
      isSaving.value = true;
      sendOnDeviceNotification('📄 Draft CV Berhasil Disimpan', {
        body: 'Semua profil CV ATS, foto, dan pengaturan layout berhasil disimpan.',
        type: 'success'
      });
      setTimeout(() => {
        isSaving.value = false;
      }, 1500);
    };

    // JSON Export / Import
    const cvJsonInput = ref(null);

    const exportCvJson = () => {
      try {
        const payload = {
          app: 'TaskArts',
          module: 'CvBuilder',
          cvMode: cvMode.value,
          exportDate: new Date().toISOString(),
          singleCv: singleCv.value,
          bulkCandidates: bulkCandidates.value,
          customColor: customColor.value,
          cvFont: cvFont.value,
          activeDensityMode: activeDensityMode.value,
          activeHeadingStyle: activeHeadingStyle.value
        };
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CV_ATS_TaskArts_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Export JSON Berhasil!',
          text: 'Berkas cadangan data CV berhasil diunduh.',
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

    const triggerImportCvJson = () => {
      if (cvJsonInput.value) {
        cvJsonInput.value.value = '';
        cvJsonInput.value.click();
      }
    };

    const onCvJsonSelected = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const incomingCv = parsed.singleCv || parsed.cvData || (parsed.fullName ? parsed : null);

          Swal.fire({
            title: 'Pulihkan Data CV & Batch?',
            html: `
              <div class="text-start p-2 bg-light rounded border mb-2 small">
                <p class="mb-1"><strong>Mode:</strong> ${parsed.bulkCandidates ? 'Batch Multi-Kandidat (' + parsed.bulkCandidates.length + ' Orang)' : 'Single CV'}</p>
                <p class="mb-0"><strong>Nama Utama:</strong> ${incomingCv ? incomingCv.fullName : (parsed.bulkCandidates ? parsed.bulkCandidates[0].fullName : '-')}</p>
              </div>
              <p class="small text-muted mb-0">Apakah Anda ingin memuat data CV ini ke editor?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Muat Data CV',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0d6efd'
          }).then((result) => {
            if (result.isConfirmed) {
              if (incomingCv) {
                singleCv.value = { ...singleCv.value, ...incomingCv };
              }
              if (parsed.bulkCandidates && Array.isArray(parsed.bulkCandidates)) {
                bulkCandidates.value = parsed.bulkCandidates;
              }
              if (parsed.cvMode) cvMode.value = parsed.cvMode;
              if (parsed.customColor) customColor.value = parsed.customColor;
              if (parsed.cvFont) cvFont.value = parsed.cvFont;
              if (parsed.activeDensityMode) activeDensityMode.value = parsed.activeDensityMode;
              if (parsed.activeHeadingStyle) activeHeadingStyle.value = parsed.activeHeadingStyle;

              saveDraft();
              Swal.fire({
                icon: 'success',
                title: 'Data CV Berhasil Dipulihkan!',
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
      cvMode,
      isPrintingAll,
      currentStep,
      isSaving,
      steps,
      layoutCategories,
      selectedCategory,
      presetColors,
      customColor,
      cvFont,
      templates,
      filteredLayouts,
      activeTemplateInfo,
      currentAtsScore,
      cv: singleCv,
      activeCv,
      activeCvColor,
      activeCvFont,
      setActiveCvColor,
      setActiveCvFont,
      selectLayoutForActiveCv,
      applyLayoutToAllCandidates,
      currentSkillsString,
      currentLanguagesString,
      currentCertificationsString,
      updateActiveSkills,
      updateActiveLanguages,
      updateActiveCertifications,
      addExperience,
      removeExperience,
      addEducation,
      removeEducation,
      onAvatarSelected,
      triggerSamplePhoto,
      activeAvatarPreviewShapeClass,
      // Custom Layout Studio State & Methods
      isCustomModeActive,
      setTemplateMode,
      activeCustomConfig,
      activeHeadingStyle,
      getSectionNameLabel,
      moveSectionUp,
      moveSectionDown,
      toggleSectionVisibility,
      isSectionInSidebar,
      toggleSectionColumnPlacement,
      resetSectionOrder,
      // A4 Fit & Density
      activeDensityMode,
      lockSinglePage,
      showPageGuide,
      pageFitStatus,
      autoFitToOnePage,
      singleRendererEl,
      // Paper Configuration (Surat Generator Style)
      PAPER_SIZES,
      paperSizesList,
      cvPaperSize,
      cvPaperOrientation,
      cvMarginTop,
      cvMarginBottom,
      cvMarginLeft,
      cvMarginRight,
      showMarginGuides,
      // Preview Scaler & Zoom State
      previewScrollContainerEl,
      previewZoom,
      activePreviewScale,
      previewScalerStageStyle,
      previewScalerInnerStyle,
      // Bulk State & Methods
      activeCandidateIndex,
      bulkCandidates,
      showBulkImportModal,
      bulkImportRawText,
      addNewCandidate,
      duplicateActiveCandidate,
      removeCandidate,
      processBulkImport,
      isPdfLoading,
      printCurrentMode,
      printSingleCandidate,
      printAllCandidates,
      saveDraft,
      cvJsonInput,
      exportCvJson,
      triggerImportCvJson,
      onCvJsonSelected
    };
  }
};
</script>

<style scoped>
.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}

.btn-xs {
  font-size: 11.5px;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-bg-white-20:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.cv-preview-container-scroll {
  max-height: 86vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding: 8px;
  background-color: #f1f5f9;
  border-radius: 12px;
}

.cv-preview-scaler-stage {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.cv-preview-scaler-inner {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@media screen and (max-width: 768px) {
  .cv-preview-container-scroll {
    padding: 4px;
    max-height: 75vh;
  }
}

@media print {
  .cv-preview-scaler-stage,
  .cv-preview-scaler-inner {
    transform: none !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    min-height: auto !important;
    margin-bottom: 0 !important;
  }

  .no-print,
  .print-hide {
    display: none !important;
  }

  .print-page-break {
    page-break-after: always !important;
    break-after: page !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-page-break:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }
}
</style>
