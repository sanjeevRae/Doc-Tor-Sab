// Import Firebase auth
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import API from './api-service.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// DOM Elements
const navLinks = document.querySelectorAll('.sidebar-nav a');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const actionButtons = document.querySelectorAll('.action-btn');
const logoutBtn = document.getElementById('logoutBtn');
const conditionCards = document.querySelectorAll('.condition-card');
const categoryTabs = document.querySelectorAll('.category-tabs .tab-btn');

// Set user information
function setUserInfo() {
  const user = auth.currentUser;
  // Try to get additional user data from session storage
  const userDataString = sessionStorage.getItem('currentUser');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  
  if (user) {
    // Set user name in the header and profile
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('profileName').textContent = user.displayName || 'User';
    document.getElementById('profileEmail').textContent = user.email;
    
    // Set profile form values if available
    if (user.displayName) {
      document.getElementById('fullName').value = user.displayName;
    }
    
    // If we have additional user data from Firestore
    if (userData) {
      console.log("Loaded user data from session storage:", userData);
      
      // Display role-specific UI
      if (userData.userRole === 'doctor') {
        document.body.classList.add('doctor-dashboard');
        // Show doctor-specific elements
        const doctorElements = document.querySelectorAll('.doctor-only');
        doctorElements.forEach(el => el.style.display = 'block');
        
        // Hide patient-specific elements
        const patientElements = document.querySelectorAll('.patient-only');
        patientElements.forEach(el => el.style.display = 'none');
        
        // Set doctor-specific data
        if (userData.specialization) {
          document.getElementById('specialization').textContent = userData.specialization;
        }
      } else {
        document.body.classList.add('patient-dashboard');
        // Show patient-specific elements
        const patientElements = document.querySelectorAll('.patient-only');
        patientElements.forEach(el => el.style.display = 'block');
        
        // Hide doctor-specific elements
        const doctorElements = document.querySelectorAll('.doctor-only');
        doctorElements.forEach(el => el.style.display = 'none');
      }
    }
  } else {
    // Redirect to login if not logged in
    window.location.href = "index.html";
  }
}

// Navigation
function activateSection(sectionId) {
  // Hide all sections
  dashboardSections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active class from nav links
  navLinks.forEach(link => {
    link.parentElement.classList.remove('active');
  });
  
  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    
    // Add active class to the corresponding nav link
    const activeNavLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
    if (activeNavLink) {
      activeNavLink.parentElement.classList.add('active');
    }
  }
}

// Handle navigation clicks
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute('href').substring(1);
    activateSection(sectionId);
  });
});

// Handle quick action buttons
actionButtons.forEach(button => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.section;
    activateSection(sectionId);
  });
});

// Handle first aid condition cards
conditionCards.forEach(card => {
  card.addEventListener('click', () => {
    const condition = card.dataset.condition;
    const firstAidContent = document.getElementById('firstAidContent');
    
    // Fetch first aid content based on the condition
    // This would typically be an API call to your backend
    fetchFirstAidContent(condition)
      .then(content => {
        firstAidContent.innerHTML = content;
      })
      .catch(error => {
        firstAidContent.innerHTML = `<p>Error loading first aid information: ${error.message}</p>`;
      });
  });
});

// Handle doctor category tabs
categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs
    categoryTabs.forEach(t => t.classList.remove('active'));
    
    // Add active class to clicked tab
    tab.classList.add('active');
    
    // Get the category to filter doctors
    const category = tab.dataset.category;
    
    // Here you would typically fetch doctors based on the category
    // For demonstration, we'll just log the category
    console.log("Selected doctor category:", category);
    
    // In a real app, you would update the doctors list here
    // fetchDoctorsByCategory(category);
  });
});

