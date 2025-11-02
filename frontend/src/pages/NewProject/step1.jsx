import { useEffect, useState } from "react";
import { useBackend } from '../../contexts/backend'

const filterTaskMap = (masterMap, allowedKeys) => {
    const filteredMap = {};
    // Use a Set for O(1) average time complexity lookup, much faster than array iteration.
    const allowedSet = new Set(allowedKeys); 

    // Iterate through the top-level categories
    for (const [category, tasks] of Object.entries(masterMap)) {
        const filteredTasks = {};
        
        // Iterate through the tasks within the current category
        for (const [taskKey, taskName] of Object.entries(tasks)) {
            
            // Check if the current task key is in our allowed set
            if (allowedSet.has(taskKey)) {
                // If allowed, keep the element in the same position
                filteredTasks[taskKey] = taskName;
            }
        }
        
        // Only add the category to the final map if it contains filtered tasks
        if (Object.keys(filteredTasks).length > 0) {
            filteredMap[category] = filteredTasks;
        }
    }
            
    return filteredMap;
};

const groupedTasks = {
  "Multimodal": {
    "multimodal.audio-text-to-text": "Audio-Text-to-Text",
    "multimodal.image-text-to-text": "Image-Text-to-Text",
    "multimodal.visual-question-answering": "Visual Question Answering",
    "multimodal.document-question-answering": "Document Question Answering",
    "multimodal.video-text-to-text": "Video-Text-to-Text",
    "multimodal.visual-document-retrieval": "Visual Document Retrieval",
    "multimodal.any-to-any": "Any-to-Any"
  },
  "Computer Vision": {
    "computer-vision.depth-estimation": "Depth Estimation",
    "computer-vision.image-classification": "Image Classification",
    "computer-vision.object-detection": "Object Detection",
    "computer-vision.image-segmentation": "Image Segmentation",
    "computer-vision.text-to-image": "Text-to-Image",
    "computer-vision.image-to-text": "Image-to-Text",
    "computer-vision.image-to-image": "Image-to-Image",
    "computer-vision.image-to-video": "Image-to-Video",
    "computer-vision.unconditional-image-generation": "Unconditional Image Generation",
    "computer-vision.video-classification": "Video Classification",
    "computer-vision.text-to-video": "Text-to-Video",
    "computer-vision.zero-shot-image-classification": "Zero-Shot Image Classification",
    "computer-vision.mask-generation": "Mask Generation",
    "computer-vision.zero-shot-object-detection": "Zero-Shot Object Detection",
    "computer-vision.text-to-3d": "Text-to-3D",
    "computer-vision.image-to-3d": "Image-to-3D",
    "computer-vision.image-feature-extraction": "Image Feature Extraction",
    "computer-vision.keypoint-detection": "Keypoint Detection",
    "computer-vision.video-to-video": "Video-to-Video"
  },
  "Natural Language Processing": {
    "natural-language-processing.text-classification": "Text Classification",
    "natural-language-processing.token-classification": "Token Classification",
    "natural-language-processing.table-question-answering": "Table Question Answering",
    "natural-language-processing.question-answering": "Question Answering",
    "natural-language-processing.zero-shot-classification": "Zero-Shot Classification",
    "natural-language-processing.translation": "Translation",
    "natural-language-processing.summarization": "Summarization",
    "natural-language-processing.feature-extraction": "Feature Extraction",
    "natural-language-processing.text-generation": "Text Generation",
    "natural-language-processing.fill-mask": "Fill-Mask",
    "natural-language-processing.sentence-similarity": "Sentence Similarity",
    "natural-language-processing.text-ranking": "Text Ranking"
  },
  "Audio": {
    "audio.text-to-speech": "Text-to-Speech",
    "audio.text-to-audio": "Text-to-Audio",
    "audio.automatic-speech-recognition": "Automatic Speech Recognition",
    "audio.audio-to-audio": "Audio-to-Audio",
    "audio.audio-classification": "Audio Classification",
    "audio.voice-activity-detection": "Voice Activity Detection"
  },
  "Tabular": {
    "tabular.tabular-classification": "Tabular Classification",
    "tabular.tabular-regression": "Tabular Regression",
    "tabular.time-series-forecasting": "Time Series Forecasting"
  },
  "Reinforcement Learning": {
    "reinforcement-learning.reinforcement-learning": "Reinforcement Learning",
    "reinforcement-learning.robotics": "Robotics"
  },
  "Other": {
    "other.graph-machine-learning": "Graph Machine Learning"
  }
};

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default ({ formData, updateFormData, nextStep, prevStep }) => {
  // State to control which group's sub-tasks are currently visible
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [availableTasks, setAvailableTasks] = useState({})
  const { data } = useBackend()

  useEffect( () => {
    fetch( data.endpoint + "/projects/available-tasks").then( res => res.json() ).then( availableTasksList => {
      setAvailableTasks( Object.fromEntries(Object.entries(filterTaskMap( groupedTasks, availableTasksList )).map(([key, entry]) => {
          return [key, Object.values(entry)]
        }))
      )
    })
  }, [data])

  const handleSelect = (task) => {
    updateFormData({ 
      taskType: task, 
      selectedModel: '', 
      availableModels: [], 
      datasetFile: null,
      datasetValidationStatus: 'pending',
      trainingOptions: {}
    });
    if ( formData.title && formData.description ){
      nextStep();
    }
  };

  const handleTitle = ( title ) => {
    updateFormData({ title })
  }
  const handleDescription = ( description ) => {
    updateFormData({ description })
  }
  
  const toggleGroup = (groupName) => {
    setExpandedGroup(prev => prev === groupName ? null : groupName);
  };

  const calculateMaxHeight = (tasks) => {
    // Estimate max-height for smooth transition based on number of sub-tasks
    return `${tasks.length * 48 + 20}px`;
  }

  const canProceed = formData.title && formData.taskType;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">1. Create a new project</h2>
      <p className="text-gray-600 mb-6">Choose the domain and specific task you are trying to solve.</p>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <label htmlFor={'title'} className="block text-sm font-medium text-gray-700 capitalize w-full sm:w-1/2 pt-2">
              Title
          </label>
          <div className="mt-1 sm:mt-0 w-full sm:w-1/2">
            <input
              type="text"
              id={'title'}
              name={'title'}
              value={ formData.title ?? '' }
              onChange={ e => handleTitle(e.target.value) }
              className={`w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 bg-white ${false ? 'border-red-500' : ''}`}
              />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <label htmlFor={'title'} className="block text-sm font-medium text-gray-700 capitalize w-full sm:w-1/2 pt-2">
              Description
          </label>
          <div className="mt-1 sm:mt-0 w-full sm:w-1/2">
            <textarea
              id={'description'}
              name={'description'}
              value={ formData.description ?? '' }
              onChange={ e => handleDescription(e.target.value) }
              className={`w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 bg-white ${false ? 'border-red-500' : ''}`}
              />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 capitalize w-full sm:w-1/2 pt-2">Task</label>
        </div>

        {Object.entries(availableTasks).map(([group, tasks]) => {
          const isExpanded = expandedGroup === group;
          // Check if the current form data task belongs to this group for highlighting
          const isSelected = tasks.includes(formData.taskType);

          return (
            <div key={group} className={`border rounded-xl shadow-md overflow-hidden transition duration-300 ${isExpanded ? 'border-blue-400 shadow-xl' : 'border-gray-200'}`}>
              
              {/* Group Header - Clickable */}
              <button
                onClick={() => toggleGroup(group)}
                className={`w-full flex justify-between items-center p-4  text-left transition duration-300 
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