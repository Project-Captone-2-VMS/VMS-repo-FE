import React from 'react';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
    return (
        <div className="max-w-3xl mx-auto mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Expense List</h2>
            <table className="w-full mt-4 table-auto border-collapse">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border text-left">Description</th>
                        <th className="px-4 py-2 border text-left">Price</th>
                        <th className="px-4 py-2 border text-left">Date</th>
                        <th className="px-4 py-2 border text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(expenses) && expenses.length > 0 ? (
                        expenses.map(expense => (
                            <tr key={expense.expenseId} className="border-b">
                                <td className="px-4 py-2">{expense.description}</td>
                                <td className="px-4 py-2">{expense.amount}</td>
                                <td className="px-4 py-2">{expense.date}</td>
                                <td className="px-4 py-2">
                                    <button onClick={() => onDelete(expense.expenseId)} className="bg-red-500 text-white px-4 py-2 rounded-md">Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-4 py-2 text-center">No expenses available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ExpenseList;
