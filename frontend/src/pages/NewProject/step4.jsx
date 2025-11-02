import { useState, useEffect, useCallback } from "react";

/**
 * Function to format decimal hours into a more readable hours and minutes string.
 * @param {number | null} decimalHours - Time in decimal hours (e.g., 1.33).
 * @returns {string} Formatted string (e.g., "~1h 20m").
 */
const formatHoursToHHMM = (decimalHours) => {
    if (decimalHours === null) return 'N/A';
    
    // Calculate total minutes, rounded to the nearest minute
    const totalMinutes = Math.round((decimalHours || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Ensure we show at least a minimum time
    if (totalMinutes < 1) return '< 1m';

    if (hours > 0) {
        return `~${hours}h ${minutes}m`;
    }
    return `~${minutes}m`;
};

/**
 * --- Mock Data Fetching ---
 * Simulates fetching the best default training options based on the selected model.
 * Takes 1 second and provides defaults for all three tabs.
 * @param {string} modelName
 * @returns {Promise<Object>} containing all merged options.
 */
const mockFetchBestOptions = (modelName) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let options = {
        // Basic
        epochs: 10, learningRate: 0.01, batchSize: 32,
        // Advanced
        optimizationAlgorithm: 'SGD', earlyStoppingPatience: 3, l2Regularization: 0.001,
        // Conditional Advanced Defaults for SGD
        momentum: 0.9, beta1: 0.9,
        // Hardware
        maxGPUMemory: 4, distributedTraining: false, dataWorkers: 2,
      };
      if (modelName.includes('NeuralNetwork') || modelName.includes('Transformer')) {
        options = {
          // Basic
          epochs: 50, learningRate: 0.0001, batchSize: 64,
          // Advanced
          optimizationAlgorithm: 'Adam', earlyStoppingPatience: 10, l2Regularization: 0.00001,
          // Conditional Advanced Defaults for Adam
          momentum: 0.0, beta1: 0.9,
          // Hardware
          maxGPUMemory: 16, distributedTraining: true, dataWorkers: 8,
        };
      }
      resolve(options);
    }, 1000); // 1 second delay
  });
};

/**
 * Mock function to estimate training time based on configuration.
 * This is a simulated calculation for demonstration purposes.
 * @param {Object} options - Current training configuration.
 * @returns {number} Estimated time in hours (decimal).
 */
const mockEstimateTrainingTime = (options) => {
    // Ensure essential values are present and valid for calculation
    const epochs = options.epochs > 0 ? options.epochs : 1;
    const batchSize = options.batchSize > 0 ? options.batchSize : 32;
    const maxGPUMemory = options.maxGPUMemory > 0 ? options.maxGPUMemory : 1;

    // Base complexity score (Arbitrary baseline)
    let complexityScore = 100;

    // 1. Adjust based on epochs and batch size (more steps = longer)
    complexityScore *= epochs / 10;
    complexityScore *= 32 / batchSize; // Smaller batch size increases the score

    // 2. Adjust based on hardware/distributed training
    if (options.distributedTraining) {
        // Distributed training speeds it up significantly
        complexityScore *= 0.4;
    }

    // 3. Adjust based on GPU memory (more memory can speed up processing, use log to moderate effect)
    complexityScore /= Math.log2(maxGPUMemory) + 1;

    // Convert score to a reasonable time scale (e.g., hours)
    let estimatedHours = complexityScore / 15;

    // Ensure non-negative and minimum 0.01 hours (0.6 minutes)
    return Math.max(0.01, estimatedHours);
};

// Helper object to map option keys to their respective tabs
const CONFIG_TABS = {
  // Added conditional fields (momentum, beta1) to the list
  basic: ['epochs', 'learningRate', 'batchSize'],
  advanced: ['optimizationAlgorithm', 'earlyStoppingPatience', 'l2Regularization', 'momentum', 'beta1'],
  // Reordered for better logic flow
  hardware: ['distributedTraining', 'maxGPUMemory', 'dataWorkers'],
};

const TAB_NAMES = {
    basic: 'Basic Parameters',
    advanced: 'Advanced Config',
    hardware: 'Hardware Settings'
};

