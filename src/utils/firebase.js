import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Role Definitions
export const USER_ROLES = [
  { id: 'host', label: 'Host Project (Super Admin)', badgeClass: 'bg-dark text-warning border border-warning', desc: 'Pemilik proyek, hak akses 100% penuh & pembuat akun pengguna' },
  { id: 'admin', label: 'Administrator', badgeClass: 'bg-danger text-white', desc: 'Akses penuh seluruh sistem, kelola role & data' },
  { id: 'manager', label: 'Project / Finance Manager', badgeClass: 'bg-warning text-dark', desc: 'Kelola proyek, keuangan, approve klaim' },
  { id: 'member', label: 'Team Member', badgeClass: 'bg-primary text-white', desc: 'Akses kolaborasi, tugas, catatan, dan dokumen' },
  { id: 'freelancer', label: 'Freelancer / Kontraktor', badgeClass: 'bg-info text-dark', desc: 'Akses pembuatan CV, Invoice, dan manajemen proyek klien' },
  { id: 'client', label: 'Klien (Tinjauan)', badgeClass: 'bg-secondary text-white', desc: 'Hanya tinjau progres dan tagihan invoice' }
];

// Helper to get secondary auth for host to create accounts without logging out
let secondaryAppInstance = null;
function getSecondaryAuth() {
  if (!secondaryAppInstance) {
    const existingApps = getApps();
    const found = existingApps.find(a => a.name === 'SecondaryHostAuth');
    secondaryAppInstance = found || initializeApp(firebaseConfig, 'SecondaryHostAuth');
  }
  return getAuth(secondaryAppInstance);
}

/**
 * Get active Host session from local storage
 */
export function getHostSession() {
  try {
    const stored = localStorage.getItem('taskarts_host_session');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(e);
  }
  return null;
}

/**
 * Get active custom user session from local storage
 */
export function getUserSession() {
  try {
    const stored = localStorage.getItem('taskarts_user_session');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(e);
  }
  return null;
}

/**
 * Check if user is currently authenticated (Host, created user, or Firebase Auth)
 */
export function isAuthenticated() {
  return !!getHostSession() || !!getUserSession() || !!auth.currentUser;
}

/**
 * Get any currently active session profile
 */
export function getActiveSession() {
  const host = getHostSession();
  if (host) return host;
  const custom = getUserSession();
  if (custom) return custom;
  if (auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
      role: 'member'
    };
  }
  return null;
}

/**
 * Login specifically as Host Project (arif_kafeinarts | admin123)
 */
export async function loginAsHostProject(username, password) {
  const u = (username || '').trim().toLowerCase();
  const p = (password || '').trim();

  const isHostUsername = (u === 'arif_kafeinarts' || u === 'arif_kafeinarts@kafeinarts.com' || u === 'host');
  const isHostPassword = (p === 'admin123');

  if (!isHostUsername || !isHostPassword) {
    throw new Error('Kredensial Host Project salah. Gunakan username "arif_kafeinarts" dan kata sandi "admin123".');
  }

  const hostProfile = {
    uid: 'host_arif_kafeinarts',
    email: 'arif_kafeinarts@kafeinarts.com',
    displayName: 'Arif Kafeinarts (Host Project)',
    role: 'host',
    isHostProject: true,
    department: 'Host & Workspace Owner',
    status: 'active',
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  };

  // Save host session immediately (0ms delay)
  localStorage.setItem('taskarts_host_session', JSON.stringify(hostProfile));
  window.dispatchEvent(new CustomEvent('taskarts-auth-changed', { detail: hostProfile }));

  // Non-blocking background sync so UI never freezes or hangs
  (async () => {
    try {
      const signInPromise = signInWithEmailAndPassword(auth, 'arif_kafeinarts@kafeinarts.com', 'admin123');
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
      await Promise.race([signInPromise, timeout]);
    } catch (authErr) {
      try {
        const createPromise = createUserWithEmailAndPassword(auth, 'arif_kafeinarts@kafeinarts.com', 'admin123');
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
        await Promise.race([createPromise, timeout]);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: 'Arif Kafeinarts (Host)' });
        }
      } catch (createErr) {}
    }

    try {
      const hostDocRef = doc(db, 'users', 'host_arif_kafeinarts');
      await setDoc(hostDocRef, hostProfile, { merge: true });
    } catch (e) {}
  })().catch(() => {});

  return {
    user: hostProfile,
    profile: hostProfile
  };
}

