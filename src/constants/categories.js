import {
  Smartphone,
  Cpu,
  Shirt,
  ShoppingBasket,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
} from "lucide-react";

export const categories = [
  { label: "Smartphones", icon: Smartphone, blurb: "Flagships & mid-range" },
  {
    label: "Tech & Electronics",
    icon: Cpu,
    blurb: "Laptops, audio, accessories",
  },
  { label: "Clothing", icon: Shirt, blurb: "Everyday & seasonal wear" },
  { label: "Groceries", icon: ShoppingBasket, blurb: "Pantry & household" },
  { label: "Home & Living", icon: Home, blurb: "Furniture & decor" },
  { label: "Beauty", icon: Sparkles, blurb: "Skincare & grooming" },
  { label: "Sports", icon: Dumbbell, blurb: "Gear & equipment" },
  { label: "Books", icon: BookOpen, blurb: "Fiction & reference" },
];
