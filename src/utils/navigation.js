// Only same-origin paths are accepted as a post-login redirect, so a crafted
// `?next=https://evil.example`, `//evil.example` or `/\evil.example` (which
// browsers also read as protocol-relative) can't bounce users off-site.
export const safeNext = (value) =>
  typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : null;

export const withNext = (route, next) =>
  safeNext(next) ? `${route}?next=${encodeURIComponent(next)}` : route;
