<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-danger text-white fw-bold px-3 py-1.5 rounded-pill">⏰ Material Time Suite</span>
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">4 Tools in 1</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">⏰ Alarm, Timer, Stopwatch & Pomodoro</h2>
        <p class="text-muted mb-0">Manajemen waktu kerja lengkap: pasang alarm, countdown timer, stopwatch lap, dan teknik fokus Pomodoro.</p>
      </div>

      <router-link to="/" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold align-self-start align-self-md-center">
        <i class="bi bi-arrow-left me-1"></i> Kembali
      </router-link>
    </div>

    <!-- Nav Tabs -->
    <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
      <div class="card-header bg-light border-bottom p-3">
        <ul class="nav nav-pills nav-fill gap-2">
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'alarm' ? 'active bg-danger text-white shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'alarm'"
            >
              <i class="bi bi-alarm-fill fs-5"></i>
              <span>1. Quick Alarm</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'timer' ? 'active bg-primary text-white shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'timer'"
            >
              <i class="bi bi-hourglass-split fs-5"></i>
              <span>2. Countdown Timer</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'stopwatch' ? 'active bg-success text-white shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'stopwatch'"
            >
              <i class="bi bi-stopwatch-fill fs-5"></i>
              <span>3. Stopwatch & Laps</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
              :class="activeTab === 'pomodoro' ? 'active bg-warning text-dark shadow-sm' : 'text-dark bg-white border'"
              @click="activeTab = 'pomodoro'"
            >
              <i class="bi bi-cup-hot-fill fs-5"></i>
              <span>4. Pomodoro Focus</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body p-4">
        <!-- 1. ALARM VIEW -->
        <div v-if="activeTab === 'alarm'" class="max-w-2xl mx-auto">
          <form @submit.prevent="addAlarm" class="bg-light p-3 rounded-4 border mb-4">
            <div class="row g-2 align-items-center">
              <div class="col-md-5">
                <input type="time" class="form-control form-control-lg border-2 font-monospace" v-model="newAlarmTime" required />
              </div>
              <div class="col-md-5">
                <input type="text" class="form-control form-control-lg border-2" placeholder="Label alarm (misal: Standup)" v-model="newAlarmLabel" required />
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-danger btn-lg w-100 rounded-3 fw-bold"><i class="bi bi-plus-lg"></i></button>
              </div>
            </div>
          </form>

          <div class="d-flex flex-column gap-3">
            <div v-for="alarm in alarmList" :key="alarm.id" class="p-3 bg-white border rounded-4 shadow-sm d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                <h2 class="fw-extrabold text-danger font-monospace mb-0">{{ alarm.time }}</h2>
                <div>
                  <h6 class="fw-bold text-dark mb-0">{{ alarm.label }}</h6>
                  <span class="badge bg-light text-muted border small">{{ alarm.repeat || 'Setiap Hari' }}</span>
                </div>
              </div>

              <div class="d-flex align-items-center gap-3">
                <div class="form-check form-switch fs-4">
                  <input class="form-check-input" type="checkbox" v-model="alarm.active" />
                </div>
                <button class="btn btn-sm btn-outline-danger rounded-circle p-1.5" @click="deleteAlarm(alarm.id)"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. COUNTDOWN TIMER VIEW -->
        <div v-else-if="activeTab === 'timer'" class="max-w-xl mx-auto text-center py-3">
          <div class="display-1 fw-extrabold text-primary font-monospace mb-3 tracking-wider">
            {{ formatTime(timerSeconds) }}
          </div>

          <div class="d-flex justify-content-center gap-2 mb-4">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="addTimerMinutes(1)">+1 Mnt</button>
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="addTimerMinutes(5)">+5 Mnt</button>
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="addTimerMinutes(15)">+15 Mnt</button>
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="addTimerMinutes(25)">+25 Mnt</button>
          </div>

          <div class="d-flex justify-content-center gap-3">
            <button class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow" @click="toggleTimer">
              <i :class="isTimerRunning ? 'bi bi-pause-fill' : 'bi bi-play-fill'" class="fs-4 me-1"></i>
              {{ isTimerRunning ? 'Pause' : 'Mulai' }}
            </button>
            <button class="btn btn-outline-secondary btn-lg rounded-pill px-4" @click="resetTimer">Reset</button>
          </div>
        </div>

        <!-- 3. STOPWATCH VIEW -->
        <div v-else-if="activeTab === 'stopwatch'" class="max-w-xl mx-auto text-center py-3">
          <div class="display-1 fw-extrabold text-success font-monospace mb-3 tracking-wider">
            {{ formatStopwatch(swMilliseconds) }}
          </div>

          <div class="d-flex justify-content-center gap-3 mb-4">
            <button class="btn btn-success btn-lg rounded-pill px-5 fw-bold shadow" @click="toggleStopwatch">
              <i :class="isSwRunning ? 'bi bi-pause-fill' : 'bi bi-play-fill'" class="fs-4 me-1"></i>
              {{ isSwRunning ? 'Pause' : 'Start' }}
            </button>
            <button class="btn btn-outline-success btn-lg rounded-pill px-4" :disabled="!isSwRunning" @click="recordLap">Lap</button>
            <button class="btn btn-outline-secondary btn-lg rounded-pill px-4" @click="resetStopwatch">Reset</button>
          </div>

          <div v-if="laps.length > 0" class="card border p-3 rounded-4 bg-light text-start max-w-md mx-auto">
            <h6 class="fw-bold text-dark border-bottom pb-2 mb-2">Recorded Laps ({{ laps.length }})</h6>
            <div class="overflow-y-auto" style="max-height: 180px;">
              <div v-for="(lap, idx) in laps" :key="idx" class="d-flex justify-content-between py-1 border-bottom small font-monospace">
                <span>Lap {{ laps.length - idx }}</span>
                <strong class="text-dark">{{ lap }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. POMODORO VIEW -->
        <div v-else class="max-w-xl mx-auto text-center py-3">
          <div class="d-flex justify-content-center gap-2 mb-4">
            <button class="btn btn-sm rounded-pill px-4 fw-bold" :class="pomoMode === 'work' ? 'btn-danger' : 'btn-outline-danger'" @click="setPomoMode('work')">🍅 Work (25 Mnt)</button>
            <button class="btn btn-sm rounded-pill px-4 fw-bold" :class="pomoMode === 'break' ? 'btn-success' : 'btn-outline-success'" @click="setPomoMode('break')">☕ Break (5 Mnt)</button>
          </div>

          <div class="display-1 fw-extrabold text-dark font-monospace mb-2 tracking-wider">
            {{ formatTime(pomoSeconds) }}
          </div>
          <span class="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-4">
            Sesi Fokus Ke-{{ pomoCompletedCount + 1 }}
          </span>

          <div class="d-flex justify-content-center gap-3">
            <button class="btn btn-warning btn-lg text-dark rounded-pill px-5 fw-bold shadow" @click="togglePomo">
              <i :class="isPomoRunning ? 'bi bi-pause-fill' : 'bi bi-play-fill'" class="fs-4 me-1"></i>
              {{ isPomoRunning ? 'Pause' : 'Mulai Sesi' }}
            </button>
            <button class="btn btn-outline-secondary btn-lg rounded-pill px-4" @click="resetPomo">Reset</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { sendOnDeviceNotification } from '../utils/notification';

export default {
  name: 'TimeSuiteView',
  setup() {
    const store = useStore();

    const activeTab = ref('alarm');

    // 1. Alarm state
    const newAlarmTime = ref('08:00');
    const newAlarmLabel = ref('');
    const alarmList = ref(store.getters.getWorkAlarms || []);

    const addAlarm = () => {
      if (!newAlarmLabel.value.trim()) return;
      const alarm = {
        id: 'al_' + Date.now(),
        time: newAlarmTime.value,
        label: newAlarmLabel.value,
        active: true,
        repeat: 'Setiap Hari'
      };
      alarmList.value.push(alarm);
      newAlarmLabel.value = '';
      sendOnDeviceNotification('⏰ Alarm Ditambahkan', { body: `Alarm "${alarm.label}" dipasang pada jam ${alarm.time}.`, type: 'info' });
    };

    const deleteAlarm = (id) => {
      alarmList.value = alarmList.value.filter(a => a.id !== id);
    };

    // 2. Countdown Timer state
    const timerSeconds = ref(300); // default 5 mins
    const isTimerRunning = ref(false);
    let timerInterval = null;

    const addTimerMinutes = (mins) => {
      timerSeconds.value += mins * 60;
    };

    const toggleTimer = () => {
      if (isTimerRunning.value) {
        clearInterval(timerInterval);
        isTimerRunning.value = false;
      } else {
        isTimerRunning.value = true;
        timerInterval = setInterval(() => {
          if (timerSeconds.value > 0) {
            timerSeconds.value--;
          } else {
            clearInterval(timerInterval);
            isTimerRunning.value = false;
            sendOnDeviceNotification('⏱️ Timer Selesai!', { body: 'Waktu countdown timer Anda telah habis.', type: 'success' });
          }
        }, 1000);
      }
    };

    const resetTimer = () => {
      clearInterval(timerInterval);
      isTimerRunning.value = false;
      timerSeconds.value = 300;
    };

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // 3. Stopwatch state
    const swMilliseconds = ref(0);
    const isSwRunning = ref(false);
    const laps = ref([]);
    let swInterval = null;

    const toggleStopwatch = () => {
      if (isSwRunning.value) {
        clearInterval(swInterval);
        isSwRunning.value = false;
      } else {
        isSwRunning.value = true;
        const start = Date.now() - swMilliseconds.value;
        swInterval = setInterval(() => {
          swMilliseconds.value = Date.now() - start;
        }, 10);
      }
    };

    const recordLap = () => {
      laps.value.unshift(formatStopwatch(swMilliseconds.value));
    };

    const resetStopwatch = () => {
      clearInterval(swInterval);
      isSwRunning.value = false;
      swMilliseconds.value = 0;
      laps.value = [];
    };

    const formatStopwatch = (ms) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const cs = Math.floor((ms % 1000) / 10);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    };

    // 4. Pomodoro state
    const pomoMode = ref('work'); // 'work' or 'break'
    const pomoSeconds = ref(25 * 60);
    const isPomoRunning = ref(false);
    const pomoCompletedCount = ref(0);
    let pomoInterval = null;

    const setPomoMode = (mode) => {
      clearInterval(pomoInterval);
      isPomoRunning.value = false;
      pomoMode.value = mode;
      pomoSeconds.value = mode === 'work' ? 25 * 60 : 5 * 60;
    };

    const togglePomo = () => {
      if (isPomoRunning.value) {
        clearInterval(pomoInterval);
        isPomoRunning.value = false;
      } else {
        isPomoRunning.value = true;
        pomoInterval = setInterval(() => {
          if (pomoSeconds.value > 0) {
            pomoSeconds.value--;
          } else {
            clearInterval(pomoInterval);
            isPomoRunning.value = false;
            if (pomoMode.value === 'work') {
              pomoCompletedCount.value++;
              sendOnDeviceNotification('🍅 Sesi Pomodoro Selesai!', { body: 'Waktunya istirahat 5 menit.', type: 'success' });
              setPomoMode('break');
            } else {
              sendOnDeviceNotification('☕ Istirahat Selesai!', { body: 'Siap untuk sesi kerja berikutnya.', type: 'info' });
              setPomoMode('work');
            }
          }
        }, 1000);
      }
    };

    const resetPomo = () => {
      setPomoMode('work');
    };

    onUnmounted(() => {
      clearInterval(timerInterval);
      clearInterval(swInterval);
      clearInterval(pomoInterval);
    });

    return {
      activeTab,
      newAlarmTime,
      newAlarmLabel,
      alarmList,
      addAlarm,
      deleteAlarm,
      timerSeconds,
      isTimerRunning,
      addTimerMinutes,
      toggleTimer,
      resetTimer,
      formatTime,
      swMilliseconds,
      isSwRunning,
      laps,
      toggleStopwatch,
      recordLap,
      resetStopwatch,
      formatStopwatch,
      pomoMode,
      pomoSeconds,
      isPomoRunning,
      pomoCompletedCount,
      setPomoMode,
      togglePomo,
      resetPomo
    };
  }
};
</script>

<style scoped>
.max-w-2xl { max-width: 42rem; }
.max-w-xl { max-width: 36rem; }
.max-w-md { max-width: 28rem; }
.tracking-wider { letter-spacing: 2px; }
</style>
