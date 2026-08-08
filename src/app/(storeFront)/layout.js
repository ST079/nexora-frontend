import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MainLayout from "@/layouts/MainLayout";


const StorefrontLayout = ({ children }) => {
  return (
    <MainLayout>
      <Header />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </MainLayout>
  );
};

export default StorefrontLayout;