/**
 * Host Project: Create new user account for team/clients
 */
export async function createAccountByHost({ email, password, displayName, role = 'member', department = 'Umum', notes = '' }) {
  const cleanEmail = email.trim();
  const cleanPass = password.trim();
  let newUid = 'usr_' + Date.now();

  try {
    const secAuth = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secAuth, cleanEmail, cleanPass);
    newUid = cred.user.uid;
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await signOut(secAuth);
  } catch (err) {
    console.warn('Firebase Auth secondary creation notice:', err.message);
  }

  const accountDoc = {
    uid: newUid,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split('@')[0],
    role: role || 'member',
    department: department || 'Umum',
    initialPassword: cleanPass, // Retained for host reference so host can share with user
    status: 'active',
    createdBy: 'arif_kafeinarts (Host Project)',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to Firestore users collection
  try {
    const userRef = doc(db, 'users', newUid);
    await setDoc(userRef, accountDoc, { merge: true });
  } catch (fsErr) {
    console.warn('Firestore setDoc notice:', fsErr);
  }

  // Also save to created accounts cache
  const existing = getStoredCreatedAccounts();
  const updated = [accountDoc, ...existing.filter(a => a.email !== cleanEmail && a.uid !== newUid)];
  localStorage.setItem('taskarts_created_accounts', JSON.stringify(updated));

  return accountDoc;
}

export function getStoredCreatedAccounts() {
  try {
    const stored = localStorage.getItem('taskarts_created_accounts');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function deleteAccountByHost(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { status: 'deleted', updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Firestore delete notice:', e);
  }
  const existing = getStoredCreatedAccounts();
  const filtered = existing.filter(a => a.uid !== uid);
  localStorage.setItem('taskarts_created_accounts', JSON.stringify(filtered));
  return filtered;
}

export async function updateAccountRoleByHost(uid, newRole) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Firestore update role notice:', e);
  }
  const existing = getStoredCreatedAccounts();
  const updated = existing.map(a => a.uid === uid ? { ...a, role: newRole } : a);
  localStorage.setItem('taskarts_created_accounts', JSON.stringify(updated));
  return updated;
}

export async function getUserProfileData(uid) {
  if (!uid) return null;
  // Check host session
  const host = getHostSession();
  if (host && host.uid === uid) return host;

  // Check stored accounts
  const created = getStoredCreatedAccounts();
  const matched = created.find(a => a.uid === uid);
  if (matched) return matched;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.warn('getUserProfileData notice:', e);
  }
  return null;
}

/**
 * Get or create User Profile in Firestore
 */
export async function syncUserProfile(user, additionalData = {}) {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || additionalData.displayName || user.email?.split('@')[0] || 'Pengguna',
      photoURL: user.photoURL || '',
      role: additionalData.role || 'member', // Default role
      department: additionalData.department || 'Umum',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const existing = snap.data();
    // Update if extra data passed (like role update)
    if (Object.keys(additionalData).length > 0) {
      const updated = {
        ...existing,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, updated, { merge: true });
      return updated;
    }
    return existing;
  }
}

/**
 * Register User with email, password, name, and specified Role
 */
