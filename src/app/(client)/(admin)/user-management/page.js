"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  Users,
  RefreshCw,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  User,
  UserX,
  UserCheck,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import RoleBadge from "./_components/RoleBadge";
import { getAllUsers } from "@/api/user";
import { formatDate, initials } from "@/utils/format";
import { ROLES } from "@/constants/user";
import { USER_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import DeleteModal from "./_components/DeleteModal";
import RoleModal from "./_components/RoleModal";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});


const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [statusTarget, setStatusTarget] = useState(null);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.roles?.includes("ADMIN")).length,
    merchants: users.filter((u) => u.roles?.includes("MERCHANT")).length,
    customers: users.filter(
      (u) => !u.roles?.includes("ADMIN") && !u.roles?.includes("MERCHANT"),
    ).length,
  };

  useEffect(() => {
    let active = true;

    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllUsers();
        const list = Array.isArray(data) ? data : [];
        if (active) setUsers(list);
      } catch (err) {
        if (active)
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Could not load users.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleDeleted = (id) => {
    setUsers((prev) => prev.filter((u) => u._id !== id));
    setDeleteTarget(null);
  };

  const handleRoleSaved = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
    );
    setRoleTarget(null);
  };

  const handleStatusSaved = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
    );
    setStatusTarget(null);
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} />
    );
  };

  const filtered = users
    .filter((u) => {
      const matchSearch = [u.name, u.email, u.phone].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      );
      const matchRole =
        roleFilter === "ALL" ||
        u.roles?.map((r) => r.toUpperCase()).includes(roleFilter);
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "createdAt")
        return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
      return (
        String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? "")) *
        dir
      );
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / USER_MANAGEMENT_PAGE_SIZE),
  );
  const paginated = filtered.slice(
    (page - 1) * USER_MANAGEMENT_PAGE_SIZE,
    page * USER_MANAGEMENT_PAGE_SIZE,
  );

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Admin · Users</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            User management
          </h1>
        </motion.div>
        <motion.button
          {...fadeUp(0.05)}
          onClick={() => setReloadKey((k) => k + 1)}
          disabled={loading}
          className="btn-secondary disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {/* Stats */}
      <motion.div
        {...fadeUp(0.07)}
        className="grid grid-cols-2 sm:grid-cols-4 border border-hairline dark:border-[#262932] mb-6"
      >
        {[
          { label: "Total users", value: stats.total, icon: Users },
          { label: "Admins", value: stats.admins, icon: ShieldCheck },
          { label: "Merchants", value: stats.merchants, icon: User },
          { label: "Customers", value: stats.customers, icon: UserX },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`px-5 py-4 flex items-start gap-3 ${i < 3 ? "border-r border-hairline dark:border-[#262932]" : ""}`}
            >
              <Icon size={16} className="text-signal mt-1 shrink-0" />
              <div>
                <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
                  {s.value}
                </p>
                <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center border border-hairline dark:border-[#262932] px-3 py-2.5 gap-2 flex-1 max-w-sm focus-within:border-ink dark:focus-within:border-[#f0efe8] transition-colors">
          <Search
            size={14}
            className="text-slate dark:text-[#8b8fa8] shrink-0"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, phone…"
            className="w-full bg-transparent text-sm outline-none text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72]"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="field max-w-[140px] cursor-pointer dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8]"
        >
          <option value="ALL">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div
        {...fadeUp(0.12)}
        className="border border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate dark:text-[#8b8fa8]">
            <Loader2 size={16} className="animate-spin" />
            <span className="font-mono text-sm">Loading users…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertTriangle size={24} className="text-danger" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              Could not load users
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="btn-secondary mt-2"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={28} className="text-slate dark:text-[#8b8fa8]" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              No users found
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              Try a different search or role filter.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12]">
                {[
                  { label: "User", field: "name" },
                  { label: "Email", field: "email" },
                  { label: "Phone", field: "phone" },
                  { label: "Role", field: null },
                  { label: "Status", field: null },
                  { label: "Joined", field: "createdAt" },
                  { label: "Actions", field: null },
                ].map((col) => (
                  <th
                    key={col.label}
                    onClick={() => col.field && toggleSort(col.field)}
                    className={`px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] whitespace-nowrap ${col.field ? "cursor-pointer hover:text-ink dark:hover:text-[#f0efe8] select-none" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label} <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline dark:divide-[#262932]">
              {paginated.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden border border-hairline dark:border-[#262932] bg-ink dark:bg-[#262932] grid place-items-center">
                        {user.profileImageUrl ? (
                          <Image
                            src={user.profileImageUrl}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-xs text-paper dark:text-[#f0efe8]">
                            {initials(user.name)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-ink dark:text-[#f0efe8] max-w-[140px] truncate">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate dark:text-[#8b8fa8] max-w-[180px] truncate">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate dark:text-[#8b8fa8]">
                    {user.phone ?? "—"}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? ["USER"]).map((r) => (
                        <RoleBadge key={r} role={r} />
                      ))}
                    </div>
                  </td>

                  {/* Active */}
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${
                        user.isActive !== false
                          ? "bg-ok/10 text-ok"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-slate dark:text-[#8b8fa8] whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRoleTarget(user)}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-signal hover:text-signal dark:hover:border-signal dark:hover:text-signal transition-colors"
                        aria-label="Change role"
                        title="Change role"
                      >
                        <ShieldCheck size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-danger hover:text-danger dark:hover:border-danger dark:hover:text-danger transition-colors"
                        aria-label="Delete user"
                        title="Delete user"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        onClick={() => setStatusTarget(user)}
                        className={`grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] transition-colors ${
                          user.isActive !== false
                            ? "text-slate dark:text-[#8b8fa8] hover:border-danger hover:text-danger dark:hover:border-danger dark:hover:text-danger"
                            : "text-slate dark:text-[#8b8fa8] hover:border-ok hover:text-ok dark:hover:border-ok dark:hover:text-ok"
                        }`}
                        aria-label="Toggle status"
                        title={
                          user.isActive !== false
                            ? "Deactivate user"
                            : "Activate user"
                        }
                      >
                        {user.isActive !== false ? (
                          <UserX size={13} />
                        ) : (
                          <UserCheck size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Count + Pagination */}
      {filtered.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={USER_MANAGEMENT_PAGE_SIZE}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleted}
          />
        )}
        {roleTarget && (
          <RoleModal
            key="role-modal"
            user={roleTarget}
            onClose={() => setRoleTarget(null)}
            onSave={handleRoleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagementPage;
