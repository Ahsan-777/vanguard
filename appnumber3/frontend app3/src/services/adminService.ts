import type {
  Car,
  FormData,
  PartFormDataState,
  SaleRecord,
  SparePart,
} from "../types/Admin";

const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

const getToken = (): string => {
  return localStorage.getItem("token") || "";
};

// =====================================================
// CARS
// =====================================================

export const getCars = async (
  query = "",
  type = "All",
  condition = "All"
): Promise<Car[]> => {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.append("query", query.trim());
  }

  if (type !== "All") {
    params.append("type", type);
  }

  if (condition !== "All") {
    params.append("condition", condition);
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_URL}/cars?${queryString}`
    : `${API_URL}/cars`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cars (${response.status})`);
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};

export const addCar = async (formData: FormData): Promise<void> => {
  const response = await fetch(`${API_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      ...formData,
      year: parseInt(formData.year) || 0,
      price: parseFloat(formData.price) || 0,
      mileage: parseInt(formData.mileage) || 0,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add vehicle.");
  }
};

// =====================================================
// SPARE PARTS
// =====================================================

export const getSpareParts = async (
  query = ""
): Promise<SparePart[]> => {
  const response = await fetch(
    `${API_URL}/spareparts?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Server Error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};

export const addSparePart = async (
  formData: PartFormDataState
): Promise<void> => {
  const response = await fetch(`${API_URL}/spareparts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      ...formData,
      price: parseFloat(formData.price) || 0,
      quantityInStock:
        parseInt(formData.quantityInStock, 10) || 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || response.statusText || "Failed to add spare part."
    );
  }
};

// =====================================================
// SALES HISTORY
// =====================================================

export const getSalesHistory = async (): Promise<SaleRecord[]> => {
  const response = await fetch(`${API_URL}/salesrecords`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sales history (${response.status})`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};