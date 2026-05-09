import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";

export type ItemCategory =
  | "ODORI E SPEZIE"
  | "CARNE"
  | "LEGUMI"
  | "PESCE"
  | "CASA"
  | "VERDURA"
  | "FRUTTA"
  | "VARIE"
  | "LATTICINI"
  | "IGIENE";

export interface GroceryItem {
  id: string;
  name: string;
  category: ItemCategory;
  inCart: boolean;
  atHome: boolean;
  createdAt: number;
  userId: string;
}

export function useGroceryStore(ownerId?: string) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const { user } = useAuth();
  const effectiveOwnerId = ownerId ?? user?.uid;

  useEffect(() => {
    if (!effectiveOwnerId) {
      setItems([]);
      return;
    }
    const q = query(
      collection(db, "groceryItems"),
      where("userId", "==", effectiveOwnerId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          name: data.name,
          category: data.category,
          inCart: data.inCart,
          atHome: data.atHome,
          createdAt: data.createdAt,
          userId: data.userId,
        };
      }) as GroceryItem[];

      fetchedItems.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
      setItems(fetchedItems);
    });
    return () => unsubscribe();
  }, [effectiveOwnerId]);

  const addItem = useCallback(
    async (name: string, category: ItemCategory = "VARIE") => {
      const trimmed = name.trim();
      if (!trimmed || !effectiveOwnerId) return;
      try {
        await addDoc(collection(db, "groceryItems"), {
          name: trimmed,
          category,
          inCart: false,
          atHome: false,
          createdAt: Date.now(),
          userId: effectiveOwnerId,
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    },
    [effectiveOwnerId],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<GroceryItem>) => {
      try {
        const itemRef = doc(db, "groceryItems", id);
        await updateDoc(itemRef, updates);
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

  return { items, addItem, updateItem, deleteItem, allNames };
}

export const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; emoji: string }
> = {
  "ODORI E SPEZIE": { label: "Odori e Spezie", emoji: "🌿" },
  CARNE: { label: "Carne", emoji: "🥩" },
  LEGUMI: { label: "Legumi", emoji: "🫘" },
  PESCE: { label: "Pesce", emoji: "🐟" },
  CASA: { label: "Casa", emoji: "🏠" },
  VERDURA: { label: "Verdura", emoji: "🥬" },
  FRUTTA: { label: "Frutta", emoji: "🍎" },
  VARIE: { label: "Varie", emoji: "📦" },
  LATTICINI: { label: "Latticini", emoji: "🧀" },
  IGIENE: { label: "Igiene", emoji: "🧼" },
};
