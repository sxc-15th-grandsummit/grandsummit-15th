import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function SectionContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}
