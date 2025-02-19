export const trucks = [
    {
      id: 1,
      name: "Truck A",
      driver: "Trung Nguyen",
      phone: "0901234567",
      status: "delivering",
      location: { lat: 10.762622, lng: 106.660172 },
      route: "Da Nang-Quang Nam",
      currentStop: "Mieu Bong",
      alert: "Running 15 minutes behind schedule",
      lastUpdate: "10:30 AM",
      estimatedArrival: "12:30 PM",
      delayStatus: "delayed",
      delayDuration: 15,
      stops: [
        {
          location: "A Warehouse",
          plannedTime: "08:00 AM",
          actualTime: "08:00 AM",
          status: "completed",
          delay: 0
        },
        {
          location: "Mieu Bong",
          plannedTime: "09:30 AM",
          actualTime: "09:45 AM",
          status: "completed",
          delay: 15
        },
        {
          location: "Quang Nam",
          plannedTime: "10:30 AM",
          actualTime: null,
          status: "current",
          delay: null
        }
      ]
    },
    {
      id: 2,
      name: "Van A",
      driver: "Vu Tran",
      phone: "0909876543",
      status: "delivering",
      location: { lat: 10.762622, lng: 106.660172 },
      route: "Da Nang - Hue",
      currentStop: "Hue",
      alert: null,
      lastUpdate: "10:45 AM",
      estimatedArrival: "11:30 AM",
      delayStatus: "ontime",
      delayDuration: 0,
      stops: [
        {
          location: "A Warehouse",
          plannedTime: "09:00 AM",
          actualTime: "09:00 AM",
          status: "completed",
          delay: 0
        },
        {
          location: "Hue",
          plannedTime: "10:30 AM",
          actualTime: null,
          status: "current",
          delay: null
        }
      ]
    },
    {
      id: 3,
      name: "Pickup A",
      driver: "Lanh Le",
      phone: "0907654321",
      status: "delivering",
      location: { lat: 10.762622, lng: 106.660172 },
      route: "Da Nang - Quang Ngai",
      currentStop: "Quang Ngai",
      alert: "Running 10 minutes behind schedule",
      lastUpdate: "11:00 AM",
      estimatedArrival: "13:40 PM",
      delayStatus: "delayed",
      delayDuration: 10,
      stops: [
        {
          location: "A Warehouse",
          plannedTime: "10:00 AM",
          actualTime: "10:00 AM",
          status: "completed",
          delay: 0
        },
        {
          location: "Quang Ngai",
          plannedTime: "11:30 AM",
          actualTime: null,
          status: "current",
          delay: 10
        }
      ]
    }
  ];