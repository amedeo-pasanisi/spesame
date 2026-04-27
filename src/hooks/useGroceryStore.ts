import { useState, useEffect, useCallback } from "react";

export type ItemCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "bakery"
  | "frozen"
  | "pantry"
  | "beverages"
  | "snacks"
  | "cleaning"
  | "personal"
  | "other";

export interface GroceryItem {
  id: string;
  name: string;
  category: ItemCategory;
  status: "at-home" | "to-buy" | "none";
  createdAt: number;
}

const STORAGE_KEY = "grocery-items";

function loadItems(): GroceryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: GroceryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useGroceryStore() {
  const [items, setItems] = useState<GroceryItem[]>(loadItems);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback((name: string, category: ItemCategory = "other") => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        category,
        status: "none",
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const setStatus = useCallback((id: string, status: GroceryItem["status"]) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const allNames = items.map((i) => i.name);

  return { items, addItem, setStatus, deleteItem, allNames };
}

export const CATEGORY_CONFIG: Record<ItemCategory, { label: string; emoji: string }> = {
  produce: { label: "Produce", emoji: "🥬" },
  dairy: { label: "Dairy", emoji: "🧀" },
  meat: { label: "Meat", emoji: "🥩" },
  bakery: { label: "Bakery", emoji: "🍞" },
  frozen: { label: "Frozen", emoji: "🧊" },
  pantry: { label: "Pantry", emoji: "🫙" },
  beverages: { label: "Beverages", emoji: "🥤" },
  snacks: { label: "Snacks", emoji: "🍿" },
  cleaning: { label: "Cleaning", emoji: "🧹" },
  personal: { label: "Personal", emoji: "🧴" },
  other: { label: "Other", emoji: "📦" },
};