// Dummy function to simulate fetching first aid content
function fetchFirstAidContent(condition) {
  return new Promise((resolve) => {
    // Simulated delay to mimic an API call
    setTimeout(() => {
      // Dummy content for demonstration
      const contentMap = {
        'burns': `
          <h3>First Aid for Burns</h3>
          <ol>
            <li>Remove the cause of the burn</li>
            <li>Cool the burn with cool (not cold) running water for 10-15 minutes</li>
            <li>Remove rings or other tight items</li>
            <li>Don't break blisters</li>
            <li>Apply lotion</li>
            <li>Bandage the burn</li>
            <li>Take an over-the-counter pain reliever</li>
            <li>Seek medical attention for severe burns</li>
          </ol>
        `,
        'cuts': `
          <h3>First Aid for Cuts and Wounds</h3>
          <ol>
            <li>Stop the bleeding by applying pressure</li>
            <li>Clean the wound with water and gentle soap</li>
            <li>Apply an antibiotic cream</li>
            <li>Cover the wound with a sterile bandage</li>
            <li>Change the dressing regularly</li>
            <li>Watch for signs of infection</li>
            <li>Seek medical attention for deep or heavily bleeding wounds</li>
          </ol>
        `,
        'choking': `
          <h3>First Aid for Choking</h3>
          <ol>
            <li>Encourage the person to cough</li>
            <li>If they can't cough, breathe, or speak, stand behind them</li>
            <li>Place your fist just above their belly button</li>
            <li>Grab your fist with your other hand</li>
            <li>Pull inward and upward with quick thrusts</li>
            <li>Repeat until the object is dislodged or medical help arrives</li>
            <li>If the person becomes unconscious, start CPR if you're trained</li>
          </ol>
        `,
        'heart-attack': `
          <h3>First Aid for Heart Attack</h3>
          <ol>
            <li>Call emergency services immediately (911)</li>
            <li>Have the person sit down and rest</li>
            <li>Loosen any tight clothing</li>
            <li>If the person is not allergic to aspirin, have them chew and swallow an aspirin</li>
            <li>If the person is unconscious, begin CPR if you're trained</li>
            <li>If an AED is available, use it following the device instructions</li>
          </ol>
        `,
        'fracture': `
          <h3>First Aid for Fractures</h3>
          <ol>
            <li>Keep the injured area immobile</li>
            <li>Apply ice wrapped in a towel to reduce swelling</li>
            <li>If possible, elevate the injured area</li>
            <li>For open fractures, cover the wound with a clean bandage</li>
            <li>Don't attempt to realign the bone</li>
            <li>Seek medical attention immediately</li>
          </ol>
        `,
        'poisoning': `
          <h3>First Aid for Poisoning</h3>
          <ol>
            <li>Call poison control center immediately (1-800-222-1222 in the US)</li>
            <li>Remove the person from the source of poison if inhalation</li>
            <li>If poison is on the skin, rinse with running water for 15-20 minutes</li>
            <li>If poison is in the eye, rinse with lukewarm water for 15-20 minutes</li>
            <li>Do NOT induce vomiting unless instructed by medical professionals</li>
            <li>If the person is unconscious, turn them on their side and call emergency services</li>
          </ol>
        `
      };
      
      resolve(contentMap[condition] || '<p>No information available for this condition.</p>');
    }, 500);
  });
}

