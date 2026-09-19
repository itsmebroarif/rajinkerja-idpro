<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Top Shared Header Navigation -->
    <FinanceNavHeader
      title="3. Manajemen Pengeluaran & Reimbursement"
      subtitle="Portal klaim biaya karyawan dengan pemindai struk otomatis (OCR), modul dana kas kecil (Petty Cash), dan integrasi kartu korporat eksekutif."
    />

    <!-- Main Navigation Sub-tabs -->
    <div class="card border-0 shadow-sm rounded-4 bg-white mb-4 p-2 no-print">
      <ul class="nav nav-pills nav-fill gap-2" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'claims' }"
            @click="activeTab = 'claims'"
          >
            <i class="bi bi-file-earmark-text"></i>
            <span>Portal Klaim Karyawan (Reimbursement)</span>
            <span class="badge bg-warning text-dark rounded-pill small" v-if="pendingClaimsCount > 0">
              {{ pendingClaimsCount }} Menunggu
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'petty-cash' }"
            @click="activeTab = 'petty-cash'"
          >
            <i class="bi bi-safe2"></i>
            <span>Manajemen Kas Kecil (Petty Cash)</span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'cards' }"
            @click="activeTab = 'cards'"
          >
            <i class="bi bi-credit-card-2-front"></i>
            <span>Integrasi Kartu Korporat (Corporate Cards)</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: PORTAL KLAIM REIMBURSEMENT (DENGAN SIMULASI OCR)                   -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'claims'">
      <!-- Metrik Klaim -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
            <span class="text-muted small fw-semibold">Total Klaim Bulan Ini</span>
            <h4 class="fw-bold mb-1 text-dark">{{ formatRupiah(totalClaimAmount) }}</h4>
            <div class="small text-muted">{{ claimsList.length }} Pengajuan Karyawan</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-warning">
            <span class="text-muted small fw-semibold">Menunggu Verifikasi Finance</span>
            <h4 class="fw-bold mb-1 text-warning">{{ pendingClaimsCount }} Pengajuan</h4>
            <div class="small text-muted">Perlu review nota & persetujuan</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <span class="text-muted small fw-semibold">Klaim Telah Dicairkan (Paid)</span>
            <h4 class="fw-bold mb-1 text-success">{{ formatRupiah(paidClaimsAmount) }}</h4>
            <div class="small text-success"><i class="bi bi-check-all me-1"></i>Via Transfer Payroll</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-info">
            <span class="text-muted small fw-semibold">Akurasi Ekstraksi OCR Struk</span>
            <h4 class="fw-bold mb-1 text-info">99.4%</h4>
            <div class="small text-muted">Auto-Detect Merchant & Nominal</div>
          </div>
        </div>
      </div>

      <!-- Action Toolbar Klaim -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Cari nama karyawan / merchant..."
                v-model="searchClaim"
              />
            </div>

            <select class="form-select form-select-sm" style="width: auto;" v-model="filterClaimStatus">
              <option value="all">Semua Status Klaim</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Diajukan (Submitted)</option>
              <option value="Approved">Disetujui (Approved)</option>
              <option value="Paid">Dibayarkan (Paid)</option>
              <option value="Rejected">Ditolak (Rejected)</option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-xs" @click="openAddClaimModal">
              <i class="bi bi-plus-circle-fill me-1"></i> Ajukan Klaim Reimbursement
            </button>
            <button class="btn btn-outline-success btn-sm px-3 rounded-pill fw-semibold" @click="exportClaimsExcel">
              <i class="bi bi-file-earmark-excel-fill text-success me-1"></i> Ekspor Klaim
            </button>
          </div>
        </div>
      </div>

      <!-- Claims Table -->
      <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-3 py-3">No. Klaim</th>
                <th>Karyawan & Divisi</th>
                <th>Kategori & Merchant</th>
                <th>Tanggal Nota</th>
                <th class="text-end">Jumlah Pengeluaran</th>
                <th>Struk / Bukti OCR</th>
                <th>Status</th>
                <th class="text-center pe-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredClaims.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  Belum ada pengajuan klaim yang sesuai dengan kriteria filter.
                </td>
              </tr>
              <tr v-for="c in filteredClaims" :key="c.id">
                <td class="ps-3 font-monospace fw-bold text-primary">{{ c.id }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ c.employeeName }}</div>
                  <div class="small text-muted">{{ c.department }} • NIK: {{ c.employeeId }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ c.category }}</span>
                  <div class="small text-muted mt-0.5">
                    <i class="bi bi-shop me-1"></i>{{ c.merchantName || 'Nota Fisik' }}
                  </div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ formatDate(c.expenseDate) }}</div>
                  <div class="small text-muted">{{ c.payoutMethod }}</div>
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ formatRupiah(c.amount) }}
                </td>
                <td>
                  <div class="d-flex align-items-center gap-1.5">
                    <button
                      class="btn btn-xs btn-outline-secondary rounded-pill px-2"
                      @click="previewReceipt(c)"
                      title="Lihat Gambar Kuitansi"
                    >
                      <i class="bi bi-image me-1"></i> Nota
                    </button>
                    <span v-if="c.ocrExtracted" class="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5" style="font-size: 10px;">
                      <i class="bi bi-stars"></i> OCR Ok
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge rounded-pill px-2.5 py-1"
                    :class="{
                      'bg-secondary text-white': c.status === 'Draft',
                      'bg-warning text-dark': c.status === 'Submitted',
                      'bg-info text-white': c.status === 'Approved',
                      'bg-success text-white': c.status === 'Paid',
                      'bg-danger text-white': c.status === 'Rejected'
                    }"
                  >
                    {{ c.status }}
                  </span>
                </td>
                <td class="text-center pe-3">
                  <div class="btn-group btn-group-sm">
                    <button
                      v-if="c.status === 'Submitted'"
                      class="btn btn-outline-success btn-sm"
                      @click="approveClaim(c)"
                      title="Setujui Klaim"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="editClaim(c)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="deleteClaim(c.id)" title="Hapus">
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
    <!-- TAB 2: MANAJEMEN KAS KECIL (PETTY CASH IMPREST)                           -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'petty-cash'">
      <!-- Petty Cash Overview Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
            <span class="text-muted small fw-semibold">Plafon Kas Kecil (Imprest Fund)</span>
            <h4 class="fw-bold text-dark mb-1">{{ formatRupiah(pettyCash.imprestCeiling) }}</h4>
            <div class="small text-muted">Dana tetap operasional kantor harian</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger">
            <span class="text-muted small fw-semibold">Total Pengeluaran Kasir Terpakai</span>
            <h4 class="fw-bold text-danger mb-1">{{ formatRupiah(totalPettyCashSpent) }}</h4>
            <div class="small text-danger fw-semibold">{{ pettyCash.transactions.length }} Voucher Terbit</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
            <span class="text-muted small fw-semibold">Sisa Uang Fisik di Kasir (Vault)</span>
            <h4 class="fw-bold text-success mb-1">{{ formatRupiah(remainingPettyCash) }}</h4>
            <div class="small text-success"><i class="bi bi-shield-check me-1"></i>Fisik Kas Siap Digunakan</div>
          </div>
        </div>
      </div>

      <!-- Action Panel Petty Cash -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="bi bi-cash-stack text-primary me-1"></i> Buku Kasir Kas Kecil (Petty Cash Ledger)
            </h5>
            <p class="text-muted small mb-0">
              Pencatatan belanja operasional taktis kantor skala mikro (maksimal Rp 1.000.000 per transaksi) beserta pembuktian cap lunas kuitansi fisik.
            </p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="replenishPettyCash">
              <i class="bi bi-arrow-repeat me-1"></i> Pengisian Kembali Kas Kecil (Replenish)
            </button>
            <button class="btn btn-primary btn-sm rounded-pill px-3" @click="openAddPettyCashModal">
              <i class="bi bi-plus-circle-fill me-1"></i> Catat Voucher Pengeluaran
            </button>
          </div>
        </div>

        <!-- Petty Cash Table -->
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th>No Voucher</th>
                <th>Tanggal</th>
                <th>Penerima Dana / PIC</th>
                <th>Uraian Pengeluaran Kasir</th>
                <th>Pos Beban Operasional</th>
                <th class="text-end">Nominal (IDR)</th>
                <th>Nota Cap LUNAS</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pettyCash.transactions" :key="p.id">
                <td class="font-monospace fw-bold text-primary">{{ p.voucherNo }}</td>
                <td>{{ formatDate(p.date) }}</td>
                <td class="fw-semibold text-dark">{{ p.recipient }}</td>
                <td>{{ p.description }}</td>
                <td><span class="badge bg-light text-secondary border">{{ p.expensePost }}</span></td>
                <td class="text-end fw-bold text-dark">{{ formatRupiah(p.amount) }}</td>
                <td>
                  <span v-if="p.physicalStampPaid" class="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-pill px-2 py-1">
                    <i class="bi bi-patch-check-fill me-1"></i> CAP LUNAS
                  </span>
                  <span v-else class="badge bg-danger-subtle text-danger rounded-pill px-2 py-1">
                    Belum Cap
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-xs btn-outline-danger" @click="deletePettyCashItem(p.id)" title="Hapus">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 3: INTEGRASI KARTU KORPORAT (CORPORATE CARDS)                         -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'cards'">
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="bi bi-credit-card-2-front-fill text-primary me-1"></i> Kartu Kredit & Debit Perusahaan (Corporate Cards)
            </h5>
            <p class="text-muted small mb-0">
              Sinkronisasi real-time pengeluaran transaksi kartu korporat yang dipegang manajemen untuk kebutuhan belanja iklan, perjalanan dinas, dan server.
            </p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="syncCorporateCards">
              <i class="bi bi-arrow-clockwise me-1"></i> Sinkronisasi Mutasi Kartu
            </button>
            <button class="btn btn-primary btn-sm rounded-pill px-3" @click="openAddCardTransactionModal">
              <i class="bi bi-plus-circle-fill me-1"></i> Catat Transaksi Kartu
            </button>
          </div>
        </div>

        <!-- Corporate Cards Grid -->
        <div class="row g-3 mb-4">
          <div v-for="card in corporateCards" :key="card.id" class="col-12 col-lg-6">
            <div class="card border rounded-4 p-4 shadow-xs" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff;">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span class="badge bg-primary text-white rounded-pill px-2.5 py-1 mb-2">Corporate Card</span>
                  <h6 class="fw-bold text-white mb-0">{{ card.cardName }}</h6>
                </div>
                <i class="bi bi-credit-card fs-2 text-white-50"></i>
              </div>

              <div class="font-monospace fs-5 text-white-50 letter-spacing-1 mb-3">
                {{ card.cardNumberMasked }}
              </div>

              <div class="d-flex justify-content-between align-items-end pt-2 border-top border-white border-opacity-10">
                <div>
                  <div class="small text-white-50" style="font-size: 11px;">PEMEGANG KARTU</div>
                  <div class="fw-bold small text-white">{{ card.cardHolder }}</div>
                </div>
                <div class="text-end">
                  <div class="small text-white-50" style="font-size: 11px;">LIMIT TERPAKAI</div>
                  <div class="fw-bold text-warning">{{ formatRupiah(card.currentBalanceUsed) }} / {{ formatRupiah(card.creditLimit) }}</div>
                </div>
              </div>

              <!-- Progress Limit -->
              <div class="progress mt-2" style="height: 6px; background-color: rgba(255,255,255,0.2);">
                <div
                  class="progress-bar bg-warning"
                  :style="{ width: ((card.currentBalanceUsed / card.creditLimit) * 100) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Card Transaction History -->
            <div class="card border rounded-4 mt-3 bg-light bg-opacity-50 p-3">
              <h6 class="fw-bold text-dark small mb-2">Transaksi Terakhir Kartu Ini:</h6>
              <div class="table-responsive">
                <table class="table table-sm table-borderless align-middle mb-0" style="font-size: 12px;">
                  <tbody>
                    <tr v-for="tx in card.transactions" :key="tx.id" class="border-bottom">
                      <td>{{ formatDate(tx.date) }}</td>
                      <td class="fw-bold text-dark">{{ tx.merchant }}</td>
                      <td><span class="badge bg-white text-dark border">{{ tx.category }}</span></td>
                      <td class="text-end fw-bold text-dark">{{ formatRupiah(tx.amount) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: FORM KLAIM REIMBURSEMENT DENGAN OCR SCANNER                        -->
    <!-- ========================================================================= -->
    <div class="modal fade" id="modalClaim" tabindex="-1" aria-hidden="true" ref="modalClaimRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom px-4 py-3">
            <h5 class="modal-title fw-bold text-dark">
              <i class="bi bi-file-earmark-medical text-primary me-1"></i>
              {{ isEditingClaim ? 'Edit Pengajuan Reimbursement' : 'Form Pengajuan Reimbursement Karyawan' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveClaim">
            <div class="modal-body p-4">
              <!-- OCR Scanner Banner Trigger -->
              <div class="p-3 bg-primary-subtle rounded-3 border border-primary border-opacity-25 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div class="fw-bold text-primary small d-flex align-items-center gap-1.5">
                    <i class="bi bi-stars"></i>
                    <span>Fitur Cerdas: OCR Pemindai Kuitansi Otomatis</span>
                  </div>
                  <div class="text-muted small" style="font-size: 12px;">
                    Unggah struk belanja dan sistem akan otomatis membaca merchant, tanggal, dan nominal transaksi!
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-xs"
                  @click="simulateOcrScan"
                >
                  <i class="bi bi-camera me-1"></i> Pindai Struk (OCR Auto-Fill)
                </button>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nama Karyawan Pemohon <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="formClaim.employeeName" placeholder="Contoh: Dimas Wicaksono" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nomor Induk Karyawan (NIK) <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="formClaim.employeeId" placeholder="Contoh: EMP-1049" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Departemen / Divisi <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formClaim.department" required>
                    <option value="Teknologi & Produk">Teknologi & Produk</option>
                    <option value="Penjualan & Pemasaran">Penjualan & Pemasaran</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                    <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Kategori Pengeluaran <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formClaim.category" required>
                    <option value="Transportasi & BBM">Transportasi, BBM & E-Toll</option>
                    <option value="Konsumsi Meeting Klien">Konsumsi Meeting Klien</option>
                    <option value="Tiket & Hotel Bisnis">Tiket & Hotel Bisnis</option>
                    <option value="Alat Tulis & Office">Alat Tulis & Office Supplies</option>
                    <option value="Medis & Kesehatan">Klaim Medis & Kesehatan</option>
                  </select>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Jumlah Nominal Reimbursement (IDR) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">Rp</span>
                    <input type="number" class="form-control" v-model.number="formClaim.amount" min="1000" step="500" placeholder="Contoh: 850000" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Tanggal Sesuai Nota/Kuitansi <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="formClaim.expenseDate" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nama Toko / Merchant / Restoran</label>
                  <input type="text" class="form-control" v-model.trim="formClaim.merchantName" placeholder="Contoh: The Grand Cafe Jakarta" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Metode Pencairan Reimbursement</label>
                  <div class="d-flex gap-3 mt-1.5">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="payoutPayroll" value="Transfer Rekening Payroll" v-model="formClaim.payoutMethod" />
                      <label class="form-check-label small" for="payoutPayroll">Transfer Gaji (Payroll)</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="payoutCash" value="Kas Tunai di Kasir" v-model="formClaim.payoutMethod" />
                      <label class="form-check-label small" for="payoutCash">Kas Tunai Kasir</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upload Kuitansi File Input -->
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark">Lampiran Foto Bukti Nota Fisik</label>
                <input type="file" class="form-control form-control-sm" accept="image/*,application/pdf" @change="onFileUploaded" />
                <div class="form-text small">Dukung format JPG, PNG, atau PDF kuitansi resmi.</div>
              </div>

              <!-- Checkbox Pernyataan Sah -->
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="checkTruth" v-model="formClaim.statementConfirmed" required />
                <label class="form-check-label small fw-semibold" for="checkTruth">
                  Saya menyatakan bahwa seluruh pengeluaran ini sah untuk kepentingan operasional perusahaan dan kuitansi asli telah dilampirkan. <span class="text-danger">*</span>
                </label>
              </div>

              <!-- Textarea Catatan -->
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Tujuan & Urgensi Bisnis</label>
                <textarea class="form-control" rows="2" v-model.trim="formClaim.description" placeholder="Keperluan jamuan klien tender atau dinas luar..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3 bg-light">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Ajukan Klaim Reimbursement</button>
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
  logAuditTrail,
  initFinanceSeedData
} from '../utils/financeSystemStore';

export default {
  name: 'ExpenseReimbursementView',
  components: {
    FinanceNavHeader
  },
  setup() {
    const activeTab = ref('claims');

    // Data lists
    const claimsList = ref([]);
    const pettyCash = ref({ imprestCeiling: 5000000, transactions: [] });
    const corporateCards = ref([]);

    // Filter states
    const searchClaim = ref('');
    const filterClaimStatus = ref('all');

    // Modals
    const modalClaimRef = ref(null);
    let bsModalClaim = null;

    // Form Claim
    const isEditingClaim = ref(false);
    const editingClaimId = ref(null);
    const formClaim = ref({
      employeeName: '',
      employeeId: '',
      department: 'Teknologi & Produk',
      expenseDate: new Date().toISOString().substring(0, 10),
      amount: '',
      category: 'Konsumsi Meeting Klien',
      payoutMethod: 'Transfer Rekening Payroll',
      merchantName: '',
      receiptFileUrl: '',
      ocrExtracted: false,
      statementConfirmed: true,
      status: 'Submitted',
      description: ''
    });

    const loadData = () => {
      initFinanceSeedData();
      claimsList.value = safeGet(STORAGE_KEYS.CLAIMS, []);
      pettyCash.value = safeGet(STORAGE_KEYS.PETTY_CASH, { imprestCeiling: 5000000, transactions: [] });
      corporateCards.value = safeGet(STORAGE_KEYS.CORP_CARDS, []);
    };

    // Filtered Claims
    const filteredClaims = computed(() => {
      let list = [...claimsList.value];
      if (searchClaim.value) {
        const q = searchClaim.value.toLowerCase();
        list = list.filter(
          c =>
            c.employeeName.toLowerCase().includes(q) ||
            (c.merchantName && c.merchantName.toLowerCase().includes(q)) ||
            c.id.toLowerCase().includes(q)
        );
      }
      if (filterClaimStatus.value !== 'all') {
        list = list.filter(c => c.status === filterClaimStatus.value);
      }
      return list;
    });

    // Metrics Claims
    const totalClaimAmount = computed(() => claimsList.value.reduce((s, c) => s + Number(c.amount || 0), 0));
    const pendingClaimsCount = computed(() => claimsList.value.filter(c => c.status === 'Submitted').length);
    const paidClaimsAmount = computed(() => claimsList.value.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.amount || 0), 0));

    // Petty Cash calculations
    const totalPettyCashSpent = computed(() => {
      return (pettyCash.value.transactions || []).reduce((s, p) => s + Number(p.amount || 0), 0);
    });
    const remainingPettyCash = computed(() => {
      return (pettyCash.value.imprestCeiling || 5000000) - totalPettyCashSpent.value;
    });

    // Open Add Claim
    const openAddClaimModal = () => {
      isEditingClaim.value = false;
      editingClaimId.value = null;
      formClaim.value = {
        employeeName: '',
        employeeId: '',
        department: 'Teknologi & Produk',
        expenseDate: new Date().toISOString().substring(0, 10),
        amount: '',
        category: 'Konsumsi Meeting Klien',
        payoutMethod: 'Transfer Rekening Payroll',
        merchantName: '',
        receiptFileUrl: '',
        ocrExtracted: false,
        statementConfirmed: true,
        status: 'Submitted',
        description: ''
      };
      if (!bsModalClaim && modalClaimRef.value) {
        bsModalClaim = getBsModal(modalClaimRef.value);
      }
      if (bsModalClaim) bsModalClaim.show();
    };

    const editClaim = (item) => {
      isEditingClaim.value = true;
      editingClaimId.value = item.id;
      formClaim.value = { ...item };
      if (!bsModalClaim && modalClaimRef.value) {
        bsModalClaim = getBsModal(modalClaimRef.value);
      }
      if (bsModalClaim) bsModalClaim.show();
    };

    // Simulated Smart OCR Scan
    const simulateOcrScan = () => {
      Swal.fire({
        title: 'Memindai Kuitansi (OCR)...',
        html: '<div class="text-center py-2"><div class="spinner-border text-primary" role="status"></div><div class="small text-muted mt-2">Membaca teks nota, total nominal, dan stempel merchant...</div></div>',
        timer: 1800,
        showConfirmButton: false
      }).then(() => {
        // Auto-fill values from simulated receipt
        formClaim.value.merchantName = 'Restoran Garuda Sabang Jakarta';
        formClaim.value.amount = 625000;
        formClaim.value.category = 'Konsumsi Meeting Klien';
        formClaim.value.expenseDate = new Date().toISOString().substring(0, 10);
        formClaim.value.ocrExtracted = true;
        formClaim.value.description = 'Jamuan makan siang koordinasi proyek dengan mitra konsultan';

        Swal.fire({
          icon: 'success',
          title: 'OCR Berhasil Mengekstrak!',
          text: 'Data merchant, tanggal, dan nominal Rp 625.000 otomatis terisi dari nota.'
        });
      });
    };

    const onFileUploaded = (e) => {
      const file = e.target.files[0];
      if (file) {
        formClaim.value.receiptFileUrl = URL.createObjectURL(file);
        Swal.fire({
          icon: 'info',
          title: 'Berkas Nota Dilampirkan',
          text: `File "${file.name}" siap diverifikasi oleh finance.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    };

    const saveClaim = () => {
      if (!formClaim.value.employeeName || !formClaim.value.amount || !formClaim.value.expenseDate) {
        Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Semua field wajib harus diisi.' });
        return;
      }
      const list = [...claimsList.value];
      if (isEditingClaim.value) {
        const idx = list.findIndex(c => c.id === editingClaimId.value);
        if (idx !== -1) {
          list[idx] = { ...formClaim.value, id: editingClaimId.value };
          logAuditTrail({
            module: 'Reimbursement',
            action: 'UPDATE',
            details: `Memperbarui klaim ${editingClaimId.value}: ${formClaim.value.merchantName} (${formatRupiah(formClaim.value.amount)})`
          });
        }
      } else {
        const newId = 'CLM-' + Date.now().toString().slice(-4);
        list.unshift({ ...formClaim.value, id: newId });
        logAuditTrail({
          module: 'Reimbursement',
          action: 'CREATE',
          details: `Mengajukan klaim reimbursement baru ${newId} oleh ${formClaim.value.employeeName} senilai ${formatRupiah(formClaim.value.amount)}`
        });
      }
      claimsList.value = list;
      safeSet(STORAGE_KEYS.CLAIMS, list);
      if (bsModalClaim) bsModalClaim.hide();
      Swal.fire({ icon: 'success', title: 'Klaim Berhasil Diajukan', timer: 1500, showConfirmButton: false });
    };

    const approveClaim = (c) => {
      Swal.fire({
        title: 'Verifikasi & Setujui Klaim?',
        html: `Setujui klaim reimbursement atas nama <strong>${c.employeeName}</strong> sebesar <strong>${formatRupiah(c.amount)}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Setujui',
        confirmButtonColor: '#10b981'
      }).then(res => {
        if (res.isConfirmed) {
          c.status = 'Approved';
          safeSet(STORAGE_KEYS.CLAIMS, claimsList.value);
          logAuditTrail({
            module: 'Reimbursement',
            action: 'APPROVE',
            details: `Menyetujui klaim reimbursement ${c.id} (${c.employeeName}) senilai ${formatRupiah(c.amount)}`
          });
          Swal.fire({ icon: 'success', title: 'Klaim Disetujui', timer: 1200, showConfirmButton: false });
        }
      });
    };

    const deleteClaim = (id) => {
      Swal.fire({
        title: 'Hapus Klaim?',
        text: 'Data klaim akan dihapus dari daftar pengajuan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
      }).then(res => {
        if (res.isConfirmed) {
          claimsList.value = claimsList.value.filter(c => c.id !== id);
          safeSet(STORAGE_KEYS.CLAIMS, claimsList.value);
          logAuditTrail({ module: 'Reimbursement', action: 'DELETE', details: `Menghapus klaim ${id}` });
          Swal.fire({ icon: 'success', title: 'Klaim Terhapus', timer: 1200, showConfirmButton: false });
        }
      });
    };

    const previewReceipt = (c) => {
      Swal.fire({
        title: `Bukti Nota: ${c.merchantName || c.id}`,
        html: `
          <div class="text-center p-2">
            <img src="${c.receiptFileUrl || 'https://images.unsplash.com/photo-1554415707-9e49017aed81?w=500&auto=format&fit=crop&q=60'}" class="img-fluid rounded-3 shadow-xs mb-3" style="max-height: 280px; object-fit: cover;" />
            <div class="text-start small bg-light p-3 rounded-3">
              <div><strong>Karyawan:</strong> ${c.employeeName} (${c.department})</div>
              <div><strong>Nominal:</strong> ${formatRupiah(c.amount)}</div>
              <div><strong>Tanggal:</strong> ${c.expenseDate}</div>
              <div><strong>Status OCR:</strong> ${c.ocrExtracted ? 'Terverifikasi Valid' : 'Manual'}</div>
            </div>
          </div>
        `,
        confirmButtonText: 'Tutup'
      });
    };

    // Petty Cash Actions
    const openAddPettyCashModal = () => {
      Swal.fire({
        title: 'Catat Voucher Kas Kecil Baru',
        html: `
          <div class="text-start">
            <div class="mb-2">
              <label class="form-label small fw-bold">Nama Penerima / PIC</label>
              <input id="swal-pc-rec" type="text" class="form-control form-control-sm" placeholder="Pak Joko (Office Boy)" />
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Uraian Keperluan</label>
              <input id="swal-pc-desc" type="text" class="form-control form-control-sm" placeholder="Pembelian Baterai Mic & Tisu Rapat" />
            </div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <label class="form-label small fw-bold">Nominal (Maks 1 Jt)</label>
                <input id="swal-pc-amt" type="number" class="form-control form-control-sm" placeholder="125000" min="1000" max="1000000" />
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Pos Beban</label>
                <select id="swal-pc-post" class="form-select form-select-sm">
                  <option value="Pantry & Logistik">Pantry & Logistik</option>
                  <option value="Kurir & Pos">Kurir & Pos</option>
                  <option value="Parkir & Transportasi">Parkir & Transportasi</option>
                  <option value="Kebersihan & Sanitasi">Kebersihan & Sanitasi</option>
                </select>
              </div>
            </div>
            <div class="form-check mt-2">
              <input type="checkbox" id="swal-pc-stamp" class="form-check-input" checked />
              <label class="form-check-label small fw-semibold" for="swal-pc-stamp">Nota fisik asli telah dicap LUNAS kasir</label>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Terbitkan Voucher',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const recipient = document.getElementById('swal-pc-rec').value;
          const desc = document.getElementById('swal-pc-desc').value;
          const amt = Number(document.getElementById('swal-pc-amt').value);
          const post = document.getElementById('swal-pc-post').value;
          const stamp = document.getElementById('swal-pc-stamp').checked;
          if (!recipient || !desc || !amt) {
            Swal.showValidationMessage('Nama penerima, uraian, dan nominal wajib diisi.');
            return false;
          }
          if (amt > 1000000) {
            Swal.showValidationMessage('Kas kecil dibatasi maksimal Rp 1.000.000 per transaksi.');
            return false;
          }
          return { recipient, desc, amt, post, stamp };
        }
      }).then(res => {
        if (res.isConfirmed && res.value) {
          const newVoucher = {
            id: 'PC-VCH-' + Date.now().toString().slice(-4),
            voucherNo: 'PC-2026-0' + ((pettyCash.value.transactions || []).length + 85),
            date: new Date().toISOString().substring(0, 10),
            recipient: res.value.recipient,
            description: res.value.desc,
            amount: res.value.amt,
            expensePost: res.value.post,
            physicalStampPaid: res.value.stamp
          };
          pettyCash.value.transactions.unshift(newVoucher);
          safeSet(STORAGE_KEYS.PETTY_CASH, pettyCash.value);

          logAuditTrail({
            module: 'Kas Kecil (Petty Cash)',
            action: 'CREATE_VOUCHER',
            details: `Menerbitkan voucher kas kecil ${newVoucher.voucherNo} untuk ${newVoucher.recipient} (${formatRupiah(newVoucher.amount)})`
          });

          Swal.fire({ icon: 'success', title: 'Voucher Kas Kecil Terbit', timer: 1500, showConfirmButton: false });
        }
      });
    };

    const replenishPettyCash = () => {
      const spent = totalPettyCashSpent.value;
      if (spent === 0) {
        Swal.fire({ icon: 'info', title: 'Saldo Masih Utuh', text: 'Kas kecil masih penuh sesuai plafon Rp 5.000.000.' });
        return;
      }
      Swal.fire({
        title: 'Pengisian Kembali Kas Kecil?',
        html: `Apakah Anda ingin mereplenish dana kas kecil sebesar <strong>${formatRupiah(spent)}</strong> untuk mengembalikan saldo kasir ke plafon Rp 5.000.000?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Replenish Dana',
        confirmButtonColor: '#10b981'
      }).then(res => {
        if (res.isConfirmed) {
          pettyCash.value.transactions = [];
          pettyCash.value.lastReplenishedDate = new Date().toISOString().substring(0, 10);
          safeSet(STORAGE_KEYS.PETTY_CASH, pettyCash.value);

          logAuditTrail({
            module: 'Kas Kecil (Petty Cash)',
            action: 'REPLENISH',
            details: `Melakukan pengisian kembali kas kecil sebesar ${formatRupiah(spent)} ke rekening kasir fisik`
          });

          Swal.fire({
            icon: 'success',
            title: 'Kasir Telah Direplenish',
            text: 'Saldo kas kecil telah dikembalikan ke plafon penuh Rp 5.000.000.'
          });
        }
      });
    };

    const deletePettyCashItem = (id) => {
      pettyCash.value.transactions = pettyCash.value.transactions.filter(t => t.id !== id);
      safeSet(STORAGE_KEYS.PETTY_CASH, pettyCash.value);
    };

    // Corporate Cards Actions
    const syncCorporateCards = () => {
      Swal.fire({
        title: 'Menyinkronkan Rekening Bank Korporat...',
        html: '<div class="spinner-border text-primary my-2"></div><div class="small text-muted">Mengunduh data transaksi kartu Visa Platinum & Mastercard...</div>',
        timer: 1600,
        showConfirmButton: false
      }).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Sinkronisasi Sukses',
          text: 'Semua transaksi kartu korporat terbaru telah diperbarui dari gateway bank.'
        });
      });
    };

    const openAddCardTransactionModal = () => {
      Swal.fire({
        title: 'Catat Transaksi Kartu Korporat',
        html: `
          <div class="text-start">
            <div class="mb-2">
              <label class="form-label small fw-bold">Pilih Kartu Korporat</label>
              <select id="swal-cc-card" class="form-select form-select-sm">
                ${corporateCards.value.map(c => `<option value="${c.id}">${c.cardName} (${c.cardHolder})</option>`).join('')}
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Nama Merchant</label>
              <input id="swal-cc-merch" type="text" class="form-control form-control-sm" placeholder="Amazon Web Services Inc" />
            </div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <label class="form-label small fw-bold">Nominal (IDR)</label>
                <input id="swal-cc-amt" type="number" class="form-control form-control-sm" placeholder="4500000" />
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Kategori</label>
                <select id="swal-cc-cat" class="form-select form-select-sm">
                  <option value="Software & Cloud">Software & Cloud</option>
                  <option value="Iklan Digital">Iklan Digital</option>
                  <option value="Representasi & Hotel">Representasi & Hotel</option>
                  <option value="Tiket Pesawat">Tiket Pesawat</option>
                </select>
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan Transaksi Kartu',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const cardId = document.getElementById('swal-cc-card').value;
          const merch = document.getElementById('swal-cc-merch').value;
          const amt = Number(document.getElementById('swal-cc-amt').value);
          const cat = document.getElementById('swal-cc-cat').value;
          if (!merch || !amt) {
            Swal.showValidationMessage('Merchant dan nominal harus diisi.');
            return false;
          }
          return { cardId, merch, amt, cat };
        }
      }).then(res => {
        if (res.isConfirmed && res.value) {
          const targetCard = corporateCards.value.find(c => c.id === res.value.cardId);
          if (targetCard) {
            const newTx = {
              id: 'CCT-' + Date.now().toString().slice(-4),
              date: new Date().toISOString().substring(0, 10),
              merchant: res.value.merch,
              amount: res.value.amt,
              category: res.value.cat,
              receiptAttached: true,
              synced: true
            };
            targetCard.transactions.unshift(newTx);
            targetCard.currentBalanceUsed += res.value.amt;
            safeSet(STORAGE_KEYS.CORP_CARDS, corporateCards.value);

            logAuditTrail({
              module: 'Kartu Korporat',
              action: 'TRANSACTION',
              details: `Mencatat transaksi kartu ${targetCard.cardName}: ${newTx.merchant} (${formatRupiah(newTx.amount)})`
            });

            Swal.fire({ icon: 'success', title: 'Transaksi Kartu Tersimpan', timer: 1500, showConfirmButton: false });
          }
        }
      });
    };

    const exportClaimsExcel = () => {
      const data = claimsList.value.map(c => ({
        'No Klaim': c.id,
        'Karyawan': c.employeeName,
        'NIK': c.employeeId,
        'Departemen': c.department,
        'Tanggal Nota': c.expenseDate,
        'Merchant': c.merchantName || '-',
        'Kategori': c.category,
        'Nominal (IDR)': c.amount,
        'Metode Pencairan': c.payoutMethod,
        'Status': c.status,
        'Urgensi': c.description || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reimbursement');
      XLSX.writeFile(wb, `Laporan_Reimbursement_${new Date().toISOString().substring(0, 10)}.xlsx`);
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
      claimsList,
      pettyCash,
      corporateCards,
      searchClaim,
      filterClaimStatus,
      filteredClaims,
      totalClaimAmount,
      pendingClaimsCount,
      paidClaimsAmount,
      totalPettyCashSpent,
      remainingPettyCash,
      modalClaimRef,
      formClaim,
      isEditingClaim,
      openAddClaimModal,
      editClaim,
      saveClaim,
      deleteClaim,
      approveClaim,
      previewReceipt,
      simulateOcrScan,
      onFileUploaded,
      openAddPettyCashModal,
      replenishPettyCash,
      deletePettyCashItem,
      syncCorporateCards,
      openAddCardTransactionModal,
      exportClaimsExcel,
      formatDate,
      formatRupiah
    };
  }
};
</script>

<style scoped>
.font-monospace {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.btn-xs {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
}
</style>