const InputMap = {
    epochs: { type: 'number', step: '1', min: 1, label: 'Training Epochs', description: 'The number of times the learning algorithm will work through the entire training dataset.' },
    learningRate: { type: 'number', step: '0.00001', min: 0.00001, label: 'Learning Rate', description: 'Controls how quickly the model adjusts the weights with respect to the loss gradient. Smaller rates mean slower, more stable training.' },
    batchSize: { type: 'number', step: '1', min: 1, label: 'Batch Size', description: 'The number of samples processed before the model’s internal parameters are updated.' },
    optimizationAlgorithm: { type: 'select', options: ['Adam', 'SGD', 'RMSprop'], label: 'Optimizer', description: 'The algorithm used to minimize the loss function.' },
    earlyStoppingPatience: { type: 'number', step: '1', min: 0, label: 'Early Stop Patience', description: 'Stop training if validation loss does not improve after this many epochs (set to 0 to disable).' },
    l2Regularization: { type: 'number', step: '0.0000001', min: 0, label: 'L2 Regularization', description: 'A penalty term added to the loss function to prevent overfitting (set to 0 for none).' },
    // Conditional fields
    momentum: { type: 'number', step: '0.01', min: 0, max: 1, label: 'SGD Momentum', description: 'The velocity of the updates in the parameter space (used with SGD).' },
    beta1: { type: 'number', step: '0.01', min: 0, max: 1, label: 'Adam Beta 1 (Exponential Decay Rate)', description: 'Decay rate for the first moment estimates (used with Adam).' },
    // Hardware fields
    maxGPUMemory: { type: 'number', step: '1', min: 1, label: 'Max GPU Memory (GB)', description: 'The maximum allowed GPU memory allocation for training per worker.' },
    distributedTraining: { type: 'checkbox', label: 'Enable Distributed Training', description: 'Distributes the training load across multiple GPUs/machines.' },
    dataWorkers: { type: 'number', step: '1', min: 1, label: 'Data Workers', description: 'The number of subprocesses to use for data loading (only relevant with distributed training).' },
};