// Handle doctor consultation booking
const consultBtns = document.querySelectorAll('.consult-btn');
consultBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const doctorCard = e.target.closest('.doctor-card');
    const doctorName = doctorCard.querySelector('h4').textContent;
    
    // Show consultation room (in a real app, would initialize WebRTC here)
    const consultRoom = document.getElementById('consultRoom');
    consultRoom.style.display = 'block';
    consultRoom.innerHTML = `
      <div class="consultation-header">
        <h3>Consultation with ${doctorName}</h3>
        <button id="endCall" class="btn-danger"><i class="fas fa-phone-slash"></i> End Call</button>
      </div>
      <div class="video-container">
        <div class="video-wrapper">
          <video id="remoteVideo" autoplay playsinline></video>
          <div class="loading-indicator">
            <p>Connecting to doctor...</p>
            <div class="spinner"></div>
          </div>
        </div>
        <video id="localVideo" autoplay playsinline muted></video>
      </div>
      <div class="call-controls">
        <button id="muteBtn"><i class="fas fa-microphone"></i></button>
        <button id="videoBtn"><i class="fas fa-video"></i></button>
        <button id="chatBtn"><i class="fas fa-comment-dots"></i></button>
      </div>
    `;
    
    // Add styles for consultation room
    const style = document.createElement('style');
    style.textContent = `
      .consultation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #1a2942;
        color: white;
      }
      
      .btn-danger {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .video-container {
        display: flex;
        height: 400px;
      }
      
      .video-wrapper {
        position: relative;
        flex: 3;
        background-color: #222;
      }
      
      #remoteVideo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      #localVideo {
        flex: 1;
        object-fit: cover;
        background-color: #333;
      }
      
      .loading-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        margin: 10px auto;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .call-controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        background-color: #1a2942;
      }
      
      .call-controls button {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .call-controls button:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
    
    // Add end call functionality
    document.getElementById('endCall').addEventListener('click', () => {
      consultRoom.style.display = 'none';
    });
    
    // In a real app, you would implement WebRTC connections here
    console.log(`Booking consultation with ${doctorName}`);
  });
});

// Handle logout
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    // Sign-out successful, redirect to login page
    window.location.href = "index.html";
  }).catch((error) => {
    // An error happened
    console.error("Logout error:", error);
  });
});

// Check if user is logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    setUserInfo();
  } else {
    // User is signed out, redirect to login
    window.location.href = "index.html";
  }
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Check the hash in the URL to activate the corresponding section
  let sectionId = window.location.hash.substring(1) || 'home';
  activateSection(sectionId);

  // Initialize custom cursor
  initCustomCursor();
  
  // Set current date
  updateCurrentDate();

  // Initialize navigation
  initNavigation();
  
  // Load initial data for dashboard
  loadDashboardData();
  
  // Initialize symptom checker 
  initSymptomChecker();
  
  // Initialize first aid section
  initFirstAidSection();
  
  // Initialize doctor consultation tabs
  initConsultationTabs();
});

// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  initNavigation();
  
  // Load initial data for dashboard
  loadDashboardData();
  
  // Initialize symptom checker 
  initSymptomChecker();
  
  // Initialize first aid section
  initFirstAidSection();
  
  // Initialize doctor consultation tabs
  initConsultationTabs();
});

// Dashboard navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  const sections = document.querySelectorAll('.dashboard-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(link => {
        link.parentElement.classList.remove('active');
      });
      
      sections.forEach(section => {
        section.classList.remove('active');
      });
      
      // Add active class to clicked link
      this.parentElement.classList.add('active');
      
      // Show corresponding section
      const sectionId = this.getAttribute('href').substring(1);
      document.getElementById(sectionId).classList.add('active');
    });
  });
  
  // Set default active section
  if (navLinks.length > 0 && sections.length > 0) {
    navLinks[0].parentElement.classList.add('active');
    sections[0].classList.add('active');
  }
}

// Load dashboard data
function loadDashboardData() {
  // Simulate loading data with animation
  const statsCards = document.querySelectorAll('.stat-card');
  
  statsCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    }, index * 100);
  });
  
  // Add health tips with animation
  const tipCards = document.querySelectorAll('.tip-card');
  
  tipCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    }, 500 + (index * 150));
  });
}

// Symptom checker
function initSymptomChecker() {
  const symptomForm = document.getElementById('symptomForm');
  const resultContainer = document.getElementById('result');
  
  if (symptomForm) {
    symptomForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const symptoms = document.getElementById('symptoms').value;
      const duration = document.querySelector('input[name="duration"]:checked')?.value || '';
      
      if (!symptoms) {
        showAlert(resultContainer, 'Please describe your symptoms', 'error');
        return;
      }
      
      // Show loading state
      resultContainer.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Analyzing your symptoms...</p>
        </div>
      `;
      
      try {
        // Call our API service instead of mock data
        const results = await API.getSymptomAnalysis(symptoms);
        displaySymptomResults(resultContainer, results);
      } catch (error) {
        resultContainer.innerHTML = `
          <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Sorry, we couldn't analyze your symptoms. Please try again later. (${error.message})</p>
          </div>
        `;
      }
    });
  }
}

// Generate symptom result HTML
function generateSymptomResult(symptoms, duration) {
  // This would normally come from the backend
  return `
    <h3>Symptom Analysis</h3>
    <div style="margin-bottom: 1.5rem;">
      <p>Based on the symptoms you described:</p>
      <p style="font-style: italic; color: #666; margin: 1rem 0; padding: 1rem; background-color: #f5f7fb; border-radius: 8px;">"${symptoms}"</p>
      <p>And a duration of <strong>${duration}</strong>, here's our assessment:</p>
    </div>
    
    <div style="margin-bottom: 1.5rem;">
      <h4 style="color: #2A7DE1;">Possible Conditions</h4>
      <ul style="margin-top: 0.5rem;">
        <li>Common Cold (High probability)</li>
        <li>Seasonal Allergies (Medium probability)</li>
        <li>Sinusitis (Low probability)</li>
      </ul>
    </div>
    
    <div style="margin-bottom: 1.5rem;">
      <h4 style="color: #2A7DE1;">Recommended Actions</h4>
      <ol style="margin-top: 0.5rem;">
        <li>Rest and ensure adequate hydration</li>
        <li>Over-the-counter pain relievers may help with discomfort</li>
        <li>Monitor symptoms for the next 48 hours</li>
        <li>If symptoms worsen, consult with a healthcare professional</li>
      </ol>
    </div>
    
    <div style="background-color: #e8f4fd; padding: 1rem; border-radius: 8px; margin-top: 1.5rem;">
      <p style="color: #2A7DE1; font-weight: 600; margin-bottom: 0.5rem;">Important Note</p>
      <p style="margin: 0; font-size: 0.95rem;">This is an automated assessment based on the symptoms you've described. It is not a medical diagnosis. For a proper diagnosis, please consult with a healthcare professional.</p>
    </div>
    
    <div style="margin-top: 2rem; display: flex; gap: 1rem;">
      <button class="btn-primary" onclick="document.getElementById('doctorsTab').click()">
        <i class="fas fa-video"></i> Consult a Doctor
      </button>
      <button class="btn-secondary" onclick="document.getElementById('firstAidTab').click()">
        <i class="fas fa-medkit"></i> View First Aid
      </button>
    </div>
  `;
}

