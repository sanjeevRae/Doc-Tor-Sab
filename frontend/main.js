// Import Firebase authentication components from our firebase-auth.js module
import { 
  auth, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  getUserData 
} from "./firebase-auth.js";

// Initialize EmailJS
(function() {
  emailjs.init("C-c_ieBFgoEKweILO");
})();

// DOM Elements - initialize later to ensure DOM is loaded
let loginBtn;
let signupBtn;
let getStartedBtn;
let authModal;
let closeBtn;
let authTabs;
let authForms;
let loginForm;
let signupForm;
let googleLoginBtn;
let googleSignupBtn;
let roleDoctor;
let rolePatient;
let doctorFields;
let loginMessage;
let signupMessage;
let passwordStrength;

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM elements
  loginBtn = document.getElementById('loginBtn');
  signupBtn = document.getElementById('signupBtn');
  getStartedBtn = document.getElementById('getStartedBtn');
  authModal = document.getElementById('authModal');
  closeBtn = document.querySelector('.close-btn');
  authTabs = document.querySelectorAll('.auth-tab');
  authForms = document.querySelectorAll('.auth-form');
  loginForm = document.getElementById('loginForm');
  signupForm = document.getElementById('signupForm');
  googleLoginBtn = document.getElementById('googleLogin');
  googleSignupBtn = document.getElementById('googleSignup');
  roleDoctor = document.getElementById('roleDoctor');
  rolePatient = document.getElementById('rolePatient');
  doctorFields = document.querySelector('.doctor-fields');
  loginMessage = document.getElementById('loginMessage');
  signupMessage = document.getElementById('signupMessage');
  passwordStrength = document.getElementById('passwordStrength');

  console.log("DOM elements initialized:", { 
    loginBtn, signupBtn, authModal, loginForm, signupForm 
  });
  
  // Initialize other features
  initScrollReveal();
  initSmoothScroll();
  initCustomCursor();
  
  // Add event listeners for authentication
  if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
  if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal('signup'));
  if (getStartedBtn) getStartedBtn.addEventListener('click', () => openAuthModal('signup'));
  if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);
  
  authTabs.forEach(tab => {
    tab.addEventListener('click', switchTab);
  });
  
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  
  // Google authentication
  if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleGoogleAuth('login'));
  if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => handleGoogleAuth('signup'));
  
  // Role selection toggle for doctor-specific fields
  if (roleDoctor) roleDoctor.addEventListener('change', toggleDoctorFields);
  if (rolePatient) rolePatient.addEventListener('change', toggleDoctorFields);
  
  // Password strength meter
  const passwordInput = document.getElementById('signupPassword');
  if (passwordInput) passwordInput.addEventListener('input', updatePasswordStrength);
  
  // Close modal when clicking outside
  window.onclick = function(e) {
    if (e.target === authModal) {
      closeAuthModal();
    }
  };
  
  console.log("All event listeners attached");
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

// Debounce function to limit how often a function is called
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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

// Auth Modal Functions
function openAuthModal(tab = 'login') {
  authModal.style.display = 'block';
  // Activate the correct tab
  authTabs.forEach(t => t.classList.remove('active'));
  authForms.forEach(f => f.classList.remove('active'));
  
  const activeTab = Array.from(authTabs).find(t => t.dataset.form === tab);
  const activeForm = document.getElementById(`${tab}Form`);
  
  if (activeTab) activeTab.classList.add('active');
  if (activeForm) activeForm.classList.add('active');
  
  // Clear any previous messages
  loginMessage.textContent = '';
  signupMessage.textContent = '';
}

function closeAuthModal() {
  authModal.style.display = 'none';
  // Reset forms
  loginForm.reset();
  signupForm.reset();
  // Hide error messages
  loginMessage.textContent = '';
  signupMessage.textContent = '';
}

function switchTab(event) {
  const tab = event.target.dataset.form;
  
  // Switch active tab styling
  authTabs.forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  // Switch visible form
  authForms.forEach(f => f.classList.remove('active'));
  document.getElementById(`${tab}Form`).classList.add('active');
  
  // Clear messages
  loginMessage.textContent = '';
  signupMessage.textContent = '';
}

