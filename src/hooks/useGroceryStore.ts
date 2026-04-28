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
      fetchedItems.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
      setItems(fetchedItems);
    });
    return () => unsubscribe();
  }, []);

  const addItem = useCallback(
    async (name: string, category: ItemCategory = "VARIE") => {
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
