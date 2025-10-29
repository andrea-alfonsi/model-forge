import React, { useState, useMemo, useEffect, useCallback } from 'react';

// --- TASK STRUCTURE DEFINITION ---
// Grouped list of all supported machine learning tasks
const groupedTasks = {
  'Multimodal': [
    'Audio-Text-to-Text',
    'Image-Text-to-Text',
    'Visual Question Answering',
    'Document Question Answering',
    'Video-Text-to-Text',
    'Visual Document Retrieval',
    'Any-to-Any',
  ],
  'Computer Vision': [
    'Depth Estimation',
    'Image Classification',
    'Object Detection',
    'Image Segmentation',
    'Text-to-Image',
    'Image-to-Text',
    'Image-to-Image',
    'Image-to-Video',
    'Unconditional Image Generation',
    'Video Classification',
    'Text-to-Video',
    'Zero-Shot Image Classification',
    'Mask Generation',
    'Zero-Shot Object Detection',
    'Text-to-3D',
    'Image-to-3D',
    'Image Feature Extraction',
    'Keypoint Detection',
    'Video-to-Video',
  ],
  'Natural Language Processing': [
    'Text Classification',
    'Token Classification',
    'Table Question Answering',
    'Question Answering',
    'Zero-Shot Classification',
    'Translation',
    'Summarization',
    'Feature Extraction',
    'Text Generation',
    'Fill-Mask',
    'Sentence Similarity',
    'Text Ranking',
  ],
  'Audio': [
    'Text-to-Speech',
    'Text-to-Audio',
    'Automatic Speech Recognition',
    'Audio-to-Audio',
    'Audio Classification',
    'Voice Activity Detection',
  ],
  'Tabular': [
    'Tabular Classification',
    'Tabular Regression',
    'Time Series Forecasting',
  ],
  'Reinforcement Learning': [
    'Reinforcement Learning',
    'Robotics',
  ],
  'Other': [
    'Graph Machine Learning',
  ],
};


// --- MOCK API FUNCTIONS (Simulate Server Interaction) ---

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
        resolve({ valid: false, message: `File format or structure invalid. Needs CSV with specific columns.` });
      }
    }, 2000); // 2 second delay
  });
};

/**
 * Simulates fetching available models based on the task type.
 * Takes 1.5 seconds.
 * NOTE: Mapping the new, specific tasks back to mock model sets.
 * @param {string} taskType
 * @returns {Promise<string[]>}
 */
const mockFetchModels = (taskType) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let models = [];
      const classificationTasks = [
        'Image Classification', 'Text Classification', 'Tabular Classification', 'Zero-Shot Classification', 'Audio Classification', 'Video Classification'
      ];
      const regressionTasks = [
        'Tabular Regression', 'Depth Estimation', 'Time Series Forecasting'
      ];

      if (classificationTasks.includes(taskType)) {
        models = ['RandomForestClassifier', 'LogisticRegression', 'NeuralNetwork_A'];
      } else if (regressionTasks.includes(taskType)) {
        models = ['LinearRegression', 'SVR', 'NeuralNetwork_B'];
      } else if (taskType === 'Object Detection') {
        models = ['YOLOv8', 'Faster R-CNN'];
      } else {
        // Default for all other task types (e.g., generation, summarization)
        models = ['SpecializedTransformer', 'OpenSourceBaseModel'];
      }

      resolve(models);
    }, 1500); // 1.5 second delay
  });
};

/**
 * Simulates fetching the best default training options based on the selected model.
 * Takes 1 second.
 * @param {string} modelName
 * @returns {Promise<{epochs: number, learningRate: number, batchSize: number}>}
 */
const mockFetchBestOptions = (modelName) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let options = { epochs: 10, learningRate: 0.01, batchSize: 32 };
      if (modelName.includes('NeuralNetwork') || modelName.includes('Transformer')) {
        options = { epochs: 50, learningRate: 0.001, batchSize: 64 };
      }
      resolve(options);
    }, 1000); // 1 second delay
  });
};


