import express from 'express';
import multer from 'multer';
import path from 'path';
import Member from '../models/Member.js';
import { authenticate } from '../middleware/auth.js';
import { sendBulkEmails } from '../config/email.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, document, and archive files are allowed!'));
    }
  }
});

// Get all member emails for bulk mailing
router.get('/member-emails', authenticate, async (req, res) => {
  try {
    const { department, status } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    
    const members = await Member.find(query).select('name email department status');
    
    const emailList = members.map(member => ({
      id: member._id,
      name: member.name,
      email: member.email,
      department: member.department,
      status: member.status
    }));
    
    res.json({
      totalMembers: emailList.length,
      emails: emailList
    });
  } catch (error) {
    console.error('Error fetching member emails:', error);
    res.status(500).json({
      message: 'Error fetching member emails',
      error: error.message
    });
  }
});

// Send bulk email (mock implementation for now)
router.post('/send-bulk', authenticate, upload.array('attachments', 5), async (req, res) => {
  try {
    const { subject, message, recipientType, department, status, selectedEmails } = req.body;
    const attachments = req.files || [];
    
    if (!subject || !message) {
      return res.status(400).json({
        message: 'Subject and message are required'
      });
    }
    
    let members = [];
    
    // Handle different recipient types
    if (recipientType === 'custom' && selectedEmails) {
      // Use custom selected emails
      const emailList = JSON.parse(selectedEmails);
      members = emailList.map(email => ({ email, name: email.split('@')[0], department: 'Custom' }));
    } else {
      // Build query based on recipient type
      let query = {};
      if (recipientType === 'all') {
        query.status = 'Active';
      } else if (recipientType === 'department' && department) {
        query.department = department;
        query.status = 'Active';
      } else if (recipientType === 'status' && status) {
        query.status = status;
      }
      
      // Get member emails from database
      members = await Member.find(query).select('name email department status');
    }
    
    if (members.length === 0) {
      return res.status(400).json({
        message: 'No recipients selected'
      });
    }
    
    // Prepare email content with HTML formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          ${subject}
        </h2>
        <div style="line-height: 1.6; color: #34495e;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; font-size: 12px; color: #7f8c8d;">
          <p>Best regards,<br>RHSF Fellowship Management System</p>
        </div>
      </div>
    `;

    // Prepare attachments for nodemailer
    const emailAttachments = attachments.map(file => ({
      filename: file.originalname,
      path: file.path
    }));

    // Send bulk emails using real email service
    console.log(`Starting to send ${members.length} emails...`);
    const emailResults = await sendBulkEmails(members, subject, htmlContent, emailAttachments);
    
    // Calculate success and failure counts
    const successfulEmails = emailResults.filter(result => result.success);
    const failedEmails = emailResults.filter(result => !result.success);
    
    console.log(`Email sending completed: ${successfulEmails.length} successful, ${failedEmails.length} failed`);
    
    res.json({
      message: `Bulk email sending completed`,
      data: {
        totalRecipients: members.length,
        successfulEmails: successfulEmails.length,
        failedEmails: failedEmails.length,
        recipients: members.map(member => ({
          name: member.name,
          email: member.email,
          department: member.department
        })),
        attachments: attachments.map(file => file.originalname),
        sentAt: new Date(),
        results: emailResults
      }
    });
    
  } catch (error) {
    console.error('Error sending bulk email:', error);
    res.status(500).json({
      message: 'Error sending bulk email',
      error: error.message
    });
  }
});

// Get email statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [totalMembers, activeMembers, departmentStats] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
    ]);
    
    res.json({
      totalMembers,
      activeMembers,
      departmentStats: departmentStats.map(dept => ({
        department: dept._id,
        count: dept.count
      }))
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      message: 'Error fetching email statistics',
      error: error.message
    });
  }
});

export default router;
