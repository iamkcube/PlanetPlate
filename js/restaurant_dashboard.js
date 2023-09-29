import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import {
	getFirestore,
	collection,
	getDocs,
    getDoc,
	doc,
    updateDoc,
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
let userDataPromise = null;
let restaurantName = null;
let restaurantphoneNumber = null;
let restaurantAddress = null;

// Wrap the onAuthStateChanged listener in a function
function initializeAuthListener() {
    return new Promise(async (resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    email = user.email;
                    const queryEmail = query(colRef, where("email", "==", email));
                    const querySnapshot = await getDocs(queryEmail);
                    if (querySnapshot.empty) {
                        alert("Please Register First.");
                        window.location.href = "../";
                        reject("User not found.");
                        return;
                    }
                    querySnapshot.forEach((doc) => {
                        const { Name, Restaurantname, phnumber, Address } = doc.data();
                        const userData = {
                            name: Name,
                            restaurantName: Restaurantname,
                            restaurantphoneNumber: phnumber,
                            restaurantAddress: Address,
                        };
                        restaurantphoneNumber = userData.restaurantphoneNumber;
                        restaurantAddress = userData.restaurantAddress;
                        restaurantName = userData.restaurantName;
                        changingContent(Name, Restaurantname);
                        resolve(userData); // Resolve the promise with the user data
                    });
                } catch (error) {
                    console.error("Error fetching data:", error);
                    reject(error);
                }
            } else {
                console.log("User not found error");
                alert("Please Login to Continue");
                window.location.href = "../../";
                reject("User not found.");
            }
        });
    });
}

// Initialize the authentication listener
userDataPromise = initializeAuthListener();

// Now you can use userDataPromise to access the user data
userDataPromise.then((userData) => {
    console.log("userData outside fetchData function:", userData);
}).catch((error) => {
    console.error("Error:", error);
});

console.log(userDataPromise);

//Logout function---------------------------------------------------------
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
        const ngoItem = doc.data();
        ngoItem.id = doc.id; // Add the document ID to the object
        ngoData.push(ngoItem);
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
        sendButton.dataset.ngoId = ngo.id;
		sendButton.addEventListener("click", (event) => {
            const ngoId = event.target.dataset.ngoId;
            const clickTimestamp = new Date().toISOString();
            notifyNGO(ngoId,restaurantName,restaurantAddress,restaurantphoneNumber,clickTimestamp);
        });
        ngoCard.appendChild(ngoName);
        ngoCard.appendChild(ngoDescription);
        ngoCard.appendChild(sendButton);
        modalContent.appendChild(ngoCard);
    });
}

async function notifyNGO(ngoId, restaurantName, restaurantAddress, restaurantphoneNumber, clickTimestamp) {
    try {
        // Fetch the NGO data by ID
        const ngoRef = doc(colRefNGO, ngoId);
        const ngoDoc = await getDoc(ngoRef);

        if (ngoDoc.exists()) {
            const ngoData = ngoDoc.data();

            // Create a new notification object
            const notification = {
                restaurantName: restaurantName,
                restaurantAddress: restaurantAddress,
                restaurantphoneNumber: restaurantphoneNumber,
                clickTimestamp: clickTimestamp,
            };
            // Initialize the 'notifications' field as an empty array if it doesn't exist
            if (!ngoData.notifications) {
                ngoData.notifications = [];
            }
            // Add the new notification to the 'notifications' array
            ngoData.notifications.push(notification);
            // Update the Firestore document with the new 'notifications' array
            await updateDoc(ngoRef, { notifications: ngoData.notifications });
            alert("Notification sent to " + ngoData.NGOname);
        } else {
            console.error("NGO not found.");
        }
    } catch (error) {
        console.error("Error notifying NGO:", error);
    }
}





//Adding content to the oil Modal----------------------------------------------------------------------------
// Add an event listener to the "oilModalButton" to fetch and display NGO data
document.querySelector("#oilModalButton").addEventListener("click", async () => {
    try {
        const IndustryData = await getIndustryData();
        displayIndustryDataInModal(IndustryData);
    } catch (error) {
        console.error("Error fetching Industry data:", error);
    }
});


// Function to fetch data from the "Industry" collection
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

//Adding content to the peel Modal----------------------------------------------------------------------------
// Add an event listener to the "peelModalButton" to fetch and display NGO data
document.querySelector("#peelWasteModalButton").addEventListener("click", async () => {
    try {
        const IndustryData1 = await getIndustryData1();
        displayIndustryDataInModal1(IndustryData1);
    } catch (error) {
        console.error("Error fetching Industry data:", error);
    }
});

// Function to fetch data from the "Industry" collection
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

