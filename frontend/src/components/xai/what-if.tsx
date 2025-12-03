import React, { useState, useCallback, useMemo } from 'react';
import { Zap, TrendingUp, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

// --- TYPE DEFINITIONS ---
type PredictionResult = 'Approved' | 'Denied';
type Feature = 'Age' | 'Income' | 'Education' | 'CreditScore';

interface InputFeatures {
  Age: number;
  Income: number;
  Education: string; // 'High School', 'Bachelors', 'Masters'
  CreditScore: number;
}

interface Counterfactual {
  id: number;
  targetFeature: string;
  originalValue: string | number;
  requiredChange: string;
  resultingPrediction: string;
  impactScore: number; // 0 to 100
}

interface MockApiResponse {
  newPrediction: PredictionResult;
  counterfactuals: Counterfactual[];
}

// --- MOCK API CALL SIMULATION ---
const MOCK_PREDICTION_THRESHOLD = 170; // Internal ML score to flip prediction

/**
 * Simulates a backend service that calculates counterfactuals.
 * In a real application, this would call a model explanation library (e.g., Alibi, DiCE)
 * integrated with the deployed ML model.
 */
const generateCounterfactuals = (
  features: InputFeatures,
): Promise<MockApiResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // 1. Determine base score (simulated)
      const educationScore = features.Education === 'Masters' ? 30 : features.Education === 'Bachelors' ? 20 : 10;
      const baseScore = features.CreditScore / 10 + features.Income / 10000 + educationScore;

      // 2. Determine new prediction
      const newPrediction: PredictionResult = baseScore >= MOCK_PREDICTION_THRESHOLD ? 'Approved' : 'Denied';

      let counterfactuals: Counterfactual[] = [];

      // 3. Generate suggested changes only if the new prediction is still 'Denied' (i.e., we are trying to flip the outcome)
      if (newPrediction === 'Denied') {
        const creditIncrease = 50;
        const incomeIncrease = 15000;
        const upgradeEducation = features.Education === 'Bachelors' ? 'Masters' : 'Bachelors';

        counterfactuals = [
          {
            id: 1,
            targetFeature: 'CreditScore',
            originalValue: features.CreditScore,
            requiredChange: `Increase to ${features.CreditScore + creditIncrease}`,
            resultingPrediction: 'Approved',
            impactScore: 90,
          },
          {
            id: 2,
            targetFeature: 'Income',
            originalValue: features.Income.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
            requiredChange: `Increase to $${(features.Income + incomeIncrease).toLocaleString('en-US')}`,
            resultingPrediction: 'Approved',
            impactScore: 75,
          },
          {
            id: 3,
            targetFeature: 'Education',
            originalValue: features.Education,
            requiredChange: `Obtain a ${upgradeEducation}`,
            resultingPrediction: features.Education !== 'Masters' ? 'Approved' : 'Denied', // Fails if already Masters
            impactScore: features.Education !== 'Masters' ? 60 : 10,
          },
        ].filter(cf => cf.resultingPrediction === 'Approved'); // Only show effective counterfactuals
      }

      resolve({ newPrediction, counterfactuals });
    }, 1500); // 1.5 second loading time
  });
};

// --- CONSTANTS AND INITIAL STATE ---

const INITIAL_FEATURES: InputFeatures = {
  Age: 32,
  Income: 5000,
  Education: 'High School',
  CreditScore: 60,
};

const INITIAL_PREDICTION: PredictionResult = 'Denied';


