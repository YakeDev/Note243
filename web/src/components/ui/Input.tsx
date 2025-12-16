import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, id, error, ...props }, ref) => {
    const input = (
      <input
        id={id}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background",
          error ? "border-destructive focus-visible:ring-destructive" : "",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    return (
      <div className="space-y-1">
        {label ? (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        {input}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
