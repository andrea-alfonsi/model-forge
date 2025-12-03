import { type FormEvent } from 'react';
import Form, { type IChangeEvent } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { type RJSFSchema, type UiSchema, type RegistryWidgetsType } from '@rjsf/utils';
import { Button } from './ui/button';


export type JSONFormProps<FormData> = { 
  schema: RJSFSchema, 
  uiSchema: UiSchema, 
  onChange?: (data?: FormData) => void,
  onSubmit?: (data: IChangeEvent<FormData, RJSFSchema, any>, event: FormEvent<any>) => void,
  widgets: RegistryWidgetsType 
}

export default function JSONForm<FormData>({ schema, uiSchema, widgets, onChange, onSubmit }: JSONFormProps<FormData>){

  const CustomSubmitButton = () => (
    <Button type="submit" className="mt-4">
      Submit Configuration
    </Button>
  );

  return (
      <Form<FormData>
        schema={schema}
        uiSchema={uiSchema}
        widgets={widgets}
        validator={validator}
        onChange={(e) => onChange?.(e.formData)}
        onSubmit={onSubmit}
      >
        { onSubmit ? <CustomSubmitButton />  : <></>}
      </Form>
  );
}