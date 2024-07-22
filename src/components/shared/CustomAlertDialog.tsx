// components/ui/CustomAlertDialog.tsx
import React from "react";
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "../ui/alert-dialog";

interface CustomAlertDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const CustomAlertDialog = ({
  children,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: CustomAlertDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="backdrop-blur-md py-12 rounded-md mx-auto w-64 md:w-96 flex-center flex-col gap-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center h3-bold md:h2-bold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center md:text-lg">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-center gap-2">
          <AlertDialogCancel className="text-white">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-white text-black">
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
