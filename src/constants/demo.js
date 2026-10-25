// The shared demo shopper offered on the sign-in page. Public on purpose:
// nexora-backend/scripts/seed-demo-user.js creates it with these details
// (change both together), and the backend won't let anyone change its
// password or profile.
export const DEMO_ACCOUNT = {
  email: "demo@example.com",
  password: "demo1234",
};
