// PlayerEntryStatusTemplate.js
/*export const PlayerEntryStatusTemplate = (status, playerName, eventDetails, partnerName = null) => {
  const getStatusConfig = (status) => {
    const config = {
      approved: {
        title: "🎉 Your Tournament Entry Has Been Approved!",
        color: "#10B981",
        icon: "✅",
        message: "Congratulations! Your tournament registration has been approved. Get ready to showcase your skills on the court!",
        nextSteps: [
          "Please arrive at the venue 30 minutes before your scheduled match time",
          "Carry your original ID proof and TNBA ID card for verification",
          "Wear proper sports attire as per tournament guidelines",
          "Check the tournament schedule regularly for any updates"
        ]
      },
      rejected: {
        title: "❌ Tournament Entry Status Update",
        color: "#EF4444",
        icon: "⚠️",
        message: "We regret to inform you that your tournament registration could not be approved at this time.",
        nextSteps: [
          "Please verify your registration details for any discrepancies",
          "Ensure all required documents were submitted correctly",
          "Contact tournament organizers for specific reasons",
          "You may re-apply for future tournaments after addressing the issues"
        ]
      },
      pending: {
        title: "⏳ Tournament Entry Under Review",
        color: "#F59E0B",
        icon: "📋",
        message: "Your tournament registration is currently under review by our team.",
        nextSteps: [
          "Your application is being processed by our verification team",
          "You will receive another email once the review is complete",
          "Ensure your contact information is up to date",
          "Expected processing time: 24-48 hours"
        ]
      }
    };
    return config[status] || config.pending;
  };

  const statusConfig = getStatusConfig(status);
  
  const formatEventDetails = (details) => {
    if (!details) return '';
    return `
      <strong>Event Category:</strong> ${details.category || 'N/A'}<br>
      <strong>Event Type:</strong> ${details.type || 'N/A'}<br>
      <strong>Registration Date:</strong> ${details.registrationDate ? new Date(details.registrationDate).toLocaleDateString() : 'N/A'}<br>
      ${details.venue ? `<strong>Venue:</strong> ${details.venue}<br>` : ''}
      ${details.date ? `<strong>Tournament Date:</strong> ${new Date(details.date).toLocaleDateString()}<br>` : ''}
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lions Sports Foundation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .status-card {
            background: ${statusConfig.color}15;
            border: 1px solid ${statusConfig.color}30;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .status-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .status-title {
            font-size: 24px;
            font-weight: 700;
            color: ${statusConfig.color};
            margin-bottom: 12px;
        }
        
        .status-message {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 20px;
        }
        
        .player-greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 24px;
        }
        
        .details-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }
        
        .details-title {
            font-size: 18px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 16px;
        }
        
        .next-steps {
            background: #F0F9FF;
            border: 1px solid #E0F2FE;
            border-radius: 8px;
            padding: 20px;
        }
        
        .next-steps-title {
            font-size: 18px;
            font-weight: 600;
            color: #0369A1;
            margin-bottom: 16px;
        }
        
        .steps-list {
            list-style: none;
            padding: 0;
        }
        
        .step-item {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            color: #374151;
        }
        
        .step-item:before {
            content: "•";
            color: #0369A1;
            font-weight: bold;
            position: absolute;
            left: 8px;
        }
        
        .partner-section {
            background: #FEF3C7;
            border: 1px solid #FCD34D;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        
        .partner-title {
            font-weight: 600;
            color: #92400E;
            margin-bottom: 8px;
        }
        
        .footer {
            background: #1F2937;
            color: #9CA3AF;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        
        .contact-info {
            margin: 20px 0;
        }
        
        .contact-item {
            margin: 8px 0;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            color: #9CA3AF;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .copyright {
            margin-top: 20px;
            font-size: 12px;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .status-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">Lions Sports Foundation</div>
            <div class="tagline">Lions Sivakasi Open</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Status Card -->
            <div class="status-card">
                <div class="status-icon">${statusConfig.icon}</div>
                <h1 class="status-title">${statusConfig.title}</h1>
                <p class="status-message">${statusConfig.message}</p>
            </div>
            
            <!-- Player Greeting -->
            <p class="player-greeting">Dear ${playerName},</p>
            
            <!-- Event Details -->
            <div class="details-card">
                <h2 class="details-title">📋 Registration Details</h2>
                ${formatEventDetails(eventDetails)}
            </div>
            
            <!-- Partner Information (for doubles) -->
            ${partnerName ? `
            <div class="partner-section">
                <div class="partner-title">🤝 Doubles Partner</div>
                <p>Your registered partner: <strong>${partnerName}</strong></p>
                <p style="margin-top: 8px; font-size: 14px; color: #92400E;">
                    Please coordinate with your partner regarding match schedules and team strategy.
                </p>
            </div>
            ` : ''}
            
            <!-- Next Steps -->
            <div class="next-steps">
                <h2 class="next-steps-title">📝 Next Steps</h2>
                <ul class="steps-list">
                    ${statusConfig.nextSteps.map(step => `<li class="step-item">${step}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Additional Information -->
            <div style="margin-top: 24px; padding: 16px; background: #F3F4F6; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #6B7280;">
                    <strong>Note:</strong> This is an automated notification. Please do not reply to this email. 
                    For any queries, contact our support team using the information below.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <strong>Support Team</strong>
                </div>
                <div class="contact-item">Lions Sports Foundation</div>
                <div class="contact-item">Email: lionssivakasiopen@gmail.com</div>
                <div class="contact-item">Phone: +91 1234567890</div>
            </div>
            
            <div class="social-links">
                <a href="#" class="social-link">Website</a> • 
                <a href="#" class="social-link">Facebook</a> • 
                <a href="#" class="social-link">Instagram</a> • 
                <a href="#" class="social-link">Twitter</a>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} Lions Sports Foundation. All rights reserved.<br>
                Developed by Lions Sports Foundation
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Alternative simplified template (plain text version)
export const PlayerEntryStatusTextTemplate = (status, playerName, eventDetails, partnerName = null) => {
  const getStatusConfig = (status) => {
    const config = {
      approved: {
        title: "Tournament Entry Approved",
        message: "Congratulations! Your tournament registration has been approved.",
      },
      rejected: {
        title: "Tournament Entry Rejected", 
        message: "We regret to inform you that your tournament registration could not be approved.",
      },
      pending: {
        title: "Tournament Entry Under Review",
        message: "Your tournament registration is currently under review.",
      }
    };
    return config[status] || config.pending;
  };

  const statusConfig = getStatusConfig(status);
  
  return `
TOURNAMENT ENTRY STATUS UPDATE
===============================

${statusConfig.title}
${statusConfig.message}

Player: ${playerName}
Event: ${eventDetails?.category || 'N/A'} - ${eventDetails?.type || 'N/A'}
Registration Date: ${eventDetails?.registrationDate ? new Date(eventDetails.registrationDate).toLocaleDateString() : 'N/A'}

${partnerName ? `Doubles Partner: ${partnerName}` : ''}

Next Steps:
${status === 'approved' ? 
  '- Arrive 30 minutes before match time\n- Carry original ID proof and TNBA ID\n- Wear proper sports attire\n- Check tournament schedule regularly' :
status === 'rejected' ? 
  '- Verify registration details\n- Check submitted documents\n- Contact organizers for specifics\n- Re-apply for future tournaments' :
  '- Application under processing\n- Wait for completion email\n- Keep contact info updated\n- Expected time: 24-48 hours'}

For queries, contact:
Lions Sports Foundation Team
Lions Sports Foundation
Email: lionssivakasiopen@gmail.com
Phone: +91 1234567890

This is an automated notification. Please do not reply.
  `.trim();
};
*/
// Usage example:
/*
const emailHTML = PlayerEntryStatusTemplate(
  'approved',
  'John Doe',
  {
    category: 'Under 17',
    type: 'doubles', 
    registrationDate: '2024-01-15',
    venue: 'Jawaharlal Nehru Stadium',
    date: '2024-02-01'
  },
  'Jane Smith'
);

const textEmail = PlayerEntryStatusTextTemplate(
  'approved', 
  'John Doe',
  {
    category: 'Under 17',
    type: 'doubles',
    registrationDate: '2024-01-15'
  },
  'Jane Smith'
);
*/


