
/*
  RECUPERAR CONTRASENYA FIREBASE:
*/

import { auth } from "./firebase.mjs";
import {
	onAuthStateChanged,
	sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
	AlertStyle,
	showMsg,
	removeAlertsOnClick,
	toggleMenuOptions
} from "./general.mjs";

const email_element = document.getElementById("email_txt");

document.addEventListener("DOMContentLoaded", () => {
	email_element.value = "";
});

onAuthStateChanged(auth, (user) => {
	toggleMenuOptions(user);
	if (user) {
		email_element.value = user.email;
	} else {
		email_element.value = "";
	}
});

/* Asignar evento al botón del formulario */
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
	e.preventDefault();
	//CHECK FIELDS
	const email = email_element.value;
	if (email_element.validity.valid && email.trim()) {
		sendPasswordResetEmail(auth, email).then(() => {
			showMsg("alert_msg", "Se te ha enviado un correo para cambiar la contraseña; revisa el correo.", AlertStyle.Info)
		})
			.catch((error) => {
				showMsg("alert_msg", error.message, AlertStyle.Danger, error.code);
				return false;
			});
	} else {
		showMsg("alert_msg", "Invalid email", AlertStyle.Warning);
		return false;
	}
});

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
	signOut(auth).then(() => {
		email_element.value = "";
		toggleMenuOptions(null);
		showMsg("alert_msg", "Has salido del sistema", AlertStyle.Info);
	}).catch((error) => {
		// An error happened.
		showMsg("alert_msg", "Error al abandonar la sesión: " + error.message, AlertStyle.Danger, error.code);
	});
});

removeAlertsOnClick();
