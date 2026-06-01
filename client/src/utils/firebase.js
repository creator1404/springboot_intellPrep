
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"


const firebaseConfig = {
  apiKey:  import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "intellprep.firebaseapp.com",
  projectId: "intellprep",
  storageBucket: "intellprep.firebasestorage.app",
  messagingSenderId: "968555926626",
  appId: "1:968555926626:web:30cb80832041111450ed3b"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}


