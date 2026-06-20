import { type FormHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface FormGroupProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export function FormGroup({ children, className, ...props }: FormGroupProps) {
  return (
    <form className={cn('flex w-full flex-col gap-4', className)} noValidate {...props}>
      {children}
    </form>
  );
}
