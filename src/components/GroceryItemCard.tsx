import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingCart, Trash2, Plus } from "lucide-react";
import { GroceryItem, CATEGORY_CONFIG } from "@/hooks/useGroceryStore";

interface GroceryItemCardProps {
  item: GroceryItem;
  onSetStatus: (id: string, status: GroceryItem["status"]) => void;
  onDelete: (id: string) => void;
}

export const GroceryItemCard = forwardRef<HTMLDivElement, GroceryItemCardProps>(
  ({ item, onSetStatus, onDelete }: GroceryItemCardProps, ref) => {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground truncate">
            {item.name}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Add to Buy */}
          {item.status !== "to-buy" && (
            <button
              onClick={() => onSetStatus(item.id, "to-buy")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-to-buy/15 text-to-buy transition-colors"
              title="Add to shopping list"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}

          {/* Mark as At Home */}
          {item.status !== "at-home" && (
            <button
              onClick={() => onSetStatus(item.id, "at-home")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-at-home/15 text-at-home transition-colors"
              title="Mark as at home"
            >
              <Check className="h-4 w-4" />
            </button>
          )}

          {/* Remove from list (back to none) */}
          {item.status !== "none" && (
            <button
              onClick={() => onSetStatus(item.id, "none")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              title="Remove from list"
            >
              <Plus className="h-4 w-4 rotate-45" />
            </button>
          )}

          {/* Delete permanently */}
          <button
            onClick={() => onDelete(item.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  },
);

GroceryItemCard.displayName = "GroceryItemCard";
