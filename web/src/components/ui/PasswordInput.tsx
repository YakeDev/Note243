"use client";

import { useState } from "react";
import { Input } from "./Input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function PasswordInput({ error, label, id, className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          label={label}
          id={id}
          error={error}
          className={`${className} pr-16`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-9 text-xs font-semibold text-slate-500 hover:text-primary"
          tabIndex={-1}
        >
          {visible ? "Masquer" : "Voir"}
        </button>
      </div>
    </div>
  );
}
