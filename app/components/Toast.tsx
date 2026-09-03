import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number; // Auto-dismiss time in ms (default 3000ms)
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
        isSuccess
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded p-1 transition-colors hover:bg-black/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};