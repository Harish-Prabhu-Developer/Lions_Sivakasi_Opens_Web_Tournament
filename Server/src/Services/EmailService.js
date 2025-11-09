// Services/EmailService.js
import nodemailer from "nodemailer";
import { WelcomeTemplate } from "../Utils/Template/WelcomeTemplate.js";
import { ForgetPassTemplate } from "../Utils/Template/ForgetPassTemplate.js";
import dotenv from "dotenv";
import { PlayerEntryStatusTemplate, PlayerEntryStatusTextTemplate } from "../Utils/Template/PlayerEntryStatusTemplate.js";
import { AdminEntryRegisterTemplate, AdminEntryRegisterTextTemplate } from "../Utils/Template/AdminEntryRegisterTemplate.js";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Port 587 uses STARTTLS, so secure is false
  requireTLS: true, // Enforce STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // This MUST be an App Password
  },
  // You can remove the timeouts; the defaults are usually fine
  // connectionTimeout: 15000, 
  // greetingTimeout: 5000, 
  // socketTimeout: 5000
});

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const message = {
    from: `"Lions Sports Foundation Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Welcome to Our Tournament!",
    html: WelcomeTemplate(name),
  };

  await transporter.sendMail(message);
};

// Send Forget Password Email with generated password
export const sendForgetPasswordEmail = async (email, name, generatedPassword) => {
  const message = {
    from: `"Lions Sports Foundation Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your New Password for Tournament Platform",
    html: ForgetPassTemplate(name, generatedPassword),
  };

  await transporter.sendMail(message);
};

// Existing Reset OTP Email method
export const sendResetOTPEmail = async (email, otp, name) => {
  const message = {
    from: `"Lions Sports Foundation Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Password Reset OTP",
    html: `
      <p>Hi ${name || "User"},</p>
      <p>Your password reset OTP is <b>${otp}</b>.</p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br />
      <p>— Team Support</p>
    `,
  };

  await transporter.sendMail(message);
};



// Send Player Entry Status Email
export const sendPlayerEntryStatusEmail = async (playerData, status) => {
  try {
    const {
      email,
      name: playerName,
      eventDetails,
      partnerName = null
    } = playerData;

    if (!email) {
      throw new Error("Player email is required");
    }

    if (!playerName) {
      throw new Error("Player name is required");
    }

    // Validate status
    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Get status-specific subject
    const getStatusSubject = (status) => {
      const subjects = {
        approved: "🎉 Your Tournament Entry Has Been Approved!",
        rejected: "❌ Tournament Entry Status Update",
        pending: "⏳ Tournament Entry Under Review"
      };
      return subjects[status] || "Tournament Entry Status Update";
    };

    const message = {
      from: `"Lions Sports Foundation Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: getStatusSubject(status),
      html: PlayerEntryStatusTemplate(status, playerName, eventDetails, partnerName),
      text: PlayerEntryStatusTextTemplate(status, playerName, eventDetails, partnerName), // Plain text fallback
    };

    const result = await transporter.sendMail(message);
    console.log(`✅ Entry status email (${status}) sent to ${email}`);
    
    // Log for monitoring
    console.log(`📧 Status Email Sent:`, {
      player: playerName,
      email: email,
      status: status,
      event: eventDetails?.category,
      type: eventDetails?.type,
      messageId: result.messageId
    });
    
    return result;
  } catch (error) {
    console.error(`❌ Failed to send entry status email to ${playerData.email}:`, error);
    throw error;
  }
};

// Bulk send entry status emails (for multiple players)
export const sendBulkEntryStatusEmails = async (playersData, status) => {
  try {
    const results = [];
    const errors = [];

    for (const playerData of playersData) {
      try {
        const result = await sendPlayerEntryStatusEmail(playerData, status);
        results.push({
          player: playerData.name,
          email: playerData.email,
          success: true,
          messageId: result.messageId
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors.push({
          player: playerData.name,
          email: playerData.email,
          error: error.message,
          success: false
        });
      }
    }

    console.log(`📊 Bulk email sending completed:`, {
      total: playersData.length,
      successful: results.length,
      failed: errors.length
    });

    return {
      success: true,
      results,
      errors,
      summary: {
        total: playersData.length,
        successful: results.length,
        failed: errors.length
      }
    };
  } catch (error) {
    console.error(`❌ Bulk email sending failed:`, error);
    throw error;
  }
};

// Test email service connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email server connection verified");
    return { success: true, message: "Email server connection verified" };
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return { success: false, message: error.message };
  }
};


// Send Player Entry Registration Confirmation Email
export const sendPlayerEntryRegistrationEmail = async (playerData, eventDetails, paymentDetails, paymentProofBase64 = null) => {
  try {
    const {
      email,
      name: playerName
    } = playerData;

    if (!email) {
      throw new Error("Player email is required");
    }

    if (!playerName) {
      throw new Error("Player name is required");
    }

    // Prepare message with base64 image as attachment if provided
    const message = {
      from: `"Lions Sports Foundation Team" <${process.env.SMTP_USER}>`,
      to: [email,process.env.SMTP_USER],
      subject: "🎾 Tournament Entry Registration Confirmed",
      html: AdminEntryRegisterTemplate(playerName, eventDetails, paymentDetails, !!paymentProofBase64),
      text: AdminEntryRegisterTextTemplate(playerName, eventDetails, paymentDetails),
    };

    // If base64 image is provided, attach it to the email
    if (paymentProofBase64) {
      // Extract MIME type and data from base64 string
      const matches = paymentProofBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const imageBuffer = Buffer.from(matches[2], 'base64');
        
        message.attachments = [
          {
            filename: `payment-proof-${Date.now()}.${mimeType.split('/')[1] || 'png'}`,
            content: imageBuffer,
            contentType: mimeType,
            cid: 'paymentProofImage' // same cid value as in the html img src
          }
        ];
      } else {
        console.warn('⚠️ Invalid base64 image format, skipping attachment');
      }
    }

    const result = await transporter.sendMail(message);
    console.log(`✅ Entry registration confirmation email sent to ${email}`);
    
    // Log for monitoring
    console.log(`📧 Registration Email Sent:`, {
      player: playerName,
      email: email,
      events: eventDetails.length,
      amount: paymentDetails.amount,
      hasPaymentProof: !!paymentProofBase64,
      messageId: result.messageId
    });
    
    return result;
  } catch (error) {
    console.error(`❌ Failed to send registration confirmation email to ${playerData.email}:`, error);
    throw error;
  }
};