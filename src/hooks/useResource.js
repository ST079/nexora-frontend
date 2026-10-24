"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Loads data whenever `key` changes. `loading` is derived (the data on hand
// belongs to an older key) rather than set inside the effect, and responses
// for a key that is no longer current are dropped, so fast filter changes
// can't show stale results.
//
//   const { data, loading, error, setData } = useResource(queryKey, () => api(query));
export const useResource = (key, load) => {
  const [state, setState] = useState({ key: undefined, data: undefined, error: null });
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let active = true;
    loadRef.current().then(
      (data) => active && setState({ key, data, error: null }),
      (error) => active && setState({ key, data: undefined, error }),
    );
    return () => {
      active = false;
    };
  }, [key]);

  // Local edits (e.g. a status change) without a refetch.
  const setData = useCallback(
    (updater) =>
      setState((s) => ({
        ...s,
        data: typeof updater === "function" ? updater(s.data) : updater,
      })),
    [],
  );

  return {
    data: state.data,
    error: state.error,
    loading: state.key !== key,
    setData,
  };
};
