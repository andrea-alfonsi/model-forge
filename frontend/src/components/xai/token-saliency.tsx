import { useCallback, useEffect, useMemo, useState } from "react";

interface SaliencyItem {
  word: string;
  gradient: number;
}

export default function TokenSaliency({ text }: {text: string }){
  const [saliencyData, setSaliencyData] = useState<SaliencyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates mock saliency data (word and gradient) for the input text.
   * In a real application, this would be the actual API call.
   */
  const simulateApiCall = useCallback(async (text: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSaliencyData([]);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Basic tokenization by splitting on spaces and punctuation (keeping the punctuation with the word)
      const words = text.match(/\b\w+[\.,?!]?\b|\s+/g) || [];
      const nonSpaceWords = words.filter(w => w.trim().length > 0);
      
      if (nonSpaceWords.length === 0) {
        throw new Error("Input text is empty or only contains spaces.");
      }

      // 1. Generate realistic-looking mock saliency scores (gradients)
      const mockSaliencyData: SaliencyItem[] = nonSpaceWords.map((word, index) => {
        // Assign higher importance to specific keywords (simulating model focus)
        let gradient: number;
        const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');

        if (['generative', 'ai', 'model', 'risks', 'opportunities', 'investors'].includes(lowerWord)) {
          // High importance (positive and negative)
          gradient = (Math.random() * 0.8 + 0.2) * (index % 2 === 0 ? 1 : -1);
        } else if (['the', 'a', 'for', 'and', 'the'].includes(lowerWord)) {
          // Low importance (close to zero)
          gradient = (Math.random() * 0.1 - 0.05);
        } else {
          // Medium importance
          gradient = (Math.random() * 0.5 - 0.25);
        }

        // Add the spaces back for rendering, but assign the gradient only to the word token
        // Find the original token including trailing spaces/punctuation
        // This is a simplified approach, actual tokenization is more complex.
        const originalToken = words.find(t => t.includes(word.trim()));

        return {
          word: originalToken || word,
          gradient: gradient
        };
      });

      setSaliencyData(mockSaliencyData);
    } catch (e: any) {
      console.error(e);
      // Ensure error is a string
      setError("Failed to process text. " + (e.message || "An unknown error occurred."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Use Memo to calculate the max absolute gradient for normalization
  const maxAbsGradient: number = useMemo(() => {
    if (saliencyData.length === 0) return 1;
    return Math.max(...saliencyData.map(d => Math.abs(d.gradient)));
  }, [saliencyData]);

  /**
   * Calculates the Tailwind CSS class for a word based on its gradient score.
   * Maps score to a heatmap color/opacity.
   */
  const calculateSaliencyColor = (gradient: number): string => {
    const absGradient = Math.abs(gradient);
    
    // Normalize the score (0 to 1)
    const normalized = maxAbsGradient > 0 ? absGradient / maxAbsGradient : 0;
    
    // Map normalized score (0-1) to Tailwind color steps for visual emphasis.
    let opacityClass: string;

    if (normalized > 0.8) {
      opacityClass = 'bg-red-300/80'; // Very high importance
    } else if (normalized > 0.6) {
      opacityClass = 'bg-red-300/60';
    } else if (normalized > 0.4) {
      opacityClass = 'bg-red-300/40';
    } else if (normalized > 0.2) {
      opacityClass = 'bg-red-300/20';
    } else if (normalized > 0.05) {
      opacityClass = 'bg-red-300/10';
    } else {
      opacityClass = ''; // Negligible importance
    }

    // Use red for highlighting; adjust to blue/green if gradients represent sentiment
    return `inline-block p-0.5 rounded-sm transition-colors duration-300 ${opacityClass}`;
  };

  const handleRunSaliency = (): void => {
    simulateApiCall(text);
  };
  
  // Run saliency calculation once on load for the default text
  useEffect(() => {
    handleRunSaliency();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-full p-4 sm:p-8 flex justify-center items-start font-inter">
      <div className="w-full max-w-4xl space-y-8">

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        { loading && (
          <p>Loading... </p>
        )}

        {saliencyData.length > 0 && (
          <>
              <div className="border p-4 rounded-lg min-h-[150px] text-lg leading-relaxed shadow-inner">
                {saliencyData.map((data: SaliencyItem, index: number) => (
                  <span 
                    key={index} 
                    title={`Gradient: ${data.gradient.toFixed(4)}`}
                    className={calculateSaliencyColor(data.gradient)}
                  >
                    {data.word}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                <span className="font-medium">Legend:</span>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 rounded-sm bg-red-300/80 mr-2 border"></span> High Importance
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 rounded-sm bg-red-300/20 mr-2 border"></span> Medium Importance
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 rounded-sm bg-transparent mr-2 border"></span> Low Importance
                </div>
              </div>
          </>
        )}
      </div>
    </div>
  );
}