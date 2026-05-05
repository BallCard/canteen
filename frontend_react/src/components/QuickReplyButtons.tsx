import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface QuickReplyButtonsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function QuickReplyButtons({ options, onSelect, disabled }: QuickReplyButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-3 pl-12">
      {options.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
            "bg-white border border-gray-200 text-gray-700",
            "hover:border-zju-green hover:text-zju-green",
            "active:scale-95",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
}