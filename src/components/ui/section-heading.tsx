import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow", align === "center" && "justify-center")}>{eyebrow}</p>
      <Tag className="heading-xl mt-5 text-4xl text-white sm:text-5xl lg:text-6xl">{title}</Tag>
      {intro && <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}
    </div>
  );
}
