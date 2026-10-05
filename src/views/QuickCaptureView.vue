<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill">⚡ Fast Workflow</span>
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">Quick Capture Engine</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">⚡ Quick Capture: Catat Fast Note & Alarm</h2>
        <p class="text-muted mb-0">Input ide, pengingat, catatan kilat, atau alarm kerja secara instant tanpa berpindah-pindah menu.</p>
      </div>

      <router-link to="/" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold align-self-start align-self-md-center">
        <i class="bi bi-arrow-left me-1"></i> Kembali ke Dashboard
      </router-link>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
      <div class="card-header bg-light border-bottom p-3">
        <ul class="nav nav-pills nav-fill gap-2" id="quickCaptureTabs">
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'note' ? 'active bg-primary text-white shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'note'"
            >
              <i class="bi bi-journal-plus fs-5"></i>
              <span>1. Quick Note (Catatan Kilat)</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'alarm' ? 'active bg-danger text-white shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'alarm'"
            >
              <i class="bi bi-alarm-fill fs-5"></i>
              <span>2. Quick Alarm & Timer Kerja</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'task' ? 'active bg-warning text-dark shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'task'"
            >
              <i class="bi bi-check2-square fs-5"></i>
              <span>3. Quick Task / Tugas Kilat</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body p-4">
        <!-- 1. QUICK NOTE FORM -->
        <div v-if="activeTab === 'note'" class="max-w-3xl mx-auto">
          <form @submit.prevent="saveQuickNote">
            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Judul Catatan / Fast Note <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control form-control-lg border-2"
                placeholder="Contoh: Ide fitur baru / Poin penting meeting pagi"
                v-model="noteForm.title"
                required
              />
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold text-dark mb-0">Isi Catatan / Scratchpad</label>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                  :class="{ 'active bg-danger text-white': isListening }"
                  @click="toggleSpeechRecognition('note')"
                >
                  <i :class="isListening ? 'bi bi-mic-fill' : 'bi bi-mic'"></i>
                  <span>{{ isListening ? 'Merekam Suara...' : 'Dikte Suara (Voice Input)' }}</span>
                </button>
              </div>
              <textarea
                class="form-control border-2"
                rows="4"
                placeholder="Tuliskan catatan kilat Anda di sini atau gunakan tombol dikte suara..."
                v-model="noteForm.content"
              ></textarea>
            </div>

            <div class="row g-3 align-items-center mb-4">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small mb-1">Kategori / Tag</label>
                <select class="form-select border-2" v-model="noteForm.category">
                  <option value="Umum">📌 Umum</option>
                  <option value="Ide">💡 Ide & Inovasi</option>
                  <option value="Meeting">🤝 Hasil Meeting</option>
                  <option value="Klien">🏢 Klien & Proyek</option>
                  <option value="Penting">🔥 Penting / Urgent</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small mb-1">Warna Sticky Note</label>
                <div class="d-flex gap-2">
                  <button
                    v-for="color in noteColors"
                    :key="color.bg"
                    type="button"
                    class="btn rounded-circle p-0 d-flex align-items-center justify-content-center border"
                    :style="{ backgroundColor: color.bg, width: '36px', height: '36px' }"
                    @click="noteForm.color = color.bg"
                  >
                    <i v-if="noteForm.color === color.bg" class="bi bi-check-lg text-dark fw-bold"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 border-top pt-3">
              <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm d-flex align-items-center gap-2">
                <i class="bi bi-journal-check"></i> Simpan Quick Note
              </button>
            </div>
          </form>
        </div>

        <!-- 2. QUICK ALARM & TIMER FORM -->
        <div v-else-if="activeTab === 'alarm'" class="max-w-3xl mx-auto">
          <form @submit.prevent="saveQuickAlarm">
            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label fw-bold text-dark">Label / Pengingat Alarm <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-lg border-2"
                  placeholder="Contoh: Pengingat Standup Meeting / Istirahat Mata"
                  v-model="alarmForm.title"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-bold text-dark">Waktu Alarm <span class="text-danger">*</span></label>
                <input
                  type="time"
                  class="form-control form-control-lg border-2 font-monospace"
                  v-model="alarmForm.time"
                  required
                />
              </div>
            </div>

            <!-- Preset Quick Timers -->
            <div class="mb-4 bg-light p-3 rounded-4 border">
              <label class="form-label fw-bold text-dark small mb-2 d-block">⚡ Quick Alarm Presets (Hitung Dari Sekarang):</label>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold" @click="setQuickTimerMinutes(5)">
                  ⏱️ +5 Menit (Short Break)
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold" @click="setQuickTimerMinutes(15)">
                  ⏱️ +15 Menit (Coffee Break)
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold" @click="setQuickTimerMinutes(25)">
                  🍅 +25 Menit (Sesi Pomodoro)
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold" @click="setQuickTimerMinutes(60)">
                  ⏰ +1 Jam (Meeting / Work Block)
                </button>
              </div>
            </div>

            <div class="form-check form-switch mb-4">
              <input class="form-check-input" type="checkbox" id="alarmNotifSwitch" v-model="alarmForm.enableNotification" />
              <label class="form-check-label fw-bold text-dark small" for="alarmNotifSwitch">
                Kirim notifikasi sistem browser & HP saat alarm berbunyi
              </label>
            </div>

            <div class="d-flex justify-content-end gap-2 border-top pt-3">
              <button type="submit" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm d-flex align-items-center gap-2">
                <i class="bi bi-alarm-fill"></i> Pasang Quick Alarm
              </button>
            </div>
          </form>
        </div>

        <!-- 3. QUICK TASK FORM -->
        <div v-else class="max-w-3xl mx-auto">
          <form @submit.prevent="saveQuickTask">
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold text-dark mb-0">Nama Tugas / Activity <span class="text-danger">*</span></label>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                  @click="runSmartPriorityAi"
                >
                  <i class="bi bi-cpu-fill text-primary me-1"></i> ✨ Smart Priority AI
                </button>
              </div>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control form-control-lg border-2"
                  placeholder="Contoh: Email laporan bulanan ke atasan"
                  v-model="taskForm.name"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-danger border-2 px-3"
                  :class="{ 'active bg-danger text-white': isListening }"
                  @click="toggleSpeechRecognition('task')"
                  title="Dikte Suara"
                >
                  <i :class="isListening ? 'bi bi-mic-fill' : 'bi bi-mic'"></i>
                </button>
              </div>
              <div v-if="aiPriorityReason" class="alert alert-info py-2 px-3 mt-2 rounded-3 small mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-lightbulb-fill text-warning"></i>
                <span>{{ aiPriorityReason }}</span>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small mb-1">Prioritas Tugas</label>
                <select class="form-select border-2" v-model="taskForm.level">
                  <option value="Menengah">Menengah (Sedang)</option>
                  <option value="Penting">🔥 Penting / Urgent</option>
                  <option value="Biasa">Biasa (Rendah)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small mb-1">Target Deadline</label>
                <input type="date" class="form-control border-2" v-model="taskForm.deadline" />
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 border-top pt-3">
              <button type="submit" class="btn btn-warning btn-lg rounded-pill px-5 fw-bold shadow-sm d-flex align-items-center gap-2 text-dark">
                <i class="bi bi-check2-circle"></i> Tambah Quick Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { sendOnDeviceNotification } from '../utils/notification';

