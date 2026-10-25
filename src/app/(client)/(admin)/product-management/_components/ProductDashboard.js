"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import StatusBadge from "./StockStatusBadge";
import ProductModal from "./ProductModal";
import DeleteModal from "./DeleteModal";
import {
  ConsoleHeader,
  ConsoleTable,
  FilterChips,
  FilterSelect,
  RowAction,
  StatStrip,
  TableCard,
  TableEmpty,
  TableError,
  TableSkeleton,
  rowMotion,
  tdClass,
} from "../../_components/Console";
import Pagination from "@/components/Pagination";
import SearchField from "@/components/SearchField";
import SortableHeader from "@/components/SortableHeader";
import { EMPTY_FORM } from "@/constants/defaults";
import { PRODUCT_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import { ROLE_ADMIN } from "@/constants/user";
import { getProductMerchants, getProducts, getTotalCount } from "@/api/product";
import { apiErrorMessage, formatNPR } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { nextSortKey, sortJSON } from "@/utils/sort";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useResource } from "@/hooks/useResource";

const DEFAULT_SORT_KEY = "-createdAt";

const COLUMNS = [
  { label: "Product", field: "name" },
  { label: "Brand", field: "brand" },
  { label: "Category", field: "category" },
  { label: "Price", field: "price" },
  { label: "Stock", field: "stock" },
  { label: "Status" },
  { label: "" },
];

// Admins see who owns each row, unless they've already picked one owner.
const MERCHANT_COLUMN = { label: "Merchant" };

const STOCK_FILTERS = [
  { value: "", label: "All" },
  { value: "low", label: "Low stock", dot: "bg-marigold" },
  { value: "out", label: "Out of stock", dot: "bg-danger" },
];

// Owners come from the products themselves, so an admin who listed items
// is marked, and a deleted account still has a name to pick.
const merchantName = (merchant) => {
  if (!merchant?.name) return "Deleted account";
  return merchant.roles?.includes(ROLE_ADMIN) ? `${merchant.name} (admin)` : merchant.name;
};

const ProductDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes(ROLE_ADMIN);
  const { searchParams, setParams } = useQueryParams();
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [version, setVersion] = useState(0);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const stock = searchParams.get("stock") ?? "";
  const sortKey = searchParams.get("sort") ?? DEFAULT_SORT_KEY;
  const merchant = isAdmin ? (searchParams.get("merchant") ?? "") : "";

  // Merchants only see (and may only edit) their own listings; the old page
  // listed the whole catalog and every edit on someone else's item 403'd.
  // Admins see everything, or one owner's listings once they pick a merchant.
  const owner = isAdmin ? merchant : (user?._id ?? "");
  const scope = owner ? { createdBy: owner } : {};

  // The endpoint is admin-only, so merchants never ask for it.
  const merchants = useResource(isAdmin ? `merchants|${version}` : "none", async () =>
    isAdmin ? await getProductMerchants() : [],
  );
  // Arrives sorted by name; deleted accounts (no name) go to the bottom.
  const merchantList = (merchants.data ?? [])
    .filter((m) => m._id)
    .sort((a, b) => Boolean(b.name) - Boolean(a.name));
  const merchantsById = new Map(merchantList.map((m) => [m._id, m]));
  const merchantOptions = [
    { value: "", label: "All merchants" },
    ...merchantList.map((m) => ({ value: m._id, label: `${merchantName(m)} · ${m.products}` })),
  ];
  // A shared link can name an owner the menu doesn't list (no products left,
  // or the menu is still loading); keep it as an option so the pill isn't blank.
  if (merchant && !merchantsById.has(merchant)) {
    merchantOptions.push({
      value: merchant,
      label: merchants.loading ? "Loading merchant…" : "Unknown merchant",
    });
  }
  const columns =
    isAdmin && !merchant ? [...COLUMNS.slice(0, 1), MERCHANT_COLUMN, ...COLUMNS.slice(1)] : COLUMNS;

  const stats = useResource(`${owner}|${version}`, async () => {
    const [all, low, out] = await Promise.all([
      getTotalCount(scope),
      getTotalCount({ ...scope, stock: "low" }),
      getTotalCount({ ...scope, stock: "out" }),
    ]);
    return { total: all.totalCount, low: low.totalCount, out: out.totalCount };
  });

  const listKey = `${owner}|${page}|${search}|${stock}|${sortKey}|${version}`;
  const { data, loading, error } = useResource(listKey, async () => {
    const filters = { ...scope, name: search, stock };
    const limit = PRODUCT_MANAGEMENT_PAGE_SIZE;
    const [products, count] = await Promise.all([
      getProducts({
        ...filters,
        sort: sortJSON(sortKey),
        limit,
        offset: (page - 1) * limit,
      }),
      getTotalCount(filters),
    ]);
    return { products, total: count.totalCount };
  });
  const products = data?.products ?? [];
  const hasFilters = Boolean(search || stock || merchant);

  const refresh = () => setVersion((v) => v + 1);

  const handleSave = (_saved, isEdit) => {
    setEditProduct(null);
    toast.success(isEdit ? "Product updated." : "Product added.");
    refresh();
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    toast.success("Product deleted.");
    // Step back if that was the last row on this page.
    if (products.length === 1 && page > 1) setParams({ page: page - 1 });
    refresh();
  };

  const closeEditor = useCallback(() => setEditProduct(null), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  const toggleSort = (field) => {
    const next = nextSortKey(sortKey, field);
    setParams({ sort: next === DEFAULT_SORT_KEY ? "" : next });
  };

  const statTiles = [
    {
      label: isAdmin ? (merchant ? "Merchant's products" : "Total products") : "Your products",
      value: stats.data?.total,
      icon: Package,
      tone: "bg-signal-tint text-signal-dim",
    },
    {
      label: "In stock",
      value: stats.data ? stats.data.total - stats.data.out : undefined,
      icon: CheckCircle2,
      tone: "bg-ok/12 text-ok",
    },
    {
      label: "Low stock",
      value: stats.data?.low,
      icon: AlertTriangle,
      tone: "bg-marigold-tint text-marigold-dim",
      filter: "low",
    },
    {
      label: "Out of stock",
      value: stats.data?.out,
      icon: XCircle,
      tone: "bg-danger/10 text-danger",
      filter: "out",
    },
  ].map(({ filter, ...tile }) =>
    filter
      ? {
          ...tile,
          active: stock === filter,
          onClick: () => setParams({ stock: stock === filter ? "" : filter }),
        }
      : tile,
  );

  return (
    <div className="container-page py-8 transition-colors duration-300 lg:py-10">
      <ConsoleHeader
        eyebrow={`${isAdmin ? "Admin" : "Merchant"} · Products`}
        title={
          isAdmin ? (
            <>
              Product <span className="marker">management</span>
            </>
          ) : (
            <>
              Your <span className="marker">products</span>
            </>
          )
        }
        description={
          isAdmin
            ? "Add, edit and restock listings. Pick a merchant or tap a stock tile to filter the table."
            : "Add, edit and restock listings. Tap a stock tile to filter the table."
        }
      >
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="icon-btn"
          aria-label="Refresh products"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
        <button type="button" onClick={() => setEditProduct(EMPTY_FORM)} className="btn-primary group">
          <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
          Add product
        </button>
      </ConsoleHeader>

      {/* Counts cover every product, not just this page. */}
      <StatStrip tiles={statTiles} loading={stats.loading} />

      {/* Admins get a second filter, so the toolbar waits for more room before going side by side. */}
      <motion.div
        {...fadeUp(0.1)}
        className={`mb-4 flex flex-col gap-3 ${
          isAdmin
            ? "lg:flex-row lg:items-center lg:justify-between"
            : "sm:flex-row sm:items-center sm:justify-between"
        }`}
      >
        <SearchField
          value={search}
          onChange={(value) => setParams({ search: value })}
          placeholder="Search products by name…"
          label="Search products"
          className={`w-full ${isAdmin ? "lg:max-w-sm" : "sm:max-w-sm"}`}
        />
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          {isAdmin && (
            <FilterSelect
              label="Filter by merchant"
              icon={Store}
              options={merchantOptions}
              value={merchant}
              onChange={(value) => setParams({ merchant: value })}
            />
          )}
          <FilterChips
            label="Filter by stock"
            layoutId="product-stock-filter"
            options={STOCK_FILTERS}
            value={stock}
            onChange={(value) => setParams({ stock: value })}
          />
        </div>
      </motion.div>

      <TableCard stale={loading && Boolean(data)}>
        {loading && !data ? (
          <TableSkeleton label="Loading products" />
        ) : error ? (
          <TableError
            title="Couldn't load products"
            message={apiErrorMessage(error, "Check your connection and try again.")}
            onRetry={refresh}
          />
        ) : products.length === 0 ? (
          <TableEmpty
            icon={PackageOpen}
            title={hasFilters ? "No products match" : "No products yet"}
            description={
              hasFilters
                ? isAdmin
                  ? "Try a different search, merchant or stock filter."
                  : "Try a different search or stock filter."
                : "Add your first product to start selling."
            }
          >
            {hasFilters ? (
              <button
                type="button"
                onClick={() => setParams({ search: "", stock: "", merchant: "" })}
                className="btn-secondary"
              >
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={() => setEditProduct(EMPTY_FORM)} className="btn-primary">
                <Plus size={15} /> Add product
              </button>
            )}
          </TableEmpty>
        ) : (
          <ConsoleTable>
            <thead>
              <tr>
                {columns.map((col) => (
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
              {products.map((product, i) => (
                <motion.tr
                  key={product._id}
                  {...rowMotion(i)}
                  onClick={() => setEditProduct(product)}
                  className="group cursor-pointer"
                >
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-hairline bg-mist">
                        {product.imageUrls?.[0] ? (
                          <Image
                            src={product.imageUrls[0]}
                            alt=""
                            width={44}
                            height={44}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center">
                            <PackageOpen size={15} className="text-slate-light" />
                          </div>
                        )}
                      </div>
                      <span
                        className="max-w-45 truncate font-semibold text-ink"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    </div>
                  </td>
                  {isAdmin && !merchant && (
                    <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                      {/* Until the owner menu arrives there's no name to show or filter by. */}
                      {merchants.data ? (
                        <button
                          type="button"
                          onClick={() => setParams({ merchant: product.createdBy })}
                          title="Show only this merchant's products"
                          className="inline-flex max-w-40 items-center gap-1.5 rounded-full px-2 py-1 text-left text-slate transition-colors hover:bg-panel hover:text-ink"
                        >
                          <Store size={13} aria-hidden className="shrink-0" />
                          <span className="truncate">
                            {merchantName(merchantsById.get(product.createdBy))}
                          </span>
                        </button>
                      ) : merchants.loading ? (
                        <span className="skeleton inline-block h-3.5 w-20 align-middle" />
                      ) : (
                        <span className="text-slate">—</span>
                      )}
                    </td>
                  )}
                  <td className={`${tdClass} text-slate`}>{product.brand || "—"}</td>
                  <td className={tdClass}>
                    {product.category ? (
                      <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-slate-dim transition-colors group-hover:bg-panel">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-slate">—</span>
                    )}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap font-semibold tabular-nums text-ink`}>
                    {formatNPR(product.price)}
                  </td>
                  <td className={`${tdClass} tabular-nums text-ink`}>{product.stock}</td>
                  <td className={tdClass}>
                    <StatusBadge stock={product.stock} />
                  </td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <RowAction
                        onClick={() => setEditProduct(product)}
                        aria-label={`Edit ${product.name}`}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </RowAction>
                      <RowAction
                        tone="danger"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Delete ${product.name}`}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </RowAction>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </ConsoleTable>
        )}
      </TableCard>

      <Pagination total={data?.total ?? 0} pageSize={PRODUCT_MANAGEMENT_PAGE_SIZE} />

      {/* Modals */}
      <AnimatePresence>
        {editProduct !== null && (
          <ProductModal
            key="product-modal"
            product={editProduct?._id ? editProduct : null}
            onClose={closeEditor}
            onSave={handleSave}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            product={deleteTarget}
            onClose={closeDelete}
            onConfirm={handleDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDashboard;
