const nodemailer = require('nodemailer');

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'abdullahawan00119@gmail.com',
      pass: process.env.EMAIL_PASS || ''
    }
  });
};

// Send new job application email notification
const sendApplicationEmail = async (application, baseUrl = 'http://localhost:5000') => {
  // Robust check for resume
  const resumeFilename = application.resume?.path ? application.resume.path.split('/').pop() : 'no-resume.pdf';
  const resumeUrl = `${baseUrl}/uploads/${resumeFilename}`;
  const resumeInfo = application.resume ? `File: ${application.resume.filename || 'unknown'} (${(application.resume.size / 1024 / 1024).toFixed(2)} MB)` : 'No resume attached';
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'abdullahawan00119@gmail.com',
    to: 'abdullahawan00119@gmail.com',
    subject: `🆕 New Job Application: ${application.name} - ${application.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Application Received</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b;">📋 Applicant Details</h3>
          <p><strong>Name:</strong> ${application.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${application.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
          <p><strong>Position:</strong> ${application.jobTitle || 'N/A'}</p>
          <p><strong>Department:</strong> ${application.department || 'N/A'}</p>
          <p><strong>Location:</strong> ${application.city || 'N/A'}, ${application.district || 'N/A'}</p>
          ${application.experience ? `<p><strong>Experience:</strong> ${application.experience}</p>` : ''}
          ${application.skills && application.skills.length ? `<p><strong>Skills:</strong> ${application.skills.join(', ')}</p>` : ''}
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e;">📎 Resume/CV</h4>
          <p><a href="${resumeUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Resume</a></p>
          <p><small>${resumeInfo}</small></p>
        </div>

        ${application.coverLetter ? `
        <div style="background: #f1f5f9; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
          <h4 style="color: #1e293b;">📝 Cover Letter</h4>
          <p>${application.coverLetter.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px;">
            View in Dashboard: <a href="${baseUrl}/admin/dashboard">${baseUrl}/admin/dashboard</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px;">
            This is an automated email from Razite Job Portal
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent for application: ${application._id}`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return false;
  }
};

module.exports = { sendApplicationEmail };
