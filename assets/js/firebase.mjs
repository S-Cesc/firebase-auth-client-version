  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB_NllVnrGPqVADRM9yE7yO9ugVHzPVe2A",
    authDomain: "prova1-b9865.firebaseapp.com",
    projectId: "prova1-b9865",
    storageBucket: "prova1-b9865.appspot.com",
    messagingSenderId: "205606413170",
    appId: "1:205606413170:web:87c42101d2e1bf219ab3eb"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  export { auth, db };