export default {
  name: 'QuickCaptureView',
  setup() {
    const store = useStore();
    const router = useRouter();

    const activeTab = ref('note');

    // Note Form State
    const noteForm = ref({
      title: '',
      content: '',
      category: 'Umum',
      color: '#fef08a'
    });

    const noteColors = [
      { bg: '#fef08a' }, // Yellow
      { bg: '#bae6fd' }, // Blue
      { bg: '#bbf7d0' }, // Green
      { bg: '#fbcfe8' }, // Pink
      { bg: '#e9d5ff' }  // Purple
    ];

    // Alarm Form State
    const alarmForm = ref({
      title: '',
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      enableNotification: true
    });

    // Task Form State
    const taskForm = ref({
      name: '',
      level: 'Menengah',
      deadline: new Date().toISOString().split('T')[0]
    });

    const aiPriorityReason = ref('');

    // Web Speech API
    const isListening = ref(false);
    let recognition = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const toggleSpeechRecognition = (targetField) => {
      if (!SpeechRecognition) {
        alert('Browser Anda tidak mendukung Web Speech API atau memerlukan koneksi HTTPS.');
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
        if (targetField === 'note') {
          noteForm.value.content = (noteForm.value.content ? noteForm.value.content + ' ' : '') + transcript;
        } else if (targetField === 'task') {
          taskForm.value.name = transcript;
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        isListening.value = false;
      };

      recognition.onend = () => {
        isListening.value = false;
      };

      recognition.start();
    };

    // Save Quick Note
    const saveQuickNote = () => {
      if (!noteForm.value.title.trim()) return;
      const newNote = {
        id: Date.now(),
        title: noteForm.value.title,
        content: noteForm.value.content,
        category: noteForm.value.category,
        color: noteForm.value.color,
        createdAt: new Date().toLocaleString('id-ID')
      };

      store.dispatch('addNote', newNote);

      sendOnDeviceNotification('📝 Quick Note Tersimpan', {
        body: `Catatan "${newNote.title}" berhasil ditambahkan.`,
        type: 'success'
      });

      router.push('/notes');
    };

    // Save Quick Alarm
    const saveQuickAlarm = () => {
      if (!alarmForm.value.title.trim()) return;
      const newAlarm = {
        id: Date.now(),
        title: alarmForm.value.title,
        time: alarmForm.value.time,
        date: new Date().toISOString().split('T')[0],
        type: 'alarm',
        status: 'active'
      };

      store.dispatch('addEvent', newAlarm);

      sendOnDeviceNotification('⏰ Quick Alarm Berhasil Dibuat', {
        body: `Alarm "${newAlarm.title}" diset untuk jam ${newAlarm.time}.`,
        type: 'info'
      });

      router.push('/mood');
    };

    // Save Quick Task
    const saveQuickTask = () => {
      if (!taskForm.value.name.trim()) return;
      const newTask = {
        id: Date.now(),
        name: taskForm.value.name,
        level: taskForm.value.level,
        deadline: taskForm.value.deadline,
        done: false,
        category: 'Quick Tasks',
        statusColumn: 'todo',
        notes: ''
      };

      store.dispatch('addTask', newTask);

      sendOnDeviceNotification('✅ Quick Task Ditambahkan', {
        body: `Tugas "${newTask.name}" berhasil ditambahkan ke To-Do List.`,
        type: 'success'
      });

      router.push('/todo');
    };

    // Smart Priority AI
    const runSmartPriorityAi = () => {
      const name = taskForm.value.name.toLowerCase();
      if (!name) {
        aiPriorityReason.value = 'Ketik nama tugas terlebih dahulu untuk analisa AI.';
        return;
      }

      const urgentKeywords = ['urgent', 'penting', 'secepatnya', 'asap', 'klien', 'bug', 'error', 'bayar', 'invoice', 'atasan', 'presentasi', 'critical'];
      const lowKeywords = ['santai', 'nanti', 'opsional', 'baca', 'rutin', 'nonton', 'hobi', 'resep'];

      const isUrgent = urgentKeywords.some(kw => name.includes(kw));
      const isLow = lowKeywords.some(kw => name.includes(kw));

      if (isUrgent) {
        taskForm.value.level = 'Penting';
        aiPriorityReason.value = '✨ AI: Terdeteksi kata kunci mendesak/prioritas tinggi. Level disesuaikan ke Penting (Urgent).';
      } else if (isLow) {
        taskForm.value.level = 'Biasa';
        aiPriorityReason.value = '✨ AI: Aktivitas berkategori santai/opsional. Level disesuaikan ke Biasa (Low).';
      } else {
        taskForm.value.level = 'Menengah';
        aiPriorityReason.value = '✨ AI: Tugas standar sehari-hari. Level disesuaikan ke Menengah.';
      }
    };

    const setQuickTimerMinutes = (mins) => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + mins);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      alarmForm.value.time = `${hours}:${minutes}`;
      alarmForm.value.title = `Timer +${mins} Menit`;
    };

    return {
      activeTab,
      noteForm,
      noteColors,
      alarmForm,
      taskForm,
      isListening,
      aiPriorityReason,
      toggleSpeechRecognition,
      saveQuickNote,
      saveQuickAlarm,
      saveQuickTask,
      runSmartPriorityAi,
      setQuickTimerMinutes
    };
  }
};
</script>

<style scoped>
.max-w-3xl {
  max-width: 48rem;
}
</style>