const App: React.FC = () => {
  const [initialFeatures] = useState<InputFeatures>(INITIAL_FEATURES);
  const [currentFeatures, setCurrentFeatures] = useState<InputFeatures>(INITIAL_FEATURES);
  const [originalPrediction] = useState<PredictionResult>(INITIAL_PREDICTION);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult>(INITIAL_PREDICTION);
  const [counterfactuals, setCounterfactuals] = useState<Counterfactual[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  // Handlers for feature changes
  const handleFeatureChange = useCallback((feature: Feature, value: string | number) => {
    setCurrentFeatures(prev => ({
      ...prev,
      [feature]: value,
    }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setIsGenerated(true);
    setCounterfactuals([]);
    setCurrentPrediction('Denied'); // Reset prediction visually

    try {
      const { newPrediction, counterfactuals: cf } = await generateCounterfactuals(currentFeatures);
      setCurrentPrediction(newPrediction);
      setCounterfactuals(cf);
    } catch (error) {
      console.error('Error generating counterfactuals:', error);
      // Fallback message
      setCurrentPrediction('Denied');
      setCounterfactuals([{
        id: 0,
        targetFeature: 'Age',
        originalValue: '',
        requiredChange: 'API Error: Could not generate counterfactuals.',
        resultingPrediction: 'Denied',
        impactScore: 0
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFeatures]);

  const originalFeaturesFormatted = useMemo(() => ({
    ...initialFeatures,
    Income: initialFeatures.Income.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
  }), [initialFeatures]);

  return (
    <div className="min-h-screen p-6 sm:p-10 font-sans antialiased flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card title="Input Features" className="lg:col-span-1 h-fit">
            <div className="space-y-6">
              {/* Age */}
              <div>
                <Label htmlFor="Age">Age: <span className="font-semibold text-indigo-600">{currentFeatures.Age}</span></Label>
                <Slider
                  id="Age"
                  min={18}
                  max={80}
                  step={1}
                  value={[currentFeatures.Age]}
                  // onChange={(val) => handleFeatureChange('Age', val)}
                />
              </div>

              {/* Income */}
              <div>
                <Label htmlFor="Income">Annual Income ($)</Label>
                <Input
                  id="Income"
                  type="number"
                  min={0}
                  step={5000}
                  value={currentFeatures.Income}
                  onChange={(e) => handleFeatureChange('Income', Number(e.target.value))}
                />
              </div>

              {/* Credit Score */}
              <div>
                <Label htmlFor="CreditScore">Credit Score: <span className="font-semibold text-indigo-600">{currentFeatures.CreditScore}</span></Label>
                <Slider
                  id="CreditScore"
                  min={500}
                  max={850}
                  step={10}
                  value={[currentFeatures.CreditScore]}
                  // onChange={(val) => handleFeatureChange('CreditScore', val)}
                />
              </div>

              {/* Education */}
              <div>
                <Label htmlFor="Education">Education Level</Label>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Bachrlor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Counterfactuals'}
                </Button>
              </div>
            </div>
          </Card>

          {/* --- Column 2 & 3: Results and Explanation --- */}
          <div className="lg:col-span-2 space-y-8">
            <Card title="Prediction Snapshot">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Original Prediction */}
                <div className="border p-4 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500">Original Prediction</p>
                  <div className="mt-2 text-2xl font-bold">
                    <Badge variant={"default"}>{originalPrediction}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Based on initial features (pre-run).</p>
                </div>

                {/* Current Prediction */}
                <div className="border p-4 rounded-lg bg-white shadow-sm md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-indigo-500" />
                    Current Prediction
                  </p>
                  <div className="mt-2 text-3xl font-extrabold flex items-center">
                    {isLoading && (
                      <Loader2 className="h-6 w-6 mr-3 text-indigo-500 animate-spin" />
                    )}
                    {isGenerated && !isLoading ? (
                        <Badge variant={"default"} className="text-xl px-4 py-1.5">
                            {currentPrediction}
                        </Badge>
                    ) : (
                        <span className="text-gray-400 text-lg italic">Run to see result...</span>
                    )}
                  </div>
                </div>

              </div>
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Current Input Summary:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {Object.entries(currentFeatures).map(([key, value]) => (
                    <div key={key} className="p-3 bg-indigo-50 rounded-lg">
                      <p className="font-medium text-indigo-700">{key}</p>
                      <p className="text-gray-900 mt-1 font-mono">
                        {key === 'Income' ? `$${value}` : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* --- Counterfactual Results --- */}
            <Card title="Counterfactual Explanation (How to flip the outcome)">
              {isLoading && (
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
                </div>
              )}

              {!isGenerated && !isLoading && (
                <div className="text-center py-10 text-gray-500 italic">
                    Adjust the features and click "Generate Counterfactuals" to find the minimal changes needed to flip the prediction!
                </div>
              )}

              {isGenerated && !isLoading && counterfactuals.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Feature to Change
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Required Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Impact Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {counterfactuals.map((cf, index) => (
                        <tr key={cf.id} className="hover:bg-indigo-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                            {cf.targetFeature}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {cf.requiredChange}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center">
                              <span className="w-12 mr-2 font-bold">{cf.impactScore}%</span>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-indigo-500 h-2.5 rounded-full"
                                  style={{ width: `${cf.impactScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {cf.resultingPrediction === 'Approved' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Message if prediction is already approved */}
              {isGenerated && !isLoading && currentPrediction === 'Approved' && (
                <div className="text-center py-10 bg-green-50 border-2 border-green-200 rounded-xl">
                  <CheckCircle className="w-10 h-10 mx-auto text-green-600 mb-4" />
                  <p className="text-xl font-semibold text-green-700">Prediction is already Approved!</p>
                  <p className="text-green-600 mt-1">No counterfactuals needed for the current input features.</p>
                </div>
              )}

              {/* Message if still denied and no counterfactuals found */}
              {isGenerated && !isLoading && currentPrediction === 'Denied' && counterfactuals.length === 0 && (
                <div className="text-center py-10 bg-red-50 border-2 border-red-200 rounded-xl">
                  <XCircle className="w-10 h-10 mx-auto text-red-600 mb-4" />
                  <p className="text-xl font-semibold text-red-700">Outcome Denied</p>
                  <p className="text-red-600 mt-1">The model could not find effective counterfactuals given your current input constraints.</p>
                </div>
              )}

            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;