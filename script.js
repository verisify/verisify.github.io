// Contact Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Send email to bellamy_thomas@outlook.com
  // (This is just a placeholder, you would need to set up a server-side email sending mechanism)
  console.log('Sending email to bellamy_thomas@outlook.com');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Message:', message);

  // Display a dialogue to indicate the message was sent
  alert('Message sent!');

  // Reset the form
  contactForm.reset();
});

// Redirect Buttons
const contactButton = document.querySelector('.contact-button');
const homeButton = document.querySelector('.home-button');

contactButton.addEventListener('click', () => {
  window.location.href = 'contact.html';
});

homeButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});
