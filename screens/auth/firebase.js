// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCob60sEAESSCwUBX_zyCoeGOkyMa42PQU",
    authDomain: "nileauth-a2d26.firebaseapp.com",
    projectId: "nileauth-a2d26",
    storageBucket: "nileauth-a2d26.appspot.com",
    messagingSenderId: "23954601554",
    appId: "1:23954601554:web:857222a0e399432eca918b",
    measurementId: "G-FYR3LTB5KY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)