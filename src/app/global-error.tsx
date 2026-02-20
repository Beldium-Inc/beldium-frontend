"use client";

import { Button } from "antd";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>

          <p className="mb-6 text-gray-600">
            An unexpected error occurred. Please try again.
          </p>

          <Button type="primary" onClick={reset}>
            Reload Page
          </Button>
        </div>
      </body>
    </html>
  );
}
