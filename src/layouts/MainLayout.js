// The `dark` class now lives on <html> (see ThemeSync in redux/provider.js),
// so dark mode also reaches the dashboard and auth pages.
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      {children}
    </div>
  );
};

export default MainLayout;
