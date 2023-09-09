// initialize
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";

const firebaseConfig = {
	apiKey: "AIzaSyBGKX14k6jRqHVH0mvzwEO5lA0G4_ImoSQ",
	authDomain: "fire-base-resatiate.firebaseapp.com",
	projectId: "fire-base-resatiate",
	storageBucket: "fire-base-resatiate.appspot.com",
	messagingSenderId: "260707572479",
	appId: "1:260707572479:web:784fe1f7f76bedc875caca",
};

const firebaseApp = initializeApp(firebaseConfig);

// Add Firebase products that you want to use
import {
	getAuth,
	onAuthStateChanged,
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Sign Up ---------------------------------------------------
// const signUpButton = document.querySelector(`[data-js="signUpButton"]`);
// signUpButton.addEventListener("click", async () => {
// 	// await signUpWithEmail();
// });

async function signUpWithEmail() {
	signOut(auth)
		.then(() => {
			console.log("Sign-out successful.");
		})
		.catch((error) => {
			console.log("sorry bro, An error happened.", error);
		});
	let email = document.getElementById("signup-email").value;
	let password = document.getElementById("signup-password").value;
	await createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in
			const user = userCredential.user;
			console.log(user);
			console.log(userCredential);
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.log(errorCode);
			console.log(errorMessage);
			alert(errorMessage);
		});
}

// Sign In ---------------------------------------------------
// const signInButton = document.querySelector(`[data-js="signInButton"]`);
// signInButton.addEventListener("click", async () => {
// 	// await loginWithEmail();
// });

async function loginWithEmail() {
	signOut(auth)
		.then(() => {
			console.log("Sign-out successful.");
		})
		.catch((error) => {
			console.log("sorry bro, An error happened.", error);
		});
	let email = document.getElementById("login-email").value;
	let password = document.getElementById("login-password").value;
	await signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in
			const user = userCredential.user;
			console.log(user);
			console.log(userCredential);
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.log(errorCode);
			console.log(errorMessage);
			alert(errorMessage);
		});
}

// Login with Gmail ---------------------------------------------------
const googleGmailLogins = document.querySelectorAll(
	`[data-js="googleGmailLogin"]`
);

Array.from(googleGmailLogins).forEach((googleGmailLogin) => {
	googleGmailLogin.addEventListener("click", () => {
		signOut(auth)
			.then(() => {
				console.log("Sign-out successful.");
			})
			.catch((error) => {
				console.log("sorry bro, An error happened.", error);
			});
		signInWithPopup(auth, googleProvider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential =
					GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				console.log(token);

				const user = result.user;
				console.log(user);
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.customData.email;
				// The AuthCredential type that was used.
				const credential =
					GoogleAuthProvider.credentialFromError(error);
				// ...
			});
	});
});

// to redirect different pages ---------------------------------------------------
const forms = document.querySelectorAll(".modal__form-container--form");
const loginButtons = document.querySelectorAll(`[data-js="loginButton"]`);

const allOrganisationList = ["restaurant", "industry", "ngo"];

Array.from(loginButtons).forEach((loginButton, index) => {
	loginButton.addEventListener("click", () => {
		forms.forEach((form) => {
			form.action = `${allOrganisationList[index]}/`;
			form.onsubmit = async () => {
				console.log("inside onsubmit");
				// signOut(auth)
				// 	.then(() => {
				// 		console.log("Sign-out successful.");
				// 	})
				// 	.catch((error) => {
				// 		console.log("sorry bro, An error happened.", error);
				// 	});
				if (form.id == "signInForm") {
					console.log("Signed In");
					await loginWithEmail();
				} else if (form.id == "signUpForm") {
					console.log("Signed Up");
					await signUpWithEmail();
				}
				onAuthStateChanged(auth, function (user) {
					if (user) {
						window.location.href = form.action;
						console.log("User Email: ", user.email);
					}
				});
			};
		});
	});
});

// --------------------------------------
