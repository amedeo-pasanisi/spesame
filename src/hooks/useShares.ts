import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";

export type SharePermission = "view" | "edit-status" | "edit-full";

export interface Share {
  id: string;
  ownerId: string;
  ownerEmail: string;
  sharedWithEmail: string;
  permission: SharePermission;
  createdAt: number;
}

export const PERMISSION_LABEL: Record<SharePermission, string> = {
  view: "View only",
  "edit-status": "Edit status",
  "edit-full": "Full edit",
};

/** Shares I've granted (others can access MY list) */
export function useSharesIGranted() {
  const { user } = useAuth();
  const [shares, setShares] = useState<Share[]>([]);

  useEffect(() => {
    if (!user) {
      setShares([]);
      return;
    }
    const q = query(collection(db, "shares"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setShares(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Share, "id">),
        })),
      );
    });
    return () => unsub();
  }, [user]);

  const addShare = useCallback(
    async (email: string, permission: SharePermission) => {
      if (!user?.email) return;
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || trimmedEmail === user.email.toLowerCase()) return;
      const customShareId = `${user.uid}_${trimmedEmail}`;
      try {
        await setDoc(doc(db, "shares", customShareId), {
          ownerId: user.uid,
          ownerEmail: user.email.toLowerCase(),
          sharedWithEmail: trimmedEmail,
          permission,
          createdAt: Date.now(),
        });
      } catch (error) {
        console.error("Errore durante l'aggiunta della condivisione:", error);
      }
    },
    [user],
  );

  const removeShare = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "shares", id));
  }, []);

  const updatePermission = useCallback(
    async (id: string, permission: SharePermission) => {
      await updateDoc(doc(db, "shares", id), { permission });
    },
    [],
  );

  return { shares, addShare, removeShare, updatePermission };
}

/** Shares granted TO me (lists I can access from other users) */
export function useSharesWithMe() {
  const { user } = useAuth();
  const [shares, setShares] = useState<Share[]>([]);

  useEffect(() => {
    if (!user?.email) {
      setShares([]);
      return;
    }
    const q = query(
      collection(db, "shares"),
      where("sharedWithEmail", "==", user.email.toLowerCase()),
    );
    const unsub = onSnapshot(q, (snap) => {
      setShares(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Share, "id">),
        })),
      );
    });
    return () => unsub();
  }, [user]);

  return shares;
}
