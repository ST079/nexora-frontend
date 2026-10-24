// Staff tools never belong in search results.
export const metadata = {
  robots: { index: false, follow: false },
};

// Access is checked once in app/(client)/layout.js, which also knows the
// role each admin route needs. This group only exists to share _components.
const AdminLayout = ({ children }) => children;

export default AdminLayout;
