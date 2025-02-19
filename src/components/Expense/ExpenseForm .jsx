import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import toast from 'react-hot-toast';

const ExpenseForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: '',
        category: '',
        vehicle: '',
        driver: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description || '',
                amount: initialData.amount?.toString() || '',
                date: initialData.date || '',
                category: initialData.category || '',
                vehicle: initialData.vehicle?.vehicleId?.toString() || '',
                driver: initialData.driver?.driverId?.toString() || ''
            });
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be a positive number';
        }
        
        if (!formData.date) {
            newErrors.date = 'Date is required';
        }
        
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }
        
        if (!formData.vehicle) {
            newErrors.vehicle = 'Vehicle ID is required';
        }
        
        if (!formData.driver) {
            newErrors.driver = 'Driver ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!validateForm()) {
                toast.error('Please fill in all required fields correctly');
                return;
            }

            const expenseData = {
                description: formData.description.trim(),
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
                vehicle: formData.vehicle ? {
                    vehicleId: parseInt(formData.vehicle)
                } : null,
                driver: formData.driver ? {
                    driverId: parseInt(formData.driver)
                } : null
            };

            console.log('Submitting expense data:', expenseData);
            await onSubmit(expenseData);
            
            // Clear form after successful submission
            if (!initialData) {
                setFormData({
                    description: '',
                    amount: '',
                    date: '',
                    category: '',
                    vehicle: '',
                    driver: ''
                });
                setErrors({});
            }
        } catch (error) {
            console.error('Error submitting expense:', error);
            toast.error(error.message || 'Failed to submit expense');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when field is changed
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Price *</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                    <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FUEL">Fuel</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="SALARY">Salary</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-red-500 text-sm">{errors.category}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle ID *</Label>
                <Input
                    id="vehicleId"
                    value={formData.vehicle}
                    onChange={(e) => handleChange('vehicle', e.target.value)}
                    className={errors.vehicle ? 'border-red-500' : ''}
                />
                {errors.vehicle && (
                    <p className="text-red-500 text-sm">{errors.vehicle}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="driverId">Driver ID *</Label>
                <Input
                    id="driverId"
                    value={formData.driver}
                    onChange={(e) => handleChange('driver', e.target.value)}
                    className={errors.driver ? 'border-red-500' : ''}
                />
                {errors.driver && (
                    <p className="text-red-500 text-sm">{errors.driver}</p>
                )}
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="submit">
                    {initialData ? 'Update Expense' : 'Add Expense'}
                </Button>
            </div>
        </form>
    );
};

export default ExpenseForm;
