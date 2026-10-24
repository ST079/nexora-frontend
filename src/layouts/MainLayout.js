// The `dark` class now lives on <html> (see ThemeSync in redux/provider.js),
// so dark mode also reaches the dashboard and auth pages. The bottom padding
// keeps content clear of the floating tab bar on phones and tablets.
const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-paper pb-24 transition-colors duration-300 lg:pb-0">
      {children}
    </div>
  );
};

export default MainLayout;
