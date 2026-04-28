import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

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

export function useGroceryStore() {
  const [items, setItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    const q = collection(db, "groceryItems");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroceryItem[];
      fetchedItems.sort((a, b) => a.createdAt - b.createdAt);
      setItems(fetchedItems);
    });
    return () => unsubscribe();
  }, []);

  const addItem = useCallback(
    async (name: string, category: ItemCategory = "other") => {
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        await addDoc(collection(db, "groceryItems"), {
          name: trimmed,
          category,
          status: "none",
          createdAt: Date.now(),
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    },
    [],
  );

  const setStatus = useCallback(
    async (id: string, status: GroceryItem["status"]) => {
      try {
        const itemRef = doc(db, "groceryItems", id);
        await updateDoc(itemRef, { status });
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    },
    [],
  );

  const deleteItem = useCallback(async (id: string) => {
    try {
      const itemRef = doc(db, "groceryItems", id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }, []);

  const allNames = items.map((i) => i.name);

  return { items, addItem, setStatus, deleteItem, allNames };
}

export const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; emoji: string }
> = {
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
