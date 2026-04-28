import { useState, useMemo } from "react";
import { Search, ShoppingCart, Home, Package, List } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGroceryStore } from "@/hooks/useGroceryStore";
import { AddItemForm } from "@/components/AddItemForm";
import { GroceryItemCard } from "@/components/GroceryItemCard";

type Tab = "to-buy" | "at-home" | "all";

const Index = () => {
  const { items, addItem, setStatus, deleteItem, allNames } = useGroceryStore();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const isSearching = search.trim().length > 0;

  const filtered = useMemo(() => {
    let list = items;
    if (!isSearching && tab !== "all") {
      list = items.filter((i) => i.status === tab);
    }
    if (isSearching) {
      list = list.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [items, tab, search, isSearching]);

  const toBuyCount = items.filter((i) => i.status === "to-buy").length;
  const atHomeCount = items.filter((i) => i.status === "at-home").length;

  return (
    <>
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Grocery Tracker</h1>
            <p className="text-xs text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
        </div>
      </header>

      {/* Add Item */}
      <div className="pt-3">
        <AddItemForm onAdd={addItem} suggestions={allNames} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pb-2">
        <button
          onClick={() => setTab("all")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            tab === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <List className="h-4 w-4" />
          All
        </button>
        <button
          onClick={() => setTab("to-buy")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            tab === "to-buy"
              ? "bg-to-buy text-accent-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {toBuyCount > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              tab === "to-buy" ? "bg-accent-foreground/20" : "bg-muted"
            }`}>
              {toBuyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("at-home")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            tab === "at-home"
              ? "bg-at-home text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Home className="h-4 w-4" />
          {atHomeCount > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              tab === "at-home" ? "bg-primary-foreground/20" : "bg-muted"
            }`}>
              {atHomeCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {isSearching && (
          <p className="mb-2 text-xs text-muted-foreground">
            Showing items matching "{search}"
          </p>
        )}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-3 text-4xl">
                {isSearching ? "🔍" : tab === "to-buy" ? "🛒" : tab === "at-home" ? "🏠" : "📋"}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {isSearching
                  ? "No items match your search"
                  : tab === "to-buy"
                  ? "Nothing to buy right now"
                  : tab === "at-home"
                  ? "No items marked as at home"
                  : "No items yet — add some above!"}
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((item) => (
                <GroceryItemCard
                  key={item.id}
                  item={item}
                  onSetStatus={setStatus}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Index;