export async function registerWithRole(email, password, displayName, role = 'member', department = 'Umum') {
  const cleanEmail = (email || '').trim();
  const cleanPass = (password || '').trim();
  let userObj = null;
  let profile = null;

  try {
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
    userObj = credential.user;
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    profile = await syncUserProfile(credential.user, { displayName, role, department });
  } catch (err) {
    console.warn('Firebase createUserWithEmailAndPassword notice:', err.message);
    if (err.code === 'auth/email-already-in-use') {
      throw err;
    }
    // Fallback: create resilient custom account in local registry
    const newUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    profile = {
      uid: newUid,
      email: cleanEmail,
      displayName: displayName || cleanEmail.split('@')[0],
      role: role || 'member',
      department: department || 'Umum',
      initialPassword: cleanPass,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    userObj = profile;

    const existing = getStoredCreatedAccounts();
    const updated = [profile, ...existing.filter(a => a.email !== cleanEmail)];
    localStorage.setItem('taskarts_created_accounts', JSON.stringify(updated));

    try {
      const userRef = doc(db, 'users', newUid);
      await setDoc(userRef, profile, { merge: true });
    } catch (e) {}
  }

  // Set active user session
  localStorage.setItem('taskarts_user_session', JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('taskarts-auth-changed', { detail: profile }));

  return { user: userObj, profile };
}

/**
 * Login with Email/Username and Password
 * Supports Host Project (arif_kafeinarts | admin123) and host-created accounts
 */
export async function loginWithEmail(emailOrUsername, password) {
  const identifier = (emailOrUsername || '').trim();
  const cleanPass = (password || '').trim();

  // 1. Check if trying to login as Host Project
  if (
    (identifier.toLowerCase() === 'arif_kafeinarts' || identifier.toLowerCase() === 'arif_kafeinarts@kafeinarts.com' || identifier.toLowerCase() === 'host') &&
    cleanPass === 'admin123'
  ) {
    return await loginAsHostProject('arif_kafeinarts', 'admin123');
  }

  // 2. Check if this is an account created by the Host Project in local registry
  const createdAccounts = getStoredCreatedAccounts();
  const matchedCreated = createdAccounts.find(
    a => (a.email.toLowerCase() === identifier.toLowerCase() || a.displayName.toLowerCase() === identifier.toLowerCase()) &&
         (a.initialPassword === cleanPass)
  );

  if (matchedCreated) {
    // Save user session immediately (0ms delay)
    localStorage.setItem('taskarts_user_session', JSON.stringify(matchedCreated));
    window.dispatchEvent(new CustomEvent('taskarts-auth-changed', { detail: matchedCreated }));
    // Try authenticating to Firebase Auth non-blocking in background
    signInWithEmailAndPassword(auth, matchedCreated.email, cleanPass).catch(e => {
      // Safe to ignore in background
    });
    return { user: matchedCreated, profile: matchedCreated };
  }

  // 3. Standard Firebase Auth sign-in with network timeout guard
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Koneksi autentikasi membutuhkan waktu terlalu lama. Silakan periksa koneksi Anda dan coba lagi.')), 4500);
  });

  const credential = await Promise.race([
    signInWithEmailAndPassword(auth, identifier, cleanPass),
    timeoutPromise
  ]);

  let profile = null;
  try {
    const syncPromise = syncUserProfile(credential.user);
    const syncTimeout = new Promise((res) => setTimeout(() => res(null), 1500));
    profile = await Promise.race([syncPromise, syncTimeout]);
  } catch (e) {
    profile = null;
  }

  if (!profile) {
    profile = {
      uid: credential.user.uid,
      email: credential.user.email || identifier,
      displayName: credential.user.displayName || (identifier.includes('@') ? identifier.split('@')[0] : identifier),
      role: 'member'
    };
  }

  localStorage.setItem('taskarts_user_session', JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('taskarts-auth-changed', { detail: profile }));
  return { user: credential.user, profile };
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const profile = await syncUserProfile(credential.user);
  localStorage.setItem('taskarts_user_session', JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('taskarts-auth-changed', { detail: profile }));
  return { user: credential.user, profile };
}

/**
 * Logout
 */
export async function logoutUser() {
  localStorage.removeItem('taskarts_host_session');
  localStorage.removeItem('taskarts_user_session');
  window.dispatchEvent(new CustomEvent('taskarts-auth-changed', { detail: null }));
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out notice:', e);
  }
}

/**
 * Update user role (Admin or self-selection)
 */
export async function updateUserRole(uid, newRole) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Fetch all users for Admin role management
 */
export async function getAllUsersList() {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Store user module data in Firestore (Cloud sync)
 */
export async function saveUserDataStore(uid, storeKey, payload) {
  if (!uid) return;
  const storeRef = doc(db, 'users', uid, 'data', storeKey);
  await setDoc(storeRef, {
    ownerId: uid,
    storeKey,
    payload,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Load user module data from Firestore
 */
export async function loadUserDataStore(uid, storeKey) {
  if (!uid) return null;
  const storeRef = doc(db, 'users', uid, 'data', storeKey);
  const snap = await getDoc(storeRef);
  if (snap.exists()) {
    return snap.data().payload;
  }
  return null;
}

export default {
  app,
  auth,
  db,
  USER_ROLES,
  getHostSession,
  getUserSession,
  isAuthenticated,
  getActiveSession,
  loginAsHostProject,
  createAccountByHost,
  getStoredCreatedAccounts,
  deleteAccountByHost,
  updateAccountRoleByHost,
  syncUserProfile,
  registerWithRole,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  updateUserRole,
  getAllUsersList,
  saveUserDataStore,
  loadUserDataStore
};
