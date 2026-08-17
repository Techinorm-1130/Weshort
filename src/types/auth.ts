export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;