// First aid section
function initFirstAidSection() {
  const conditionCards = document.querySelectorAll('.condition-card');
  const firstAidContent = document.querySelector('.first-aid-content');
  
  conditionCards.forEach(card => {
    card.addEventListener('click', function() {
      const condition = this.querySelector('h4').textContent;
      
      // Show loading state
      if (firstAidContent) {
        firstAidContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #2A7DE1;"></i><p style="margin-top: 1rem; color: #666;">Loading first aid instructions...</p></div>';
        firstAidContent.classList.add('active');
        
        // Scroll to content
        firstAidContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Simulate API call with timeout
        setTimeout(() => {
          firstAidContent.innerHTML = generateFirstAidContent(condition);
        }, 1000);
      }
    });
  });
}

// Generate first aid content
function generateFirstAidContent(condition) {
  // This would normally come from the backend
  let content = '';
  
  switch (condition) {
    case 'Burns':
      content = `
        <h3>First Aid for Burns</h3>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Cool the burn</h4>
              <p>Hold the burned area under cool (not cold) running water for 10 to 15 minutes or until the pain eases. If running water isn't available, immerse in cool water or cool with a cold compress.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Remove jewelry and clothing</h4>
              <p>Remove jewelry, watches and clothing from the burned area immediately, before swelling occurs. Do not remove clothing that is stuck to the burn.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Cover the burn</h4>
              <p>Cover the burn with a sterile, non-stick bandage or clean cloth. Wrap loosely to avoid putting pressure on the burned skin.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Take pain reliever</h4>
              <p>Take over-the-counter pain reliever such as ibuprofen (Advil, Motrin), naproxen (Aleve) or acetaminophen (Tylenol) for pain relief.</p>
            </div>
          </div>
          <div class="step warning">
            <div class="step-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="step-content">
              <h4>When to seek emergency care</h4>
              <ul>
                <li>Burns that cover a large area of the body</li>
                <li>Deep burns that affect all layers of the skin</li>
                <li>Burns on the face, hands, feet, genitals or major joints</li>
                <li>If the person shows signs of shock</li>
                <li>If the burn was caused by chemicals, electricity or explosions</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      break;
    
    case 'Cuts':
      content = `
        <h3>First Aid for Cuts and Wounds</h3>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Stop the bleeding</h4>
              <p>Apply gentle pressure with a clean cloth or bandage for several minutes. If the wound is on an arm or leg, raise it above the heart to help slow the bleeding.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Clean the wound</h4>
              <p>Rinse the wound with clear water. Use soap to clean the area around the wound, but avoid getting soap in the wound. Remove any dirt or debris with tweezers cleaned with alcohol.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Apply an antibiotic</h4>
              <p>After cleaning the wound, apply a thin layer of antibiotic ointment to keep the surface moist and help prevent scarring.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Cover the wound</h4>
              <p>Apply a sterile bandage or gauze and medical tape to keep the wound clean and protected. Change the dressing at least once a day or whenever it gets wet or dirty.</p>
            </div>
          </div>
          <div class="step warning">
            <div class="step-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="step-content">
              <h4>When to seek medical care</h4>
              <ul>
                <li>Deep wounds that may need stitches</li>
                <li>Wounds with jagged edges</li>
                <li>Wounds that won't stop bleeding after 10-15 minutes of pressure</li>
                <li>Wounds from animal or human bites</li>
                <li>Wounds with embedded objects</li>
                <li>Signs of infection (increased pain, redness, swelling, warmth, or pus)</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      break;
    
    default:
      content = `
        <h3>First Aid for ${condition}</h3>
        <p style="color: #666; margin-bottom: 2rem;">Detailed first aid instructions for ${condition} will appear here. This is a placeholder.</p>
        
        <div style="text-align: center; margin: 3rem 0;">
          <i class="fas fa-first-aid" style="font-size: 4rem; color: #2A7DE1; margin-bottom: 1rem;"></i>
          <p>We're working on adding detailed instructions for this condition.</p>
          <p>Please check back soon or consult with a healthcare professional.</p>
        </div>
        
        <div style="background-color: #e8f4fd; padding: 1.5rem; border-radius: 8px; margin-top: 2rem;">
          <p style="color: #2A7DE1; font-weight: 600; margin-bottom: 0.5rem;">Important Note</p>
          <p style="margin: 0; font-size: 0.95rem;">For any medical emergency, always call your local emergency number immediately.</p>
        </div>
      `;
  }
  
  // Add some CSS for the first aid steps
  content += `
    <style>
      .steps-container {
        margin-top: 2rem;
      }
      
      .step {
        display: flex;
        margin-bottom: 1.5rem;
        background-color: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        transition: all 0.3s;
      }
      
      .step:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
      
      .step-number {
        width: 40px;
        height: 40px;
        background: linear-gradient(90deg, #2A7DE1, #1a68c7);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-right: 1rem;
        flex-shrink: 0;
      }
      
      .step-icon {
        width: 40px;
        height: 40px;
        background-color: #f39c12;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        flex-shrink: 0;
      }
      
      .step-content h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: #333;
      }
      
      .step-content p {
        margin: 0;
        color: #666;
      }
      
      .step-content ul {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
      }
      
      .step-content li {
        margin-bottom: 0.5rem;
      }
      
      .warning {
        background-color: #fff9e6;
        border-left: 4px solid #f39c12;
      }
    </style>
  `;
  
  return content;
}

