import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import {
	getFirestore,
	collection,
	getDocs,
	getDoc,
	doc,
	updateDoc,
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
let IndustryId = null;

// Wrap the onAuthStateChanged listener in a function that returns a promise
function getUserData() {
    return new Promise(async (resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                email = user.email;
                const queryEmail = query(colRef, where("email", "==", email));
                const querySnapshot = await getDocs(queryEmail);
                if (querySnapshot.empty) {
                    reject("User not found.");
                    return;
                }
                querySnapshot.forEach((doc) => {
                    const { Name, Industryname, respondNotifications } = doc.data();
					IndustryId = doc.id; // Assuming the auto-generated ID is the Industry ID
                    changingContent(Name, Industryname);
                    fetchNotifications(IndustryId);
                    displayLastTransactions(respondNotifications)
                    resolve(IndustryId);
                });
            } else {
                reject("User not found.");
            }
        });
    });
}

// Usage: Retrieve user data using the promise
getUserData()
    .then((IndustryId) => {
		console.log("Industry ID:", IndustryId);
    })
    .catch((error) => {
        console.error("Error:", error);
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

//Function to query-select the link--------------------------------------------
document.getElementById("showNotifications").addEventListener("click", () => {
    // Fetch notifications for the specific Industry (replace 'IndustryId' with the actual ID)
	console.log("Hello")
    const IndustryID = IndustryId;
    fetchNotifications(IndustryID);
});

//Function to fetch notifications--------------------------------------------
async function fetchNotifications(IndustryID) {
    try {
        // Fetch the Industry data by ID
        console.log(IndustryID)
        const IndustryRef = doc(colRef, IndustryID);
        const IndustryDoc = await getDoc(IndustryRef);

        if (IndustryDoc.exists()) {
            const IndustryData = IndustryDoc.data();

            // Get the notifications array from the Industry data
            const notifications = IndustryData.notifications || [];

            // Get the modal and notifications list elements
            const modal = document.getElementById("notificationsModal");
            const notificationsList = document.getElementById("notificationsList");
            notificationsList.innerHTML = "";

            // Populate the modal with notifications
            notifications.forEach((notification, index) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <p><strong>${notification.restaurantName}</strong> from ${notification.restaurantAddress} posted a new update for their food listing.</p>
                    <p>Contact Details:</p>
                    <div class="Special-Paragraph">
                        <p><strong>Phone Number:</strong> ${notification.restaurantphoneNumber}</p>
                        <div class="Special-Paragraph-Buttons">
                            <button class="respond-button">Respond</button>
                            <button class="delete-button">Delete</button>
                        </div>
                    </div>`;
                notificationsList.appendChild(listItem);
    
                // Add event listeners for the buttons
                const respondButtons = listItem.querySelectorAll(".respond-button");
                const deleteButtons = listItem.querySelectorAll(".delete-button");
    
                // Add click event listener for responding to the notification
                respondButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                        respondToNotification(IndustryId,notification,index);
                    });
                });
    
                // Add click event listener for deleting the notification
                deleteButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                        deleteNotification(IndustryId,index);
                    });
                });
            });

            // Display the modal
            modal.style.display = "block";
        } else {
            console.error("Industry not found.");
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

// Function to close the modal
document.getElementById("closeModal").addEventListener("click", () => {
    const modal = document.getElementById("notificationsModal");
    modal.style.display = "none";
});

//Functon for past transaction
function respondToNotification(IndustryId, notification, index) {
    // Implement your logic to respond to the notification here
    console.log("Responding to notification at index", index);
        // Assuming 'respond-notifications' is not an array, initialize it as an empty array
    const respondNotifications = [];

    // Push the new notification to the array
    respondNotifications.push(notification);

    // Update the Firestore document with the 'respond-notifications' array
    const db = getFirestore();
    const IndustryRef1 = doc(db, "Industry", IndustryId);

    updateDoc(IndustryRef1, {
        "respondNotifications": respondNotifications
    })
        .then(() => {
            console.log("Notification responded and updated successfully.");
            alert("Congragulations! you can make someone smile, contact them soon");
            deleteNotification(IndustryId,index);
        })
        .catch((error) => {
            console.error("Error updating notification:", error);
        });
}

function displayLastTransactions(respondNotifications) {
    // Get the table element
    const table = document.querySelector(".box-8 table");

    // Clear existing table rows
    table.innerHTML = "";

        // Create table header
        const tableHeader = document.createElement("tr");
        tableHeader.innerHTML = `
            <th>Restaurant</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Date</th>
        `;
        table.appendChild(tableHeader);
    

    // Iterate through the respondNotifications and create a table row for each
    respondNotifications.forEach((notification) => {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = `
            <td>${notification.restaurantName}</td>
            <td>${notification.restaurantAddress}</td>
            <td>${notification.restaurantphoneNumber}</td>
            <td>${notification.clickTimestamp}</td>
        `;
        table.appendChild(tableRow);
    });
}


//function to delete notifications
async function deleteNotification(IndustryId, index) {
    try {
        // Fetch the current 'notifications' array from Firestore
        const IndustryRef = doc(colRef, IndustryId);
        const IndustryDoc = await getDoc(IndustryRef);
        console.log(index);
        if (IndustryDoc.exists()) {
            const IndustryData = IndustryDoc.data();
            const notifications = IndustryData.notifications || [];

            // Ensure the index is within valid bounds
            if (index >= 0 && index < notifications.length) {
                // Remove the notification at the specified index
                notifications.splice(index, 1);

                // Update the 'notifications' field in Firestore with the modified array
                await updateDoc(IndustryRef, { notifications });
                alert("Cool then! please be available to support us next time");
                console.log("Notification deleted successfully.");
            } else {
                console.error("Invalid index for deletion.");
            }
        } else {
            console.error("Industry not found.");
        }
    } catch (error) {
        console.error("Error deleting notification:", error);
    }
}


