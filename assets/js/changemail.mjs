import { auth, appCheck, db } from "./firebase.mjs";
import {
    onAuthStateChanged,
    EmailAuthProvider, reauthenticateWithCredential,
    signInWithEmailAndPassword,
    updateEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    AlertStyle,
    showMsg,
    passordIconSwitchPasswordInputTypes,
    removeAlertsOnClick,
    toggleMenuOptions
} from "./general.mjs";

const email_element = document.getElementById("email_txt");
const password_element = document.getElementById("password_txt");
const email2_element = document.getElementById("email2_txt");

document.addEventListener("DOMContentLoaded", () => {
	db.appCheck = appCheck;
    email_element.value = "";
    password_element.value = "";
    email2_element.value = "";
});

onAuthStateChanged(auth, (user) => {
    toggleMenuOptions(user);
    if (user && user.emailVerified) {
        email_element.value = user.email;
    } else {
        email_element.value = "";
    }
    password_element.value = "";
    email2_element.value = "";
});

/* Asignar evento al botón del formulario */
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = email_element.value;
    const password = password_element.value;
    const email2 = email2_element.value;

    if (email_element.validity.valid && password_element.validity.valid && email2_element.validity.valid
        && email.trim() && password.trim() && email2.trim()) {
        if (email != email2) {
            const user = auth.currentUser;
            if (user) {
                const credential = EmailAuthProvider.credential(email, password);
                reauthenticateWithCredential(user, credential).then(() => {
                    // User re-authenticated.
                    doUpdateEmail(user, email2);
                }).catch((error) => {
                    showMsg("alert_msg", "ERROR AUTENTICACIÓN: " + error.message, AlertStyle.Danger, error.code);
                    return false;
                });
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Signed in 
                        if (userCredential.user.emailVerified) {
                            // User authenticated.
                            doUpdateEmail(userCredential.user, email2);
                        } else {
                            setPersistence(auth, inMemoryPersistence);
                            showMsg("alert_msg", "Revisa tu email para acceder.", AlertStyle.Warning, "", ".link");
                            return false;
                        };
                    })
                    .catch((error) => {
                        showMsg("alert_msg", "ERROR AUTENTICACIÓN: " + error.message, AlertStyle.Danger, error.code);
                        return false;
                    });
            }
        } else {
            showMsg("alert_msg", "Ambos correos son iguales; no se ha hecho ningún cambio", AlertStyle.Info);
            return false;
        }
    } else {
        showMsg("alert_msg", "Invalid email or password", AlertStyle.Warning);
        return false;
    }

});

function doUpdateEmail(user, email2) {
    updateEmail(user, email2).then(() => {
        // Email updated!
        signOut(auth).then(() => {
            // Sign-out successful.
            showMsg("alert_msg",
                "Revisa el correo; se ha enviado un mensaje a la dirección original que permitirá hacer efectivo el cambio.",
                AlertStyle.Info, "Se ha cerrado la sesión");
        }).catch((error) => {
            showMsg("alert_msg",
                "Revisa el correo; se ha enviado un mensaje a la dirección original que permitirá hacer efectivo el cambio.",
                AlertStyle.Info, "Se ha producido un error cerrando la sesión: " + error.message);
        });
    }).catch((error) => {
        showMsg("alert_msg", error.message, AlertStyle.Danger, error.code);
    });
}

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
    signOut(auth).then(() => {
        showMsg("alert_msg", "Has salido del sistema", AlertStyle.Info);
        email_element.value = "";
        password_element.value = "";
        email2_element.value = "";
        toggleMenuOptions(null);
        const pathName = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1);
        window.location.replace(pathName + "signin.html");
    }).catch((error) => {
        // An error happened.
        showMsg("alert_msg", "Error al abandonar la sesión: " + error.message, AlertStyle.Danger, error.code);
    });
});

passordIconSwitchPasswordInputTypes();
removeAlertsOnClick();







