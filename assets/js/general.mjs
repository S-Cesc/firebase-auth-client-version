/* classes d'alertes */
// caja alert (bootstrap-studio) alert classList permite cambiar entre alert-danger, alert-warning, alert-success...
export const AlertStyle = Object.freeze({
	Success: Symbol("alert-success"),
	Info: Symbol("alert-info"),
	Warning: Symbol("alert-warning"),
	Danger: Symbol("alert-danger"),
})

export {
	showMsg,
	passordIconSwitchPasswordInputTypes,
	removeAlertsOnClick,
	toggleMenuOptions,
	emptyImg,
	plainLowerCaseString
}

const removeAccents = (str) => {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const removeWhitespaces = (str) => {
	return str.replace(/\s+/g, '');
}

const removeSymbolsAndNumbers = (str) => {
	return str.replace(/(\d|[^a-zA-Z])+/g,'');
}

const plainLowerCaseString = (str) => {
	return removeSymbolsAndNumbers(removeWhitespaces(removeAccents(str))).toLowerCase();
}

function emptyImg() {
    return "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
}


/* Mostra msg en elemento con ID alertId. Dentro de alertId hay:
- un elemento con la clase "alert-icon" que muestra icono según alertStyle (cambiando valor de la clase)
- un elemento con la clase "alert-msg", cuyo textContent será msg
- puede haber elementos span con la clase link
*/
function showMsg(alertId, msg, alertStyle = AlertStyle.Warning, additionalInfo = "", showLinkSelector = null, timeout = 0) {
	const style = alertStyle.toString().slice(7, -1);
	const alert = document.getElementById(alertId);
	const alert_Icon = alert.querySelector(".alert-icon");
	const alert_txt = alert.querySelector(".alert-msg");
	const alert_info = alert.querySelector(".small");
	alert_txt.textContent = msg;
	alertIconClass(alert_Icon, alertStyle);
	alert.classList.add(style);
	if (alert_info) alert_info.textContent = additionalInfo;
	if (showLinkSelector) {
		alert.querySelectorAll(showLinkSelector).forEach(lnk => {
			lnk.classList.remove("ocultar");
		});
	}
	alert.classList.remove("ocultar");
	if (timeout > 0) {
		setTimeout(() => {
			alert.classList.add("ocultar");
		}, timeout)
	}
}


/* fa servir classe .password-icon amb nextElementSibling input (password/text)
	Mostra password en fer click en la icona
 */
function passordIconSwitchPasswordInputTypes() {
	const passwords = document.querySelectorAll(".password-icon");
	passwords.forEach(item => {
		item.addEventListener("click", () => {
			item.classList.toggle("fa-eye");
			item.classList.toggle("fa-eye-slash");
			const x = item.nextElementSibling;
			if (x.type === "password") {
				x.type = "text";
			} else {
				x.type = "password";
			}
		})
	});
}

/* Treu la classe .mostrar de tots els elements amb classe .alert
	quan un element input rep el focus
*/
function removeAlertsOnClick() {
	const items = document.querySelectorAll("input");
	items.forEach(item => {
		item.addEventListener("focusin", () => {
			const alerts = document.querySelectorAll(".alert");
			alerts.forEach(item => {
				item.classList.add("ocultar");
				item.querySelectorAll(".link").forEach(lnk => {
					lnk.classList.add("ocultar");
				});

			})
		});
	});
}

/* canvia la icona d'element segons el nivell d'alerta;
   compte! esborra totes les classes d'element; nomes preserva les acabades per "-icon"
*/
function alertIconClass(element, alertStyle) {
	let style = "";
	switch (alertStyle) {
		case (AlertStyle.Success): style = "far fa-thumbs-up";
		case (AlertStyle.Info): style = "fa fa-info-circle";
		case (AlertStyle.Warning): style = "fa fa-warning";
		case (AlertStyle.Danger): style = "fas fa-exclamation-circle";
		default: style = "";
	}
	let iconStyle = [];
	let classList = element.classList;
	while (classList.length > 0) {
		if (classList.item(0).endsWith("-icon")) {
			iconStyle.push(classList.item(0));
		}
		classList.remove(classList.item(0));
	}
	while (iconStyle.length > 0) {
		classList.add(iconStyle[0]);
		iconStyle.pop();
	}
	if (style) classList.add(style);
}

/* Hide some menu options before login */
function toggleMenuOptions(user) {
	const changeEmail = document.getElementById("changeEmail");
	const profileAccess = document.getElementById("profileAccess");
	const dataAccess = document.getElementById("dataAccess");
	const logout = document.getElementById("logout");
	if (user && user.emailVerified) {
		if (changeEmail) changeEmail.classList.remove("ocultar");
		if (profileAccess) profileAccess.classList.remove("ocultar");
		if (dataAccess) dataAccess.classList.remove("ocultar");
		if (logout) logout.classList.remove("ocultar");
	} else {
		if (changeEmail) changeEmail.classList.add("ocultar");
		if (profileAccess) profileAccess.classList.add("ocultar");
		if (dataAccess) dataAccess.classList.add("ocultar");
		if (logout) logout.classList.add("ocultar");
	}
}
