import { type FieldValues, type FieldPath, type Control, Controller } from 'react-hook-form';
import { Input, type InputProps } from './Input';
import { Label } from './Label';

export interface FormFieldProps<TFieldValues extends FieldValues>
  extends Omit<InputProps, 'name' | 'defaultValue'> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
}

export function FormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: FormFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorId = `${name}-error`;

        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? errorId : undefined}
              {...field}
              {...inputProps}
            />
            {fieldState.error ? (
              <p id={errorId} role="alert" className="text-sm font-medium text-red-600">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
