// ui/SocialButton.tsx
"use client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.07-1.6-.2-2.3H12v4.4h6.5c-.28 1.5-1.14 2.8-2.42 3.6v3h3.9c2.28-2.1 3.52-5.2 3.52-8.7z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.9l-3.9-3c-1.08.72-2.48 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.93H1.28v3.1C3.26 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.32A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.6.4-2.32v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.9.46 3.7 1.28 5.42l4.02-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.8l3.44-3.44C17.95 1.2 15.24 0 12 0 7.3 0 3.26 2.7 1.28 6.58l4.02 3.1C6.24 6.85 8.88 4.75 12 4.75z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.1 12.7h-2v7h-2.9v-7H8.6v-2.5h1.6V8.6c0-1.6.95-2.6 2.5-2.6h1.9v2.4h-1.2c-.5 0-.6.2-.6.6v1.2h1.9l-.6 2.5z"
      />
    </svg>
  );
}

export function SocialButton({
  provider,
  onClick,
}: {
  provider: "google" | "facebook";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-gray-800"
    >
      {provider === "google" ? <GoogleIcon /> : <FacebookIcon />}
      Continue with {provider === "google" ? "Google" : "Facebook"}
    </button>
  );
}