"use client";

import { useState } from "react";
import { Users, Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserName } from "@/lib/actions";

interface UserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AdminToolbarProps {
  users: UserRow[];
}

export function AdminToolbar({ users }: AdminToolbarProps) {
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [firstName, setFirstName]   = useState("");
  const [lastName,  setLastName]    = useState("");
  const [saving,    setSaving]      = useState(false);

  const startEdit = (user: UserRow) => {
    const parts = (user.name || "").split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setEditingId(user.id);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (userId: number) => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      await updateUserName(userId, firstName.trim(), lastName.trim());
      setEditingId(null);
    } catch (e: any) {
      alert(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // Only show non-admin users (admins are managed in Super Admin panel)
  const displayUsers = users.filter((u) => u.role === "REQUESTER");

  return (
    <div className="space-y-6">
      {/* User Management Card — shows regular (requester) users only */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Users className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Users</h3>
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            {displayUsers.length} requesters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs italic">
                    No registered requesters yet.
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      {editingId === user.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First"
                            className="px-2 py-1 bg-background border border-border rounded-md text-xs w-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last"
                            className="px-2 py-1 bg-background border border-border rounded-md text-xs w-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-foreground">{user.name || "—"}</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{user.email}</td>
                    <td className="p-4">
                      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {editingId === user.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            disabled={saving}
                            onClick={() => saveEdit(user.id)}
                            className="h-7 px-2 gap-1 cursor-pointer"
                          >
                            {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-7 px-2 cursor-pointer"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(user)}
                          className="h-7 px-2 gap-1 cursor-pointer"
                        >
                          <Pencil className="size-3" />
                          Edit Name
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
