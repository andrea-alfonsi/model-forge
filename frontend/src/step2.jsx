import { useState, useMemo } from "react";

/**
 * Simulates sending a dataset file to the server for validation.
 * Takes 2 seconds and randomly returns valid/invalid status.
 * @param {File} file
 * @returns {Promise<{valid: boolean, message: string}>}
 */
const mockValidateDataset = (file) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!file) {
        resolve({ valid: false, message: "No file provided." });
        return;
      }
      const isValid = Math.random() > 0.3; // 70% chance of being valid
      if (isValid) {
        resolve({ valid: true, message: `Dataset "${file.name}" is valid for training.` });
      } else {
        resolve({ valid: true, message: `File format or structure invalid. Needs CSV with specific columns.` });
      }
    }, 2000); // 2 second delay
  });
};

const UploadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export default ({ formData, updateFormData, nextStep, prevStep }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const acceptsTypes = ".csv,.json,.xlsx";

  // Check if step can proceed
  const canProceed = formData.datasetFile && formData.datasetValidationStatus === 'valid';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      updateFormData({ datasetFile: file, datasetValidationStatus: 'validating' });
      setIsProcessing(true);

      const result = await mockValidateDataset(file);

      if (result.valid) {
        updateFormData({ datasetValidationStatus: 'valid', datasetValidationMessage: result.message });
      } else {
        updateFormData({ datasetValidationStatus: 'invalid', datasetValidationMessage: result.message });
      }
      setIsProcessing(false);
    }
  };

  const statusText = useMemo(() => {
    switch (formData.datasetValidationStatus) {
      case 'validating': return 'Validating dataset structure...';
      case 'valid': return formData.datasetValidationMessage;
      case 'invalid': return `Validation failed: ${formData.datasetValidationMessage || 'Unknown error.'}`;
      default: return 'Please upload a dataset file (e.g., CSV, JSON).';
    }
  }, [formData.datasetValidationStatus, formData.datasetValidationMessage]);

  const statusColor = useMemo(() => {
    switch (formData.datasetValidationStatus) {
      case 'validating': return 'text-yellow-600';
      case 'valid': return 'text-green-600';
      case 'invalid': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }, [formData.datasetValidationStatus]);


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">2. Upload Dataset</h2>
      <p className="text-gray-600 mb-6">Select your prepared dataset file for {formData.taskType}. We'll run a quick server-side validation.</p>

      <div className="flex flex-col space-y-4">
        {/* Upload Box */}
        <label
          htmlFor="file-upload"
          className={`relative flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-xl cursor-pointer transition duration-300
                      ${isProcessing ? 'border-gray-300 bg-gray-50 animate-pulse' :
              formData.datasetValidationStatus === 'valid' ? 'border-green-300 bg-green-50 hover:bg-green-100' :
                'border-blue-300 bg-blue-50 hover:bg-blue-100'
            }`}
        >
          <UploadIcon className={`w-8 h-8 ${isProcessing ? 'text-gray-500' : 'text-blue-600'}`} />
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {isProcessing ? 'Processing...' : 'Click to upload or drag and drop'}
          </p>
          {formData.datasetFile && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: <span className="font-medium text-blue-600">{formData.datasetFile.name}</span>
            </p>
          )}
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isProcessing} accept={acceptsTypes} multiple />
        </label>

        {/* Status Message */}
        <div className={`p-3 rounded-lg font-medium text-sm ${statusColor} ${formData.datasetValidationStatus !== 'pending' ? 'bg-opacity-20' : ''}`}>
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{statusText}</span>
            </div>
          ) : (
            statusText
          )}
        </div>

        {/* Future Import Option Placeholder */}
        <div className="text-center text-sm text-gray-400 border-t pt-4 mt-4">
          <span className="font-semibold">Future Feature:</span> Import directly from database connection.
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition"
        >
          &larr; Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-full font-semibold transition ${canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-300 text-white cursor-not-allowed'
            }`}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};
