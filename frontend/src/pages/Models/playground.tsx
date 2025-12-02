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
import { UMapScatter } from '@/components/umap-scatter'
import { ShapWaterfallChart } from '@/components/xai/shap-waterfall'
import { ExampleForm } from '@/components/example-form'
import { ChartBarDefault } from '@/components/chart-bar-default'
import { HighlightedExamples } from '@/components/replays'
import FeatureImportance from '@/components/xai/feature-importance'
import { ProgressiveIceChart } from '@/components/xai/ice-chart'
import WhatIf from "@/components/xai/what-if"

const route = getRouteApi('/models/playground/$model')

const highlightedExamples = [
  { values: [0.9, 0.1, 0.8, 0.2], label: 'Exmaple 1'},
  { values: [0.8, 0.2, 0.9, 0.1], label: 'Exmaple 1'},
  { values: [0.1, 0.9, 0.2, 0.8], label: 'Exmaple 3'},
  { values: [0.2, 0.8, 0.1, 0.9], label: 'Exmaple 4'},
]

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
            <div className="grid grid-cols-3 grid-rows-[20vh,250px,250px] gap-4 h-full">
              <Card className="col-span-2 row-span-1">
                <CardHeader>
                  <CardTitle>Input features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExampleForm />
                </CardContent>
              </Card>
              <Card className="col-span-1 row-span-1">
                <CardHeader>
                  <CardTitle>Replays</CardTitle>
                </CardHeader>
                <CardContent>
                  <HighlightedExamples />
                </CardContent>
              </Card>
              <Card className="col-span-1 row-span-1">
                <CardHeader>
                  <CardTitle>Model prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartBarDefault />
                </CardContent>
              </Card>
              <Card className="col-span-2 row-span-1">
                <CardHeader>
                  <CardTitle>Umap Scatter</CardTitle>
                </CardHeader>
                <CardContent>
                  <UMapScatter data={highlightedExamples.map( el  => ({...el, coordinates: el.values}))}/>
                </CardContent>
              </Card>
              <Card className="col-span-3 row-span-1">
                <CardHeader>
                  <CardTitle>Feature contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShapWaterfallChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="counterfactual-explorer" className="flex-grow">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>What if</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatIf />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="model-insight" className="flex-grow">
            <div className="grid grid-cols-3 grid-rows-[600px] gap-4 h-full">
              <Card className="col-span-1 row-span-1">
                <CardHeader>
                  <CardTitle>Feature importance</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeatureImportance />
                </CardContent>
              </Card>
              <Card className="col-span-2 row-span-1">
                <CardHeader>
                  <CardTitle>ICE Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressiveIceChart />
                </CardContent>
              </Card>
            </div>
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