import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router"; // Keep NavLink for the button, removed unused imports
import { useBackend } from '../contexts/backend';

const fetchProjectData = (endpoint) => {
  if ( import.meta.env.MODE === 'developments' ){
    console.log('Fetching data from API...');
    return new Promise(resolve => {
      setTimeout(() => {
        // This is the data that would come from your real endpoint
        const apiData = [
          { id: 101, name: 'Risk Assessment Engine', task: 'Classification', model: 'Logistic Regression', degradation: 3.5, status: 'Active', dataset: 'Test dataset' },
          { id: 102, name: 'Anomaly Detection', task: 'Clustering', model: 'Isolation Forest', degradation: 0.8, status: 'Success' },
          { id: 103, name: 'Product Recommendation', task: 'Ranking', model: 'Two-Tower NN', degradation: 10.2, status: 'Warning' },
        ];
        resolve(apiData);
      }, 1500);
    });
  } else {
    return fetch(endpoint + "/projects").then( res => res.json() )
  }
};

const projectData = [
  { id: 1, name: 'Customer Sentiment Analyzer', task: 'Text Classification', dataset: 'sentiment_reviews_v3.csv', model: 'BERT-Base', degradation: 2.1, status: 'Active' },
  { id: 2, name: 'Time Series Forecasting', task: 'Regression', dataset: 'stock_prices_2024.csv', model: 'ARIMA', degradation: 0.5, status: 'Active' },
  { id: 3, name: 'Image Caption Generator', task: 'Image-to-Text', dataset: 'coco_small_set.zip', model: 'ViT-GPT2', degradation: 15.4, status: 'Warning' },
  { id: 4, name: 'Audio Classification', task: 'Audio Classification', dataset: 'sound_events_1k.mp3', model: 'CNN-LSTM', degradation: 0.0, status: 'Success' },
  { id: 5, name: 'Code Generation Agent', task: 'Sequence-to-Sequence', dataset: 'github_snippets.json', model: 'Gemini-Flash-Tuned', degradation: 1.1, status: 'Active' },
];

// =================================================================
// 2. MODAL COMPONENT (New)
// =================================================================

const Modal = ({ isOpen, onClose, project }) => {
    if (!isOpen || !project) return null;

    return (
        // Modal Backdrop
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4" onClick={onClose}>
            {/* Modal Content */}
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 md:p-8 transform transition-all duration-300 scale-100 opacity-100" 
                onClick={e => e.stopPropagation()} // Stop propagation to prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-violet-800">Details: {project.name}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition"
                        aria-label="Close Modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 text-gray-700">
                    <p><strong>Task Type:</strong> <span className="font-medium text-indigo-700">{project.task}</span></p>
                    <p><strong>Model Architecture:</strong> {project.model}</p>
                    <p><strong>Training Dataset:</strong> {project.dataset}</p>
                    <p><strong>Current Status:</strong> <span className={`font-bold ${project.status === 'Warning' ? 'text-red-600' : 'text-green-600'}`}>{project.status}</span></p>
                    <p>
                        <strong>Degradation:</strong> 
                        <span className="font-semibold text-xl ml-2 text-red-600">{project.degradation.toFixed(2)}%</span>
                        <span className="text-sm text-gray-500 ml-2">(Since Baseline)</span>
                    </p>
                    {/* Add more details as needed */}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
                    >
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 3. PROJECT DASHBOARD COMPONENT (Updated)
// =================================================================

const ProjectDashboard = ({ projects }) => {
    // 📢 New State to manage Modal:
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    

    // Function to open the modal with the specific project's data
    const openDetailsModal = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    // Helper function to determine the degradation color/styling (Kept as is)
    const getDegradationStyle = (degradation) => {
        if (degradation > 5.0) {
            return { text: 'text-red-600', bg: 'bg-red-100', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }; // Lightning bolt
        } else if (degradation > 1.0) {
            return { text: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z' }; // Warning triangle
        } else {
            return { text: 'text-green-600', bg: 'bg-green-100', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }; // Check circle
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Model Project Dashboard</h1>
                <NavLink
                    to="/new-project"
                    className="flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition shadow-lg hover:scale-[1.02]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Project
                </NavLink>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Dataset</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degradation (%)</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        { 
                          projects.length > 0 ?
                        
                          projects.map((project) => {
                            const degStyle = getDegradationStyle(project.degradation);
                            return (
                                <tr key={project.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    {/* Project Name */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                        <div className="text-xs text-gray-500 sm:hidden">{project.task}</div>
                                    </td>
                                    {/* Task */}
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                            {project.task}
                                        </span>
                                    </td>
                                    {/* Dataset */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                        {project.dataset}
                                    </td>
                                    {/* Model */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                        {project.model}
                                    </td>
                                    {/* Degradation */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center text-sm font-semibold ${degStyle.text} p-1 rounded-md ${degStyle.bg}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                                {/* Adjusted the path here: we only set `d` on the path, not stroke properties */}
                                                <path d={degStyle.icon} /> 
                                            </svg>
                                            {project.degradation.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => openDetailsModal(project)} // 💥 Added onClick handler
                                            className="text-violet-600 hover:text-violet-900 transition"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) :
                         <tr>
                            <td colSpan={6} className='py-12 text-center text-lg text-gray-500'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                No projects found
                                <br />
                                <NavLink to="/new-project">
                                  <small className="no-underline hover:underline">Create your first one</small>
                                </NavLink>
                            </td>
                         </tr>
                        }
                    </tbody>
                </table>
            </div>
            
            {/* Footer (Kept as is) */}
            <p className="text-center text-sm text-gray-500 pt-4 border-t">
                Model degradation is calculated as the drop in F1-score/Accuracy relative to the baseline performance at launch.
            </p>

            {/* 📢 New Modal Render */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                project={selectedProject}
            />
        </div>
    );
};

export default function App() {
  const [projects, setProjects] = useState(projectData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data } = useBackend()

  useEffect(() => {
        // Define the asynchronous function inside useEffect
        const loadProjects = async () => {
            setIsLoading(true); // Start loading
            setError(null);    // Clear previous errors

            try {
                // Wait for the simulated fetch call to complete
                const projectData = await fetchProjectData( data.endpoint ); 
                
                // Store the successful data in state
                setProjects(projectData); 

            } catch (err) {
                console.error("Failed to fetch data:", err);
                // Store any error
                setError("Oops! Could not retrieve project data.");

            } finally {
                // Always set loading to false when the attempt is finished
                setIsLoading(false); 
            }
        };

        // Execute the fetch function
        loadProjects();

        // 3. Dependency Array: The empty array [] means this effect runs 
        //    *only once* after the initial render (like componentDidMount).
    }, [data]);

  if (isLoading) {
      return (
          <div className="text-center p-8 bg-gray-50">
              <p className="text-lg font-medium text-violet-600">Loading project data... Please wait for the API call to resolve. </p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
          </div>
      );
  }

  return (<>
  <div className="bg-gray-50 p-4 md:p-8 font-[Inter]">
    <div className="max-w-6xl mx-auto">
        <ProjectDashboard projects={projects}/>
    </div>
  </div>
    </>
  );
}