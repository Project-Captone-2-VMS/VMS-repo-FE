import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button"; 
import { Package, Edit, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import Pagination from '../Pagination';

export const ProductTable = ({ products, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and pagination logic
  const filteredProducts = useMemo(() => {
    return products || [];
  }, [products]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Validate products prop
  if (!Array.isArray(products)) {
    console.error('Products must be an array');
    return null;
  }

  const handleEdit = (product) => {
    const validProduct = {
      productId: product.id || product.productId,
      productName: product.productName,
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
      quantity: typeof product.quantity === 'number' ? product.quantity : parseInt(product.quantity) || 0,
      warehouse:{
        warehouseId: product.warehouse?.warehouseId 
      }
    };

    if (!validProduct.productId) {
      console.error('Product ID is missing:', product);
      return;
    }

    console.log('Editing product:', validProduct);
    onEdit(validProduct);
  };

  const handleDelete = (product) => {
    const id = product.id || product.productId;
    if (id) {
      onDelete(id);
    } else {
      console.error('No valid product ID found for deletion');
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Warehouse Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentProducts.map((product) => (
            <TableRow key={product.id || product.productId}>
              <TableCell>
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">{product.productName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                ${(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}
              </TableCell>
              <TableCell>
                {typeof product.quantity === 'number' ? product.quantity : parseInt(product.quantity) || 0}
              </TableCell>
              <TableCell>
                {product.warehouse?.warehouseName || 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductTable;
