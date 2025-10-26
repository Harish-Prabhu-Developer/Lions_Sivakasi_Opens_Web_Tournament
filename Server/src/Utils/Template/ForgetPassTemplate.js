export const ForgetPassTemplate = (name, password) => `
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Successful</title>
    <style>
      /* ====== GLOBAL STYLES ====== */
      body {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #f8f9fb, #eef2f7);
        color: #333;
      }
      .wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
      }

      /* ====== CONTAINER ====== */
      .container {
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        max-width: 600px;
        width: 100%;
        padding: 40px 32px;
        animation: fadeIn 0.6s ease;
      }

      /* ====== HEADER ====== */
      .header {
        text-align: center;
        margin-bottom: 24px;
      }
      .logo {
        width: 70px;
        height: 70px;
        object-fit: contain;
      }
      h2 {
        color: #e11d48;
        margin-top: 12px;
        margin-bottom: 8px;
        font-size: 26px;
      }
      .subtitle {
        color: #666;
        font-size: 15px;
      }

      /* ====== PASSWORD BOX ====== */
      .password-box {
        margin: 28px 0;
        padding: 18px;
        background-color: #f9fafc;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-align: center;
        position: relative;
      }
      .toggle-btn {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #2563eb;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
      }

      /* ====== BUTTON ====== */
      .button {
        display: inline-block;
        text-decoration: none;
        background: linear-gradient(135deg, #e11d48, #f43f5e);
        color: #fff;
        padding: 14px 28px;
        border-radius: 6px;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        transition: 0.3s ease;
      }
      .button:hover {
        background: linear-gradient(135deg, #be123c, #e11d48);
      }

      /* ====== FOOTER ====== */
      .footer {
        margin-top: 40px;
        font-size: 14px;
        color: #777;
        text-align: center;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }

      /* ====== ANIMATIONS ====== */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ====== RESPONSIVE ====== */
      @media (max-width: 600px) {
        .container {
          padding: 24px 18px;
        }
        h2 {
          font-size: 22px;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <img src="https://cdn-icons-png.flaticon.com/512/942/942751.png" alt="Logo" class="logo" />
          <h2>Password Reset Successful</h2>
          <p class="subtitle">Your new credentials are ready to use.</p>
        </div>

        <p>Hi <strong>${name || "Player"}</strong>,</p>
        <p>Your password has been successfully reset. Below is your new login password:</p>

        <div class="password-box">
          <span id="passwordValue">${password}</span>
          <button class="toggle-btn" onclick="togglePassword()">HIDE</button>
        </div>

        <p>Please log in using the password above and change it immediately for security reasons.</p>

        <div style="text-align:center; margin-top:30px;">
          <a href="https://lionsivakasiopen.netlify.app/" class="button">Login Now</a>
        </div>

        <div class="footer">
          <p>If you did not request this change, please contact our support immediately.</p>
          <p>— The Tournament Team</p>
        </div>
      </div>
    </div>

    <script>
      function togglePassword() {
        const passwordText = document.getElementById('passwordValue');
        const btn = document.querySelector('.toggle-btn');
        if (passwordText.textContent.includes('*')) {
          passwordText.textContent = '${password}';
          btn.textContent = 'HIDE';
        } else {
          passwordText.textContent = '*'.repeat(${password.length});
          btn.textContent = 'SHOW';
        }
      }
    </script>
  </body>
</html>
`;
