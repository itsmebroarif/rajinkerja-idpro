<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Top Shared Header Navigation -->
    <FinanceNavHeader
      title="2. Manajemen Hutang dan Piutang (AP & AR)"
      subtitle="Pengelolaan faktur piutang klien (AR) dengan reminder otomatis, tagihan vendor (AP), dan alur persetujuan pencairan berjenjang (Multi-Tier Approval)."
    />

    <!-- Main Sub-tabs -->
    <div class="card border-0 shadow-sm rounded-4 bg-white mb-4 p-2 no-print">
      <ul class="nav nav-pills nav-fill gap-2" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'ar' }"
            @click="activeTab = 'ar'"
          >
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Piutang Klien (Accounts Receivable - AR)</span>
            <span class="badge bg-danger rounded-pill small" v-if="overdueArCount > 0">
              {{ overdueArCount }} Overdue
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'ap' }"
            @click="activeTab = 'ap'"
          >
            <i class="bi bi-box-arrow-up-right"></i>
            <span>Tagihan Vendor (Accounts Payable - AP)</span>
            <span class="badge bg-warning text-dark rounded-pill small" v-if="urgentApCount > 0">
              {{ urgentApCount }} Mendesak
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'approvals' }"
            @click="activeTab = 'approvals'"
          >
            <i class="bi bi-diagram-3"></i>
            <span>Alur Persetujuan (Approval Workflow)</span>
            <span class="badge bg-primary text-white rounded-pill small" v-if="pendingApprovalsCount > 0">
              {{ pendingApprovalsCount }} Antrean
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: PIUTANG USAHA (ACCOUNTS RECEIVABLE - AR)                            -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'ar'">
      <!-- Metrik Cards AR -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
            <span class="text-muted small fw-semibold">Total Piutang Belum Lunas</span>
            <h4 class="fw-bold mb-1 text-dark">{{ formatRupiah(totalUnpaidAr) }}</h4>
            <div class="small text-muted">{{ unpaidArList.length }} Faktur Tertunggak</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-danger">
            <span class="text-muted small fw-semibold">Piutang Lewat Jatuh Tempo (Overdue)</span>
            <h4 class="fw-bold mb-1 text-danger">{{ formatRupiah(totalOverdueAr) }}</h4>
            <div class="small text-danger fw-semibold"><i class="bi bi-exclamation-octagon me-1"></i>Perlu Pengingat Klien Segera</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <span class="text-muted small fw-semibold">Piutang Berhasil Ditagih (Lunas)</span>
            <h4 class="fw-bold mb-1 text-success">{{ formatRupiah(totalPaidAr) }}</h4>
            <div class="small text-success"><i class="bi bi-check-circle-fill me-1"></i>Kas Telah Diterima</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-info">
            <span class="text-muted small fw-semibold">Tingkat Penagihan (Collection Rate)</span>
            <h4 class="fw-bold mb-1 text-dark">{{ collectionRate }}%</h4>
            <div class="progress" style="height: 6px;">
              <div class="progress-bar bg-success" :style="{ width: collectionRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toolbar AR -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Cari klien / no faktur AR..."
                v-model="searchAr"
              />
            </div>

            <select class="form-select form-select-sm" style="width: auto;" v-model="filterArStatus">
              <option value="all">Semua Status Piutang</option>
              <option value="Unpaid">Belum Dibayar (Unpaid)</option>
              <option value="Partially Paid">Sebagian (Partially Paid)</option>
              <option value="Paid">Lunas (Paid)</option>
              <option value="Overdue">Lewat Jatuh Tempo (Overdue)</option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-xs" @click="openAddArModal">
              <i class="bi bi-plus-circle-fill me-1"></i> Buat Faktur Piutang (AR)
            </button>
            <button class="btn btn-outline-success btn-sm px-3 rounded-pill fw-semibold" @click="exportArExcel">
              <i class="bi bi-file-earmark-excel-fill text-success me-1"></i> Ekspor AR
            </button>
          </div>
        </div>
      </div>

      <!-- AR Table -->
      <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-3 py-3">No. Faktur AR</th>
                <th>Klien & Kontak</th>
                <th>Tanggal & Jatuh Tempo</th>
                <th>Syarat (Terms)</th>
                <th class="text-end">Nominal Tagihan</th>
                <th>Status</th>
                <th>Pengingat Otomatis</th>
                <th class="text-center pe-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredArList.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  Belum ada faktur piutang yang cocok dengan filter.
                </td>
              </tr>
              <tr v-for="ar in filteredArList" :key="ar.id">
                <td class="ps-3 font-monospace fw-bold text-primary">
                  {{ ar.invoiceNumber }}
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ ar.clientName }}</div>
                  <div class="small text-muted">
                    <i class="bi bi-envelope me-1"></i>{{ ar.clientEmail }}
                    <span v-if="ar.clientPhone" class="ms-2"><i class="bi bi-whatsapp text-success me-0.5"></i>{{ ar.clientPhone }}</span>
                  </div>
                </td>
                <td>
                  <div class="small text-muted">Terbit: {{ formatDate(ar.issueDate) }}</div>
                  <div class="fw-semibold" :class="isPastDue(ar.dueDate) && ar.status !== 'Paid' ? 'text-danger' : 'text-dark'">
                    Tempo: {{ formatDate(ar.dueDate) }}
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-secondary border">{{ ar.terms }}</span>
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ formatRupiah(ar.amount) }}
                </td>
                <td>
                  <span
                    class="badge rounded-pill px-2.5 py-1"
                    :class="{
                      'bg-danger text-white': ar.status === 'Overdue',
                      'bg-warning-subtle text-warning border border-warning': ar.status === 'Unpaid',
                      'bg-info-subtle text-info': ar.status === 'Partially Paid',
                      'bg-success text-white': ar.status === 'Paid'
                    }"
                  >
                    {{ ar.status }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="ar.status !== 'Paid'"
                    class="btn btn-xs btn-outline-primary rounded-pill px-2.5 d-flex align-items-center gap-1"
                    @click="sendAutomatedReminder(ar)"
                    title="Kirim pengingat tagihan via email / WA"
                  >
                    <i class="bi bi-bell-fill text-warning"></i>
                    <span>Kirim Reminder</span>
                  </button>
                  <span v-else class="text-success small fw-semibold">
                    <i class="bi bi-check2"></i> Selesai
                  </span>
                </td>
                <td class="text-center pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="editAr(ar)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="deleteAr(ar.id)" title="Hapus">
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
    <!-- TAB 2: TAGIHAN VENDOR (ACCOUNTS PAYABLE - AP)                              -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'ap'">
      <!-- Metrik Cards AP -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-indigo">
            <span class="text-muted small fw-semibold">Total Hutang Dagang (AP)</span>
            <h4 class="fw-bold mb-1 text-dark">{{ formatRupiah(totalApAmount) }}</h4>
            <div class="small text-muted">{{ apBills.length }} Tagihan Pemasok Tercatat</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-warning">
            <span class="text-muted small fw-semibold">Mendekati Jatuh Tempo (7 Hari)</span>
            <h4 class="fw-bold mb-1 text-warning">{{ urgentApCount }} Tagihan Kritis</h4>
            <div class="small text-warning"><i class="bi bi-clock-history me-1"></i>Hindari denda denda keterlambatan</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <span class="text-muted small fw-semibold">Sudah Disetujui Siap Bayar</span>
            <h4 class="fw-bold mb-1 text-success">{{ formatRupiah(approvedApAmount) }}</h4>
            <div class="small text-success"><i class="bi bi-shield-check me-1"></i>Telah Lolos Otorisasi</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-secondary">
            <span class="text-muted small fw-semibold">Jadwal Batch Pembayaran</span>
            <h4 class="fw-bold mb-1 text-dark">Batch Senin & Kamis</h4>
            <div class="small text-muted">Disburse terjadwal efisien</div>
          </div>
        </div>
      </div>

      <!-- Toolbar AP -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Cari vendor / faktur..."
                v-model="searchAp"
              />
            </div>

            <select class="form-select form-select-sm" style="width: auto;" v-model="filterApPriority">
              <option value="all">Semua Prioritas</option>
              <option value="Normal">Normal</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Mendesak">Mendesak</option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-xs" @click="openAddApModal">
              <i class="bi bi-plus-circle-fill me-1"></i> Rekam Tagihan Vendor (AP)
            </button>
            <button class="btn btn-outline-success btn-sm px-3 rounded-pill fw-semibold" @click="exportApExcel">
              <i class="bi bi-file-earmark-excel-fill text-success me-1"></i> Ekspor AP
            </button>
          </div>
        </div>
      </div>

      <!-- AP Table -->
      <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-3 py-3">Nama Vendor / Pemasok</th>
                <th>No Faktur Vendor</th>
                <th>Kategori & Batch</th>
                <th>Jatuh Tempo</th>
                <th class="text-end">Nominal Tagihan</th>
                <th>Potong PPh 23</th>
                <th>Prioritas & Status</th>
                <th class="text-center pe-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredApList.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  Belum ada tagihan vendor yang sesuai filter.
                </td>
              </tr>
              <tr v-for="ap in filteredApList" :key="ap.id">
                <td class="ps-3">
                  <div class="fw-bold text-dark">{{ ap.vendorName }}</div>
                  <div class="small text-muted" v-if="ap.notes">{{ ap.notes }}</div>
                </td>
                <td class="font-monospace text-secondary">{{ ap.vendorBillNumber }}</td>
                <td>
                  <div class="fw-semibold text-dark">{{ ap.category }}</div>
                  <span class="badge bg-light text-muted border">{{ ap.batchSchedule }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-danger">{{ formatDate(ap.dueDate) }}</div>
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ formatRupiah(ap.amount) }}
                </td>
                <td>
                  <span v-if="ap.withholdPph23" class="badge bg-primary-subtle text-primary border border-primary border-opacity-25 rounded-pill">
                    PPh 23 (2%)
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <span
                      class="badge rounded-pill"
                      :class="{
                        'bg-danger text-white': ap.priority === 'Mendesak',
                        'bg-warning text-dark': ap.priority === 'Tinggi',
                        'bg-secondary text-white': ap.priority === 'Normal'
                      }"
                    >
                      {{ ap.priority }}
                    </span>
                    <span class="badge bg-light text-dark border">{{ ap.status }}</span>
                  </div>
                </td>
                <td class="text-center pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="editAp(ap)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="deleteAp(ap.id)" title="Hapus">
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
    <!-- TAB 3: ALUR PERSETUJUAN PEMBAYARAN (MULTI-TIER APPROVAL)                  -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'approvals'">
      <!-- Approval Tier Matrix Explanation -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="bi bi-shield-check text-primary me-1"></i> Matriks Otorisasi Berjenjang (Multi-Tier Approval)
            </h5>
            <p class="text-muted small mb-0">
              Pencairan dana diatur berdasarkan batas wewenang nominal (Segregation of Duties) demi pencegahan kecurangan finansial.
            </p>
          </div>
          <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold" @click="openAddApprovalModal">
            <i class="bi bi-plus-circle-fill me-1"></i> Ajukan Pencairan Dana Baru
          </button>
        </div>

        <!-- Tier Matrix Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card border rounded-3 p-3 bg-light bg-opacity-50">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge bg-secondary text-white">Tier 1: Staf Keuangan</span>
                <i class="bi bi-person text-secondary fs-5"></i>
              </div>
              <h6 class="fw-bold text-dark mb-1">&lt; Rp 10.000.000</h6>
              <p class="small text-muted mb-0">Biaya operasional rutin skala kecil, ATK, reimbursement harian.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border rounded-3 p-3 bg-light bg-opacity-50 border-primary border-opacity-25">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge bg-primary text-white">Tier 2: Manajer Keuangan</span>
                <i class="bi bi-person-badge text-primary fs-5"></i>
              </div>
              <h6 class="fw-bold text-primary mb-1">Rp 10.000.000 - Rp 50.000.000</h6>
              <p class="small text-muted mb-0">Tagihan vendor rutin, langganan software, honor konsultan.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border rounded-3 p-3 bg-light bg-opacity-50 border-danger border-opacity-25">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge bg-danger text-white">Tier 3: Chief Financial Officer (CFO)</span>
                <i class="bi bi-shield-fill-check text-danger fs-5"></i>
              </div>
              <h6 class="fw-bold text-danger mb-1">&gt; Rp 50.000.000</h6>
              <p class="small text-muted mb-0">Capex besar, sewa gedung, pengadaan server, kontrak tender.</p>
            </div>
          </div>
        </div>

        <!-- Approvals Queue Table -->
        <h6 class="fw-bold text-dark mb-3">Antrean Pengajuan Otorisasi Pembayaran</h6>
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th>No Req</th>
                <th>Judul Permohonan Dana</th>
                <th>Pemohon & Divisi</th>
                <th class="text-end">Nominal Pengajuan</th>
                <th>Tier Wewenang</th>
                <th>Status Persetujuan</th>
                <th class="text-center">Aksi Otorisasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in approvalsList" :key="req.id">
                <td class="font-monospace fw-bold text-primary">{{ req.id }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ req.title }}</div>
                  <div class="small text-muted">{{ req.notes }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ req.requester }}</div>
                  <div class="small text-muted">{{ req.department }}</div>
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ formatRupiah(req.amount) }}
                </td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="{
                      'bg-secondary text-white': req.requiredTier === 'Staf',
                      'bg-primary text-white': req.requiredTier === 'Manager',
                      'bg-danger text-white': req.requiredTier === 'CFO'
                    }"
                  >
                    Otorisasi {{ req.requiredTier }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge rounded-pill px-2.5 py-1"
                    :class="{
                      'bg-warning text-dark': req.status.includes('Menunggu'),
                      'bg-success text-white': req.status === 'Disetujui',
                      'bg-danger text-white': req.status === 'Ditolak'
                    }"
                  >
                    {{ req.status }}
                  </span>
                  <div class="small text-muted mt-1" v-if="req.approvedBy">
                    Oleh: {{ req.approvedBy }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-1.5" v-if="req.status.includes('Menunggu')">
                    <button
                      class="btn btn-xs btn-success rounded-pill px-2.5 fw-semibold d-flex align-items-center gap-1"
                      @click="processApproval(req, true)"
                      title="Setujui Pencairan Dana"
                    >
                      <i class="bi bi-check-circle-fill"></i>
                      <span>Approve</span>
                    </button>
                    <button
                      class="btn btn-xs btn-outline-danger rounded-pill px-2.5 fw-semibold d-flex align-items-center gap-1"
                      @click="processApproval(req, false)"
                      title="Tolak Pengajuan"
                    >
                      <i class="bi bi-x-circle-fill"></i>
                      <span>Reject</span>
                    </button>
                  </div>
                  <span v-else class="text-muted small fw-semibold">
                    <i class="bi bi-lock-fill me-1"></i>Tuntas
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: FORM FAKTUR PIUTANG (AR)                                           -->
    <!-- ========================================================================= -->
    <div class="modal fade" id="modalAr" tabindex="-1" aria-hidden="true" ref="modalArRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom px-4 py-3">
            <h5 class="modal-title fw-bold text-dark">
              <i class="bi bi-receipt text-primary me-1"></i>
              {{ isEditingAr ? 'Edit Faktur Piutang (AR)' : 'Buat Faktur Piutang Baru (AR)' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveAr">
            <div class="modal-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nomor Faktur Piutang <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="formAr.invoiceNumber" placeholder="Contoh: INV-AR-2026-005" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nama Klien / Perusahaan <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="formAr.clientName" placeholder="Contoh: PT Nusantara Digital" minlength="3" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Email Kontak Klien <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" v-model.trim="formAr.clientEmail" placeholder="billing@client.com" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">No. WhatsApp Klien</label>
                  <input type="tel" class="form-control" v-model.trim="formAr.clientPhone" placeholder="08123456789" />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nominal Tagihan (IDR) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">Rp</span>
                    <input type="number" class="form-control" v-model.number="formAr.amount" min="10000" step="1000" placeholder="Contoh: 50000000" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Syarat Pembayaran (Terms) <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formAr.terms" required>
                    <option value="Net 15">Net 15 (Jatuh tempo 15 hari)</option>
                    <option value="Net 30">Net 30 (Jatuh tempo 30 hari)</option>
                    <option value="Net 60">Net 60 (Jatuh tempo 60 hari)</option>
                    <option value="Cash On Delivery">Cash On Delivery (COD)</option>
                  </select>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Tanggal Terbit Faktur <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="formAr.issueDate" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="formAr.dueDate" required />
                </div>
              </div>

              <!-- Radio: Status Piutang -->
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark d-block">Status Piutang <span class="text-danger">*</span></label>
                <div class="d-flex flex-wrap gap-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="arStatusUnpaid" value="Unpaid" v-model="formAr.status" />
                    <label class="form-check-label small" for="arStatusUnpaid">Belum Dibayar (Unpaid)</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="arStatusPartial" value="Partially Paid" v-model="formAr.status" />
                    <label class="form-check-label small" for="arStatusPartial">Sebagian (Partially Paid)</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="arStatusPaid" value="Paid" v-model="formAr.status" />
                    <label class="form-check-label small text-success fw-bold" for="arStatusPaid">Lunas (Paid)</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="arStatusOverdue" value="Overdue" v-model="formAr.status" />
                    <label class="form-check-label small text-danger fw-bold" for="arStatusOverdue">Lewat Jatuh Tempo (Overdue)</label>
                  </div>
                </div>
              </div>

              <!-- Checkbox: Automated Reminders -->
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="checkAutoReminder" v-model="formAr.autoReminder" />
                <label class="form-check-label small fw-semibold" for="checkAutoReminder">
                  Aktifkan Pengingat Otomatis (Automated Reminders H-3 & Hari H ke email klien)
                </label>
              </div>

              <!-- Textarea: Scope -->
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Uraian Proyek / Jasa</label>
                <textarea class="form-control" rows="2" v-model.trim="formAr.scopeOfWork" placeholder="Rincian deliverables atau jasa yang ditagihkan..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3 bg-light">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Simpan Faktur AR</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: FORM TAGIHAN VENDOR (AP)                                           -->
    <!-- ========================================================================= -->
    <div class="modal fade" id="modalAp" tabindex="-1" aria-hidden="true" ref="modalApRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom px-4 py-3">
            <h5 class="modal-title fw-bold text-dark">
              <i class="bi bi-box-arrow-up-right text-indigo me-1"></i>
              {{ isEditingAp ? 'Edit Tagihan Vendor (AP)' : 'Rekam Tagihan Vendor Baru (AP)' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveAp">
            <div class="modal-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nama Vendor / Supplier <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="formAp.vendorName" placeholder="Contoh: PT Supplier Utama" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nomor Faktur Vendor <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="formAp.vendorBillNumber" placeholder="Contoh: INV-VND-99210" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nominal Tagihan (IDR) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">Rp</span>
                    <input type="number" class="form-control" v-model.number="formAp.amount" min="10000" step="1000" placeholder="Contoh: 15000000" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="formAp.dueDate" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Kategori Pengeluaran Vendor <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formAp.category" required>
                    <option value="Bahan Baku & Material">Bahan Baku & Material</option>
                    <option value="Software & Cloud IT">Software & Cloud IT</option>
                    <option value="Sewa Properti">Sewa Properti</option>
                    <option value="Konsultan Legal">Konsultan Legal</option>
                    <option value="Utilitas & Jaringan">Utilitas & Jaringan</option>
                    <option value="Logistik & Ekspedisi">Logistik & Ekspedisi</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Jadwal Pembayaran Batch <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formAp.batchSchedule" required>
                    <option value="Batch Senin">Batch Senin (Awal Pekan)</option>
                    <option value="Batch Kamis">Batch Kamis (Pertengahan)</option>
                    <option value="Batch Akhir Bulan">Batch Akhir Bulan</option>
                  </select>
                </div>
              </div>

              <!-- Radio: Prioritas -->
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark d-block">Tingkat Prioritas Pembayaran <span class="text-danger">*</span></label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="prioNormal" value="Normal" v-model="formAp.priority" />
                    <label class="form-check-label small" for="prioNormal">Normal</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="prioTinggi" value="Tinggi" v-model="formAp.priority" />
                    <label class="form-check-label small text-warning fw-semibold" for="prioTinggi">Tinggi</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="prioMendesak" value="Mendesak" v-model="formAp.priority" />
                    <label class="form-check-label small text-danger fw-bold" for="prioMendesak">Mendesak (Urgent)</label>
                  </div>
                </div>
              </div>

              <!-- Checkbox: PPh 23 -->
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="checkPph23" v-model="formAp.withholdPph23" />
                <label class="form-check-label small fw-semibold" for="checkPph23">
                  Wajib Potong Pajak Penghasilan PPh 23 (2%) sebelum transfer
                </label>
              </div>

              <!-- Textarea: Notes -->
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Catatan Rekening Vendor</label>
                <textarea class="form-control" rows="2" v-model.trim="formAp.notes" placeholder="No Rekening BCA / Mandiri vendor dan catatan termin..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3 bg-light">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Simpan Tagihan AP</button>
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
  getCurrentRole,
  logAuditTrail,
  initFinanceSeedData
} from '../utils/financeSystemStore';

export default {
  name: 'AccountsPayableReceivableView',
  components: {
    FinanceNavHeader
  },
  setup() {
    const activeTab = ref('ar');

    // Data lists
    const arInvoices = ref([]);
    const apBills = ref([]);
    const approvalsList = ref([]);

    // Filter states
    const searchAr = ref('');
    const filterArStatus = ref('all');
    const searchAp = ref('');
    const filterApPriority = ref('all');

    // Modals
    const modalArRef = ref(null);
    const modalApRef = ref(null);
    let bsModalAr = null;
    let bsModalAp = null;

    // AR Form state
    const isEditingAr = ref(false);
    const editingArId = ref(null);
    const formAr = ref({
      invoiceNumber: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      amount: '',
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: '',
      terms: 'Net 30',
      status: 'Unpaid',
      autoReminder: true,
      scopeOfWork: ''
    });

    // AP Form state
    const isEditingAp = ref(false);
    const editingApId = ref(null);
    const formAp = ref({
      vendorName: '',
      vendorBillNumber: '',
      amount: '',
      dueDate: '',
      category: 'Software & Cloud IT',
      priority: 'Normal',
      batchSchedule: 'Batch Senin',
      withholdPph23: true,
      status: 'Scheduled',
      notes: ''
    });

    const loadData = () => {
      initFinanceSeedData();
      arInvoices.value = safeGet(STORAGE_KEYS.AR_INVOICES, []);
      apBills.value = safeGet(STORAGE_KEYS.AP_BILLS, []);
      approvalsList.value = safeGet(STORAGE_KEYS.APPROVALS, []);
    };

    // Filtered AR
    const filteredArList = computed(() => {
      let list = [...arInvoices.value];
      if (searchAr.value) {
        const q = searchAr.value.toLowerCase();
        list = list.filter(
          a =>
            a.clientName.toLowerCase().includes(q) ||
            a.invoiceNumber.toLowerCase().includes(q) ||
            a.clientEmail.toLowerCase().includes(q)
        );
      }
      if (filterArStatus.value !== 'all') {
        list = list.filter(a => a.status === filterArStatus.value);
      }
      return list;
    });

    // Filtered AP
    const filteredApList = computed(() => {
      let list = [...apBills.value];
      if (searchAp.value) {
        const q = searchAp.value.toLowerCase();
        list = list.filter(
          b =>
            b.vendorName.toLowerCase().includes(q) ||
            b.vendorBillNumber.toLowerCase().includes(q)
        );
      }
      if (filterApPriority.value !== 'all') {
        list = list.filter(b => b.priority === filterApPriority.value);
      }
      return list;
    });

    // AR Metrics
    const unpaidArList = computed(() => arInvoices.value.filter(a => a.status !== 'Paid'));
    const totalUnpaidAr = computed(() => unpaidArList.value.reduce((s, a) => s + Number(a.amount || 0), 0));
    const totalOverdueAr = computed(() => arInvoices.value.filter(a => a.status === 'Overdue').reduce((s, a) => s + Number(a.amount || 0), 0));
    const totalPaidAr = computed(() => arInvoices.value.filter(a => a.status === 'Paid').reduce((s, a) => s + Number(a.amount || 0), 0));
    const overdueArCount = computed(() => arInvoices.value.filter(a => a.status === 'Overdue').length);
    const collectionRate = computed(() => {
      const all = arInvoices.value.reduce((s, a) => s + Number(a.amount || 0), 0);
      if (all === 0) return 100;
      return Math.round((totalPaidAr.value / all) * 100);
    });

    // AP Metrics
    const totalApAmount = computed(() => apBills.value.reduce((s, b) => s + Number(b.amount || 0), 0));
    const approvedApAmount = computed(() => apBills.value.filter(b => b.status === 'Approved').reduce((s, b) => s + Number(b.amount || 0), 0));
    const urgentApCount = computed(() => apBills.value.filter(b => b.priority === 'Mendesak').length);
    const pendingApprovalsCount = computed(() => approvalsList.value.filter(r => r.status.includes('Menunggu')).length);

    // Date check
    const isPastDue = (dateStr) => {
      if (!dateStr) return false;
      return new Date(dateStr) < new Date();
    };

    // Open Add AR Modal
    const openAddArModal = () => {
      isEditingAr.value = false;
      editingArId.value = null;
      formAr.value = {
        invoiceNumber: 'INV-AR-2026-00' + (arInvoices.value.length + 1),
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        amount: '',
        issueDate: new Date().toISOString().substring(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
        terms: 'Net 30',
        status: 'Unpaid',
        autoReminder: true,
        scopeOfWork: ''
      };
      if (!bsModalAr && modalArRef.value) {
        bsModalAr = getBsModal(modalArRef.value);
      }
      if (bsModalAr) bsModalAr.show();
    };

    const editAr = (item) => {
      isEditingAr.value = true;
      editingArId.value = item.id;
      formAr.value = { ...item };
      if (!bsModalAr && modalArRef.value) {
        bsModalAr = getBsModal(modalArRef.value);
      }
      if (bsModalAr) bsModalAr.show();
    };

    const saveAr = () => {
      if (!formAr.value.invoiceNumber || !formAr.value.clientName || !formAr.value.amount) {
        Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Semua field wajib harus diisi.' });
        return;
      }
      const list = [...arInvoices.value];
      if (isEditingAr.value) {
        const idx = list.findIndex(a => a.id === editingArId.value);
        if (idx !== -1) {
          list[idx] = { ...formAr.value, id: editingArId.value };
          logAuditTrail({
            module: 'Piutang Klien (AR)',
            action: 'UPDATE',
            details: `Memperbarui faktur AR ${formAr.value.invoiceNumber} (${formAr.value.clientName})`
          });
        }
      } else {
        const newId = 'AR-' + Date.now().toString().slice(-4);
        list.unshift({ ...formAr.value, id: newId });
        logAuditTrail({
          module: 'Piutang Klien (AR)',
          action: 'CREATE',
          details: `Menerbitkan faktur AR baru ${formAr.value.invoiceNumber} untuk ${formAr.value.clientName} (${formatRupiah(formAr.value.amount)})`
        });
      }
      arInvoices.value = list;
      safeSet(STORAGE_KEYS.AR_INVOICES, list);
      if (bsModalAr) bsModalAr.hide();
      Swal.fire({ icon: 'success', title: 'Faktur AR Disimpan', timer: 1500, showConfirmButton: false });
    };

    const deleteAr = (id) => {
      Swal.fire({
        title: 'Hapus Faktur Piutang?',
        text: 'Data faktur akan dihapus dari buku besar piutang.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
      }).then(res => {
        if (res.isConfirmed) {
          arInvoices.value = arInvoices.value.filter(a => a.id !== id);
          safeSet(STORAGE_KEYS.AR_INVOICES, arInvoices.value);
          logAuditTrail({ module: 'Piutang Klien (AR)', action: 'DELETE', details: `Menghapus faktur AR ${id}` });
          Swal.fire({ icon: 'success', title: 'Faktur Terhapus', timer: 1200, showConfirmButton: false });
        }
      });
    };

    // Automated Reminder Dispatcher
    const sendAutomatedReminder = (ar) => {
      Swal.fire({
        title: 'Kirim Pengingat Jatuh Tempo?',
        html: `
          <div class="text-start p-2 bg-light rounded-3 small">
            <div><strong>Tujuan:</strong> ${ar.clientName} (${ar.clientEmail})</div>
            <div><strong>No Faktur:</strong> ${ar.invoiceNumber}</div>
            <div><strong>Nominal:</strong> ${formatRupiah(ar.amount)}</div>
            <div><strong>Jatuh Tempo:</strong> ${ar.dueDate}</div>
            <hr class="my-2" />
            <div class="text-muted">Template pesan pengingat resmi akan disiapkan dan dikirimkan otomatis.</div>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Kirim Notifikasi Sekarang',
        cancelButtonText: 'Batal'
      }).then(res => {
        if (res.isConfirmed) {
          logAuditTrail({
            module: 'Piutang Klien (AR)',
            action: 'DISPATCH_REMINDER',
            details: `Mengirimkan automated payment reminder untuk faktur ${ar.invoiceNumber} ke ${ar.clientEmail}`
          });
          Swal.fire({
            icon: 'success',
            title: 'Pengingat Terkirim!',
            text: `Email dan notifikasi reminder telah dikirimkan kepada kontak ${ar.clientName}.`
          });
        }
      });
    };

    // Open Add AP Modal
    const openAddApModal = () => {
      isEditingAp.value = false;
      editingApId.value = null;
      formAp.value = {
        vendorName: '',
        vendorBillNumber: '',
        amount: '',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
        category: 'Software & Cloud IT',
        priority: 'Normal',
        batchSchedule: 'Batch Senin',
        withholdPph23: true,
        status: 'Scheduled',
        notes: ''
      };
      if (!bsModalAp && modalApRef.value) {
        bsModalAp = getBsModal(modalApRef.value);
      }
      if (bsModalAp) bsModalAp.show();
    };

    const editAp = (item) => {
      isEditingAp.value = true;
      editingApId.value = item.id;
      formAp.value = { ...item };
      if (!bsModalAp && modalApRef.value) {
        bsModalAp = getBsModal(modalApRef.value);
      }
      if (bsModalAp) bsModalAp.show();
    };

    const saveAp = () => {
      if (!formAp.value.vendorName || !formAp.value.vendorBillNumber || !formAp.value.amount) {
        Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Semua field wajib harus diisi.' });
        return;
      }
      const list = [...apBills.value];
      if (isEditingAp.value) {
        const idx = list.findIndex(b => b.id === editingApId.value);
        if (idx !== -1) {
          list[idx] = { ...formAp.value, id: editingApId.value };
          logAuditTrail({
            module: 'Hutang Vendor (AP)',
            action: 'UPDATE',
            details: `Memperbarui tagihan vendor ${formAp.value.vendorName} (${formAp.value.vendorBillNumber})`
          });
        }
      } else {
        const newId = 'AP-' + Date.now().toString().slice(-4);
        list.unshift({ ...formAp.value, id: newId });
        logAuditTrail({
          module: 'Hutang Vendor (AP)',
          action: 'CREATE',
          details: `Merekam tagihan vendor baru ${formAp.value.vendorName} senilai ${formatRupiah(formAp.value.amount)}`
        });
      }
      apBills.value = list;
      safeSet(STORAGE_KEYS.AP_BILLS, list);
      if (bsModalAp) bsModalAp.hide();
      Swal.fire({ icon: 'success', title: 'Tagihan AP Disimpan', timer: 1500, showConfirmButton: false });
    };

    const deleteAp = (id) => {
      Swal.fire({
        title: 'Hapus Tagihan Vendor?',
        text: 'Tagihan akan dihapus dari daftar hutang dagang.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
      }).then(res => {
        if (res.isConfirmed) {
          apBills.value = apBills.value.filter(b => b.id !== id);
          safeSet(STORAGE_KEYS.AP_BILLS, apBills.value);
          logAuditTrail({ module: 'Hutang Vendor (AP)', action: 'DELETE', details: `Menghapus tagihan vendor ${id}` });
          Swal.fire({ icon: 'success', title: 'Tagihan Terhapus', timer: 1200, showConfirmButton: false });
        }
      });
    };

    // Process Approval with strict Role Verification!
    const processApproval = (req, isApproved) => {
      const currentRole = getCurrentRole();

      // Check RBAC authority
      if (!currentRole.canApprove) {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak (RBAC)',
          text: `Peran Anda sebagai "${currentRole.name}" tidak memiliki wewenang untuk menyetujui pencairan dana.`
        });
        return;
      }

      if (req.amount > currentRole.maxApprovalLimit) {
        Swal.fire({
          icon: 'warning',
          title: 'Di Luar Batas Wewenang',
          text: `Nominal ${formatRupiah(req.amount)} melebihi plafon otorisasi maksimal Anda (${formatRupiah(currentRole.maxApprovalLimit)}). Otorisasi ini memerlukan persetujuan CFO!`
        });
        return;
      }

      const actionText = isApproved ? 'Menyetujui' : 'Menolak';
      Swal.fire({
        title: `${actionText} Permohonan Dana?`,
        html: `Apakah Anda yakin ingin ${actionText.toLowerCase()} <strong>"${req.title}"</strong> sebesar <strong>${formatRupiah(req.amount)}</strong>?`,
        icon: isApproved ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonText: isApproved ? 'Ya, Approve' : 'Ya, Reject',
        confirmButtonColor: isApproved ? '#10b981' : '#ef4444'
      }).then(res => {
        if (res.isConfirmed) {
          const nowStr = new Date().toLocaleString('id-ID');
          req.status = isApproved ? 'Disetujui' : 'Ditolak';
          req.approvedBy = `${currentRole.name.split('(')[0]} (${nowStr})`;
          req.approvalDate = nowStr;

          safeSet(STORAGE_KEYS.APPROVALS, approvalsList.value);

          logAuditTrail({
            module: 'Alur Persetujuan Pembayaran',
            action: isApproved ? 'APPROVE' : 'REJECT',
            details: `${currentRole.name} ${actionText.toLowerCase()} permohonan ${req.id} (${formatRupiah(req.amount)})`
          });

          Swal.fire({
            icon: 'success',
            title: `Pengajuan ${req.status}`,
            text: `Status telah dicatat dalam Jejak Audit resmi.`,
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    };

    // Open Add Approval Request Modal
    const openAddApprovalModal = () => {
      Swal.fire({
        title: 'Ajukan Permohonan Pencairan Dana',
        html: `
          <div class="text-start">
            <div class="mb-2">
              <label class="form-label small fw-bold">Judul / Peruntukan Dana</label>
              <input id="swal-req-title" type="text" class="form-control form-control-sm" placeholder="Pengadaan Server Rack & Switch Cisco" />
            </div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <label class="form-label small fw-bold">Pemohon</label>
                <input id="swal-req-user" type="text" class="form-control form-control-sm" value="Arif Permana (Teknologi)" />
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Departemen</label>
                <select id="swal-req-dept" class="form-select form-select-sm">
                  <option value="Teknologi & IT">Teknologi & IT</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HRD">HRD</option>
                </select>
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Nominal Pencairan (IDR)</label>
              <input id="swal-req-amt" type="number" class="form-control form-control-sm" placeholder="25000000" />
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Catatan / Justifikasi Bisnis</label>
              <textarea id="swal-req-notes" class="form-control form-control-sm" rows="2" placeholder="Urgensi dan vendor penerima dana..."></textarea>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Kirim Pengajuan Otorisasi',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const title = document.getElementById('swal-req-title').value;
          const user = document.getElementById('swal-req-user').value;
          const dept = document.getElementById('swal-req-dept').value;
          const amt = Number(document.getElementById('swal-req-amt').value);
          const notes = document.getElementById('swal-req-notes').value;
          if (!title || !amt) {
            Swal.showValidationMessage('Judul dan nominal wajib diisi.');
            return false;
          }
          return { title, user, dept, amt, notes };
        }
      }).then(res => {
        if (res.isConfirmed && res.value) {
          const amt = res.value.amt;
          let tier = 'Staf';
          let statusStr = 'Menunggu Persetujuan Staf';
          if (amt > 50000000) {
            tier = 'CFO';
            statusStr = 'Menunggu Persetujuan CFO';
          } else if (amt > 10000000) {
            tier = 'Manager';
            statusStr = 'Menunggu Persetujuan Manajer';
          }

          const newReq = {
            id: 'REQ-' + Date.now().toString().slice(-4),
            title: res.value.title,
            requester: res.value.user,
            department: res.value.dept,
            amount: amt,
            requiredTier: tier,
            status: statusStr,
            approvedBy: null,
            approvalDate: null,
            notes: res.value.notes
          };

          approvalsList.value.unshift(newReq);
          safeSet(STORAGE_KEYS.APPROVALS, approvalsList.value);

          logAuditTrail({
            module: 'Alur Persetujuan Pembayaran',
            action: 'CREATE_REQUEST',
            details: `Mengajukan permohonan dana ${newReq.id}: ${newReq.title} (${formatRupiah(newReq.amount)}) Tier: ${tier}`
          });

          Swal.fire({
            icon: 'success',
            title: 'Pengajuan Terkirim',
            text: `Permohonan dana diteruskan ke antrean otorisasi ${tier}.`
          });
        }
      });
    };

    // Exports
    const exportArExcel = () => {
      const data = arInvoices.value.map(a => ({
        'No Faktur': a.invoiceNumber,
        'Klien': a.clientName,
        'Email': a.clientEmail,
        'No HP/WA': a.clientPhone || '-',
        'Tanggal Terbit': a.issueDate,
        'Jatuh Tempo': a.dueDate,
        'Syarat Pembayaran': a.terms,
        'Nominal (IDR)': a.amount,
        'Status': a.status,
        'Uraian': a.scopeOfWork || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Piutang AR');
      XLSX.writeFile(wb, `Laporan_Piutang_AR_${new Date().toISOString().substring(0, 10)}.xlsx`);
    };

    const exportApExcel = () => {
      const data = apBills.value.map(b => ({
        'Nama Vendor': b.vendorName,
        'No Faktur Vendor': b.vendorBillNumber,
        'Kategori': b.category,
        'Jatuh Tempo': b.dueDate,
        'Nominal (IDR)': b.amount,
        'Jadwal Batch': b.batchSchedule,
        'Potong PPh 23': b.withholdPph23 ? 'Ya' : 'Tidak',
        'Prioritas': b.priority,
        'Status': b.status,
        'Catatan': b.notes || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Hutang AP');
      XLSX.writeFile(wb, `Laporan_Hutang_AP_${new Date().toISOString().substring(0, 10)}.xlsx`);
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
      arInvoices,
      apBills,
      approvalsList,
      searchAr,
      filterArStatus,
      searchAp,
      filterApPriority,
      filteredArList,
      filteredApList,
      unpaidArList,
      totalUnpaidAr,
      totalOverdueAr,
      totalPaidAr,
      overdueArCount,
      collectionRate,
      totalApAmount,
      approvedApAmount,
      urgentApCount,
      pendingApprovalsCount,
      modalArRef,
      modalApRef,
      formAr,
      formAp,
      isEditingAr,
      isEditingAp,
      openAddArModal,
      editAr,
      saveAr,
      deleteAr,
      sendAutomatedReminder,
      openAddApModal,
      editAp,
      saveAp,
      deleteAp,
      processApproval,
      openAddApprovalModal,
      exportArExcel,
      exportApExcel,
      isPastDue,
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
