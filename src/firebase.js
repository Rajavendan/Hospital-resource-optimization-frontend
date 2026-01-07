    // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDKMKb9priLL4seQIoxshc6RI0om0AICQg",
    authDomain: "hospital-resource-optimi-c6bea.firebaseapp.com",
    projectId: "hospital-resource-optimi-c6bea",
    storageBucket: "hospital-resource-optimi-c6bea.firebasestorage.app",
    messagingSenderId: "175833405688",
    appId: "1:175833405688:web:9e7c2758421dd4b978030d",
    measurementId: "G-QQXD2FFX5F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
