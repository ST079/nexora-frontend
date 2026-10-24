"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import StatusBadge from "./StockStatusBadge";
import ProductModal from "./ProductModal";
import DeleteModal from "./DeleteModal";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import SearchField from "@/components/SearchField";
import SortableHeader from "@/components/SortableHeader";
import { EMPTY_FORM } from "@/constants/defaults";
import { PRODUCT_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import { ROLE_ADMIN } from "@/constants/user";
import { getProducts, getTotalCount } from "@/api/product";
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

const STOCK_FILTERS = [
  { value: "", label: "All" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

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

  // Merchants only see (and may only edit) their own listings; the old page
  // listed the whole catalog and every edit on someone else's item 403'd.
  const owner = isAdmin ? "" : (user?._id ?? "");
  const scope = owner ? { createdBy: owner } : {};

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
  const hasFilters = Boolean(search || stock);

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
    { label: isAdmin ? "Total products" : "Your products", value: stats.data?.total },
    {
      label: "In stock",
      value: stats.data ? stats.data.total - stats.data.out : undefined,
    },
    { label: "Low stock", value: stats.data?.low, filter: "low" },
    { label: "Out of stock", value: stats.data?.out, filter: "out" },
  ];

  return (
    <div className="container-page py-8 lg:py-10 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">
            {isAdmin ? "Admin" : "Merchant"} · Products
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            {isAdmin ? "Product management" : "Your products"}
          </h1>
        </motion.div>
        <motion.button
          {...fadeUp(0.05)}
          onClick={() => setEditProduct(EMPTY_FORM)}
          className="btn-primary"
        >
          <Plus size={15} /> Add product
        </motion.button>
      </div>

      {/* Stats strip — counts cover every product, not just this page */}
      <motion.div
        {...fadeUp(0.07)}
        className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline dark:bg-[#262932] border border-hairline dark:border-[#262932] mb-6"
      >
        {statTiles.map((s) => {
          const active = s.filter && stock === s.filter;
          const body = (
            <>
              <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
                {s.value ?? "—"}
              </p>
              <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
            </>
          );
          return s.filter ? (
            <button
              key={s.label}
              onClick={() => setParams({ stock: active ? "" : s.filter })}
              aria-pressed={active}
              className={`text-left px-5 py-4 transition-colors ${
                active
                  ? "bg-signal-tint dark:bg-signal/10"
                  : "bg-paper dark:bg-[#0e0f12] hover:bg-hairline/30 dark:hover:bg-[#16181f]"
              }`}
            >
              {body}
            </button>
          ) : (
            <div key={s.label} className="px-5 py-4 bg-paper dark:bg-[#0e0f12]">
              {body}
            </div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        {...fadeUp(0.1)}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4"
      >
        <SearchField
          value={search}
          onChange={(value) => setParams({ search: value })}
          placeholder="Search products by name…"
          label="Search products"
          className="w-full sm:max-w-sm"
        />
        <div role="group" aria-label="Filter by stock" className="flex gap-1">
          {STOCK_FILTERS.map((f) => {
            const active = stock === f.value;
            return (
              <button
                key={f.value || "all"}
                onClick={() => setParams({ stock: f.value })}
                aria-pressed={active}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest border transition-colors ${
                  active
                    ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                    : "border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        {...fadeUp(0.12)}
        className="border border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {loading ? (
          <Loader label="Loading products" />
        ) : error ? (
          <div role="alert" className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <AlertTriangle size={26} className="text-danger" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              Couldn&apos;t load products
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {apiErrorMessage(error, "Check your connection and try again.")}
            </p>
            <button onClick={refresh} className="btn-secondary mt-2">
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <PackageOpen size={28} className="text-slate dark:text-[#8b8fa8]" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              {hasFilters ? "No products match" : "No products yet"}
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {hasFilters
                ? "Try a different search or stock filter."
                : "Add your first product to start selling."}
            </p>
            {hasFilters ? (
              <button
                onClick={() => setParams({ search: "", stock: "" })}
                className="btn-secondary mt-2"
              >
                Clear filters
              </button>
            ) : (
              <button onClick={() => setEditProduct(EMPTY_FORM)} className="btn-primary mt-2">
                <Plus size={15} /> Add product
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
              {products.map((product, i) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] overflow-hidden">
                        {product.imageUrls?.[0] ? (
                          <Image
                            src={product.imageUrls[0]}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center">
                            <PackageOpen size={14} className="text-slate dark:text-[#8b8fa8]" />
                          </div>
                        )}
                      </div>
                      <span
                        className="font-medium text-ink dark:text-[#f0efe8] max-w-45 truncate"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate dark:text-[#8b8fa8]">
                    {product.brand || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate dark:text-[#8b8fa8]">
                    {product.category || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8] whitespace-nowrap">
                    {formatNPR(product.price)}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8]">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge stock={product.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-danger hover:text-danger dark:hover:border-danger dark:hover:text-danger transition-colors"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

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
