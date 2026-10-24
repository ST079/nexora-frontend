"use client";

import ErrorView from "@/components/ErrorView";

const AppError = ({ error, unstable_retry, reset }) => (
  <ErrorView error={error} retry={unstable_retry ?? reset} />
);

export default AppError;
