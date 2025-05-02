// Custom cursor functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a touch device, if so, don't show custom cursor
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }
  
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if (!cursor || !cursorFollower) {
    console.error('Cursor elements not found in the document');
    return;
  }

  console.log('Cursor elements found, initializing...');
  
  // Hide default cursor on the entire document
  document.body.style.cursor = 'none';
  
  // Ensure cursor elements are visible
  cursor.style.display = 'block';
  cursorFollower.style.display = 'block';
  
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
      element.style.cursor = 'none';
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

  console.log('Custom cursor initialized successfully');
});