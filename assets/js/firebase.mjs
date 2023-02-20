  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-check.js";
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
  
  // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
  // key is the counterpart to the secret key you set in the Firebase console.
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LenPT4kAAAAAHduGxUg6V_doaLfBHxakcY6sZBP'),

    // Optional argument.
    // If true, the SDK automatically refreshes App Check tokens as needed.
    isTokenAutoRefreshEnabled: true
  });

  const db = getFirestore(app);

  export { auth, appCheck, db };
