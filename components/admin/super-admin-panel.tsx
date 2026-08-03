"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Database,
  Download,
  Upload,
  Loader2,
  Trash2,
  UserPlus,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminUser, deleteAdminUser, updateUserName } from "@/lib/actions";

interface UserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface SuperAdminPanelProps {
  users: UserRow[];
}

export function SuperAdminPanel({ users: initialUsers }: SuperAdminPanelProps) {
  const [users, setUsers] = useState(initialUsers);

  // ── Backup / Restore ──────────────────────────────────────────────────────
  const [restoring, setRestoring]   = useState(false);
  const [restoreMsg, setRestoreMsg] = useState("");

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

  // ── Add Admin User ────────────────────────────────────────────────────────
  const [addEmail, setAddEmail] = useState("");
  const [addName,  setAddName]  = useState("");
  const [adding,   setAdding]   = useState(false);
  const [addMsg,   setAddMsg]   = useState("");

  const handleAddAdmin = async () => {
    if (!addEmail.trim()) { setAddMsg("Email is required."); return; }
    setAdding(true);
    setAddMsg("");
    try {
      await createAdminUser(addEmail.trim(), addName.trim());
      setAddMsg("✅ Admin user created/promoted successfully.");
      setAddEmail("");
      setAddName("");
    } catch (e: any) {
      setAddMsg(`❌ ${e.message}`);
    } finally {
      setAdding(false);
    }
  };

  // ── Demote Admin ──────────────────────────────────────────────────────────
  const [demotingId, setDemotingId] = useState<number | null>(null);

  const handleDemote = async (userId: number) => {
    if (!confirm("Demote this admin to a regular user?")) return;
    setDemotingId(userId);
    try {
      await deleteAdminUser(userId);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDemotingId(null);
    }
  };

  // ── Edit User Name ────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [saving,    setSaving]    = useState(false);

  const startEdit = (user: UserRow) => {
    const parts = (user.name || "").split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setEditingId(user.id);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (userId: number) => {
    if (!firstName.trim()) return;
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

  const adminUsers = users.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN");

  return (
    <div className="space-y-8">
      {/* ── Backup & Restore ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
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

      {/* ── Add Admin User ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Add / Promote Admin</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter an existing user's email to promote them to Admin, or create a new admin placeholder.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="user@email.com"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Full Name (optional)"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button
            onClick={handleAddAdmin}
            disabled={adding}
            className="gap-2 cursor-pointer shrink-0"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Add Admin
          </Button>
        </div>

        {addMsg && (
          <p className={`text-xs font-medium ${addMsg.startsWith("✅") ? "text-emerald-600" : "text-destructive"}`}>
            {addMsg}
          </p>
        )}
      </div>

      {/* ── Admin Users Table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <ShieldCheck className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Admin Users</h3>
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            {adminUsers.length} admins
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
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs italic">
                    No admin users yet.
                  </td>
                </tr>
              ) : (
                adminUsers.map((user) => (
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
                        user.role === "SUPERADMIN"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === user.id ? (
                          <>
                            <Button size="sm" disabled={saving} onClick={() => saveEdit(user.id)} className="h-7 px-2 gap-1 cursor-pointer">
                              {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 px-2 cursor-pointer">
                              <X className="size-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(user)} className="h-7 px-2 gap-1 cursor-pointer">
                              <Pencil className="size-3" />
                              Edit
                            </Button>
                            {/* Don't allow demoting SUPERADMIN */}
                            {user.role === "ADMIN" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={demotingId === user.id}
                                onClick={() => handleDemote(user.id)}
                                className="h-7 w-7 p-0 cursor-pointer text-destructive hover:bg-destructive/10"
                              >
                                {demotingId === user.id
                                  ? <Loader2 className="size-3 animate-spin" />
                                  : <Trash2 className="size-3" />
                                }
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
