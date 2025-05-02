// Import Firebase authentication
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA35mvixmpvziRmtHY5g14u-RWDgK0FUFw",
  authDomain: "doc-tor-sab.firebaseapp.com",
  projectId: "doc-tor-sab",
  storageBucket: "doc-tor-sab.firebasestorage.app",
  messagingSenderId: "740063020505",
  appId: "1:740063020505:web:bd949c8abbf3b52c2905c8",
  measurementId: "G-S1PTGJQETL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const authModal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleLoginBtn = document.getElementById('googleLogin');
const googleSignupBtn = document.getElementById('googleSignup');
const phoneLoginBtn = document.getElementById('phoneLogin');
const phoneSignupBtn = document.getElementById('phoneSignup');
const phoneVerificationContainer = document.getElementById('phoneVerificationContainer');
const phoneForm = document.getElementById('phoneForm');
const verifyCodeForm = document.getElementById('verifyCodeForm');

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize other features
  initScrollReveal();
  initSmoothScroll();
  initCustomCursor();
  
  // Add event listeners for authentication
  loginBtn?.addEventListener('click', openAuthModal);
  getStartedBtn?.addEventListener('click', openAuthModal);
  closeBtn?.addEventListener('click', closeAuthModal);
  tabBtns.forEach(btn => btn.addEventListener('click', switchTab));
  loginForm?.addEventListener('submit', handleLogin);
  signupForm?.addEventListener('submit', handleSignup);
  googleLoginBtn?.addEventListener('click', signInWithGoogle);
  googleSignupBtn?.addEventListener('click', signInWithGoogle);
  phoneLoginBtn?.addEventListener('click', showPhoneAuth);
  phoneSignupBtn?.addEventListener('click', showPhoneAuth);
  phoneForm?.addEventListener('submit', handlePhoneAuth);
  verifyCodeForm?.addEventListener('submit', verifyPhoneAuthCode);
  
  // Close modal when clicking outside
  window.onclick = function(e) {
    if (e.target === authModal) {
      closeAuthModal();
    }
  };
  
  // Fix for stat element HTML issue
  const statElements = document.querySelectorAll('.stat-number');
  if (statElements.length > 0) {
    // Check for the broken element and fix it
    const brokenElement = document.querySelector('.stat-number + div.stat-label');
    if (brokenElement && brokenElement.previousElementSibling.textContent.includes('100+')) {
      brokenElement.previousElementSibling.innerHTML = '100+';
    }
  }
});

