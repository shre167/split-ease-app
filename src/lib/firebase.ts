// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRLQRQ1X5PUMeYGUq3emjCDBlFiweqCpE",
  authDomain: "split-ease-38af2.firebaseapp.com",
  projectId: "split-ease-38af2",
  storageBucket: "split-ease-38af2.appspot.com",
  messagingSenderId: "341296961760",
  appId: "1:341296961760:web:ffa84235071a9a157cd885",
  measurementId: "G-Y8NCQXNL4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth };