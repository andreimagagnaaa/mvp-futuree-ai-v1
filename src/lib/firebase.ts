import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCFl4Q08CKEBLks2CRahH_X4nVzO7R8EDo",
  authDomain: "teste-86bd7.firebaseapp.com",
  projectId: "teste-86bd7",
  storageBucket: "teste-86bd7.firebasestorage.app",
  messagingSenderId: "315904721148",
  appId: "1:315904721148:web:21116b3d46980524d65779",
  measurementId: "G-3P79VKC07M"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app); 