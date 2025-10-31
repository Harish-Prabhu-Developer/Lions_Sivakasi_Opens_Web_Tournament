import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { tournamentData } from "../../constants";

const PaymentStep = ({ selectedEvents, player, partners, upi, upiQrUrl, onBack, onSubmit }) => {
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'pending', 'verified', 'failed'

  const totalFee = useMemo(() => {
    return selectedEvents.reduce((acc, event) => {
      const feeKey = event.type === 'Singles' ? 'singles' : 'doubles';
      return acc + tournamentData.entryFees[feeKey];
    }, 0);
  }, [selectedEvents]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshot(file);
      setVerificationStatus(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setPaymentScreenshot(file);
      setVerificationStatus(null);
    }
  };

  const handleConfirmUpload = () => {
    if (!paymentScreenshot) return;

    setIsUploading(true);
    setVerificationStatus('pending');

    // Mock API call simulation
    setTimeout(() => {
      setIsUploading(false);
      // Mock verification logic
      const isVerified = Math.random() > 0.3; // 70% chance of success
      setVerificationStatus(isVerified ? 'verified' : 'failed');
      
      if (isVerified) {
        toast.success("Payment screenshot verified successfully!");
      } else {
        toast.error("Verification failed. Please upload a valid payment proof.");
      }
    }, 3000);
  };

  const VerificationMessage = () => {
    if (verificationStatus === 'pending') {
      return (
        <div className="flex items-center text-cyan-300">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p>Analyzing payment screenshot...</p>
        </div>
      );
    }
    if (verificationStatus === 'verified') {
      return (
        <div className="bg-green-600/30 p-3 rounded-lg text-green-300 flex items-start gap-3 border border-green-500">
          <Check className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Google Pay Payment verified successfully!</p>
            <p className='text-sm mt-1'>Extracted information: [Mock Data]</p>
          </div>
        </div>
      );
    }
    if (verificationStatus === 'failed') {
      return (
        <div className="bg-red-600/30 p-3 rounded-lg text-red-300 flex items-start gap-3 border border-red-500">
          <span className='text-xl'>!</span>
          <p className="font-semibold">This does not appear to be a payment screenshot. Please upload valid proof of payment.</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8">
      <div className="bg-[#0d162a] p-6 rounded-xl border border-cyan-400/20">
        <h3 className="text-xl font-bold text-cyan-300 mb-6 text-center">Summary & Payment</h3>

        {/* Registration Summary */}
        <div className="mb-8 border border-gray-700 p-4 rounded-lg bg-[#192339]">
          <p className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-3">₹ Registration Summary</p>
          <ul className="list-disc ml-5 text-gray-300 space-y-1 text-sm">
            {selectedEvents.map((event, index) => {
              const partnerKey = `${event.category}|${event.type}`;
              const partnerData = partners[partnerKey];
              const isDoubles = event.type.includes('Doubles');
              
              return (
                <li key={index} className='text-yellow-300'>
                  **{event.category.replace('Boys & Girls', '').trim()} {event.type.toLowerCase()}**
                  {isDoubles && partnerData && (
                    <span className='ml-2 text-gray-400'>
                        (Partner: {partnerData.fullName || 'Data Missing'})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 pt-3 border-t border-gray-700 text-xl font-bold text-yellow-300 flex justify-between">
            <span>Total Entry Fee:</span> <span>₹{totalFee}</span>
          </p>
          <p className='text-sm text-gray-400 mt-2'>Player: {player.fullName || 'N/A'}</p>
        </div>

        {/* Payment Details */}
        <div className="border border-gray-700 p-4 rounded-lg bg-[#192339] text-center">
          <p className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-3">Payment Details</p>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400">UPI ID</p>
            <p className="text-lg font-mono text-green-400 mb-4">{upi}</p>
            <img src={upiQrUrl} alt="UPI QR Code" className="w-32 h-32 rounded-lg shadow-lg" />
            <a 
                href={`upi://pay?pa=${upi}&pn=Tournament%20Fees&am=${totalFee}&cu=INR`} 
                className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
            >
                Pay via UPI
            </a>
          </div>
        </div>
      </div>

      {/* Screenshot Upload Verification */}
      <div className="bg-[#0d162a] p-6 rounded-xl border border-cyan-400/20">
        <p className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-3">Payment Screenshot Verification</p>
        <div 
          className="p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-cyan-400 transition-colors duration-200"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileUpload').click()}
        >
          <input 
            type="file" 
            id="fileUpload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          {!paymentScreenshot ? (
            <div className='flex flex-col items-center text-gray-400'>
                <svg className="w-10 h-10 mb-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4.975V15a4 4 0 01-4 4H8a4 4 0 01-4-4v-1"/></svg>
                <p>Drop your screenshot here or click to browse</p>
                <p className="text-xs mt-1">(PNG, JPG, or JPEG)</p>
            </div>
          ) : (
            <div className='text-cyan-400'>File Selected: <span className='font-mono text-sm'>{paymentScreenshot.name}</span></div>
          )}
        </div>
        
        {/* <div className='mt-4'>
            <VerificationMessage />
        </div> */}

        <div className="flex justify-end gap-3 mt-4">
          <button 
            type='button'
            onClick={() => setPaymentScreenshot(null)}
            className="px-6 py-2 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            type='button'
            onClick={handleConfirmUpload}
            disabled={!paymentScreenshot || isUploading || verificationStatus === 'verified'}
            className={`px-6 py-2 font-semibold rounded-lg transition-all ${!paymentScreenshot || isUploading || verificationStatus === 'verified' ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600'}`}
          >
            {isUploading ? 'Uploading...' : 'Confirm Upload'}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={verificationStatus !== 'verified'}
          className={`px-8 py-2 font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto ${
            verificationStatus === 'verified'
              ? "bg-gradient-to-r from-green-500 to-green-400 hover:scale-105"
              : "bg-gray-600 cursor-not-allowed opacity-70"
          }`}
        >
          Submit Entry
        </button>
      </div>
    </div>
  );
};
export default PaymentStep;