// PlayerEntryStatusTemplate.js

export const PlayerEntryStatusTemplate = (status, playerName, eventDetails, partnerName = null) => {
  const getStatusConfig = (status) => {
    const config = {
      approved: {
        title: "Your Tournament Entry Has Been Approved",
        color: "#10B981",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#10B981">
            <circle cx="12" cy="12" r="10" stroke="#10B981" fill="#ECFDF5"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 13l3 3 7-7"/>
          </svg>`,
        message: "Congratulations! Your tournament registration has been approved by the Lions Sports Foundation Team. Get ready to showcase your skills!",
        nextSteps: [
          "Arrive at the venue 30 minutes before your scheduled match",
          "Carry your original ID and TNBA ID card for verification",
          "Wear proper sports attire as per guidelines",
          "Check the tournament schedule for updates"
        ]
      },
      rejected: {
        title: "Tournament Entry Could Not Be Approved",
        color: "#EF4444",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#EF4444">
            <circle cx="12" cy="12" r="10" stroke="#EF4444" fill="#FEF2F2"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6m0-6l6 6"/>
          </svg>`,
        message: "We regret to inform you that your tournament entry could not be approved at this time. Please review your registration details and documents.",
        nextSteps: [
          "Verify registration details for accuracy",
          "Ensure all required documents were uploaded",
          "Contact the tournament organizers for clarification",
          "You may re-apply for future tournaments"
        ]
      },
      pending: {
        title: "Your Tournament Entry Is Under Review",
        color: "#F59E0B",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#F59E0B">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" fill="#FFFBEB"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3"/>
          </svg>`,
        message: "Your tournament registration is currently being reviewed by the Lions Sports Foundation Team. You’ll receive an update soon.",
        nextSteps: [
          "Our verification team is processing your entry",
          "Keep your contact details up to date",
          "Expected review time: 24–48 hours",
          "You will be notified via email once approved"
        ]
      }
    };
    return config[status] || config.pending;
  };

  const statusConfig = getStatusConfig(status);

  const formatEventDetails = (details) => {
    if (!details) return "";
    return `
      <strong>Event Category:</strong> ${details.category || "N/A"}<br>
      <strong>Event Type:</strong> ${details.type || "N/A"}<br>
      <strong>Registration Date:</strong> ${details.registrationDate ? new Date(details.registrationDate).toLocaleDateString() : "N/A"}<br>
      ${details.venue ? `<strong>Venue:</strong> ${details.venue}<br>` : ""}
      ${details.date ? `<strong>Match Date:</strong> ${new Date(details.date).toLocaleDateString()}<br>` : ""}
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lions Sports Foundation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f4f6f8;
      color: #111827;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      max-width: 640px;
      margin: 20px auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
      color: #fff;
      padding: 36px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
    }
    .header p {
      margin: 6px 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 32px 24px;
    }
    .status-card {
      text-align: center;
      background: ${statusConfig.color}10;
      border: 1px solid ${statusConfig.color}40;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .status-card svg {
      margin-bottom: 12px;
    }
    .status-title {
      font-size: 22px;
      font-weight: 700;
      color: ${statusConfig.color};
      margin-bottom: 10px;
    }
    .status-message {
      font-size: 15px;
      color: #374151;
    }
    .details-section {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 18px;
      margin: 28px 0;
    }
    .details-section h3 {
      margin-top: 0;
      color: #1F2937;
      font-weight: 600;
      font-size: 18px;
    }
    .partner-box {
      background: #FFF7ED;
      border: 1px solid #FDBA74;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .partner-box h4 {
      color: #92400E;
      margin: 0 0 6px;
    }
    .next-steps {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .next-steps h3 {
      margin-top: 0;
      color: #1D4ED8;
    }
    .next-steps ul {
      padding-left: 20px;
      margin: 12px 0;
      color: #374151;
    }
    .footer {
      background: #111827;
      color: #9CA3AF;
      padding: 32px 24px;
      text-align: center;
      font-size: 14px;
    }
    .footer a {
      color: #60A5FA;
      text-decoration: none;
      margin: 0 8px;
    }
    .footer p {
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Lions Sports Foundation</h1>
      <p>Lions Sivakasi Open Tournament</p>
    </div>

    <div class="content">
      <div class="status-card">
        ${statusConfig.icon}
        <div class="status-title">${statusConfig.title}</div>
        <p class="status-message">${statusConfig.message}</p>
      </div>

      <p style="font-size:16px;font-weight:600;">Dear ${playerName},</p>

      <div class="details-section">
        <h3>Registration Details</h3>
        ${formatEventDetails(eventDetails)}
      </div>

      ${partnerName ? `
      <div class="partner-box">
        <h4>Doubles Partner</h4>
        <p><strong>${partnerName}</strong></p>
        <p style="font-size:14px;">Coordinate with your partner regarding schedules and preparation.</p>
      </div>` : ""}

      <div class="next-steps">
        <h3>Next Steps</h3>
        <ul>
          ${statusConfig.nextSteps.map(step => `<li>${step}</li>`).join("")}
        </ul>
      </div>

      <p style="font-size:13px;color:#6B7280;margin-top:24px;">
        <strong>Note:</strong> This is an automated notification. Please do not reply directly to this email.  
        For support, contact the Lions Sports Foundation Team.
      </p>
    </div>

    <div class="footer">
      <p><strong>Lions Sports Foundation Team</strong></p>
      <p>Email: <a href="mailto:lionssivakasiopen@gmail.com">lionssivakasiopen@gmail.com</a> • Phone: +91 1234567890</p>
      <p>
        <a href="#">Website</a> •
        <a href="#">Facebook</a> •
        <a href="#">Instagram</a> •
        <a href="#">Twitter</a>
      </p>
      <p style="font-size:12px;margin-top:12px;">© ${new Date().getFullYear()} Lions Sports Foundation. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Plain-text fallback
export const PlayerEntryStatusTextTemplate = (status, playerName, eventDetails, partnerName = null) => {
  const config = {
    approved: {
      title: "Tournament Entry Approved",
      message: "Congratulations! Your registration has been approved by the Lions Sports Foundation Team."
    },
    rejected: {
      title: "Tournament Entry Rejected",
      message: "We regret to inform you that your entry was not approved. Please contact the organizers for clarification."
    },
    pending: {
      title: "Tournament Entry Under Review",
      message: "Your tournament registration is currently being reviewed by the Lions Sports Foundation Team."
    }
  };
  const s = config[status] || config.pending;

  return `
${s.title}
==============================

${s.message}

Player: ${playerName}
Event: ${eventDetails?.category || "N/A"} - ${eventDetails?.type || "N/A"}
Registration Date: ${eventDetails?.registrationDate ? new Date(eventDetails.registrationDate).toLocaleDateString() : "N/A"}
${partnerName ? `Doubles Partner: ${partnerName}` : ""}

For assistance, contact the Lions Sports Foundation Team:
Email: lionssivakasiopen@gmail.com
Phone: +91 9360933755

Please do not reply to this automated email.
  `.trim();
};