export default ({ formData = {}, updateFormData = () => {}, nextStep, prevStep }) => {
  const { selectedModel, trainingOptions = {} } = formData;
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);
  const [currentTab, setCurrentTab] = useState('basic');
  const [trainingTimeEstimate, setTrainingTimeEstimate] = useState(null); // New state for time estimate

  // Load default options on component mount/model change
  useEffect(() => {
    const loadDefaults = async () => {
      if (!selectedModel) {
          setIsLoadingDefaults(false);
          return;
      }

      setIsLoadingDefaults(true);
      try {
        const defaults = await mockFetchBestOptions(selectedModel);
        updateFormData({
          trainingOptions: {
            ...trainingOptions,
            ...defaults
          }
        });
      } catch (error) {
        console.error("Failed to load default options:", error);
      } finally {
        setIsLoadingDefaults(false);
      }
    };
    loadDefaults();
  }, [selectedModel]);
  
  // Effect to calculate and update the training time estimate
  useEffect(() => {
    // Debounce the calculation slightly to avoid excessive calls during rapid input
    const timer = setTimeout(() => {
        const estimate = mockEstimateTrainingTime(trainingOptions);
        setTrainingTimeEstimate(estimate);
    }, 100);

    return () => clearTimeout(timer);
  }, [trainingOptions]);


  const handleOptionChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let newValue;

    if (type === 'checkbox') {
        newValue = checked;
    } else if (type === 'number') {
        // Use empty string if value is empty, so number inputs can be cleared by user
        newValue = value === '' ? '' : parseFloat(value);
    } else {
        newValue = value;
    }

    updateFormData({
      trainingOptions: {
        ...trainingOptions,
        [name]: newValue
      }
    });
  }, [trainingOptions, updateFormData]);


  const renderInputs = () => {
    const keys = CONFIG_TABS[currentTab] || [];

    if (keys.length === 0) return <p className="text-gray-500">No configuration options for this tab.</p>;

    // Class for number/select inputs - ensuring visible borders and white background
    const baseInputClass = "w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 bg-white";
    
    // Arrays to hold regular and dependent inputs for grouping
    const regularElements = [];
    const dependentElements = [];

    let isDependentVisible = false;

    keys.forEach(key => {
        const config = InputMap[key] || {};
        const currentValue = trainingOptions[key];

        // --- Custom Visibility & Grouping Logic ---
        let isVisible = true;
        let isDependent = false; 

        // 1. Optimizer Dependent Fields (Advanced Tab)
        if (key === 'momentum' || key === 'beta1') {
            isDependent = true;
            if (key === 'momentum' && trainingOptions.optimizationAlgorithm !== 'SGD') {
                isVisible = false;
            }
            if (key === 'beta1' && trainingOptions.optimizationAlgorithm !== 'Adam') {
                isVisible = false;
            }
            if (isVisible) isDependentVisible = true;
        }

        // 2. Hardware/GPU Customization Dependent on Distributed Training
        if ((key === 'maxGPUMemory' || key === 'dataWorkers') && !trainingOptions.distributedTraining) {
            isVisible = false;
        }

        if (!isVisible) return; 
        // --- End Visibility Logic ---

        const label = config.label || key.replace(/([A-Z])/g, ' $1').trim();
        
        // Simple client-side validation check for minimum value
        const hasMinError = config.min !== undefined && currentValue !== '' && currentValue < config.min;

        const inputElement = (
            <div key={key} className="flex flex-col sm:flex-row sm:items-start justify-between">
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize w-full sm:w-1/2 pt-2">
                    {label}
                </label>
                <div className="mt-1 sm:mt-0 w-full sm:w-1/2">
                    {config.type === 'number' && (
                        <input
                            type="number"
                            step={config.step}
                            min={config.min}
                            id={key}
                            name={key}
                            value={currentValue !== undefined ? currentValue : ''}
                            onChange={handleOptionChange}
                            className={`${baseInputClass} ${hasMinError ? 'border-red-500' : ''}`}
                        />
                    )}
                    {config.type === 'select' && (
                        <select
                            id={key}
                            name={key}
                            // Fallback to first option if value is missing
                            value={currentValue || config.options[0]} 
                            onChange={handleOptionChange}
                            className={baseInputClass}
                        >
                            {config.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    {config.type === 'checkbox' && (
                        <div className="flex items-center h-full">
                            <input
                                type="checkbox"
                                id={key}
                                name={key}
                                checked={!!currentValue} // Ensure boolean
                                onChange={handleOptionChange}
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Description and Validation Display */}
                    {config.description && (
                        <p className="mt-1 text-xs text-gray-500 italic">{config.description}</p>
                    )}
                    {hasMinError && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                            Value must be at least {config.min}.
                        </p>
                    )}
                </div>
            </div>
        );

        if (isDependent && currentTab === 'advanced') {
            dependentElements.push(inputElement);
        } else {
            regularElements.push(inputElement);
        }
    });

    return (
        <div className="space-y-6">
            {regularElements}
            
            {/* Visual Grouping for Optimizer Dependent Fields (Advanced Tab only) */}
            {isDependentVisible && currentTab === 'advanced' && (
                <div className="p-4 pt-6 border-b-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-4">
                        Parameters for {trainingOptions.optimizationAlgorithm} Optimizer
                    </p>
                    <div className="space-y-6">
                        {dependentElements}
                    </div>
                </div>
            )}
        </div>
    );
  };

  const TabButton = ({ tabKey, activeTab, setTab }) => {
    const isActive = tabKey === activeTab;
    return (
        <button
            onClick={() => setTab(tabKey)}
            className={`
                px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
                ${isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-blue-600 hover:border-gray-300 border-b-2 border-transparent'
                }
            `}
        >
            {TAB_NAMES[tabKey]}
        </button>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">4. Training Options</h2>
      
      {/* Dynamic Time Estimate Display with Tooltip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        <p className="text-gray-600">Configure the essential hyperparameters for the "{selectedModel || 'Unselected Model'}" model before starting training.</p>
        {trainingTimeEstimate !== null && (
            <div className="relative group mt-4 sm:mt-0">
                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-lg border border-blue-300 transition-shadow duration-150 cursor-help">
                    Estimated Training Time: 
                    <span className="text-lg font-extrabold ml-1">
                        {formatHoursToHHMM(trainingTimeEstimate)}
                    </span>
                </div>
                {/* Tooltip Content */}
                <div className="absolute z-10 top-full right-0 mt-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="font-bold mb-1">Estimate Factors:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li><span className="font-semibold">Epochs ({trainingOptions.epochs || 1}):</span> High number increases time.</li>
                        <li><span className="font-semibold">Batch Size ({trainingOptions.batchSize || 32}):</span> Smaller size increases total steps/time.</li>
                        <li><span className="font-semibold">GPU Memory ({trainingOptions.maxGPUMemory || 1}GB):</span> Higher memory allocation speeds up processing.</li>
                        <li><span className="font-semibold">Distributed ({trainingOptions.distributedTraining ? 'Yes' : 'No'}):</span> Significantly reduces wall-clock time.</li>
                    </ul>
                    <p className="mt-2 text-gray-400 italic">This is a estimate and may not reflect real-world performance.</p>
                </div>
            </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 -mx-6 px-6 pt-2">
        {Object.keys(CONFIG_TABS).map(key => (
          <TabButton
            key={key}
            tabKey={key}
            activeTab={currentTab}
            setTab={setCurrentTab}
          />
        ))}
      </div>

      <div className="p-4 min-h-[300px]">
        {isLoadingDefaults ? (
          <div className="flex flex-col items-center justify-center h-48">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 mt-4 text-lg text-blue-600 font-medium">Fetching optimal defaults...</span>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-700">{TAB_NAMES[currentTab]}</h3>
            {renderInputs()}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition shadow-md"
        >
          &larr; Back
        </button>
        <button
          onClick={nextStep}
          disabled={isLoadingDefaults}
          className={`px-8 py-3 text-white rounded-full font-bold transition shadow-lg
            ${isLoadingDefaults ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          Review & Finish &rarr;
        </button>
      </div>
    </div>
  );
};
