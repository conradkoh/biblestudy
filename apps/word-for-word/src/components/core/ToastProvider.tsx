import { Toast } from "@/src/components/core/Toast";
import { CommonEvents } from "@/src/hooks/useEvents";
import React, { useState } from "react";
import { View } from "react-native";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; duration?: number } | null>(null);

  React.useEffect(() => {
    const handleShowToast = (data: { message: string; duration?: number }) => {
      setToast(data);
    };

    CommonEvents.on("SHOW_TOAST", handleShowToast);

    return () => {
      CommonEvents.off("SHOW_TOAST", handleShowToast);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          duration={toast.duration}
          onHide={() => setToast(null)}
        />
      )}
    </View>
  );
}; 
