import MultiStepForm, { StepWrapper } from "@/components/stepper";
import { TabularFilePreview } from "@/components/tabular-file-preview";
import { Combobox } from "@/components/ui/combobox";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAPI } from "@/contexts/ApiContext";

export default function(){
  const { api } = useAPI()
  const initialSteps = [
    { title: "General", element: ModelNameAndTask, skip: () => false, canNext: (data: Record<string, any>) => !!data.modelName && !!data.task },
    // create the cannext step
    { title: "Dataset", element: ChooseDataset, skip: () => false, canNext: (data: Record<string, any>) => console.log(data) ?? !!data.dataset, onNext: (data: Record<string, any>) => new Promise<boolean>( (res) => { api.datasets.create(data.dataset?.name, "tabular").then( () =>  res(true)).catch( () =>res(false) )}) },
    { title: "Dataset customization", element: DynamicExtraStep, skip: ( data: Record<string, any>) => !data.email?.endsWith("@gmail.com"), canNext: () => true },
    { title: "Address Details", element: AddressInfoStep, skip: () => false, canNext: () => true },
  ];
  return <MultiStepForm steps={initialSteps}></MultiStepForm>
}

const TASKS = [
  {label: "Tabular Classification", value: "tabular_classification"},
  {label: "Tabular Regression", value: "tabular_regression"},
  {label: "Text Classification", value: "text_classification"},
  {label: "Text Generation", value: "text_generation"},
  {label: "Image Classification", value: "image_classification"}
]


function ModelNameAndTask(props: any) {
  return (
    <StepWrapper
      {...props}
      title="Model name and task"
      description="Chose the model you want to create."
    >
      <div className="space-y-4">
        <Field 
            name="modelName" 
            label="Model Name" 
            placeholder="You model name here" 
            defaultValue={props.formData['modelName']} 
            required 
            onChange={(e) => props.handleChange('modelName', e.target.value)} 
          />
          <div className="space-y-1">
            <Label htmlFor={'task'}>{'Task'}</Label>
            <Combobox 
              options={TASKS}
              placeholder={"Select task"}
              searchPlaceholder="Search task..."
              defaultValue={props.formData['task']}
              buttonClassName="w-full"
              contentClassName="w-[600px]"
              onChange={(e) => props.handleChange('task', e)}
            ></Combobox>
          </div>
      </div>
    </StepWrapper>
  );
}


function ChooseDataset(props: any) {
  return (
    <StepWrapper
      {...props}
      title="Dataset"
      description="Select the dataset you want to use to train the model"
    >
      <TabularFilePreview onChange={({file}) =>{
        props.handleChange('dataset', file)
      }}></TabularFilePreview>
    </StepWrapper>
  );
}


function AddressInfoStep(props: any) {
  return (
    <StepWrapper
      {...props}
      title="Address Details"
      description="Your primary residential address."
    >
      <div className="space-y-4">
        <Field name="addressLine1" label="Address Line 1" placeholder="123 Main St" defaultValue={props.formData['addressLine1'] ||''}/>
        <Field name="city" label="City" placeholder="San Francisco"  defaultValue={props.formData['city'] ||''}/>

        <p className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-100">
          Data from Step 2: {props.formData.email}
        </p>
      </div>
    </StepWrapper>
  );
}


function DynamicExtraStep(props: any) {
  const dynamicFieldName = `dynamicField_${props.currentStepIndex}`;
  return (
    <StepWrapper
      {...props}
      title={`Gmail Specific Offer`}
      description="Since you use a Gmail address, here is an optional extra step for you."
    >
      <div className="space-y-4">
        <Field 
          name={dynamicFieldName} 
          label="Optional Feature Opt-in" 
          placeholder="Enter a keyword related to your interest"
          value={props.formData[dynamicFieldName] || ''}
          onChange={(e) => props.handleChange(dynamicFieldName, e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-100">
          Your Gmail address: {props.formData.email}
        </p>
      </div>
    </StepWrapper>
  );
}

const Field = ({ name, label, type = 'text', placeholder, onChange, value, defaultValue, required }: { name: string, label: string, type?: string, placeholder?: string, onChange?: (e: any) => void, value?: any, defaultValue?: any, required?: boolean }) => {
  
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        required={required}
        onChange={onChange}
      />
    </div>
  );
}