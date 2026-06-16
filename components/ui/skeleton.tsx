import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/** Skeleton block. Uses the `.skel` shimmer defined in globals.css. */
export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <span
      className={cn("skel block", className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
