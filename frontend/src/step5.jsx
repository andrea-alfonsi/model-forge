import React from 'react';

// --- MOCK DATA AND MAPPING FOR REVIEW (Used to structure the display) ---

// Categorization of the training options for organized display
const CATEGORIES = {
    basic: { 
        name: 'Core Parameters', 
        color: 'bg-blue-50 border-blue-200 text-blue-800', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        keys: ['epochs', 'learningRate', 'batchSize']
    },
    advanced: { 
        name: 'Optimization & Regularization', 
        color: 'bg-purple-50 border-purple-200 text-purple-800', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.223.57 2.573-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        keys: ['optimizationAlgorithm', 'l2Regularization', 'earlyStoppingPatience', 'momentum', 'beta1']
    },
    hardware: { 
        name: 'Hardware Configuration', 
        color: 'bg-green-50 border-green-200 text-green-800', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 002 2h10a2 2 0 002-2M5 12a2 2 0 012-2h10a2 2 0 012 2m-2 5a2 2 0 00-2-2H9a2 2 0 00-2 2m-2 0h14" />
            </svg>
        ),
        keys: ['distributedTraining', 'maxGPUMemory', 'dataWorkers']
    }
};

// Mapping of internal key names to user-friendly labels
const LabelMap = {
    epochs: 'Training Epochs',
    learningRate: 'Learning Rate',
    batchSize: 'Batch Size',
    optimizationAlgorithm: 'Optimizer',
    earlyStoppingPatience: 'Early Stop Patience',
    l2Regularization: 'L2 Regularization',
    momentum: 'SGD Momentum',
    beta1: 'Adam Beta 1',
    maxGPUMemory: 'Max GPU Memory (GB)',
    distributedTraining: 'Distributed Training',
    dataWorkers: 'Data Workers',
};

// --- Helper Functions ---

const formatValue = (key, value) => {
    if (value === true) return <span className="font-bold text-green-600">Enabled</span>;
    if (value === false) return <span className="font-bold text-red-500">Disabled</span>;
    
    // Format long floats for better readability
    if (key === 'learningRate' || key === 'l2Regularization') {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        // Use scientific notation for very small numbers, or fixed point for others
        return num.toPrecision(key === 'learningRate' ? 5 : 6);
    }
    
    // Hide conditional parameters if their value is 0 (or irrelevant)
    if (key === 'momentum' && value === 0) return null;
    if (key === 'beta1' && value === 0) return null;

    return value;
};

// --- React Component ---

const TrainingReview = ({ formData = {}, nextStep, prevStep }) => {
    // Destructure required data from formData
    const { 
        taskType = 'N/A', 
        datasetFile = 'N/A', 
        selectedModel = 'N/A', 
        trainingOptions = {} 
    } = formData;

    const handleStartTraining = () => {
        // In a real app, this would trigger the actual training API call
        alert('Training process started! (Mock API Call)');
        // Maybe navigate to a monitoring screen
        // nextStep(); 
    };

    const isAdam = trainingOptions.optimizationAlgorithm === 'Adam';
    const isSGD = trainingOptions.optimizationAlgorithm === 'SGD';

    return (
        <div className="p-6 bg-white rounded-xl shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-2 text-gray-900">5. Review and Start Training</h2>
            <p className="text-gray-600 mb-6 border-b pb-4">
                Review your final configuration before launching the model training job.
            </p>

            {/* --- CORE SUMMARY --- */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Project Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">Task Type</p>
                        <p className="font-semibold text-gray-900">{formData.taskType}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">Dataset File</p>
                        <p className="font-semibold text-gray-900 truncate">{formData.datasetFile.name}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">Selected Model</p>
                        <p className="font-semibold text-gray-900">{formData.selectedModel}</p>
                    </div>
                </div>
            </div>

            {/* --- TRAINING OPTIONS CATEGORIZED --- */}
            <h3 className="text-xl font-bold mb-4 text-gray-700">Training Options Summary</h3>

            <div className="space-y-6">
                {Object.keys(CATEGORIES).map(categoryKey => {
                    const category = CATEGORIES[categoryKey];
                    const categoryData = category.keys
                        .map(key => ({
                            label: LabelMap[key],
                            value: trainingOptions[key],
                            formatted: formatValue(key, trainingOptions[key]),
                            key
                        }))
                        // Filter out parameters irrelevant to the current optimizer (if value is 0 or null)
                        .filter(item => {
                            if (item.formatted === null) {
                                // Filter out beta1 if not Adam, and momentum if not SGD
                                if (item.key === 'beta1' && !isAdam) return false;
                                if (item.key === 'momentum' && !isSGD) return false;
                            }
                            // Also hide dataWorkers if distributedTraining is false
                            if (item.key === 'dataWorkers' && !trainingOptions.distributedTraining) return false;

                            return true;
                        });

                    if (categoryData.length === 0) return null; // Hide empty categories

                    return (
                        <div key={categoryKey} className={`p-5 rounded-xl border-2 ${category.color} shadow-lg`}>
                            <div className="flex items-center mb-4">
                                {category.icon}
                                <h4 className="text-lg font-bold ml-2">{category.name}</h4>
                            </div>
                            
                            {/* Responsive Grid for Key-Value Pairs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                {categoryData.map(item => (
                                    <div key={item.key} className="flex flex-col">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="font-semibold text-gray-900 break-words">{item.formatted}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
                <button
                    onClick={prevStep}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition shadow-md"
                >
                    &larr; Back 
                </button>
                <button
                    onClick={handleStartTraining}
                    className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition shadow-lg transform hover:scale-[1.02]"
                >
                    Start Training &rarr;
                </button>
            </div>
        </div>
    );
};

export default TrainingReview;
