 // Form Submission
 document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Send form data using Fetch API
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Message sent successfully! We will get back to you soon.');
            form.reset();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch(error => {
        alert('There was a problem sending your message. Please try again later.');
        console.error('Error:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message';
    });
});

// Live Chat Functionality
const chatButton = document.getElementById('chatButton');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');

chatButton.addEventListener('click', function() {
    chatBox.style.display = 'block';
});

closeChat.addEventListener('click', function() {
    chatBox.style.display = 'none';
});

function addMessage(content, isReceived) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isReceived ? 'received' : 'sent'}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

sendMessage.addEventListener('click', function() {
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, false);
        chatInput.value = '';
        
        // Simulate response after 1-2 seconds
        setTimeout(() => {
            const responses = [
                "Thanks for your message! How can we assist you?",
                "Our support team will get back to you shortly.",
                "Can you provide more details about your issue?",
                "We're here to help! What do you need?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, true);
        }, 1000 + Math.random() * 1000);
    }
});

chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage.click();
    }
});