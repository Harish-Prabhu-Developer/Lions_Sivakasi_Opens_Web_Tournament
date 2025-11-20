// EmailTemplates/AdminAcademyEventsNotify.js
export const AdminAcademyEventsNotify = (paymentData, academyData, playerData, entryData) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Academy Payment Notification</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-title i {
            color: #667eea;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #718096;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #2d3748;
        }
        
        .events-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .events-table th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
            font-weight: 600;
        }
        
        .events-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        
        .events-table tr:nth-child(even) {
            background: #f7fafc;
        }
        
        .amount-highlight {
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        
        .amount-number {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .amount-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .payment-details {
            background: #fffaf0;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .payment-proof-section {
            background: #f0f9ff;
            border: 1px solid #7dd3fc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .proof-image-container {
            text-align: center;
            margin: 15px 0;
        }
        
        .proof-image {
            max-width: 100%;
            max-height: 400px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .proof-caption {
            font-size: 12px;
            color: #718096;
            margin-top: 8px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-paid {
            background: #c6f6d5;
            color: #276749;
        }
        
        .footer {
            background: #2d3748;
            color: #cbd5e0;
            padding: 25px;
            text-align: center;
        }
        
        .footer-links {
            margin-top: 15px;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .urgent-notice {
            background: #fed7d7;
            border: 1px solid #feb2b2;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .action-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        
        .download-button {
            display: inline-block;
            background: #38a169;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .no-proof {
            text-align: center;
            padding: 30px;
            color: #718096;
            background: #f7fafc;
            border-radius: 8px;
            border: 2px dashed #cbd5e0;
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 20px;
            }
            
            .proof-image {
                max-height: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎾 New Academy Payment</h1>
            <p>Payment received for player events registration</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Urgent Notice -->
            <div class="urgent-notice">
                <strong>⚠️ ACTION REQUIRED:</strong> Please verify this payment and approve the events registration.
            </div>
            
            <!-- Amount Highlight -->
            <div class="amount-highlight">
                <div class="amount-number">₹${paymentData?.paymentAmount || paymentData?.ActualAmount || 0}</div>
                <div class="amount-label">Total Payment Received</div>
            </div>
            
            <!-- Academy Information -->
            <div class="section">
                <div class="section-title">
                    <i>🏢</i> Academy Details
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Academy Name</span>
                        <span class="info-value">${academyData?.academyName || academyData?.name || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Contact Email</span>
                        <span class="info-value">${academyData?.email || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Location</span>
                        <span class="info-value">${academyData?.place || 'N/A'}, ${academyData?.district || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Date</span>
                        <span class="info-value">${new Date().toLocaleDateString('en-IN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                </div>
            </div>
            
            <!-- Player Information -->
            <div class="section">
                <div class="section-title">
                    <i>👤</i> Player Details
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Player Name</span>
                        <span class="info-value">${playerData?.fullName || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">TNBA ID</span>
                        <span class="info-value">${playerData?.tnbaId || 'Not Assigned'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date of Birth</span>
                        <span class="info-value">${playerData?.dob || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Gender</span>
                        <span class="info-value">${playerData?.gender ? playerData.gender.charAt(0).toUpperCase() + playerData.gender.slice(1) : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Events Information -->
            <div class="section">
                <div class="section-title">
                    <i>🏆</i> Registered Events (${paymentData?.paidEvents?.length || 0})
                </div>
                <table class="events-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Event Type</th>
                            <th>Fee</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentData?.paidEvents?.map(event => `
                            <tr>
                                <td>${event.category || 'N/A'}</td>
                                <td>${event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'N/A'}</td>
                                <td>₹${event.amount || (event.type === 'singles' ? 900 : 1300)}</td>
                                <td>
                                    <span class="status-badge status-paid">Paid</span>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="text-align: center;">No events found</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <!-- Payment Details -->
            <div class="payment-details">
                <div class="section-title">
                    <i>💳</i> Payment Verification Details
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Payment Method</span>
                        <span class="info-value">${paymentData?.metadata?.paymentApp || 'UPI Payment'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Sender UPI</span>
                        <span class="info-value">${paymentData?.metadata?.senderUpiId || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Receiver UPI</span>
                        <span class="info-value">${paymentData?.metadata?.receiverUpiId || paymentData?.expertedData?.receiverUpiId || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">OCR Verified</span>
                        <span class="info-value">${paymentData?.metadata?.ocrVerified ? '✅ Yes' : '❌ No'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Payment Proof Section -->
            <div class="payment-proof-section">
                <div class="section-title">
                    <i>📸</i> Payment Proof Screenshot
                </div>
                <div>
                <img 
                src="${paymentData?.paymentProof?.paymentProof}" 
                alt="Payment Proof Screenshot" 
                class="payment-proof-image"
                onerror="handleImageError(this)"
                />

                </div>
                ${getPaymentProofHTML(paymentData, playerData)}
            </div>
            
            <!-- Summary -->
            <div class="section">
                <div class="section-title">
                    <i>📊</i> Payment Summary
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Events Paid</span>
                        <span class="info-value">${paymentData?.paidEvents?.length || 0}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Amount</span>
                        <span class="info-value">₹${paymentData?.paymentAmount || paymentData?.ActualAmount || 0}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Status</span>
                        <span class="status-badge status-paid">${paymentData?.status || 'Paid'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Transaction ID</span>
                        <span class="info-value">${paymentData?._id ? paymentData._id.toString().substring(0, 8).toUpperCase() : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>© ${new Date().getFullYear()} Tamil Nadu Badminton Association. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>

    <script>
        // Handle image loading errors
        function handleImageError(img) {
            img.style.display = 'none';
            const errorDiv = document.getElementById('proof-error');
            if (errorDiv) errorDiv.style.display = 'block';
        }
    </script>
</body>
</html>
`;

// Helper function to generate payment proof HTML
function getPaymentProofHTML(paymentData, playerData) {
    // Extract the ONLY correct payment proof URL
    const paymentProof = paymentData?.paymentProof?.paymentProof || null;

    if (paymentProof) {
        return `
            <div class="proof-image-container">
                <img 
                    src="${paymentProof}" 
                    alt="Payment Screenshot Proof" 
                    class="proof-image"
                    onerror="handleImageError(this)"
                >
                <div id="proof-error" style="display: none; color: #e53e3e; text-align: center; padding: 20px;">
                    <p>⚠️ Payment proof image could not be loaded</p>
                    <p>The image may be too large or the link may be expired.</p>
                </div>
                <div class="proof-caption">
                    Payment screenshot submitted by academy
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${paymentProof}" 
                   download="payment-proof-${playerData?.fullName?.replace(/\s+/g, '-') || 'player'}-${new Date().getTime()}.jpg" 
                   class="download-button">
                    📥 Download Proof
                </a>
            </div>
            
            <div class="info-grid" style="margin-top: 15px;">
                <div class="info-item">
                    <span class="info-label">Actual Amount Paid</span>
                    <span class="info-value">₹${paymentData?.paymentProof?.ActualAmount || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Expected Amount</span>
                    <span class="info-value">₹${paymentData?.paymentProof?.expertedData?.paymentAmount || 'N/A'}</span>
                </div>
            </div>
        `;
    }

    // When payment proof is missing
    return `
        <div class="no-proof">
            <p style="font-size: 16px; margin-bottom: 10px;">📷 No payment proof screenshot available</p>
            <p style="font-size: 14px; color: #a0aec0;">The academy did not upload a payment screenshot or the proof is not accessible.</p>
        </div>
    `;
}
