// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsQKArlr-nSKpWGPRFOaXPWr82qdT3knk",
  authDomain: "blogging-website-using-mern.firebaseapp.com",
  projectId: "blogging-website-using-mern",
  storageBucket: "blogging-website-using-mern.appspot.com",
  messagingSenderId: "1046861551666",
  appId: "1:1046861551666:web:9399f8965de8e4f349042b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider()

const auth = getAuth();

export const authWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth, provider)
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err)
    })

    return user;
}