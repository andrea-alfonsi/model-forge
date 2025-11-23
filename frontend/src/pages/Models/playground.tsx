import { ModelSelector } from '@/components/model-selector'
import { getRouteApi } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

const route = getRouteApi('/models/playground/$model')

export default function(){
  const {model} = route.useParams()

  return <p>{model}</p>
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