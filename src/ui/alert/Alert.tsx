"use client";

import { X } from "lucide-react";

export type AlertType = "success" | "error" | "info";

export type AlertData = {
  type: AlertType;
  message: string;
} | null;

type AlertProps = {
  alert: AlertData;
  onClose?: () => void;
};

const alertStyles: Record<AlertType, string> = {
  success: "border-[#16a34a] bg-[#16a34a14] text-[#15803d]",
  error: "border-[#dc2626] bg-[#dc262614] text-[#b91c1c]",
  info: "border-[#a6009e] bg-[#a6009e14] text-[#5d0058]",
};

// Alert داخل خود صفحه (به‌جای window.alert)؛ کاملاً با state از بیرون کنترل می‌شود
export default function Alert({ alert, onClose }: AlertProps) {
  if (!alert) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-2 border-2 rounded-md px-3 py-2 text-sm ${alertStyles[alert.type]}`}
    >
      <span>{alert.message}</span>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}