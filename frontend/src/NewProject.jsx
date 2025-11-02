import { useState, useMemo, useCallback } from 'react';
import Step1Task from './step1'
import Step2Data from './step2'
import Step3Model from './step3'
import Step4Options from './step4'
import Step5Train from './step5'
import { useNavigate } from 'react-router';

// Simple SVG Checkmark icon
const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);


// --- SIDEBAR NAVIGATION (Step Indicator) ---

const StepIndicator = ({ steps, currentStep, goToStep }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl w-full sticky top-4 md:top-20">
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

export default function NewProject() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();

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
  const prevStep = () => currentStep === 1 ? navigate('/') : setCurrentStep(prev => Math.max(prev - 1, 1));
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
  <div className="min-h-full bg-gray-50 p-4 md:p-8 font-[Inter]">
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
