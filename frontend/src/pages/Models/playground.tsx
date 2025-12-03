import { type WidgetProps } from '@rjsf/utils'
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
import { ChartBarDefault } from '@/components/chart-bar-default'
import { HighlightedExamples } from '@/components/replays'
import FeatureImportance from '@/components/xai/feature-importance'
import { ProgressiveIceChart } from '@/components/xai/ice-chart'
import WhatIf from "@/components/xai/what-if"
import JSONForm from '@/components/json-form'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

const route = getRouteApi('/models/playground/$model')

const highlightedExamples = [
  { values: [0.9, 0.1, 0.8, 0.2], label: 'Exmaple 1'},
  { values: [0.8, 0.2, 0.9, 0.1], label: 'Exmaple 1'},
  { values: [0.1, 0.9, 0.2, 0.8], label: 'Exmaple 3'},
  { values: [0.2, 0.8, 0.1, 0.9], label: 'Exmaple 4'},
]

const schema = {
  "type": "object",
  "required": [
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First name",
      "default": "Chuck"
    },
    "lastName": {
      "type": "string",
      "title": "Last name"
    },
    "age": {
      "type": "integer",
      "title": "Age"
    },
    "bio": {
      "type": "number",
      "title": "Bio"
    },
    "password": {
      "type": "string",
      "title": "Password",
      "minLength": 3
    },
    "telephone": {
      "type": "string",
      "title": "Telephone",
      "minLength": 10
    }
  }
};

const uiSchema = {
  "firstName": {
    "ui:autofocus": true,
    "ui:emptyValue": "",
    "ui:placeholder": "ui:emptyValue causes this field to always be valid despite being required",
    "ui:autocomplete": "family-name",
    "ui:enableMarkdownInDescription": true,
    // "ui:description": "Make text **bold** or *italic*. Take a look at other options [here](https://markdown-to-jsx.quantizor.dev/)."
  },
  "lastName": {
    "ui:autocomplete": "given-name",
    "ui:enableMarkdownInDescription": true,
    // "ui:description": "Make things **bold** or *italic*. Embed snippets of `code`. <small>NOTE: Unsafe HTML, not rendered</small> "
  },
  "age": {
    "ui:widget": "slider",
    "ui:title": "Age of person",
    // "ui:description": "(earth year)"
  },
  "bio": {
    "ui:widget": "slider"
  },
  "password": { 
    "ui:widget": "password",
    // "ui:help": "Hint: Make it strong!"
  },
  "telephone": {
    "ui:options": {
      "inputType": "tel"
    }
  }
};

const SliderWidget = (props: WidgetProps) => {
  const { onChange, value } = props;
  return (
    <div className='w-full flex items-center gap-2'>
    <Slider
      defaultValue={[0]}
      value={typeof value === 'number' ? [value] : [0]}
      onValueChange={(newValue: number[]) => {
        onChange(newValue[0]);
      }}
      min={0}
      max={100}
      step={1}
    />
    <span className="w-[5ch]">{value??0}</span>
    </div>
  );
};

const InputWidget = (props: WidgetProps) => {
  const { onChange, value, type } = props;
  return (
    <Input
      type={type}
      value={value ?? ''}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    />
  );
};

// 4. Register your custom widgets
const customWidgets = {
  slider: SliderWidget,
  text: InputWidget,
  password: InputWidget
};

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
                  <JSONForm
                    schema={schema as any}
                    uiSchema={uiSchema}
                    widgets={customWidgets as any}
                    onChange={console.log}
                  />
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