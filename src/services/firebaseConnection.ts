import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCDMVgAGN8k6kZAup4Fcp5ApmFEBZ4La6s",
  authDomain: "chamada-ifarte.firebaseapp.com",
  projectId: "chamada-ifarte",
  storageBucket: "chamada-ifarte.firebasestorage.app",
  messagingSenderId: "231867626989",
  appId: "1:231867626989:web:5a21c5bc3794ae9673a3e4"
};

const FirebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(FirebaseApp);

export { db };