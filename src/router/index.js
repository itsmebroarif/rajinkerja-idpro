import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/contacts",
    name: "contacts",
    component: () => import("../views/ContactsView.vue"),
  },
  {
    path: "/invoice",
    name: "invoice",
    component: () => import("../views/InvoiceView.vue"),
  },
  {
    path: "/mail",
    redirect: "/invoice",
  },
  {
    path: "/todo",
    name: "todo",
    component: () => import("../views/todoList.vue"),
  },
  {
    path: "/tasks",
    redirect: "/todo",
  },
  {
    path: "/tasks/:id",
    name: "task-detail",
    component: () => import("../views/TaskDetailView.vue"),
  },
  {
    path: "/todo/:id",
    redirect: to => `/tasks/${to.params.id}`,
  },
  {
    path: "/project",
    name: "project",
    component: () => import("../views/projectManagement.vue"),
  },
  {
    path: "/finance",
    name: "finance",
    component: () => import("../views/moneyTracker.vue"),
  },
  {
    path: "/rab",
    name: "rab",
    component: () => import("../views/RabView.vue"),
  },
  {
    path: "/videos",
    name: "videos",
    component: () => import("../views/VideoHubView.vue"),
  },
  {
    path: "/videos/:id",
    name: "video-detail",
    component: () => import("../views/VideoDetailView.vue"),
  },
  {
    path: "/custom-bingkai",
    name: "custom-bingkai",
    component: () => import("../views/MotivationFrameSettingsView.vue"),
  },
  {
    path: "/frame-custom",
    redirect: "/custom-bingkai",
  },
  {
    path: "/motivation-frame/custom",
    redirect: "/custom-bingkai",
  },
  {
    path: "/motivation-frame/settings",
    redirect: "/custom-bingkai",
  },
  {
    path: "/games",
    name: "games",
    component: () => import("../views/GamesView.vue"),
  },
  {
    path: "/games/:id",
    name: "game-detail",
    component: () => import("../views/GamesView.vue"),
  },
  {
    path: "/selfie",
    name: "selfie",
    component: () => import("../views/SelfieHappinessView.vue"),
  },
  {
    path: "/cv",
    name: "cv",
    component: () => import("../views/CvBuilderView.vue"),
  },
  {
    path: "/sql",
    name: "sql",
    component: () => import("../views/SqlExportView.vue"),
  },
  {
    path: "/chat-ai",
    name: "chat-ai",
    component: () => import("../views/LiveChatAiView.vue"),
  },
  {
    path: "/code-notes",
    name: "code-notes",
    component: () => import("../views/CodeNotesView.vue"),
  },
  {
    path: "/code-notes/:id",
    name: "code-note-detail",
    component: () => import("../views/CodeNoteDetailView.vue"),
  },
  {
    path: "/code-snippets/:id",
    redirect: to => `/code-notes/${to.params.id}`,
  },
  {
    path: "/code-snippet/:id",
    redirect: to => `/code-notes/${to.params.id}`,
  },
  {
    path: "/surat",
    name: "surat",
    component: () => import("../views/SuratBuilderView.vue"),
  },
  {
    path: "/time-suite",
    name: "time-suite",
    component: () => import("../views/TimeSuiteView.vue"),
  },
  {
    path: "/habits",
    redirect: "/",
  },
  {
    path: "/calendar",
    name: "calendar",
    component: () => import("../views/CalendarView.vue"),
  },
  {
    path: "/notes",
    name: "notes",
    component: () => import("../views/StickyNotesView.vue"),
  },
  {
    path: "/notes/:id",
    name: "note-detail",
    component: () => import("../views/NoteDetailView.vue"),
  },
  {
    path: "/diary",
    name: "diary",
    component: () => import("../views/DiaryView.vue"),
  },
  {
    path: "/diary/:id",
    name: "diary-detail",
    component: () => import("../views/DiaryDetailView.vue"),
  },
  {
    path: "/jurnal",
    redirect: "/diary",
  },
  {
    path: "/storage",
    name: "storage",
    component: () => import("../views/StorageView.vue"),
  },
  {
    path: "/storage/view/:key",
    name: "storage-key-detail",
    component: () => import("../views/StorageKeyDetailView.vue"),
  },
  {
    path: "/storage/json-viewer",
    redirect: to => `/storage/view/${encodeURIComponent(to.query.key || '')}`,
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/PreferencesView.vue"),
  },
  {
    path: "/preferences",
    name: "preferences",
    component: () => import("../views/PreferencesView.vue"),
  },
  {
    path: "/camera",
    name: "camera",
    component: () => import("../views/CameraScannerView.vue"),
  },
  {
    path: "/scan",
    redirect: "/camera",
  },
  {
    path: "/mood",
    name: "mood",
    component: () => import("../views/MoodAlarmView.vue"),
  },
  {
    path: "/alarm",
    name: "alarm",
    component: () => import("../views/MoodAlarmView.vue"),
  },
  {
    path: "/mood-alarm",
    redirect: "/mood",
  },
  {
    path: "/faq",
    name: "faq",
    component: () => import("../views/FaqAboutView.vue"),
  },
  {
    path: "/developer",
    name: "developer",
    component: () => import("../views/DeveloperPortfolioView.vue"),
  },
  {
    path: "/portfolio",
    redirect: "/developer",
  },
  {
    path: "/chat",
    redirect: "/faq",
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/FaqAboutView.vue"),
  },
  {
    path: "/quick-capture",
    name: "quick-capture",
    component: () => import("../views/QuickCaptureView.vue"),
  },
  {
    path: "/productivity-insights",
    name: "productivity-insights",
    component: () => import("../views/ProductivityInsightsView.vue"),
  },
  {
    path: "/insights",
    redirect: "/productivity-insights",
  },
  {
    path: "/job-tracker",
    name: "job-tracker",
    component: () => import("../views/JobTrackerView.vue"),
  },
  {
    path: "/jobs",
    redirect: "/job-tracker",
  },
  {
    path: "/lamaran",
    redirect: "/job-tracker",
  },
  {
    path: "/lamaran-kerja",
    redirect: "/job-tracker",
  },
  {
    path: "/medium-draft",
    name: "medium-draft",
    component: () => import("../views/MediumDraftView.vue"),
  },
  {
    path: "/medium",
    redirect: "/medium-draft",
  },
  {
    path: "/drafts",
    redirect: "/medium-draft",
  },
  // Finance System Modules
  {
    path: "/finance-cashflow",
    name: "finance-cashflow",
    component: () => import("../views/CashFlowManagementView.vue"),
  },
  {
    path: "/finance-ap-ar",
    name: "finance-ap-ar",
    component: () => import("../views/AccountsPayableReceivableView.vue"),
  },
  {
    path: "/finance-expenses",
    name: "finance-expenses",
    component: () => import("../views/ExpenseReimbursementView.vue"),
  },
  {
    path: "/finance-budgeting",
    name: "finance-budgeting",
    component: () => import("../views/BudgetingForecastingView.vue"),
  },
  {
    path: "/finance-reports",
    name: "finance-reports",
    component: () => import("../views/FinancialReportsView.vue"),
  },
  {
    path: "/finance-security",
    name: "finance-security",
    component: () => import("../views/FinanceSecurityAuditView.vue"),
  },
  {
    path: "/team-collaboration",
    name: "team-collaboration",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-bulletin",
    name: "team-bulletin",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-channels",
    name: "team-channels",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-assets",
    name: "team-assets",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-ticketing",
    name: "team-ticketing",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-requests",
    redirect: "/team-ticketing",
  },
  {
    path: "/team-calendar",
    name: "team-calendar",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-expertise",
    name: "team-expertise",
    component: () => import("../views/TeamCollaborationView.vue"),
  },
  {
    path: "/team-directory",
    redirect: "/team-expertise",
  },
  {
    path: "/auth",
    name: "auth-role-account",
    component: () => import("../views/AuthRoleAccountView.vue"),
  },
  {
    path: "/login",
    redirect: "/auth",
  },
  {
    path: "/register",
    redirect: "/auth",
  },
  {
    path: "/account",
    redirect: "/auth",
  },
  {
    path: "/drive-vault",
    name: "drive-vault",
    component: () => import("../views/GoogleDriveVaultView.vue"),
  },
  {
    path: "/drive",
    redirect: "/drive-vault",
  },
  {
    path: "/google-drive",
    redirect: "/drive-vault",
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.onError((error) => {
  const isChunkLoadFailed =
    error.name === 'ChunkLoadError' ||
    error.name === 'SyntaxError' ||
    (error.message && (
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Unexpected token') ||
      error.message.includes('dynamically imported module')
    ));

  if (isChunkLoadFailed) {
    const lastReload = sessionStorage.getItem('last_chunk_reload');
    const now = Date.now();
    // Prevent infinite reload loop
    if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
      sessionStorage.setItem('last_chunk_reload', now.toString());
      window.location.reload();
    }
  }
});

export default router;
