import { getRouteApi } from '@tanstack/react-router'
import { ModelSelector } from '@/components/model-selector'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ActionCard } from '@/components/action-card'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { Bar, BarChart, CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { UMapScatter } from '@/components/umap-scatter'
import { ShapWaterfallChart } from '@/components/xai/shap-waterfall'

const route = getRouteApi('/models/playground/$model')

export default function(){
  const {model} = route.useParams()

  return (
    <div className="flex w-full h-full">
      <div className="w-4/5 h-full overflow-y-auto p-4">
        <Tabs defaultValue="prediction-analysis" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="prediction-analysis">Prediction Analysis</TabsTrigger>
            <TabsTrigger value="counterfactual-explorer">Counterfactual Explorer</TabsTrigger>
            <TabsTrigger value="model-insight">Model Insight</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <TabsContent value="prediction-analysis" className="flex-grow">
            <Card className="h-full">
              <CardContent>
                
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Input features
                </h2>
                <div className="flex w-full mb-8">
                  <div className="w-2/5 px-2">
                  {
                    highlightedExamples.map((example, index) => (
                      <ActionCard action='Load' className='my-2' key={index}>
                        <div className="flex items-baseline space-x-2 truncate">{ example.label }</div>
                      </ActionCard>
                      )
                    )
                  }
                  </div>
                  <div className="w-3/5 px-2">{ exampleForm() }</div>
                </div>
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Model prediction
                </h2>
                <div className='flex w-full items-baseline mb-8'>
                  <div className="w-2/5 px-2">
                    <ChartBarDefault />
                  </div>
                  <div className="w-3/5 px-2">
                    <UMapScatter data={highlightedExamples.map( el  => ({...el, coordinates: el.values}))}/>
                  </div>
                </div>
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Feature contribution
                </h2>
                <ShapWaterfallChart />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="counterfactual-explorer" className="flex-grow">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Chat with {model}</CardTitle>
                <CardDescription>
                  This is a placeholder for the chat interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='h-2500'>Chat content goes here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="model-insight" className="flex-grow">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Chat with {model}</CardTitle>
                <CardDescription>
                  This is a placeholder for the chat interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='h-2500'>Chat content goes here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api" className="flex-grow">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>API for {model}</CardTitle>
                <CardDescription>
                  This is a placeholder for the API usage information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>API details go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-1/5 h-full p-4">
        <div className="sticky top-16">
          <Card>
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Model: {model}</p>
              <p>More model details will be displayed here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const highlightedExamples = [
  { values: [0.9, 0.1, 0.8, 0.2], label: 'Exmaple 1'},
  { values: [0.8, 0.2, 0.9, 0.1], label: 'Exmaple 2'},
  { values: [0.1, 0.9, 0.2, 0.8], label: 'Exmaple 3'},
  { values: [0.2, 0.8, 0.1, 0.9], label: 'Exmaple 4'},
]

const models = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "llama-3-8b", label: "Llama 3 8B" },
];

export function PickModelPage(){
  return <div className="flex justify-center items-center h-full p-4">
    <ModelSelector models={models} REDIRECT_BASE_PATH='/models/playground/'/>
    </div>
}


const  exampleForm = () => (
    <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
)



export const description = "A bar chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]


export function ChartBarDefault() {
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "var(--primary)",
    }
  }
  return (
     <ChartContainer config={chartConfig} >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
    </ChartContainer>
  )
}