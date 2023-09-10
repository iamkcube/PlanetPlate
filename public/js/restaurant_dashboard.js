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
	signOut
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
const colRef = collection(db, "Restaurant");
const colRefNGO = collection(db, "NGO");
const colRefIndustry = collection(db, "Industry");

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
			const { Name, Restaurantname } = doc.data();
			console.log(Name);
			console.log(Restaurantname);
			changingContent(Name, Restaurantname);
		});
	} else {
		console.log("User not found error");
		alert("Please Login to Continue");
		window.location.href = "../../";
		// User is signed out
		// window.location.href = "/";
	}
});

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
function changingContent(Name, Restaurantname) {
	const username = document.querySelector("#Sarans");
	username.textContent = Name;
	const Restname = document.querySelector("#Kalinga");
	Restname.textContent = Restaurantname;
}

// Display Modal
// JavaScript for opening modals with event delegation
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('placeOrderButton')) {
        var buttonId = event.target.id; // Get the ID of the clicked button
        // Map button IDs to modal IDs
        var modalId;
        switch (buttonId) {
            case 'foodModalButton':
                modalId = 'foodModal';
                break;
            case 'oilModalButton':
                modalId = 'oilModal';
                break;
            case 'peelWasteModalButton':
                modalId = 'peelWasteModal';
                break;
            default:
                return; // Exit if the button doesn't have a corresponding modal
        }
        // Open the modal with the corresponding ID
        var modal = document.getElementById(modalId);
		console.log(modal)
        if (modal) {
            $(modal).modal('show'); // Using jQuery to show the modal
        }
    }
});

//Adding content to the Food Modal----------------------------------------------------------------------------
// Add an event listener to the "foodModalButton" to fetch and display NGO data
document.querySelector("#foodModalButton").addEventListener("click", async () => {
    try {
        const ngoData = await getNGOData();
        displayNGODataInModal(ngoData);
    } catch (error) {
        console.error("Error fetching NGO data:", error);
    }
});

// Function to fetch data from the "NGO" collection
async function getNGOData() {
    const queryNGO = query(colRefNGO); // Assuming colRefNGO points to the "NGO" collection
    const querySnapshot = await getDocs(queryNGO);
    const ngoData = [];
    querySnapshot.forEach((doc) => {
        ngoData.push(doc.data());
    });
    return ngoData;
}

function displayNGODataInModal(ngoData) {
    const modalContent = document.querySelector("#ngoCards");
    modalContent.innerHTML = ""; // Clear existing content

    ngoData.forEach((ngo) => {
        const ngoCard = document.createElement("div");
        ngoCard.className = "cardNGO"; // Renamed to cardNGO

        const ngoName = document.createElement("h4");
        ngoName.textContent = ngo.NGOname; // Replace with your data field name

        const ngoDescription = document.createElement("p");
        ngoDescription.textContent = ngo.Address; // Replace with your data field name

        const sendButton = document.createElement("button");
        sendButton.textContent = "Notify";
		sendButton.addEventListener("click", () => {
            alert("The NGO will contact you soon,if available");// Handle the "Send" button click
        });

        ngoCard.appendChild(ngoName);
        ngoCard.appendChild(ngoDescription);
        ngoCard.appendChild(sendButton);

        modalContent.appendChild(ngoCard);
    });
}


document.querySelector("#oilModalButton").addEventListener("click", async () => {
    try {
        const IndustryData = await getIndustryData();
        displayIndustryDataInModal(IndustryData);
    } catch (error) {
        console.error("Error fetching Industry data:", error);
    }
});


async function getIndustryData() {
    const queryIndustry = query(colRefIndustry); // Assuming colRefNGO points to the "NGO" collection
    const querySnapshot = await getDocs(queryIndustry);
    const IndustryData = [];
    querySnapshot.forEach((doc) => {
        IndustryData.push(doc.data());
    });
    return IndustryData;
}

function displayIndustryDataInModal(ngoData) {
    const modalContent = document.querySelector("#IndustryCards");
    modalContent.innerHTML = ""; // Clear existing content

    ngoData.forEach((Industry) => {
        const ngoCard = document.createElement("div");
        ngoCard.className = "cardNGO"; // Renamed to cardNGO

        const ngoName = document.createElement("h4");
        ngoName.textContent = Industry.Industryname; // Replace with your data field name

        const ngoDescription = document.createElement("p");
        ngoDescription.textContent = Industry.Address; // Replace with your data field name

        const sendButton = document.createElement("button");
        sendButton.textContent = "Notify";
		sendButton.addEventListener("click", () => {
            alert("The Company will contact you soon,if available");// Handle the "Send" button click
        });

        ngoCard.appendChild(ngoName);
        ngoCard.appendChild(ngoDescription);
        ngoCard.appendChild(sendButton);

        modalContent.appendChild(ngoCard);
    });
}

document.querySelector("#peelWasteModalButton").addEventListener("click", async () => {
    try {
        const IndustryData1 = await getIndustryData1();
        displayIndustryDataInModal1(IndustryData1);
    } catch (error) {
        console.error("Error fetching Industry data:", error);
    }
});


async function getIndustryData1() {
    const queryIndustry = query(colRefIndustry); // Assuming colRefNGO points to the "NGO" collection
    const querySnapshot = await getDocs(queryIndustry);
    const IndustryData1 = [];
    querySnapshot.forEach((doc) => {
        IndustryData1.push(doc.data());
    });
    return IndustryData1;
}

function displayIndustryDataInModal1(ngoData) {
    const modalContent = document.querySelector("#IndustryCards1");
    modalContent.innerHTML = ""; // Clear existing content

    ngoData.forEach((Industry) => {
        const ngoCard = document.createElement("div");
        ngoCard.className = "cardNGO"; // Renamed to cardNGO

        const ngoName = document.createElement("h4");
        ngoName.textContent = Industry.Industryname; // Replace with your data field name

        const ngoDescription = document.createElement("p");
        ngoDescription.textContent = Industry.Address; // Replace with your data field name

        const sendButton = document.createElement("button");
        sendButton.textContent = "Notify";
		sendButton.addEventListener("click", () => {
            alert("The Company will contact you soon,if available");// Handle the "Send" button click
        });

        ngoCard.appendChild(ngoName);
        ngoCard.appendChild(ngoDescription);
        ngoCard.appendChild(sendButton);

        modalContent.appendChild(ngoCard);
    });
}

