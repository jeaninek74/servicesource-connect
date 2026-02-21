import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showLabel = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn(
            "transition-transform",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-300"
            )}
          />
        </button>
      ))}
      {showLabel && active > 0 && (
        <span className="text-sm text-gray-600 ml-1">{LABELS[active]}</span>
      )}
    </div>
  );
}

interface RatingSummaryProps {
  average: number;
  count: number;
  size?: "sm" | "md";
}

export function RatingSummary({ average, count, size = "sm" }: RatingSummaryProps) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={Math.round(average)} readonly size={size} />
      <span className="text-sm font-medium text-gray-700">{average.toFixed(1)}</span>
      <span className="text-xs text-gray-500">({count} review{count !== 1 ? "s" : ""})</span>
    </div>
  );
}
