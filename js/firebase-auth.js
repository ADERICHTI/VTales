import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const authModal = document.getElementById('auth-modal');
const googleSignInBtn = document.getElementById('google-signin-btn');
const closeAuthModal = document.querySelector('.close-auth-modal');
const userWidget = document.getElementById('user-widget');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const signOutBtn = document.getElementById('sign-out-btn');

// Auth state management
let collapseTimeout;
let isDragging = false;
let startX, startY, initialX, initialY;

// Initialize auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    setupUserWidget(user);
    hideAuthModal();
    
    // Show welcome animation
    userWidget.style.transform = 'scale(0)';
    setTimeout(() => {
      userWidget.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.4)';
      userWidget.style.transform = 'scale(1)';
    }, 100);
    
  } else {
    // User is signed out
    userWidget.style.display = 'none';
    showAuthModalAfterDelay();
  }
});

// Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    hideAuthModal();
  } catch (error) {
    console.error('Authentication error:', error);
    alert('Sign in failed. Please try again.');
  }
});

// Sign Out
signOutBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
});

// Close modal
closeAuthModal.addEventListener('click', hideAuthModal);

// Modal background click
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) hideAuthModal();
});

// User Widget Interactions
userWidget.addEventListener('click', toggleUserWidget);
setupDragBehavior();

// Functions
function setupUserWidget(user) {
  userAvatar.src = user.photoURL || 'https://i.imgur.com/6VBx3io.png';
  userName.textContent = user.displayName || 'User';
  userWidget.style.display = 'block';
}

function toggleUserWidget() {
  if (isDragging) return;
  
  userWidget.classList.toggle('expanded');
  clearTimeout(collapseTimeout);
  
  if (userWidget.classList.contains('expanded')) {
    collapseTimeout = setTimeout(() => {
      userWidget.classList.remove('expanded');
    }, 5000);
  }
}

function setupDragBehavior() {
  userWidget.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', dragWidget);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', dragWidget, { passive: false });
  document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  if (e.target.closest('.sign-out-btn')) return;
  
  isDragging = true;
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  const rect = userWidget.getBoundingClientRect();
  startX = clientX;
  startY = clientY;
  initialX = rect.left;
  initialY = rect.top;
  
  userWidget.style.transition = 'none';
  document.body.style.userSelect = 'none';
}

function dragWidget(e) {
  if (!isDragging) return;
  e.preventDefault();
  
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  const dx = clientX - startX;
  const dy = clientY - startY;
  
  userWidget.style.left = `${initialX + dx}px`;
  userWidget.style.top = `${initialY + dy}px`;
}

function endDrag() {
  if (!isDragging) return;
  
  isDragging = false;
  userWidget.style.transition = 'left 0.2s ease, top 0.2s ease';
  document.body.style.userSelect = '';
  
  // Snap to edges if near
  const rect = userWidget.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  if (rect.left < windowWidth / 2) {
    userWidget.style.left = '25px';
  } else {
    userWidget.style.left = 'calc(100% - 75px)';
  }
  
  if (rect.top < 25) {
    userWidget.style.top = '25px';
  } else if (rect.bottom > windowHeight - 25) {
    userWidget.style.top = 'calc(100% - 75px)';
  }
}

function showAuthModal() {
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
}

function showAuthModalAfterDelay() {
  setTimeout(() => {
    if (!auth.currentUser) {
      showAuthModal();
    }
  }, 3000);
}

// Make auth available globally if needed
window.firebaseAuth = { auth };});

// Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    hideAuthModal();
  } catch (error) {
    console.error('Authentication error:', error);
    alert('Sign in failed. Please try again.');
  }
});

// Sign Out
signOutBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
});

// Close modal
closeAuthModal.addEventListener('click', hideAuthModal);

// Modal background click
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) hideAuthModal();
});

// User Widget Interactions
userWidget.addEventListener('click', toggleUserWidget);
setupDragBehavior();

// Functions
function setupUserWidget(user) {
  userAvatar.src = user.photoURL || 'https://i.imgur.com/6VBx3io.png';
  userName.textContent = user.displayName || 'User';
  userWidget.style.display = 'block';
}

function toggleUserWidget() {
  if (isDragging) return;
  
  userWidget.classList.toggle('expanded');
  clearTimeout(collapseTimeout);
  
  if (userWidget.classList.contains('expanded')) {
    collapseTimeout = setTimeout(() => {
      userWidget.classList.remove('expanded');
    }, 5000);
  }
}

function setupDragBehavior() {
  userWidget.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', dragWidget);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', dragWidget, { passive: false });
  document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  if (e.target.closest('.sign-out-btn')) return;
  
  isDragging = true;
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  const rect = userWidget.getBoundingClientRect();
  startX = clientX;
  startY = clientY;
  initialX = rect.left;
  initialY = rect.top;
  
  userWidget.style.transition = 'none';
  document.body.style.userSelect = 'none';
}

function dragWidget(e) {
  if (!isDragging) return;
  e.preventDefault();
  
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  const dx = clientX - startX;
  const dy = clientY - startY;
  
  userWidget.style.left = `${initialX + dx}px`;
  userWidget.style.top = `${initialY + dy}px`;
}

function endDrag() {
  if (!isDragging) return;
  
  isDragging = false;
  userWidget.style.transition = 'left 0.2s ease, top 0.2s ease';
  document.body.style.userSelect = '';
  
  // Snap to edges if near
  const rect = userWidget.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  if (rect.left < windowWidth / 2) {
    userWidget.style.left = '25px';
  } else {
    userWidget.style.left = 'calc(100% - 75px)';
  }
  
  if (rect.top < 25) {
    userWidget.style.top = '25px';
  } else if (rect.bottom > windowHeight - 25) {
    userWidget.style.top = 'calc(100% - 75px)';
  }
}

function showAuthModal() {
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
}

function showAuthModalAfterDelay() {
  setTimeout(() => {
    if (!auth.currentUser) {
      showAuthModal();
    }
  }, 3000);
}

// Make auth available globally if needed
window.firebaseAuth = { auth };