function initCustomCursor() {
  // Check if we're on a touch device, if so, don't show custom cursor
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }
  
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if (!cursor || !cursorFollower) return;
  
  // Hide default cursor on the entire document
  document.body.style.cursor = 'none';
  
  // Main cursor movement
  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(function() {
      cursorFollower.style.left = e.clientX + 'px';
      cursorFollower.style.top = e.clientY + 'px';
    }, 80);
  });
  
  // Add hover effects for links and buttons
  const hoverElements = document.querySelectorAll('a, button, .btn-primary, .btn-secondary, .btn-google, .card, .close, .tab-btn');
  
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      cursor.classList.add('cursor-active');
      cursorFollower.classList.add('cursor-active');
      element.style.cursor = 'none'; // Ensure default cursor doesn't show
    });
    
    element.addEventListener('mouseleave', function() {
      cursor.classList.remove('cursor-active');
      cursorFollower.classList.remove('cursor-active');
    });
  });
  
  // Handle cursor disappearing when leaving window
  document.addEventListener('mouseout', function(e) {
    if (e.relatedTarget === null) {
      cursor.style.display = 'none';
      cursorFollower.style.display = 'none';
    }
  });
  
  document.addEventListener('mouseover', function(e) {
    cursor.style.display = 'block';
    cursorFollower.style.display = 'block';
  });
  
  // Handle cursor disappearing during click
  document.addEventListener('mousedown', function() {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });
  
  document.addEventListener('mouseup', function() {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}

// Scroll reveal animation
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.hero-content, .card, .about-content, .testimonial-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  revealElements.forEach(element => {
    // Add initial style
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.6s ease-out';
    
    // Observe element
    observer.observe(element);
  });
  
  // Style for revealed elements
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    </style>
  `);
}

// Open authentication modal
function openAuthModal() {
  authModal.classList.add('active');
}

// Close authentication modal
function closeAuthModal() {
  authModal.classList.remove('active');
}

// Switch between tabs
function switchTab(e) {
  const tabId = e.target.dataset.tab;
  
  // Remove active class from all tabs
  tabBtns.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Add active class to selected tab
  e.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Email login
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Show loading indicator on button
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  submitBtn.disabled = true;
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      // Show error message with animation
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      showErrorMessage(loginForm, error.message);
    });
}

// Email signup
function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  
  // Show loading indicator on button
  const submitBtn = signupForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
  submitBtn.disabled = true;
  
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Account created
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      // Show error message with animation
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      showErrorMessage(signupForm, error.message);
    });
}

// Show error message
function showErrorMessage(form, message) {
  // Remove existing error message if any
  const existingError = form.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Create and insert error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  
  // Add styles
  errorDiv.style.backgroundColor = '#ffebee';
  errorDiv.style.color = '#c62828';
  errorDiv.style.padding = '10px 15px';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.marginTop = '15px';
  errorDiv.style.fontSize = '0.9rem';
  errorDiv.style.animation = 'fadeIn 0.3s';
  
  // Insert error message
  form.appendChild(errorDiv);
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => {
      errorDiv.remove();
    }, 300);
  }, 5000);
}

// Google authentication
function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // Google sign in successful
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(`Google login error: ${error.message}`);
    });
}

// Show phone authentication UI
function showPhoneAuth() {
  // Hide login and signup forms
  document.getElementById('login').classList.remove('active');
  document.getElementById('signup').classList.remove('active');
  
  // Show phone authentication container
  phoneVerificationContainer.classList.add('active');
  
  // Ensure the tab buttons are updated to reflect the active tab
  tabBtns.forEach(btn => btn.classList.remove('active'));
  // We don't have a dedicated tab for phone, so we'll keep this UI separate
}

// Handle phone authentication request
function handlePhoneAuth(e) {
  e.preventDefault();
  
  const phoneNumber = document.getElementById('phoneNumber').value;
  const submitBtn = phoneForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending code...';
  submitBtn.disabled = true;
  
  // Initialize reCAPTCHA verifier if not already initialized
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': (response) => {
        // reCAPTCHA solved, allow phone auth
        phoneForm.querySelector('button[type="submit"]').disabled = false;
      },
      'expired-callback': () => {
        // Reset reCAPTCHA
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        alert('reCAPTCHA has expired. Please solve it again.');
      }
    });
  }
  
  // Format phone number to E.164 format if not already formatted
  let formattedPhoneNumber = phoneNumber;
  if (!phoneNumber.startsWith('+')) {
    formattedPhoneNumber = `+${phoneNumber}`;
  }
  
  // Send verification code
  signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      // SMS sent. Save confirmation result to verify code later
      window.confirmationResult = confirmationResult;
      
      // Show verification code input form
      phoneForm.style.display = 'none';
      verifyCodeForm.style.display = 'block';
      
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    })
    .catch((error) => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      showErrorMessage(phoneForm, error.message);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    });
}

// Verify the SMS code and complete authentication
function verifyPhoneAuthCode(e) {
  e.preventDefault();
  
  const verificationCode = document.getElementById('verificationCode').value;
  const submitBtn = verifyCodeForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
  submitBtn.disabled = true;
  
  if (!window.confirmationResult) {
    showErrorMessage(verifyCodeForm, 'Verification session expired. Please try again.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    return;
  }
  
  window.confirmationResult.confirm(verificationCode)
    .then((result) => {
      // User signed in successfully
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      showErrorMessage(verifyCodeForm, error.message);
    });
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Account for fixed header
          behavior: 'smooth'
        });
      }
    });
  });
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, redirect to dashboard
    window.location.href = "dashboard.html";
  }
});