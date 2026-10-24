import { formatDate, formatNPR } from "@/utils/format";
import { motion } from "framer-motion";
import { ArrowUpRight, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentBadge from "./PaymentBadge";
import { ORDER_STATUS_CANCELLED } from "@/constants/orders";
import { ORDERS_ROUTE } from "@/constants/routes";
import { EASE_OUT } from "@/utils/motion";

const OrderCard = ({ order, index }) => {
  const id = order.orderNumber?.toUpperCase() ?? String(order._id).slice(-6);
  const items = order.orderItems ?? [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const first = items[0];
  const title = first?.name || first?.product?.name;
  // Up to three thumbnails, fanned like a small stack of parcels.
  const thumbs = items.map((i) => i.product?.imageUrls?.[0]).filter(Boolean).slice(0, 3);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: EASE_OUT }}
    >
      <Link
        href={`${ORDERS_ROUTE}/${order._id}`}
        className="group flex items-center gap-4 rounded-3xl border border-hairline bg-panel p-3 pr-4 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-lift sm:p-4 sm:pr-5"
      >
        <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
          {thumbs.length ? (
            thumbs
              .map((src, i) => (
                <span
                  key={src + i}
                  className={`absolute inset-0 overflow-hidden rounded-2xl bg-mist ring-2 ring-panel transition-transform duration-500 ease-spring ${
                    i === 1
                      ? "rotate-6 group-hover:translate-x-1.5 group-hover:rotate-12"
                      : i === 2
                        ? "-rotate-6 group-hover:-translate-x-1.5 group-hover:-rotate-12"
                        : ""
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </span>
              ))
              .reverse()
          ) : (
            <span className="grid h-full w-full place-items-center rounded-2xl bg-mist text-slate">
              <Package size={20} aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-[11px] text-slate">
            #{id} · {formatDate(order.createdAt)}
          </p>
          <p className="truncate font-display text-base font-semibold text-ink">
            {title ?? `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            {title && items.length > 1 && (
              <span className="font-sans text-sm font-normal text-slate">
                {" "}
                + {items.length - 1} more
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <OrderStatusBadge status={order.status} />
            {order.status !== ORDER_STATUS_CANCELLED && (
              <span className="hidden sm:inline-flex">
                <PaymentBadge order={order} />
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="font-mono text-sm font-semibold text-ink">{formatNPR(order.totalPrice)}</p>
          <p className="text-[11px] text-slate">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink transition-all duration-300 group-hover:rotate-45 group-hover:bg-ink group-hover:text-paper">
            <ArrowUpRight size={15} aria-hidden />
          </span>
        </div>
      </Link>
    </motion.li>
  );
};

export default OrderCard;
