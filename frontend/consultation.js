// WebRTC consultation functionality
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const startCallBtn = document.getElementById('startCallBtn');
  const endCallBtn = document.getElementById('endCallBtn');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const roomIdInput = document.getElementById('roomId');
  const joinCallBtn = document.getElementById('joinCallBtn');
  const callStatus = document.getElementById('callStatus');
  const errorMessage = document.getElementById('errorMessage');
  
  // Backend API URL
  const API_URL = 'https://doctor-backend-6gpf.onrender.com';
  
  // WebRTC variables
  let localStream;
  let remoteStream;
  let peerConnection;
  let roomId;
  let isOfferer = false;
  let checkAnswerInterval;
  let isCallActive = false;
  
  // WebRTC configuration
  const peerConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
  
  // Check if we're on the consultation page
  if (startCallBtn && joinCallBtn) {
    // Initialize UI 
    endCallBtn.style.display = 'none';
    localVideo.style.display = 'none';
    remoteVideo.style.display = 'none';
    callStatus.style.display = 'none';
    
    // Set up event listeners
    startCallBtn.addEventListener('click', startCall);
    joinCallBtn.addEventListener('click', joinCall);
    endCallBtn.addEventListener('click', endCall);
  }
  
  // Start a new call as the call initiator
  async function startCall() {
    try {
      // Generate a random room ID
      roomId = Math.floor(Math.random() * 1000000).toString();
      roomIdInput.value = roomId;
      isOfferer = true;
      
      // Update UI
      updateCallStatus('Starting call... Room ID: ' + roomId);
      startCallBtn.disabled = true;
      joinCallBtn.disabled = true;
      
      // Get user media
      await setupUserMedia();
      
      // Setup WebRTC peer connection
      setupPeerConnection();
      
      // Create and send offer
      createAndSendOffer();
      
      // Start checking for remote answer and ICE candidates
      checkAnswerInterval = setInterval(checkForAnswer, 5000);
      
    } catch (error) {
      showError('Error starting call: ' + error.message);
      resetCallState();
    }
  }
  
  // Join an existing call as the answerer
  async function joinCall() {
    try {
      // Get room ID from input
      roomId = roomIdInput.value.trim();
      
      if (!roomId) {
        showError('Please enter a valid Room ID');
        return;
      }
      
      isOfferer = false;
      
      // Update UI
      updateCallStatus('Joining call... Room ID: ' + roomId);
      startCallBtn.disabled = true;
      joinCallBtn.disabled = true;
      
      // Get user media
      await setupUserMedia();
      
      // Setup WebRTC peer connection
      setupPeerConnection();
      
      // Get offer and create answer
      await getOfferAndCreateAnswer();
      
      // Start checking for ICE candidates
      startIceCandidateCheck();
      
    } catch (error) {
      showError('Error joining call: ' + error.message);
      resetCallState();
    }
  }
  
  // End the current call
  function endCall() {
    updateCallStatus('Call ended');
    resetCallState();
    
    // Clean up
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    
    if (checkAnswerInterval) {
      clearInterval(checkAnswerInterval);
    }
    
    // Reset UI
    startCallBtn.disabled = false;
    joinCallBtn.disabled = false;
    endCallBtn.style.display = 'none';
    localVideo.style.display = 'none';
    remoteVideo.style.display = 'none';
    callStatus.style.display = 'none';
    
    isCallActive = false;
  }
  
  // Set up local media stream
  async function setupUserMedia() {
    try {
      // Get user's camera and microphone
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Display local video
      localVideo.srcObject = localStream;
      localVideo.style.display = 'block';
      
      // Set up remote stream container
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
      
      return true;
    } catch (error) {
      showError('Cannot access camera or microphone: ' + error.message);
      throw error;
    }
  }
  
  // Set up WebRTC peer connection
  function setupPeerConnection() {
    // Create peer connection
    peerConnection = new RTCPeerConnection(peerConfig);
    
    // Add local tracks to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // Set up listeners for remote tracks
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      
      remoteVideo.style.display = 'block';
      updateCallStatus('Connected to remote peer');
      endCallBtn.style.display = 'block';
      isCallActive = true;
    };
    
    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(event.candidate);
      }
    };
    
    // Connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        if (isCallActive) {
          updateCallStatus('Connection lost');
          endCall();
        }
      }
    };
  }
  
  // Create and send WebRTC offer
  async function createAndSendOffer() {
    try {
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Send offer to signaling server
      const response = await fetch(`${API_URL}/webrtc/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: roomId,
          offer: JSON.stringify(peerConnection.localDescription)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send offer');
      }
      
      updateCallStatus('Waiting for someone to join the call...');
      
    } catch (error) {
      showError('Error creating offer: ' + error.message);
      throw error;
    }
  }
  
  // Get offer and create answer
  async function getOfferAndCreateAnswer() {
    try {
      // Get offer from signaling server
      const response = await fetch(`${API_URL}/webrtc/offer/${roomId}`);
      
      if (!response.ok) {
        throw new Error('No active call found with this Room ID');
      }
      
      const data = await response.json();
      const offer = JSON.parse(data.offer);
      
      // Set remote description from offer
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Send answer to signaling server
      const answerResponse = await fetch(`${API_URL}/webrtc/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: roomId,
          answer: JSON.stringify(peerConnection.localDescription)
        })
      });
      
      if (!answerResponse.ok) {
        throw new Error('Failed to send answer');
      }
      
      updateCallStatus('Connecting to call...');
      
      // Start checking for ICE candidates
      startIceCandidateCheck();
      
    } catch (error) {
      showError('Error joining call: ' + error.message);
      throw error;
    }
  }
  
  // Check for answer periodically
  async function checkForAnswer() {
    try {
      // Get answer from signaling server
      const response = await fetch(`${API_URL}/webrtc/answer/${roomId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // This header will be ignored client-side but tells us this is CORS-aware
        },
        mode: 'cors' // Explicitly set CORS mode
      });
      
      if (response.ok) {
        // Stop checking for answer
        clearInterval(checkAnswerInterval);
        
        const data = await response.json();
        const answer = JSON.parse(data.answer);
        
        // Set remote description from answer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        updateCallStatus('Remote peer joined, establishing connection...');
        
        // Start checking for ICE candidates
        startIceCandidateCheck();
      }
    } catch (error) {
      console.log('Error checking for answer:', error.message);
      // Continue checking, but log the specific error
    }
  }
  
  // Send ICE candidate to signaling server
  async function sendIceCandidate(candidate) {
    try {
      await fetch(`${API_URL}/webrtc/ice-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: roomId,
          candidate: candidate
        })
      });
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }
  
  // Start checking for ICE candidates periodically
  function startIceCandidateCheck() {
    // Check immediately
    checkIceCandidates();
    
    // Then check every 2 seconds
    setInterval(checkIceCandidates, 2000);
  }
  
  // Check for ICE candidates
  async function checkIceCandidates() {
    try {
      const response = await fetch(`${API_URL}/webrtc/ice-candidates/${roomId}`);
      
      if (response.ok) {
        const data = await response.json();
        const candidates = data.candidates;
        
        // Add each new ICE candidate
        for (const candidate of candidates) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error checking ICE candidates:', error);
    }
  }
  
  // Update call status display
  function updateCallStatus(message) {
    if (callStatus) {
      callStatus.textContent = message;
      callStatus.style.display = 'block';
    }
  }
  
  // Show error message
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 5000);
    }
  }
  
  // Reset call state
  function resetCallState() {
    roomId = null;
    isOfferer = false;
    
    if (checkAnswerInterval) {
      clearInterval(checkAnswerInterval);
      checkAnswerInterval = null;
    }
  }
});