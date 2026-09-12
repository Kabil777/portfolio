"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function FlashToasts({
  error,
  warning,
  success,
}: {
  error?: string;
  warning?: string;
  success?: string;
}) {
  useEffect(() => {
    if (error) toast.error(error, { id: `error:${error}` });
    if (warning) toast.warning(warning, { id: `warning:${warning}` });
    if (success) toast.success(success, { id: `success:${success}` });
  }, [error, warning, success]);

  return null;
}
