"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

export type RatingProps = {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
};

const sizeClasses = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base font-medium",
};

export function Rating({
  value = 0,
  max = 5,
  size = "md",
  showValue = false,
  reviewCount,
  interactive = false,
  onChange,
  className = "",
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleStarClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverValue(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverValue(null);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Rating: ${value} out of ${max} stars`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = displayValue >= starNumber;
          const isHalf = !isFilled && displayValue >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(starNumber)}
              onMouseEnter={() => handleMouseEnter(starNumber)}
              onMouseLeave={handleMouseLeave}
              className={`relative transition-transform ${
                interactive
                  ? "cursor-pointer hover:scale-110 focus:outline-hidden"
                  : "cursor-default pointer-events-none"
              }`}
              aria-label={interactive ? `Rate ${starNumber} stars` : undefined}
            >
              {isHalf ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-slate-200 fill-slate-100`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${sizeClasses[size]} text-amber-400 fill-amber-400`} />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClasses[size]} ${
                    isFilled
                      ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                      : "text-slate-200 fill-slate-100"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={`font-semibold text-slate-700 ${textSizeClasses[size]}`}>
          {value.toFixed(1)}
        </span>
      )}

      {typeof reviewCount === "number" && (
        <span className={`text-slate-500 ${textSizeClasses[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
