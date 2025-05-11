import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAH3RtW-ooDzyIPnndfjp2l4270Bq8OTCQ",
    authDomain: "buynext-e-commerce.firebaseapp.com",
    projectId: "buynext-e-commerce",
    storageBucket: "buynext-e-commerce.firebasestorage.app",
    messagingSenderId: "994057725268",
    appId: "1:994057725268:web:a8fd3084e5d7d9308814c1",
    measurementId: "G-CBLCF26TR0"
};

const app = initializeApp(firebaseConfig);
export default app;