// Email login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    loginMessage.textContent = 'Logging in...';
    loginMessage.style.color = '#007bff';
    
    // Sign in with email/password
    const userCredential = await signInWithEmail(email, password);
    
    // Get user data including role
    const userData = await getUserData(userCredential.user.uid);
    
    // Store user data in session storage
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Login error:', error);
    loginMessage.textContent = getAuthErrorMessage(error);
    loginMessage.style.color = '#dc3545';
  }
}

// Email signup
async function handleSignup(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const userRole = document.querySelector('input[name="userRole"]:checked').value;
  const termsAgreed = document.getElementById('termsAgreement').checked;
  
  // Basic validation
  if (password !== confirmPassword) {
    signupMessage.textContent = 'Passwords do not match';
    signupMessage.style.color = '#dc3545';
    return;
  }
  
  if (!termsAgreed) {
    signupMessage.textContent = 'You must agree to the Terms of Service and Privacy Policy';
    signupMessage.style.color = '#dc3545';
    return;
  }
  
  // Collect additional doctor fields if applicable
  const doctorData = {};
  if (userRole === 'doctor') {
    doctorData.specialization = document.getElementById('specialization').value;
    doctorData.licenseNumber = document.getElementById('licenseNumber').value;
    
    // Validate doctor fields
    if (!doctorData.specialization || !doctorData.licenseNumber) {
      signupMessage.textContent = 'Please fill out all doctor-specific fields';
      signupMessage.style.color = '#dc3545';
      return;
    }
  }
  
  try {
    signupMessage.textContent = 'Creating your account...';
    signupMessage.style.color = '#007bff';
    
    // Create user with email/password and save role to Firestore
    const userData = await signUpWithEmail(email, password, fullName, userRole);
    
    // Store user data in session storage with role
    sessionStorage.setItem('currentUser', JSON.stringify({
      ...userData,
      ...doctorData
    }));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Signup error:', error);
    signupMessage.textContent = getAuthErrorMessage(error);
    signupMessage.style.color = '#dc3545';
  }
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
async function handleGoogleAuth(action) {
  // For signup with Google, check the selected role
  let userRole = 'patient'; // Default
  
  if (action === 'signup') {
    userRole = document.querySelector('input[name="userRole"]:checked')?.value || 'patient';
  }
  
  try {
    const messageEl = action === 'login' ? loginMessage : signupMessage;
    messageEl.textContent = 'Authenticating with Google...';
    messageEl.style.color = '#007bff';
    
    // Sign in with Google, passing the user role for signup
    const userData = await signInWithGoogle(userRole);
    
    // Store user data in session storage
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Google auth error:', error);
    const messageEl = action === 'login' ? loginMessage : signupMessage;
    messageEl.textContent = getAuthErrorMessage(error);
    messageEl.style.color = '#dc3545';
  }
}

// Helper Functions
function toggleDoctorFields() {
  if (roleDoctor?.checked) {
    doctorFields.style.display = 'block';
  } else {
    doctorFields.style.display = 'none';
  }
}

function updatePasswordStrength(e) {
  const password = e.target.value;
  
  // Simple password strength calculation
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.match(/[A-Z]/)) strength += 1;
  if (password.match(/[a-z]/)) strength += 1;
  if (password.match(/[0-9]/)) strength += 1;
  if (password.match(/[^A-Za-z0-9]/)) strength += 1;
  
  // Update UI
  let strengthText = '';
  let color = '';
  
  switch(strength) {
    case 0:
    case 1:
      strengthText = 'Weak';
      color = '#dc3545';
      break;
    case 2:
    case 3:
      strengthText = 'Medium';
      color = '#ffc107';
      break;
    case 4:
    case 5:
      strengthText = 'Strong';
      color = '#28a745';
      break;
  }
  
  passwordStrength.textContent = password ? strengthText : '';
  passwordStrength.style.color = color;
}

function getAuthErrorMessage(error) {
  switch(error.code) {
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email format';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later';
    default:
      return 'An error occurred. Please try again';
  }
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

