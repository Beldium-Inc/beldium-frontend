// components/PasswordRules.tsx
interface Props {
  password: string;
}

export function PasswordRules({ password }: Props) {
  const rules = [
    { label: "One uppercase letter", valid: /[A-Z][a-z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /[0-9]/.test(password) },
    { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "At least 8 characters", valid: password.length >= 8 },
  ];

  return (
    <ul className="text-sm flex flex-wrap gap-3">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`${
            rule.valid ? "text-green-600 bg-secondary" : "text-gray-400"
          } border border-green text-xs p-1 rounded-xl`}
        >
          {rule.valid ? "✔" : "✖"} {rule.label}
        </li>
      ))}
    </ul>
  );
}
