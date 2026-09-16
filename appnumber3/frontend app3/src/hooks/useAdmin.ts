import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ActiveTab,
  Car,
  FormData,
  PartFormDataState,
  SaleRecord,
  SparePart,
} from "../types/Admin";

import {
  addCar,
  addSparePart,
  getCars,
  getSalesHistory,
  getSpareParts,
} from "../services/adminService";

const ITEMS_PER_PAGE = 6;
const PROFIT_MARGIN = 0.3;
const PROJECTED_GROWTH_RATE = 1.05; // 5% projected growth rate

const EMPTY_FORM: FormData = {
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  color: "",
  engineSize: "",
  transmission: "Automatic",
  imageUrl: "",
  type: "Sedan",
  condition: "Used",
};

const EMPTY_PART_FORM: PartFormDataState = {
  name: "",
  partNumber: "",
  category: "Brakes",
  price: "",
  quantityInStock: "",
  compatibleModels: "",
  imageUrl: "",
};

export const useAdmin = () => {
  // =====================================================
  // TAB
  // =====================================================

  const [activeTab, setActiveTab] =
    useState<ActiveTab>("inventory");

  // =====================================================
  // CARS
  // =====================================================
const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCar, setSelectedCar] =
    useState<Car | null>(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isSearching, setIsSearching] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState("All");

  const [selectedCondition, setSelectedCondition] =
    useState("All");

  const [inventoryPage, setInventoryPage] =
    useState(1);

  const [financialPage, setFinancialPage] =
    useState(1);

  const [formData, setFormData] =
    useState<FormData>(EMPTY_FORM);

  // =====================================================
  // SPARE PARTS
  // =====================================================

  const [parts, setParts] =
    useState<SparePart[]>([]);

  const [partsLoading, setPartsLoading] =
    useState(false);

  const [partsQuery, setPartsQuery] =
    useState("");

  const [showAddPartModal, setShowAddPartModal] =
    useState(false);

  const [partFormData, setPartFormData] =
    useState<PartFormDataState>(EMPTY_PART_FORM);

  // =====================================================
  // SALES
  // =====================================================

  const [salesHistory, setSalesHistory] =
    useState<SaleRecord[]>([]);

  const [salesLoading, setSalesLoading] =
    useState(false);

  // =====================================================
  // USER ROLE
  // =====================================================

  const userRole =
    localStorage.getItem("userRole")?.toLowerCase() || "";

  const isDealer =
    userRole === "inventory" ||
    userRole === "inventorymanager" ||
    userRole === "admin";

  // =====================================================
  // FILTER CARS
  // =====================================================

  const filterCars = (carList: Car[]): Car[] => {
    return carList.filter((car) => {
      const matchesType =
        selectedType === "All" ||
        (car.type &&
          (
            car.type
              .trim()
              .toLowerCase()
              .includes(selectedType.trim().toLowerCase()) ||

            selectedType
              .trim()
              .toLowerCase()
              .includes(car.type.trim().toLowerCase())
          ));

      const matchesCondition =
        selectedCondition === "All" ||
        (
          car.condition &&
          car.condition
            .trim()
            .toLowerCase() ===
            selectedCondition
              .trim()
              .toLowerCase()
        );

      return matchesType && matchesCondition;
    });
  };

  const filteredCars = filterCars(cars);

  // =====================================================
  // FETCH CARS
  // =====================================================

  const fetchCars = async (
    query: string = searchQuery,
    typeTerm: string = selectedType,
    conditionTerm: string = selectedCondition
  ): Promise<void> => {
    setLoading(true);
    setIsSearching(true);

    try {
      const data = await getCars(
        query,
        typeTerm,
        conditionTerm
      );

      setCars(data);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setCars([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };


  const filteredSalesHistory = useMemo(() => {
  return salesHistory.filter((sale: any) => {
    const saleDateStr = sale.saleDate || sale.createdDate || sale.date;
    if (!saleDateStr) return true;

    const saleDate = new Date(saleDateStr);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (saleDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (saleDate > end) return false;
    }

    return true;
  });
}, [salesHistory, startDate, endDate]);

const handleResetDateFilter = () => {
  setStartDate("");
  setEndDate("");
};
  // =====================================================
  // FETCH SPARE PARTS
  // =====================================================

  const fetchParts = async (
    query = ""
  ): Promise<void> => {
    setPartsLoading(true);

    try {
      const data = await getSpareParts(query);

      setParts(data);
    } catch (err) {
      console.error("Error fetching parts:", err);
      setParts([]);
    } finally {
      setPartsLoading(false);
    }
  };

  // =====================================================
  // FETCH SALES HISTORY
  // =====================================================

  const fetchSalesHistory = async (): Promise<void> => {
    setSalesLoading(true);

    try {
      const data = await getSalesHistory();

      setSalesHistory(data);
    } catch (err) {
      console.error(
        "Error fetching sales history:",
        err
      );

      setSalesHistory([]);
    } finally {
      setSalesLoading(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchCars();
    fetchParts();
    fetchSalesHistory();
  }, []);

  // =====================================================
  // FETCH PARTS WHEN TAB / SEARCH CHANGES
  // =====================================================

  useEffect(() => {
    if (activeTab === "parts") {
      fetchParts(partsQuery);
    }
  }, [activeTab, partsQuery]);

  // =====================================================
  // FETCH SALES WHEN TAB OPENS
  // =====================================================

  useEffect(() => {
    if (activeTab === "salesHistory") {
      fetchSalesHistory();
    }
  }, [activeTab]);

  // =====================================================
  // ESTIMATED PROFIT CALCULATIONS
  // =====================================================

  const currentMonthSales = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return salesHistory.filter((sale: any) => {
      const saleDateStr = sale.saleDate || sale.createdDate || sale.date;
      if (!saleDateStr) return false;
      const date = new Date(saleDateStr);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [salesHistory]);

  const currentMonthRevenue = useMemo(() => {
    return currentMonthSales.reduce((sum, sale: any) => {
      const amount = sale.totalAmount ?? sale.salePrice ?? 0;
      return sum + (parseFloat(String(amount)) || 0);
    }, 0);
  }, [currentMonthSales]);

  const estimatedNextMonthRevenue = useMemo(() => {
    return currentMonthRevenue * PROJECTED_GROWTH_RATE;
  }, [currentMonthRevenue]);

  const estimatedNextMonthProfit = useMemo(() => {
    return estimatedNextMonthRevenue * PROFIT_MARGIN;
  }, [estimatedNextMonthRevenue]);

  // =====================================================
  // FILTER HANDLERS
  // =====================================================

  const handleTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newType = e.target.value;

    setSelectedType(newType);
    setInventoryPage(1);
    setFinancialPage(1);

    fetchCars(
      searchQuery,
      newType,
      selectedCondition
    );
  };

  const handleConditionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newCondition = e.target.value;

    setSelectedCondition(newCondition);
    setInventoryPage(1);
    setFinancialPage(1);

    fetchCars(
      searchQuery,
      selectedType,
      newCondition
    );
  };

  const handleSearchSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();

    setInventoryPage(1);
    setFinancialPage(1);

    fetchCars(
      searchQuery,
      selectedType,
      selectedCondition
    );
  };

  const handleResetFilters = (): void => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedCondition("All");

    setInventoryPage(1);
    setFinancialPage(1);

    fetchCars("", "All", "All");
  };

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handlePartImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPartFormData((prev) => ({
        ...prev,
        imageUrl: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // ADD CAR
  // =====================================================

  const handleAddCar = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      await addCar(formData);

      alert(
        "Vehicle added to inventory successfully!"
      );

      setShowAddModal(false);
      setFormData(EMPTY_FORM);

      fetchCars(
        searchQuery,
        selectedType,
        selectedCondition
      );
    } catch (err) {
      console.error(
        "Error adding car:",
        err
      );

      alert("Failed to add vehicle.");
    }
  };

  // =====================================================
  // ADD SPARE PART
  // =====================================================

  const handleAddPart = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      await addSparePart(partFormData);

      alert(
        "Spare part added to inventory successfully!"
      );

      setShowAddPartModal(false);
      setPartFormData(EMPTY_PART_FORM);

      fetchParts(partsQuery);
    } catch (err) {
      console.error(
        "Error adding spare part:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Network error: Unable to reach the server."
      );
    }
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalInventoryPages =
    Math.ceil(
      filteredCars.length / ITEMS_PER_PAGE
    ) || 1;

  const paginatedInventoryCars =
    filteredCars.slice(
      (inventoryPage - 1) * ITEMS_PER_PAGE,
      inventoryPage * ITEMS_PER_PAGE
    );

  const totalFinancialPages =
    Math.ceil(
      filteredCars.length / ITEMS_PER_PAGE
    ) || 1;

  const paginatedFinancialCars =
    filteredCars.slice(
      (financialPage - 1) * ITEMS_PER_PAGE,
      financialPage * ITEMS_PER_PAGE
    );

  // =====================================================
  // FINANCIAL CALCULATIONS
  // =====================================================

  const availableCars =
    cars.filter((car) => !car.isSold);

  const totalActiveInventoryCost =
    availableCars.reduce(
      (sum, car) =>
        sum +
        (parseFloat(String(car.price)) || 0),
      0
    );

  const soldCars =
    cars.filter((car) => car.isSold);

  const totalCarsSoldCost =
    soldCars.reduce(
      (sum, car) =>
        sum +
        (parseFloat(String(car.price)) || 0),
      0
    );

  const totalProfitEarned =
    totalCarsSoldCost * PROFIT_MARGIN;

  // =====================================================
  // SPARE PART METRICS
  // =====================================================

  const totalPartsValue = useMemo(() => {
    return parts.reduce(
      (sum, part) =>
        sum +
        (parseFloat(String(part.price)) || 0) *
          (Number(part.quantityInStock) || 0),
      0
    );
  }, [parts]);

  const totalUnitsStocked = useMemo(() => {
    return parts.reduce(
      (sum, part) =>
        sum +
        (Number(part.quantityInStock) || 0),
      0
    );
  }, [parts]);

  const totalSoldPartsRevenue = useMemo(() => {
    return parts.reduce(
      (sum, part) =>
        sum +
        (parseFloat(String(part.price)) || 0) *
          (Number(part.soldQuantity) || 0),
      0
    );
  }, [parts]);

  const totalCategoriesCount = useMemo(() => {
    const categories = new Set(
      parts.map((part) => part.category)
    );

    return categories.size;
  }, [parts]);

  const lowStockParts = parts.filter(
    (part) => part.quantityInStock <= 10
  );

  // =====================================================
  // RETURN EVERYTHING
  // =====================================================

  return {
    startDate,
  setStartDate,
  endDate,
  setEndDate,
  filteredSalesHistory,
  handleResetDateFilter,
    // Tab
    activeTab,
    setActiveTab,

    // User
    userRole,
    isDealer,

    // Cars
    cars,
    loading,
    selectedCar,
    setSelectedCar,

    // Search / filters
    searchQuery,
    setSearchQuery,
    isSearching,
    selectedType,
    selectedCondition,
    handleTypeChange,
    handleConditionChange,
    handleSearchSubmit,
    handleResetFilters,

    // Car modal
    showAddModal,
    setShowAddModal,
    formData,
    setFormData,
    handleImageUpload,
    handleAddCar,

    // Inventory pagination
    inventoryPage,
    setInventoryPage,
    totalInventoryPages,
    paginatedInventoryCars,

    // Financial pagination
    financialPage,
    setFinancialPage,
    totalFinancialPages,
    paginatedFinancialCars,

    // Parts
    parts,
    partsLoading,
    partsQuery,
    setPartsQuery,
    showAddPartModal,
    setShowAddPartModal,
    partFormData,
    setPartFormData,
    handlePartImageUpload,
    handleAddPart,

    // Parts metrics
    totalPartsValue,
    totalUnitsStocked,
    totalSoldPartsRevenue,
    totalCategoriesCount,
    lowStockParts,

    // Sales
    salesHistory,
    salesLoading,
    fetchSalesHistory,

    // Financial
    availableCars,
    soldCars,
    totalActiveInventoryCost,
    totalCarsSoldCost,
    totalProfitEarned,

    // Estimated Profit Metrics
    currentMonthRevenue,
    estimatedNextMonthRevenue,
    estimatedNextMonthProfit,
  };
};