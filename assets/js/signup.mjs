import { auth } from "./firebase.mjs";
import {
	onAuthStateChanged,
	setPersistence,
	inMemoryPersistence,
	createUserWithEmailAndPassword,
	sendEmailVerification,
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
const password2_element = document.getElementById("password2_txt");

document.addEventListener("DOMContentLoaded", () => {
	toggleMenuOptions(null);
	email_element.value = "";
	password_element.value = "";
	password2_element.value = "";
});

onAuthStateChanged(auth, (user) => {
	if (user) {
		if (user.emailVerified) {
			const pathName = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1);
			window.location.replace(pathName + "profile.html");
		} else {
			showMsg("alert_msg", "Revisa tu email para acceder.", AlertStyle.Warning, "", ".link");
		}
	} else {
		email_element.value = "";
		password_element.value = "";
		password2_element.value = "";
	}
});

/* Asignar evento al botón del formulario */
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
	e.preventDefault();
	//CHECK FIELDS
	const email = email_element.value;
	const password = password_element.value;
	const password2 = password2_element.value;
	if (email_element.validity.valid && password_element.validity.valid
		&& email.trim() && password.trim()) {
		if (password2_element.validity.valid && password == password2) {
			setPersistence(auth, inMemoryPersistence)
				.then(() => {
					/* autenticación Firebase con contraseña */
					/* https://firebase.google.com/docs/auth/web/password-auth */
					createUserWithEmailAndPassword(auth, email, password)
						.then((userCredential) => {
							// const user = userCredential.user;
							// Signed in 
							sendEmailVerification(userCredential.user).then(() => {
								showMsg("alert_msg", "Te has registrado correctamente; revisa el correo.", AlertStyle.Info)
							})
								.catch((error) => {
									showMsg("alert_msg", error.message, AlertStyle.Danger, error.code);
									return false;
								});
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
		} else {
			showMsg("prompt_msg", "Passwords no coinciden", AlertStyle.Warning);
			return false;
		}
	} else {
		showMsg("prompt_msg", "Invalid email or password", AlertStyle.Warning);
		return false;
	}
});

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
	signOut(auth).then(() => {
		const email_element = document.getElementById("email_txt");
		const password_element = document.getElementById("password_txt");
		const password2_element = document.getElementById("password2_txt");
		email_element.value = "";
		password_element.value = "";
		password2_element.value = "";
		showMsg("alert_msg", "Has salido del sistema", AlertStyle.Info);
		toggleMenuOptions(null);
	}).catch((error) => {
		// An error happened.
		showMsg("alert_msg", "Error al abandonar la sesión: " + error.message, AlertStyle.Danger, error.code);
	});
});

passordIconSwitchPasswordInputTypes();
removeAlertsOnClick();
