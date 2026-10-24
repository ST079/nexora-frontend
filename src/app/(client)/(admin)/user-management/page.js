"use client";

import { Suspense, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  AlertTriangle,
  Eye,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import SearchField from "@/components/SearchField";
import SortableHeader from "@/components/SortableHeader";
import RoleBadge from "./_components/RoleBadge";
import DeleteModal from "./_components/DeleteModal";
import RoleModal from "./_components/RoleModal";
import UserViewModal from "./_components/UserViewModal";
import UserStatusModal from "./_components/UserStatusModal";
import { getAllUsers, getTotalCount, getUserStats } from "@/api/user";
import { apiErrorMessage, formatDate, initials } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { nextSortKey, sortJSON } from "@/utils/sort";
import { ROLE_ADMIN, ROLE_MERCHANT, ROLE_USER } from "@/constants/user";
import { USER_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useResource } from "@/hooks/useResource";
import { setUser } from "@/redux/auth/authSlice";

const DEFAULT_SORT_KEY = "-createdAt";

const COLUMNS = [
  { label: "User", field: "name" },
  { label: "Email", field: "email" },
  { label: "Phone" },
  { label: "Role" },
  { label: "Status" },
  { label: "Joined", field: "createdAt" },
  { label: "" },
];

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: ROLE_ADMIN, label: "Admins" },
  { value: ROLE_MERCHANT, label: "Merchants" },
  { value: ROLE_USER, label: "Customers" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const iconButton =
  "grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-hairline disabled:hover:text-slate";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { user: me } = useSelector((state) => state.auth);
  const { searchParams, setParams } = useQueryParams();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [version, setVersion] = useState(0);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortKey = searchParams.get("sort") ?? DEFAULT_SORT_KEY;
  const hasFilters = Boolean(search || role || status);

  // Stats come from the server so they describe every account, not just
  // the page on screen.
  const stats = useResource(`stats|${version}`, getUserStats);

  const listKey = `${page}|${search}|${role}|${status}|${sortKey}|${version}`;
  const { data, loading, error } = useResource(listKey, async () => {
    const filters = { name: search, role, status };
    const limit = USER_MANAGEMENT_PAGE_SIZE;
    const [users, count] = await Promise.all([
      getAllUsers({
        ...filters,
        sort: sortJSON(sortKey),
        limit,
        offset: (page - 1) * limit,
      }),
      getTotalCount(filters),
    ]);
    return { users, total: count.totalCount };
  });
  const users = data?.users ?? [];

  const refresh = () => setVersion((v) => v + 1);

  const closeDelete = useCallback(() => setDeleteTarget(null), []);
  const closeRole = useCallback(() => setRoleTarget(null), []);
  const closeView = useCallback(() => setViewTarget(null), []);
  const closeStatus = useCallback(() => setStatusTarget(null), []);

  const handleDeleted = () => {
    setDeleteTarget(null);
    if (users.length === 1 && page > 1) setParams({ page: page - 1 });
    refresh();
  };

  const handleSaved = (updated) => {
    setRoleTarget(null);
    setStatusTarget(null);
    // Editing your own roles should update the session (sidebar, guards)
    // without signing out and back in.
    if (updated?._id === me?._id && updated?.roles)
      dispatch(setUser({ ...me, roles: updated.roles }));
    refresh();
  };

  const toggleSort = (field) => {
    const next = nextSortKey(sortKey, field);
    setParams({ sort: next === DEFAULT_SORT_KEY ? "" : next });
  };

  const s = stats.data;
  const statTiles = [
    { label: "Total users", value: s?.total, icon: Users, reset: true },
    { label: "Active", value: s?.active, icon: UserCheck, param: "status", match: "active" },
    { label: "Inactive", value: s?.inactive, icon: UserX, param: "status", match: "inactive" },
    { label: "Admins", value: s?.admins, icon: ShieldCheck, param: "role", match: ROLE_ADMIN },
    { label: "Merchants", value: s?.merchants, icon: Store, param: "role", match: ROLE_MERCHANT },
  ];
  const current = { role, status };

  return (
    <div className="container-page py-8 lg:py-10 transition-colors duration-300">
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
          onClick={refresh}
          disabled={loading}
          className="btn-secondary"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {/* Stats — each tile doubles as a quick filter */}
      <motion.div
        {...fadeUp(0.07)}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-hairline dark:bg-[#262932] border border-hairline dark:border-[#262932] mb-6"
      >
        {statTiles.map((t, i) => {
          const Icon = t.icon;
          const active = t.reset ? !role && !status : current[t.param] === t.match;
          const onClick = () =>
            t.reset
              ? setParams({ role: "", status: "" })
              : setParams({ [t.param]: active ? "" : t.match });
          return (
            <button
              key={t.label}
              onClick={onClick}
              aria-pressed={active}
              className={`flex items-start gap-3 px-5 py-4 text-left transition-colors ${
                i === 0 ? "col-span-2 sm:col-span-1" : ""
              } ${
                active
                  ? "bg-signal-tint dark:bg-signal/10"
                  : "bg-paper dark:bg-[#0e0f12] hover:bg-hairline/30 dark:hover:bg-[#16181f]"
              }`}
            >
              <Icon size={16} className="text-signal mt-1 shrink-0" />
              <span>
                <span className="block font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
                  {t.value ?? "—"}
                </span>
                <span className="block eyebrow dark:text-[#8b8fa8] mt-1">{t.label}</span>
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        {...fadeUp(0.1)}
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center mb-4"
      >
        <SearchField
          value={search}
          onChange={(value) => setParams({ search: value })}
          placeholder="Search name or email…"
          label="Search users"
          className="w-full sm:max-w-sm sm:flex-1"
        />
        <div className="flex gap-3">
          <label className="sr-only" htmlFor="user-role-filter">
            Role
          </label>
          <select
            id="user-role-filter"
            value={role}
            onChange={(e) => setParams({ role: e.target.value })}
            className="field flex-1 sm:w-40 px-2 cursor-pointer dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8]"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="user-status-filter">
            Status
          </label>
          <select
            id="user-status-filter"
            value={status}
            onChange={(e) => setParams({ status: e.target.value })}
            className="field flex-1 sm:w-40 px-2 cursor-pointer dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "any"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        {...fadeUp(0.12)}
        className="border border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {loading ? (
          <Loader label="Loading users" />
        ) : error ? (
          <div role="alert" className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <AlertTriangle size={24} className="text-danger" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              Couldn&apos;t load users
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {apiErrorMessage(error, "Check your connection and try again.")}
            </p>
            <button onClick={refresh} className="btn-secondary mt-2">
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <Users size={28} className="text-slate dark:text-[#8b8fa8]" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              No users found
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {hasFilters ? "Try a different search or filter." : "New sign-ups will appear here."}
            </p>
            {hasFilters && (
              <button
                onClick={() => setParams({ search: "", role: "", status: "" })}
                className="btn-secondary mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline dark:border-[#262932]">
                {COLUMNS.map((col) => (
                  <SortableHeader
                    key={col.label || "actions"}
                    {...col}
                    sortKey={sortKey}
                    onSort={toggleSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline dark:divide-[#262932]">
              {users.map((user, i) => {
                const isSelf = user._id === me?._id;
                const isActive = user.isActive !== false;
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 overflow-hidden border border-hairline dark:border-[#262932] bg-ink dark:bg-[#262932] grid place-items-center">
                          {user.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt=""
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
                        <span className="font-medium text-ink dark:text-[#f0efe8] max-w-36 truncate">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-signal">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate dark:text-[#8b8fa8] max-w-48 truncate">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate dark:text-[#8b8fa8] whitespace-nowrap">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles?.length ? user.roles : [ROLE_USER]).map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${
                          isActive ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate dark:text-[#8b8fa8] whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewTarget(user)}
                          className={`${iconButton} hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8]`}
                          aria-label={`View ${user.name}`}
                          title="View details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setRoleTarget(user)}
                          className={`${iconButton} hover:border-signal hover:text-signal`}
                          aria-label={`Change roles for ${user.name}`}
                          title="Change roles"
                        >
                          <ShieldCheck size={13} />
                        </button>
                        <button
                          onClick={() => setStatusTarget(user)}
                          disabled={isSelf}
                          className={`${iconButton} ${
                            isActive ? "hover:border-danger hover:text-danger" : "hover:border-ok hover:text-ok"
                          }`}
                          aria-label={`${isActive ? "Deactivate" : "Activate"} ${user.name}`}
                          title={isSelf ? "You can't deactivate yourself" : isActive ? "Deactivate" : "Activate"}
                        >
                          {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isSelf}
                          className={`${iconButton} hover:border-danger hover:text-danger`}
                          aria-label={`Delete ${user.name}`}
                          title={isSelf ? "You can't delete yourself" : "Delete user"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      <Pagination total={data?.total ?? 0} pageSize={USER_MANAGEMENT_PAGE_SIZE} />

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            user={deleteTarget}
            onClose={closeDelete}
            onConfirm={handleDeleted}
          />
        )}
        {roleTarget && (
          <RoleModal
            key="role-modal"
            user={roleTarget}
            isSelf={roleTarget._id === me?._id}
            onClose={closeRole}
            onSave={handleSaved}
          />
        )}
        {statusTarget && (
          <UserStatusModal
            key="status-modal"
            user={statusTarget}
            onClose={closeStatus}
            onSave={handleSaved}
          />
        )}
        {viewTarget && (
          <UserViewModal key="view-modal" user={viewTarget} onClose={closeView} />
        )}
      </AnimatePresence>
    </div>
  );
};

// useSearchParams needs a Suspense boundary or the route can't prerender.
const UserManagementPage = () => (
  <Suspense fallback={<Loader label="Loading users" />}>
    <UserManagement />
  </Suspense>
);

export default UserManagementPage;
