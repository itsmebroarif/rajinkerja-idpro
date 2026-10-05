<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border no-print">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-success-subtle text-success fw-semibold px-3 py-1.5 rounded-pill">Financial Management</span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
          <span v-if="isBudgetExceeded" class="badge bg-danger text-white fw-bold px-3 py-1.5 rounded-pill shadow-sm">
            ⚠️ Budget Threshold Exceeded!
          </span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">Money & Financial Tracker</h2>
        <p class="text-muted mb-0">Pantau arus kas, batas anggaran bulanan, serta analisa grafik pemasukan vs pengeluaran.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <router-link to="/rab" class="btn btn-primary px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2">
          <i class="bi bi-calculator-fill fs-5"></i>
          <span>Kelola RAB & Kas Kegiatan</span>
        </router-link>
        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel (.xlsx)
        </button>
        <button
          class="btn btn-success px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          @click="toggleShowForm"
        >
          <i :class="showForm ? 'bi bi-x-lg' : 'bi bi-plus-circle-fill'" class="fs-5"></i>
          <span>{{ showForm ? 'Tutup Form' : 'Tambah / Bulk Transaksi' }}</span>
        </button>
      </div>
    </div>

    <!-- RAB & Kas Kegiatan Shortcut Banner -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 p-4 text-white no-print" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%);">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="p-3 bg-white bg-opacity-20 rounded-4 text-white fs-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
            <i class="bi bi-calculator-fill"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h5 class="fw-bold mb-0 text-white">📋 Management RAB & Kas Kegiatan (Project & Event)</h5>
              <span class="badge bg-warning text-dark fw-bold rounded-pill px-2.5 py-1">FITUR UTAMA</span>
            </div>
            <p class="small text-white text-opacity-85 mb-0 mt-1">
              Pencatatan Rencana Anggaran Biaya (RAB), Alokasi Income/Dana, Realisasi Belanja, serta Ekspor Laporan Resmi Excel (.xlsx) & PDF lengkap Slot Tanda Tangan Exporter.
            </p>
          </div>
        </div>
        <router-link to="/rab" class="btn btn-light btn-lg px-4 py-2 rounded-3 fw-bold text-dark shadow-sm text-nowrap d-flex align-items-center gap-2">
          <span>Kelola RAB Sekarang</span>
          <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <!-- Monthly Budget Threshold Banner / Setting -->
    <div
      class="card border-0 shadow-sm rounded-4 mb-4 p-4 transition-all no-print"
      :class="isBudgetExceeded ? 'bg-danger bg-opacity-10 border border-2 border-danger' : 'bg-white'"
    >
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-shield-lock-fill fs-4" :class="isBudgetExceeded ? 'text-danger' : 'text-primary'"></i>
            <h5 class="fw-bold mb-0" :class="isBudgetExceeded ? 'text-danger' : 'text-dark'">
              Target Batas Anggaran Bulanan (Monthly Budget Threshold)
            </h5>
          </div>
          <p class="small mb-0 mt-1" :class="isBudgetExceeded ? 'text-danger fw-semibold' : 'text-muted'">
            {{ isBudgetExceeded ? 'PERHATIAN: Pengeluaran bulan ini melampaui batas aman anggaran!' : 'Batas maksimal pengeluaran harian/bulanan agar kondisi kas tetap sehat.' }}
          </p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <div class="input-group" style="max-width: 280px;">
            <span class="input-group-text bg-light border-end-0 fw-bold">Rp</span>
            <input
              type="number"
              class="form-control fw-bold"
              :class="isBudgetExceeded ? 'border-danger text-danger bg-danger-subtle' : 'bg-light'"
              v-model.number="tempBudget"
              @blur="saveBudgetThreshold"
              placeholder="Contoh: 5000000"
            />
          </div>
          <button class="btn btn-primary rounded-3 fw-semibold px-3" @click="saveBudgetThreshold">
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Inline Form Panel (Single / Bulk Input) -->
    <div v-if="showForm" class="card border-0 shadow-lg rounded-4 mb-4 bg-white border-start border-4 border-success no-print">
      <div class="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
        <div class="btn-group" role="group">
          <button
            class="btn btn-sm px-3 py-1 fw-semibold"
            :class="formTab === 'single' ? 'btn-success text-white' : 'btn-outline-success'"
            @click="formTab = 'single'"
          >
            <i class="bi bi-pencil-square me-1"></i> Input Transaksi {{ isEditing ? '(Edit)' : '' }}
          </button>
          <button
            v-if="!isEditing"
            class="btn btn-sm px-3 py-1 fw-semibold"
            :class="formTab === 'bulk' ? 'btn-success text-white' : 'btn-outline-success'"
            @click="formTab = 'bulk'"
          >
            <i class="bi bi-stack me-1"></i> Bulk Input (Banyak Transaksi)
          </button>
        </div>
        <button type="button" class="btn-close" @click="showForm = false"></button>
      </div>

      <div class="card-body p-4">
        <!-- SINGLE FORM -->
        <form v-if="formTab === 'single'" @submit.prevent="saveTx">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold">Deskripsi / Item Pekerjaan <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.item }"
                v-model="form.item"
                placeholder="Contoh: Down Payment Proyek Web App"
              />
              <div class="invalid-feedback" v-if="formErrors.item">{{ formErrors.item }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Tipe Transaksi <span class="text-danger">*</span></label>
              <select class="form-select" v-model="form.type">
                <option value="income">Income (Pemasukan)</option>
                <option value="expense">Expense (Pengeluaran)</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nominal (Rp) <span class="text-danger">*</span></label>
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': formErrors.amount }"
                v-model.number="form.amount"
                placeholder="1000000"
              />
              <div class="invalid-feedback" v-if="formErrors.amount">{{ formErrors.amount }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Tanggal Transaksi <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                :class="{ 'is-invalid': formErrors.date }"
                v-model="form.date"
              />
              <div class="invalid-feedback" v-if="formErrors.date">{{ formErrors.date }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Kategori</label>
              <select class="form-select" v-model="form.category">
                <option value="Web Development">Web Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Retainer">Retainer Maintenance</option>
                <option value="Software Subscription">Software Subscription</option>
                <option value="Hosting">Hosting & VPS</option>
                <option value="Hardware">Hardware & Equipment</option>
                <option value="Office & Misc">Office & Misc</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Metode Pembayaran</label>
              <select class="form-select" v-model="form.method">
                <option value="Bank Transfer">Bank Transfer (BCA/Mandiri/etc)</option>
                <option value="PayPal / Wise">PayPal / Wise (USD)</option>
                <option value="E-Wallet">E-Wallet (GoPay/OVO/Dana)</option>
                <option value="Cash">Cash / Tunai</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Klien / Entitas Terkait</label>
              <input type="text" class="form-control" v-model="form.track" placeholder="Contoh: PT Teknologi Nusantara" />
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-semibold">
                {{ isEditing ? 'Simpan Perubahan' : 'Catat Transaksi' }}
              </button>
            </div>
          </div>
        </form>

        <!-- BULK FORM -->
        <form v-else @submit.prevent="saveBulkTx">
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info py-2 small mb-2">
                Format per baris: <strong>Deskripsi, Nominal (Nomor)</strong> (Atau tulis deskripsi saja per baris).
              </div>
              <label class="form-label fw-semibold">Daftar Transaksi (Satu per baris) <span class="text-danger">*</span></label>
              <textarea
                class="form-control font-monospace"
                rows="5"
                placeholder="Pembayaran DP Proyek Landing Page, 5000000&#10;Sewa Server VPS Bulan Juli, 350000"
                v-model="bulkText"
                :class="{ 'is-invalid': bulkError }"
              ></textarea>
              <div class="invalid-feedback" v-if="bulkError">{{ bulkError }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Tipe Default</label>
              <select class="form-select" v-model="bulkDefault.type">
                <option value="income">Income (Pemasukan)</option>
                <option value="expense">Expense (Pengeluaran)</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Tanggal Default</label>
              <input type="date" class="form-control" v-model="bulkDefault.date" />
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-semibold">
                Simpan Semua Transaksi (Bulk)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Summary Cards Row -->
    <div class="row g-3 mb-4 no-print">
      <!-- Income Card -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Total Pemasukan (Income)</span>
              <h3 class="fw-bold text-success mb-0 mt-1">{{ formatCurrency(totalIncome) }}</h3>
              <small class="text-muted">{{ incomeCount }} Transaksi Masuk</small>
            </div>
            <div class="p-3 bg-success-subtle text-success rounded-4 fs-2">
              <i class="bi bi-arrow-down-left-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Net Profit / Balance Card -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Sisa Kas Bersih (Profit)</span>
              <h3 class="fw-bold mb-0 mt-1" :class="netProfit >= 0 ? 'text-primary' : 'text-danger'">
                {{ formatCurrency(netProfit) }}
              </h3>
              <small class="text-muted">Margin Keuntungan: {{ profitMargin }}%</small>
            </div>
            <div class="p-3 bg-primary-subtle text-primary rounded-4 fs-2">
              <i class="bi bi-wallet-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Card -->
      <div class="col-md-4">
        <div
          class="card border-0 shadow-sm rounded-4 h-100 p-3 transition-all"
          :class="isBudgetExceeded ? 'bg-danger text-white border border-3 border-danger shadow-lg' : 'bg-white'"
        >
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span :class="isBudgetExceeded ? 'text-white-50' : 'text-muted'" class="small fw-semibold text-uppercase">
                Total Pengeluaran (Expense)
              </span>
              <h3 :class="isBudgetExceeded ? 'text-white fw-extrabold' : 'text-danger'" class="fw-bold mb-0 mt-1">
                {{ formatCurrency(totalExpense) }}
              </h3>
              <small :class="isBudgetExceeded ? 'text-white' : 'text-muted'">
                {{ isBudgetExceeded ? '⚠️ MELEBIHI THRESHOLD!' : expenseCount + ' Transaksi Keluar' }}
              </small>
            </div>
            <div
              class="p-3 rounded-4 fs-2"
              :class="isBudgetExceeded ? 'bg-white text-danger' : 'bg-danger-subtle text-danger'"
            >
              <i class="bi bi-arrow-up-right-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Chart Comparison Component -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4 no-print">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <h5 class="fw-bold text-dark mb-0"><i class="bi bi-bar-chart-fill text-primary me-2"></i>Analisis Grafik Bulanan: Income vs. Expense</h5>
          <p class="text-muted small mb-0">Visualisasi perbandingan total transaksi masuk dan keluar berdasarkan kategori.</p>
        </div>
        <div class="d-flex gap-2 mt-2 mt-md-0">
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="chartView = 'bar'" :class="{ active: chartView === 'bar' }">
            Bar Chart
          </button>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="chartView = 'pie'" :class="{ active: chartView === 'pie' }">
            Kategori Breakdown
          </button>
        </div>
      </div>

      <!-- SVG / Bar Chart Rendering -->
      <div v-if="chartView === 'bar'" class="chart-container py-3">
        <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
          <span>Skala Maksimal: {{ formatCurrency(maxChartVal) }}</span>
          <div class="d-flex gap-3">
            <span class="d-flex align-items-center gap-1"><span class="badge bg-success rounded-circle p-1"></span> Pemasukan</span>
            <span class="d-flex align-items-center gap-1"><span class="badge bg-danger rounded-circle p-1"></span> Pengeluaran</span>
          </div>
        </div>

        <div class="d-flex align-items-end gap-3 justify-content-around bg-light p-4 rounded-4" style="height: 220px;">
          <div class="text-center flex-fill d-flex flex-column align-items-center justify-content-end h-100">
            <span class="small fw-bold text-success mb-1">{{ formatCurrency(totalIncome) }}</span>
            <div
              class="bg-success rounded-top style-bar"
              :style="{ height: getBarHeight(totalIncome) + '%', width: '45px' }"
            ></div>
            <span class="small fw-semibold mt-2 text-dark">Income</span>
          </div>

          <div class="text-center flex-fill d-flex flex-column align-items-center justify-content-end h-100">
            <span class="small fw-bold text-danger mb-1">{{ formatCurrency(totalExpense) }}</span>
            <div
              class="rounded-top style-bar"
              :class="isBudgetExceeded ? 'bg-danger shadow-lg' : 'bg-danger bg-opacity-75'"
              :style="{ height: getBarHeight(totalExpense) + '%', width: '45px' }"
            ></div>
            <span class="small fw-semibold mt-2 text-dark">Expense</span>
          </div>

          <div class="text-center flex-fill d-flex flex-column align-items-center justify-content-end h-100">
            <span class="small fw-bold text-primary mb-1">{{ formatCurrency(budgetThreshold) }}</span>
            <div
              class="bg-primary rounded-top style-bar opacity-50"
              :style="{ height: getBarHeight(budgetThreshold) + '%', width: '45px' }"
            ></div>
            <span class="small fw-semibold mt-2 text-dark">Budget Threshold</span>
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div v-else class="py-3">
        <div class="row g-3">
          <div v-for="(catTotal, catName) in categoryBreakdown" :key="catName" class="col-md-6 col-lg-4">
            <div class="p-3 border rounded-3 bg-light">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold text-dark small">{{ catName }}</span>
                <span class="fw-bold text-primary small">{{ formatCurrency(catTotal) }}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" :style="{ width: getCatPercent(catTotal) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white no-print">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control bg-light border-start-0 py-2" placeholder="Cari item atau nama klien..." v-model="searchQuery" />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select bg-light py-2" v-model="filterType">
              <option value="">Semua Tipe Transaksi</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
          <div class="col-md-4 text-end d-flex gap-2">
            <button class="btn btn-outline-secondary w-100 py-2 rounded-3" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
            <button class="btn btn-outline-dark w-100 py-2 rounded-3" @click="triggerPrint">
              <i class="bi bi-printer me-1"></i> Cetak Laporan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Action Toolbar -->
    <div v-if="selectedIds.length > 0" class="alert alert-success d-flex justify-content-between align-items-center rounded-4 shadow-sm mb-4 py-2 px-3 no-print">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-square fs-5"></i>
        <span class="fw-bold">{{ selectedIds.length }} transaksi terpilih</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDelete">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
        <button class="btn btn-sm btn-light rounded-pill px-3" @click="selectedIds = []">
          Batal Pilih
        </button>
      </div>
    </div>

    <!-- Transactions Table & Spreadsheet Modes -->
    <div class="card border-0 shadow-sm rounded-4 bg-white mb-4">
      <!-- Mode View Header Switcher -->
      <div class="card-header bg-light border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2 no-print">
        <div class="d-flex align-items-center gap-2">
          <span class="fw-bold text-dark me-2"><i class="bi bi-grid-3x3-gap-fill text-success me-1"></i> Mode Tampilan:</span>
          <div class="btn-group p-1 bg-white rounded-3 border" role="group">
            <button
              class="btn btn-sm px-3 py-1.5 fw-bold transition-all"
              :class="modeView === 'table' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'"
              @click="modeView = 'table'"
            >
              <i class="bi bi-table me-1"></i> Standard Table
            </button>
            <button
              class="btn btn-sm px-3 py-1.5 fw-bold transition-all"
              :class="modeView === 'spreadsheet' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'"
              @click="modeView = 'spreadsheet'"
            >
              <i class="bi bi-file-earmark-excel-fill me-1"></i> Spreadsheet (Excel Grid & Formulas)
            </button>
            <button
              class="btn btn-sm px-3 py-1.5 fw-bold transition-all"
              :class="modeView === 'sql' ? 'btn-dark text-white shadow-sm' : 'btn-light text-dark'"
              @click="modeView = 'sql'"
            >
              <i class="bi bi-terminal-fill me-1"></i> SQL Query Mode
            </button>
          </div>
        </div>

        <span class="badge bg-light text-dark border px-3 py-1.5 fw-bold">{{ filteredTransactions.length }} Rekam Keuangan</span>
      </div>

      <!-- 1. STANDARD TABLE MODE -->
      <div class="card-body p-0" v-if="modeView === 'table'">
        <div class="table-responsive" v-if="filteredTransactions.length > 0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px;" class="text-center no-print">
                  <input type="checkbox" class="form-check-input" :checked="isAllSelected" @change="toggleSelectAll" />
                </th>
                <th style="width: 40px;" class="text-center">#</th>
                <th>Deskripsi Pekerjaan</th>
                <th>Kategori</th>
                <th>Tipe</th>
                <th>Pembayaran</th>
                <th>Tanggal</th>
                <th>Nominal</th>
                <th class="text-end pe-4 no-print" style="width: 120px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, index) in filteredTransactions" :key="t.id">
                <td class="text-center no-print">
                  <input type="checkbox" class="form-check-input" :value="t.id" v-model="selectedIds" />
                </td>
                <td class="text-center text-muted fw-bold">{{ index + 1 }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ t.item }}</div>
                  <small class="text-muted d-block" v-if="t.track"><i class="bi bi-building me-1"></i>{{ t.track }}</small>
                </td>
                <td>
                  <span class="badge bg-light text-dark border px-2 py-1 rounded-pill small">
                    {{ t.category || 'General' }}
                  </span>
                </td>
                <td>
                  <span :class="t.type === 'income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'" class="badge px-3 py-1 rounded-pill fw-semibold">
                    {{ t.type === 'income' ? 'Income' : 'Expense' }}
                  </span>
                </td>
                <td class="small text-secondary">{{ t.method || 'Bank Transfer' }}</td>
                <td class="small text-dark fw-semibold">{{ formatDate(t.date) }}</td>
                <td class="fw-bold" :class="t.type === 'income' ? 'text-success' : 'text-danger'">
                  {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </td>
                <td class="text-end pe-4 no-print">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-light text-primary rounded-circle" @click="editTx(t)" title="Edit">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger rounded-circle" @click="deleteTx(t.id)" title="Hapus">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          <p class="small mb-0">Belum ada data transaksi keuangan.</p>
        </div>
      </div>

      <!-- 2. SPREADSHEET (EXCEL) GRID MODE -->
      <div class="card-body p-3 bg-light" v-else-if="modeView === 'spreadsheet'">
        <!-- Formula Bar -->
        <div class="bg-white p-2 border rounded-3 mb-3 d-flex align-items-center gap-2 shadow-sm">
          <span class="badge bg-success font-monospace px-2.5 py-1.5 fw-bold">fx</span>
          <input
            type="text"
            class="form-control font-monospace border-1"
            v-model="formulaInput"
            placeholder="Masukkan rumus Excel (contoh: =SUM(E1:E10), =AVG(E1:E10), =MAX(E1:E10))"
            @keyup.enter="evaluateFormula"
          />
          <button class="btn btn-sm btn-success fw-bold px-3 text-nowrap" @click="evaluateFormula">Hitung Formula</button>
        </div>

        <div v-if="formulaResult !== null" class="alert alert-success border-0 shadow-sm p-3 mb-3 d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-calculator-fill me-2"></i>Hasil Formula Excel:</span>
          <span class="fw-extrabold fs-5 font-monospace text-success">{{ formulaResult }}</span>
        </div>

        <!-- Excel Grid Table -->
        <div class="table-responsive border rounded-3 bg-white shadow-sm" style="max-height: 400px;">
          <table class="table table-bordered table-sm font-monospace text-nowrap mb-0 align-middle">
            <thead class="table-dark text-center">
              <tr>
                <th style="width: 40px;">#</th>
                <th style="width: 50px;">Col</th>
                <th>A (Deskripsi)</th>
                <th>B (Kategori)</th>
                <th>C (Tipe)</th>
                <th>D (Tanggal)</th>
                <th>E (Nominal / Amount)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, idx) in filteredTransactions" :key="t.id">
                <td class="text-center bg-light text-muted fw-bold">{{ idx + 1 }}</td>
                <td class="text-center bg-light text-secondary small">R{{ idx + 1 }}</td>
                <td><input type="text" class="form-control form-control-sm border-0 font-monospace" v-model="t.item" /></td>
                <td><input type="text" class="form-control form-control-sm border-0 font-monospace" v-model="t.category" /></td>
                <td class="text-center">
                  <span class="badge" :class="t.type === 'income' ? 'bg-success' : 'bg-danger'">{{ t.type }}</span>
                </td>
                <td><input type="date" class="form-control form-control-sm border-0 font-monospace" v-model="t.date" /></td>
                <td><input type="number" class="form-control form-control-sm border-0 font-monospace fw-bold text-end" v-model.number="t.amount" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. SQL QUERY MODE -->
      <div class="card-body p-3 bg-dark text-light" v-else>
        <div class="mb-3">
          <label class="form-label fw-bold text-success font-monospace small"><i class="bi bi-terminal me-1"></i>SQL Query Runner (Table: transactions)</label>
          <div class="d-flex gap-2">
            <input type="text" class="form-control font-monospace bg-black text-success border-secondary" v-model="sqlQueryInput" placeholder="SELECT * FROM transactions WHERE type = 'income'" />
            <button class="btn btn-success fw-bold px-4" @click="runSqlQuery">RUN QUERY</button>
          </div>
          <small class="text-muted d-block mt-1">Coba query contoh: <code>SELECT * FROM transactions</code>, <code>SELECT * FROM transactions WHERE type = 'income'</code></small>
        </div>

        <div v-if="sqlResults.length > 0" class="table-responsive bg-black p-2 rounded border border-secondary">
          <table class="table table-dark table-striped table-sm font-monospace small mb-0">
            <thead>
              <tr>
                <th v-for="(val, key) in sqlResults[0]" :key="key" class="text-success">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sqlResults" :key="idx">
                <td v-for="(val, key) in row" :key="key">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3 no-print" style="z-index: 1090;">
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

export default {
  name: 'MoneyTracker',
  setup() {
    const store = useStore();

    const searchQuery = ref('');
    const filterType = ref('');
    const filterCategory = ref('');
    const chartView = ref('bar');
    const modeView = ref('table'); // 'table', 'spreadsheet', 'sql'
    const formulaInput = ref('=SUM(E1:E10)');
    const formulaResult = ref(null);
    const sqlQueryInput = ref('SELECT * FROM transactions');
    const sqlResults = ref([]);
    const tempBudget = ref(5000000);

    const evaluateFormula = () => {
      const amounts = (transactions.value || []).map(t => Number(t.amount || 0));
      const f = formulaInput.value.toUpperCase();
      if (f.includes('SUM')) {
        const total = amounts.reduce((a, b) => a + b, 0);
        formulaResult.value = `Rp ${total.toLocaleString('id-ID')}`;
      } else if (f.includes('AVG')) {
        const avg = amounts.length ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;
        formulaResult.value = `Rp ${avg.toLocaleString('id-ID')}`;
      } else if (f.includes('MAX')) {
        const max = amounts.length ? Math.max(...amounts) : 0;
        formulaResult.value = `Rp ${max.toLocaleString('id-ID')}`;
      } else {
        formulaResult.value = `Formula dievaluasi: ${amounts.reduce((a, b) => a + b, 0)}`;
      }
    };

    const runSqlQuery = () => {
      const q = sqlQueryInput.value.toLowerCase();
      if (q.includes('where type = \'income\'') || q.includes('where type="income"')) {
        sqlResults.value = (transactions.value || []).filter(t => t.type === 'income');
      } else if (q.includes('where type = \'expense\'') || q.includes('where type="expense"')) {
        sqlResults.value = (transactions.value || []).filter(t => t.type === 'expense');
      } else {
        sqlResults.value = (transactions.value || []);
      }
    };
    const showForm = ref(false);
    const formTab = ref('single');
    const isEditing = ref(false);
    const editingId = ref(null);
    const selectedIds = ref([]);

    const toast = ref({ show: false, message: '' });

    const form = ref({
      item: '',
      amount: '',
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      category: 'Web Development',
      method: 'Bank Transfer',
      track: ''
    });

    const formErrors = ref({});
    const bulkText = ref('');
    const bulkError = ref('');
    const bulkDefault = ref({
      type: 'income',
      date: new Date().toISOString().split('T')[0]
    });

    const transactions = computed(() => store.getters.getTransactions);
    const totalIncome = computed(() => store.getters.totalIncome);
    const totalExpense = computed(() => store.getters.totalExpense);
    const netProfit = computed(() => store.getters.netProfit);
    const budgetThreshold = computed(() => store.getters.getBudgetThreshold);
    const isBudgetExceeded = computed(() => store.getters.isBudgetExceeded);

    const incomeCount = computed(() => transactions.value.filter(t => t.type === 'income').length);
    const expenseCount = computed(() => transactions.value.filter(t => t.type === 'expense').length);

    const profitMargin = computed(() => {
      if (totalIncome.value === 0) return 0;
      return Math.round((netProfit.value / totalIncome.value) * 100);
    });

    const filteredTransactions = computed(() => {
      return transactions.value.filter(t => {
        const query = searchQuery.value.toLowerCase();
        const matchesQuery =
          !query ||
          t.item.toLowerCase().includes(query) ||
          (t.track && t.track.toLowerCase().includes(query));

        const matchesType = !filterType.value || t.type === filterType.value;
        const matchesCat = !filterCategory.value || t.category === filterCategory.value;

        return matchesQuery && matchesType && matchesCat;
      });
    });

    const isAllSelected = computed(() => {
      if (filteredTransactions.value.length === 0) return false;
      return filteredTransactions.value.every(t => selectedIds.value.includes(t.id));
    });

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedIds.value = [];
      } else {
        selectedIds.value = filteredTransactions.value.map(t => t.id);
      }
    };

    const maxChartVal = computed(() => {
      return Math.max(totalIncome.value, totalExpense.value, budgetThreshold.value, 1000000);
    });

    const getBarHeight = (val) => {
      if (!maxChartVal.value || val <= 0) return 5;
      return Math.min(100, Math.max(8, Math.round((val / maxChartVal.value) * 100)));
    };

    const categoryBreakdown = computed(() => {
      const res = {};
      transactions.value.forEach(t => {
        const cat = t.category || 'General';
        if (!res[cat]) res[cat] = 0;
        res[cat] += Number(t.amount || 0);
      });
      return res;
    });

    const getCatPercent = (val) => {
      const totalAll = totalIncome.value + totalExpense.value;
      if (totalAll === 0) return 0;
      return Math.round((val / totalAll) * 100);
    };

    const showToastMsg = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    onMounted(() => {
      tempBudget.value = budgetThreshold.value;
    });

    const toggleShowForm = () => {
      if (showForm.value) {
        showForm.value = false;
      } else {
        openAddModal();
      }
    };

    const saveBudgetThreshold = () => {
      store.dispatch('setBudgetThreshold', tempBudget.value);
      showToastMsg('Target anggaran bulanan berhasil diperbarui!');
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      formErrors.value = {};
      form.value = {
        item: '',
        amount: '',
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        category: 'Web Development',
        method: 'Bank Transfer',
        track: ''
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const editTx = (t) => {
      isEditing.value = true;
      editingId.value = t.id;
      formErrors.value = {};
      form.value = { ...t };
      formTab.value = 'single';
      showForm.value = true;
    };

    const saveTx = () => {
      formErrors.value = {};
      if (!form.value.item || !form.value.item.trim()) {
        formErrors.value.item = 'Deskripsi transaksi wajib diisi!';
        return;
      }
      if (!form.value.amount || Number(form.value.amount) <= 0) {
        formErrors.value.amount = 'Nominal transaksi harus lebih besar dari 0!';
        return;
      }
      if (!form.value.date) {
        formErrors.value.date = 'Tanggal transaksi wajib diisi!';
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateTransaction', { ...form.value, id: editingId.value });
        showToastMsg('Transaksi berhasil diperbarui!');
      } else {
        store.dispatch('addTransaction', form.value);
        showToastMsg('Transaksi berhasil dicatat!');
      }
      showForm.value = false;
    };

    const saveBulkTx = () => {
      bulkError.value = '';
      if (!bulkText.value || !bulkText.value.trim()) {
        bulkError.value = 'Tuliskan minimal 1 item transaksi!';
        return;
      }

      const lines = bulkText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const listToAdd = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          item: parts[0] || 'Transaksi Baru',
          amount: Number(parts[1]) || 100000,
          type: bulkDefault.value.type,
          date: bulkDefault.value.date,
          category: 'General',
          method: 'Bank Transfer',
          track: ''
        };
      });

      store.dispatch('addTransactionsBulk', listToAdd);
      showToastMsg(`Berhasil menambahkan ${listToAdd.length} transaksi secara bulk!`);
      bulkText.value = '';
      showForm.value = false;
    };

    const deleteTx = (id) => {
      Swal.fire({
        title: 'Hapus Transaksi?',
        text: 'Hapus transaksi ini dari riwayat keuangan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteTransaction', id);
          showToastMsg('Transaksi dihapus.');
        }
      });
    };

    const bulkDelete = () => {
      if (selectedIds.value.length === 0) return;
      Swal.fire({
        title: 'Hapus Masal?',
        text: `Hapus ${selectedIds.value.length} transaksi terpilih?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus Semua',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteTransactionsBulk', selectedIds.value);
          showToastMsg(`${selectedIds.value.length} transaksi berhasil dihapus.`);
          selectedIds.value = [];
        }
      });
    };

    const resetFilters = () => {
      searchQuery.value = '';
      filterType.value = '';
      filterCategory.value = '';
    };

    const formatCurrency = (val) => {
      if (isNaN(val)) val = 0;
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(val);
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

    const triggerPrint = () => {
      window.print();
    };

    const exportToExcel = () => {
      const exportData = transactions.value.map((t, idx) => ({
        No: idx + 1,
        Deskripsi: t.item,
        Nominal: t.amount,
        Tipe: t.type === 'income' ? 'Income' : 'Expense',
        Kategori: t.category || 'General',
        Metode: t.method || 'Bank Transfer',
        Tanggal: t.date,
        KlienAtauTerkait: t.track || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
      XLSX.writeFile(workbook, 'laporan_keuangan_freelance.xlsx');
      showToastMsg('File Excel laporan keuangan berhasil diunduh!');
    };

    return {
      searchQuery,
      filterType,
      filterCategory,
      chartView,
      modeView,
      formulaInput,
      formulaResult,
      sqlQueryInput,
      sqlResults,
      evaluateFormula,
      runSqlQuery,
      tempBudget,
      showForm,
      formTab,
      isEditing,
      form,
      formErrors,
      bulkText,
      bulkError,
      bulkDefault,
      selectedIds,
      isAllSelected,
      toggleSelectAll,
      transactions,
      filteredTransactions,
      totalIncome,
      totalExpense,
      netProfit,
      budgetThreshold,
      isBudgetExceeded,
      incomeCount,
      expenseCount,
      profitMargin,
      maxChartVal,
      getBarHeight,
      categoryBreakdown,
      getCatPercent,
      toast,
      toggleShowForm,
      saveBudgetThreshold,
      openAddModal,
      editTx,
      saveTx,
      saveBulkTx,
      deleteTx,
      bulkDelete,
      resetFilters,
      formatCurrency,
      formatDate,
      triggerPrint,
      exportToExcel
    };
  }
};
</script>

<style scoped>
.style-bar {
  transition: height 0.3s ease;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
