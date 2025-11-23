import React, { useState, type ElementType } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router'
import { Spinner } from './ui/spinner';

export function StepWrapper({
  children,
  title,
  description,
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  // Removed onAddStepAfter from props
  currentStepIndex,
  totalSteps,
  onSubmit,
  canNext,
  isLoadingNext
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  // Removed onAddStepAfter from props
  currentStepIndex: number;
  totalSteps: number;
  onSubmit: () => void;
  canNext: boolean;
  isLoadingNext: boolean;
}) {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const navigate = useNavigate()

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {/* Updated step count color to grayscale */}
          <span className="ml-2 font-semibold text-gray-600">
            ({currentStepIndex + 1} of {totalSteps})
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {children}
      </CardContent>

      <CardFooter className='justify-between'> 

        { canGoBack ?
            isFirstStep ? <Button
            variant="outline"
            onClick={() => router.history.back()}
          >
            Cancel
          </Button> : 
          <Button
            variant="outline"
            onClick={onPrevious}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          :
          <Button
            variant="outline"
            onClick={() => navigate({to: '/models'})}
          >
            Go to models
          </Button>
        }
        


        {isLastStep ? (
          <Button type="submit" onClick={onSubmit} className="bg-gray-900 hover:bg-gray-700 border-gray-900">
            Submit Form <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={canNext ? onNext: () => {} } disabled={!canNext || isLoadingNext}>
            { isLoadingNext ? <Spinner></Spinner> : <>Next <ChevronRight className="ml-2 h-4 w-4" /></> }
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}


function StepSidebar({ steps, currentStepIndex, setCurrentStepIndex }: {
  steps: string[],
  currentStepIndex: number,
  setCurrentStepIndex: (index: number) => void,
}) {
  return (
    <Card className="w-full md:w-64 mb-6 md:mb-0 shadow-xl md:sticky md:top-16 md:self-start">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Steps</h3>
        <nav className="space-y-1">
          {steps.map((title, index: number) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            const isClickable = isCompleted; 

            return (
              <div
                key={index}
                onClick={() => isClickable && setCurrentStepIndex(index)} 
                className={`
                  flex items-center space-x-3 p-2 rounded-md transition-all duration-150 
                  ${isActive
                    ? 'bg-gray-100 text-gray-900' 
                    : `text-gray-700 ${isCompleted && 'hover:bg-gray-100'}`}
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div 
                  className={`
                    w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full
                    ${isActive 
                      // Grayscale active circle
                      ? 'bg-gray-900 text-white' 
                      : isCompleted
                      // Grayscale completed circle
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`truncate`}>{title}</span>
              </div>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}

export interface StepItem {
  title: string,
  element: ElementType,
  skip: (data: Record<string, any>) => boolean,
  canNext: (data: Record<string, any>) => boolean | Promise<boolean>
  onNext?: (data: Record<string, any>) => boolean| Promise<boolean>,
  onPrevious?: (data: Record<string, any>) => void,
}

function MultiStepForm({ steps }: { steps: StepItem[] } ) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const actualSteps = steps.filter(step => !step.skip(formData));
 

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if ( isSubmitting ){ return }
    setIsSubmitting( true );
    console.log('Final Form Submission:', formData);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleNext = async () => {
    const currentStep = steps[currentStepIndex];
    let canProceed = currentStep.canNext(formData);
    if (canProceed instanceof Promise) {
      setIsLoadingNext(true);
      canProceed = await canProceed;
      setIsLoadingNext(false);
    }

    if (!canProceed) {
      return;
    }

    if (currentStep.onNext) {
      let onNextResult = currentStep.onNext(formData);
      if (onNextResult instanceof Promise) {
        setIsLoadingNext(true);
        onNextResult = await onNextResult;
        setIsLoadingNext(false);
      }

      if (!onNextResult) {
        return;
      }
    }

    if (currentStepIndex === steps.length - 1) {
      handleSubmit();
    } else {
      let nextIndex = currentStepIndex + 1;
      // Skip steps that should be skipped
      while (nextIndex < steps.length - 1 && steps[nextIndex].skip(formData)) {
        nextIndex++;
      }
      setCurrentStepIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep.onPrevious) {
      currentStep.onPrevious(formData);
    }

    if (currentStepIndex > 0) {
      let previousStep = currentStepIndex - 1;
      while( previousStep > 0 && steps[previousStep].skip(formData)) {
        previousStep--;
      }
      setCurrentStepIndex(previousStep);
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  if ( steps[currentStepIndex].skip(formData) && !isLastStep && !isSubmitting) {
    setCurrentStepIndex( index => index + 1)
  }
  const CurrentStepComponent = steps[currentStepIndex].element;
  
  return (
    <div className="h-full flex flex-col items-center sm:p-8 font-sans w-full">
      <div className="flex flex-col md:flex-row w-full max-w-5xl md:space-x-6">
        <StepSidebar 
          steps={actualSteps.map( el => el.title)} 
          currentStepIndex={ actualSteps.findIndex( step => step == steps[currentStepIndex])  } 
          setCurrentStepIndex={(index: number) => setCurrentStepIndex( steps.findIndex( step => step === actualSteps[index] ) )}
        />
        <div className="flex-1 h-full overflow-y-auto">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <CurrentStepComponent
                handleChange={handleChange}
                formData={formData} 
                onPrevious={handlePrevious}
                onNext={handleNext}
                currentStepIndex={actualSteps.findIndex( step => step == steps[currentStepIndex])}
                totalSteps={actualSteps.length}
                isFirstStep={currentStepIndex === 0}
                isLastStep={isLastStep}
                canNext={steps[currentStepIndex].canNext(formData)}
                onSubmit={handleSubmit}
                isLoadingNext={isLoadingNext}
                isSubmitting={isSubmitting}
              />
            </form>
        </div>
      </div>
    </div>
  );
}

export default MultiStepForm;