import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import React from 'react';

// types.ts (or within the component file)
interface FeatureImportance {
  name: string;
  description: string;
  score: number;
}

// FeatureImportanceItem.tsx

interface FeatureImportanceItemProps {
  feature: FeatureImportance;
  maxScore: number; // The highest score to normalize the progress bar
}

const FeatureImportanceItem: React.FC<FeatureImportanceItemProps> = ({ feature, maxScore }) => {
  // Calculate progress value based on the highest score for visual comparison
  const progressValue = (feature.score / maxScore) * 100;

  return (
    <div className="space-y-2 py-3 border-b last:border-b-0">
      <div className="flex items-center justify-between">
        {/* Feature Name and Icon */}
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{feature.name}</span>
        </div>
        
        {/* Score */}
        <div className="text-right font-bold text-lg">
          {feature.score.toFixed(1)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center space-x-4">
        <Progress value={progressValue} className="h-2 flex-1" />
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-1">
        {feature.description}
      </p>
    </div>
  );
};

// Using the type defined earlier
interface FeatureImportance {
  name: string;
  description: string;
  score: number;
}

const featureData: FeatureImportance[] = [
  { 
    name: "Feature X", 
    description: "Highly discriminative feature, likely capturing a core business rule.", 
    score: 4.2 
  },
  { 
    name: "Education Years", 
    description: "Significant predictor, model relies heavily on this for upward prediction.", 
    score: 3.5 
  },
  { 
    name: "Age", 
    description: "Moderately important, contributes to subtle changes in prediction.", 
    score: 1.8 
  },
  { 
    name: "Employment Status", 
    description: "The 'Unemployed' category has a strong negative impact on average.", 
    score: 1.5 
  },
  { 
    name: "Income", 
    description: "Least important feature, minimal impact on average prediction.", 
    score: 0.5 
  },
];

const FeatureImportance: React.FC = () => {
  // Determine the highest score for normalization of the progress bars
  const maxScore = Math.max(...featureData.map(f => f.score));

  return <div className="h-[500px] overflow-auto no-scrollbar">
    {featureData.map((feature) => (
          <FeatureImportanceItem 
            key={feature.name}
            feature={feature}
            maxScore={maxScore}
          />
        )
  )}
  </div>;
};

export default FeatureImportance;