// Doctor consultation tabs
function initConsultationTabs() {
  const tabButtons = document.querySelectorAll('.category-tabs .tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Filter doctors based on category
      filterDoctors(this.dataset.category);
    });
  });
}

// Filter doctors by category
function filterDoctors(category) {
  const doctors = document.querySelectorAll('.doctor-card');
  
  doctors.forEach(doctor => {
    if (category === 'all' || doctor.dataset.category === category) {
      doctor.style.display = 'flex';
      
      // Add animation
      doctor.style.opacity = '0';
      doctor.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        doctor.style.transition = 'all 0.5s ease';
        doctor.style.opacity = '1';
        doctor.style.transform = 'translateY(0)';
      }, 100);
    } else {
      doctor.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard functionality
  initSidebar();
  initQuickActions();
  initSymptomChecker();
  initFirstAidGuide();
  
  // Sample user data (replace with actual user data from authentication)
  updateUserInfo({
    name: "John Doe",
    email: "johndoe@example.com"
  });
});

// Sidebar navigation
function initSidebar() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav li a');
  const sections = document.querySelectorAll('.dashboard-section');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the section id from the href attribute
      const sectionId = this.getAttribute('href').substring(1);
      
      // Remove active class from all links and sections
      sidebarLinks.forEach(link => link.parentElement.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      // Add active class to clicked link and corresponding section
      this.parentElement.classList.add('active');
      document.getElementById(sectionId).classList.add('active');
    });
  });
  
  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Implement logout logic here
      window.location.href = "index.html";
    });
  }
}

// Quick action buttons
function initQuickActions() {
  const actionButtons = document.querySelectorAll('.action-btn');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav li a');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      
      // Find corresponding sidebar link and trigger click
      sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + sectionId) {
          link.click();
        }
      });
    });
  });
}

