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
	signOut,
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
const colRef = collection(db, "Industry");

getDocs(colRef).then((snapshot) => {
	console.log(snapshot.docs);
});

//Get the current logged in user code ---------------------------------------------------
const auth = getAuth(firebaseApp);
let email = "test@mail.com";

onAuthStateChanged(auth, async (user) => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		email = user.email;
		// to redirect into dashboard if registered
		const queryEmail = query(colRef, where("email", "==", email));
		console.log(email);
		const querySnapshot = await getDocs(queryEmail);
		if (querySnapshot.empty) {
			alert("Please Register First.");
			window.location.href = "../";
		}
		querySnapshot.forEach((doc) => {
			console.log(doc);
			// doc.data() is never undefined for query doc snapshots
			console.log(doc.id, " => ", doc.data());
			const { Name, Industryname } = doc.data();
			console.log(Name);
			console.log(Industryname);
			changingContent(Name, Industryname);
		});
	} else {
		console.log("User not found error");
		alert("Please Login to Continue");
		window.location.href = "../../";
		// User is signed out
		// window.location.href = "/";
	}
});

// Signout on clicking logout
document.querySelector("#logOut").addEventListener("click", async () => {
	console.log("logging out!");
	await signOut(auth)
		.then(() => {
			console.log("Sign-out successful.");
		})
		.catch((error) => {
			console.log("sorry bro, An error happened.", error);
		});
	window.location.href = "../../";
});

// function to be executed-------------------------------------------------
function changingContent(Name, Industryname) {
	const username = document.querySelector("#Sarans");
	username.textContent = Name;
	const Indusname = document.querySelector("#Kalinga");
	Indusname.textContent = Industryname;
}
