import { ImagePlus, X, CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PiFileImageBold } from "react-icons/pi";
import Tesseract from "tesseract.js";
import { paymentApps } from "../../../utils/Payment";
import { useDispatch } from "react-redux";
import { addToAcademyEventPayment } from "../../../redux/Slices/EntriesSlice";

const UploadScreenShot = ({ 
  expectedAmount, 
  expectedUPI, 
  playerId,
  EntryId,
  onBack, 
  selectedEvents,
  unpaidEventsCount,
  paidEventsCount,
  totalEventsCount,
  onSubmitSuccess 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    setSelectedFile(file);
    setValidationStatus("validating");
    setValidationMessage("Processing image...");
    setProgress(0);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      setPreview(imageData);
      validatePaymentScreenshot(imageData);
    };
    reader.readAsDataURL(file);
  };

  const validatePaymentScreenshot = async (imageData) => {
    try {
      setProgress(10);

      // Preprocess image for better OCR
      const processedImageData = await preprocessImage(imageData);
      setProgress(30);

      const result = await Tesseract.recognize(processedImageData, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            const newProgress = 30 + Math.round(m.progress * 60);
            setProgress(newProgress);
          }
        }
      });

      setProgress(95);

      const extractedText = result.data.text;
      console.log("📄 Extracted Text:", extractedText);

      const extractedTextLower = extractedText.toLowerCase();

      const paymentApp = detectPaymentApp(extractedTextLower);
      const isPaymentScreenshot = validatePaymentKeywords(extractedTextLower);

      if (!isPaymentScreenshot) {
        setValidationStatus("error");
        setValidationMessage(
          "This doesn't appear to be a payment screenshot. Please upload a valid UPI payment confirmation."
        );
        setIsProcessing(false);
        return;
      }

      const extractedAmount = extractAmount(extractedText);
      const { senderUPI, receiverUPI } = extractUPIIds(extractedText, extractedTextLower);

      console.log("🔍 Extracted Data:", {
        amount: extractedAmount,
        senderUPI,
        receiverUPI,
        app: paymentApp
      });

      // Validate amount
      if (expectedAmount && extractedAmount) {
        const amountDifference = Math.abs(extractedAmount - expectedAmount);
        if (amountDifference > 1) {
          setValidationStatus("error");
          setValidationMessage(
            `Amount mismatch! Expected ₹${expectedAmount}, found ₹${extractedAmount}`
          );
          setExtractedData({ amount: extractedAmount, senderUPI, receiverUPI, app: paymentApp });
          setProgress(100);
          setIsProcessing(false);
          return;
        }
      } else if (expectedAmount && !extractedAmount) {
        setValidationStatus("error");
        setValidationMessage("Could not detect payment amount in the screenshot");
        setExtractedData({ amount: null, senderUPI, receiverUPI, app: paymentApp });
        setProgress(100);
        setIsProcessing(false);
        return;
      }

      // Validate UPI - More flexible matching
      if (expectedUPI) {
        const normalizedExpectedUPI = expectedUPI.toLowerCase().trim();
        const normalizedSenderUPI = senderUPI?.toLowerCase().trim();
        const normalizedReceiverUPI = receiverUPI?.toLowerCase().trim();

        // Check if expected UPI matches either sender or receiver (partial match)
        const upiMatches = 
          (normalizedSenderUPI && normalizedSenderUPI.includes(normalizedExpectedUPI)) ||
          (normalizedReceiverUPI && normalizedReceiverUPI.includes(normalizedExpectedUPI)) ||
          (normalizedExpectedUPI && (
            extractedTextLower.includes(normalizedExpectedUPI) ||
            extractedText.includes(expectedUPI)
          ));

        if (!upiMatches) {
          setValidationStatus("error");
          setValidationMessage(
            `UPI ID not found! Expected ${expectedUPI} in transaction details.`
          );
          setExtractedData({ amount: extractedAmount, senderUPI, receiverUPI, app: paymentApp });
          setProgress(100);
          setIsProcessing(false);
          return;
        }
      }

      setValidationStatus("success");
      const appName = paymentApp ? `${paymentApp} ` : "";
      setValidationMessage(`${appName}Payment verified successfully!`);
      setExtractedData({ 
        amount: extractedAmount, 
        senderUPI, 
        receiverUPI, 
        app: paymentApp,
        rawText: extractedText 
      });
      setProgress(100);
      setIsProcessing(false);

    } catch (error) {
      console.error("❌ OCR Error:", error);
      setValidationStatus("error");
      setValidationMessage("Failed to analyze screenshot. Please try a clearer image.");
      setProgress(100);
      setIsProcessing(false);
    }
  };

  // Enhanced image preprocessing
  const preprocessImage = (imageData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Increase resolution for better OCR
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw image with higher resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Enhanced contrast and brightness adjustment
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          const factor = 1.8;
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
          
          // Increase brightness slightly
          data[i] = Math.min(255, data[i] + 10);
          data[i + 1] = Math.min(255, data[i + 1] + 10);
          data[i + 2] = Math.min(255, data[i + 2] + 10);
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageData;
    });
  };

  const detectPaymentApp = (text) => {
    for (const app of paymentApps) {
      if (app.keywords.some((keyword) => text.includes(keyword))) {
        return app.name;
      }
    }
    
    // Additional app detection based on your samples
    if (text.includes('google pay') || text.includes('g pay')) return 'Google Pay';
    if (text.includes('phonepe')) return 'PhonePe';
    if (text.includes('paytm')) return 'Paytm';
    
    return "Unknown";
  };

  const validatePaymentKeywords = (text) => {
    const paymentKeywords = [
      "paid", "payment", "success", "completed", "transaction", 
      "upi", "transfer", "sent", "received", "amount", "₹", "rs",
      "debited", "credited", "bank", "payment to", "paid to", "to:",
      "from:", "transaction id", "completed", "received from"
    ];
    
    const foundKeywords = paymentKeywords.filter(keyword => text.includes(keyword));
    return foundKeywords.length >= 2; // Reduced threshold for better detection
  };

  // Enhanced amount extraction with character correction
  const extractAmount = (text) => {
    console.log("💰 Amount Extraction Text:", text);

    // Character correction mapping for common OCR errors
    const charCorrections = {
      'b': '6', 'B': '8', 'O': '0', 'o': '0', 
      'l': '1', 'I': '1', 'i': '1', 'Z': '2',
      'S': '5', 's': '5', 'e': '8', 'E': '8',
      'A': '4', 'a': '4', 'T': '7', 't': '7',
      'G': '6', 'g': '9', 'Q': '0', 'D': '0'
    };

    // Preprocess text to correct common OCR errors
    let correctedText = text;
    Object.keys(charCorrections).forEach(wrongChar => {
      const regex = new RegExp(wrongChar, 'g');
      correctedText = correctedText.replace(regex, charCorrections[wrongChar]);
    });

    console.log("🔧 Corrected Text:", correctedText);

    // Pattern 1: Look for amount patterns with common OCR error corrections
    const amountPatterns = [
      // Pattern for "1 b4 3 O O eee" → "1 6 4 3 0 0 8 8 8" → extract reasonable parts
      /([1-9][0-9]{2,4})(?:\s*[.,]\s*[0-9]{2})?/, // 3-5 digit numbers that could be amounts
      
      // Currency symbol patterns
      /[₹$€£]\s*([0-9,]+(?:\.[0-9]{2})?)/,
      /(?:rs|inr|amount|paid|total)[:\s-]*[₹$€£]?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      
      // Standalone amount patterns
      /(\d{2,5})\s*(?:₹|rs|inr|\/-)/i,
      
      // Common payment amount ranges
      /(\b[1-9]\d{2,3}\b)/, // 100-9999
    ];

    // First, try to extract from corrected text
    for (const pattern of amountPatterns) {
      const matches = correctedText.match(pattern);
      if (matches && matches[1]) {
        let amountStr = matches[1].replace(/,/g, "");
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount >= 10 && amount <= 50000) {
          console.log("✅ Amount found with corrected pattern:", amount);
          return amount;
        }
      }
    }

    // Special handling for "1 b4 3 O O eee" type patterns
    const complexPatterns = [
      // Handle sequences like "1 b4 3 O O" → look for number sequences
      /([1-9]\s*[0-9bBoO]\s*[0-9]\s*[0-9Oo]\s*[0-9Oo])/,
      /(\d\s*[bB6]\s*\d\s*[Oo0]\s*[Oo0])/,
    ];

    for (const pattern of complexPatterns) {
      const matches = text.match(pattern);
      if (matches && matches[1]) {
        // Convert the matched pattern to numbers
        let potentialAmount = matches[1]
          .replace(/\s+/g, '') // Remove spaces
          .replace(/b/gi, '6')
          .replace(/o/gi, '0')
          .replace(/e/gi, '8')
          .replace(/l/gi, '1')
          .replace(/i/gi, '1');
        
        const amount = parseInt(potentialAmount, 10);
        if (!isNaN(amount) && amount >= 100 && amount <= 50000) {
          console.log("✅ Amount found from complex pattern:", amount);
          return amount;
        }
      }
    }

    // Look for number clusters that could represent amounts
    const numberClusters = correctedText.match(/\b\d{3,5}\b/g);
    if (numberClusters) {
      for (const cluster of numberClusters) {
        const amount = parseInt(cluster, 10);
        // Common payment amounts in your system
        const commonAmounts = [70, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1300, 1500, 2000, 2500, 3000];
        if (!isNaN(amount) && (commonAmounts.includes(amount) || (amount >= 50 && amount <= 5000))) {
          console.log("✅ Amount found from number cluster:", amount);
          return amount;
        }
      }
    }

    // Context-based amount extraction
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Look for amount context in surrounding lines
      if (line.includes('amount') || line.includes('paid') || line.includes('total') || 
          line.includes('₹') || line.includes('rs') || line.includes('inr')) {
        
        // Check current line for numbers
        const currentLineNumbers = lines[i].match(/\d+/g);
        if (currentLineNumbers) {
          for (const numStr of currentLineNumbers) {
            const amount = parseInt(numStr, 10);
            if (!isNaN(amount) && amount >= 10 && amount <= 50000) {
              console.log("✅ Amount found from context line:", amount);
              return amount;
            }
          }
        }
        
        // Check next line for numbers
        if (i < lines.length - 1) {
          const nextLineNumbers = lines[i + 1].match(/\d+/g);
          if (nextLineNumbers) {
            for (const numStr of nextLineNumbers) {
              const amount = parseInt(numStr, 10);
              if (!isNaN(amount) && amount >= 10 && amount <= 50000) {
                console.log("✅ Amount found from next line context:", amount);
                return amount;
              }
            }
          }
        }
      }
    }

    // Final fallback: extract all numbers and find the most likely amount
    const allNumbers = correctedText.match(/\d+/g);
    if (allNumbers) {
      const potentialAmounts = allNumbers
        .map(num => parseInt(num, 10))
        .filter(amount => !isNaN(amount) && amount >= 10 && amount <= 50000);
      
      if (potentialAmounts.length > 0) {
        // Prefer amounts that are common payment values
        const commonAmounts = [70, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1300, 1500, 2000, 2500, 3000];
        const commonMatch = potentialAmounts.find(amount => commonAmounts.includes(amount));
        if (commonMatch) {
          console.log("✅ Amount found from common amounts:", commonMatch);
          return commonMatch;
        }
        
        // Otherwise return the largest reasonable number
        const maxAmount = Math.max(...potentialAmounts);
        console.log("✅ Amount found as largest number:", maxAmount);
        return maxAmount;
      }
    }

    console.log("❌ No reasonable amount found in text");
    return null;
  };

  // Enhanced UPI extraction with better filtering
  const extractUPIIds = (text, textLower) => {
    console.log("🔍 UPI Extraction Text:", text);

    // More comprehensive UPI patterns with better filtering
    const upiPatterns = [
      /[\w.\-+]+@(ok\w+|axl|paytm|ybl|ibl|sbi|iob|okaxis|oksbi|okicici|okhdfc|upi)/gi, // Specific providers first
      /to:\s*([\w.\-+]+@[\w.\-]+)/gi,
      /from:\s*([\w.\-+]+@[\w.\-]+)/gi,
      /credited to\s*([\w.\-+]+@[\w.\-]+)/gi,
      /[\w.\-+]+@[\w.\-]+/g, // General pattern last
    ];

    let allUPIs = [];
    for (const pattern of upiPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        matches.forEach(match => {
          const upi = match[1] || match[0];
          // Better validation for UPI IDs
          if (upi && upi.includes('@') && 
              !upi.includes('@@') && 
              upi.length >= 8 && 
              upi.length <= 40 &&
              !upi.match(/[<>{}[\]\\]/)) { // Exclude invalid characters
            allUPIs.push(upi);
          }
        });
      }
    }

    // Remove duplicates and sort by specificity (provider-specific first)
    allUPIs = [...new Set(allUPIs)];
    console.log("🔍 All detected UPIs:", allUPIs);

    let senderUPI = null;
    let receiverUPI = null;

    // Enhanced context-based identification
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase();

      // Skip lines that are clearly not UPI context
      if (lineLower.includes('transaction id') || 
          lineLower.includes('utr') || 
          lineLower.includes('date') ||
          line.match(/^\d+$/)) {
        continue;
      }

      const upisInLine = line.match(/[\w.\-+]+@[\w.\-]+/g) || [];

      if (upisInLine.length > 0) {
        const upi = upisInLine[0];

        // Strong sender indicators
        const strongSenderIndicators = [
          'from:', 'sent from', 'paid by', 'debited from', 'sender:'
        ];

        // Strong receiver indicators  
        const strongReceiverIndicators = [
          'to:', 'paid to', 'credited to', 'receiver:', 'beneficiary:'
        ];

        const isStrongSender = strongSenderIndicators.some(ind => lineLower.includes(ind));
        const isStrongReceiver = strongReceiverIndicators.some(ind => lineLower.includes(ind));

        if (isStrongSender && !senderUPI) {
          senderUPI = upi;
          console.log("✅ Strong sender UPI:", senderUPI);
        } else if (isStrongReceiver && !receiverUPI) {
          receiverUPI = upi;
          console.log("✅ Strong receiver UPI:", receiverUPI);
        }

        // Check surrounding context for weaker indicators
        if (!isStrongSender && !isStrongReceiver) {
          const prevLine = i > 0 ? lines[i - 1].toLowerCase() : '';
          const nextLine = i < lines.length - 1 ? lines[i + 1].toLowerCase() : '';

          const hasSenderContext = strongSenderIndicators.some(ind => 
            prevLine.includes(ind) || nextLine.includes(ind));
          
          const hasReceiverContext = strongReceiverIndicators.some(ind => 
            prevLine.includes(ind) || nextLine.includes(ind));

          if (hasSenderContext && !senderUPI) {
            senderUPI = upi;
            console.log("✅ Context sender UPI:", senderUPI);
          } else if (hasReceiverContext && !receiverUPI) {
            receiverUPI = upi;
            console.log("✅ Context receiver UPI:", receiverUPI);
          }
        }
      }
    }

    // Smart assignment for remaining UPIs
    const unassignedUPIs = allUPIs.filter(upi => upi !== senderUPI && upi !== receiverUPI);
    
    if (unassignedUPIs.length === 1) {
      if (!senderUPI && !receiverUPI) {
        // Single UPI - use transaction context
        if (textLower.includes('sent') || textLower.includes('from') || textLower.includes('debited')) {
          senderUPI = unassignedUPIs[0];
        } else {
          receiverUPI = unassignedUPIs[0];
        }
      } else if (senderUPI && !receiverUPI) {
        receiverUPI = unassignedUPIs[0];
      } else if (!senderUPI && receiverUPI) {
        senderUPI = unassignedUPIs[0];
      }
    } else if (unassignedUPIs.length >= 2) {
      // Assign based on typical payment flow
      if (!senderUPI && !receiverUPI) {
        senderUPI = unassignedUPIs[0];
        receiverUPI = unassignedUPIs[1];
      }
    }

    console.log("🎯 Final UPI Assignment:", { senderUPI, receiverUPI });
    return { senderUPI, receiverUPI };
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setValidationStatus(null);
    setValidationMessage("");
    setExtractedData(null);
    setProgress(0);
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    if (!preview) {
      toast.error("Please upload a screenshot first.");
      return;
    }

    if (!selectedFile || validationStatus !== "success") {
      toast.error("Please upload a valid payment screenshot.");
      return;
    }

    if (!selectedEvents || selectedEvents.length === 0) {
      toast.error("No unpaid events found to link payment!");
      return;
    }

    setIsSubmitting(true);

    try {
      const paidEventsData = selectedEvents.map(event => ({
        category: event.category,
        type: event.type
      }));

      const paymentData = {
        paymentProof: preview,
        ActualAmount: expectedAmount,
        expertedData: {
          paymentAmount: expectedAmount,
          receiverUpiId: expectedUPI
        },
        metadata: {
          paymentApp: extractedData.app,
          paymentAmount: extractedData.amount,
          senderUpiId: extractedData.senderUPI,
          receiverUpiId: extractedData.receiverUPI,
          eventsCount: unpaidEventsCount,
          totalEventsCount: totalEventsCount,
          ocrVerified: true
        },
        paidEvents: paidEventsData
      };

      console.log("💰 Final Payment Data:", paymentData);
      
      await dispatch(addToAcademyEventPayment({
        playerID: playerId, 
        entryID: EntryId, 
        paymentData: paymentData
      }));
      
      if (onSubmitSuccess) {
        await onSubmitSuccess(paymentData);
      } else {
        toast.success(`Payment verified for ${unpaidEventsCount} event${unpaidEventsCount !== 1 ? 's' : ''}!`);
      }

    } catch (err) {
      console.error("❌ Payment Error:", err);
      toast.error(err.message || "Error submitting payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Card */}
      <div className="w-full p-4 md:p-6 bg-linear-to-br from-[#0f1729]/95 via-[#121a2f]/90 to-[#0a1220]/95 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-cyan-700/30">
          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-xl shadow-lg shrink-0">
            <PiFileImageBold className="w-6 h-6 md:w-7 md:h-7 text-cyan-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl lg:text-2xl text-cyan-200 font-bold truncate">
              Payment Screenshot Verification
            </h2>
            <p className="text-xs md:text-sm text-cyan-300/90 mt-0.5 md:mt-1">
              Upload your payment screenshot for verification
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <label
            htmlFor="fileInput"
            className="group relative border-2 border-dashed border-cyan-500 hover:border-cyan-400/60 bg-linear-to-br from-cyan-950/10 to-blue-950/10 hover:from-cyan-950/20 hover:to-blue-950/20 p-8 md:p-10 flex flex-col items-center gap-3 md:gap-4 cursor-pointer transition-all duration-300 rounded-xl"
            style={{ pointerEvents: isProcessing ? 'none' : 'auto', opacity: isProcessing ? 0.7 : 1 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-all" />
              <div className="relative bg-linear-to-br from-cyan-500/20 to-blue-500/20 p-4 md:p-5 rounded-2xl border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
                <ImagePlus className="w-8 h-8 md:w-10 md:h-10 text-cyan-300" />
              </div>
            </div>
            <div className="text-center space-y-1.5 md:space-y-2">
              <p className="text-cyan-200 font-semibold text-base md:text-lg">
                Drop your screenshot here
              </p>
              <p className="text-cyan-300 text-xs md:text-sm">
                or{" "}
                <span className="text-cyan-400 font-semibold underline">
                  click to browse
                </span>
              </p>
              <p className="text-cyan-400 text-xs mt-1.5 md:mt-2">
                PNG, JPG, JPEG, WEBP • Max 5MB
              </p>
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {/* Preview */}
            <div className="relative border-2 border-cyan-500/30 rounded-2xl overflow-hidden bg-linear-to-br from-slate-900/50 to-cyan-950/30 p-3 md:p-4 shadow-xl">
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 md:top-3 md:right-3 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-xl transition-all z-10 shadow-lg hover:scale-110"
                title="Remove file"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <img
                src={preview}
                alt="Payment Screenshot"
                className="w-full h-auto max-h-64 md:max-h-72 object-contain rounded-xl"
              />
            </div>

            {/* Validation Status */}
            {validationStatus && (
              <div
                className={`p-3 md:p-4 rounded-xl border shadow-lg ${
                  validationStatus === "success"
                    ? "bg-green-500/10 border-green-500/40"
                    : validationStatus === "error"
                    ? "bg-red-500/10 border-red-500/40"
                    : "bg-yellow-500/10 border-yellow-500/40"
                }`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="shrink-0 mt-0.5">
                    {validationStatus === "success" && (
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                    )}
                    {validationStatus === "error" && (
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                    )}
                    {validationStatus === "validating" && (
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                    <p
                      className={`text-sm md:text-base font-semibold wrap-break-word ${
                        validationStatus === "success"
                          ? "text-green-300"
                          : validationStatus === "error"
                          ? "text-red-300"
                          : "text-yellow-300"
                      }`}
                    >
                      {validationMessage}
                    </p>

                    {validationStatus === "validating" && (
                      <div className="space-y-1.5 md:space-y-2">
                        <div className="w-full bg-cyan-900/40 rounded-full h-2 md:h-2.5 overflow-hidden">
                          <div
                            className="bg-linear-to-r from-cyan-400 to-blue-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-cyan-400/50"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs md:text-sm text-cyan-300 font-medium">
                          {progress}% completed
                        </p>
                      </div>
                    )}

                    {extractedData && (
                      <div className="bg-cyan-950/30 border border-cyan-600/30 rounded-lg p-3 md:p-4 space-y-2 md:space-y-2.5">
                        <p className="text-xs md:text-sm font-bold text-cyan-200 mb-1 md:mb-2">
                          Extracted Information:
                        </p>
                        {extractedData.app && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full mt-1 shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 wrap-break-word">
                              <span className="font-semibold">Payment App:</span> {extractedData.app}
                            </span>
                          </div>
                        )}
                        {extractedData.amount && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full mt-1 shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 wrap-break-word">
                              <span className="font-semibold">Amount:</span> ₹{extractedData.amount}
                            </span>
                          </div>
                        )}
                        {extractedData.senderUPI && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-1 shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 break-all">
                              <span className="font-semibold">Sender:</span> {extractedData.senderUPI}
                            </span>
                          </div>
                        )}
                        {extractedData.receiverUPI && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-1 shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 break-all">
                              <span className="font-semibold">Receiver:</span> {extractedData.receiverUPI}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Filename */}
            <div className="flex items-center justify-center gap-2 text-cyan-300/80 text-xs md:text-sm">
              <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              <span className="font-medium truncate max-w-full">{selectedFile?.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 md:gap-4 pt-2">
        <button 
          onClick={onBack} 
          className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          disabled={isSubmitting || isProcessing}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isProcessing || !preview || validationStatus !== "success"}
          className="px-6 py-2 bg-linear-to-r from-cyan-500 to-cyan-400 hover:scale-105 text-white font-semibold rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Entry"
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadScreenShot;