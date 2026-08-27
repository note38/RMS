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
  Activity,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  logs?: any[];
}

export function SuperAdminPanel({ users: initialUsers, logs: initialLogs = [] }: SuperAdminPanelProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [logs, setLogs] = useState<any[]>(initialLogs);

  const [activeTab, setActiveTab] = useState<"Users" | "Logs">("Users");
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const itemsPerPage = 10;


  // ── Backup / Restore ──────────────────────────────────────────────────────
  const [restoring, setRestoring] = useState(false);
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
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON file formatting.");
      }

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed.");
      setRestoreMsg(`✅ ${data.message || "Restore completed successfully!"}`);
      router.refresh();
    } catch (err: any) {
      setRestoreMsg(`❌ ${err.message}`);
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  };

  // ── Add Admin User ────────────────────────────────────────────────────
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [addToast, setAddToast] = useState("");

  const handleAddAdmin = async () => {
    if (!addEmail.trim()) { setAddMsg("Email is required."); return; }
    setAdding(true);
    setAddMsg("");
    try {
      const result = await createAdminUser(addEmail.trim(), addName.trim());
      // Update or insert the user in the local list immediately
      setUsers((prev) => {
        const exists = prev.find((u) => u.id === result.user.id);
        if (exists) {
          return prev.map((u) => u.id === result.user.id ? { ...u, role: result.user.role } : u);
        }
        return [...prev, result.user];
      });
      // Prepend a log entry optimistically
      setLogs((prev) => [{
        id: Date.now(),
        action: "PROMOTE_ADMIN",
        entityType: "user",
        entityId: result.user.id,
        createdAt: new Date().toISOString(),
        user: result.actor,
        details: JSON.stringify({ targetName: result.user.name, targetEmail: result.user.email }),
      }, ...prev]);
      // Show floating toast
      setAddToast(`${result.user.name || result.user.email} promoted to Admin.`);
      setTimeout(() => setAddToast(""), 4000);
      setAddEmail("");
      setAddName("");
    } catch (e: any) {
      setAddMsg(`❌ ${e.message}`);
    } finally {
      setAdding(false);
    }
  };

  // ── Delete Admin Account ──────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteError("");
    try {
      const result = await deleteAdminUser(deleteTarget.id);
      const name = deleteTarget.name || deleteTarget.email;
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      // Prepend a log entry optimistically
      setLogs((prev) => [{
        id: Date.now(),
        action: "DELETE_USER",
        entityType: "user",
        entityId: deleteTarget.id,
        createdAt: new Date().toISOString(),
        user: result.actor,
        details: JSON.stringify({ targetName: result.target.name, targetEmail: result.target.email }),
      }, ...prev]);
      setDeleteTarget(null);
      setDeleteMsg(`${name}'s account has been permanently deleted.`);
      setTimeout(() => setDeleteMsg(""), 4000);
    } catch (e: any) {
      setDeleteError(e.message || "Failed to delete user account.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Edit User Name ────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

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

  const baseAdminUsers = users.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN");
  const adminUsers = baseAdminUsers.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    const nameStr = (u.name || "").toLowerCase();
    const emailStr = (u.email || "").toLowerCase();
    return nameStr.includes(q) || emailStr.includes(q);
  });

  return (
    <div className="space-y-8">

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
          />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This will permanently delete this user account.
                </p>
              </div>
            </div>

            {/* User info card */}
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {deleteTarget.name || "—"}
              </p>
              <p className="text-xs text-muted-foreground">{deleteTarget.email}</p>
              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-1">
                {deleteTarget.role}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              This will <span className="font-semibold text-destructive">permanently delete</span> this account from both the database and authentication system. This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                disabled={!!deletingId}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={confirmDelete}
                disabled={!!deletingId}
                className="gap-2 cursor-pointer"
              >
                {deletingId ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                {deletingId ? "Deleting…" : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast (Delete) ──────────────────────────────────────── */}
      {deleteMsg && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-card px-5 py-3.5 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 shrink-0">
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Account Deleted</p>
            <p className="text-xs text-muted-foreground">{deleteMsg}</p>
          </div>
          <button
            onClick={() => setDeleteMsg("")}
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── Success Toast (Promote) ─────────────────────────────────────── */}
      {addToast && (
        <div className={`fixed right-6 z-[60] flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-card px-5 py-3.5 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-300 ${deleteMsg ? "bottom-24" : "bottom-6"}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 shrink-0">
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Admin Promoted</p>
            <p className="text-xs text-muted-foreground">{addToast}</p>
          </div>
          <button
            onClick={() => setAddToast("")}
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}


      <div className="flex border-b border-border bg-muted/40 p-2 gap-2 text-sm font-semibold rounded-t-xl mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("Users")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "Users"
            ? "bg-card text-foreground shadow-xs border border-border"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <ShieldCheck className="size-4" />
          Admin Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Logs")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "Logs"
            ? "bg-card text-foreground shadow-xs border border-border"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Activity className="size-4" />
          Recent Logs
        </button>
      </div>

      {activeTab === "Users" && (
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
              <div className={`p-3 rounded-lg text-sm font-medium border ${restoreMsg.startsWith("✅")
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
                <span className={`inline-flex items-center gap-2 h-9 px-4 py-2 rounded-md border border-border bg-card text-sm font-semibold transition-colors cursor-pointer select-none ${restoring ? "opacity-60 pointer-events-none" : "hover:bg-muted"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Admin Users</h3>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                  {adminUsers.length} admins
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                    placeholder="Search admin name or email..."
                    className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                {/* Items Per Page Select */}
                <select
                  value={usersPerPage}
                  onChange={(e) => {
                    setUsersPerPage(Number(e.target.value));
                    setUsersPage(1);
                  }}
                  className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
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
                        {userSearchQuery ? "No admin users matching your search." : "No admin users yet."}
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const totalPages = Math.max(1, Math.ceil(adminUsers.length / usersPerPage));
                      const safePage = Math.min(usersPage, totalPages);
                      const start = (safePage - 1) * usersPerPage;
                      return adminUsers.slice(start, start + usersPerPage).map((user) => (
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
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${user.role === "SUPERADMIN"
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
                                  {/* Don't allow deleting SUPERADMIN */}
                                  {user.role === "ADMIN" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={deletingId === user.id}
                                      onClick={() => { setDeleteTarget(user); setDeleteError(""); }}
                                      className="h-7 w-7 p-0 cursor-pointer text-destructive hover:bg-destructive/10"
                                      title="Delete user account permanently"
                                    >
                                      {deletingId === user.id
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
                      ));
                    })()
                  )}
                </tbody>
              </table>
            </div>

            {adminUsers.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                <span className="text-xs text-muted-foreground">
                  Showing {Math.min((usersPage - 1) * usersPerPage + 1, adminUsers.length)} to {Math.min(usersPage * usersPerPage, adminUsers.length)} of {adminUsers.length} admins
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-2 font-medium">
                    Page {Math.min(usersPage, Math.ceil(adminUsers.length / usersPerPage))} of {Math.ceil(adminUsers.length / usersPerPage)}
                  </span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => setUsersPage(p => Math.min(Math.ceil(adminUsers.length / usersPerPage), p + 1))} disabled={usersPage >= Math.ceil(adminUsers.length / usersPerPage)}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Logs" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Activity className="size-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">System Action Logs</h3>
            <span className="ml-auto text-xs text-muted-foreground font-medium">
              {logs.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs italic">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.slice((logsPage - 1) * itemsPerPage, logsPage * itemsPerPage).map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-xs text-foreground bg-muted px-2 py-1 rounded-md">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono">{log.entityType}</span>
                        <span className="text-xs text-muted-foreground ml-1">#{log.entityId}</span>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-medium text-foreground">{log.user?.name || log.user?.email || "Unknown"}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logs.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Showing {(logsPage - 1) * itemsPerPage + 1} to {Math.min(logsPage * itemsPerPage, logs.length)} of {logs.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setLogsPage(p => Math.max(1, p - 1))} disabled={logsPage === 1}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setLogsPage(p => Math.min(Math.ceil(logs.length / itemsPerPage), p + 1))} disabled={logsPage === Math.ceil(logs.length / itemsPerPage)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
