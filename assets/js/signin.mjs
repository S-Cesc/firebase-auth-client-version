import { auth, appCheck, db } from "./firebase.mjs";
import {
	onAuthStateChanged,
	setPersistence,
	inMemoryPersistence,
	browserSessionPersistence,
	signInWithEmailAndPassword,
	sendEmailVerification,
	signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
	AlertStyle,
	showMsg,
	passwordCustomValidity,
	passordIconSwitchPasswordInputTypes,
	removeAlertsOnClick,
	toggleMenuOptions
} from "./general.mjs";

const email_element = document.getElementById("email_txt");
const password_element = document.getElementById("password_txt");

document.addEventListener("DOMContentLoaded", () => {
	db.appCheck = appCheck;
	toggleMenuOptions(null);
	email_element.value = "";
	password_element.value = "";
});

password_element.addEventListener("input", () => {
	passwordCustomValidity(password_element);
});

onAuthStateChanged(auth, (user) => {
	if (user) {
		if (user.emailVerified) {
			const pathName = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1);
			window.location.replace(pathName + "profile.html");
		} else {
			setPersistence(auth, inMemoryPersistence);
			showMsg("alert_msg", "Revisa tu email para acceder.", AlertStyle.Warning, "", ".link");
		}
	} else {
		email_element.value = "";
		password_element.value = "";
	}
});

/* Asignar evento al botón del formulario */
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
	const email = email_element.value;
	const password = password_element.value;
	e.preventDefault();
	setPersistence(auth, browserSessionPersistence)
		.then(() => {
			signInWithEmailAndPassword(auth, email, password)
				.then((userCredential) => {
					// Signed in 
					// Existing and future Auth states are now persisted in the current
					// session only. Closing the window would cle(ar any existing state even
					// if a user forgets to sign out.
					// ...
					// New sign-in will be persisted with session persistence.
					if (userCredential.user.emailVerified) {
						toggleMenuOptions(userCredential.user);
						showMsg("alert_msg", "Login OK!", AlertStyle.Info);
						return true;
					} else {
						setPersistence(auth, inMemoryPersistence);
						showMsg("alert_msg", "Revisa tu email para acceder.", AlertStyle.Warning, "", ".link");
						return false;
					};
				})
				.catch((error) => {
					showMsg("alert_msg", error.message, AlertStyle.Danger, error.code);
					return false;
				});
		})
		.catch((error) => {
			showMsg("alert_msg", "Error en la persistencia de la sesión: " + error.message, AlertStyle.Danger, error.code);
			return false;
		});
});

const resend_link = document.getElementById("resend_link");
resend_link.addEventListener("click", () => {
	if (form.checkValidity()) {
		if (auth.currentUser) {
			resend_link.classList.add("ocultar");
			sendEmailVerification(auth.currentUser).then(() => {
				showMsg("alert_msg", "Se ha enviado de nuevo el correo.", AlertStyle.Info);
			});
		} else {
			showMsg("alert_msg", "Invalid email or password", AlertStyle.Warning);
		}
	}
});

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
	signOut(auth).then(() => {
		const email_element = document.getElementById("email_txt");
		const password_element = document.getElementById("password_txt");
		email_element.value = "";
		password_element.value = "";
		showMsg("alert_msg", "Has salido del sistema", AlertStyle.Info);
		toggleMenuOptions(null);
	}).catch((error) => {
		// An error happened.
		showMsg("alert_msg", "Error al abandonar la sesión: " + error.message, AlertStyle.Danger, error.code);
	});
});

passordIconSwitchPasswordInputTypes();
removeAlertsOnClick();
