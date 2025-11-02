import { useState, useEffect } from "react";

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

export default ({ formData, updateFormData, nextStep, prevStep }) => {
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