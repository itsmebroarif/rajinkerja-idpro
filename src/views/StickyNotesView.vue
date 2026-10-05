<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- MODE 1: MAIN LIST VIEW PAGE -->
    <div v-if="activeMode === 'list'">
      <!-- Header Banner -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border header-gradient-banner">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">
              <i class="bi bi-journal-bookmark-fill me-1"></i> TaskArts Notes & Docs
            </span>
            <span class="badge bg-purple-subtle text-purple fw-bold px-3 py-1.5 rounded-pill">
              <i class="bi bi-diagram-3-fill me-1"></i> Mermaid Supported
            </span>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill d-flex align-items-center gap-1">
              <span class="pulse-dot bg-success"></span> Auto-Save Active
            </span>
          </div>
          <h2 class="fw-extrabold mb-1 text-dark">📝 Notes, Scratchpad & Flowchart Docs</h2>
          <p class="text-muted mb-0">Catat ide, sisipkan gambar visual, rancang flowchart Mermaid, dan kelola dokumentasi proyek dengan tersimpan rapi.</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button
            class="btn btn-warning text-dark px-3 py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 border shadow-sm"
            @click="toggleMode('scratchpad')"
          >
            <i class="bi bi-sticky-fill fs-5"></i>
            <span>Quick Scratchpad</span>
          </button>
          <button
            class="btn btn-primary text-white px-3 py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 border shadow-sm"
            @click="toggleMode('editor')"
          >
            <i class="bi bi-pencil-square fs-5"></i>
            <span>Buat Note Baru</span>
          </button>
          <button
            class="btn btn-success text-white px-3 py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 border shadow-sm"
            @click="toggleMode('bulk')"
          >
            <i class="bi bi-ui-checks-grid fs-5"></i>
            <span>Bulk Multi-Form</span>
          </button>
        </div>
      </div>

      <!-- Storage Full Alert Banner -->
      <div v-if="isStorageFullState" class="alert alert-danger rounded-4 shadow-sm border-2 border-danger d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-3 mb-4" role="alert">
        <div class="d-flex align-items-center gap-3">
          <div class="p-2.5 bg-danger text-white rounded-3 fs-4">
            <i class="bi bi-exclamation-octagon-fill"></i>
          </div>
          <div>
            <h6 class="fw-bold text-danger mb-0.5">⚠️ Kapasitas Local Storage Penuh!</h6>
            <p class="small text-dark mb-0">
              Penyimpanan memori browser penuh. Pembuatan catatan baru, update catatan, dan draft otomatis sementara dikunci demi keamanan data.
            </p>
          </div>
        </div>
        <router-link to="/storage" class="btn btn-danger btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm align-self-start align-self-md-center">
          <i class="bi bi-hdd-stack-fill me-1"></i> Buka Menu Storage
        </router-link>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="bg-white p-3 rounded-4 shadow-sm border mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control bg-light border-start-0 ps-0"
                placeholder="Cari judul, kata kunci, gambar, atau diagram..."
                v-model="searchQuery"
              />
              <button v-if="searchQuery" class="btn btn-light border" @click="searchQuery = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="col-md-7 d-flex align-items-center justify-content-md-end gap-2 overflow-auto">
            <span class="small fw-semibold text-muted d-none d-sm-inline">Filter Warna:</span>
            <button
              class="btn btn-sm rounded-pill px-3"
              :class="selectedColor === 'all' ? 'btn-dark' : 'btn-light border'"
              @click="selectedColor = 'all'"
            >
              Semua ({{ notes.length }})
            </button>
            <button
              v-for="c in colorOptions"
              :key="c.code"
              class="btn btn-sm rounded-pill px-2.5 d-flex align-items-center justify-content-center"
              :class="selectedColor === c.code ? 'border-2 border-dark shadow-sm' : 'border'"
              :style="{ backgroundColor: c.code, color: '#000' }"
              :title="c.name"
              :aria-label="c.name"
              @click="selectedColor = c.code"
            >
              <span class="badge bg-white text-dark rounded-pill px-2 py-0.5 fw-bold" style="font-size: 11px;">
                {{ getNotesCountByColor(c.code) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Bulk Selection Toolbar -->
        <div v-if="selectedIds.length > 0" class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center bg-primary-subtle p-2 rounded-3">
          <span class="small fw-bold text-primary">
            <i class="bi bi-check-square-fill me-1"></i> {{ selectedIds.length }} catatan terpilih
          </span>
          <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDeleteSelected">
            <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
          </button>
        </div>
      </div>

      <!-- NOTES GRID -->
      <div class="row g-4" v-if="filteredNotes.length > 0">
        <div v-for="note in filteredNotes" :key="note.id" class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-4 hover-card position-relative sticky-note-card" :style="{ '--note-accent': note.color || '#fef08a' }">
            <div class="note-color-stripe" :style="{ backgroundColor: note.color || '#fef08a' }"></div>
            
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden me-2">
                <input type="checkbox" class="form-check-input mt-0 cursor-pointer" :value="note.id" v-model="selectedIds" />
                <router-link :to="'/notes/' + note.id" class="text-decoration-none text-truncate">
                  <h5 class="fw-bold mb-0 text-truncate hover-title note-card-title">{{ note.title || 'Untitled Note' }}</h5>
                </router-link>
              </div>
              <div class="d-flex gap-1 flex-shrink-0">
                <router-link :to="'/notes/' + note.id" class="btn btn-xs btn-action-icon rounded-circle shadow-sm" title="Buka Detail Full Preview">
                  <i class="bi bi-arrows-angle-expand"></i>
                </router-link>
                <button class="btn btn-xs btn-action-icon rounded-circle shadow-sm" @click="copyNoteContent(note.content)" title="Salin Isi Catatan">
                  <i class="bi bi-clipboard"></i>
                </button>
                <button class="btn btn-xs btn-action-icon rounded-circle shadow-sm" @click="editNoteInline(note)" title="Edit Note">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-xs btn-action-icon text-danger rounded-circle shadow-sm" @click="deleteNoteDirect(note.id)" title="Hapus Note">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>

            <!-- Badges for special content (Mermaid / Images) -->
            <div class="d-flex gap-1.5 mb-2 flex-wrap" v-if="hasMermaid(note.content) || hasImages(note.content)">
              <span v-if="hasMermaid(note.content)" class="badge bg-indigo-subtle text-indigo px-2 py-0.5 rounded-pill font-monospace" style="font-size: 10px;">
                <i class="bi bi-diagram-3 me-1"></i> Flowchart
              </span>
              <span v-if="hasImages(note.content)" class="badge bg-info-subtle text-info-emphasis px-2 py-0.5 rounded-pill font-monospace" style="font-size: 10px;">
                <i class="bi bi-image me-1"></i> Image
              </span>
            </div>

            <!-- Live Rendered Markdown Content with Rich Viewer -->
            <router-link :to="'/notes/' + note.id" class="text-decoration-none d-block">
              <div class="note-card-preview-wrapper flex-grow-1 my-2 border-top border-bottom py-2 overflow-hidden" style="max-height: 220px;">
                <MarkdownViewer :content="getExcerpt(note.content)" />
              </div>
            </router-link>

            <div class="d-flex justify-content-between align-items-center mt-2 pt-2 note-card-footer">
              <span><i class="bi bi-clock me-1"></i>{{ formatDate(note.updatedAt) }}</span>
              <router-link :to="'/notes/' + note.id" class="btn btn-xs btn-preview-badge rounded-pill px-3 py-1 fw-semibold text-decoration-none">
                <i class="bi bi-eye me-1"></i> Buka Detail
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
        <div class="empty-state-icon mb-3">📝</div>
        <h4 class="fw-bold mt-2 text-dark">Belum Ada Catatan</h4>
        <p class="text-muted max-w-md mx-auto">Buat note pertama Anda, sisipkan gambar dokumentasi, rancang diagram alur Mermaid, atau gunakan Bulk Form untuk menambah banyak catatan sekaligus.</p>
        <div class="d-flex justify-content-center gap-2 mt-3">
          <button class="btn btn-primary rounded-3 px-4 py-2 fw-semibold" @click="toggleMode('editor')">
            <i class="bi bi-plus-lg me-1"></i> Buat Note Baru
          </button>
          <button class="btn btn-warning rounded-3 px-4 py-2 fw-semibold text-dark" @click="toggleMode('scratchpad')">
            <i class="bi bi-sticky-fill me-1"></i> Quick Scratchpad
          </button>
        </div>
      </div>
    </div>

    <!-- MODE 2: QUICK SCRATCHPAD FULL PAGE VIEW (HALAMAN BARU) -->
    <div v-else-if="activeMode === 'scratchpad'">
      <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2" @click="activeMode = 'list'">
              <i class="bi bi-arrow-left fs-5"></i>
              <span>Kembali ke Catatan</span>
            </button>
            <div class="border-start ps-3">
              <span class="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-1 rounded-pill mb-1">
                <i class="bi bi-sticky-fill me-1"></i> Halaman Coretan Cepat
              </span>
              <h3 class="fw-extrabold text-dark mb-0">Quick Scratchpad (Auto-Save & Mermaid)</h3>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div
              class="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border small"
              :class="isStorageFullState ? 'bg-danger-subtle text-danger border-danger' : 'bg-light text-dark'"
            >
              <i class="bi" :class="isStorageFullState ? 'bi-exclamation-triangle-fill text-danger' : 'bi-floppy-fill text-success', { 'spin-icon': isAutoSavingScratchpad }"></i>
              <span class="fw-bold">{{ isStorageFullState ? '⚠️ Storage Penuh (Simpan Terkunci)' : scratchpadSaveStatus }}</span>
            </div>
            <button
              type="button"
              class="btn btn-primary rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1 shadow-sm"
              :disabled="isStorageFullState"
              @click="saveScratchpadImmediately"
              title="Simpan coretan sekarang"
            >
              <i class="bi bi-floppy"></i>
              <span>Simpan Scratchpad</span>
            </button>
            <button type="button" class="btn btn-outline-danger rounded-pill px-3 py-1.5 fw-bold" @click="clearScratchpad" v-if="scratchpadContent">
              <i class="bi bi-eraser me-1"></i> Bersihkan
            </button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 border-start border-4 border-warning">
        <!-- Scratchpad Toolbar -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 bg-light rounded-3 border mb-3">
          <div class="d-flex flex-wrap align-items-center gap-1.5">
            <button type="button" class="btn btn-sm btn-white border rounded-2 px-2.5 py-1 fw-bold text-primary" @click="openImageModalFor('scratchpad')">
              <i class="bi bi-image me-1"></i> Sisipkan Gambar
            </button>
            <button type="button" class="btn btn-sm btn-white border rounded-2 px-2.5 py-1 fw-bold text-purple" @click="openMermaidModalFor('scratchpad')">
              <i class="bi bi-diagram-3-fill me-1"></i> Flowchart / Mermaid
            </button>
            <div class="vr mx-1"></div>
            <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToScratchpad('**', '**')" title="Tebal"><i class="bi bi-type-bold"></i></button>
            <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToScratchpad('*', '*')" title="Miring"><i class="bi bi-type-italic"></i></button>
            <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToScratchpad('# ')" title="Heading">H1</button>
            <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToScratchpad('- [ ] ')" title="Checklist"><i class="bi bi-check2-square"></i></button>
          </div>

          <span class="small text-muted font-monospace">{{ (scratchpadContent || '').length }} Karakter | {{ getWordCount(scratchpadContent) }} Kata</span>
        </div>

        <div class="row g-4">
          <div class="col-lg-6">
            <label class="form-label fw-bold text-dark small d-flex justify-content-between align-items-center">
              <span>Tulis Coretan & Markdown (Support Paste Gambar <kbd>Ctrl+V</kbd>)</span>
            </label>
            <textarea
              ref="scratchpadTextarea"
              class="form-control font-monospace border-2 p-3 rounded-3"
              rows="16"
              v-model="scratchpadContent"
              @input="handleScratchpadInput"
              @blur="saveScratchpadImmediately"
              @paste="handlePasteImage($event, 'scratchpad')"
              placeholder="Tulis coretan sementara di sini...&#10;- Ide produk baru&#10;- Screenshot atau gambar (Bisa Ctrl+V langsung di sini!)&#10;- Diagram flowchart Mermaid&#10;&#10;Isi ini tersimpan otomatis tanpa perlu tombol simpan!"
            ></textarea>
          </div>

          <div class="col-lg-6">
            <label class="form-label fw-bold text-dark small">Live Rendered Preview (Markdown, Gambar & Mermaid)</label>
            <div class="card p-4 rounded-3 border-2 bg-light h-100 d-flex flex-column overflow-hidden scratchpad-preview-card">
              <div class="overflow-auto flex-grow-1 p-3 bg-white rounded-3 border scratchpad-preview-inner" style="max-height: 380px;">
                <MarkdownViewer :content="scratchpadContent" />
              </div>
              <div class="border-top pt-3 mt-3 d-flex justify-content-end align-items-center">
                <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" @click="convertScratchpadToNote" v-if="scratchpadContent.trim()">
                  <i class="bi bi-arrow-right-circle me-1"></i> Simpan Jadi Note Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODE 3: EDITOR FULL PAGE VIEW (HALAMAN BARU) -->
    <div v-else-if="activeMode === 'editor'">
      <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2" @click="activeMode = 'list'">
              <i class="bi bi-arrow-left fs-5"></i>
              <span>Kembali ke Catatan</span>
            </button>
            <div class="border-start ps-3">
              <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-1">
                <i class="bi bi-pencil-square me-1"></i> Form Halaman Baru
              </span>
              <h3 class="fw-extrabold text-dark mb-0">{{ isEditing ? 'Edit Note & Diagram' : 'Tulis Note Baru' }}</h3>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span v-if="isStorageFullState" class="badge bg-danger text-white px-3 py-2 rounded-pill fw-bold">
              <i class="bi bi-lock-fill me-1"></i> Storage Penuh
            </span>
            <button type="button" class="btn btn-light border rounded-3 px-3 py-2 fw-semibold" @click="activeMode = 'list'">Batal</button>
            <button
              type="button"
              class="btn rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
              :class="isStorageFullState ? 'btn-secondary opacity-75' : 'btn-primary'"
              @click="saveNote"
            >
              <i class="bi bi-check-circle-fill"></i>
              <span>{{ isEditing ? 'Update Catatan' : 'Simpan Catatan' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
        <form @submit.prevent="saveNote" class="row g-4">
          <div class="col-md-8">
            <label class="form-label fw-bold text-dark fs-6">Judul Catatan / Dokumen <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-lg border-2 fs-5 rounded-3 fw-bold"
              v-model="form.title"
              @input="onFormInput"
              placeholder="Contoh: Arsitektur Sistem, Flowchart Alur & Checklist KPI"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-bold text-dark fs-6">Warna Tema Sticky Note</label>
            <div class="d-flex gap-2 pt-1">
              <button
                type="button"
                v-for="c in colorOptions"
                :key="c.code"
                class="btn rounded-3 p-0 flex-grow-1 color-selector-btn"
                :style="{ backgroundColor: c.code, height: '42px' }"
                :class="{ 'active-color-ring': form.color === c.code }"
                @click="selectColor(c.code)"
                :title="c.name"
              >
                <i v-if="form.color === c.code" class="bi bi-check-lg text-dark fw-bold fs-5"></i>
              </button>
            </div>
          </div>

          <!-- Rich Formatting Toolbar -->
          <div class="col-12">
            <div class="p-2 rounded-3 border bg-light d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div class="d-flex flex-wrap align-items-center gap-1.5">
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2.5 py-1 fw-bold text-primary shadow-xs" @click="openImageModalFor('editor')">
                  <i class="bi bi-image me-1"></i> Sisipkan Gambar
                </button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2.5 py-1 fw-bold text-purple shadow-xs" @click="openMermaidModalFor('editor')">
                  <i class="bi bi-diagram-3-fill me-1"></i> Flowchart / Diagram
                </button>
                <div class="vr mx-1"></div>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('**', '**')" title="Tebal"><i class="bi bi-type-bold"></i></button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('*', '*')" title="Miring"><i class="bi bi-type-italic"></i></button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('# ')" title="Heading 1">H1</button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('## ')" title="Heading 2">H2</button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('> ')" title="Quote"><i class="bi bi-quote"></i></button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('```\n', '\n```')" title="Code Block"><i class="bi bi-code-slash"></i></button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('- ')" title="List"><i class="bi bi-list-ul"></i></button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('- [ ] ')" title="Checklist"><i class="bi bi-check2-square"></i></button>
                <button type="button" class="btn btn-sm btn-white border rounded-2 px-2 py-1" @click="insertTextToEditor('\n| Kolom 1 | Kolom 2 |\n| --- | --- |\n| Data A | Data B |\n')" title="Tabel"><i class="bi bi-table"></i></button>
              </div>

              <span class="small text-muted font-monospace">{{ form.content.length }} Karakter | {{ getWordCount(form.content) }} Kata</span>
            </div>
          </div>

          <!-- Markdown Editor Side-by-Side Live Preview -->
          <div class="col-md-6">
            <label class="form-label fw-bold text-dark small mb-1">
              <i class="bi bi-code-slash text-primary me-1"></i> Editor Markdown (Bisa Paste Gambar <kbd>Ctrl+V</kbd>)
            </label>
            <textarea
              ref="editorTextarea"
              class="form-control font-monospace border-2 p-3 rounded-3"
              rows="16"
              v-model="form.content"
              @input="onFormInput"
              @paste="handlePasteImage($event, 'editor')"
              placeholder="Ketik dengan format Markdown...&#10;# Judul Sesi&#10;- [x] Tugas 1&#10;- [ ] Tugas 2&#10;&#10;Sisipkan gambar atau diagram Mermaid dengan tombol di atas."
            ></textarea>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold text-dark small mb-1"><i class="bi bi-eye-fill text-success me-1"></i> Live Real-time Preview</label>
            <div class="card p-4 rounded-3 border-2 bg-light h-100 overflow-auto preview-box" style="max-height: 420px;">
              <MarkdownViewer :content="form.content" />
            </div>
          </div>

          <div class="col-12 d-flex justify-content-end gap-3 pt-4 border-top">
            <button type="button" class="btn btn-light rounded-3 px-4 py-2.5 fw-semibold border" @click="activeMode = 'list'">Batal</button>
            <button type="submit" class="btn btn-primary rounded-3 px-5 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2 fs-6">
              <i class="bi bi-check-circle-fill"></i>
              <span>{{ isEditing ? 'Update Catatan' : 'Simpan Catatan Baru' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODE 4: BULK MULTI-FORM FULL PAGE VIEW (HALAMAN BARU) -->
    <div v-else-if="activeMode === 'bulk'">
      <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-outline-secondary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2" @click="activeMode = 'list'">
            <i class="bi bi-arrow-left fs-5"></i>
            <span>Kembali ke Catatan</span>
          </button>
          <div class="border-start ps-3">
            <span class="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill mb-1">
              <i class="bi bi-ui-checks-grid me-1"></i> Bulk Input Halaman Baru
            </span>
            <h3 class="fw-extrabold text-dark mb-0">Bulk Form Multi-Input Note</h3>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
        <div class="d-flex gap-2 mb-4 border-bottom pb-3">
          <button
            class="btn rounded-pill px-4 py-2 fw-bold"
            :class="bulkTab === 'rows' ? 'btn-dark' : 'btn-outline-secondary'"
            @click="bulkTab = 'rows'"
          >
            <i class="bi bi-list-task me-1"></i> Multi-Form Builder ({{ bulkRows.length }} Card)
          </button>
          <button
            class="btn rounded-pill px-4 py-2 fw-bold"
            :class="bulkTab === 'paste' ? 'btn-dark' : 'btn-outline-secondary'"
            @click="bulkTab = 'paste'"
          >
            <i class="bi bi-file-earmark-text me-1"></i> Quick Paste Delimited
          </button>
        </div>

        <div v-if="bulkTab === 'rows'">
          <div class="row g-4">
            <div v-for="(row, idx) in bulkRows" :key="idx" class="col-md-6 col-lg-4">
              <div class="card border p-3.5 rounded-4 bg-light position-relative h-100 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge bg-dark text-white rounded-pill px-3 py-1 small fw-bold">Form Note #{{ idx + 1 }}</span>
                  <button
                    type="button"
                    class="btn btn-xs btn-outline-danger border-0 p-1 rounded-circle"
                    @click="removeBulkRow(idx)"
                    v-if="bulkRows.length > 1"
                    title="Hapus baris form ini"
                  >
                    <i class="bi bi-x-circle-fill fs-5"></i>
                  </button>
                </div>

                <input
                  type="text"
                  class="form-control mb-2 fw-bold border-2"
                  v-model="row.title"
                  placeholder="Judul Catatan..."
                />

                <textarea
                  class="form-control mb-3 font-monospace border-2"
                  rows="5"
                  v-model="row.content"
                  placeholder="Isi catatan (Markdown, gambar, diagram supported)..."
                ></textarea>

                <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                  <span class="small fw-semibold text-muted">Warna:</span>
                  <div class="d-flex gap-1.5">
                    <button
                      type="button"
                      v-for="c in colorOptions"
                      :key="c.code"
                      class="btn rounded-circle p-0"
                      :style="{ backgroundColor: c.code, width: '24px', height: '24px' }"
                      :class="{ 'border border-2 border-dark': row.color === c.code }"
                      @click="row.color = c.code"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-4 border-top gap-3">
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary rounded-3 px-3 py-2 fw-bold" @click="addBulkRow">
                <i class="bi bi-plus-lg me-1"></i> Tambah Baris Form
              </button>
              <button class="btn btn-outline-secondary rounded-3 px-3 py-2 fw-bold" @click="addMultipleRows(5)">
                <i class="bi bi-plus-square me-1"></i> +5 Baris Sekaligus
              </button>
            </div>
            <button class="btn btn-success px-5 py-2.5 rounded-3 fw-bold shadow-sm fs-6" @click="saveBulkRows">
              <i class="bi bi-check-all me-1"></i> Simpan Semua Note ({{ validBulkRowsCount }} Valid)
            </button>
          </div>
        </div>

        <div v-else>
          <div class="alert alert-info py-3 px-4 rounded-3 mb-3">
            <i class="bi bi-info-circle-fill me-2"></i><strong>Format paste:</strong> Pisahkan antar catatan menggunakan tanda <code>---</code> pada baris tersendiri. Baris pertama dari setiap blok akan dijadikan Judul.
          </div>
          <textarea
            class="form-control font-monospace border-2 p-3 mb-4 rounded-3"
            rows="10"
            v-model="bulkPasteText"
            placeholder="Judul Catatan 1&#10;- Poin 1&#10;- Poin 2&#10;---&#10;Judul Catatan 2&#10;Isi ringkas catatan kedua..."
          ></textarea>
          <div class="d-flex justify-content-end gap-3">
            <button class="btn btn-light rounded-3 px-4 py-2 border fw-semibold" @click="bulkPasteText = ''">Bersihkan</button>
            <button class="btn btn-success rounded-3 px-5 py-2.5 fw-bold fs-6" @click="processBulkPaste">
              <i class="bi bi-file-earmark-plus me-1"></i> Import & Simpan Catatan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: INSERT IMAGE -->
    <div v-if="imageModal.show" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="card border-0 shadow-lg rounded-4 bg-white p-4 p-md-5" style="max-width: 600px; width: 100%;" @click.stop>
        <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary p-2 rounded-circle"><i class="bi bi-image fs-5"></i></span>
            <h5 class="fw-bold text-dark mb-0">Sisipkan Gambar ke Catatan</h5>
          </div>
          <button class="btn-close" @click="imageModal.show = false"></button>
        </div>

        <div class="d-flex gap-2 mb-3 border-bottom pb-2">
          <button
            class="btn btn-sm rounded-pill px-3 py-1.5 fw-bold"
            :class="imageModal.tab === 'upload' ? 'btn-primary' : 'btn-light border'"
            @click="imageModal.tab = 'upload'"
          >
            <i class="bi bi-upload me-1"></i> Upload File
          </button>
          <button
            class="btn btn-sm rounded-pill px-3 py-1.5 fw-bold"
            :class="imageModal.tab === 'url' ? 'btn-primary' : 'btn-light border'"
            @click="imageModal.tab = 'url'"
          >
            <i class="bi bi-link-45deg me-1"></i> Link URL
          </button>
        </div>

        <!-- Tab Upload -->
        <div v-if="imageModal.tab === 'upload'">
          <div
            class="image-dropzone p-4 text-center rounded-4 border-2 border-dashed bg-light mb-3 cursor-pointer"
            @click="$refs.fileInput.click()"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileSelect" />
            <div v-if="imageModal.preview">
              <img :src="imageModal.preview" class="img-fluid rounded-3 shadow-sm mb-2" style="max-height: 180px; object-fit: contain;" />
              <div class="small text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Gambar siap disisipkan ({{ imageModal.fileSize }})</div>
            </div>
            <div v-else>
              <i class="bi bi-cloud-arrow-up display-5 text-primary opacity-75 d-block mb-2"></i>
              <div class="fw-bold text-dark mb-1">Klik untuk pilih gambar atau tarik file ke sini</div>
              <div class="small text-muted">Format PNG, JPG, WebP, GIF, SVG (Tersimpan rapi secara lokal)</div>
            </div>
          </div>
        </div>

        <!-- Tab URL -->
        <div v-else>
          <div class="mb-3">
            <label class="form-label fw-bold small text-dark">URL Gambar Web</label>
            <input type="url" class="form-control" placeholder="https://images.unsplash.com/photo-..." v-model="imageModal.url" />
          </div>
        </div>

        <!-- Caption Input -->
        <div class="mb-4">
          <label class="form-label fw-bold small text-dark">Deskripsi / Keterangan Gambar (Alt Text)</label>
          <input type="text" class="form-control" placeholder="Contoh: Diagram Alur Database Proyek" v-model="imageModal.caption" />
        </div>

        <div class="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" class="btn btn-light rounded-3 px-4 py-2 border fw-semibold" @click="imageModal.show = false">Batal</button>
          <button type="button" class="btn btn-primary rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2" @click="insertImageToActiveTarget">
            <i class="bi bi-plus-circle-fill"></i>
            <span>Sisipkan Gambar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: INSERT MERMAID DIAGRAM -->
    <div v-if="mermaidModal.show" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="card border-0 shadow-lg rounded-4 bg-white p-4 p-md-5" style="max-width: 850px; width: 100%; max-height: 90vh; overflow-y: auto;" @click.stop>
        <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-purple-subtle text-purple p-2 rounded-circle"><i class="bi bi-diagram-3-fill fs-5"></i></span>
            <div>
              <h5 class="fw-bold text-dark mb-0">Sisipkan Mermaid Flowchart & Diagram</h5>
              <small class="text-muted">Pilih template siap pakai atau sesuaikan sintaks diagram Mermaid Anda.</small>
            </div>
          </div>
          <button class="btn-close" @click="mermaidModal.show = false"></button>
        </div>

        <!-- Template Selector Chips -->
        <div class="mb-3">
          <label class="form-label fw-bold small text-dark mb-1">Pilih Template Diagram:</label>
          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              v-for="preset in mermaidPresets"
              :key="preset.id"
              class="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
              :class="mermaidModal.selectedPreset === preset.id ? 'btn-dark' : 'btn-light border'"
              @click="applyMermaidPreset(preset)"
            >
              <i class="bi" :class="preset.icon"></i>
              <span>{{ preset.title }}</span>
            </button>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <!-- Editor Code -->
          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark"><i class="bi bi-code-square text-primary me-1"></i>Kode Mermaid</label>
            <textarea
              class="form-control font-monospace border-2 p-3 rounded-3"
              rows="12"
              v-model="mermaidModal.code"
              placeholder="```mermaid&#10;flowchart TD&#10;    A --> B&#10;```"
            ></textarea>
          </div>

          <!-- Live Preview -->
          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark"><i class="bi bi-eye-fill text-success me-1"></i>Pratinjau Diagram</label>
            <div class="card p-3 rounded-3 border-2 bg-light h-100 overflow-auto" style="max-height: 320px;">
              <MarkdownViewer :content="mermaidModal.code" />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" class="btn btn-light rounded-3 px-4 py-2 border fw-semibold" @click="mermaidModal.show = false">Batal</button>
          <button type="button" class="btn btn-primary rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2" @click="insertMermaidToActiveTarget">
            <i class="bi bi-check2-circle"></i>
            <span>Sisipkan ke Catatan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sleek Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 2200;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-dark border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import { MERMAID_PRESETS, initMermaid } from '../utils/markdownRenderer';
import { safeSetItem, safeRemoveItem, isStorageFull } from '../utils/storageManager';

const DRAFT_KEY = 'rk_note_draft';
const SCRATCHPAD_KEY = 'rk_quick_scratchpad';

export default {
  name: 'StickyNotesView',
  components: {
    MarkdownViewer
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const isStorageFullState = ref(isStorageFull());
    const updateStorageState = () => {
      isStorageFullState.value = isStorageFull();
    };

    const activeMode = ref('list'); // 'list', 'editor', 'bulk', 'scratchpad'
    const isEditing = ref(false);
    const editingId = ref(null);
    const draftSaved = ref(false);
    const lastSavedTime = ref('');
    const selectedIds = ref([]);

    // Quick Scratchpad Auto-save state
    const scratchpadContent = ref('');
    const scratchpadSaveStatus = ref('Otomatis tersimpan');
    const isAutoSavingScratchpad = ref(false);
    let scratchpadTimer = null;
    let noteDraftTimer = null;

    const editorTextarea = ref(null);
    const scratchpadTextarea = ref(null);

    const toast = ref({ show: false, message: '' });

    const colorOptions = [
      { name: 'Kuning Pastel', code: '#fef08a' },
      { name: 'Biru Langit', code: '#bae6fd' },
      { name: 'Hijau Mint', code: '#bbf7d0' },
      { name: 'Merah Muda', code: '#fbcfe8' },
      { name: 'Ungu Lavender', code: '#e9d5ff' }
    ];

    const form = ref({
      title: '',
      content: '',
      color: '#fef08a'
    });

    // Modals for Image & Mermaid
    const activeTarget = ref('editor'); // 'editor' or 'scratchpad'

    const imageModal = ref({
      show: false,
      tab: 'upload',
      preview: '',
      fileSize: '',
      url: '',
      caption: ''
    });

    const mermaidPresets = MERMAID_PRESETS;
    const mermaidModal = ref({
      show: false,
      selectedPreset: 'flowchart_td',
      code: MERMAID_PRESETS[0].code
    });

    // Bulk rows builder
    const bulkTab = ref('rows'); // 'rows', 'paste'
    const bulkRows = ref([
      { title: '', content: '', color: '#fef08a' },
      { title: '', content: '', color: '#bae6fd' },
      { title: '', content: '', color: '#bbf7d0' }
    ]);
    const bulkPasteText = ref('');

    const searchQuery = ref('');
    const selectedColor = ref('all');

    const notes = computed(() => store.getters.getNotes || []);

    const filteredNotes = computed(() => {
      return notes.value.filter(n => {
        const matchesQuery = !searchQuery.value ||
          (n.title && n.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (n.content && n.content.toLowerCase().includes(searchQuery.value.toLowerCase()));

        const matchesColor = selectedColor.value === 'all' || n.color === selectedColor.value;

        return matchesQuery && matchesColor;
      });
    });

    const showToast = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    onMounted(() => {
      initMermaid();
      window.addEventListener('storage-quota-updated', updateStorageState);
      window.addEventListener('storage-quota-full', updateStorageState);

      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.content) {
            form.value = parsed;
            draftSaved.value = true;
            lastSavedTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
        }

        const savedScratchpad = localStorage.getItem(SCRATCHPAD_KEY);
        if (savedScratchpad !== null) {
          scratchpadContent.value = savedScratchpad;
        } else {
          scratchpadContent.value = '';
        }
      } catch (e) {
        console.error('Failed to load storage:', e);
      }
    });

    onUnmounted(() => {
      window.removeEventListener('storage-quota-updated', updateStorageState);
      window.removeEventListener('storage-quota-full', updateStorageState);
      if (scratchpadTimer) clearTimeout(scratchpadTimer);
      if (noteDraftTimer) clearTimeout(noteDraftTimer);
      saveScratchpadImmediately();
    });

    const saveScratchpadImmediately = () => {
      if (scratchpadTimer) clearTimeout(scratchpadTimer);
      if (isStorageFull()) {
        scratchpadSaveStatus.value = '⚠️ Penyimpanan Penuh';
        isAutoSavingScratchpad.value = false;
        return false;
      }
      const res = safeSetItem(SCRATCHPAD_KEY, scratchpadContent.value);
      if (res.success) {
        const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        scratchpadSaveStatus.value = `Tersimpan ${nowStr}`;
      } else {
        scratchpadSaveStatus.value = '⚠️ ' + (res.error || 'Gagal menyimpan');
      }
      isAutoSavingScratchpad.value = false;
      return res.success;
    };

    const handleScratchpadInput = () => {
      if (isStorageFull()) {
        scratchpadSaveStatus.value = '⚠️ Penyimpanan Penuh (Simpan Terkunci)';
        isAutoSavingScratchpad.value = false;
        return;
      }
      scratchpadSaveStatus.value = 'Menyimpan...';
      isAutoSavingScratchpad.value = true;

      if (scratchpadTimer) clearTimeout(scratchpadTimer);

      scratchpadTimer = setTimeout(() => {
        saveScratchpadImmediately();
      }, 600);
    };

    const clearScratchpad = () => {
      scratchpadContent.value = '';
      safeRemoveItem(SCRATCHPAD_KEY);
      scratchpadSaveStatus.value = 'Scratchpad dibersihkan';
      showToast('Quick Scratchpad berhasil dibersihkan.');
    };

    const convertScratchpadToNote = () => {
      if (!scratchpadContent.value.trim()) return;
      const lines = scratchpadContent.value.split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim() || 'Note dari Scratchpad';
      const content = scratchpadContent.value;

      form.value = {
        title,
        content,
        color: '#fef08a'
      };
      isEditing.value = false;
      activeMode.value = 'editor';
      showToast('Scratchpad dipindahkan ke Editor Note!');
    };

    const onFormInput = () => {
      if (!isEditing.value && !isStorageFull()) {
        if (noteDraftTimer) clearTimeout(noteDraftTimer);
        noteDraftTimer = setTimeout(() => {
          safeSetItem(DRAFT_KEY, form.value);
          draftSaved.value = true;
          lastSavedTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }, 800);
      }
    };

    const toggleMode = (mode) => {
      if (activeMode.value === mode) {
        activeMode.value = 'list';
      } else {
        activeMode.value = mode;
        if (mode === 'editor' && !isEditing.value && !form.value.title && !form.value.content) {
          form.value = {
            title: '',
            content: '# Catatan Proyek & Alur Kerja\n\n- [ ] Checklist tugas 1\n- [ ] Checklist tugas 2\n\n```mermaid\nflowchart TD\n    A[Ide Proyek] --> B[Implementasi]\n    B --> C[Selesai]\n```',
            color: '#fef08a'
          };
        }
      }
    };

    const selectColor = (code) => {
      form.value.color = code;
      onFormInput();
    };

    const editNoteInline = (note) => {
      isEditing.value = true;
      editingId.value = note.id;
      form.value = { ...note };
      activeMode.value = 'editor';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const saveNote = () => {
      if (!form.value.title || !form.value.title.trim()) {
        showToast('Judul catatan tidak boleh kosong.');
        return;
      }

      if (isStorageFull()) {
        Swal.fire({
          icon: 'error',
          title: 'Penyimpanan Penuh!',
          text: 'Tidak dapat menyimpan catatan karena kapasitas Local Storage telah penuh. Silakan buka menu Storage untuk membersihkan cache atau menghapus data yang tidak terpakai.',
          confirmButtonText: 'Buka Menu Storage',
          showCancelButton: true,
          cancelButtonText: 'Tutup'
        }).then((r) => {
          if (r.isConfirmed) {
            router.push('/storage');
          }
        });
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateNote', { ...form.value, id: editingId.value, updatedAt: new Date().toISOString() });
        showToast('Note berhasil diperbarui!');
      } else {
        store.dispatch('addNote', { ...form.value, id: 'note_' + Date.now(), updatedAt: new Date().toISOString() });
        showToast('Note baru berhasil disimpan!');
      }

      safeRemoveItem(DRAFT_KEY);
      draftSaved.value = false;
      form.value = { title: '', content: '', color: '#fef08a' };
      isEditing.value = false;
      editingId.value = null;
      activeMode.value = 'list';
    };

    const deleteNoteDirect = (id) => {
      store.dispatch('deleteNote', id);
      showToast('Catatan berhasil dihapus.');
    };

    const bulkDeleteSelected = () => {
      if (selectedIds.value.length === 0) return;
      store.dispatch('deleteNotesBulk', selectedIds.value);
      showToast(`${selectedIds.value.length} catatan dihapus.`);
      selectedIds.value = [];
    };

    // Bulk Rows
    const addBulkRow = () => {
      const colors = ['#fef08a', '#bae6fd', '#bbf7d0', '#fbcfe8', '#e9d5ff'];
      const nextColor = colors[bulkRows.value.length % colors.length];
      bulkRows.value.push({ title: '', content: '', color: nextColor });
    };

    const addMultipleRows = (count) => {
      for (let i = 0; i < count; i++) {
        addBulkRow();
      }
    };

    const removeBulkRow = (idx) => {
      bulkRows.value.splice(idx, 1);
    };

    const validBulkRowsCount = computed(() => {
      return bulkRows.value.filter(r => r.title && r.title.trim()).length;
    });

    const saveBulkRows = () => {
      const validRows = bulkRows.value.filter(r => r.title && r.title.trim());
      if (validRows.length === 0) {
        showToast('Mohon isi minimal 1 Judul Catatan pada form bulk.');
        return;
      }

      if (isStorageFull()) {
        Swal.fire({
          icon: 'error',
          title: 'Penyimpanan Penuh!',
          text: 'Tidak dapat menyimpan catatan bulk karena kapasitas Local Storage telah penuh. Buka menu Storage untuk mengosongkan ruang.',
          confirmButtonText: 'Buka Menu Storage',
          showCancelButton: true,
          cancelButtonText: 'Tutup'
        }).then((r) => {
          if (r.isConfirmed) {
            router.push('/storage');
          }
        });
        return;
      }

      const now = new Date().toISOString();
      const rowsWithMetadata = validRows.map((r, i) => ({
        ...r,
        id: 'note_' + (Date.now() + i),
        updatedAt: now
      }));

      store.dispatch('addNotesBulk', rowsWithMetadata);
      showToast(`${validRows.length} catatan baru berhasil ditambahkan!`);

      bulkRows.value = [
        { title: '', content: '', color: '#fef08a' },
        { title: '', content: '', color: '#bae6fd' },
        { title: '', content: '', color: '#bbf7d0' }
      ];
      activeMode.value = 'list';
    };

    const processBulkPaste = () => {
      if (!bulkPasteText.value || !bulkPasteText.value.trim()) {
        showToast('Teks paste kosong.');
        return;
      }

      if (isStorageFull()) {
        Swal.fire({
          icon: 'error',
          title: 'Penyimpanan Penuh!',
          text: 'Tidak dapat mengimpor catatan karena kapasitas Local Storage telah penuh.',
          confirmButtonText: 'Buka Menu Storage'
        }).then(() => router.push('/storage'));
        return;
      }

      const blocks = bulkPasteText.value.split(/^---$/m).map(b => b.trim()).filter(b => b.length > 0);
      if (blocks.length === 0) {
        showToast('Format paste tidak valid.');
        return;
      }

      const colors = ['#fef08a', '#bae6fd', '#bbf7d0', '#fbcfe8', '#e9d5ff'];
      const now = new Date().toISOString();
      const notesToInsert = blocks.map((block, idx) => {
        const lines = block.split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim() || `Catatan Import #${idx + 1}`;
        const content = lines.slice(1).join('\n').trim() || lines[0];
        return {
          id: 'note_' + (Date.now() + idx),
          title,
          content,
          color: colors[idx % colors.length],
          updatedAt: now
        };
      });

      store.dispatch('addNotesBulk', notesToInsert);
      showToast(`${notesToInsert.length} catatan berhasil di-import dari paste!`);
      bulkPasteText.value = '';
      activeMode.value = 'list';
    };

    const copyNoteContent = (content) => {
      if (!content) return;
      navigator.clipboard.writeText(content).then(() => {
        showToast('Isi catatan berhasil disalin ke clipboard!');
      }).catch(() => {
        showToast('Gagal menyalin teks.');
      });
    };

    // Image Handlers
    const openImageModalFor = (target) => {
      activeTarget.value = target;
      imageModal.value = {
        show: true,
        tab: 'upload',
        preview: '',
        fileSize: '',
        url: '',
        caption: ''
      };
    };

    const processImageFile = (file) => {
      if (!file || !file.type.startsWith('image/')) {
        showToast('Harap pilih file gambar valid (PNG, JPG, SVG, WebP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        imageModal.value.preview = e.target.result;
        imageModal.value.fileSize = `${(file.size / 1024).toFixed(1)} KB`;
        if (!imageModal.value.caption) {
          imageModal.value.caption = file.name.replace(/\.[^/.]+$/, '');
        }
      };
      reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) processImageFile(file);
    };

    const handleFileDrop = (e) => {
      const file = e.dataTransfer.files[0];
      if (file) processImageFile(file);
    };

    // Direct Clipboard Paste image listener (Ctrl+V with screenshot)
    const handlePasteImage = (e, target) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (item.kind === 'file' && item.type.includes('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            const caption = `Tangkapan Layar ${new Date().toLocaleDateString('id-ID')}`;
            const mdSnippet = `\n![${caption}](${dataUrl})\n`;
            insertSnippetToTarget(target, mdSnippet);
            showToast('📸 Gambar dari clipboard berhasil disisipkan!');
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    const insertImageToActiveTarget = () => {
      let imageSrc = '';
      if (imageModal.value.tab === 'upload') {
        imageSrc = imageModal.value.preview;
      } else {
        imageSrc = imageModal.value.url;
      }

      if (!imageSrc) {
        showToast('Pilih gambar atau masukkan link gambar terlebih dahulu.');
        return;
      }

      const caption = imageModal.value.caption || 'Gambar Catatan';
      const mdSnippet = `\n![${caption}](${imageSrc})\n`;
      insertSnippetToTarget(activeTarget.value, mdSnippet);
      imageModal.value.show = false;
      showToast('Gambar berhasil disisipkan!');
    };

    // Mermaid Handlers
    const openMermaidModalFor = (target) => {
      activeTarget.value = target;
      mermaidModal.value.show = true;
    };

    const applyMermaidPreset = (preset) => {
      mermaidModal.value.selectedPreset = preset.id;
      mermaidModal.value.code = preset.code;
    };

    const insertMermaidToActiveTarget = () => {
      if (!mermaidModal.value.code) return;
      const snippet = `\n${mermaidModal.value.code.trim()}\n`;
      insertSnippetToTarget(activeTarget.value, snippet);
      mermaidModal.value.show = false;
      showToast('Diagram Mermaid berhasil disisipkan!');
    };

    // Text & Snippet Insert Helpers
    const insertSnippetToTarget = (target, snippet) => {
      if (target === 'editor') {
        form.value.content = (form.value.content || '') + snippet;
        onFormInput();
      } else {
        scratchpadContent.value = (scratchpadContent.value || '') + snippet;
        handleScratchpadInput();
      }
    };

    const insertTextToEditor = (prefix, suffix = '') => {
      const el = editorTextarea.value;
      if (!el) {
        form.value.content = (form.value.content || '') + prefix + suffix;
        return;
      }
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const text = form.value.content || '';
      const selected = text.substring(start, end);
      form.value.content = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
      onFormInput();
      nextTick(() => {
        el.focus();
        const pos = start + prefix.length + selected.length;
        el.setSelectionRange(pos, pos);
      });
    };

    const insertTextToScratchpad = (prefix, suffix = '') => {
      const el = scratchpadTextarea.value;
      if (!el) {
        scratchpadContent.value = (scratchpadContent.value || '') + prefix + suffix;
        return;
      }
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const text = scratchpadContent.value || '';
      const selected = text.substring(start, end);
      scratchpadContent.value = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
      handleScratchpadInput();
      nextTick(() => {
        el.focus();
        const pos = start + prefix.length + selected.length;
        el.setSelectionRange(pos, pos);
      });
    };

    // Helpers
    const getExcerpt = (str) => {
      if (!str) return '';
      if (str.length > 350) {
        return str.substring(0, 350) + '\n\n*... Klik untuk membaca selengkapnya ...*';
      }
      return str;
    };

    const hasMermaid = (content) => {
      return content && /```mermaid|flowchart|sequenceDiagram|graph\s+[T|L|B|R]/i.test(content);
    };

    const hasImages = (content) => {
      return content && /!\[.*?\]\(.*?\)/i.test(content);
    };

    const getWordCount = (str) => {
      if (!str) return 0;
      return str.trim().split(/\s+/).filter(Boolean).length;
    };

    const getNotesCountByColor = (colorCode) => {
      return notes.value.filter(n => n.color === colorCode).length;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      notes,
      filteredNotes,
      colorOptions,
      activeMode,
      isEditing,
      form,
      draftSaved,
      lastSavedTime,
      selectedIds,
      toast,
      bulkTab,
      bulkRows,
      bulkPasteText,
      searchQuery,
      selectedColor,
      validBulkRowsCount,
      scratchpadContent,
      scratchpadSaveStatus,
      isAutoSavingScratchpad,
      saveScratchpadImmediately,
      isStorageFullState,
      editorTextarea,
      scratchpadTextarea,
      imageModal,
      mermaidPresets,
      mermaidModal,
      handleScratchpadInput,
      clearScratchpad,
      convertScratchpadToNote,
      toggleMode,
      selectColor,
      onFormInput,
      editNoteInline,
      saveNote,
      deleteNoteDirect,
      bulkDeleteSelected,
      addBulkRow,
      addMultipleRows,
      removeBulkRow,
      saveBulkRows,
      processBulkPaste,
      copyNoteContent,
      openImageModalFor,
      handleFileSelect,
      handleFileDrop,
      handlePasteImage,
      insertImageToActiveTarget,
      openMermaidModalFor,
      applyMermaidPreset,
      insertMermaidToActiveTarget,
      insertTextToEditor,
      insertTextToScratchpad,
      getExcerpt,
      hasMermaid,
      hasImages,
      getWordCount,
      getNotesCountByColor,
      formatDate
    };
  }
};
</script>

<style scoped>
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  animation: pulseDot 1.8s infinite ease-in-out;
}

@keyframes pulseDot {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

.spin-icon {
  animation: spinIcon 1s linear infinite;
}

@keyframes spinIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.color-selector-btn {
  height: 36px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.color-selector-btn:hover {
  transform: translateY(-2px);
}

.active-color-ring {
  border-color: #0f172a !important;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2);
}

.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important;
}

.sticky-note-card {
  background-color: var(--note-accent, #fef08a);
  color: #0f172a;
}

.note-color-stripe {
  height: 6px;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 1rem 1rem 0 0;
}

.note-card-title {
  color: #0f172a;
}

.note-card-preview-wrapper {
  color: #1e293b;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

.note-card-footer {
  font-size: 11px;
  color: #475569;
}

.btn-action-icon {
  background-color: rgba(255, 255, 255, 0.85);
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.1);
  transition: all 0.15s ease;
}

.btn-action-icon:hover {
  background-color: #ffffff;
  color: #2563eb;
}

.btn-preview-badge {
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #0f172a;
  transition: all 0.2s ease;
}

.btn-preview-badge:hover {
  background-color: #0f172a;
  color: #ffffff;
}

.cursor-pointer {
  cursor: pointer;
}

.bg-purple-subtle {
  background-color: #f3e8ff;
}

.text-purple {
  color: #7e22ce;
}

.bg-indigo-subtle {
  background-color: #e0e7ff;
}

.text-indigo {
  color: #4338ca;
}

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2050;
}

.image-dropzone {
  border-color: #cbd5e1;
  transition: all 0.2s ease;
}

.image-dropzone:hover {
  background-color: #f1f5f9;
  border-color: #3b82f6;
}

.shadow-xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.empty-state-icon {
  font-size: 4rem;
}

/* Dark theme overrides */
/* Dark & OLED theme overrides using CSS variables */
:global(.dark-theme) .sticky-note-card,
:global(.dark-mode) .sticky-note-card {
  background-color: var(--bg-surface) !important;
  color: var(--text-main) !important;
  border: 1px solid var(--border-color) !important;
}

:global(.oled-theme) .sticky-note-card {
  background-color: #0d0d0d !important;
  color: #ffffff !important;
  border: 1px solid #27272a !important;
}

:global(.dark-theme) .note-card-title,
:global(.dark-mode) .note-card-title,
:global(.oled-theme) .note-card-title {
  color: #f8fafc !important;
}

:global(.dark-theme) .note-card-preview-wrapper,
:global(.dark-mode) .note-card-preview-wrapper,
:global(.oled-theme) .note-card-preview-wrapper {
  color: #cbd5e1 !important;
  border-color: var(--border-color) !important;
}

:global(.dark-theme) .note-card-preview-wrapper *,
:global(.dark-mode) .note-card-preview-wrapper *,
:global(.oled-theme) .note-card-preview-wrapper * {
  color: #cbd5e1 !important;
}

:global(.dark-theme) .note-card-footer,
:global(.dark-mode) .note-card-footer,
:global(.oled-theme) .note-card-footer {
  color: #94a3b8 !important;
}

:global(.dark-theme) .btn-action-icon,
:global(.dark-mode) .btn-action-icon {
  background-color: var(--bg-input) !important;
  color: #cbd5e1 !important;
  border-color: var(--border-color) !important;
}

:global(.dark-theme) .btn-action-icon:hover,
:global(.dark-mode) .btn-action-icon:hover {
  background-color: var(--bg-hover) !important;
  color: var(--primary-color) !important;
}

:global(.oled-theme) .btn-action-icon {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  border-color: #333333 !important;
}

:global(.oled-theme) .btn-action-icon:hover {
  background-color: #27272a !important;
  color: var(--primary-color) !important;
}

:global(.dark-theme) .btn-preview-badge,
:global(.dark-mode) .btn-preview-badge,
:global(.oled-theme) .btn-preview-badge {
  background-color: var(--bg-input) !important;
  color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:global(.dark-theme) .modal-backdrop-custom .card,
:global(.dark-mode) .modal-backdrop-custom .card {
  background-color: var(--bg-surface) !important;
  color: var(--text-main) !important;
  border: 1px solid var(--border-color) !important;
}

:global(.oled-theme) .modal-backdrop-custom .card {
  background-color: #0d0d0d !important;
  color: #ffffff !important;
  border: 1px solid #27272a !important;
}

/* Scratchpad & Editor dark mode readability */
:global(.dark-theme) .scratchpad-preview-card,
:global(.dark-mode) .scratchpad-preview-card,
:global(.oled-theme) .scratchpad-preview-card,
:global(.dark-theme) .preview-box,
:global(.dark-mode) .preview-box,
:global(.oled-theme) .preview-box {
  background-color: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(.dark-theme) .scratchpad-preview-inner,
:global(.dark-mode) .scratchpad-preview-inner,
:global(.oled-theme) .scratchpad-preview-inner {
  background-color: var(--bg-input) !important;
  border-color: var(--border-color) !important;
  color: #f1f5f9 !important;
}

:global(.dark-theme) textarea.font-monospace,
:global(.dark-mode) textarea.font-monospace,
:global(.oled-theme) textarea.font-monospace {
  background-color: var(--bg-input) !important;
  color: #f8fafc !important;
  border-color: var(--border-color) !important;
  caret-color: var(--primary-color) !important;
}

:global(.dark-theme) .text-purple,
:global(.dark-mode) .text-purple,
:global(.oled-theme) .text-purple {
  color: #c084fc !important;
}

:global(.dark-theme) .text-indigo,
:global(.dark-mode) .text-indigo,
:global(.oled-theme) .text-indigo {
  color: #a5b4fc !important;
}

:global(.dark-theme) .bg-purple-subtle,
:global(.dark-mode) .bg-purple-subtle,
:global(.oled-theme) .bg-purple-subtle {
  background-color: rgba(168, 85, 247, 0.2) !important;
  color: #d8b4fe !important;
}

:global(.dark-theme) .bg-indigo-subtle,
:global(.dark-mode) .bg-indigo-subtle,
:global(.oled-theme) .bg-indigo-subtle {
  background-color: rgba(99, 102, 241, 0.2) !important;
  color: #c7d2fe !important;
}
</style>
