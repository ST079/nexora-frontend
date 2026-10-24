export const metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

// Metadata only: the page itself is a client component.
// Child routes set their own titles.
const YourOrdersLayout = ({ children }) => children;

export default YourOrdersLayout;
