import { cn } from "@/lib/utils";
import React from "react";
import { Badge } from "./badge";

const Timeline = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props}></div>;
});

Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("group relative pb-6 pl-2 last:pb-2 sm:pl-6", className)}
      {...props}
    ></div>
  );
});

TimelineItem.displayName = "TimelineItem";

const TimelineHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "after:border-primary-foreground/95 after:bg-foreground mb-1 flex flex-col items-start before:absolute before:left-2 before:h-full before:-translate-x-1/2 before:translate-y-3 before:self-start before:bg-slate-300 before:px-px after:absolute after:left-2 after:box-content after:h-2 after:w-2 after:-translate-x-1/2 after:translate-y-1.5 after:rounded-full after:border-4 group-last:before:hidden sm:flex-row sm:before:left-0 sm:before:ml-[0.6rem] sm:after:left-0 sm:after:ml-[0.6rem]",
        className,
      )}
      {...props}
    ></div>
  );
});

TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-primary text-[0.8vw] font-medium", className)}
      {...props}
    ></p>
  );
});

TimelineTitle.displayName = "TimelineTitle";

const TimelineTime = ({ className, variant = "default", ...props }) => {
  return (
    <Badge
      className={cn(
        "left-0 mb-3 inline-flex h-6 w-36 translate-y-0.5 items-center justify-center text-xs font-semibold uppercase sm:absolute sm:mb-0",
        className,
      )}
      variant={variant}
      {...props}
    >
      {props.children}
    </Badge>
  );
};
TimelineTime.displayName = "TimelineTime";

const TimelineDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    ></p>
  );
});

TimelineDescription.displayName = "TimelineDescription";

export {
  Timeline,
  TimelineItem,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
};
