/**
 * Google Drive OAuth & Direct File / Document / Image Upload Utility
 * Uses Google Identity Services (GSI) Token Client with https://www.googleapis.com/auth/drive.file scope.
 */
import firebaseConfig from '../../firebase-applet-config.json';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';

const CLIENT_ID = firebaseConfig.oAuthClientId || '';
const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient = null;
let currentAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Load Google Identity Services script dynamically
 */
export function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (err) => reject(err));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Get OAuth Access Token for Google Drive using Popup
 */
export async function getGoogleDriveAccessToken(promptConsent = false) {
  // Check if token is still valid
  if (currentAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return currentAccessToken;
  }

  await loadGsiScript();

  return new Promise((resolve, reject) => {
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: DRIVE_SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          currentAccessToken = response.access_token;
          tokenExpiresAt = Date.now() + (parseInt(response.expires_in, 10) || 3600) * 1000;
          resolve(currentAccessToken);
        },
      });

      tokenClient.requestAccessToken({ prompt: promptConsent ? 'consent' : '' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Upload any File (Image, PDF, Document, Excel, etc.) to Google Drive
 * Uses Multipart Upload
 */
export async function uploadFileToGoogleDrive(file, options = {}) {
  const token = await getGoogleDriveAccessToken(false);

  const metadata = {
    name: options.customName || file.name,
    mimeType: file.type || 'application/octet-stream',
    description: options.description || 'Uploaded from TaskArts By Kafeinarts'
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal upload ke Google Drive: ${errText}`);
  }

  const driveData = await res.json();

  // If user is authenticated in Firebase, record into Firestore /drive_files collection
  try {
    const currentUser = auth.currentUser;
    const docRecord = {
      driveFileId: driveData.id,
      name: driveData.name,
      mimeType: driveData.mimeType,
      size: Number(driveData.size || file.size || 0),
      webViewLink: driveData.webViewLink || `https://drive.google.com/file/d/${driveData.id}/view`,
      webContentLink: driveData.webContentLink || '',
      thumbnailLink: driveData.thumbnailLink || '',
      uploadedBy: currentUser ? currentUser.uid : 'guest',
      uploaderEmail: currentUser ? currentUser.email : '',
      module: options.module || 'general',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'drive_files'), docRecord);
  } catch (err) {
    console.warn('Could not save file record to firestore:', err);
  }

  return driveData;
}

/**
 * List files uploaded through this app recorded in Firestore or query Drive API
 */
export async function getDriveFilesList() {
  try {
    const currentUser = auth.currentUser;
    const q = currentUser 
      ? query(collection(db, 'drive_files'), where('uploadedBy', '==', currentUser.uid))
      : collection(db, 'drive_files');
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Failed to load drive files:', e);
    return [];
  }
}

/**
 * Delete record from firestore
 */
export async function deleteDriveFileRecord(docId) {
  await deleteDoc(doc(db, 'drive_files', docId));
}

export default {
  loadGsiScript,
  getGoogleDriveAccessToken,
  uploadFileToGoogleDrive,
  getDriveFilesList,
  deleteDriveFileRecord
};
