import { fadeUp } from "@/app/(storeFront)/orders/page";
import { formatDate, formatNPR } from "@/utils/format";
import { motion } from "framer-motion";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import OrderStatusBadge from "./OrderStatusBadge";
const OrderCard = ({ order, index }) => {
  const id = order.orderNumber.toUpperCase();
  const itemCount = order.orderItems?.length ?? 0;

  return (
    <motion.div {...fadeUp(index * 0.04)}>
      <Link
        href={`/orders/${order._id}`}
        className="flex items-center justify-between gap-4 p-5 hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors group"
      >
        {/* Icon */}
        <div className="grid h-10 w-10 shrink-0 place-items-center border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] group-hover:border-ink dark:group-hover:border-[#f0efe8] transition-colors">
          <Package size={16} className="text-slate dark:text-[#8b8fa8]" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
              #{id}
            </p>
          </div>
          <p className="font-display font-semibold text-sm text-ink dark:text-[#f0efe8] truncate">
            {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
            <span className="font-mono">{formatNPR(order.totalPrice)}</span>
          </p>
          <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>

            <OrderStatusBadge status={order.status} />
        <ChevronRight
          size={16}
          className="text-slate dark:text-[#8b8fa8] group-hover:text-ink dark:group-hover:text-[#f0efe8] shrink-0 transition-colors"
        />
      </Link>
    </motion.div>
  );
};

export default OrderCard;
