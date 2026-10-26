export const PASSWORD_REQUIREMENTS = [
  {
    label: "8–72 characters",
    test: (password: string) => password.length >= 8 && password.length <= 72,
  },
  {
    label: "At least one uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "At least one lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "At least one number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "At least one special character",
    test: (password: string) => /[^A-Za-z0-9\s]/.test(password),
  },
  {
    label: "No spaces",
    test: (password: string) => !/\s/.test(password),
  },
] as const;

export function meetsPasswordRequirements(password: string) {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));
}
