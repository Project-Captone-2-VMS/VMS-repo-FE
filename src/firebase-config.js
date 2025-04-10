import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2ACYngXlT5wL-bGtGt7i6VvRMJPbCfso",
  authDomain: "vms-otp-5fe3f.firebaseapp.com",
  projectId: "vms-otp-5fe3f",
  storageBucket: "vms-otp-5fe3f.firebasestorage.app",
  messagingSenderId: "837829830682",
  appId: "1:837829830682:web:df9e22aa1f2c9273fa09a3",
  measurementId: "G-0VZ11M8NWJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
