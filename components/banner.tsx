import { AlertTriangle, CheckCircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "border p-3 text-sm flex w-full items-start gap-2 text-left sm:p-4",
  {
    variants: {
      variant: {
        warning: "bg-yellow-200/80 border-yellow-30 text-primary ",
        success: "bg-emerald-700 border-emerald-800 text-secondary",
      },
      defaultVariants: {
        variant: "warning",
      },
    },
  },
);

interface BannerProps extends VariantProps<typeof bannerVariants> {
  label: string;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
};

export const Banner = ({ label, variant }: BannerProps) => {
  const Icon = iconMap[variant || "warning"];

  return (
    <div className={cn(bannerVariants({ variant }))}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="leading-relaxed break-words">{label}</span>
    </div>
  );
};