// Symptom checker
function initSymptomChecker() {
  const symptomForm = document.getElementById('symptomForm');
  const resultContainer = document.getElementById('result');
  
  if (symptomForm) {
    symptomForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const symptoms = document.getElementById('symptoms').value;
      const duration = document.querySelector('input[name="duration"]:checked')?.value || '';
      
      if (!symptoms) {
        showAlert(resultContainer, 'Please describe your symptoms', 'error');
        return;
      }
      
      // Show loading state
      resultContainer.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Analyzing your symptoms...</p>
        </div>
      `;
      
      try {
        // Call our API service instead of mock data
        const results = await API.getSymptomAnalysis(symptoms);
        displaySymptomResults(resultContainer, results);
      } catch (error) {
        resultContainer.innerHTML = `
          <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Sorry, we couldn't analyze your symptoms. Please try again later. (${error.message})</p>
          </div>
        `;
      }
    });
  }
}

// First aid guide
function initFirstAidGuide() {
  const conditionCards = document.querySelectorAll('.condition-card');
  const searchInput = document.getElementById('firstAidSearch');
  const searchButton = document.querySelector('.search-container button');
  const contentContainer = document.getElementById('firstAidContent');
  
  if (conditionCards) {
    conditionCards.forEach(card => {
      card.addEventListener('click', function() {
        const condition = this.dataset.condition;
        displayFirstAidContent(contentContainer, condition);
      });
    });
  }
  
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', function() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (searchTerm) {
        // Search for first aid content
        searchFirstAidContent(contentContainer, searchTerm);
      }
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchButton.click();
      }
    });
  }
}

// Update user information
function updateUserInfo(user) {
  const userNameElements = document.querySelectorAll('#userName, #profileName');
  const profileEmail = document.getElementById('profileEmail');
  const fullNameInput = document.getElementById('fullName');
  
  userNameElements.forEach(element => {
    if (element) element.textContent = user.name;
  });
  
  if (profileEmail) profileEmail.textContent = user.email;
  if (fullNameInput) fullNameInput.value = user.name;
}

// Display symptom analysis results
function displaySymptomResults(container, results) {
  let html = `
    <div class="result-header">
      <h3>Symptom Analysis Results</h3>
      <p class="disclaimer">This is a preliminary analysis and not a medical diagnosis. Please consult with a healthcare professional for proper evaluation.</p>
    </div>
    <div class="possible-conditions">
      <h4>Possible Conditions:</h4>
      <ul class="conditions-list">
  `;
  
  results.conditions.forEach(condition => {
    html += `
      <li>
        <div class="condition-name">${condition.name}</div>
        <div class="condition-likelihood">
          <div class="likelihood-bar">
            <div class="likelihood-fill" style="width: ${condition.likelihood}%"></div>
          </div>
          <span>${condition.likelihood}% match</span>
        </div>
      </li>
    `;
  });
  
  html += `
      </ul>
    </div>
    <div class="recommendations">
      <h4>Recommendations:</h4>
      <ul class="recommendations-list">
  `;
  
  results.recommendations.forEach(rec => {
    html += `<li><i class="fas fa-check-circle"></i> ${rec}</li>`;
  });
  
  html += `
      </ul>
    </div>
    <div class="action-buttons">
      <button class="btn-primary consult-btn" data-section="consult">
        <i class="fas fa-video"></i> Talk to a Doctor
      </button>
      <button class="btn-secondary" onclick="document.getElementById('symptomForm').reset();">
        <i class="fas fa-redo"></i> Check Another Symptom
      </button>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Add event listener to the consult button
  const consultBtn = container.querySelector('.consult-btn');
  if (consultBtn) {
    consultBtn.addEventListener('click', function() {
      const sidebarLinks = document.querySelectorAll('.sidebar-nav li a');
      sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + this.dataset.section) {
          link.click();
        }
      });
    });
  }
}

