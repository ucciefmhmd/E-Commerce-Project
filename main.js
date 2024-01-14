
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "ecommerce-finalapp.firebaseapp.com",
  projectId: "ecommerce-finalapp",
  storageBucket: "ecommerce-finalapp.appspot.com",
  messagingSenderId: "REDACTED",
  appId: "REDACTED"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore();