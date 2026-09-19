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
  { id: 'admin', label: 'Administrator', badgeClass: 'bg-danger text-white', desc: 'Akses penuh seluruh sistem, kelola role & data' },
  { id: 'manager', label: 'Project / Finance Manager', badgeClass: 'bg-warning text-dark', desc: 'Kelola proyek, keuangan, approve klaim' },
  { id: 'member', label: 'Team Member', badgeClass: 'bg-primary text-white', desc: 'Akses kolaborasi, tugas, catatan, dan dokumen' },
  { id: 'freelancer', label: 'Freelancer / Kontraktor', badgeClass: 'bg-info text-dark', desc: 'Akses pembuatan CV, Invoice, dan manajemen proyek klien' },
  { id: 'client', label: 'Klien (Tinjauan)', badgeClass: 'bg-secondary text-white', desc: 'Hanya tinjau progres dan tagihan invoice' }
];

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
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  const profile = await syncUserProfile(credential.user, { displayName, role, department });
  return { user: credential.user, profile };
}

/**
 * Login with Email and Password
 */
export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await syncUserProfile(credential.user);
  return { user: credential.user, profile };
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const profile = await syncUserProfile(credential.user);
  return { user: credential.user, profile };
}

/**
 * Logout
 */
export async function logoutUser() {
  await signOut(auth);
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
