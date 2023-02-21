
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
    removeSpacesAlsoNonbreakables,
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
    img_url.value = "\xA0";
    showPerfil(null);
    button.disabled = false;
});

password_txt.addEventListener("input", () => {
    passwordCustomValidity(password_txt);
});

onAuthStateChanged(auth, (user) => {
    toggleMenuOptions(user);
    showPerfil(user);
});

const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const name = name_txt.value.trim();
    if (name != user.providerData[0].displayName ||
        img_url.value != user.providerData[0].photoURL) {
        const password = password_txt.value;
        password_txt.value = "";
        button.disabled = true;
        send_zone.classList.add("ocultar");
        if (user) {
            const credential = EmailAuthProvider.credential(user.email, password);
            try {
                const userCredential = await reauthenticateWithCredential(user, credential);
                button.disabled = false;
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
                button.disabled = false;
                showMsg("alert_msg", "ERROR AUTENTICACIÓN: " + e.message, AlertStyle.Danger, e.code);
                return false;
            }
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                button.disabled = false;
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
                button.disabled = false;
                showMsg("alert_msg", "ERROR AUTENTICACIÓN: " + error.message, AlertStyle.Danger, error.code);
                return false;
            }
        }
    } else {
        password_txt.value = "";
        send_zone.classList.add("ocultar");
        showMsg("alert_msg", "Sin cambios.", AlertStyle.Warning);
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
            send_zone.classList.add("ocultar");
            showMsg("alert_msg", "Este nombre ya existe", AlertStyle.Warning);
        }
        else {
            send_zone.classList.remove("ocultar");
        }

    } else {
        send_zone.classList.add("ocultar");
    }
});

img_url.addEventListener("input", () => {
    const user = auth.currentUser;
    const name = name_txt.value.trim();
    if (user && name != "") {
        const imgUrlValue = removeSpacesAlsoNonbreakables(img_url.value);
        if (imgUrlValue != user.providerData[0].photoURL) {
            send_zone.classList.remove("ocultar");
        } else if (name == user.providerData[0].displayName) {
            send_zone.classList.add("ocultar");
        }
    }
});

img_url.addEventListener("change", () => {
    const imgUrlValue = removeSpacesAlsoNonbreakables(img_url.value);
    if (imgUrlValue != "") {
        img_show.src = imgUrlValue;
    } else {
        img_show.src = emptyImg();
    }
});

gravatar_button.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user && user.emailVerified) {
        img_url.value = "https://www.gravatar.com/avatar/" + md5(user.email.trim().toLowerCase());
        img_show.src = img_url.value;
        if (user.providerData[0].photoURL
            && user.providerData[0].photoURL != img_url.value) {
            img_url_onchange();
        }
    } else {
        showMsg("alert_msg", "Actualmente no hay usuario registrado en el sistema.", AlertStyle.Warning);
    }
});

function showPerfil(user) {
    password_txt.value = "";
    send_zone.classList.add("ocultar");
    if (user) {
        email_lbl.textContent = user.email + (user.emailVerified ? "" : " ?");
        name_txt.value = user.providerData[0].displayName;
        if (name_txt.value && name_txt.value.trim() != "") {
            userName_title.textContent = name_txt.value;
            img_url.value = user.providerData[0].photoURL;
            if (img_url.value && img_url.value.trim() != "") {
                img_show.src = user.providerData[0].photoURL;
            }
            else {
                img_show.src = emptyImg();
            }
        } else {
            userName_title.textContent = "Usuario";
            img_url.value = "\xA0"; // Avoid incorrect autocomplete impossible !!!
            img_show.src = emptyImg();
        }
    }
    else {
        email_lbl.textContent = "";
        name_txt.value = "";
        img_url.value = "\xA0"; // Avoid incorrect autocomplete impossible !!!
        userName_title.textContent = "Usuario";
        img_show.src = emptyImg();
    }
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

