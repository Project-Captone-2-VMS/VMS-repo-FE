import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { getAllInvoices, createInvoice, deleteInvoice } from "../../services/apiRequest";
import Swal from "sweetalert2";


const InvoicePage = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    productName: "",
    price: "",
    quantity: "",
  });

  useEffect(() => {
    fetchInvoices();
  }, [warehouseId]);

  const fetchInvoices = async () => {
    try {
      const data = await getAllInvoices(warehouseId);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch invoices.",
      });
    }
  };

  const handleAddInvoice = async () => {
    try {
      await createInvoice(warehouseId, newInvoice);
      setIsAddInvoiceOpen(false);
      setNewInvoice({ productName: "", price: "", quantity: "" });
      fetchInvoices();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Invoice added successfully.",
      });
    } catch (error) {
      console.error("Error adding invoice:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add invoice.",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmResult.isConfirmed) {
      try {
        await deleteInvoice(invoiceId);
        fetchInvoices();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Invoice deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting invoice:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the invoice.",
        });
      }
    }
  };

  const handleExportInvoice = (invoice) => {
    const invoiceData = `
      Product Name: ${invoice.productName}
      Warehouse Name: ${invoice.warehouseName}
      Location: ${invoice.location}
      Price: $${invoice.price.toFixed(2)}
      Quantity: ${invoice.quantity}
      Total: $${(invoice.price * invoice.quantity).toFixed(2)}
    `;

    const blob = new Blob([invoiceData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${invoice.invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 hover:bg-gray-100 transition-colors duration-200"
        onClick={() => navigate(`/warehouse/${warehouseId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Warehouse Products
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <CardTitle>Invoices</CardTitle>
            </div>
            <Button
              onClick={() => setIsAddInvoiceOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell>{invoice.productName}</TableCell>
                  <TableCell>${invoice.price.toFixed(2)}</TableCell>
                  <TableCell>{invoice.quantity}</TableCell>
                  <TableCell>${(invoice.price * invoice.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                      className="h-8 w-8 p-0 mr-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleExportInvoice(invoice)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">
                Product Name
              </Label>
              <Input
                id="productName"
                value={newInvoice.productName}
                onChange={(e) => setNewInvoice({ ...newInvoice, productName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={newInvoice.price}
                onChange={(e) => setNewInvoice({ ...newInvoice, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newInvoice.quantity}
                onChange={(e) => setNewInvoice({ ...newInvoice, quantity: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddInvoice}>Add Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicePage;