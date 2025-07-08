import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRLQRQ1X5PUMeYGUq3emjCDBlFiweqCpE",
  authDomain: "split-ease-38af2.firebaseapp.com",
  projectId: "split-ease-38af2",
  storageBucket: "split-ease-38af2.appspot.com", // ✅ make sure it's appspot.com
  messagingSenderId: "341296961760",
  appId: "1:341296961760:web:ffa84235071a9a157cd885",
  measurementId: "G-Y8NCQXNL4J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // ✅ this is the important part
