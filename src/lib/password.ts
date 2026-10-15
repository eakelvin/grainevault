export const PASSWORD_MIN_LENGTH = 8;

/** New passwords only. Sign-in still accepts whatever the account already uses. */
export function passwordError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include a letter and a number.";
  }
  return null;
}
