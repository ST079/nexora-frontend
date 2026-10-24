// Table sorting kept in the URL as a short key: "price" (ascending) or
// "-price" (descending). The backend wants JSON like {"price":-1}.

export const sortJSON = (key) =>
  JSON.stringify(key.startsWith("-") ? { [key.slice(1)]: -1 } : { [key]: 1 });

// Clicking a column sorts ascending first, then flips.
export const nextSortKey = (current, field) =>
  current === field ? `-${field}` : field;

// Value for the header's aria-sort.
export const sortDirection = (current, field) => {
  if (current.replace(/^-/, "") !== field) return "none";
  return current.startsWith("-") ? "descending" : "ascending";
};
