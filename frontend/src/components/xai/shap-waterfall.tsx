import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// 1. Raw Feature Data Type
interface RawFeatureContribution {
  name: string;
  contribution: number; // The amount the feature contributes (e.g., -0.70)
}

// 2. Chart Data Type (The calculated data used by Recharts)
interface ChartDataPoint {
  name: string;
  contribution: number; // The actual contribution amount
  start: number; // The logit value where the bar begins
  end: number; // The logit value where the bar ends (start + contribution)
  isTotal?: boolean; // To identify the final score bar
}

const rawData: RawFeatureContribution[] = [
  { name: 'Age', contribution: -0.20 },
  { name: 'Income', contribution: -0.70 },
  { name: 'Education Years', contribution: -1.10 },
  { name: 'Feature X', contribution: -0.90 },
  { name: 'Employment Status: Employed', contribution: -0.60 },
];

const transformDataForWaterfall = (data: RawFeatureContribution[]): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];
  let runningTotal = 0; // Starts at 0, the baseline

  // 1. Calculate Start/End for Feature Contributions
  for (const item of data) {
    const start = runningTotal;
    const end = runningTotal + item.contribution;
    
    chartData.push({
      name: item.name,
      contribution: item.contribution,
      start: start,
      end: end,
    });
    runningTotal = end; // Update running total for the next bar's start
  }

  // 2. Add the Model Baseline point
  chartData.unshift({
    name: data[0].name, // "Model Baseline (E[F(x)])"
    contribution: 0,
    start: 0,
    end: 0,
  });

  // 3. Add the Final Logit Score total bar
  chartData.push({
    name: 'Final Logit Score',
    contribution: runningTotal, // This is the total prediction
    start: 0, // Starts from the baseline for the final bar visualization
    end: runningTotal,
    isTotal: true,
  });
  
  return chartData;
};

// Execute transformation
const chartData = transformDataForWaterfall(rawData);

export function ShapWaterfallChart({}){

  const finalScore = rawData.reduce((acc, curr) => acc + curr.contribution, 0);


  return <div className="h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData.filter(d => !d.isTotal && d.contribution !== 0)} // Filter out Total and Baseline for the main chart
          layout="vertical"
          // Increased left margin to accommodate the long feature labels
          margin={{ top: 10, right: 30, left: 160, bottom: 20 }} 
        >
          
          <XAxis 
            type="number" 
            dataKey="end" // Use 'end' for domain calculation
            domain={[-3.60, 0]} 
            tickCount={5}
            tickLine={{ stroke: '#cccccc' }}
          />
          
          <YAxis 
            dataKey="name" 
            type="category" 
            tickLine={false} 
            axisLine={false}
            // Filter out the 'Final Logit Score' from the Y-axis labels
            tickFormatter={(value) => value === 'Final Logit Score' ? '' : value}
          />
          
          <Tooltip 
            formatter={(_, name, props) => 
              name === 'start' ? [] : [`${(props.payload.end).toFixed(3)}`, 'Final Value']
            }
          />
          
          {/* 1. The HIDDEN BAR (The Offset/Spacer) */}
          <Bar 
            dataKey="start" 
            stackId="a" 
            fill="transparent" 
            isAnimationActive={false}
          />
          
          {/* 2. The VISIBLE BAR (The Contribution) */}
          <Bar 
            dataKey="contribution" 
            stackId="a" 
            fill="var(--primary)" 
          />

          <ReferenceLine 
            x={finalScore} 
            stroke="var(--chart-1)"
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
}