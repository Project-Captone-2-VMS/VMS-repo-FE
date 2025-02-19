import React, { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Edit2, Filter, Plus, Trash2, Info } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { toast, Toaster } from "react-hot-toast";
import AddIncidentModal from "../../../components/Modals/AddIncidentModal";
import EditIncidentModal from "../../../components/Modals/EditIncidentModal";
import FilterPanel from "../../../components/Vehicle/FilterIncident";
import { getAllIncidents, deleteIncident } from "../../../services/apiRequest";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const safeFormatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = parseISO(dateString);
  return isValid(date) ? format(date, "PPp") : "Invalid Date";
};

export default function IncidentTab() {
  const [incidents, setIncidents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoType, setInfoType] = useState("");

  const fetchIncidents = async () => {
    try {
      const data = await getAllIncidents();
      console.log("Incidents:", data);
      if (Array.isArray(data)) {
        setIncidents(data);
      } else {
        console.error("Unexpected data format:", data);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Received unexpected data format from server",
        });
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch incidents",
      });
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDelete = async (incident) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this incident?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmResult.isConfirmed) {
      try {
        await deleteIncident(incident.incidentId);
        await fetchIncidents();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The incident has been deleted.",
        });
      } catch (error) {
        console.error("Error deleting incident:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message || "Failed to delete the incident",
        });
      }
    }
  };

  const handleEdit = (incident) => {
    if (!incident?.id) {
      console.error("Invalid incident data:", incident);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid incident data",
      });
      return;
    }
    setCurrentIncident(incident);
    setShowEditModal(true);
  };

  const handleInfoClick = (type, incident) => {
    setCurrentIncident(incident);
    setInfoType(type);
    setShowInfoDialog(true);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incident Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Incident
          </Button>
        </div>
      </div>

      {showFilters && <FilterPanel onApplyFilters={fetchIncidents} />}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(incidents) &&
              incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>{safeFormatDate(incident.occurredAt)}</TableCell>
                  <TableCell>
                    {incident.driver
                      ? `${incident.driver.firstName} ${incident.driver.lastName}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {incident.vehicle ? incident.vehicle.licensePlate : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInfoClick("driver", incident)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInfoClick("vehicle", incident)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(incident)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(incident)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <AddIncidentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onIncidentAdded={fetchIncidents}
      />

      <EditIncidentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        incident={currentIncident}
        onIncidentUpdated={fetchIncidents}
      />

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle>
              {infoType === "driver"
                ? "Driver Information"
                : "Vehicle Information"}
            </DialogTitle>
          </DialogHeader>
          {infoType === "driver" && currentIncident?.driver && (
            <div>
              <p>
                Name: {currentIncident.driver.firstName}{" "}
                {currentIncident.driver.lastName}
              </p>
              <p>Email: {currentIncident.driver.email}</p>
              <p>Phone: {currentIncident.driver.phoneNumber}</p>
              <p>License: {currentIncident.driver.licenseNumber}</p>
              <p>Status: {currentIncident.driver.status}</p>
            </div>
          )}
          {infoType === "vehicle" && currentIncident?.vehicle && (
            <div>
              <p>Type: {currentIncident.vehicle.type}</p>
              <p>License Plate: {currentIncident.vehicle.licensePlate}</p>
              <p>Capacity: {currentIncident.vehicle.capacity}</p>
              <p>Status: {currentIncident.vehicle.status}</p>
              <p>
                Maintenance Schedule:{" "}
                {currentIncident.vehicle.maintenanceSchedule}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
