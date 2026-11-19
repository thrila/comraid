import type { FieldErrors, FieldValues } from "react-hook-form";
import { toast } from "react-toastify";

/** `handleSubmit` invalid-callback: shows the first validation message as a toast. */
export function toastFirstError<T extends FieldValues>(errors: FieldErrors<T>) {
  const first = Object.values(errors)[0];
  const message = typeof first?.message === "string" ? first.message : "Please check the form";
  toast.error(message, { toastId: "form-error" });
}
