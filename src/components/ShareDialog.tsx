import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PERMISSION_LABEL,
  SharePermission,
  useSharesIGranted,
} from "@/hooks/useShares";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PERMS: SharePermission[] = ["view", "edit-status", "edit-full"];

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { shares, addShare, removeShare, updatePermission } =
    useSharesIGranted();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("edit-status");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    if (shares.some((s) => s.sharedWithEmail === trimmedEmail)) {
      setError("Already shared with this email");
      return;
    }
    setSubmitting(true);
    try {
      await addShare(trimmedEmail, permission);
      setEmail("");
    } catch (e) {
      console.error(e);
      setError("Could not share. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your list</DialogTitle>
          <DialogDescription>
            Invite people by email and choose what they can do.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@example.com"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1.5">
            {PERMS.map((p) => (
              <button
                key={p}
                onClick={() => setPermission(p)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                  permission === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {PERMISSION_LABEL[p]}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Share
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Shared with ({shares.length})
          </p>
          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven't shared your list yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
              {shares.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                >
                  <p className="flex-1 truncate text-sm text-card-foreground">
                    {s.sharedWithEmail}
                  </p>
                  <select
                    value={s.permission}
                    onChange={(e) =>
                      updatePermission(s.id, e.target.value as SharePermission)
                    }
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                  >
                    {PERMS.map((p) => (
                      <option key={p} value={p}>
                        {PERMISSION_LABEL[p]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeShare(s.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Revoke"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
