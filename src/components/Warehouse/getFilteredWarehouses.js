const getFilteredWarehouses = (warehouses, searchTerm, filters) => {
  return warehouses.filter((warehouse) => {
    // Calculate utilization rate for filtering
    const utilizationRate =
      warehouse.capacity > 0
        ? (warehouse.currentStock / warehouse.capacity) * 100
        : 0;

    // Search match (check warehouse name and location)
    const searchMatch =
      searchTerm === "" ||
      warehouse.warehouseName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase());

    // Utilization rate filter (low, medium, high)
    const utilizationMatch =
      !filters.utilizationRate ||
      (filters.utilizationRate === "low" && utilizationRate <= 30) ||
      (filters.utilizationRate === "medium" &&
        utilizationRate > 30 &&
        utilizationRate <= 70) ||
      (filters.utilizationRate === "high" && utilizationRate > 70);

    // Capacity filters for > 10,000 and < 10,000
    const capacityGreaterThan10000Match =
      !filters.capacityGreaterThan10000 ||
      (filters.capacityGreaterThan10000 && warehouse.capacity > 10000);

    const capacityLessThan10000Match =
      !filters.capacityLessThan10000 ||
      (filters.capacityLessThan10000 && warehouse.capacity < 10000);

    return (
      searchMatch &&
      utilizationMatch &&
      capacityGreaterThan10000Match &&
      capacityLessThan10000Match
    );
  });
};

export default getFilteredWarehouses;
