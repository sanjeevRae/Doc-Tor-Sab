import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";




const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Google sign-in with user role
function signInWithGoogle(userRole) {
  return signInWithPopup(auth, provider).then(result => {
    // Save user data to Firestore with role
    const user = result.user;
    return saveUserToFirestore(user, userRole);
  });
}

// Email/Password sign-up with user role
function signUpWithEmail(email, password, fullName, userRole) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      // Add display name and role to the user data
      return saveUserToFirestore({
        ...user,
        displayName: fullName
      }, userRole);
    });
}

// Email/Password sign-in
function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is signed in:", user.displayName);
    
    // If on dashboard page, load user data
    if (window.location.href.includes("dashboard.html")) {
      try {
        const userData = await getUserData(user.uid);
        // Store user data in sessionStorage for easy access across the app
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Initialize dashboard with user data if the function exists
        if (typeof initializeDashboard === 'function') {
          initializeDashboard(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  } else {
    console.log("User is signed out");
    // Redirect to login if needed
    if (!window.location.href.includes("index.html")) {
      window.location.href = "index.html";
    }
  }
});

// Get user data from Firestore
async function getUserData(uid) {
  try {
    const userQuery = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return {
        ...userData,
        docId: querySnapshot.docs[0].id // Include Firestore document ID
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

// Save user to Firestore
async function saveUserToFirestore(user, userRole = 'patient') {
  try {
    // Check if user already exists
    const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(userQuery);
    
    const userData = {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email,
      photoURL: user.photoURL || '',
      userRole: userRole,
      lastLogin: new Date()
    };
    
    if (querySnapshot.empty) {
      // User doesn't exist, create new record
      userData.createdAt = new Date();
      
      // Add specific fields based on role
      if (userRole === 'doctor') {
        userData.specialization = '';
        userData.experience = '';
        userData.licenseNumber = '';
        userData.availability = [];
        userData.ratings = [];
        userData.verified = false;
      } else {
        userData.medicalHistory = [];
        userData.allergies = [];
        userData.medications = [];
        userData.appointments = [];
      }
      
      await addDoc(collection(db, "users"), userData);
      console.log(`New ${userRole} added to Firestore`);
    } else {
      // User exists, update last login
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        lastLogin: new Date()
      });
      console.log("User login time updated");
    }
    
    return userData;
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    throw error;
  }
}

// Sign out user
function signOutUser() {
  return auth.signOut().then(() => {
    // Clear session storage
    sessionStorage.removeItem('currentUser');
    // Redirect to home page
    window.location.href = "index.html";
  });
}

// Export Firebase services and authentication functions
export { 
  db, 
  auth, 
  app, 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail, 
  getUserData, 
  signOutUser 
};
