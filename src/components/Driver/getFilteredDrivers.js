const getFilteredDrivers = (drivers, searchTerm, filters) => {
  return drivers.filter((driver) => {
    // Search match (by first name, last name, or license number)
    const searchMatch =
      searchTerm === "" ||
      (driver.firstName &&
        driver.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver.lastName &&
        driver.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver.licenseNumber &&
        driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const statusMatch =
      !filters.status ||
      (filters.status === "Active(Available)" &&
        driver.status === "Active(Available)") ||
      (filters.status === "Busy(On Delivery)" &&
        driver.status === "Busy(On Delivery)");

    // Work Schedule filter
    const workScheduleMatch =
      !filters.workSchedule ||
      (driver.workSchedule &&
        driver.workSchedule.toLowerCase() ===
          filters.workSchedule.toLowerCase());
    return searchMatch && statusMatch && workScheduleMatch;
  });
};

export default getFilteredDrivers;
