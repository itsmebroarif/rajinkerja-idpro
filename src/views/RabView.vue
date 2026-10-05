<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- TOP HEADER BANNER (NO-PRINT) -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border no-print">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1.5 rounded-pill">
            <i class="bi bi-calculator-fill me-1"></i> Rencana Anggaran Biaya (RAB)
          </span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
          <span class="badge bg-success text-white fw-bold px-3 py-1.5 rounded-pill shadow-sm">
            Clean 0 Rp Start State
          </span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">RAB & Kas Kegiatan (Management Anggaran)</h2>
        <p class="text-muted mb-0">Kelola estimasi biaya, alokasi dana income, realisasi pengeluaran, serta ekspor laporan resmi ke Excel & PDF.</p>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button class="btn btn-outline-primary px-3 py-2 rounded-3 fw-semibold" @click="triggerLoadSampleData">
          <i class="bi bi-magic me-1"></i> Load Contoh Data
        </button>
        <button class="btn btn-outline-warning text-dark px-3 py-2 rounded-3 fw-semibold shadow-xs" @click="exportRabJson" title="Backup data RAB ke berkas JSON">
          <i class="bi bi-filetype-json text-warning me-1"></i> Backup JSON
        </button>
        <button class="btn btn-outline-info text-dark px-3 py-2 rounded-3 fw-semibold shadow-xs" @click="triggerRabJsonImport" title="Pulihkan data RAB dari berkas JSON">
          <i class="bi bi-cloud-arrow-up-fill text-info me-1"></i> Recovery / Import JSON
        </button>
        <input type="file" ref="rabJsonFileInput" accept=".json,application/json" class="d-none" @change="onRabJsonFileSelected" />
        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel (.xlsx)
        </button>
        <button class="btn btn-outline-dark px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-1.5" :disabled="isPdfLoading" @click="exportToPdf">
          <span v-if="isPdfLoading" class="spinner-border spinner-border-sm text-danger" role="status"></span>
          <i v-else class="bi bi-file-earmark-pdf-fill text-danger"></i>
          <span>{{ isPdfLoading ? 'Menyiapkan Laporan...' : 'Buka PDF di Tab Baru' }}</span>
        </button>
        <button class="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm" @click="openForm('rab')">
          <i class="bi bi-plus-circle-fill me-1"></i> + Tambah Item RAB
        </button>
      </div>
    </div>

    <!-- PRINT HEADER (Only visible when printing / generating PDF) -->
    <div class="print-only mb-4">
      <div class="text-center mb-3">
        <h2 class="fw-bold text-uppercase mb-1" style="letter-spacing: 1px;">LAPORAN RENCANA ANGGARAN BIAYA & KAS KEGIATAN</h2>
        <p class="mb-0 text-secondary fw-semibold">Dokumen Anggaran Resmi • Tanggal Cetak: {{ exporterMeta.tanggalCetak || formattedToday }}</p>
        <hr class="my-3 border-2 border-dark" />
      </div>

      <!-- Exporter Info Metadata Box in Print -->
      <div class="row g-2 mb-3 p-3 bg-light rounded border text-dark small">
        <div class="col-6">
          <div><strong>Exported By (Diajukan Oleh):</strong> {{ exporterMeta.namaExporter || 'Arip (Bendahara)' }}</div>
          <div><strong>Jabatan Exporter:</strong> {{ exporterMeta.jabatanExporter || 'Bendahara / Pengelola RAB' }}</div>
        </div>
        <div class="col-6 text-end">
          <div><strong>Disetujui Oleh:</strong> {{ exporterMeta.namaPenyetuju || 'Ketua Panitia / Manajer Proyek' }}</div>
          <div><strong>Lokasi & Tanggal:</strong> {{ exporterMeta.lokasiTanggal || 'Jakarta, ' + formattedToday }}</div>
        </div>
      </div>
    </div>

    <!-- METRIC CARDS SUMMARY -->
    <div class="row g-3 mb-4">
      <!-- 1. Total RAB (Target) -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-4 border-primary">
          <div class="card-body p-3.5">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-bold text-uppercase tracking-wider">Total Target RAB</span>
              <div class="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                <i class="bi bi-calculator fs-5"></i>
              </div>
            </div>
            <h3 class="fw-black mb-1 text-primary">Rp {{ formatRupiah(totalRabAmount) }}</h3>
            <span class="small text-muted">{{ rabItems.length }} Item Anggaran Terdaftar</span>
          </div>
        </div>
      </div>

      <!-- 2. Total Income (Alokasi Dana Masuk) -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-4 border-success">
          <div class="card-body p-3.5">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-bold text-uppercase tracking-wider">Total Income (Dana)</span>
              <div class="p-2 bg-success bg-opacity-10 text-success rounded-3">
                <i class="bi bi-arrow-down-left-circle-fill fs-5"></i>
              </div>
            </div>
            <h3 class="fw-black mb-1 text-success">Rp {{ formatRupiah(totalRabIncome) }}</h3>
            <span class="small text-muted">Dana Masuk / Teralokasi</span>
          </div>
        </div>
      </div>

      <!-- 3. Total Realisasi Pengeluaran -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-4 border-danger">
          <div class="card-body p-3.5">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-bold text-uppercase tracking-wider">Realisasi Belanja</span>
              <div class="p-2 bg-danger bg-opacity-10 text-danger rounded-3">
                <i class="bi bi-cart-check-fill fs-5"></i>
              </div>
            </div>
            <h3 class="fw-black mb-1 text-danger">Rp {{ formatRupiah(totalRabExpense) }}</h3>
            <span class="small text-muted">{{ rabExpenses.length }} Transaksi Belanja Realisasi</span>
          </div>
        </div>
      </div>

      <!-- 4. Sisa Uang Kas / Surplus -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div
          class="card border-0 shadow-sm rounded-4 h-100 text-white"
          :class="sisaRabAktual >= 0 ? 'bg-gradient-success' : 'bg-gradient-danger'"
        >
          <div class="card-body p-3.5">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-white text-opacity-85 small fw-bold text-uppercase tracking-wider">Saldo Uang Kas</span>
              <div class="p-2 bg-white bg-opacity-20 text-white rounded-3">
                <i class="bi bi-wallet-fill fs-5"></i>
              </div>
            </div>
            <h3 class="fw-black mb-1">Rp {{ formatRupiah(sisaRabAktual) }}</h3>
            <div class="small text-white text-opacity-85 d-flex justify-content-between">
              <span>Selisih RAB vs Belanja:</span>
              <span class="fw-bold">
                {{ selisihRabVsExpense >= 0 ? '+' : '-' }} Rp {{ formatRupiah(Math.abs(selisihRabVsExpense)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EXPORTER CONFIGURATION BAR (NO-PRINT) -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white no-print">
      <div class="row g-3 align-items-center">
        <div class="col-12 col-md-3">
          <label class="form-label fw-bold small text-muted mb-1"><i class="bi bi-person-badge me-1"></i> Exported By (Nama Exporter)</label>
          <input type="text" class="form-control form-control-sm rounded-3" v-model="exporterMeta.namaExporter" placeholder="Masukkan nama Anda..." />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label fw-bold small text-muted mb-1"><i class="bi bi-briefcase me-1"></i> Jabatan Exporter</label>
          <input type="text" class="form-control form-control-sm rounded-3" v-model="exporterMeta.jabatanExporter" placeholder="Contoh: Bendahara / Financial Coordinator" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label fw-bold small text-muted mb-1"><i class="bi bi-person-check me-1"></i> Mengetahui / Disetujui Oleh</label>
          <input type="text" class="form-control form-control-sm rounded-3" v-model="exporterMeta.namaPenyetuju" placeholder="Contoh: Ketua Panitia / Manajer Proyek" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label fw-bold small text-muted mb-1"><i class="bi bi-geo-alt me-1"></i> Lokasi & Tanggal Dokumen</label>
          <input type="text" class="form-control form-control-sm rounded-3" v-model="exporterMeta.lokasiTanggal" placeholder="Contoh: Jakarta, 8 Agustus 2026" />
        </div>
      </div>
    </div>

    <!-- IN-PAGE FORM SECTION (TERPISAH, TANPA MODAL) -->
    <div v-if="showForm" id="inPageFormCard" class="card border-0 shadow rounded-4 p-4 mb-4 bg-white border-top border-4" :class="formBorderClass">
      <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
        <h5 class="fw-bold mb-0 text-dark">
          <i :class="formIcon" class="me-2"></i> {{ formTitle }}
        </h5>
        <button type="button" class="btn btn-sm btn-outline-secondary rounded-circle" @click="closeForm" title="Tutup Form">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- FORM 1: ITEM RAB -->
      <form v-if="formType === 'rab'" @submit.prevent="saveRabItem">
        <div class="row g-3">
          <div class="col-12 col-md-8">
            <label class="form-label fw-semibold">Nama Item Kegiatan / Pengadaan <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="rabForm.nama_item" placeholder="Contoh: Sewa Peralatan Stage & Sound" required />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">Status Anggaran <span class="text-danger">*</span></label>
            <select class="form-select" v-model="rabForm.status" required>
              <option value="Rencana">Rencana</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Proses Belanja">Proses Belanja</option>
              <option value="Lunas / Terbayar">Lunas / Terbayar</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Deskripsi Barang / Catatan Spesifikasi</label>
            <textarea class="form-control" rows="2" v-model="rabForm.catatan" placeholder="Masukkan rincian deskripsi barang, vendor, atau catatan pendukung"></textarea>
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label fw-semibold">Jumlah (Qty) <span class="text-danger">*</span></label>
            <input type="number" min="1" class="form-control" v-model.number="rabForm.qty" required />
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label fw-semibold">Satuan <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="rabForm.satuan" placeholder="pcs / unit / porsi / paket" required />
          </div>

          <div class="col-12 col-md-3">
            <label class="form-label fw-semibold">Harga Satuan (Rp) <span class="text-danger">*</span></label>
            <input type="number" min="0" class="form-control font-monospace fw-semibold" v-model.number="rabForm.harga_satuan" placeholder="0" required />
          </div>

          <div class="col-12 col-md-3">
            <label class="form-label fw-semibold">Harga Total (Otomatis)</label>
            <div class="form-control bg-light font-monospace fw-bold text-primary">
              Rp {{ formatRupiah((rabForm.qty || 0) * (rabForm.harga_satuan || 0)) }}
            </div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Income / Dana Alokasi Item (Rp)</label>
            <input type="number" min="0" class="form-control font-monospace text-success fw-semibold" v-model.number="rabForm.income" placeholder="0 jika belum ada" />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Tanggal Transaksi / Rencana <span class="text-danger">*</span></label>
            <input type="date" class="form-control" v-model="rabForm.tanggal" required />
          </div>

          <div class="col-12 text-end pt-3 border-top">
            <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="closeForm">Batal</button>
            <button type="submit" class="btn btn-primary px-4 rounded-3 fw-bold">Simpan Item RAB</button>
          </div>
        </div>
      </form>

      <!-- FORM 2: INCOME / PEMASUKAN -->
      <form v-else-if="formType === 'income'" @submit.prevent="saveIncome">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Sumber Dana / Donatur <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="incomeForm.sumber_dana" placeholder="Contoh: Sponsor PT Mitra Bersama, Kas Utama" required />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Tanggal Terima <span class="text-danger">*</span></label>
            <input type="date" class="form-control" v-model="incomeForm.tanggal" required />
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Nominal Pemasukan (Rp) <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text bg-light fw-bold">Rp</span>
              <input type="number" min="1" class="form-control fw-bold fs-5 text-success font-monospace" v-model.number="incomeForm.nominal" placeholder="0" required />
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Keterangan Catatan</label>
            <textarea class="form-control" rows="2" v-model="incomeForm.keterangan" placeholder="Kuitansi #102 / Bukti transfer donatur"></textarea>
          </div>

          <div class="col-12 text-end pt-3 border-top">
            <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="closeForm">Batal</button>
            <button type="submit" class="btn btn-success px-4 rounded-3 fw-bold">Simpan Pemasukan</button>
          </div>
        </div>
      </form>

      <!-- FORM 3: EXPENSE / PENGELUARAN REALISASI -->
      <form v-else-if="formType === 'expense'" @submit.prevent="saveExpense">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label fw-semibold">Hubungkan dengan Item RAB</label>
            <select class="form-select" v-model="expenseForm.rab_item_id" @change="onSelectRabItem">
              <option :value="null">-- Non-RAB / Pengeluaran Tak Terduga --</option>
              <option v-for="item in rabItems" :key="item.id" :value="item.id">
                {{ item.nama_item }} (Target RAB: Rp {{ formatRupiah(item.total) }})
              </option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Deskripsi Belanja Realisasi <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="expenseForm.deskripsi" placeholder="Contoh: Pembayaran DP Tempat Lapangan" required />
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label fw-semibold">Jumlah (Qty) <span class="text-danger">*</span></label>
            <input type="number" min="1" class="form-control" v-model.number="expenseForm.qty" required />
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label fw-semibold">Harga Satuan (Rp) <span class="text-danger">*</span></label>
            <input type="number" min="0" class="form-control font-monospace" v-model.number="expenseForm.harga_satuan" required />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">Tanggal Nota <span class="text-danger">*</span></label>
            <input type="date" class="form-control" v-model="expenseForm.tanggal" required />
          </div>

          <div class="col-12">
            <div class="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <span class="fw-bold text-muted">Total Realisasi Belanja:</span>
              <span class="fs-5 fw-black text-danger font-monospace">
                Rp {{ formatRupiah((expenseForm.qty || 0) * (expenseForm.harga_satuan || 0)) }}
              </span>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Nomor Nota / Catatan Vendor</label>
            <textarea class="form-control" rows="2" v-model="expenseForm.keterangan" placeholder="Kuitansi Toko Jaya Makmur"></textarea>
          </div>

          <div class="col-12 text-end pt-3 border-top">
            <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="closeForm">Batal</button>
            <button type="submit" class="btn btn-danger px-4 rounded-3 fw-bold">Simpan Pengeluaran</button>
          </div>
        </div>
      </form>
    </div>

    <!-- MAIN TAB NAVIGATION (NO-PRINT) -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white no-print">
      <div class="card-header bg-transparent border-bottom p-2 p-md-3">
        <ul class="nav nav-pills card-header-pills gap-1 flex-wrap">
          <li class="nav-item">
            <button
              class="nav-link fw-bold rounded-3 px-3 py-2 d-flex align-items-center gap-2"
              :class="{ active: activeTab === 'rab_items' }"
              @click="activeTab = 'rab_items'"
            >
              <i class="bi bi-table"></i>
              <span>Tabel Utama RAB</span>
              <span class="badge rounded-pill bg-primary text-white ms-1">{{ rabItems.length }}</span>
            </button>
          </li>

          <li class="nav-item">
            <button
              class="nav-link fw-bold rounded-3 px-3 py-2 d-flex align-items-center gap-2"
              :class="{ active: activeTab === 'income' }"
              @click="activeTab = 'income'"
            >
              <i class="bi bi-wallet2"></i>
              <span>Pemasukan / Income Kas</span>
              <span class="badge rounded-pill bg-success text-white ms-1">{{ rabIncomes.length }}</span>
            </button>
          </li>

          <li class="nav-item">
            <button
              class="nav-link fw-bold rounded-3 px-3 py-2 d-flex align-items-center gap-2"
              :class="{ active: activeTab === 'expense' }"
              @click="activeTab = 'expense'"
            >
              <i class="bi bi-cart-check"></i>
              <span>Pengeluaran Realisasi</span>
              <span class="badge rounded-pill bg-danger text-white ms-1">{{ rabExpenses.length }}</span>
            </button>
          </li>

          <li class="nav-item">
            <button
              class="nav-link fw-bold rounded-3 px-3 py-2 d-flex align-items-center gap-2"
              :class="{ active: activeTab === 'comparison' }"
              @click="activeTab = 'comparison'"
            >
              <i class="bi bi-sliders2"></i>
              <span>Analisa RAB vs Realisasi</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- TAB 1: TABEL UTAMA RAB (HEADER STRUCTURAL: ITEM, HARGA OVERALL, INFO) -->
    <div v-if="activeTab === 'rab_items' || isPrinting" class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 no-print">
        <div>
          <h5 class="fw-bold mb-1"><i class="bi bi-list-stars text-primary me-2"></i> Data Detail Rencana Anggaran Biaya (RAB)</h5>
          <p class="text-muted small mb-0">Struktur tabel lengkap meliputi Item, Deskripsi, Qty, Harga Satuan, Harga Total, Tanggal, dan Status.</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <div class="input-group input-group-sm" style="max-width: 260px;">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control bg-light border-start-0" placeholder="Cari item RAB..." v-model="searchQuery" />
          </div>

          <select class="form-select form-select-sm" v-model="filterStatus" style="max-width: 170px;">
            <option value="ALL">Semua Status</option>
            <option value="Rencana">Rencana</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Proses Belanja">Proses Belanja</option>
            <option value="Lunas / Terbayar">Lunas / Terbayar</option>
            <option value="Selesai">Selesai</option>
          </select>

          <button class="btn btn-primary btn-sm rounded-3 fw-semibold text-nowrap px-3" @click="openForm('rab')">
            <i class="bi bi-plus-circle me-1"></i> Input Item Baru
          </button>
        </div>
      </div>

      <!-- MAIN GROUPED RAB TABLE -->
      <div class="table-responsive">
        <table id="rabMainTablePrint" class="table table-bordered table-hover align-middle mb-0">
          <thead class="table-dark text-white text-center align-middle">
            <tr>
              <th rowspan="2" style="width: 45px;">No</th>
              <th colspan="2" class="bg-primary text-white">ITEM</th>
              <th colspan="3" class="bg-success text-white">Harga Overall</th>
              <th colspan="2" class="bg-dark text-white">Info</th>
              <th rowspan="2" class="no-print" style="width: 90px;">Aksi</th>
            </tr>
            <tr>
              <th>Nama Item</th>
              <th>Deskripsi Barang</th>
              <th style="width: 80px;">Qty</th>
              <th>Harga Satuan</th>
              <th>Harga Total</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRabItems.length === 0">
              <td colspan="9" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                Belum ada data RAB (Start 0 Rp). Klik tombol <strong>+ Tambah Item RAB</strong> atau <strong>Load Contoh Data</strong>.
              </td>
            </tr>

            <tr v-for="(item, idx) in filteredRabItems" :key="item.id">
              <td class="text-center fw-bold text-muted">{{ idx + 1 }}</td>
              <td class="fw-bold text-dark">{{ item.nama_item }}</td>
              <td class="small text-muted">{{ item.catatan || item.deskripsi || '-' }}</td>
              <td class="text-center">
                <span class="badge bg-light text-dark border px-2 py-1">{{ item.qty }} {{ item.satuan || 'pcs' }}</span>
              </td>
              <td class="text-end font-monospace text-secondary">
                Rp {{ formatRupiah(item.harga_satuan || 0) }}
              </td>
              <td class="text-end font-monospace fw-bold text-primary">
                Rp {{ formatRupiah(item.total || (item.qty * item.harga_satuan)) }}
              </td>
              <td class="text-center small font-monospace text-muted">
                {{ item.tanggal || '-' }}
              </td>
              <td class="text-center">
                <span class="badge fw-bold px-2.5 py-1 rounded-pill" :class="getStatusBadgeClass(item.status)">
                  {{ item.status || 'Rencana' }}
                </span>
              </td>
              <td class="text-center no-print">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="editRabItem(item)" title="Edit Data">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-outline-danger" @click="deleteRabItemConfirm(item.id)" title="Hapus Data">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="table-light fw-bold">
            <tr>
              <td colspan="3" class="text-end fs-6">TOTAL TARGET RANGKUMAN:</td>
              <td class="text-center font-monospace text-muted">-</td>
              <td class="text-end font-monospace text-muted">-</td>
              <td class="text-end fs-6 text-primary font-monospace">Rp {{ formatRupiah(totalRabAmount) }}</td>
              <td colspan="2"></td>
              <td class="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- TAB 2: KAS PEMASUKAN / INCOME -->
    <div v-if="activeTab === 'income'" class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div>
          <h5 class="fw-bold mb-1"><i class="bi bi-wallet2 text-success me-2"></i> Records Pemasukan / Income Kas</h5>
          <p class="text-muted small mb-0">Pencatatan sumber dana masuk, iuran, donatur, atau kas internal.</p>
        </div>
        <button class="btn btn-success rounded-3 fw-semibold px-4" @click="openForm('income')">
          <i class="bi bi-plus-circle me-1"></i> Catat Pemasukan Baru
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th>Sumber Dana / Donatur</th>
              <th class="text-center">Tanggal Terima</th>
              <th class="text-end">Nominal (Rp)</th>
              <th>Keterangan</th>
              <th class="text-center no-print" style="width: 90px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rabIncomes.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-wallet-fill fs-1 d-block mb-2 text-secondary"></i>
                Belum ada catatan pemasukan. Klik <strong>+ Catat Pemasukan Baru</strong>.
              </td>
            </tr>
            <tr v-for="(inc, idx) in rabIncomes" :key="inc.id">
              <td class="text-center fw-bold text-muted">{{ idx + 1 }}</td>
              <td class="fw-bold text-dark">
                <span class="badge bg-success-subtle text-success me-2"><i class="bi bi-person-fill"></i></span>
                {{ inc.sumber_dana }}
              </td>
              <td class="text-center small font-monospace text-muted">{{ inc.tanggal }}</td>
              <td class="text-end font-monospace fw-bold text-success">Rp {{ formatRupiah(inc.nominal) }}</td>
              <td class="small text-muted">{{ inc.keterangan || '-' }}</td>
              <td class="text-center no-print">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="editIncome(inc)" title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-outline-danger" @click="deleteIncomeConfirm(inc.id)" title="Hapus">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="table-group-divider fw-bold" v-if="rabIncomes.length > 0">
            <tr>
              <td colspan="3" class="text-end fs-6">TOTAL PEMASUKAN TERIMA:</td>
              <td class="text-end fs-6 text-success font-monospace">Rp {{ formatRupiah(totalRabIncome) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- TAB 3: PENGELUARAN REALISASI -->
    <div v-if="activeTab === 'expense'" class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div>
          <h5 class="fw-bold mb-1"><i class="bi bi-cart-check text-danger me-2"></i> Records Pengeluaran Realisasi (Belanja)</h5>
          <p class="text-muted small mb-0">Pencatatan realisasi belanja aktual di lapangan berdasarkan kuitansi/nota.</p>
        </div>
        <button class="btn btn-danger rounded-3 fw-semibold px-4" @click="openForm('expense')">
          <i class="bi bi-plus-circle me-1"></i> Catat Realisasi Belanja
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th>Deskripsi Realisasi Belanja</th>
              <th>Item RAB Terkait</th>
              <th class="text-center">Tanggal Nota</th>
              <th class="text-center">Qty</th>
              <th class="text-end">Harga Satuan</th>
              <th class="text-end">Total Realisasi</th>
              <th>Keterangan / Kuitansi</th>
              <th class="text-center no-print" style="width: 90px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rabExpenses.length === 0">
              <td colspan="9" class="text-center py-5 text-muted">
                <i class="bi bi-cart-x fs-1 d-block mb-2 text-secondary"></i>
                Belum ada pengeluaran realisasi. Klik <strong>+ Catat Realisasi Belanja</strong>.
              </td>
            </tr>
            <tr v-for="(exp, idx) in rabExpenses" :key="exp.id">
              <td class="text-center fw-bold text-muted">{{ idx + 1 }}</td>
              <td class="fw-bold text-dark">{{ exp.deskripsi }}</td>
              <td>
                <span v-if="getRabItemName(exp.rab_item_id)" class="badge bg-primary-subtle text-primary border">
                  {{ getRabItemName(exp.rab_item_id) }}
                </span>
                <span v-else class="badge bg-secondary-subtle text-secondary border">
                  Lain-lain / Non-RAB
                </span>
              </td>
              <td class="text-center small font-monospace text-muted">{{ exp.tanggal }}</td>
              <td class="text-center"><span class="badge bg-light text-dark border">{{ exp.qty }}</span></td>
              <td class="text-end font-monospace text-secondary">Rp {{ formatRupiah(exp.harga_satuan) }}</td>
              <td class="text-end font-monospace fw-bold text-danger">Rp {{ formatRupiah(exp.total) }}</td>
              <td class="small text-muted">{{ exp.keterangan || '-' }}</td>
              <td class="text-center no-print">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="editExpense(exp)" title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-outline-danger" @click="deleteExpenseConfirm(exp.id)" title="Hapus">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="table-group-divider fw-bold" v-if="rabExpenses.length > 0">
            <tr>
              <td colspan="6" class="text-end fs-6">TOTAL REALISASI BELANJA:</td>
              <td class="text-end fs-6 text-danger font-monospace">Rp {{ formatRupiah(totalRabExpense) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- TAB 4: ANALISA RAB VS REALISASI -->
    <div v-if="activeTab === 'comparison'" class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div>
          <h5 class="fw-bold mb-1"><i class="bi bi-sliders2 text-indigo me-2"></i> Analisa Perbandingan Target RAB vs Realisasi Belanja</h5>
          <p class="text-muted small mb-0">Laporan efisiensi anggaran: bandingkan mana item yang hemat, pas, atau over budget.</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-dark text-white">
            <tr>
              <th class="text-center" style="width: 40px;">No</th>
              <th>Nama Item RAB</th>
              <th class="text-center">Target Qty</th>
              <th class="text-end">Target Total RAB</th>
              <th class="text-end">Realisasi Belanja</th>
              <th class="text-end">Selisih (Variance)</th>
              <th class="text-center">Status Budget</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="comparisonList.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                Belum ada data RAB untuk dianalisa.
              </td>
            </tr>
            <tr v-for="(row, idx) in comparisonList" :key="row.item.id">
              <td class="fw-bold text-muted text-center">{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-dark">{{ row.item.nama_item }}</div>
                <div class="small text-muted">{{ row.item.catatan || row.item.deskripsi || '-' }}</div>
              </td>
              <td class="text-center fw-semibold">{{ row.item.qty }} {{ row.item.satuan || 'pcs' }}</td>
              <td class="text-end font-monospace fw-bold text-primary">Rp {{ formatRupiah(row.item.total) }}</td>
              <td class="text-end font-monospace fw-bold" :class="row.actualExpense > 0 ? 'text-dark' : 'text-muted'">
                Rp {{ formatRupiah(row.actualExpense) }}
              </td>
              <td class="text-end font-monospace fw-bold" :class="row.diffClass">
                {{ row.diffPrefix }} Rp {{ formatRupiah(Math.abs(row.diff)) }}
              </td>
              <td class="text-center">
                <span class="badge fw-bold px-2.5 py-1.5 rounded-pill" :class="row.badgeClass">
                  {{ row.statusText }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot class="table-light fw-bold">
            <tr>
              <td colspan="3" class="text-end fs-6">TOTAL TARGET VS REALISASI:</td>
              <td class="text-end fs-6 text-primary font-monospace">Rp {{ formatRupiah(totalRabAmount) }}</td>
              <td class="text-end fs-6 text-danger font-monospace">Rp {{ formatRupiah(totalRabExpense) }}</td>
              <td class="text-end fs-6 font-monospace" :class="selisihVsTextClass">
                {{ selisihVsPrefix }} Rp {{ formatRupiah(Math.abs(selisihRabVsExpense)) }}
              </td>
              <td class="text-center">
                <span class="badge fw-bold px-3 py-1.5 rounded-pill" :class="evalBadgeClass">
                  {{ rabStatusInfo.status }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- PRINT & PDF FOOTER SIGNATURE SLOTS (PRINT ONLY) -->
    <div class="print-only mt-5 pt-4">
      <div class="d-flex justify-content-between align-items-start px-4 text-dark">
        <!-- Signature Left: Exporter / Bendahara -->
        <div class="text-center" style="width: 260px;">
          <p class="mb-1 text-muted fw-bold">Disiapkan & Diajukan oleh,</p>
          <p class="fw-bold mb-5 text-dark">{{ exporterMeta.jabatanExporter || 'Bendahara / Pengelola RAB' }}</p>
          <div class="border-bottom border-dark my-2 mx-auto" style="width: 200px;"></div>
          <p class="fw-bold mb-0 text-dark">{{ exporterMeta.namaExporter || '( Nama Exporter / Bendahara )' }}</p>
        </div>

        <!-- Signature Right: Approver / Chairman -->
        <div class="text-center" style="width: 260px;">
          <p class="mb-1 text-muted fw-bold">Mengetahui & Disetujui oleh,</p>
          <p class="fw-bold mb-5 text-dark">Ketua / Manajer Proyek</p>
          <div class="border-bottom border-dark my-2 mx-auto" style="width: 200px;"></div>
          <p class="fw-bold mb-0 text-dark">{{ exporterMeta.namaPenyetuju || '( Nama Penyetuju / Ketua )' }}</p>
        </div>
      </div>

      <div class="text-center text-muted small mt-4 pt-3 border-top">
        Dokumen Laporan Anggaran ini diciptakan secara sah menggunakan Sistem Management RAB.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, nextTick } from 'vue';
import { useStore } from 'vuex';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { openPrintableDocumentInNewTab } from '../utils/pdfTabOpener';

export default {
  name: 'RabView',
  setup() {
    const store = useStore();
    const activeTab = ref('rab_items');
    const isPrinting = ref(false);
    const searchQuery = ref('');
    const filterStatus = ref('ALL');

    // Exporter metadata
    const exporterMeta = reactive({
      namaExporter: 'Arip (Bendahara)',
      jabatanExporter: 'Bendahara / Pengelola RAB',
      namaPenyetuju: 'Ketua Panitia / Manajer Proyek',
      lokasiTanggal: 'Jakarta, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      tanggalCetak: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });

    // Store state & getters
    const rabItems = computed(() => store.getters.getRabItems);
    const rabIncomes = computed(() => store.getters.getRabIncomes);
    const rabExpenses = computed(() => store.getters.getRabExpenses);

    const totalRabAmount = computed(() => store.getters.totalRabAmount);
    const totalRabItemIncome = computed(() => store.getters.totalRabItemIncome);
    const totalRabIncome = computed(() => store.getters.totalRabIncome);
    const totalRabExpense = computed(() => store.getters.totalRabExpense);

    const sisaRabAmount = computed(() => store.getters.sisaRabAmount);
    const sisaRabAktual = computed(() => store.getters.sisaRabAktual);
    const selisihRabVsExpense = computed(() => store.getters.selisihRabVsExpense);
    const rabStatusInfo = computed(() => store.getters.rabStatusInfo);

    const formattedToday = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Formatting helpers
    const formatRupiah = (val) => {
      if (val === undefined || val === null || isNaN(val)) return '0';
      return Math.round(val).toLocaleString('id-ID');
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Disetujui': return 'bg-info text-dark';
        case 'Proses Belanja': return 'bg-warning text-dark';
        case 'Lunas / Terbayar': return 'bg-success text-white';
        case 'Selesai': return 'bg-primary text-white';
        default: return 'bg-secondary text-white';
      }
    };

    // Filtered RAB items
    const filteredRabItems = computed(() => {
      return rabItems.value.filter(item => {
        const matchesQuery = searchQuery.value === '' || 
          item.nama_item.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (item.catatan && item.catatan.toLowerCase().includes(searchQuery.value.toLowerCase()));
        const matchesStatus = filterStatus.value === 'ALL' || item.status === filterStatus.value;
        return matchesQuery && matchesStatus;
      });
    });

    // Get RAB Item Name helper
    const getRabItemName = (rab_item_id) => {
      if (!rab_item_id) return null;
      const found = rabItems.value.find(i => i.id === rab_item_id);
      return found ? found.nama_item : null;
    };

    // Detailed Comparison List
    const comparisonList = computed(() => {
      return rabItems.value.map(item => {
        const linkedExpenses = rabExpenses.value.filter(e => e.rab_item_id === item.id);
        const actualExpense = linkedExpenses.reduce((acc, e) => acc + (Number(e.total) || (Number(e.qty) * Number(e.harga_satuan))), 0);
        const diff = (Number(item.total) || 0) - actualExpense;

        let statusText = 'Belum Realisasi';
        let badgeClass = 'bg-secondary text-white';
        let diffPrefix = '';
        let diffClass = 'text-muted';

        if (linkedExpenses.length > 0) {
          if (diff > 0) {
            statusText = 'Hemat';
            badgeClass = 'bg-success text-white';
            diffPrefix = '+';
            diffClass = 'text-success';
          } else if (diff === 0) {
            statusText = 'Sesuai RAB';
            badgeClass = 'bg-primary text-white';
            diffPrefix = '';
            diffClass = 'text-primary';
          } else {
            statusText = 'Over Budget';
            badgeClass = 'bg-danger text-white';
            diffPrefix = '-';
            diffClass = 'text-danger';
          }
        }

        return {
          item,
          actualExpense,
          diff,
          statusText,
          badgeClass,
          diffPrefix,
          diffClass
        };
      });
    });

    // Status Banner Evaluator
    const evalBadgeClass = computed(() => {
      const diff = selisihRabVsExpense.value;
      if (diff > 0) return 'bg-success text-white';
      if (diff === 0) return 'bg-primary text-white';
      return 'bg-danger text-white';
    });

    const selisihVsTextClass = computed(() => {
      const diff = selisihRabVsExpense.value;
      if (diff > 0) return 'text-success';
      if (diff === 0) return 'text-primary';
      return 'text-danger';
    });

    const selisihVsPrefix = computed(() => {
      const diff = selisihRabVsExpense.value;
      if (diff > 0) return '+ (Hemat)';
      if (diff === 0) return '';
      return '- (Over)';
    });

    // IN-PAGE FORM STATE (NO MODAL)
    const showForm = ref(false);
    const formType = ref('rab'); // 'rab', 'income', 'expense'
    const editingId = ref(null);

    const rabForm = ref({
      nama_item: '',
      qty: 1,
      satuan: 'pcs',
      income: 0,
      harga_satuan: 0,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Rencana',
      catatan: ''
    });

    const incomeForm = ref({
      sumber_dana: '',
      tanggal: new Date().toISOString().split('T')[0],
      nominal: 0,
      keterangan: ''
    });

    const expenseForm = ref({
      rab_item_id: null,
      deskripsi: '',
      qty: 1,
      harga_satuan: 0,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: ''
    });

    const formTitle = computed(() => {
      if (formType.value === 'rab') return editingId.value ? 'Form Edit Item RAB' : 'Form Input Item RAB Baru';
      if (formType.value === 'income') return editingId.value ? 'Form Edit Catatan Pemasukan' : 'Form Input Pemasukan / Income Kas';
      return editingId.value ? 'Form Edit Catatan Realisasi' : 'Form Input Realisasi Belanja Baru';
    });

    const formIcon = computed(() => {
      if (formType.value === 'rab') return 'bi bi-calculator-fill text-primary';
      if (formType.value === 'income') return 'bi bi-wallet2 text-success';
      return 'bi bi-cart-check text-danger';
    });

    const formBorderClass = computed(() => {
      if (formType.value === 'rab') return 'border-primary';
      if (formType.value === 'income') return 'border-success';
      return 'border-danger';
    });

    const openForm = (type) => {
      formType.value = type;
      editingId.value = null;
      if (type === 'rab') {
        rabForm.value = {
          nama_item: '',
          qty: 1,
          satuan: 'pcs',
          income: 0,
          harga_satuan: 0,
          tanggal: new Date().toISOString().split('T')[0],
          status: 'Rencana',
          catatan: ''
        };
      } else if (type === 'income') {
        incomeForm.value = { sumber_dana: '', tanggal: new Date().toISOString().split('T')[0], nominal: 0, keterangan: '' };
      } else if (type === 'expense') {
        expenseForm.value = { rab_item_id: null, deskripsi: '', qty: 1, harga_satuan: 0, tanggal: new Date().toISOString().split('T')[0], keterangan: '' };
      }
      showForm.value = true;
      nextTick(() => {
        const el = document.getElementById('inPageFormCard');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    };

    const closeForm = () => {
      showForm.value = false;
      editingId.value = null;
    };

    const editRabItem = (item) => {
      formType.value = 'rab';
      editingId.value = item.id;
      rabForm.value = { ...item };
      showForm.value = true;
      nextTick(() => {
        const el = document.getElementById('inPageFormCard');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    };

    const editIncome = (inc) => {
      formType.value = 'income';
      editingId.value = inc.id;
      incomeForm.value = { ...inc };
      showForm.value = true;
      nextTick(() => {
        const el = document.getElementById('inPageFormCard');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    };

    const editExpense = (exp) => {
      formType.value = 'expense';
      editingId.value = exp.id;
      expenseForm.value = { ...exp };
      showForm.value = true;
      nextTick(() => {
        const el = document.getElementById('inPageFormCard');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    };

    const onSelectRabItem = () => {
      if (expenseForm.value.rab_item_id) {
        const item = rabItems.value.find(i => i.id === expenseForm.value.rab_item_id);
        if (item) {
          expenseForm.value.deskripsi = item.nama_item;
          expenseForm.value.qty = item.qty;
          expenseForm.value.harga_satuan = item.harga_satuan;
        }
      }
    };

    // SAVE HANDLERS (SweetAlert2)
    const saveRabItem = () => {
      if (editingId.value) {
        store.dispatch('updateRabItem', { ...rabForm.value, id: editingId.value });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Item RAB berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        store.dispatch('addRabItem', { ...rabForm.value });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Item RAB baru berhasil ditambahkan.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      closeForm();
    };

    const saveIncome = () => {
      if (editingId.value) {
        store.dispatch('updateRabIncome', { ...incomeForm.value, id: editingId.value });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Catatan pemasukan berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        store.dispatch('addRabIncome', { ...incomeForm.value });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pemasukan baru berhasil dicatat.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      closeForm();
    };

    const saveExpense = () => {
      if (editingId.value) {
        store.dispatch('updateRabExpense', { ...expenseForm.value, id: editingId.value });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Catatan pengeluaran berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        store.dispatch('addRabExpense', { ...expenseForm.value });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Realisasi pengeluaran baru berhasil dicatat.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      closeForm();
    };

    // DELETE HANDLERS (SweetAlert2)
    const deleteRabItemConfirm = (id) => {
      Swal.fire({
        title: 'Hapus Item RAB?',
        text: 'Pengeluaran realisasi yang terhubung akan disesuaikan menjadi Non-RAB.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteRabItem', id);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Item RAB telah dihapus.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      });
    };

    const deleteIncomeConfirm = (id) => {
      Swal.fire({
        title: 'Hapus Pemasukan?',
        text: 'Catatan nominal penerimaan ini akan dihapus dari kas.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteRabIncome', id);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Catatan pemasukan telah dihapus.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      });
    };

    const deleteExpenseConfirm = (id) => {
      Swal.fire({
        title: 'Hapus Realisasi Pengeluaran?',
        text: 'Catatan pengeluaran aktual ini akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteRabExpense', id);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Pengeluaran telah dihapus.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      });
    };

    // SAMPLE DATA LOAD
    const triggerLoadSampleData = () => {
      Swal.fire({
        title: 'Muat Contoh Data RAB?',
        text: 'Data RAB, Pemasukan/Income, dan Realisasi Pengeluaran contoh akan dimuat.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Muat Contoh',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('loadSampleRabData');
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Contoh data RAB Kegiatan telah dimuat.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      });
    };

    // EXPORT TO EXCEL (.XLSX)
    const exportToExcel = () => {
      try {
        const rows = filteredRabItems.value.map((item, idx) => ({
          'No': idx + 1,
          'Nama Item': item.nama_item,
          'Deskripsi Barang': item.catatan || item.deskripsi || '-',
          'Qty': item.qty,
          'Satuan': item.satuan || 'pcs',
          'Harga Satuan (Rp)': item.harga_satuan || 0,
          'Harga Total (Rp)': item.total || (item.qty * item.harga_satuan),
          'Tanggal': item.tanggal || '-',
          'Status': item.status || 'Rencana'
        }));

        // Summary row
        rows.push({
          'No': 'TOTAL',
          'Nama Item': 'RANGKUMAN DANA',
          'Deskripsi Barang': 'Exported by: ' + (exporterMeta.namaExporter || 'System Exporter'),
          'Qty': '-',
          'Satuan': '-',
          'Harga Satuan (Rp)': '-',
          'Harga Total (Rp)': totalRabAmount.value,
          'Tanggal': '-',
          'Status': 'Total Target'
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Append Exporter Info metadata at bottom
        XLSX.utils.sheet_add_aoa(worksheet, [
          [],
          ['--- INFORMASI DOKUMEN EXPORTER ---'],
          ['Exported By', exporterMeta.namaExporter || '-'],
          ['Jabatan Exporter', exporterMeta.jabatanExporter || '-'],
          ['Disetujui Oleh', exporterMeta.namaPenyetuju || '-'],
          ['Lokasi & Tanggal', exporterMeta.lokasiTanggal || '-']
        ], { origin: -1 });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan_RAB');
        XLSX.writeFile(workbook, `Laporan_RAB_${new Date().toISOString().split('T')[0]}.xlsx`);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'File Excel Laporan RAB berhasil diunduh.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Download Excel',
          text: err.message
        });
      }
    };

    // EXPORT TO PDF / PRINT PDF WITH EXPORTER META & SIGNATURE SLOTS
    const isPdfLoading = ref(false);

    const exportToPdf = () => {
      if (isPdfLoading.value) return;
      isPdfLoading.value = true;
      activeTab.value = 'rab_items';

      setTimeout(() => {
        const printHeaderHtml = `
          <div class="text-center mb-4">
            <h2 class="fw-bold text-uppercase mb-1" style="letter-spacing: 1px;">LAPORAN RENCANA ANGGARAN BIAYA & KAS KEGIATAN</h2>
            <p class="mb-0 text-secondary fw-semibold">Dokumen Anggaran Resmi • Tanggal Cetak: ${exporterMeta.tanggalCetak || formattedToday.value}</p>
            <hr class="my-3 border-2 border-dark" />
          </div>
          <div class="row g-2 mb-4 p-3 bg-light rounded border text-dark small">
            <div class="col-6">
              <div><strong>Exported By (Diajukan Oleh):</strong> ${exporterMeta.namaExporter || 'Arip (Bendahara)'}</div>
              <div><strong>Jabatan Exporter:</strong> ${exporterMeta.jabatanExporter || 'Bendahara / Pengelola RAB'}</div>
            </div>
            <div class="col-6 text-end">
              <div><strong>Disetujui Oleh:</strong> ${exporterMeta.namaPenyetuju || 'Ketua Panitia / Manajer Proyek'}</div>
              <div><strong>Lokasi & Tanggal:</strong> ${exporterMeta.lokasiTanggal || 'Jakarta, ' + formattedToday.value}</div>
            </div>
          </div>
        `;

        const summaryCardsHtml = `
          <div class="row g-3 mb-4 text-dark">
            <div class="col-3">
              <div class="p-3 border rounded bg-light text-center">
                <div class="small text-muted fw-bold">TOTAL TARGET RAB</div>
                <div class="fs-6 fw-bold text-primary">Rp ${formatRupiah(totalRabAmount.value)}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="p-3 border rounded bg-light text-center">
                <div class="small text-muted fw-bold">TOTAL PEMASUKAN</div>
                <div class="fs-6 fw-bold text-success">Rp ${formatRupiah(totalRabIncome.value)}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="p-3 border rounded bg-light text-center">
                <div class="small text-muted fw-bold">TOTAL PENGELUARAN</div>
                <div class="fs-6 fw-bold text-danger">Rp ${formatRupiah(totalRabExpense.value)}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="p-3 border rounded bg-light text-center">
                <div class="small text-muted fw-bold">SISA KAS AKTUAL</div>
                <div class="fs-6 fw-bold text-dark">Rp ${formatRupiah(sisaRabAktual.value)}</div>
              </div>
            </div>
          </div>
        `;

        const tableEl = document.getElementById('rabMainTablePrint');
        const tableHtml = tableEl ? tableEl.outerHTML : '';

        const signatureHtml = `
          <div class="mt-5 pt-4">
            <div class="d-flex justify-content-between align-items-start px-4 text-dark">
              <div class="text-center" style="width: 260px;">
                <p class="mb-1 text-muted fw-bold">Disiapkan & Diajukan oleh,</p>
                <p class="fw-bold mb-5 text-dark">${exporterMeta.jabatanExporter || 'Bendahara / Pengelola RAB'}</p>
                <div class="border-bottom border-dark my-2 mx-auto" style="width: 200px;"></div>
                <p class="fw-bold mb-0 text-dark">${exporterMeta.namaExporter || '( Nama Exporter / Bendahara )'}</p>
              </div>
              <div class="text-center" style="width: 260px;">
                <p class="mb-1 text-muted fw-bold">Mengetahui & Disetujui oleh,</p>
                <p class="fw-bold mb-5 text-dark">Ketua / Manajer Proyek</p>
                <div class="border-bottom border-dark my-2 mx-auto" style="width: 200px;"></div>
                <p class="fw-bold mb-0 text-dark">${exporterMeta.namaPenyetuju || '( Nama Penyetuju / Ketua )'}</p>
              </div>
            </div>
          </div>
        `;

        openPrintableDocumentInNewTab({
          title: `Laporan_RAB_${exporterMeta.lokasiTanggal || 'TaskArts'}`,
          rawHtml: printHeaderHtml + summaryCardsHtml + tableHtml + signatureHtml,
          autoPrint: true
        });
        isPdfLoading.value = false;
      }, 400);
    };

    // DEDICATED JSON BACKUP & RECOVERY FOR RAB
    const rabJsonFileInput = ref(null);

    const exportRabJson = () => {
      try {
        const rabBackupData = {
          app: 'TaskArts',
          type: 'rab_backup',
          version: '2.5',
          exportDate: new Date().toISOString(),
          formattedDate: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID'),
          exporterMeta: exporterMeta,
          rabItems: rabItems.value || [],
          rabIncomes: rabIncomes.value || [],
          rabExpenses: rabExpenses.value || [],
          summary: {
            totalTargetRab: totalRabAmount.value,
            totalIncome: totalRabIncome.value,
            totalExpense: totalRabExpense.value,
            sisaSaldo: sisaRabAktual.value
          }
        };

        const jsonStr = JSON.stringify(rabBackupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `Backup_RAB_TaskArts_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Backup RAB Berhasil Diunduh!',
          html: `<div class="text-start small">
            <p class="mb-1"><strong>File:</strong> Backup_RAB_TaskArts_${dateStr}.json</p>
            <p class="mb-1"><strong>Total Item RAB:</strong> ${rabItems.value.length} item</p>
            <p class="mb-1"><strong>Total Kas Masuk:</strong> ${rabIncomes.value.length} catatan</p>
            <p class="mb-0"><strong>Total Realisasi:</strong> ${rabExpenses.value.length} transaksi</p>
          </div>`,
          timer: 3000,
          showConfirmButton: true
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Export JSON',
          text: err.message
        });
      }
    };

    const triggerRabJsonImport = () => {
      if (rabJsonFileInput.value) {
        rabJsonFileInput.value.value = '';
        rabJsonFileInput.value.click();
      }
    };

    const onRabJsonFileSelected = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          
          // Detect RAB data from standalone RAB backup or full app backup
          const detectedItems = parsed.rabItems || parsed.rab || parsed.rabs || parsed.rab_items || parsed.daftar_rab || [];
          const detectedIncomes = parsed.rabIncomes || parsed.incomes || parsed.rab_incomes || parsed.penerimaan || [];
          const detectedExpenses = parsed.rabExpenses || parsed.expenses || parsed.rab_expenses || parsed.pengeluaran || [];

          if (!Array.isArray(detectedItems) && !Array.isArray(detectedIncomes) && !Array.isArray(detectedExpenses)) {
            Swal.fire({
              icon: 'warning',
              title: 'Format Data RAB Tidak Ditemukan',
              text: 'File JSON ini tidak memuat struktur data RAB (rabItems / rabIncomes / rabExpenses).'
            });
            return;
          }

          const itemCount = detectedItems.length;
          const incomeCount = detectedIncomes.length;
          const expenseCount = detectedExpenses.length;

          Swal.fire({
            title: 'Pulihkan / Recovery Data RAB?',
            html: `
              <div class="text-start p-2 bg-light rounded border mb-3 small">
                <p class="mb-1 text-primary fw-bold">📄 Ringkasan Berkas Backup yang Terdeteksi:</p>
                <ul class="mb-1 ps-3">
                  <li><strong>Item Rencana Anggaran (RAB):</strong> ${itemCount} item</li>
                  <li><strong>Dana Masuk / Income:</strong> ${incomeCount} catatan</li>
                  <li><strong>Realisasi Pengeluaran / Belanja:</strong> ${expenseCount} transaksi</li>
                </ul>
                <div class="alert alert-info py-2 px-3 mb-0 small">
                  Pilih metode pemulihan data yang Anda inginkan di bawah ini:
                </div>
              </div>
            `,
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: '🔄 Pulihkan Total (Timpa)',
            denyButtonText: '➕ Gabungkan (Merge)',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0d6efd',
            denyButtonColor: '#198754',
            cancelButtonColor: '#6c757d'
          }).then((result) => {
            if (result.isConfirmed) {
              // Overwrite Recovery
              store.dispatch('importRabData', {
                items: detectedItems,
                incomes: detectedIncomes,
                expenses: detectedExpenses,
                merge: false
              });
              if (parsed.exporterMeta) {
                Object.assign(exporterMeta, parsed.exporterMeta);
                localStorage.setItem('ft_rab_exporter_meta', JSON.stringify(exporterMeta));
              }
              Swal.fire({
                icon: 'success',
                title: 'Data RAB Berhasil Dipulihkan!',
                text: `Seluruh data RAB (${itemCount} item) telah berhasil dipulihkan secara utuh.`,
                timer: 2500
              });
            } else if (result.isDenied) {
              // Merge Recovery
              store.dispatch('importRabData', {
                items: detectedItems,
                incomes: detectedIncomes,
                expenses: detectedExpenses,
                merge: true
              });
              Swal.fire({
                icon: 'success',
                title: 'Data RAB Berhasil Digabungkan!',
                text: 'Item baru dari berkas backup berhasil ditambahkan ke daftar RAB Anda.',
                timer: 2500
              });
            }
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Berkas JSON Rusak / Tidak Valid',
            text: 'Terjadi kesalahan saat membaca file JSON: ' + err.message
          });
        }
      };
      reader.readAsText(file);
    };

    return {
      activeTab,
      isPrinting,
      searchQuery,
      filterStatus,
      exporterMeta,
      rabItems,
      rabIncomes,
      rabExpenses,
      filteredRabItems,
      totalRabAmount,
      totalRabItemIncome,
      totalRabIncome,
      totalRabExpense,
      sisaRabAmount,
      sisaRabAktual,
      selisihRabVsExpense,
      rabStatusInfo,
      formattedToday,
      formatRupiah,
      getStatusBadgeClass,
      getRabItemName,
      comparisonList,
      evalBadgeClass,
      selisihVsTextClass,
      selisihVsPrefix,
      
      // Form state (No modal)
      showForm,
      formType,
      editingId,
      rabForm,
      incomeForm,
      expenseForm,
      formTitle,
      formIcon,
      formBorderClass,
      openForm,
      closeForm,
      editRabItem,
      editIncome,
      editExpense,
      onSelectRabItem,
      
      saveRabItem,
      saveIncome,
      saveExpense,
      deleteRabItemConfirm,
      deleteIncomeConfirm,
      deleteExpenseConfirm,
      triggerLoadSampleData,
      exportToExcel,
      isPdfLoading,
      exportToPdf,
      rabJsonFileInput,
      exportRabJson,
      triggerRabJsonImport,
      onRabJsonFileSelected
    };
  }
};
</script>

<style scoped>
.fw-black {
  font-weight: 900;
}

.bg-gradient-success {
  background: linear-gradient(135deg, #198754 0%, #0d5132 100%);
}

.bg-gradient-danger {
  background: linear-gradient(135deg, #dc3545 0%, #842029 100%);
}

.text-indigo {
  color: #6610f2;
}

.print-only {
  display: none !important;
}

@media print {
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  body {
    background: #fff !important;
    color: #000 !important;
  }
  .card {
    box-shadow: none !important;
    border: none !important;
  }
  .table-responsive {
    overflow: visible !important;
  }
}
</style>
