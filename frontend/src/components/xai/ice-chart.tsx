import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'; 
import { Button } from '../ui/button';

// --- 1. Types and Definitions ---

// The basic structure for a single mock data point (1 time step for 1 run)
interface DataPoint {
  time: number; // The time index (0 to TIME_STEPS - 1)
  value: number; // The value of the selected feature for this run
}

// Type for the full data set for a single run
type ModelRun = DataPoint[];

// Type for the Recharts data array (one object per time step)
interface RechartPoint {
  time: number;
  // Dynamic keys for each run, e.g., 'run_0', 'run_1', ...
  [key: string]: number | undefined; 
  average: number;
}

// Type for the dropdown options
type FeatureKey = 'featureA' | 'featureB' | 'featureC';

const featureOptions: { label: string; value: FeatureKey }[] = [
  { label: 'Feature A (Revenue)', value: 'featureA' },
  { label: 'Feature B (Impressions)', value: 'featureB' },
  { label: 'Feature C (Latency)', value: 'featureC' },
];

// --- 2. Mock Data Simulation ---

const TIME_STEPS = 50;  // Total time points in a single run
const TOTAL_RUNS = 12;  // Total number of runs available to load (Increased from 8 for better demonstration)
const RUNS_PER_LOAD = 3; // <<< NEW: Number of runs to load per button click

/**
 * Generates a single, new model run for a specified feature.
 * The noise is slightly different for each run to simulate variability.
 */
const generateModelRun = (featureKey: FeatureKey, runIndex: number): ModelRun => {
  return Array.from({ length: TIME_STEPS }, (_, i) => {
    let value: number;
    // Introduce variability based on feature type and run index
    if (featureKey === 'featureA') {
      // Increasing trend
      value = (Math.random() * 20 + 70 + (i * 1.5)) * (1 + (runIndex * 0.05));
    } else if (featureKey === 'featureB') {
      // Fluctuation around a high mean
      value = (Math.random() * 200 + 800) * (1 + (runIndex * 0.02));
    } else {
      // Decreasing trend
      value = (700 - (i * 5) + (Math.random() * 50)) * (1 - (runIndex * 0.03));
    }

    return {
      time: i,
      value: parseFloat(value.toFixed(2)),
    };
  });
};

/**
 * Function to simulate progressively fetching a new run.
 * @param runIndex The index of the run to fetch (0, 1, 2, ...)
 * @param featureKey The feature currently selected to define the data values.
 */
const fetchDataChunk = (runIndex: number, featureKey: FeatureKey): Promise<ModelRun> => {
  if (runIndex >= TOTAL_RUNS) {
    return Promise.resolve([]);
  }
  
  return new Promise((resolve) => {
    // Simulate a network delay (same delay regardless of batch size for simplicity)
    setTimeout(() => {
      // Re-generate the run data based on the feature selected
      const newRun = generateModelRun(featureKey, runIndex);
      resolve(newRun);
    }, 500); 
  });
};

const Select: React.FC<React.PropsWithChildren<{ value: string, onValueChange: (value: string) => void }>> = ({ value, onValueChange, children }) => {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        >
            {children}
        </select>
    );
};
const SelectTrigger: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children }) => <>{children}</>;
const SelectValue: React.FC<React.PropsWithChildren<{ placeholder?: string }>> = () => null;
const SelectContent: React.FC<React.PropsWithChildren<{ children: React.ReactNode }>> = ({ children }) => <>{children}</>;
const SelectItem: React.FC<{ value: string, children: React.ReactNode }> = ({ value, children }) => (
    <option value={value}>{children}</option>
);


// --- 4. Main Progressive Chart Component ---

