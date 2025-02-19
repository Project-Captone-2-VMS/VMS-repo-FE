import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import AddExpense from "../components/Expense/AddExpense";
import ExpenseList from "../components/Expense/ExpenseList";
import { getAllExpenses, deleteExpense } from "../services/apiRequest";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = () => {
    fetchExpenses();
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsEditExpenseOpen(true);
  };

  const handleExpenseUpdated = () => {
    setIsEditExpenseOpen(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await deleteExpense(expenseId);
        toast.success("Expense deleted successfully");
        fetchExpenses();
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Expense Management</h1>
        <Button onClick={() => setIsAddExpenseOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Expense
        </Button>
      </div>

      <ExpenseList
        expenses={expenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      <AddExpense
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={handleAddExpense}
      />

      {editingExpense && (
        <EditExpense
          isOpen={isEditExpenseOpen}
          onClose={() => {
            setIsEditExpenseOpen(false);
            setEditingExpense(null);
          }}
          expense={editingExpense}
          onExpenseUpdated={handleExpenseUpdated}
        />
      )}
    </div>
  );
};

export default ExpenseManagement;
