// API Service for Doctor-Sab Application
// This module centralizes all API calls to the backend

// Backend API URL
const API_URL = 'https://doctor-backend-6gpf.onrender.com';

// API methods
const API = {
  // Symptom analysis
  getSymptomAnalysis: async (symptoms) => {
    try {
      const response = await fetch(`${API_URL}/api/symptom-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Symptom analysis error:', error);
      // Return mock data as fallback
      return getMockSymptomResults(symptoms);
    }
  },
  
  // First aid information
  getFirstAidInfo: async (condition) => {
    try {
      const response = await fetch(`${API_URL}/api/first-aid/${condition}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch first aid information');
      }
      
      return await response.json();
    } catch (error) {
      console.error('First aid info error:', error);
      // Return mock data as fallback
      return getFirstAidContent(condition);
    }
  },
  
  // Doctor availability
  getDoctorAvailability: async (doctorId) => {
    try {
      const response = await fetch(`${API_URL}/api/doctors/${doctorId}/availability`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctor availability');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Doctor availability error:', error);
      // Return mock data as fallback
      return {
        available: true,
        nextAvailable: new Date().toISOString(),
        timeSlots: [
          { start: '09:00', end: '09:30' },
          { start: '10:00', end: '10:30' },
          { start: '11:00', end: '11:30' },
        ]
      };
    }
  },
  
  // Book appointment
  bookAppointment: async (doctorId, patientId, timeSlot) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          patientId,
          timeSlot
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Appointment booking error:', error);
      throw error;
    }
  },
  
  // Get user medical history
  getUserMedicalHistory: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/medical-history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch medical history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Medical history error:', error);
      // Return mock data as fallback
      return {
        allergies: ['Pollen', 'Penicillin'],
        conditions: ['Asthma'],
        medications: ['Albuterol'],
        pastSurgeries: []
      };
    }
  },
};

// Helper function: Mock symptom results (fallback if API fails)
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

// Helper function: First aid content (fallback if API fails)
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
    ]
  };
}

export default API;