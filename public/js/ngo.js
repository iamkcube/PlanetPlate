// Firebase Imports -------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import {
	getFirestore,
	collection,
	getDocs,
	addDoc,
	query,
	where,
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";

const firebaseConfig = {
	apiKey: "AIzaSyBGKX14k6jRqHVH0mvzwEO5lA0G4_ImoSQ",
	authDomain: "fire-base-resatiate.firebaseapp.com",
	projectId: "fire-base-resatiate",
	storageBucket: "fire-base-resatiate.appspot.com",
	messagingSenderId: "260707572479",
	appId: "1:260707572479:web:784fe1f7f76bedc875caca",
};
const firebaseApp = initializeApp(firebaseConfig);

// data base for restaurant section ---------------------------------------------------
const db = getFirestore();
const colRef = collection(db, "NGO");

getDocs(colRef).then((snapshot) => {
	console.log(snapshot.docs);
});

// ----------------------------------------------------
// ----------------------------------------------------

// For image carousel
const allImages = document.querySelectorAll(".slider-imgBox");
let index = 0;

setInterval(() => {
	Array.from(allImages).forEach((image, i) => {
		if (i === index) {
			image.setAttribute("data-visible", "true");
		} else {
			image.setAttribute("data-visible", "false");
		}
	});
	index += 1;
	if (index === 3) {
		index = 0;
	}
}, 2000);

// For accordions
const items = document.querySelectorAll(".accordion button");

function toggleAccordion() {
	const itemToggle = this.getAttribute("aria-expanded");
	let i;
	for (i = 0; i < items.length; i++) {
		items[i].setAttribute("aria-expanded", "false");
	}

	if (itemToggle == "false") {
		this.setAttribute("aria-expanded", "true");
	}
}

items.forEach((item) => item.addEventListener("click", toggleAccordion));

// Navbar Animation on scroll
window.addEventListener("scroll", function () {
	const nav = document.querySelector("#navbar");
	nav.classList.toggle("sticky", window.scrollY > 0);
});

// Firebase Stuff !!! --------------------------------------------------------

//Get the current logged in user code ---------------------------------------------------

const auth = getAuth(firebaseApp);
let email = "test@mail.com";

onAuthStateChanged(auth, async (user) => {
	console.log("🚀 ~ file: restaurant.js:35 ~ auth:", user);
	if (user) {
		// User is signed in, see docs for a list of available properties
		email = user.email;

		// to redirect into dashboard if registered
		console.log(email);
		const queryEmail = query(colRef, where("email", "==", email));
		const querySnapshot = await getDocs(queryEmail);
		if (!querySnapshot.empty) {
			hideRegisterAndChangeButtonNameAndLocation(
				"GO TO DASHBOARD",
				"dashboard/"
			);
		}
	} else {
		console.log("User not found error");
		hideRegisterAndChangeButtonNameAndLocation("LOGIN", "../");
		alert("Please Login to Continue");
		// User is signed out
		// window.location.href = "/";
	}
});

// Add data to firestore from register form ---------------------------------------------------
const addcustomerform = document.querySelector("#register-form");
addcustomerform.addEventListener("submit", async (e) => {
	e.preventDefault();
	console.log(email);
	const queryEmail = query(colRef, where("email", "==", email));
	const querySnapshot = await getDocs(queryEmail);
	if (!querySnapshot.empty) {
		alert("Already Registered!");
		return;
	}

	await addDoc(colRef, {
		Name: addcustomerform.Name.value,
		AadhaarNumber: addcustomerform.AadhaarNumber.value,
		LicenseNumber: addcustomerform.LicenseNumber.value,
		Country: addcustomerform.Country.value,
		City: addcustomerform.City.value,
		Address: addcustomerform.Address.value,
		email: email,
		phnumber: addcustomerform.phnumber.value,
		NGOname: addcustomerform.NGOname.value,
		dateOfRegistration: new Date(),
		timeFromUTC: Date.now(),
	});
	alert("Registered Successfully!");
	window.location.href = "dashboard/";
});

function hideRegisterAndChangeButtonNameAndLocation(buttonName, location) {
	document.querySelector("#register-restaurant").style.display = "none";
	const dashboardButton = document.querySelector("#restaurant-login-link");
	dashboardButton.textContent = buttonName;
	dashboardButton.href = location;
}

// ----------------------------------------------------
