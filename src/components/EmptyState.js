import { PackageSearch } from "lucide-react";

const EmptyState = ({ title, description, action }) => {
  return (
    <div className="border border-dashed border-hairline dark:border-[#262932] py-20 text-center px-6">
      <PackageSearch
        size={28}
        aria-hidden
        className="mx-auto mb-4 text-slate dark:text-[#8b8fa8]"
      />
      <p className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]">
        {title}
      </p>
      {description && (
        <p className="mt-2 text-sm text-slate dark:text-[#8b8fa8] max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
