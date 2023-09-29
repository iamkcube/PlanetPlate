import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    getDoc,
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
const colRef = collection(db, "NGO");

getDocs(colRef).then((snapshot) => {
    console.log(snapshot.docs);
});

//Get the current logged in user code ---------------------------------------------------
const auth = getAuth(firebaseApp);
let email = "test@mail.com";
let ngoId = null;


// Wrap the onAuthStateChanged listener in a function that returns a promise
function getNGOId() {
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
                    const { Name, NGOname, respondNotifications } = doc.data();
                    ngoId = doc.id; // Assuming the auto-generated ID is the NGO ID
                    changingContent(Name, NGOname);
                    fetchNotifications(ngoId);
                    displayLastTransactions(respondNotifications)
                    resolve(ngoId);
                });
            } else {
                reject("User not found.");
            }
        });
    });
}

// Usage: Retrieve NGO ID using the promise
getNGOId()
    .then((ngoId) => {
        console.log("NGO ID:", ngoId);
        // You can use the NGO ID outside this block
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
function changingContent(Name, NGOname) {
    const username = document.querySelector("#Sarans");
    username.textContent = Name;
    const ngoElementName = document.querySelector("#Kalinga");
    ngoElementName.textContent = NGOname;
}


document.getElementById("showNotifications").addEventListener("click", () => {
    // Fetch notifications for the specific NGO (replace 'ngoId' with the actual ID)
    const ngoID = ngoId;
    fetchNotifications(ngoID);
});


// Function to fetch and display notifications
async function fetchNotifications(ngoID) {
    try {
        // Fetch the NGO data by ID
        console.log(ngoID)
        const ngoRef = doc(colRef, ngoID);
        const ngoDoc = await getDoc(ngoRef);

        if (ngoDoc.exists()) {
            const ngoData = ngoDoc.data();

            // Get the notifications array from the NGO data
            const notifications = ngoData.notifications || [];

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
                        respondToNotification(ngoId,notification,index);
                    });
                });
    
                // Add click event listener for deleting the notification
                deleteButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                        deleteNotification(ngoId,index);
                    });
                });
            });

            // Display the modal
            modal.style.display = "block";
        } else {
            console.error("NGO not found.");
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
function respondToNotification(ngoId, notification, index) {
    // Implement your logic to respond to the notification here
    console.log("Responding to notification at index", index);
        // Assuming 'respond-notifications' is not an array, initialize it as an empty array
    const respondNotifications = [];

    // Push the new notification to the array
    respondNotifications.push(notification);

    // Update the Firestore document with the 'respond-notifications' array
    const db = getFirestore();
    const ngoRef1 = doc(db, "NGO", ngoId);

    updateDoc(ngoRef1, {
        "respondNotifications": respondNotifications
    })
        .then(() => {
            console.log("Notification responded and updated successfully.");
            alert("Congragulations! you can make someone smile, contact them soon");
            deleteNotification(ngoId,index);
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
async function deleteNotification(ngoId, index) {
    try {
        // Fetch the current 'notifications' array from Firestore
        const ngoRef = doc(colRef, ngoId);
        const ngoDoc = await getDoc(ngoRef);
        console.log(index);
        if (ngoDoc.exists()) {
            const ngoData = ngoDoc.data();
            const notifications = ngoData.notifications || [];

            // Ensure the index is within valid bounds
            if (index >= 0 && index < notifications.length) {
                // Remove the notification at the specified index
                notifications.splice(index, 1);

                // Update the 'notifications' field in Firestore with the modified array
                await updateDoc(ngoRef, { notifications });
                alert("Cool then! please be available to support us next time");
                console.log("Notification deleted successfully.");
            } else {
                console.error("Invalid index for deletion.");
            }
        } else {
            console.error("NGO not found.");
        }
    } catch (error) {
        console.error("Error deleting notification:", error);
    }
}
