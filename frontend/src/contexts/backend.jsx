import React, { createContext, useContext, useState, useRef, useMemo, useEffect } from 'react';

/**
 * A dropdown component that filters a list of options based on user typing.
 * @param {object} props
 * @param {string[]} props.options - The array of string values to choose from.
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @param {function} props.onSelect - Callback function (value) => void when an item is selected.
 */
const TypeaheadDropdown = ({ options, placeholder, onSelect }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const componentRef = useRef(null);

    // --- Filtering Logic ---
    const filteredOptions = useMemo(() => {
        if (!inputValue) {
            // Show all options if nothing is typed, or no options if closed
            return options; 
        }
        const search = inputValue.toLowerCase();
        return options.filter(option =>
            option.toLowerCase().includes(search)
        );
    }, [inputValue, options]);
    
    // --- Handlers ---
    
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setIsOpen(true); // Open the dropdown when the user starts typing
        setHighlightedIndex(-1); // Reset highlight
    };

    const handleSelectOption = (option) => {
        setInputValue(option);
        setIsOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (componentRef.current && !componentRef.current.contains(event.target)) {
                // Only close if the input is not empty (to allow re-opening easily)
                if (inputValue.length === 0) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputValue]);
    
    // Handle keyboard navigation (Enter and Arrow keys)
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && highlightedIndex > -1) {
            e.preventDefault();
            handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };


    return (
        <div className="relative w-80" ref={componentRef}>
            {/* Input Field */}
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-violet-500 focus:border-violet-500 transition"
                autoComplete="off"
            />
            
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {filteredOptions.map((option, index) => (
                            <li
                                key={option}
                                className={`px-4 py-2 cursor-pointer transition 
                                            ${highlightedIndex === index 
                                                ? 'bg-violet-100 text-violet-800' 
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                onClick={() => handleSelectOption(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {option}
                            </li>
                        ))}
                        
                    </ul>
                </div>
            )}
            
            {isOpen && inputValue.length > 0 && filteredOptions.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
                    <p onClick={() => handleSelectOption(inputValue)} className=" cursor-pointer px-4 py-2 italic">{inputValue}</p>
                </div>
            )}
        </div>
    );
};

const InitialInputForm = ({ onSubmit, error }) => {
    const [endpoint, setEndpoint] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ endpoint }); 
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full space-y-6">
                <h2 className="text-2xl font-bold text-violet-600 border-b pb-3">Backend engine required</h2>
                <p className="text-gray-600">
                    To open the app please select the backend engine
                </p>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select or type the backend endpoint:</label>
                    <TypeaheadDropdown 
                        options={['http://localhost:8000']}
                        placeholder="Start typing a task type..."
                        onSelect={setEndpoint}
                    />
                    <p className="mt-1 text-xs text-red-600 font-medium">
                        {error}
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition shadow-lg"
                    >
                        Connect
                    </button>
                </div>
            </form>
        </div>
    );
};

const BackendContext = createContext(null);

export const useBackend = () => {
    const context = useContext(BackendContext);
    if (!context) {
        throw new Error('useBackend must be used within a BackendProvider');
    }
    return context;
};

export const BackendProvider = ({ children }) => {

    const [initialData, setInitialData] = useState(null); 
    const [isInputRequired, setIsInputRequired] = useState(true);
    const [error, setError] = useState(null)

    const handleDataSubmit = (data) => {

      if ( data.endpoint ) {
        console.log( data.endpoint )
            fetch( data.endpoint ).then( res => {
              if( res.ok ){
                setInitialData(data);
                setIsInputRequired(false);
              } else {
                setError("Backend is not responding, check its state or change backend (ERROR: " + e + ")")
                setInitialData(null);
                setIsInputRequired(true)
              }
            }).catch( e => {
                console.log( e )
                setError("Cannot connect to the server because of a network error or a typo in the address, check your connection and try again")
                setInitialData(null);
                setIsInputRequired(true)
            })
            console.log("Initial setup complete:", data);
        } else {
            setError("A running backend is required!");
        }
    };

    const resetSetup = () => {
        setInitialData(null);
        setIsInputRequired(true);
    };

    const contextValue = {
        data: initialData,
        isSetupComplete: !isInputRequired,
        submitData: handleDataSubmit,
        reset: resetSetup
    };

    return (
        <BackendContext.Provider value={contextValue}>
            {isInputRequired ? (
                <InitialInputForm onSubmit={handleDataSubmit} error={error} />
            ) : (
                children
            )}
        </BackendContext.Provider>
    );
};