import { formatDate, formatNPR } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { motion } from "framer-motion";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentBadge from "./PaymentBadge";
import { ORDER_STATUS_CANCELLED } from "@/constants/orders";
import { ORDERS_ROUTE } from "@/constants/routes";

const OrderCard = ({ order, index }) => {
  const id = order.orderNumber?.toUpperCase() ?? String(order._id).slice(-6);
  const items = order.orderItems ?? [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const first = items[0];
  const thumb = first?.product?.imageUrls?.[0];
  const title = first?.name || first?.product?.name;

  return (
    <motion.div {...fadeUp(index * 0.04)}>
      <Link
        href={`${ORDERS_ROUTE}/${order._id}`}
        className="flex items-center justify-between gap-4 p-5 hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors group"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] group-hover:border-ink dark:group-hover:border-[#f0efe8] transition-colors grid place-items-center">
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <Package size={16} className="text-slate dark:text-[#8b8fa8]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1">
            #{id} · {formatDate(order.createdAt)}
          </p>
          <p className="font-display font-semibold text-sm text-ink dark:text-[#f0efe8] truncate">
            {title ?? `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            {title && items.length > 1 && (
              <span className="font-sans font-normal text-slate dark:text-[#8b8fa8]">
                {" "}
                + {items.length - 1} more
              </span>
            )}
          </p>
          <p className="font-mono text-xs text-ink dark:text-[#f0efe8] mt-0.5">
            {formatNPR(order.totalPrice)}
            <span className="text-slate dark:text-[#8b8fa8]">
              {" "}
              · {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
          {order.status !== ORDER_STATUS_CANCELLED && <PaymentBadge order={order} />}
        </div>
        <div className="sm:hidden">
          <OrderStatusBadge status={order.status} />
        </div>
        <ChevronRight
          size={16}
          className="text-slate dark:text-[#8b8fa8] group-hover:text-ink dark:group-hover:text-[#f0efe8] shrink-0 transition-colors"
        />
      </Link>
    </motion.div>
  );
};

export default OrderCard;
