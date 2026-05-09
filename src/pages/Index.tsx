import { useState, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Home,
  Package,
  List,
  ChevronDown,
  X,
  LogOut,
  Share2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useGroceryStore,
  CATEGORY_CONFIG,
  ItemCategory,
  GroceryItem,
} from "@/hooks/useGroceryStore";
import { AddItemForm } from "@/components/AddItemForm";
import { GroceryItemCard } from "@/components/GroceryItemCard";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useSharesWithMe } from "@/hooks/useShares";
import { ShareDialog } from "@/components/ShareDialog";

type Tab = "to-buy" | "at-home" | "all";

const Index = () => {
  const { user } = useAuth();
  const sharedWithMe = useSharesWithMe();
  const [activeOwnerId, setActiveOwnerId] = useState<string | null>(null);
  const [showListPicker, setShowListPicker] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // The list currently being viewed
  const ownerId = activeOwnerId ?? user?.uid ?? "";
  const isOwnList = !activeOwnerId || activeOwnerId === user?.uid;
  const activeShare = sharedWithMe.find((s) => s.ownerId === activeOwnerId);
  const permission = isOwnList
    ? "edit-full"
    : (activeShare?.permission ?? "view");
  const canEditStatus = permission !== "view";
  const canEditFull = permission === "edit-full";

  const { items, addItem, updateItem, deleteItem, allNames } =
    useGroceryStore(ownerId);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

  const isSearching = search.trim().length > 0;

  const filtered = useMemo(() => {
    let list = items;
    if (!isSearching) {
      if (tab === "to-buy") list = items.filter((i) => i.inCart);
      if (tab === "at-home") list = items.filter((i) => i.atHome);
    }
    if (isSearching) {
      list = list.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return list;
  }, [items, tab, search, isSearching]);

  const groupedItems = useMemo(() => {
    const groups = {} as Record<ItemCategory, GroceryItem[]>;
    (Object.keys(CATEGORY_CONFIG) as ItemCategory[]).forEach((key) => {
      groups[key] = [];
    });
    filtered.forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });
    return groups;
  }, [filtered]);

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const activeCategories = (Object.keys(groupedItems) as ItemCategory[]).filter(
    (key) => groupedItems[key].length > 0,
  );
  const areAllCollapsed =
    activeCategories.length > 0 &&
    activeCategories.every((key) => collapsedCategories[key]);
  const toggleCollapseAll = () => {
    if (areAllCollapsed) {
      setCollapsedCategories({});
    } else {
      const newState: Record<string, boolean> = { ...collapsedCategories };
      activeCategories.forEach((key) => {
        newState[key] = true;
      });
      setCollapsedCategories(newState);
    }
  };

  const toBuyCount = items.filter((i) => i.inCart).length;
  const atHomeCount = items.filter((i) => i.atHome).length;

  const activeListLabel = isOwnList
    ? "My list"
    : (activeShare?.ownerEmail ?? "Shared list");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 relative">
            <button
              onClick={() => setShowListPicker((v) => !v)}
              className="flex items-center gap-1 max-w-full"
            >
              <h1 className="text-lg font-bold text-foreground truncate">
                {activeListLabel}
              </h1>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  showListPicker ? "rotate-180" : ""
                }`}
              />
            </button>
            <p className="text-xs text-muted-foreground truncate">
              {items.length} item{items.length !== 1 ? "s" : ""}
              {!isOwnList && ` · ${permission.replace("-", " ")}`}
            </p>
            <AnimatePresence>
              {showListPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setActiveOwnerId(null);
                      setShowListPicker(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary ${
                      isOwnList ? "bg-secondary" : ""
                    }`}
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-card-foreground">
                      My list
                    </span>
                  </button>
                  {sharedWithMe.length > 0 && (
                    <div className="border-t border-border">
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Shared with me
                      </p>
                      {sharedWithMe.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveOwnerId(s.ownerId);
                            setShowListPicker(false);
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary ${
                            activeOwnerId === s.ownerId ? "bg-secondary" : ""
                          }`}
                        >
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 truncate text-card-foreground">
                            {s.ownerEmail}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {s.permission.replace("-", " ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isOwnList && (
            <button
              onClick={() => setShareOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Share list"
              title="Share list"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
          {user && (
            <button
              onClick={() => signOut(auth)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Add Item — only when allowed */}
      {canEditFull && (
        <div className="pt-3">
          <AddItemForm onAdd={addItem} suggestions={allNames} />
        </div>
      )}

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
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                tab === "to-buy" ? "bg-accent-foreground/20" : "bg-muted"
              }`}
            >
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
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                tab === "at-home" ? "bg-primary-foreground/20" : "bg-muted"
              }`}
            >
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
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {/* Clear Button */}
          {search.length > 0 && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            {isSearching ? (
              <p className="text-xs text-muted-foreground">
                Showing items matching "{search}"
              </p>
            ) : (
              <div />
            )}
            <button
              onClick={toggleCollapseAll}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {areAllCollapsed ? "Expand All" : "Collapse All"}
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  areAllCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtered.length === 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-3 text-4xl">
                {isSearching
                  ? "🔍"
                  : tab === "to-buy"
                    ? "🛒"
                    : tab === "at-home"
                      ? "🏠"
                      : "📋"}
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
          </AnimatePresence>
        ) : (
          <div className="flex flex-col gap-6">
            {(
              Object.entries(groupedItems) as [ItemCategory, GroceryItem[]][]
            ).map(([categoryKey, categoryItems]) => {
              if (categoryItems.length === 0) return null;
              const isCollapsed = collapsedCategories[categoryKey] || false;
              return (
                <div key={categoryKey} className="flex flex-col gap-1">
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleCategory(categoryKey)}
                    className="flex w-full items-center justify-between py-2 text-left transition-opacity hover:opacity-80"
                  >
                    <h2 className="flex items-center gap-2 text-sm font-bold text-muted-foreground pl-1">
                      <span>{CATEGORY_CONFIG[categoryKey].emoji}</span>
                      {categoryKey}
                      <span className="ml-1 text-xs font-normal text-muted-foreground/60">
                        ({categoryItems.length})
                      </span>
                    </h2>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Collapsible Content Area */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-2 pt-1 pb-2">
                          <AnimatePresence mode="popLayout">
                            {categoryItems.map((item) => (
                              <GroceryItemCard
                                key={item.id}
                                item={item}
                                onUpdate={updateItem}
                                onDelete={deleteItem}
                                canEditStatus={canEditStatus}
                                canEditFull={canEditFull}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
};

export default Index;
