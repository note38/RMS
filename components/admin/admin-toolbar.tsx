"use client";

import { useState } from "react";
import { Users, Pencil, Check, X, Loader2, Download, Upload, Database } from "lucide-react";
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
  const [restoring, setRestoring]   = useState(false);
  const [restoreMsg, setRestoreMsg] = useState("");

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

  const handleBackup = () => {
    window.open("/api/backup", "_blank");
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("This will REPLACE all existing requests with the backup data. Continue?")) {
      e.target.value = "";
      return;
    }

    setRestoring(true);
    setRestoreMsg("");
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res  = await fetch("/api/backup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(json),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed.");
      setRestoreMsg("✅ Restore completed successfully! Refresh to see changes.");
    } catch (err: any) {
      setRestoreMsg(`❌ ${err.message}`);
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup & Restore Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Database className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Backup &amp; Restore</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Download a full JSON backup of all requests, or restore from a previous backup file.
        </p>

        {restoreMsg && (
          <div className={`p-3 rounded-lg text-sm font-medium border ${
            restoreMsg.startsWith("✅")
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}>
            {restoreMsg}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleBackup} variant="default" className="gap-2 cursor-pointer">
            <Download className="size-4" />
            Download Backup
          </Button>

          <label className="relative cursor-pointer">
            <span className={`inline-flex items-center gap-2 h-9 px-4 py-2 rounded-md border border-border bg-card text-sm font-semibold transition-colors cursor-pointer select-none ${
              restoring ? "opacity-60 pointer-events-none" : "hover:bg-muted"
            }`}>
              {restoring ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {restoring ? "Restoring…" : "Restore from Backup"}
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* User Management Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Users className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Registered Users</h3>
          <span className="ml-auto text-xs text-muted-foreground font-medium">{users.length} users</span>
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
              {users.map((user) => (
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
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
