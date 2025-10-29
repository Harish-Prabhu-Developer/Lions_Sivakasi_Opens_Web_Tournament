import { ImagePlus, X, CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PiFileImageBold } from "react-icons/pi";
import Tesseract from "tesseract.js";
import { paymentApps } from "../../utils/Payment";

const UploadScreenShot = ({ expectedAmount, expectedUPI, setStep }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      validatePaymentScreenshot(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validatePaymentScreenshot = async (imageData) => {
    setValidationStatus("validating");
    setValidationMessage("Analyzing payment screenshot...");
    setProgress(0);

    try {
      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text;
      const extractedTextLower = extractedText.toLowerCase();

      const paymentApp = detectPaymentApp(extractedTextLower);
      const isPaymentScreenshot = validatePaymentKeywords(extractedTextLower);

      if (!isPaymentScreenshot) {
        setValidationStatus("error");
        setValidationMessage(
          "This does not appear to be a payment screenshot. Please upload valid proof of payment."
        );
        return;
      }

      const extractedAmount = extractAmount(extractedText);
      const { senderUPI, receiverUPI } = extractUPIIds(extractedText, extractedTextLower);

      if (expectedAmount && extractedAmount) {
        const amountDifference = Math.abs(extractedAmount - expectedAmount);
        if (amountDifference > 1) {
          setValidationStatus("error");
          setValidationMessage(
            `Amount mismatch! Expected ₹${expectedAmount}, found ₹${extractedAmount}`
          );
          setExtractedData({ amount: extractedAmount, senderUPI, receiverUPI, app: paymentApp });
          return;
        }
      }

      if (expectedUPI && receiverUPI && !receiverUPI.toLowerCase().includes(expectedUPI.toLowerCase())) {
        setValidationStatus("error");
        setValidationMessage(`Receiver UPI ID mismatch! Expected ${expectedUPI}, found ${receiverUPI}`);
        setExtractedData({ amount: extractedAmount, senderUPI, receiverUPI, app: paymentApp });
        return;
      }

      setValidationStatus("success");
      const appName = paymentApp ? `${paymentApp} ` : "";
      setValidationMessage(`${appName}Payment verified successfully!`);
      setExtractedData({ amount: extractedAmount, senderUPI, receiverUPI, app: paymentApp });
    } catch (error) {
      console.error("OCR Error:", error);
      setValidationStatus("error");
      setValidationMessage("Failed to analyze screenshot. Please try again with a clearer image.");
    }
  };

  const detectPaymentApp = (text) => {
    for (const app of paymentApps) {
      if (app.keywords.some((keyword) => text.includes(keyword))) return app.name;
    }
    return null;
  };

  const validatePaymentKeywords = (text) => {
    const keywords = ["paid", "payment", "success", "completed", "transaction", "upi", "transfer"];
    return keywords.some((keyword) => text.includes(keyword));
  };

  const extractAmount = (text) => {
    const patterns = [
      /₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /amount[:\s]+₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return parseFloat(match[1].replace(/,/g, ""));
    }
    return null;
  };

  const extractUPIIds = (text, textLower) => {
    const upiPattern = /[\w.-]+@[\w.-]+/g;
    const allUPIs = text.match(upiPattern) || [];
    let senderUPI = null, receiverUPI = null;

    const senderKeywords = ["from", "paid by", "sender"];
    const receiverKeywords = ["to", "paid to", "receiver"];
    const lines = text.split('\n');

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const upisInLine = line.match(upiPattern);
      if (upisInLine) {
        if (senderKeywords.some(kw => lineLower.includes(kw))) senderUPI = senderUPI || upisInLine[0];
        if (receiverKeywords.some(kw => lineLower.includes(kw))) receiverUPI = receiverUPI || upisInLine[0];
      }
    }

    if (allUPIs.length >= 2 && (!senderUPI || !receiverUPI)) {
      senderUPI = senderUPI || allUPIs[0];
      receiverUPI = receiverUPI || allUPIs[1];
    } else if (allUPIs.length === 1) {
      receiverUPI = allUPIs[0];
    }

    return { senderUPI, receiverUPI };
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setValidationStatus(null);
    setValidationMessage("");
    setExtractedData(null);
    setProgress(0);
  };

  const handleUpload = () => {
    setUploadProgress(true);
      // ✅ Log Base64 data of the uploaded image
  console.log("🖼️ Uploaded Image Base64 Data:", preview);
    toast.success("Screenshot uploaded successfully!");
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Card */}
      <div className="w-full p-4 md:p-6 bg-gradient-to-br from-[#0f1729]/95 via-[#121a2f]/90 to-[#0a1220]/95 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-cyan-700/30">
          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-xl shadow-lg flex-shrink-0">
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
            className="group relative border-2 border-dashed border-cyan-500 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-950/10 to-blue-950/10 hover:from-cyan-950/20 hover:to-blue-950/20 p-8 md:p-10 flex flex-col items-center gap-3 md:gap-4 cursor-pointer transition-all duration-300 rounded-xl"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-all" />
              <div className="relative bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 md:p-5 rounded-2xl border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
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
                PNG, JPG or JPEG • Max 5MB
              </p>
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {/* Preview */}
            <div className="relative border-2 border-cyan-500/30 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/50 to-cyan-950/30 p-3 md:p-4 shadow-xl">
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 md:top-3 md:right-3 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-xl transition-all z-10 shadow-lg hover:scale-110"
                title="Remove file"
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
                  <div className="flex-shrink-0 mt-0.5">
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
                      className={`text-sm md:text-base font-semibold break-words ${
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
                            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-cyan-400/50"
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
                            <span className="w-2 h-2 bg-cyan-400 rounded-full mt-1 flex-shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 break-words">
                              <span className="font-semibold">Payment App:</span> {extractedData.app}
                            </span>
                          </div>
                        )}
                        {extractedData.amount && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full mt-1 flex-shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 break-words">
                              <span className="font-semibold">Amount:</span> ₹{extractedData.amount}
                            </span>
                          </div>
                        )}
                        {extractedData.senderUPI && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-1 flex-shrink-0" />
                            <span className="text-xs md:text-sm text-cyan-200 break-all">
                              <span className="font-semibold">Sender:</span> {extractedData.senderUPI}
                            </span>
                          </div>
                        )}
                        {extractedData.receiverUPI && (
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-1 flex-shrink-0" />
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
              <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="font-medium truncate max-w-full">{selectedFile?.name}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 md:mt-6 flex gap-6 md:gap-3 justify-center">
          <button
            type="button"
            onClick={handleRemoveFile}
            className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base bg-gray-700/40 hover:bg-gray-600/50 border border-gray-500/40 hover:border-gray-400/50 active:scale-95 transition-all text-gray-300 hover:text-white rounded-xl font-semibold shadow-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || validationStatus !== "success"}
            className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all text-white rounded-xl font-bold shadow-xl shadow-cyan-500/30 disabled:shadow-none"
          >
            {validationStatus === "validating" ? "Verifying..." : "Confirm Upload"}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 md:gap-4 pt-2">
        <button onClick={() => setStep(2)} className="btn btn-secondary">
          Back
        </button>
        <button
          disabled={!selectedFile || validationStatus !== "success" || !uploadProgress}
          onClick={() => {
            toast.success("Entry Successfully Submitted!", { duration: 3000 });
          }}
          className="btn btn-primary"
        >
          Submit Entry
        </button>
      </div>
    </div>
  );
};

export default UploadScreenShot;
