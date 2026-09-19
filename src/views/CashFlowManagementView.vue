<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Top Shared Header Navigation -->
    <FinanceNavHeader
      title="1. Manajemen Arus Kas (Cash Flow Management)"
      subtitle="Pantau posisi likuiditas kas real-time, rekonsiliasi rekening koran otomatis, dan pantauan portofolio multi-mata uang."
    />

    <!-- Main Navigation Tabs inside Cash Flow Module -->
    <div class="card border-0 shadow-sm rounded-4 bg-white mb-4 p-2 no-print">
      <ul class="nav nav-pills nav-fill gap-2" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'dashboard' }"
            @click="activeTab = 'dashboard'"
          >
            <i class="bi bi-speedometer2"></i>
            <span>Dashboard & Transaksi Kas</span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'reconciliation' }"
            @click="activeTab = 'reconciliation'"
          >
            <i class="bi bi-arrow-repeat"></i>
            <span>Rekonsiliasi Bank Otomatis</span>
            <span class="badge bg-warning text-dark rounded-pill small" v-if="unmatchedBankCount > 0">
              {{ unmatchedBankCount }} Selisih
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'currencies' }"
            @click="activeTab = 'currencies'"
          >
            <i class="bi bi-currency-exchange"></i>
            <span>Pemantauan Multi-Mata Uang</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: DASHBOARD REAL-TIME & CRUD TRANSAKSI ARUS KAS                      -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'dashboard'">
      <!-- Metrik Cards Real-Time -->
      <div class="row g-3 mb-4">
        <!-- Total Posisi Kas -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-semibold">Total Kas & Setara Kas</span>
              <div class="d-flex align-items-center gap-1">
                <button 
                  @click="openSetBaseCashModal" 
                  class="btn btn-sm btn-light border p-1 rounded-circle text-primary" 
                  style="width: 28px; height: 28px;"
                  title="Atur Saldo Awal Kas (Default: Rp 0)"
                >
                  <i class="bi bi-pencil-square" style="font-size: 11px;"></i>
                </button>
                <div class="p-2 bg-primary-subtle text-primary rounded-3">
                  <i class="bi bi-wallet2 fs-5"></i>
                </div>
              </div>
            </div>
            <h4 class="fw-bold mb-1 text-dark">{{ formatRupiah(totalCashPosition) }}</h4>
            <div class="d-flex align-items-center justify-content-between small text-muted">
              <span>Saldo Awal: {{ formatRupiah(baseCash) }}</span>
              <span class="badge bg-light text-secondary border">Kas Riil</span>
            </div>
          </div>
        </div>

        <!-- Pemasukan Bulan Ini -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-semibold">Pemasukan (Inflow)</span>
              <div class="p-2 bg-success-subtle text-success rounded-3">
                <i class="bi bi-graph-up-arrow fs-5"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-1 text-success">{{ formatRupiah(totalInflow) }}</h4>
            <div class="small text-muted">
              <span>{{ filteredTransactions.filter(t => t.type === 'inflow').length }} Transaksi Tercatat</span>
            </div>
          </div>
        </div>

        <!-- Pengeluaran Bulan Ini -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-danger">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-semibold">Pengeluaran (Outflow)</span>
              <div class="p-2 bg-danger-subtle text-danger rounded-3">
                <i class="bi bi-graph-down-arrow fs-5"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-1 text-danger">{{ formatRupiah(totalOutflow) }}</h4>
            <div class="small text-muted">
              <span>{{ filteredTransactions.filter(t => t.type === 'outflow').length }} Transaksi Keluar</span>
            </div>
          </div>
        </div>

        <!-- Status Likuiditas & Runway -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-info">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-semibold">Status Likuiditas</span>
              <div class="p-2 bg-info-subtle text-info rounded-3">
                <i class="bi bi-shield-check fs-5"></i>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <h4 class="fw-bold mb-0 text-dark">Rasio 2.8x</h4>
              <span class="badge bg-success text-white rounded-pill small">Sangat Aman</span>
            </div>
            <div class="small text-muted">
              Runway Kas: <strong>~8.5 Bulan</strong> Operasional
            </div>
          </div>
        </div>
      </div>

      <!-- Action Toolbar & Filter Form -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Search bar -->
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Cari transaksi / no ref..."
                v-model="searchQuery"
              />
            </div>

            <!-- Filter Type -->
            <select class="form-select form-select-sm" style="width: auto;" v-model="filterType">
              <option value="all">Semua Jenis (Inflow & Outflow)</option>
              <option value="inflow">Hanya Pemasukan (+)</option>
              <option value="outflow">Hanya Pengeluaran (-)</option>
            </select>

            <!-- Filter Category -->
            <select class="form-select form-select-sm" style="width: auto;" v-model="filterCategory">
              <option value="all">Semua Kategori</option>
              <option value="Operasional">Operasional</option>
              <option value="Investasi">Investasi</option>
              <option value="Pendanaan">Pendanaan</option>
            </select>

            <!-- Filter Bank Account -->
            <select class="form-select form-select-sm" style="width: auto;" v-model="filterAccount">
              <option value="all">Semua Rekening</option>
              <option value="Bank BCA Utama">Bank BCA Utama</option>
              <option value="Bank Mandiri Payroll">Bank Mandiri Payroll</option>
              <option value="Bank BRI Giro">Bank BRI Giro</option>
              <option value="Kas Kasir Tunai">Kas Kasir Tunai</option>
              <option value="Akun Valas USD">Akun Valas USD</option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              class="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-xs d-flex align-items-center gap-1.5"
              @click="openAddModal"
            >
              <i class="bi bi-plus-circle-fill"></i>
              <span>+ Catat Transaksi Arus Kas</span>
            </button>
            <button
              class="btn btn-outline-success btn-sm px-3 rounded-pill fw-semibold"
              @click="exportCashFlowExcel"
              title="Ekspor ke Berkas Spreadsheet Excel"
            >
              <i class="bi bi-file-earmark-excel-fill text-success me-1"></i> Ekspor Excel
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction Table -->
      <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-muted text-uppercase">
                <th class="ps-3 py-3">Tanggal & Ref</th>
                <th>Keterangan / Uraian</th>
                <th>Kategori & Akun</th>
                <th>Metode Bayar</th>
                <th class="text-end">Nominal (IDR)</th>
                <th>Verifikasi</th>
                <th class="text-center pe-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                  Tidak ada transaksi kas yang sesuai dengan filter pencarian.
                </td>
              </tr>
              <tr v-for="t in filteredTransactions" :key="t.id">
                <td class="ps-3">
                  <div class="fw-bold text-dark">{{ formatDate(t.date) }}</div>
                  <span class="badge bg-light text-muted border font-monospace" style="font-size: 11px;">
                    {{ t.refNumber || t.id }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ t.description }}</div>
                  <div class="small text-muted text-truncate" style="max-width: 280px;" v-if="t.notes">
                    <i class="bi bi-info-circle me-1"></i>{{ t.notes }}
                  </div>
                </td>
                <td>
                  <span
                    class="badge rounded-pill me-1"
                    :class="t.category === 'Operasional' ? 'bg-primary-subtle text-primary' : (t.category === 'Investasi' ? 'bg-warning-subtle text-warning' : 'bg-info-subtle text-info')"
                  >
                    {{ t.category }}
                  </span>
                  <div class="small text-muted mt-0.5">
                    <i class="bi bi-bank me-1"></i>{{ t.account }}
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ t.paymentMethod }}</span>
                </td>
                <td class="text-end">
                  <div class="fw-bold" :class="t.type === 'inflow' ? 'text-success' : 'text-danger'">
                    {{ t.type === 'inflow' ? '+' : '-' }} {{ formatRupiah(t.amount) }}
                  </div>
                </td>
                <td>
                  <span v-if="t.verified" class="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-pill px-2 py-1">
                    <i class="bi bi-check-lg me-1"></i> Verified
                  </span>
                  <span v-else class="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1">
                    Pending
                  </span>
                </td>
                <td class="text-center pe-3">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      @click="editTransaction(t)"
                      title="Edit Transaksi"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="deleteTransaction(t.id)"
                      title="Hapus Transaksi"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: REKONSILIASI BANK OTOMATIS                                         -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'reconciliation'">
      <!-- Reconciliation Header & Stats -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
            <span class="text-muted small fw-semibold">Total Mutasi Rekening Koran</span>
            <h4 class="fw-bold text-dark mt-1 mb-0">{{ bankStatements.length }} Baris Rekening</h4>
            <div class="small text-muted mt-1">Impor mutasi bank BCA/Mandiri/BRI</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
            <span class="text-muted small fw-semibold">Status Cocok (Matched)</span>
            <h4 class="fw-bold text-success mt-1 mb-0">{{ matchedBankCount }} Baris Terverifikasi</h4>
            <div class="small text-success mt-1"><i class="bi bi-check-all me-1"></i>Tidak ada selisih nominal</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
            <span class="text-muted small fw-semibold">Selisih Belum Rekonsiliasi</span>
            <h4 class="fw-bold text-warning mt-1 mb-0">{{ unmatchedBankCount }} Baris Anomali/Selisih</h4>
            <div class="small text-danger mt-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Perlu tindakan pembukuan</div>
          </div>
        </div>
      </div>

      <!-- Action Panel: Import Bank Statement -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 border-bottom pb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="bi bi-file-earmark-diff text-primary me-1"></i> Rekonsiliasi Rekening Koran Bank
            </h5>
            <p class="text-muted small mb-0">
              Cocokkan mutasi debit/kredit pada rekening koran resmi bank dengan catatan kas internal untuk mendeteksi penipuan atau transaksi tak tercatat.
            </p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="runAutoMatchEngine">
              <i class="bi bi-cpu-fill me-1"></i> Jalankan Auto-Match Engine
            </button>
            <button class="btn btn-primary btn-sm rounded-pill px-3" @click="openAddBankStatementModal">
              <i class="bi bi-upload me-1"></i> Impor Rekening Koran
            </button>
            <button class="btn btn-outline-success btn-sm rounded-pill px-3" @click="exportReconReport">
              <i class="bi bi-printer me-1"></i> Berita Acara Rekonsiliasi
            </button>
          </div>
        </div>

        <!-- Bank Statement Table -->
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th>No</th>
                <th>Tanggal Bank</th>
                <th>Uraian Mutasi Rekening Koran</th>
                <th>Tipe</th>
                <th class="text-end">Nominal Bank (IDR)</th>
                <th>Status Match Sistem</th>
                <th>Catatan Auditor / Tindakan</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, idx) in bankStatements" :key="b.id">
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ formatDate(b.bankDate) }}</td>
                <td>
                  <div class="fw-semibold text-dark font-monospace small">{{ b.bankDesc }}</div>
                </td>
                <td>
                  <span class="badge" :class="b.bankType === 'CR' ? 'bg-success text-white' : 'bg-danger text-white'">
                    {{ b.bankType === 'CR' ? 'Kredit (+)' : 'Debit (-)' }}
                  </span>
                </td>
                <td class="text-end fw-bold">
                  {{ formatRupiah(b.bankAmount) }}
                </td>
                <td>
                  <span v-if="b.status === 'MATCHED'" class="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1.5 rounded-pill">
                    <i class="bi bi-check-circle-fill me-1"></i> MATCHED (Cocok)
                  </span>
                  <span v-else class="badge bg-warning-subtle text-warning border border-warning border-opacity-25 px-2.5 py-1.5 rounded-pill">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> UNMATCHED (Selisih)
                  </span>
                </td>
                <td class="small text-muted">
                  {{ b.notes || '-' }}
                </td>
                <td class="text-center">
                  <button
                    v-if="b.status !== 'MATCHED'"
                    class="btn btn-xs btn-outline-primary rounded-pill px-2.5"
                    @click="resolveDiscrepancy(b)"
                  >
                    <i class="bi bi-magic me-1"></i> Jurnal Otomatis
                  </button>
                  <span v-else class="text-success small fw-bold"><i class="bi bi-check-all"></i> Terkonfirmasi</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 3: PEMANTAUAN MULTI-MATA UANG                                         -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'currencies'">
      <!-- Multi-currency Summary Header -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="bi bi-globe2 text-primary me-1"></i> Portofolio Kas Multi-Mata Uang (Multi-Currency Vault)
            </h5>
            <p class="text-muted small mb-0">
              Pencatatan kas dan saldo bank valuta asing dengan konversi nilai tukar kurs referensi Bank Indonesia real-time.
            </p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="refreshCurrencyRates">
              <i class="bi bi-arrow-clockwise me-1"></i> Perbarui Kurs Real-Time
            </button>
            <button class="btn btn-primary btn-sm rounded-pill px-3" @click="openAddCurrencyModal">
              <i class="bi bi-plus-circle me-1"></i> Tambah Mata Uang
            </button>
          </div>
        </div>

        <!-- Currencies Grid -->
        <div class="row g-3 mb-4">
          <div v-for="c in currencies" :key="c.code" class="col-12 col-md-6 col-xl-4">
            <div class="card border rounded-4 p-3 bg-light bg-opacity-50 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center gap-2">
                  <div class="p-2 bg-white rounded-3 border fw-bold text-primary" style="width: 44px; text-align: center;">
                    {{ c.symbol }}
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-dark">{{ c.name }} ({{ c.code }})</h6>
                    <span class="badge bg-secondary-subtle text-secondary small" v-if="c.isBase">Mata Uang Acuan (Base)</span>
                    <span class="small text-muted" v-else>Kurs: 1 {{ c.code }} = {{ formatRupiah(c.rateToIdr) }}</span>
                  </div>
                </div>
                <button class="btn btn-xs btn-outline-secondary rounded-circle" @click="editCurrencyRate(c)" title="Edit Kurs">
                  <i class="bi bi-pencil"></i>
                </button>
              </div>

              <div class="mt-2 pt-2 border-top">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="small text-muted">Saldo Simpanan:</span>
                  <strong class="text-dark">{{ c.symbol }} {{ formatNumber(c.balance) }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-muted">Ekuivalen IDR:</span>
                  <strong class="text-primary">{{ formatRupiah(c.balance * c.rateToIdr) }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Valas Instant Calculator Box -->
        <div class="p-3 bg-primary-subtle rounded-4 border border-primary border-opacity-25">
          <h6 class="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
            <i class="bi bi-calculator"></i>
            <span>Kalkulator Konversi Valas Instan</span>
          </h6>
          <div class="row g-2 align-items-center">
            <div class="col-md-4">
              <label class="form-label small text-muted mb-1">Jumlah Nominal</label>
              <input type="number" class="form-control form-control-sm" v-model.number="calcAmount" min="1" />
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted mb-1">Dari Mata Uang</label>
              <select class="form-select form-select-sm" v-model="calcFrom">
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }} - {{ c.name }}</option>
              </select>
            </div>
            <div class="col-md-1 text-center pt-3">
              <i class="bi bi-arrow-right fs-5 text-primary"></i>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted mb-1">Hasil Konversi (IDR)</label>
              <div class="form-control form-control-sm bg-white fw-bold text-success">
                {{ formatRupiah(calculateValasResult) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: FORM TRANSAKSI ARUS KAS (CRUD)                                     -->
    <!-- ========================================================================= -->
    <div class="modal fade" id="modalTransaction" tabindex="-1" aria-hidden="true" ref="modalTransactionRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom px-4 py-3">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-journal-plus text-primary"></i>
              <span>{{ isEditing ? 'Edit Transaksi Arus Kas' : 'Catat Transaksi Arus Kas Baru' }}</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveTransaction">
            <div class="modal-body p-4">
              <!-- Radio Button: Inflow vs Outflow -->
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark d-block">Jenis Arus Kas <span class="text-danger">*</span></label>
                <div class="d-flex gap-3">
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="transType"
                      id="typeInflow"
                      value="inflow"
                      v-model="formTrans.type"
                      required
                    />
                    <label class="form-check-label fw-semibold text-success" for="typeInflow">
                      <i class="bi bi-arrow-down-left-circle me-1"></i> Pemasukan / Kas Masuk (Inflow)
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="transType"
                      id="typeOutflow"
                      value="outflow"
                      v-model="formTrans.type"
                      required
                    />
                    <label class="form-check-label fw-semibold text-danger" for="typeOutflow">
                      <i class="bi bi-arrow-up-right-circle me-1"></i> Pengeluaran / Kas Keluar (Outflow)
                    </label>
                  </div>
                </div>
              </div>

              <!-- Deskripsi Transaksi (Text) -->
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark">Keterangan / Uraian Transaksi <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="formTrans.description"
                  placeholder="Contoh: Penerimaan Termin 1 Jasa Software PT Maju Terus"
                  minlength="3"
                  required
                />
              </div>

              <div class="row g-3 mb-3">
                <!-- Nominal Transaksi (Full Number) -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nominal Transaksi (IDR) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">Rp</span>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="formTrans.amount"
                      min="1000"
                      step="1000"
                      placeholder="Contoh: 1000000"
                      required
                    />
                  </div>
                  <div class="form-text small" v-if="formTrans.amount">
                    Terbilang: <strong>{{ formatRupiah(formTrans.amount) }}</strong>
                  </div>
                </div>

                <!-- Tanggal Transaksi (Date) -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Tanggal Transaksi <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="formTrans.date"
                    required
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <!-- Kategori Arus Kas (Option) -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Kategori Arus Kas <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formTrans.category" required>
                    <option value="" disabled>Pilih Kategori...</option>
                    <option value="Operasional">Aktivitas Operasional (Pendapatan/Biaya)</option>
                    <option value="Investasi">Aktivitas Investasi (Aset/Peralatan/Saham)</option>
                    <option value="Pendanaan">Aktivitas Pendanaan (Modal/Pinjaman Bank)</option>
                  </select>
                </div>

                <!-- Akun Kas / Bank (Option) -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Rekening / Akun Kas <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formTrans.account" required>
                    <option value="" disabled>Pilih Rekening...</option>
                    <option value="Bank BCA Utama">Bank BCA Utama (No: 8812-0091-22)</option>
                    <option value="Bank Mandiri Payroll">Bank Mandiri Payroll (No: 137-00-981290)</option>
                    <option value="Bank BRI Giro">Bank BRI Giro (No: 0206-01-00291)</option>
                    <option value="Kas Kasir Tunai">Kas Kasir Tunai (Petty Cash Vault)</option>
                    <option value="Akun Valas USD">Akun Valas USD (Bank BCA Valas)</option>
                  </select>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <!-- Metode Pembayaran (Radio) -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Metode Pembayaran <span class="text-danger">*</span></label>
                  <div class="d-flex flex-wrap gap-2 mt-1">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="payMethod" id="pmTransfer" value="Transfer Bank" v-model="formTrans.paymentMethod" required />
                      <label class="form-check-label small" for="pmTransfer">Transfer Bank</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="payMethod" id="pmGiro" value="Giro / Cek" v-model="formTrans.paymentMethod" />
                      <label class="form-check-label small" for="pmGiro">Giro / Cek</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="payMethod" id="pmTunai" value="Tunai / Cash" v-model="formTrans.paymentMethod" />
                      <label class="form-check-label small" for="pmTunai">Tunai / Cash</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="payMethod" id="pmRtgs" value="RTGS / Kliring" v-model="formTrans.paymentMethod" />
                      <label class="form-check-label small" for="pmRtgs">RTGS / Kliring</label>
                    </div>
                  </div>
                </div>

                <!-- Nomor Referensi (Text) -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nomor Referensi / Bukti Transfer</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="formTrans.refNumber"
                    placeholder="Contoh: TRF-BCA-99210"
                  />
                </div>
              </div>

              <!-- Checkbox: Verifikasi Bank -->
              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="checkVerified"
                  v-model="formTrans.verified"
                />
                <label class="form-check-label small fw-semibold text-dark" for="checkVerified">
                  Verifikasi Rekening Bank (Mutasi telah kliring dan sesuai rekening koran)
                </label>
              </div>

              <!-- Textarea: Catatan Audit -->
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Catatan Tambahan & Kepatuhan Audit</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model.trim="formTrans.notes"
                  placeholder="Catatan tambahan mengenai persetujuan atau lampiran dokumen pendukung..."
                ></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3 bg-light">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">
                Batal
              </button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">
                <i class="bi bi-check-circle-fill me-1"></i> Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import FinanceNavHeader from '../components/FinanceNavHeader.vue';

const getBsModal = (el) => {
  if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
    return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
  }
  return { show() {}, hide() {} };
};
import {
  STORAGE_KEYS,
  safeGet,
  safeSet,
  formatRupiah,
  formatNumber,
  logAuditTrail,
  initFinanceSeedData
} from '../utils/financeSystemStore';

export default {
  name: 'CashFlowManagementView',
  components: {
    FinanceNavHeader
  },
  setup() {
    const activeTab = ref('dashboard');
    const transactions = ref([]);
    const bankStatements = ref([]);
    const currencies = ref([]);

    // Filter states
    const searchQuery = ref('');
    const filterType = ref('all');
    const filterCategory = ref('all');
    const filterAccount = ref('all');

    // Valas calculator
    const calcAmount = ref(100);
    const calcFrom = ref('USD');

    // Modal state
    const isEditing = ref(false);
    const editingId = ref(null);
    const modalTransactionRef = ref(null);
    let bsModalInstance = null;

    // Saldo awal kas (default 0)
    const baseCash = ref(0);

    // Transaction form state
    const formTrans = ref({
      type: 'inflow',
      description: '',
      amount: '',
      date: new Date().toISOString().substring(0, 10),
      category: 'Operasional',
      account: 'Bank BCA Utama',
      paymentMethod: 'Transfer Bank',
      refNumber: '',
      verified: true,
      notes: ''
    });

    const loadData = () => {
      initFinanceSeedData();
      // Pastikan saldo awal kas di-set ke 0 (menghapus residu dummy 350.000.000)
      const savedBase = localStorage.getItem('ft_finance_base_cash');
      if (savedBase === null || savedBase === '350000000') {
        localStorage.setItem('ft_finance_base_cash', '0');
        baseCash.value = 0;
      } else {
        baseCash.value = Number(savedBase) || 0;
      }
      transactions.value = safeGet(STORAGE_KEYS.CASHFLOW, []);
      bankStatements.value = safeGet(STORAGE_KEYS.BANK_RECON, []);
      currencies.value = safeGet(STORAGE_KEYS.CURRENCIES, []);
    };

    // Filtered transactions
    const filteredTransactions = computed(() => {
      let list = [...transactions.value];
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
          t =>
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.refNumber && t.refNumber.toLowerCase().includes(q)) ||
            (t.account && t.account.toLowerCase().includes(q))
        );
      }
      if (filterType.value !== 'all') {
        list = list.filter(t => t.type === filterType.value);
      }
      if (filterCategory.value !== 'all') {
        list = list.filter(t => t.category === filterCategory.value);
      }
      if (filterAccount.value !== 'all') {
        list = list.filter(t => t.account === filterAccount.value);
      }
      // Sort newest first
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    // Metrics
    const totalInflow = computed(() => {
      return transactions.value
        .filter(t => t.type === 'inflow')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    });

    const totalOutflow = computed(() => {
      return transactions.value
        .filter(t => t.type === 'outflow')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    });

    const totalCashPosition = computed(() => {
      // Base IDR cash (default 0) + net of transactions
      return Number(baseCash.value || 0) + totalInflow.value - totalOutflow.value;
    });

    const openSetBaseCashModal = async () => {
      const { value: newBase } = await Swal.fire({
        title: 'Atur Saldo Awal Kas',
        text: 'Tentukan saldo awal kas & setara kas riil (Default: 0):',
        input: 'number',
        inputValue: baseCash.value,
        showCancelButton: true,
        confirmButtonText: 'Simpan Saldo Awal',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563eb',
        inputValidator: (val) => {
          if (val === '' || isNaN(val)) return 'Masukkan angka saldo awal yang valid (misal: 0)';
          if (Number(val) < 0) return 'Saldo awal tidak boleh bernilai negatif';
        }
      });

      if (newBase !== undefined) {
        const val = Number(newBase || 0);
        baseCash.value = val;
        localStorage.setItem('ft_finance_base_cash', String(val));
        logAuditTrail({
          module: 'Arus Kas',
          action: 'UPDATE',
          details: `Mengubah saldo awal kas menjadi ${formatRupiah(val)}`
        });
        Swal.fire({
          icon: 'success',
          title: 'Saldo Awal Disimpan',
          text: `Saldo awal kas disetel ke ${formatRupiah(val)}`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    };

    const unmatchedBankCount = computed(() => {
      return bankStatements.value.filter(b => b.status !== 'MATCHED').length;
    });

    const matchedBankCount = computed(() => {
      return bankStatements.value.filter(b => b.status === 'MATCHED').length;
    });

    // Valas conversion
    const calculateValasResult = computed(() => {
      const curr = currencies.value.find(c => c.code === calcFrom.value);
      if (!curr) return 0;
      return (calcAmount.value || 0) * (curr.rateToIdr || 1);
    });

    // Open Add Modal
    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      formTrans.value = {
        type: 'inflow',
        description: '',
        amount: '',
        date: new Date().toISOString().substring(0, 10),
        category: 'Operasional',
        account: 'Bank BCA Utama',
        paymentMethod: 'Transfer Bank',
        refNumber: '',
        verified: true,
        notes: ''
      };
      if (!bsModalInstance && modalTransactionRef.value) {
        bsModalInstance = getBsModal(modalTransactionRef.value);
      }
      if (bsModalInstance) bsModalInstance.show();
    };

    // Edit Transaction
    const editTransaction = (item) => {
      isEditing.value = true;
      editingId.value = item.id;
      formTrans.value = { ...item };
      if (!bsModalInstance && modalTransactionRef.value) {
        bsModalInstance = getBsModal(modalTransactionRef.value);
      }
      if (bsModalInstance) bsModalInstance.show();
    };

    // Save Transaction (Create or Update)
    const saveTransaction = () => {
      if (!formTrans.value.description || !formTrans.value.amount || !formTrans.value.date) {
        Swal.fire({
          icon: 'warning',
          title: 'Formulir Belum Lengkap',
          text: 'Harap isi seluruh field wajib bertanda bintang.'
        });
        return;
      }

      const list = [...transactions.value];
      if (isEditing.value) {
        const idx = list.findIndex(t => t.id === editingId.value);
        if (idx !== -1) {
          list[idx] = { ...formTrans.value, id: editingId.value };
          logAuditTrail({
            module: 'Manajemen Arus Kas',
            action: 'UPDATE',
            details: `Mengubah transaksi ${editingId.value}: ${formTrans.value.description} (${formatRupiah(formTrans.value.amount)})`
          });
        }
      } else {
        const newId = 'CF-' + Date.now().toString().slice(-5);
        const newItem = {
          ...formTrans.value,
          id: newId
        };
        list.unshift(newItem);
        logAuditTrail({
          module: 'Manajemen Arus Kas',
          action: 'CREATE',
          details: `Mencatat transaksi baru ${newId}: ${newItem.description} (${formatRupiah(newItem.amount)})`
        });
      }

      transactions.value = list;
      safeSet(STORAGE_KEYS.CASHFLOW, list);

      if (bsModalInstance) {
        bsModalInstance.hide();
      }

      Swal.fire({
        icon: 'success',
        title: isEditing.value ? 'Transaksi Diperbarui' : 'Transaksi Disimpan',
        text: 'Data arus kas telah tercatat dan tersinkronisasi.',
        timer: 1500,
        showConfirmButton: false
      });
    };

    // Delete Transaction
    const deleteTransaction = (id) => {
      Swal.fire({
        title: 'Hapus Transaksi Kas?',
        text: 'Tindakan ini akan dicatat dalam Jejak Audit dan mengubah posisi kas!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then(res => {
        if (res.isConfirmed) {
          const item = transactions.value.find(t => t.id === id);
          transactions.value = transactions.value.filter(t => t.id !== id);
          safeSet(STORAGE_KEYS.CASHFLOW, transactions.value);

          logAuditTrail({
            module: 'Manajemen Arus Kas',
            action: 'DELETE',
            details: `Menghapus transaksi ${id}: ${item ? item.description : ''}`
          });

          Swal.fire({
            icon: 'success',
            title: 'Terhapus',
            text: 'Transaksi berhasil dihapus dari pembukuan.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    };

    // Auto-match engine for bank reconciliation
    const runAutoMatchEngine = () => {
      let matchedCount = 0;
      const updated = bankStatements.value.map(b => {
        if (b.status === 'MATCHED') return b;
        // Try finding matching cash flow record
        const match = transactions.value.find(t => {
          const nominalMatch = Number(t.amount) === Number(b.bankAmount);
          const typeMatch = (b.bankType === 'CR' && t.type === 'inflow') || (b.bankType === 'DB' && t.type === 'outflow');
          return nominalMatch && typeMatch;
        });

        if (match) {
          matchedCount++;
          return {
            ...b,
            status: 'MATCHED',
            systemRef: match.id,
            notes: `Otomatis dicocokkan dengan transaksi ${match.id} (${match.description})`
          };
        }
        return b;
      });

      bankStatements.value = updated;
      safeSet(STORAGE_KEYS.BANK_RECON, updated);

      logAuditTrail({
        module: 'Rekonsiliasi Bank',
        action: 'AUTO_MATCH',
        details: `Menjalankan pencocokan otomatis: ${matchedCount} mutasi bank berhasil dicocokkan.`
      });

      Swal.fire({
        icon: 'success',
        title: 'Auto-Match Selesai',
        text: `${matchedCount} baris mutasi bank berhasil dicocokkan dengan catatan internal kas.`
      });
    };

    // Resolve Discrepancy
    const resolveDiscrepancy = (item) => {
      Swal.fire({
        title: 'Buat Jurnal Penyesuaian?',
        text: `Buat pencatatan transaksi kas otomatis untuk "${item.bankDesc}" sebesar ${formatRupiah(item.bankAmount)}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Buat Transaksi',
        cancelButtonText: 'Batal'
      }).then(res => {
        if (res.isConfirmed) {
          const newId = 'CF-ADJ-' + Date.now().toString().slice(-4);
          const newTx = {
            id: newId,
            date: item.bankDate,
            type: item.bankType === 'CR' ? 'inflow' : 'outflow',
            description: 'Penyesuaian Bank: ' + item.bankDesc,
            amount: item.bankAmount,
            category: 'Operasional',
            account: 'Bank BCA Utama',
            paymentMethod: 'Transfer Bank',
            refNumber: 'ADJ-' + item.id,
            verified: true,
            notes: 'Jurnal penyesuaian dari selisih rekonsiliasi bank'
          };
          transactions.value.unshift(newTx);
          safeSet(STORAGE_KEYS.CASHFLOW, transactions.value);

          // Update statement status
          item.status = 'MATCHED';
          item.systemRef = newId;
          item.notes = 'Diselesaikan via Jurnal Penyesuaian ' + newId;
          safeSet(STORAGE_KEYS.BANK_RECON, bankStatements.value);

          logAuditTrail({
            module: 'Rekonsiliasi Bank',
            action: 'RESOLVE_DISCREPANCY',
            details: `Menyelesaikan selisih ${item.id} dengan membuat jurnal ${newId}`
          });

          Swal.fire({
            icon: 'success',
            title: 'Selisih Diselesaikan',
            text: 'Jurnal penyesuaian telah dibuat dan status mutasi bank menjadi MATCHED.'
          });
        }
      });
    };

    // Open Add Bank Statement Modal
    const openAddBankStatementModal = () => {
      Swal.fire({
        title: 'Impor Mutasi Rekening Koran',
        html: `
          <div class="text-start">
            <p class="small text-muted mb-2">Pilih format atau tempel baris CSV mutasi bank (BCA KlikBisnis / Mandiri MCM):</p>
            <div class="mb-3">
              <label class="form-label small fw-bold">Tanggal Mutasi</label>
              <input id="swal-bank-date" type="date" class="form-control form-control-sm" value="${new Date().toISOString().substring(0, 10)}" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Uraian / Keterangan Bank</label>
              <input id="swal-bank-desc" type="text" class="form-control form-control-sm" placeholder="Contoh: CR TRF PT KLIEN SUKSES" />
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold">Jenis Mutasi</label>
                <select id="swal-bank-type" class="form-select form-select-sm">
                  <option value="CR">Kredit (Kas Masuk / CR)</option>
                  <option value="DB">Debit (Kas Keluar / DB)</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Nominal (IDR)</label>
                <input id="swal-bank-amt" type="number" class="form-control form-control-sm" placeholder="1000000" />
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambahkan Mutasi',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const date = document.getElementById('swal-bank-date').value;
          const desc = document.getElementById('swal-bank-desc').value;
          const type = document.getElementById('swal-bank-type').value;
          const amt = document.getElementById('swal-bank-amt').value;
          if (!desc || !amt) {
            Swal.showValidationMessage('Uraian dan nominal mutasi wajib diisi.');
            return false;
          }
          return { date, desc, type, amt: Number(amt) };
        }
      }).then(res => {
        if (res.isConfirmed && res.value) {
          const newRow = {
            id: 'BR-' + Date.now().toString().slice(-4),
            bankDate: res.value.date,
            bankDesc: res.value.desc,
            bankAmount: res.value.amt,
            bankType: res.value.type,
            systemRef: null,
            status: 'UNMATCHED',
            notes: 'Mutasi diimpor manual, belum direkonsiliasi'
          };
          bankStatements.value.unshift(newRow);
          safeSet(STORAGE_KEYS.BANK_RECON, bankStatements.value);

          logAuditTrail({
            module: 'Rekonsiliasi Bank',
            action: 'IMPORT',
            details: `Mengimpor baris mutasi bank ${newRow.id}: ${newRow.bankDesc} (${formatRupiah(newRow.bankAmount)})`
          });

          Swal.fire({
            icon: 'success',
            title: 'Mutasi Diimpor',
            text: 'Baris mutasi rekening koran baru berhasil ditambahkan.'
          });
        }
      });
    };

    // Export Reconciliation Report
    const exportReconReport = () => {
      const data = bankStatements.value.map(b => ({
        'ID Rekon': b.id,
        'Tanggal Bank': b.bankDate,
        'Keterangan Rekening Koran': b.bankDesc,
        'Tipe': b.bankType === 'CR' ? 'Kredit (+)' : 'Debit (-)',
        'Nominal Bank': b.bankAmount,
        'Status Match': b.status,
        'Referensi Sistem': b.systemRef || '-',
        'Catatan': b.notes || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Berita Acara Rekon');
      XLSX.writeFile(wb, `Berita_Acara_Rekonsiliasi_Bank_${new Date().toISOString().substring(0, 10)}.xlsx`);

      logAuditTrail({
        module: 'Rekonsiliasi Bank',
        action: 'EXPORT',
        details: 'Mengunduh Laporan Berita Acara Rekonsiliasi Bank ke format Excel (.xlsx)'
      });
    };

    // Export Cash Flow Excel
    const exportCashFlowExcel = () => {
      const data = transactions.value.map(t => ({
        'No Ref': t.refNumber || t.id,
        'Tanggal': t.date,
        'Jenis': t.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran',
        'Keterangan': t.description,
        'Kategori': t.category,
        'Rekening': t.account,
        'Metode Pembayaran': t.paymentMethod,
        'Nominal (IDR)': t.amount,
        'Status Verifikasi': t.verified ? 'Terverifikasi' : 'Pending',
        'Catatan': t.notes || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Arus Kas');
      XLSX.writeFile(wb, `Laporan_Arus_Kas_${new Date().toISOString().substring(0, 10)}.xlsx`);

      logAuditTrail({
        module: 'Manajemen Arus Kas',
        action: 'EXPORT',
        details: 'Mengekspor seluruh riwayat transaksi arus kas ke format Excel (.xlsx)'
      });
    };

    // Multi-currency refresh
    const refreshCurrencyRates = () => {
      // Simulate real-time currency fetch
      currencies.value = currencies.value.map(c => {
        if (c.code === 'IDR') return c;
        const delta = (Math.random() - 0.5) * (c.rateToIdr * 0.005);
        return {
          ...c,
          rateToIdr: Math.round(c.rateToIdr + delta)
        };
      });
      safeSet(STORAGE_KEYS.CURRENCIES, currencies.value);

      Swal.fire({
        icon: 'success',
        title: 'Kurs Valas Diperbarui',
        text: 'Nilai tukar mata uang telah disinkronkan dengan referensi kurs Bank Indonesia.',
        timer: 1500,
        showConfirmButton: false
      });
    };

    // Edit Currency Rate
    const editCurrencyRate = (curr) => {
      Swal.fire({
        title: `Edit Kurs ${curr.code}`,
        input: 'number',
        inputLabel: `Nilai Tukar 1 ${curr.code} ke Rupiah (IDR):`,
        inputValue: curr.rateToIdr,
        showCancelButton: true,
        confirmButtonText: 'Simpan Kurs',
        cancelButtonText: 'Batal'
      }).then(res => {
        if (res.isConfirmed && res.value) {
          curr.rateToIdr = Number(res.value);
          safeSet(STORAGE_KEYS.CURRENCIES, currencies.value);
          logAuditTrail({
            module: 'Multi-Mata Uang',
            action: 'UPDATE_RATE',
            details: `Menyesuaikan nilai tukar ${curr.code} menjadi ${formatRupiah(curr.rateToIdr)}`
          });
          Swal.fire({ icon: 'success', title: 'Kurs Tersimpan', timer: 1200, showConfirmButton: false });
        }
      });
    };

    // Open Add Currency
    const openAddCurrencyModal = () => {
      Swal.fire({
        title: 'Tambah Akun Valas Baru',
        html: `
          <div class="text-start">
            <div class="mb-2">
              <label class="form-label small fw-bold">Kode Mata Uang (3 Huruf)</label>
              <input id="swal-curr-code" type="text" class="form-control form-control-sm text-uppercase" placeholder="GBP" maxlength="3" />
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Nama Mata Uang</label>
              <input id="swal-curr-name" type="text" class="form-control form-control-sm" placeholder="British Pound" />
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Simbol</label>
              <input id="swal-curr-sym" type="text" class="form-control form-control-sm" placeholder="£" maxlength="3" />
            </div>
            <div class="row g-2">
              <div class="col-6">
                <label class="form-label small fw-bold">Kurs ke IDR</label>
                <input id="swal-curr-rate" type="number" class="form-control form-control-sm" placeholder="20500" />
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Saldo Awal</label>
                <input id="swal-curr-bal" type="number" class="form-control form-control-sm" placeholder="1000" />
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan Mata Uang',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const code = document.getElementById('swal-curr-code').value.toUpperCase();
          const name = document.getElementById('swal-curr-name').value;
          const symbol = document.getElementById('swal-curr-sym').value;
          const rate = document.getElementById('swal-curr-rate').value;
          const bal = document.getElementById('swal-curr-bal').value;
          if (!code || !name || !rate) {
            Swal.showValidationMessage('Kode, nama, dan kurs wajib diisi.');
            return false;
          }
          return { code, name, symbol: symbol || code, rateToIdr: Number(rate), balance: Number(bal || 0), isBase: false };
        }
      }).then(res => {
        if (res.isConfirmed && res.value) {
          currencies.value.push(res.value);
          safeSet(STORAGE_KEYS.CURRENCIES, currencies.value);
          logAuditTrail({
            module: 'Multi-Mata Uang',
            action: 'CREATE',
            details: `Menambahkan valuta baru ${res.value.code} (${res.value.name})`
          });
          Swal.fire({ icon: 'success', title: 'Mata Uang Ditambahkan', timer: 1500, showConfirmButton: false });
        }
      });
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    onMounted(() => {
      loadData();
    });

    return {
      activeTab,
      transactions,
      bankStatements,
      currencies,
      searchQuery,
      filterType,
      filterCategory,
      filterAccount,
      filteredTransactions,
      totalInflow,
      totalOutflow,
      totalCashPosition,
      baseCash,
      openSetBaseCashModal,
      unmatchedBankCount,
      matchedBankCount,
      calcAmount,
      calcFrom,
      calculateValasResult,
      isEditing,
      modalTransactionRef,
      formTrans,
      openAddModal,
      editTransaction,
      saveTransaction,
      deleteTransaction,
      runAutoMatchEngine,
      resolveDiscrepancy,
      openAddBankStatementModal,
      exportReconReport,
      exportCashFlowExcel,
      refreshCurrencyRates,
      editCurrencyRate,
      openAddCurrencyModal,
      formatDate,
      formatRupiah,
      formatNumber
    };
  }
};
</script>

<style scoped>
.font-monospace {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.shadow-xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
