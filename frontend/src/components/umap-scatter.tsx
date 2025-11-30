
import { type DataMatrix, type UMAPCoordinates, calculateUmapCoordinates } from '@/lib/umap'
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface UMapScatterProps {
  data: { coordinates: Array<number>, highlight?: boolean, label: string  }[]
}

export function UMapScatter({ data: rawData }: UMapScatterProps ){
  
  let coordinates: UMAPCoordinates;
  try {
    coordinates = calculateUmapCoordinates(rawData.map( d => d.coordinates ) as DataMatrix, 2, 1)
  } catch {
    return <ChartContainer config={{}} className="min-h-[300px] w-full">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        
        <XAxis
          type="number"
          dataKey="x"
          name="X Value"
          stroke="hsl(var(--foreground))"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value.toFixed(2)}`}
        />

        <YAxis
          type="number"
          dataKey="y"
          name="Y Value"
          stroke="hsl(var(--foreground))"
          axisLine={false} 
          tickLine={false}
          tickFormatter={(value: any) => `${value.toFixed(2)}`}
        />
        <text x="50%" y ="50%" dominant-baseline="middle" text-anchor="middle">Not enough data to plot</text>
      </ScatterChart>
    </ChartContainer>;
  }
  const data = rawData.map((d, i) => ({
    x: coordinates[i][0],
    y: coordinates[i][1],
    highlight: d.highlight,
    label: d.label
  }));

  const highlight = data.filter( el => el.highlight === true )
  const groups = data.filter( el => el.highlight !== true )
                     .reduce<Record<string, any>>( 
                        (prev, curr) => prev[curr.label] ? 
                          {...prev, [curr.label]: [...prev[curr.label], curr]} : 
                          {...prev, [curr.label]: [curr]},
                        {}
                      )
  
  const chartConfig = Object.fromEntries(
      Object.entries( groups ).map( ([key, _], index) => [key, {label: key, color: `var(--chart-${index + 1})`}] )
    ) as ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        
        <XAxis
          type="number"
          dataKey="x"
          name="X Value"
          stroke="hsl(var(--foreground))"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value.toFixed(2)}`}
        />

        <YAxis
          type="number"
          dataKey="y"
          name="Y Value"
          stroke="hsl(var(--foreground))"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: any) => `${value.toFixed(2)}`}
        />
        
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

        {
          Object.entries( groups ).map( ([key, value]) => <Scatter
            key={key}
            name={key} 
            data={value} 
            fill={chartConfig[key].color}
          /> ) 
        }
        
        <Scatter
          name="Highlight" 
          data={highlight} 
          fill={'hsl(var(--background))'}
          shape={HighlightScatterPoint}
        />
      </ScatterChart>
    </ChartContainer>
  );
}


const HighlightScatterPoint = (props: any) => {
    const { cx, cy, fill } = props;

    // Default radius and stroke
    const r = 5;
    const stroke = 'hsl(var(--primary))' ;
    const strokeWidth = 2;

    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={r} 
        fill={fill} 
        stroke={stroke} 
        strokeWidth={strokeWidth}
        className={"opacity-100 transition-opacity"}
      />
    );
  };
