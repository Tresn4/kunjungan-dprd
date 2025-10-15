// be-aja/config/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter based on email service
const createTransporter = () => {
  // Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // Generic SMTP configuration (for Mailtrap, custom SMTP, etc)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const transporter = createTransporter();

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('⚠️  Email notifications will not work. Please check your .env configuration.');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

module.exports = transporter;