import * as React from "react";
import { cn } from "../../lib/utils";

const Dialog = ({ children, open, onClose, className, ...props }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "relative bg-background rounded-lg shadow-lg w-full max-w-lg p-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>

  );
};

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-4", className)} {...props}>
      {children}
    </div>
  )
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-end space-x-2", className)}
    {...props}
  >
    {children}
  </div>
));
DialogFooter.displayName = "DialogFooter";

const DialogTrigger = React.forwardRef(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("text-primary hover:underline", className)}
    {...props}
  >
    {children}
  </button>
));
DialogTrigger.displayName = "DialogTrigger";


export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger };
