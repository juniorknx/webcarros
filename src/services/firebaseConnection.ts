// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD1w6t2d6aRGwR5KZ1YKzXtPFZQNK3nkuE",
    authDomain: "webcarros-8954a.firebaseapp.com",
    projectId: "webcarros-8954a",
    storageBucket: "webcarros-8954a.appspot.com",
    messagingSenderId: "745315927103",
    appId: "1:745315927103:web:20b760bf0579f99868648a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }