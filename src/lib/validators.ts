/** Tiny client-side validators for the auth forms (no external deps). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Please enter a valid email address.";
  if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Your password must contain between 4 and 60 characters.";
  if (value.length < 4 || value.length > 60)
    return "Your password must contain between 4 and 60 characters.";
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Please enter your name.";
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | undefined {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return undefined;
}