// --- UI COMPONENTS ---

// Simple SVG Checkmark icon
const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// Simple SVG Upload icon
const UploadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

// Simple SVG Chevron Down icon
const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// --- STEP COMPONENTS ---

const Step1Task = ({ formData, updateFormData, nextStep }) => {
  // State to control which group's sub-tasks are currently visible
  const [expandedGroup, setExpandedGroup] = useState(null);

  const handleSelect = (task) => {
    // task here is the final sub-task name (e.g., 'Image Classification')
    // Reset subsequent steps' data when a new task is selected
    updateFormData({ 
      taskType: task, 
      selectedModel: '', 
      availableModels: [], 
      datasetFile: null,
      datasetValidationStatus: 'pending',
      trainingOptions: {} 
    });
    nextStep();
  };
  
  const toggleGroup = (groupName) => {
    setExpandedGroup(prev => prev === groupName ? null : groupName);
  };

  const calculateMaxHeight = (tasks) => {
    // Estimate max-height for smooth transition based on number of sub-tasks
    return `${tasks.length * 48 + 20}px`;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">1. Select Machine Learning Task</h2>
      <p className="text-gray-600 mb-6">Choose the domain and specific task you are trying to solve.</p>
      
      <div className="space-y-4">
        {Object.entries(groupedTasks).map(([group, tasks]) => {
          const isExpanded = expandedGroup === group;
          // Check if the current form data task belongs to this group for highlighting
          const isSelected = tasks.includes(formData.taskType);

          return (
            <div key={group} className={`border rounded-xl shadow-md overflow-hidden transition duration-300 ${isExpanded ? 'border-blue-400 shadow-xl' : 'border-gray-200'}`}>
              
              {/* Group Header - Clickable */}
              <button
                onClick={() => toggleGroup(group)}
                className={`w-full flex justify-between items-center p-4 font-bold text-left transition duration-300 
                  ${isExpanded ? 'bg-blue-600 text-white' : isSelected ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              >
                {group}
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180 text-white' : isSelected ? 'text-blue-700' : 'text-gray-500'}`} />
              </button>

              {/* Sub-Tasks - Conditionally Visible */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden`}
                style={{ maxHeight: isExpanded ? calculateMaxHeight(tasks) : '0px' }}
              >
                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  {tasks.map(task => (
                    <button
                      key={task}
                      onClick={() => handleSelect(task)}
                      className={`w-full p-2 text-left text-sm rounded-lg transition duration-200 mt-1 flex items-center justify-between
                        ${formData.taskType === task
                          ? 'bg-blue-200 text-blue-800 font-semibold ring-2 ring-blue-500'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {task}
                      {formData.taskType === task && <CheckIcon className="w-4 h-4 text-blue-800" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* No 'Next' button needed as selection auto-advances */}
    </div>
  );
};

const Step2Data = ({ formData, updateFormData, nextStep, prevStep }) => {
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

const Step3Model = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [isLoading, setIsLoading] = useState(false);

  const taskType = formData.taskType;
  const models = formData.availableModels;
  const selectedModel = formData.selectedModel;

  // Effect to fetch models when the taskType changes or component mounts
  useEffect(() => {
    const loadModels = async () => {
      // Only fetch if task is set, models are not loaded, and we are on this step
      if (!taskType || models.length > 0) return; 

      setIsLoading(true);
      updateFormData({ availableModels: [] });
      const fetchedModels = await mockFetchModels(taskType);
      updateFormData({ availableModels: fetchedModels });
      setIsLoading(false);
    };
    loadModels();
  }, [taskType]); // Dependency: taskType

  const handleSelect = (model) => {
    updateFormData({ selectedModel: model });
    // Don't auto-proceed, let user click Next
  };

  const canProceed = !!selectedModel;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">3. Select Model</h2>
      <p className="text-gray-600 mb-6">Available models for {taskType} task:</p>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-blue-500">Fetching available models...</span>
        </div>
      ) : models.length === 0 ? (
        <p className="text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg">No models found for this specific task type. Please check the task or contact support.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(model => (
            <button
              key={model}
              onClick={() => handleSelect(model)}
              className={`p-4 text-left rounded-xl shadow-lg transition duration-200 border-2
                          ${selectedModel === model
                  ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-300'
                  : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
                }`}
            >
              <div className="font-semibold text-lg">{model}</div>
              <p className={`text-sm ${selectedModel === model ? 'text-blue-200' : 'text-gray-500'}`}>
                {model.includes('Neural') || model.includes('Transformer') ? 'Advanced deep learning algorithm.' : 'Standard machine learning algorithm.'}
              </p>
            </button>
          ))}
        </div>
      )}

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


const Step4Options = ({ formData, updateFormData, nextStep, prevStep }) => {
  const { selectedModel, trainingOptions } = formData;
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  // Load default options on component mount/model change
  useEffect(() => {
    const loadDefaults = async () => {
      if (!selectedModel) return;

      setIsLoadingDefaults(true);
      const defaults = await mockFetchBestOptions(selectedModel);
      updateFormData({ trainingOptions: defaults });
      setIsLoadingDefaults(false);
    };
    loadDefaults();
  }, [selectedModel]); // Dependency: selectedModel

  const handleOptionChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;

    updateFormData({
      trainingOptions: {
        ...trainingOptions,
        [name]: newValue
      }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">4. Training Options</h2>
      <p className="text-gray-600 mb-6">Review and adjust the training hyperparameters for "{selectedModel}".</p>

      <div className="p-6 bg-gray-50 rounded-xl shadow-inner">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">Hyperparameters</h3>

        {isLoadingDefaults ? (
          <div className="flex items-center justify-center h-32">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-md text-blue-500">Fetching best default options...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(trainingOptions).map(key => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between">
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type={key === 'learningRate' ? 'number' : 'number'}
                  step={key === 'learningRate' ? '0.001' : '1'}
                  min={key === 'epochs' ? 1 : 0.0001}
                  id={key}
                  name={key}
                  value={trainingOptions[key] || ''}
                  onChange={handleOptionChange}
                  className="mt-1 sm:mt-0 w-full sm:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                />
              </div>
            ))}
          </div>
        )}
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
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Review &rarr;
        </button>
      </div>
    </div>
  );
};


const Step5Train = ({ formData, prevStep }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState(null); // 'success', 'error', null

  const handleTrain = () => {
    setIsTraining(true);
    setTrainStatus(null);
    // Simulate training process
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      if (isSuccess) {
        setTrainStatus('success');
      } else {
        setTrainStatus('error');
      }
      setIsTraining(false);
    }, 4000); // 4 second training simulation
  };

  const statusColor = trainStatus === 'success' ? 'bg-green-100 text-green-800' :
    trainStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">5. Train Model</h2>
      <p className="text-gray-600 mb-6">Review your settings and start the training process.</p>

      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-3">
        <h3 className="text-xl font-bold text-blue-600">Summary</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Task Type:</span> {formData.taskType}</p>
          <p><span className="font-semibold">Dataset File:</span> {formData.datasetFile?.name || 'N/A'}</p>
          <p><span className="font-semibold">Selected Model:</span> {formData.selectedModel}</p>
          <p className="font-semibold mt-2">Training Options:</p>
          <ul className="list-disc list-inside ml-4">
            {Object.entries(formData.trainingOptions).map(([key, value]) => (
              <li key={key} className="text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}: <span className="font-mono">{value}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`mt-6 p-4 rounded-lg font-medium ${statusColor}`}>
        {isTraining && (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Training in progress... Please wait (4s simulation).</span>
          </div>
        )}
        {trainStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-800">
            <CheckIcon className="w-5 h-5" />
            <span>Model training completed successfully! Results are ready.</span>
          </div>
        )}
        {trainStatus === 'error' && (
          <div className="text-red-800">
            Training failed due to a server error. Please check options and try again.
          </div>
        )}
        {!isTraining && !trainStatus && (
          <span>Ready to start training. Click the button below.</span>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={isTraining}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition disabled:opacity-50"
        >
          &larr; Back
        </button>
        <button
          onClick={handleTrain}
          disabled={isTraining}
          className="px-8 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
        >
          {isTraining ? 'Training...' : 'Start Training'}
        </button>
      </div>
    </div>
  );
};


// --- SIDEBAR NAVIGATION (Step Indicator) ---

const StepIndicator = ({ steps, currentStep, goToStep }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl w-full sticky top-0 md:top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">Training Pipeline</h2>
      <ol className="relative space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li key={stepNumber} className="flex items-center space-x-4">
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold transition duration-300 
                ${isCompleted
                    ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' // Allows navigation back
                    : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                // Only allow clicking to navigate back (isCompleted is true)
                onClick={() => isCompleted && goToStep(stepNumber)}
              >
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : stepNumber}
              </div>
              <div
                className={`flex flex-col ${isActive ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
              >
                <span className="text-xs">STEP {stepNumber}</span>
                <span className="text-sm">{step.title}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};


// --- MAIN APPLICATION COMPONENT ---

const steps = [
  { id: 1, title: 'Select the Task', Component: Step1Task },
  { id: 2, title: 'Upload the Dataset', Component: Step2Data },
  { id: 3, title: 'Select the Model', Component: Step3Model },
  { id: 4, title: 'Training Options', Component: Step4Options },
  { id: 5, title: 'Train', Component: Step5Train },
];

const initialFormData = {
  taskType: '',
  datasetFile: null,
  datasetValidationStatus: 'pending',
  datasetValidationMessage: '',
  selectedModel: '',
  availableModels: [],
  trainingOptions: {
    epochs: 10,
    learningRate: 0.01,
    batchSize: 32,
  },
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  // Helper function to update form data partially
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      trainingOptions: { // Deep merge for training options
        ...prev.trainingOptions,
        ...(updates.trainingOptions || {})
      }
    }));
  }, []);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (stepNumber) => {
    // Basic navigation guard: only allow moving backward or to the next step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const CurrentStepComponent = useMemo(() => {
    const step = steps.find(s => s.id === currentStep);
    return step ? step.Component : null;
  }, [currentStep]);


  return (<>
      <nav
      className="relative px-4 py-2 flex justify-between items-center bg-white dark:bg-gray-800 border-b-2 dark:border-gray-600">

      <a className="text-2xl font-bold text-violet-600 dark:text-white" href="#">
          ModelForge
      </a>

      <ul
          className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:mx-auto lg:flex lg:items-center lg:w-auto lg:space-x-6">
          <li>
              <div className=" relative mx-auto text-gray-600">
                  <input className="border border-gray-300 placeholder-current h-10 px-5 pr-16  rounded-lg text-sm focus:outline-none dark:bg-gray-500 dark:border-gray-50 dark:text-gray-200 " type="search" name="search" placeholder="Search" />

                  <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                          <svg className="text-gray-600 dark:text-gray-200 h-4 w-4 fill-current"
                              xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1"
                              x="0px" y="0px" viewBox="0 0 56.966 56.966"
                              xmlSpace="preserve" width="512px" height="512px">
                              <path
                                  d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                          </svg>
                  </button>

              </div>
          </li>
      </ul>


      <div className="flex">
          <div>
              <span className="" id="util_data" data="{{ json_encode($util_data) }}"></span>
              <a className=" py-1.5 px-3 m-1 text-center bg-gray-100 border border-gray-300 rounded-md text-black  hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-700 inline-block "
                  href="https://tailwindflex.com/login">
                  Sign In
              </a>
          </div>

      </div>

  </nav>
  <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-[Inter]">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Step Indicator (Col 1) */}
        <div className="md:col-span-1">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            goToStep={goToStep}
          />
        </div>

        {/* Form Content (Cols 2-4) */}
        <div className="md:col-span-3 bg-white p-6 md:p-10 rounded-2xl shadow-2xl">
          {CurrentStepComponent && (
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
