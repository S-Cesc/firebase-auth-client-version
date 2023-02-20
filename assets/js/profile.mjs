
import { auth, appCheck, db } from "./firebase.mjs";

import {
    onAuthStateChanged,
    EmailAuthProvider, reauthenticateWithCredential,
    signInWithEmailAndPassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

import {
    AlertStyle,
    showMsg,
    passordIconSwitchPasswordInputTypes,
    removeAlertsOnClick,
    toggleMenuOptions,
    emptyImg,
    plainLowerCaseString
} from "./general.mjs";

import {
    insertDisplayName,
    updateDisplayName
} from "./transactions.mjs";

const name_txt = document.getElementById("name_txt");
const email_lbl = document.getElementById("email_lbl");
const password_txt = document.getElementById("password_txt");
const img_url = document.getElementById("img_url");
const userName_title = document.getElementById("userName_title");
const img_show = document.getElementById("img_show");
const send_zone = document.getElementById("send_zone");
const gravatar_button = document.getElementById("gravatar_button");
const button = document.getElementById("profile_button");

document.addEventListener("DOMContentLoaded", () => {
	db.appCheck = appCheck;
    showPerfil(null);
    button.disabled = false;
});

onAuthStateChanged(auth, (user) => {
    toggleMenuOptions(user);
    showPerfil(user);
});

const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const name = name_txt.value?.trim();
    const password = password_txt.value;
    if (password && name && password.trim() &&
        password_txt.validity.valid &&
        (img_url.value.trim() == "" || img_url.validity.valid) &&
        (name_txt.value != user.providerData[0].displayName ||
            img_url.value != user.providerData[0].photoURL)) {
        password_txt.value = "";
        button.disabled = true;
        send_zone.classList.add("ocultar");
        if (user) {
            const credential = EmailAuthProvider.credential(user.email, password);
            try {
                const userCredential = await reauthenticateWithCredential(user, credential);
                // User re-authenticated.
                if (userCredential.user.emailVerified) {
                    try {
                        await updateUserProfile(userCredential.user);
                        return true;
                    }
                    catch (error) {
                        showMsg("alert_msg", error.message, AlertStyle.Danger, error.code);
                        return false;
                    }
                } else {
                    setPersistence(auth, inMemoryPersistence);
                    showMsg("alert_msg", "Revisa tu email para acceder.", AlertStyle.Warning, "", ".link");
                    send_zone.classList.add("ocultar");
                    return false;
                }
            }
            catch (e) {
                showMsg("alert_msg", "ERROR AUTENTICACIÓN: " + error.message, AlertStyle.Danger, error.code);
                return false;
            }
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password)
                // // Signed in 
                if (userCredential.user.emailVerified) {
                    try {
                        await updateUserProfile(userCredential.user);
                        return true;
                    }
                    catch (error) {
                        showMsg("alert_msg", error.message, AlertStyle.Danger, error.code);
                        return false;
                    }
                } else {
                    setPersistence(auth, inMemoryPersistence);
                    showMsg("alert_msg", "Revisa tu email para acceder.", AlertStyle.Warning, "", ".link");
                    send_zone.classList.add("ocultar");
                    return false;
                }
            }
            catch (error) {
                showMsg("alert_msg", "ERROR AUTENTICACIÓN: " + error.message, AlertStyle.Danger, error.code);
                return false;
            }
        }
    } else {
        password_txt.value = "";
        button.disabled = true;
        send_zone.classList.add("ocultar");
        showMsg("alert_msg", "Datos incorrectos.", AlertStyle.Warning);
        return false;
    }
});

