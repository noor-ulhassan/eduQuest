import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export function InteractiveHoverButton({
  children,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-[6px] p-2 px-6 text-center font-semibold",
        className
      )}
      {...props}>
      <div className="flex items-center justify-center gap-2">
        <div
          className="bg-orange-400 h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8] group-hover:bg-red-600"></div>
        <span
          className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div
        className="text-white absolute top-0 left-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-[14px] group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight className="w-5 h-5" />
      </div>
    </button>
  );
}