// Display first aid content
function displayFirstAidContent(container, condition) {
  container.innerHTML = `
    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading first aid instructions...</p>
    </div>
  `;
  
  API.getFirstAidInfo(condition)
    .then(data => {
      container.innerHTML = `
        <h3>${data.title}</h3>
        <div class="first-aid-steps">
          ${data.steps.map(step => `
            <div class="first-aid-step">
              <h4>${step.title}</h4>
              <p>${step.description}</p>
              ${step.note ? `<p class="note"><i class="fas fa-info-circle"></i> ${step.note}</p>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="disclaimer">
          <p><strong>Important:</strong> This information is not a substitute for professional medical advice. In case of emergency, call 911 or your local emergency number.</p>
        </div>
      `;
    })
    .catch(error => {
      // Fall back to local content if API fails
      container.innerHTML = getFirstAidContent(condition);
      console.error('Error fetching first aid content:', error);
    });
}

// Search first aid content
function searchFirstAidContent(container, searchTerm) {
  // Simulate search functionality
  let found = false;
  
  // Check if search term matches any condition
  const conditions = ['burns', 'cuts', 'choking', 'heart-attack', 'fracture', 'poisoning'];
  
  for (const condition of conditions) {
    if (condition.includes(searchTerm)) {
      displayFirstAidContent(container, condition);
      found = true;
      break;
    }
  }
  
  if (!found) {
    container.innerHTML = `
      <div class="search-no-results">
        <i class="fas fa-search"></i>
        <h3>No results found for "${searchTerm}"</h3>
        <p>Please try a different search term or browse the common conditions above.</p>
      </div>
    `;
  }
}

// Show alert message
function showAlert(container, message, type = 'info') {
  container.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <p>${message}</p>
    </div>
  `;
}

// Mock data for symptom checker (replace with actual API)
function getMockSymptomResults(symptoms) {
  return {
    conditions: [
      { name: 'Common Cold', likelihood: 85 },
      { name: 'Seasonal Allergies', likelihood: 70 },
      { name: 'Sinusitis', likelihood: 55 },
      { name: 'Flu', likelihood: 40 }
    ],
    recommendations: [
      'Stay hydrated and get plenty of rest',
      'Take over-the-counter cold medications to relieve symptoms',
      'Use a humidifier to ease congestion',
      'Consult with a healthcare provider if symptoms worsen or persist beyond 7 days'
    ]
  };
}

// First aid content data (replace with actual data)
function getFirstAidContent(condition) {
  const contentMap = {
    'burns': {
      title: 'First Aid for Burns',
      steps: [
        {
          title: 'Stop the burning process',
          description: 'Remove the person from the source of the burn. If clothing is on fire, have them "stop, drop, and roll."'
        },
        {
          title: 'Cool the burn',
          description: 'Hold the burned area under cool (not cold) running water for 10 to 15 minutes. If this isn\'t possible, immerse the burn in cool water or apply cold compresses.',
          note: 'Do not use ice, as this can further damage the skin.'
        },
        {
          title: 'Remove tight items',
          description: 'Take off jewelry, belts, and tight clothing from the burned area before it begins to swell.'
        },
        {
          title: 'Cover the burn',
          description: 'Apply a sterile, non-adhesive bandage or clean cloth over the burn. Wrap it loosely to avoid putting pressure on the burned skin.'
        }
      ],
      warnings: [
        'Do not apply butter, oil, ice, or medication to the burn unless directed by a healthcare provider.',
        'Do not break blisters, as this increases the risk of infection.',
        'Seek immediate medical attention for severe or widespread burns, chemical/electrical burns, or if the burn affects the face, hands, feet, genitals, or major joints.'
      ]
    },
    'cuts': {
      title: 'First Aid for Cuts and Wounds',
      steps: [
        {
          title: 'Stop the bleeding',
          description: 'Apply gentle pressure with a clean cloth or bandage for several minutes.'
        },
        {
          title: 'Clean the wound',
          description: 'Rinse the cut or wound with clean water. Avoid using soap on open wounds. Gently clean around the wound with soap and water.'
        },
        {
          title: 'Apply an antibiotic',
          description: 'After cleaning the wound, apply a thin layer of antibiotic ointment to prevent infection.'
        },
        {
          title: 'Cover the wound',
          description: 'Apply a sterile bandage to keep the wound clean and prevent bacteria from entering.'
        }
      ],
      warnings: [
        'Seek immediate medical attention if the bleeding doesn\'t stop after 10-15 minutes of pressure.',
        'Deep or gaping wounds may require stitches and should be treated by a healthcare provider within 6-8 hours.',
        'Watch for signs of infection: increasing pain, redness, swelling, warmth, or discharge from the wound.'
      ]
    },
    'choking': {
      title: 'First Aid for Choking',
      steps: [
        {
          title: 'Determine if the person can speak or cough',
          description: 'If the person can speak, cough, or breathe, do not interfere. Encourage them to cough forcefully to clear the obstruction.'
        },
        {
          title: 'Perform abdominal thrusts (Heimlich maneuver)',
          description: 'Stand behind the person and wrap your arms around their waist. Make a fist with one hand and place it thumb-side above the navel. Grasp your fist with the other hand and deliver quick, upward thrusts into the abdomen.',
          note: 'For pregnant women or obese individuals, perform chest thrusts instead.'
        },
        {
          title: 'Repeat until the object is expelled',
          description: 'Continue performing abdominal thrusts until the object is dislodged or the person becomes unconscious.'
        },
        {
          title: 'If the person becomes unconscious',
          description: 'Carefully lower them to the ground, call emergency services, and begin CPR if trained.'
        }
      ],
      warnings: [
        'Do not perform abdominal thrusts on infants under 1 year of age. Instead, perform alternating back blows and chest thrusts.',
        'After successful removal of the obstruction, the person should still be evaluated by a healthcare provider.',
        'Never leave a choking person alone.'
      ]
    },
    'heart-attack': {
      title: 'First Aid for Heart Attack',
      steps: [
        {
          title: 'Call emergency services immediately',
          description: 'Call emergency services (911) right away if someone is showing heart attack symptoms: chest pain/pressure, pain radiating to arm/jaw, shortness of breath, nausea, or cold sweat.'
        },
        {
          title: 'Have the person sit down and rest',
          description: 'Help the person into a comfortable position, typically sitting down and leaning slightly back with knees bent to reduce strain on the heart.'
        },
        {
          title: 'Administer aspirin if available',
          description: 'If the person is not allergic to aspirin, have them chew a regular, non-coated aspirin (325 mg) or four low-dose (81 mg) aspirins.',
          note: 'Do not give aspirin if the person has been advised to avoid it or if they\'re experiencing stroke symptoms.'
        },
        {
          title: 'Monitor and provide CPR if needed',
          description: 'If the person becomes unconscious and is not breathing normally, begin CPR if trained.'
        }
      ],
      warnings: [
        'Never wait to see if symptoms go away. Every minute counts during a heart attack.',
        'Do not allow the person to drive themselves to the hospital.',
        'If available, an AED (Automated External Defibrillator) should be used if the person is unconscious and not breathing normally.'
      ]
    },
    'fracture': {
      title: 'First Aid for Fractures',
      steps: [
        {
          title: 'Immobilize the injured area',
          description: 'Prevent movement of the injured area by steadying and supporting it. Do not try to realign a broken bone.'
        },
        {
          title: 'Apply ice',
          description: 'Apply ice packs wrapped in a towel to the injured area to reduce swelling and pain. Apply for 15-20 minutes every hour.',
          note: 'Never apply ice directly to the skin.'
        },
        {
          title: 'Elevate the injured area',
          description: 'If possible, elevate the injured limb above the level of the heart to reduce swelling.'
        },
        {
          title: 'Apply a temporary splint if needed',
          description: 'If you need to move the person or they need to be transported, apply a temporary splint to immobilize the area above and below the fracture site.'
        }
      ],
      warnings: [
        'Do not move a person with a suspected spine, neck, or head injury unless absolutely necessary.',
        'Seek immediate medical attention for all suspected fractures.',
        'If bone is protruding through the skin (open fracture), do not push it back in. Cover the wound with a clean dressing and seek immediate medical help.'
      ]
    },
    'poisoning': {
      title: 'First Aid for Poisoning',
      steps: [
        {
          title: 'Call poison control or emergency services',
          description: 'Call your local poison control center (1-800-222-1222 in the US) or emergency services immediately. Follow their instructions.'
        },
        {
          title: 'Remove the person from danger',
          description: 'If the poison is in the air, get the person to fresh air immediately. If poison is on the skin, rinse it off with running water and remove contaminated clothing.'
        },
        {
          title: 'Identify the poison if possible',
          description: 'Try to determine what substance was ingested, inhaled, or contacted. Have the container available when you call for help.'
        },
        {
          title: 'Do not induce vomiting unless directed',
          description: 'Do not give the person anything to drink or induce vomiting unless specifically directed to do so by poison control or a healthcare provider.'
        }
      ],
      warnings: [
        'Never induce vomiting if the person has swallowed a corrosive substance or petroleum product.',
        'Do not use syrup of ipecac to induce vomiting.',
        'If the person is unconscious, having seizures, or having trouble breathing, call emergency services immediately.'
      ]
    }
  };
  
  return contentMap[condition] || {
    title: 'First Aid Information',
    steps: [
      {
        title: 'Information not found',
        description: 'Detailed information for this condition is not available. Please try searching for another condition.'
      }
    ],
    warnings: [
      'Always seek professional medical help in case of emergency.'
    ]
  };
}

// Initialize custom cursor for dashboard
function initCustomCursor() {
  // Check if we're on a touch device, if so, don't show custom cursor
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }
  
  // Check if cursor elements exist in the DOM
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  // If cursor elements don't exist, create them
  if (!cursor) {
    const newCursor = document.createElement('div');
    newCursor.className = 'cursor';
    document.body.appendChild(newCursor);
  }
  
  if (!cursorFollower) {
    const newCursorFollower = document.createElement('div');
    newCursorFollower.className = 'cursor-follower';
    document.body.appendChild(newCursorFollower);
  }
  
  // Get the cursor elements (now guaranteed to exist)
  const cursorElement = document.querySelector('.cursor');
  const cursorFollowerElement = document.querySelector('.cursor-follower');
  
  // Hide default cursor on the entire document
  document.body.style.cursor = 'none';
  
  // Main cursor movement
  document.addEventListener('mousemove', function(e) {
    cursorElement.style.left = e.clientX + 'px';
    cursorElement.style.top = e.clientY + 'px';
    
    setTimeout(function() {
      cursorFollowerElement.style.left = e.clientX + 'px';
      cursorFollowerElement.style.top = e.clientY + 'px';
    }, 80);
  });
  
  // Add hover effects for interactive elements
  const hoverElements = document.querySelectorAll('a, button, .btn-primary, .btn-secondary, .action-btn, .condition-card, .stat-card, .tip-card, input, select, textarea');
  
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      cursorElement.classList.add('cursor-active');
      cursorFollowerElement.classList.add('cursor-active');
      element.style.cursor = 'none'; // Ensure default cursor doesn't show
    });
    
    element.addEventListener('mouseleave', function() {
      cursorElement.classList.remove('cursor-active');
      cursorFollowerElement.classList.remove('cursor-active');
    });
  });
  
  // Handle cursor disappearing when leaving window
  document.addEventListener('mouseout', function(e) {
    if (e.relatedTarget === null) {
      cursorElement.style.display = 'none';
      cursorFollowerElement.style.display = 'none';
    }
  });
  
  document.addEventListener('mouseover', function() {
    cursorElement.style.display = 'block';
    cursorFollowerElement.style.display = 'block';
  });
  
  // Handle cursor disappearing during click
  document.addEventListener('mousedown', function() {
    cursorElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
    cursorFollowerElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });
  
  document.addEventListener('mouseup', function() {
    cursorElement.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollowerElement.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}

// Update current date in the dashboard
function updateCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
  }
}