async function updateUserProfile(user) {
    if (user) {
        //transformación del perfil para valores únicos
        const newDisplayName = plainLowerCaseString(name_txt.value);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        //El usuario ya tiene displayName
        if (docSnap.exists()) {
            // Comprobar si se ha de actualizar el displayName
            // probablemente user.displayName = oldDisplayName
            // pero el perfil no se actualiza en transacción
            const oldDisplayName = docSnap.data().displayName;
            if (oldDisplayName != newDisplayName) {
                //se ha de actualizar
                console.log("before call: ", user.uid, oldDisplayName, newDisplayName);
                await updateDisplayName(db, user.uid, oldDisplayName, newDisplayName);
            }
        } else {
            // necesita insert
            // generalmente el perfil user.displayName está vacío
            // pero no se actualiza en transacción
            console.log("before call: ", user.uid, newDisplayName);
            await insertDisplayName(db, user.uid, newDisplayName);
        }
        //TRANSACCIÓN CON éxito (sinó habría generado error)
        //observar que en profile se guarda el perfil sin transformar
        updateProfile(auth.currentUser, {
            displayName: name_txt.value, photoURL: img_url.value
        }).then(() => {
            // Profile updated!
            showPerfil(auth.currentUser);
            showMsg("alert_msg", "Perfil actualizado.", AlertStyle.Info);
        });
    } else {
        setPersistence(auth, inMemoryPersistence);
        throw Error("Unauthorized access");
    }
}

name_txt.addEventListener("change", async () => {
    const user = auth.currentUser;
    if (user && name_txt.value && name_txt.value.trim() != user.providerData[0].displayName) {
        const newDisplayName = plainLowerCaseString(name_txt.value);
        const newDisplayNameDoc = await getDoc(doc(db, "displayNames", newDisplayName));
        if (newDisplayNameDoc.exists()) {
            button.disabled = true;
            send_zone.classList.add("ocultar");
            showMsg("alert_msg", "Este nombre ya existe", AlertStyle.Warning);
        }
        else {
            button.disabled = false;
            send_zone.classList.remove("ocultar");
        }

    } else {
        send_zone.classList.add("ocultar");
    }
});

img_url.addEventListener("change", img_url_onchange);

function img_url_onchange() {
    const user = auth.currentUser;
    if (user && img_url.value.trim() != user.providerData[0].photoURL) {
        button.disabled = false;
        send_zone.classList.remove("ocultar");
        if (img_url.value && img_url.value.trim() != "") {
            img_show.src = img_url.value;
        } else {
            img_show.src = emptyImg();
        }
    } else {
        send_zone.classList.add("ocultar");
        img_show.src = user.providerData[0].photoURL;
    }
}

gravatar_button.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user && user.emailVerified) {
        img_url.value = "https://www.gravatar.com/avatar/" + md5(user.email.trim().toLowerCase());
        if (user.providerData[0].photoURL
            && user.providerData[0].photoURL.trim() != img_url.value) {
            console.log(user.providerData[0].photoURL.trim());
            console.log(img_url.value);
            img_url_onchange();
        } else {
            console.log(user.providerData[0].photoURL.trim());
            console.log(img_url.value);
        }
    } else {
        showMsg("alert_msg", "Actualmente no hay usuario registrado en el sistema.", AlertStyle.Warning);
    }
});

function showPerfil(user) {
    if (user) {
        email_lbl.textContent = user.email + (user.emailVerified ? "" : " ?");
        name_txt.value = user.providerData[0].displayName;
        img_url.value = user.providerData[0].photoURL;
        send_zone.classList.add("ocultar");
        if (name_txt.value && name_txt.value.trim()) {
            userName_title.textContent = name_txt.value;
        } else {
            userName_title.textContent = "Usuario";
        }
        if (img_url.value && img_url.value.trim() != "") {
            img_show.src = user.providerData[0].photoURL;
        }
        else {
            img_show.src = emptyImg();
        }
    }
    else {
        name_txt.value = "";
        email_lbl.textContent = "";
        img_url.value = "";
        userName_title.textContent = "Usuario";
        img_show.src = emptyImg();
    }
    password_txt.value = "";
    send_zone.classList.add("ocultar");
}

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
    signOut(auth).then(() => {
        showMsg("alert_msg", "Has salido del sistema", AlertStyle.Info);
        showPerfil(null);
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

