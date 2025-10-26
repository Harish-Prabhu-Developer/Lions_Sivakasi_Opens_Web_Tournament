import nodemailer from "nodemailer";
import { WelcomeTemplate } from "../Utils/Template/WelcomeTemplate.js";
import { ForgetPassTemplate } from "../Utils/Template/ForgetPassTemplate.js";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const message = {
    from: `"Tournament Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Welcome to Our Tournament!",
    html: WelcomeTemplate(name),
  };

  await transporter.sendMail(message);
};

// Send Forget Password Email with generated password
export const sendForgetPasswordEmail = async (email, name, generatedPassword) => {
  const message = {
    from: `"Tournament Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your New Password for Tournament Platform",
    html: ForgetPassTemplate(name, generatedPassword),
  };

  await transporter.sendMail(message);
};

// Existing Reset OTP Email method
export const sendResetOTPEmail = async (email, otp, name) => {
  const message = {
    from: `"Support Team" <${process.env.SMTP_USER}>`,
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
