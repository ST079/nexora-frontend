import { User } from "lucide-react";
import Link from "next/link";

const UserProfile = () => {
  return (
    <Link
      href="/login"
      className="hidden sm:grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors"
      title="Sign in"
    >
      <User size={16} />
    </Link>
  );
};

export default UserProfile;
