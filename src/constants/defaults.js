export const DEFAULT_SORT = JSON.stringify({ createdAt: -1 });
export const DEFAULT_BRAND = [""];
export const DEFAULT_MIN_Price = 0;
export const DEFAULT_MAX_Price = "";
export const DEFAULT_CATEGORY = "";

export const DEFAULT_LOG = [
  "nexora-auth boot sequence",
  "resolving endpoint… /api/v1/auth",
  "handshake established",
  "awaiting credentials",
];

export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#FAFAF7"/>
      <rect x="0.5" y="0.5" width="599" height="599" fill="none" stroke="#E3E1D8"/>
      <g stroke="#E3E1D8"><line x1="0" y1="0" x2="600" y2="600"/><line x1="600" y1="0" x2="0" y2="600"/></g>
      <text x="300" y="308" font-family="monospace" font-size="13" fill="#6B7280" text-anchor="middle">NO IMAGE</text>
    </svg>`,
  );

export const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};
