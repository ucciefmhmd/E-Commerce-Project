
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvYXdDLwLCDvrIhr-gko5sYxUa6b20GAY",
  authDomain: "ecommerce-finalapp.firebaseapp.com",
  projectId: "ecommerce-finalapp",
  storageBucket: "ecommerce-finalapp.appspot.com",
  messagingSenderId: "567588967714",
  appId: "1:567588967714:web:f594b8a9a6a806ba3d817b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore();