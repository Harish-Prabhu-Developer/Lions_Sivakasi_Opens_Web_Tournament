// Utils/Template/AdminEntryRegisterTemplate.js
export const AdminEntryRegisterTemplate = (playerName, eventDetails, paymentDetails, hasPaymentProof = false) => {
  const formatEventType = (type) => {
    const typeMap = {
      'singles': 'Singles',
      'doubles': 'Doubles', 
      'mixed doubles': 'Mixed Doubles'
    };
    return typeMap[type] || type;
  };

  const formatCategory = (category) => {
    return category.replace('Under', 'U');
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tournament Entry Confirmation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #0d162a 0%, #16213C 100%);
            padding: 30px;
            text-align: center;
            border-bottom: 3px solid #06b6d4;
        }
        
        .header h1 {
            color: #06b6d4;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #e2e8f0;
            font-size: 16px;
        }
        
        .content {
            padding: 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 20px;
        }
        
        .section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #06b6d4;
        }
        
        .section-title {
            color: #0f172a;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .event-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        
        .event-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .event-category {
            font-weight: bold;
            color: #06b6d4;
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .event-type {
            color: #64748b;
            font-size: 14px;
        }
        
        .payment-details {
            background: #f0fdfa;
            border-left-color: #10b981;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-label {
            color: #64748b;
            font-weight: 500;
        }
        
        .detail-value {
            color: #1e293b;
            font-weight: 600;
        }
        
        .payment-proof {
            text-align: center;
            margin-top: 20px;
        }
        
        .proof-image {
            max-width: 300px;
            max-height: 400px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            object-fit: contain;
        }
        
        .proof-placeholder {
            background: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            color: #64748b;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }
        
        .footer {
            background: #0d162a;
            padding: 20px;
            text-align: center;
            color: #e2e8f0;
            font-size: 14px;
        }
        
        .footer a {
            color: #06b6d4;
            text-decoration: none;
        }
        
        .note {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
            color: #9a3412;
        }
        
        @media (max-width: 600px) {
            .event-grid {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 20px;
            }
            
            .proof-image {
                max-width: 250px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎾 Tournament Entry Confirmation</h1>
            <p>Lions Sports Foundation</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello <strong>${playerName}</strong>,
            </div>
            
            <p>Your tournament entry has been successfully registered and payment has been received. Here are your entry details:</p>
            
            <div class="section">
                <div class="section-title">
                    📋 Registered Events
                </div>
                <div class="event-grid">
                    ${eventDetails.map(event => `
                    <div class="event-card">
                        <div class="event-category">${formatCategory(event.category)}</div>
                        <div class="event-type">${formatEventType(event.type)}</div>
                        ${event.partnerName ? `<div style="margin-top: 8px; font-size: 12px; color: #475569;">Partner: ${event.partnerName}</div>` : ''}
                        <div style="margin-top: 8px; font-size: 12px; color: #475569;">
                            Status: <span class="status-badge status-paid">Registered</span>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section payment-details">
                <div class="section-title">
                    💳 Payment Information
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value">
                        ${paymentDetails.status} 
                        <span class="status-badge status-paid">${paymentDetails.status}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value">₹${paymentDetails.amount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${paymentDetails.paymentApp || 'UPI'}</span>
                </div>
                ${paymentDetails.senderUpiId && paymentDetails.senderUpiId !== 'N/A' ? `
                <div class="detail-row">
                    <span class="detail-label">Sender UPI ID:</span>
                    <span class="detail-value">${paymentDetails.senderUpiId}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Transaction Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                    })}</span>
                </div>
            </div>
            
            ${hasPaymentProof ? `
            <div class="section">
                <div class="section-title">
                    📄 Payment Proof
                </div>
                <div class="payment-proof">
                    <img src="cid:paymentProofImage" alt="Payment Proof" class="proof-image" />
                    <p style="margin-top: 10px; color: #64748b; font-size: 14px;">
                        Your payment proof has been successfully uploaded and verified.
                    </p>
                </div>
            </div>
            ` : `
            <div class="section">
                <div class="section-title">
                    📄 Payment Proof
                </div>
                <div class="payment-proof">
                    <div class="proof-placeholder">
                        <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
                        <p>Payment proof uploaded and stored securely</p>
                        <p style="font-size: 12px; margin-top: 5px;">(Available in your payment records)</p>
                    </div>
                </div>
            </div>
            `}
            
            <div class="note">
                <strong>Important:</strong> Your entries are now under review. You will receive another email once your registration is approved by the tournament committee. Please keep this confirmation for your records.
            </div>
        </div>
        
        <div class="footer">
            <p>For any queries, contact us at <a href="mailto:support@lionsfoundation.com">support@lionsfoundation.com</a></p>
            <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} Lions Sports Foundation. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// Plain text version remains the same
export const AdminEntryRegisterTextTemplate = (playerName, eventDetails, paymentDetails) => {
  let text = `TOURNAMENT ENTRY CONFIRMATION\n\n`;
  text += `Hello ${playerName},\n\n`;
  text += `Your tournament entry has been successfully registered and payment has been received.\n\n`;
  
  text += `REGISTERED EVENTS:\n`;
  eventDetails.forEach((event, index) => {
    text += `${index + 1}. ${event.category} - ${event.type}`;
    if (event.partnerName) {
      text += ` (Partner: ${event.partnerName})`;
    }
    text += `\n`;
  });
  
  text += `\nPAYMENT INFORMATION:\n`;
  text += `Status: ${paymentDetails.status}\n`;
  text += `Amount: ₹${paymentDetails.amount}\n`;
  text += `Payment Method: ${paymentDetails.paymentApp || 'UPI'}\n`;
  if (paymentDetails.senderUpiId && paymentDetails.senderUpiId !== 'N/A') {
    text += `Sender UPI ID: ${paymentDetails.senderUpiId}\n`;
  }
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  
  text += `\nYour entries are now under review. You will receive another email once your registration is approved.\n\n`;
  text += `For queries: lionssivakasiopen@gmail.com\n`;
  text += ` Contact: +91 9360933755\n\n`;
  text += `Lions Sports Foundation`;
  
  return text;
};