export const ProgressiveIceChart = () => {
  const [runs, setRuns] = useState<ModelRun[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey>('featureA');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // --- Data Loading Logic ---

  const loadData = useCallback(async (isInitial = false) => {
    if (!hasMoreData && !isInitial || isLoading) return;

    setIsLoading(true);
    const currentRunCount = runs.length;
    const runsToLoad: ModelRun[] = [];
    
    try {
      // Fetch RUNS_PER_LOAD new runs
      // Use Promise.all to fetch the batch concurrently for efficiency
      const promises = [];
      for (let i = 0; i < RUNS_PER_LOAD; i++) {
        const runIndex = currentRunCount + i;
        if (runIndex < TOTAL_RUNS) {
          promises.push(fetchDataChunk(runIndex, selectedFeature));
        }
      }

      // Wait for all batch requests to complete
      const batchResults = await Promise.all(promises);
      
      // Filter out any empty results (though mock data prevents this) and add to batch
      batchResults.forEach(run => {
          if (run.length > 0) {
              runsToLoad.push(run);
          }
      });

      if (runsToLoad.length > 0) {
        setRuns(prevRuns => [...prevRuns, ...runsToLoad]);
      }
      
      // Check if we have loaded all available runs
      if (currentRunCount + runsToLoad.length >= TOTAL_RUNS) {
          setHasMoreData(false);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [runs.length, selectedFeature, hasMoreData, isLoading]);

  // Handle Feature Change: Reset runs and trigger initial load for the new feature
  const handleFeatureChange = (value: string) => {
    const newFeature = value as FeatureKey;
    setSelectedFeature(newFeature);
    setRuns([]); // Reset all runs
    setHasMoreData(true);
  };

  // Load the initial run batch on mount AND whenever selectedFeature changes
  useEffect(() => {
    // Only load if runs is empty and we potentially have more data to load
    if (runs.length === 0 && hasMoreData) {
        loadData(true);
    }
  }, [loadData, runs.length, hasMoreData]);



  const displayData = useMemo<RechartPoint[]>(() => {
    // 1. Initialize RechartPoint array for all TIME_STEPS
    const chartData: RechartPoint[] = Array.from({ length: TIME_STEPS }, (_, i) => ({
      time: i,
      average: 0,
    }));

    // 2. Aggregate data from all loaded runs
    chartData.forEach((point, timeIndex) => {
      let totalValue = 0;
      let count = 0;

      runs.forEach((run, runIndex) => {
        const runKey = `run_${runIndex}`;
        
        // Safety check: ensure the run has data for this time step
        if (run[timeIndex]) {
          const value = run[timeIndex].value;
          
          // Set the individual run value for the Recharts point
          point[runKey] = value;
          
          totalValue += value;
          count++;
        }
      });
      
      // 3. Calculate the overall cumulative average at this time step
      point.average = count > 0 ? parseFloat((totalValue / count).toFixed(2)) : 0;
    });

    return chartData;
  }, [runs]);

  // Helper to generate dynamic lines for each run
  const runLines = useMemo(() => {
    return runs.map((_, index) => (
      <Line 
        key={`run_${index}`}
        type="monotone" 
        dataKey={`run_${index}`}
        stroke="color-mix(in srgb, var(--primary) 20%, transparent)" // Light, semi-transparent green
        strokeWidth={1} 
        dot={false}
        name={`Run ${index + 1}`}
        isAnimationActive={false}
        connectNulls={true}
      />
    ));
  }, [runs]);


  return (
    <div>
     <div className="flex items-center space-x-4 mb-5 w-full">
            {/* Dropdown for Feature Selection */}
            <Select value={selectedFeature} onValueChange={handleFeatureChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Feature" />
              </SelectTrigger>
              <SelectContent>
                {featureOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => loadData()} 
              disabled={!hasMoreData || isLoading}
            >
              {isLoading 
                ? `Loading ${RUNS_PER_LOAD} Runs...` 
                : hasMoreData 
                    ? `Load ${RUNS_PER_LOAD} Model Runs (${runs.length}/${TOTAL_RUNS})` 
                    : `All ${TOTAL_RUNS} Runs Loaded`}
            </Button>
          </div>
          
          {/* Chart Placeholder / Loading State */}
          {runs.length === 0 && isLoading ? (
            <div className="h-[450px] flex items-center justify-center text-gray-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Initial Batch Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <LineChart
                data={displayData}
                margin={{ top: 10, right: 30, left: 20, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time Step / Index', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                />
                
                {/* Individual Data Lines (Light Green, Dynamic) */}
                {runLines}
                
                {/* Average Data Line (Bold Red, Static) */}
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="var(--primary)" // A distinct red color
                  strokeWidth={4} // BOLDER LINE
                  dot={false}
                  name="Cumulative Average"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
    </div>
  );
}