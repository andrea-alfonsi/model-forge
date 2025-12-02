import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const chartData = [
  { label: "January", score: 186 },
  { label: "February", score: 305 },
  { label: "March", score: 237 },
  { label: "April", score: 73 },
  { label: "May", score: 209 },
  { label: "June", score: 214 },
]

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig

export function ChartBarDefault() {
  return (
      <ChartContainer config={chartConfig} className='h-[450px] w-full'>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={true}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="score" fill="var(--chart-1)" radius={8} />
        </BarChart>
      </ChartContainer>
  )
}
