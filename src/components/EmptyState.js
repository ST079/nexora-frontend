import React from "react";

const EmptyState = ({ title, description, action }) => {
  return (
    <div className="border border-dashed border-hairline py-20 text-center px-6">
      <p className="font-display text-xl font-semibold">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-slate max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
