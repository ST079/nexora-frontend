"use client";

import { Suspense, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import SearchField from "@/components/SearchField";
import SortableHeader from "@/components/SortableHeader";
import { Avatar } from "@/components/UserProfile";
import RoleBadge from "./_components/RoleBadge";
import DeleteModal from "./_components/DeleteModal";
import RoleModal from "./_components/RoleModal";
import UserViewModal from "./_components/UserViewModal";
import UserStatusModal from "./_components/UserStatusModal";
import {
  ConsoleHeader,
  ConsoleTable,
  FilterChips,
  RowAction,
  StatStrip,
  TableCard,
  TableEmpty,
  TableError,
  TableSkeleton,
  rowMotion,
  tdClass,
} from "../_components/Console";
import { getAllUsers, getTotalCount, getUserStats } from "@/api/user";
import { apiErrorMessage, formatDate } from "@/utils/format";
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
  { value: "active", label: "Active", dot: "bg-ok" },
  { value: "inactive", label: "Inactive", dot: "bg-danger" },
];

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
  const current = { role, status };
  const statTiles = [
    { label: "Total users", value: s?.total, icon: Users, tone: "bg-mist text-ink", reset: true },
    { label: "Active", value: s?.active, icon: UserCheck, tone: "bg-ok/12 text-ok", param: "status", match: "active" },
    { label: "Inactive", value: s?.inactive, icon: UserX, tone: "bg-danger/10 text-danger", param: "status", match: "inactive" },
    { label: "Admins", value: s?.admins, icon: ShieldCheck, tone: "bg-blueprint-tint text-blueprint-dim", param: "role", match: ROLE_ADMIN },
    { label: "Merchants", value: s?.merchants, icon: Store, tone: "bg-signal-tint text-signal-dim", param: "role", match: ROLE_MERCHANT },
  ].map(({ reset, param, match, ...tile }) => {
    const active = reset ? !role && !status : current[param] === match;
    return {
      ...tile,
      active,
      onClick: () =>
        reset ? setParams({ role: "", status: "" }) : setParams({ [param]: active ? "" : match }),
    };
  });

  return (
    <div className="container-page py-8 transition-colors duration-300 lg:py-10">
      <ConsoleHeader
        eyebrow="Admin · Users"
        title={
          <>
            User <span className="marker">management</span>
          </>
        }
        description="Tap a tile to filter. Click any row for the full profile."
      >
        <button type="button" onClick={refresh} disabled={loading} className="btn-secondary">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </ConsoleHeader>

      {/* Counts describe every account, not just the page on screen. */}
      <StatStrip tiles={statTiles} loading={stats.loading} />

      <motion.div
        {...fadeUp(0.1)}
        className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <SearchField
          value={search}
          onChange={(value) => setParams({ search: value })}
          placeholder="Search name or email…"
          label="Search users"
          className="w-full lg:max-w-sm"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <FilterChips
            label="Filter by role"
            layoutId="user-role-filter"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(value) => setParams({ role: value })}
          />
          <FilterChips
            label="Filter by status"
            layoutId="user-status-filter"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(value) => setParams({ status: value })}
          />
        </div>
      </motion.div>

      <TableCard stale={loading && Boolean(data)}>
        {loading && !data ? (
          <TableSkeleton label="Loading users" />
        ) : error ? (
          <TableError
            title="Couldn't load users"
            message={apiErrorMessage(error, "Check your connection and try again.")}
            onRetry={refresh}
          />
        ) : users.length === 0 ? (
          <TableEmpty
            icon={Users}
            title="No users found"
            description={hasFilters ? "Try a different search or filter." : "New sign-ups will appear here."}
          >
            {hasFilters && (
              <button
                type="button"
                onClick={() => setParams({ search: "", role: "", status: "" })}
                className="btn-secondary"
              >
                Clear filters
              </button>
            )}
          </TableEmpty>
        ) : (
          <ConsoleTable>
            <thead>
              <tr>
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
            <tbody>
              {users.map((user, i) => {
                const isSelf = user._id === me?._id;
                const isActive = user.isActive !== false;
                return (
                  <motion.tr
                    key={user._id}
                    {...rowMotion(i)}
                    onClick={() => setViewTarget(user)}
                    className="group cursor-pointer"
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="h-10 w-10 shrink-0 text-xs" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2">
                            <span className="max-w-40 truncate font-semibold text-ink">{user.name}</span>
                            {isSelf && (
                              <span className="rounded-full bg-signal px-1.5 py-0.5 text-[10px] font-bold leading-none text-on-signal">
                                You
                              </span>
                            )}
                          </p>
                          <p className="max-w-56 truncate text-xs text-slate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-xs tabular-nums text-slate`}>
                      {user.phone || "—"}
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {(user.roles?.length ? user.roles : [ROLE_USER]).map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${
                          isActive ? "bg-ok/12 text-ok" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {isActive ? <CheckCircle2 size={12} aria-hidden /> : <XCircle size={12} aria-hidden />}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-xs text-slate`}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <RowAction
                          onClick={() => setViewTarget(user)}
                          aria-label={`View ${user.name}`}
                          title="View details"
                        >
                          <Eye size={14} />
                        </RowAction>
                        <RowAction
                          tone="signal"
                          onClick={() => setRoleTarget(user)}
                          aria-label={`Change roles for ${user.name}`}
                          title="Change roles"
                        >
                          <ShieldCheck size={14} />
                        </RowAction>
                        <RowAction
                          tone={isActive ? "danger" : "ok"}
                          onClick={() => setStatusTarget(user)}
                          disabled={isSelf}
                          aria-label={`${isActive ? "Deactivate" : "Activate"} ${user.name}`}
                          title={isSelf ? "You can't deactivate yourself" : isActive ? "Deactivate" : "Activate"}
                        >
                          {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </RowAction>
                        <RowAction
                          tone="danger"
                          onClick={() => setDeleteTarget(user)}
                          disabled={isSelf}
                          aria-label={`Delete ${user.name}`}
                          title={isSelf ? "You can't delete yourself" : "Delete user"}
                        >
                          <Trash2 size={14} />
                        </RowAction>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </ConsoleTable>
        )}
      </TableCard>

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
