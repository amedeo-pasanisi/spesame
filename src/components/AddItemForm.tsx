import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ItemCategory, CATEGORY_CONFIG } from "@/hooks/useGroceryStore";

interface AddItemFormProps {
  onAdd: (name: string, category: ItemCategory) => void;
  suggestions: string[];
}

export function AddItemForm({ onAdd, suggestions }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("VARIE");
  const [showCategories, setShowCategories] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    name.length >= 2
      ? [...new Set(suggestions)]
          .filter(
            (s) =>
              s.toLowerCase().includes(name.toLowerCase()) &&
              s.toLowerCase() !== name.toLowerCase(),
          )
          .slice(0, 3)
      : [];

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name, category);
    setName("");
    setShowCategories(false);
    inputRef.current?.focus();
  };

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add an item..."
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <AnimatePresence>
            {filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
              >
                {filtered.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setName(s);
                      inputRef.current?.focus();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-card-foreground hover:bg-secondary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border bg-card text-lg"
          title="Category"
        >
          {CATEGORY_CONFIG[category].emoji}
        </button>
        <button
          onClick={submit}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pt-3">
              {(
                Object.entries(CATEGORY_CONFIG) as [
                  ItemCategory,
                  { label: string; emoji: string },
                ][]
              ).map(([key, { label, emoji }]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCategory(key);
                    setShowCategories(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
