"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import Image from "next/image";
import StatusBadge from "./StockStatusBadge";
import ProductModal from "./ProductModal";
import DeleteModal from "./DeleteModal";

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const ProductDashboard = ({ allProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setProducts(allProducts);
  }, [allProducts]);

  const handleSave = () => {
    setEditProduct(null);
    setSuccessMsg("Product saved successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchProducts();
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    setSuccessMsg("Product deleted.");
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchProducts();
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} />
    );
  };

  const filtered = products
    .filter((p) =>
      [p.name, p.brand, p.category].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      ),
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "price" || sortField === "stock")
        return (a[sortField] - b[sortField]) * dir;
      return String(a[sortField]).localeCompare(String(b[sortField])) * dir;
    });

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Admin · Products</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            Product management
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

      {/* ── Success toast ── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 border border-ok/40 bg-ok/5 dark:bg-ok/10 px-4 py-3 text-sm text-ok mb-6"
          >
            <Check size={14} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats strip ── */}
      <motion.div
        {...fadeUp(0.07)}
        className="grid grid-cols-2 sm:grid-cols-4 border border-hairline dark:border-[#262932] mb-6"
      >
        {[
          { label: "Total products", value: products.length },
          {
            label: "In stock",
            value: products.filter((p) => p.stock > 0).length,
          },
          {
            label: "Low stock",
            value: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
          },
          {
            label: "Out of stock",
            value: products.filter((p) => p.stock <= 0).length,
          },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`px-5 py-4 ${i < 3 ? "border-r border-hairline dark:border-[#262932]" : ""}`}
          >
            <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
              {s.value}
            </p>
            <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Search ── */}
      <motion.div
        {...fadeUp(0.1)}
        className="flex items-center border border-hairline dark:border-[#262932] px-3 py-2.5 gap-2 mb-4 max-w-sm focus-within:border-ink dark:focus-within:border-[#f0efe8] transition-colors"
      >
        <Search size={14} className="text-slate dark:text-[#8b8fa8] shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, brand, category…"
          className="w-full bg-transparent text-sm outline-none text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72]"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
          >
            <X size={13} />
          </button>
        )}
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        {...fadeUp(0.12)}
        className="border border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate dark:text-[#8b8fa8]">
            <Loader2 size={16} className="animate-spin" />
            <span className="font-mono text-sm">Loading catalog…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <PackageOpen size={28} className="text-slate dark:text-[#8b8fa8]" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              No products found
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              Try a different search or add a new product.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12]">
                {[
                  { label: "Product", field: "name" },
                  { label: "Brand", field: "brand" },
                  { label: "Category", field: "category" },
                  { label: "Price", field: "price" },
                  { label: "Stock", field: "stock" },
                  { label: "Status", field: null },
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
              {filtered.map((product, i) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center">
                            <PackageOpen
                              size={14}
                              className="text-slate dark:text-[#8b8fa8]"
                            />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-ink dark:text-[#f0efe8] max-w-[180px] truncate">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate dark:text-[#8b8fa8]">
                    {product.brand}
                  </td>
                  <td className="px-4 py-3 text-slate dark:text-[#8b8fa8]">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8]">
                    Rs. {Number(product.price).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8]">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge stock={product.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-danger hover:text-danger dark:hover:border-danger dark:hover:text-danger transition-colors"
                        aria-label="Delete"
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

      <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-3">
        {filtered.length} of {products.length} product
        {products.length === 1 ? "" : "s"}
      </p>

      {/* ── Modals ── */}
      <AnimatePresence>
        {editProduct !== null && (
          <ProductModal
            key="product-modal"
            product={editProduct?._id ? editProduct : null}
            onClose={() => setEditProduct(null)}
            onSave={handleSave}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            product={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDashboard;
