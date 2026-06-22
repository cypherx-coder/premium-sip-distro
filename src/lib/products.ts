import cola from "@/assets/p-cola.jpg";
import fanta from "@/assets/p-fanta.jpg";
import sprite from "@/assets/p-sprite.jpg";
import pepsi from "@/assets/p-pepsi.jpg";
import sevenup from "@/assets/p-7up.jpg";
import mirinda from "@/assets/p-mirinda.jpg";
import water from "@/assets/p-water.jpg";
import malt from "@/assets/p-malt.jpg";
import energy from "@/assets/p-energy.jpg";
import juice from "@/assets/p-juice.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  { id: "coca-cola", name: "Coca-Cola", category: "Soft Drinks", description: "Classic refreshing cola, supplied by the crate.", price: 7500, unit: "Crate", image: cola },
  { id: "fanta", name: "Fanta Orange", category: "Soft Drinks", description: "Bright, fruity orange soda — a national favourite.", price: 7500, unit: "Crate", image: fanta },
  { id: "sprite", name: "Sprite", category: "Soft Drinks", description: "Crisp lemon-lime soda with a clean finish.", price: 7500, unit: "Crate", image: sprite },
  { id: "pepsi", name: "Pepsi", category: "Soft Drinks", description: "Bold cola taste — perfect for events and retail.", price: 7200, unit: "Crate", image: pepsi },
  { id: "7up", name: "7UP", category: "Soft Drinks", description: "Refreshing lemon-lime with zero caffeine.", price: 7200, unit: "Crate", image: sevenup },
  { id: "mirinda", name: "Mirinda", category: "Soft Drinks", description: "Sweet orange fizz, loved across all ages.", price: 7200, unit: "Crate", image: mirinda },
  { id: "water", name: "Premium Bottled Water", category: "Bottled Water", description: "Purified table water — 75cl x 12 pack.", price: 1800, unit: "Pack", image: water },
  { id: "malt", name: "Premium Malt Drink", category: "Malt Drinks", description: "Rich, non-alcoholic malt — full case supply.", price: 9800, unit: "Case", image: malt },
  { id: "energy", name: "Energy Drink", category: "Energy Drinks", description: "High-performance energy boost — 24 cans per pack.", price: 14500, unit: "Pack", image: energy },
  { id: "juice", name: "Premium Fruit Juice", category: "Fruit Juices", description: "100% natural fruit juice — supplied by the case.", price: 11500, unit: "Case", image: juice },
];

export const CATEGORIES = [
  { name: "Soft Drinks", icon: "🥤", desc: "Coca-Cola, Pepsi, Fanta & more" },
  { name: "Bottled Water", icon: "💧", desc: "Pure, premium table water" },
  { name: "Energy Drinks", icon: "⚡", desc: "Performance & focus boosters" },
  { name: "Malt Drinks", icon: "🍺", desc: "Rich, non-alcoholic malts" },
  { name: "Fruit Juices", icon: "🍊", desc: "100% natural fruit juices" },
];

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
