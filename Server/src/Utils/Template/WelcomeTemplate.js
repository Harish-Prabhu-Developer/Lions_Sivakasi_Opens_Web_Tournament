// Template/WelcomeTemplate.js
export const WelcomeTemplate = (name) => `
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 24px;
        font-size: 16px;
        color: #333;
        background-color: #f4f6f8;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 0 15px rgba(0,0,0,0.1);
        padding: 30px;
      }
      h2 {
        color: #2b6cb0;
        margin-bottom: 16px;
        font-size: 24px;
      }
      p {
        line-height: 1.6;
      }
      a.button {
        display: inline-block;
        background-color: #2b6cb0;
        color: white;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 6px;
        margin-top: 20px;
        font-weight: bold;
      }
      .footer {
        margin-top: 40px;
        font-size: 14px;
        color: #555;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Welcome to Our Tournament!</h2>
      <p>Hi ${name || 'Player'},</p>
      <p>Thank you for joining our Tournament platform. We're excited to have you on board!</p>
      <p>You can now participate in upcoming tournaments, track your progress, and compete with players worldwide.</p>
      <a href="https://lionssportsfoundation.org/register" class="button">Login to Your Account</a>
      <p class="footer">If you have any questions, feel free to reply to this email or contact our support team.</p>
      <p class="footer">— The Tournament Team</p>
    </div>
  </body>
</html>
`;
