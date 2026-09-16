export type ActiveTab =
  | "dashboard"
  | "inventory"
  | "financials"
  | "parts"
  | "salesHistory";

export type Car = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  engineSize: string;
  transmission: string;
  imageUrl?: string;
  isSold: boolean;
  type: string;
  condition: "New" | "Used" | string;
};

export type FormData = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  color: string;
  engineSize: string;
  transmission: string;
  imageUrl: string;
  type: string;
  condition: string;
};

export type SparePart = {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  price: number;
  quantityInStock: number;
  soldQuantity?: number;
  compatibleModels?: string;
  imageUrl?: string;
};

export type PartFormDataState = {
  name: string;
  partNumber: string;
  category: string;
  price: string;
  quantityInStock: string;
  compatibleModels: string;
  imageUrl: string;
};

export type SaleRecord = {
  id: number;
  carName?: string;
  make?: string;
  model?: string;
  customerName?: string;
  salePrice: number;
  saleDate: string;
  soldBy?: string;
};