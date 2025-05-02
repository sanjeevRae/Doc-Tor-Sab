import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA35mvixmpvziRmtHY5g14u-RWDgK0FUFw",
  authDomain: "doc-tor-sab.firebaseapp.com",
  projectId: "doc-tor-sab",
  storageBucket: "doc-tor-sab.firebasestorage.app",
  messagingSenderId: "740063020505",
  appId: "1:740063020505:web:bd949c8abbf3b52c2905c8",
  measurementId: "G-S1PTGJQETL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// User authentication function
document.getElementById("googleLogin").onclick = () => {
  signInWithPopup(auth, provider).then(result => {
    // Save user data to Firestore
    const user = result.user;
    saveUserToFirestore(user);
    window.location.href = "dashboard.html";
  });
};

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.displayName);
  } else {
    console.log("User is signed out");
    // Redirect to login if needed
    if (!window.location.href.includes("index.html")) {
      window.location.href = "index.html";
    }
  }
});

// Save user to Firestore
async function saveUserToFirestore(user) {
  try {
    // Check if user already exists
    const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      // User doesn't exist, create new record
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      console.log("New user added to Firestore");
    } else {
      // User exists, update last login
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        lastLogin: new Date()
      });
      console.log("User login time updated");
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
}

// Export Firebase services for use in other files
export { db, auth, app };
