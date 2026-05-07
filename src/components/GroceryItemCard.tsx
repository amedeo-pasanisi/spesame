import { forwardRef, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Home, Trash2 } from "lucide-react";
import { GroceryItem } from "@/hooks/useGroceryStore";

interface GroceryItemCardProps {
  item: GroceryItem;
  onUpdate: (id: string, updates: Partial<GroceryItem>) => void;
  onDelete: (id: string) => void;
}

export const GroceryItemCard = forwardRef<HTMLDivElement, GroceryItemCardProps>(
  ({ item, onUpdate, onDelete }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(item.name);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the input when entering edit mode
    useEffect(() => {
      if (isEditing) {
        inputRef.current?.focus();
      }
    }, [isEditing]);

    const handleSave = () => {
      const trimmed = editName.trim();
      if (trimmed && trimmed !== item.name) {
        onUpdate(item.id, { name: trimmed });
      } else {
        // Revert to original name if input is empty or unchanged
        setEditName(item.name);
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setEditName(item.name); // Cancel edit
        setIsEditing(false);
      }
    };

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
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none border-b border-primary/50 focus:border-primary py-0.5"
            />
          ) : (
            <p
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-card-foreground truncate cursor-pointer hover:opacity-70 transition-opacity"
              title="Click to edit"
            >
              {item.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Cart Toggle */}
          <button
            onClick={() => onUpdate(item.id, { inCart: !item.inCart })}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              item.inCart
                ? "bg-to-buy/15 text-to-buy"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={item.inCart ? "Remove from cart" : "Add to cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>

          {/* Home Toggle */}
          <button
            onClick={() => onUpdate(item.id, { atHome: !item.atHome })}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              item.atHome
                ? "bg-at-home/15 text-at-home"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={item.atHome ? "Remove from home" : "Add to home"}
          >
            <Home className="h-4 w-4" />
          </button>

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
