"use client";

import type { MouseEvent } from "react";

export function ConfirmSubmit({
  children,
  message,
  name,
  value,
  className,
}: {
  children: string;
  message: string;
  name?: string;
  value?: string;
  className?: string;
}) {
  function confirm(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  return (
    <button
      className={className}
      name={name}
      onClick={confirm}
      type="submit"
      value={value}
    >
      {children}
    </button>
  );
}
