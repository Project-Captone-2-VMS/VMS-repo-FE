import { useMemo } from "react";

const useVehicleSearchFilter = (vehicles, searchTerm, statusFilter) => {
  return useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearchTerm = vehicle.type
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter
        ? statusFilter === "active"
          ? !vehicle.status
          : vehicle.status
        : true;

      return matchesSearchTerm && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);
};

export default useVehicleSearchFilter;
