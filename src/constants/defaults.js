export const DEFAULT_SORT = JSON.stringify({ createdAt: -1 });
// No brands selected. ([""] rendered an empty chip.)
export const DEFAULT_BRAND = [];
export const DEFAULT_MIN_Price = 0;
export const DEFAULT_MAX_Price = "";
export const DEFAULT_CATEGORY = "";

// Placeholder for products without a photo, drawn in the light palette
// (mist, hairline, slate-light) so it reads as a soft empty shelf.
export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#f0ece4"/>
      <g fill="none" stroke="#9a95a5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <path d="M228 262h144l-10 118a16 16 0 0 1-16 15H254a16 16 0 0 1-16-15z"/>
        <path d="M264 262v-16a36 36 0 0 1 72 0v16"/>
      </g>
      <text x="300" y="452" font-family="ui-monospace,monospace" font-size="18" letter-spacing="3" fill="#9a95a5" text-anchor="middle">NO PHOTO YET</text>
    </svg>`,
  );

// Matches the backend's `stock=low` filter (1–5 left).
export const LOW_STOCK_THRESHOLD = 5;

export const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};
