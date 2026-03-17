export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Database returns decimal as string usually, or number depending on driver
  category: string;
  image: string;
  created_at: string;
  sales_count?: number;
  discount_percent?: number;
}
