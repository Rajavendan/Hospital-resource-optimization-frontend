    // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMKAnJr0df-_FCIhd6Rn89Ea0idG9KNok",
  authDomain: "resource-optimization-3c59c.firebaseapp.com",
  projectId: "resource-optimization-3c59c",
  storageBucket: "resource-optimization-3c59c.firebasestorage.app",
  messagingSenderId: "290250715804",
  appId: "1:290250715804:web:c97ff932959affe9513359",
  measurementId: "G-EV7G2JW211"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
