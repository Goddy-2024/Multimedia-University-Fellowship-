import nodemailer from 'nodemailer';

// Create transporter for Gmail
const createTransporter = async () => {
  return await nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function 
export const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: "Multimedia University RHSF",
      to: to,
      subject: subject,
      html: html,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send bulk emails function
export const sendBulkEmails = async (recipients, subject, html, attachments = []) => {
  const transporter = await createTransporter();
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const mailOptions = {
        from: "Multimedia University RHSF",
        to: recipient.email,
        subject: subject,
        html: html.replace(/{{name}}/g, recipient.name || 'Member'),
        attachments: attachments
      };

      const info = await transporter.sendMail(mailOptions);
      results.push({
        email: recipient.email,
        success: true,
        messageId: info.messageId
      });
      
      console.log(`Email sent to ${recipient.email}:`, info.messageId);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error sending email to ${recipient.email}:`, error);
      results.push({
        email: recipient.email,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};
