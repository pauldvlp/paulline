import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@paulline/schemas';
import type { LoginInput } from '@paulline/types';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { FormGroup } from '../molecules/FormGroup';

const DEFAULT_VALUES: LoginInput = {
  email: '',
  password: '',
};

export interface LoginFormProps {
  onSubmit: (values: LoginInput) => Promise<void> | void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  });

  return (
    <FormGroup onSubmit={handleSubmit((values) => onSubmit(values))}>
      <FormField control={control} name="email" label="Email" type="email" autoComplete="email" />
      <FormField
        control={control}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />
      <Button type="submit" disabled={formState.isSubmitting}>
        Log in
      </Button>
    </FormGroup>
  );
}
