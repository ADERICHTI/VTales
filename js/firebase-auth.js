import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyC1iB1X-qqbfB9hwHnZ8SyLWn_i1SU29iI",
  authDomain: "vedatabase25.firebaseapp.com",
  projectId: "vedatabase25",
  storageBucket: "vedatabase25.firebasestorage.app",
  messagingSenderId: "881280967764",
  appId: "1:881280967764:web:3d95014979063c5320b9c1",
  measurementId: "G-HXJ95TQGVQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
window.app = app;
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Global variables
window.currentUser = null;
window.currentStoryId = null;

// DOM Elements
const authModal = document.getElementById('auth-modal');
const googleSignInBtn = document.getElementById('google-signin-btn');
const userWidget = document.getElementById('user-widget');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const signOutBtn = document.getElementById('sign-out-btn');
const profileCircle = document.querySelector('.profile-circle');

async function setUser(userid, userData) {
  try {
    await setDoc(doc(db, "users", userid), userData);
} catch (error) {
  console.log("Error setting Document: ", error);
}
}

// Auth State Management
onAuthStateChanged(auth, (user) => {
  window.currentUser = user;
  if (user) {
    // User signed in
    setupUserProfile(user);
    hideAuthModal();
    setUser(user.email, {
      username: user.displayName,
      userEmail: user.email,
      signInAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
  } else {
    // User signed out
    hideUserProfile();
    showAuthModal();
  }
});

// Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Sign in error:", error);
  }
});

// Sign Out
signOutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
  }
});

// Profile Widget Interactions
let expandTimeout;

profileCircle.addEventListener('click', () => {
  userWidget.classList.add('expanded');
  clearTimeout(expandTimeout);
  
  expandTimeout = setTimeout(() => {
    userWidget.classList.remove('expanded');
  }, 5000);
});

// Close when clicking outside
document.addEventListener('click', (e) => {
  if (!userWidget.contains(e.target) && e.target !== profileCircle) {
    userWidget.classList.remove('expanded');
  }
});

// Functions
function setupUserProfile(user) {
  userAvatar.src = user.photoURL || 'https://raw.githubusercontent.com/ADERICHTI/Images001/refs/heads/main/images.png';
  userName.textContent = user.displayName || 'User';
  userWidget.style.display = 'block';
}

function hideUserProfile() {
  userWidget.style.display = 'none';
}

function showAuthModal() {
  setTimeout(() => {
    if (!auth.currentUser) {
      authModal.classList.add('active');
    }
  }, 2000);
}

function hideAuthModal() {
  authModal.classList.remove('active');
  }
