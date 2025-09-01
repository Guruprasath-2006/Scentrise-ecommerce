import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { emailService } from '../services/emailService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface ProductType {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  category: string;
  brand: string;
  price: number;
  isActive: boolean;
}

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const lowStockThreshold = parseInt(req.query.threshold as string) || 10;
    
    // Get all products with inventory information
    const products = await Product.find({}, {
      title: 1,
      sku: 1,
      stock: 1,
      category: 1,
      brand: 1,
      price: 1,
      isActive: 1
    }).sort({ stock: 1 });

    // Categorize products by stock levels
    const lowStock = products.filter((p: any) => p.stock <= lowStockThreshold && p.stock > 0);
    const outOfStock = products.filter((p: any) => p.stock === 0);
    const inStock = products.filter((p: any) => p.stock > lowStockThreshold);

    const report = {
      summary: {
        totalProducts: products.length,
        inStock: inStock.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        totalValue: products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0)
      },
      products: {
        lowStock,
        outOfStock,
        inStock: inStock.slice(0, 20) // Limit for performance
      },
      lastUpdated: new Date()
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ message: 'Error generating inventory report' });
  }
};

export const updateStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity, operation, reason } = req.body;

    // Validate operation
    if (!['add', 'subtract', 'set'].includes(operation)) {
      return res.status(400).json({ message: 'Invalid operation. Use add, subtract, or set.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const oldStock = product.stock;
    let newStock: number;

    switch (operation) {
      case 'add':
        newStock = oldStock + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, oldStock - quantity);
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
      default:
        newStock = oldStock;
    }

    product.stock = newStock;
    await product.save();

    // Log the inventory change
    const inventoryLog = {
      productId: product._id,
      productName: product.title,
      oldStock,
      newStock,
      operation,
      quantity,
      reason,
      changedBy: req.user?.id,
      changedAt: new Date()
    };

    // You could save this to a separate InventoryLog collection if needed
    console.log('Inventory change:', inventoryLog);

    // Send low stock alert if applicable
    if (newStock <= 5 && newStock > 0) {
      await emailService.sendLowStockAlert(product, newStock);
    }

    res.json({
      message: 'Stock updated successfully',
      product: {
        id: product._id,
        name: product.title,
        oldStock,
        newStock,
        operation
      },
      log: inventoryLog
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
};

export const bulkUpdateStock = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates must be an array' });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, quantity, operation, reason } = update;
        
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }

        const oldStock = product.stock;
        let newStock: number;

        switch (operation) {
          case 'add':
            newStock = oldStock + quantity;
            break;
          case 'subtract':
            newStock = Math.max(0, oldStock - quantity);
            break;
          case 'set':
            newStock = Math.max(0, quantity);
            break;
          default:
            errors.push({ productId, error: 'Invalid operation' });
            continue;
        }

        product.stock = newStock;
        await product.save();

        results.push({
          productId,
          productName: product.title,
          oldStock,
          newStock,
          operation
        });

        // Send low stock alert if applicable
        if (newStock <= 5 && newStock > 0) {
          await emailService.sendLowStockAlert(product, newStock);
        }
      } catch (error) {
        errors.push({ productId: update.productId, error: 'Update failed' });
      }
    }

    res.json({
      message: 'Bulk update completed',
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk stock update:', error);
    res.status(500).json({ message: 'Error in bulk stock update' });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    
    const lowStockProducts = await Product.find({
      stock: { $lte: threshold, $gt: 0 },
      isActive: true
    }).select('title sku stock category brand price')
      .sort({ stock: 1 });

    res.json({
      threshold,
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Error fetching low stock products' });
  }
};

export const getOutOfStockProducts = async (req: Request, res: Response) => {
  try {
    const outOfStockProducts = await Product.find({
      stock: 0,
      isActive: true
    }).select('title sku category brand price')
      .sort({ title: 1 });

    res.json({
      count: outOfStockProducts.length,
      products: outOfStockProducts
    });
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    res.status(500).json({ message: 'Error fetching out of stock products' });
  }
};

export const getStockMovementHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;

    // This would typically come from a separate InventoryLog collection
    // For now, we'll return a placeholder response
    const movements = [
      {
        date: new Date(),
        operation: 'sale',
        quantity: -1,
        newStock: 45,
        reason: 'Order #12345',
        changedBy: 'system'
      }
    ];

    res.json({
      productId,
      movements,
      total: movements.length
    });
  } catch (error) {
    console.error('Error fetching stock movement history:', error);
    res.status(500).json({ message: 'Error fetching stock movement history' });
  }
};

export const generateRestockSuggestions = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    
    // Get products with low stock
    const lowStockProducts = await Product.find({
      stock: { $lte: 10 },
      isActive: true
    }).select('title sku stock category brand price');

    // Calculate suggested restock quantities based on sales velocity
    // This is a simplified version - in practice, you'd analyze order history
    const suggestions = lowStockProducts.map((product: any) => {
      const averageMonthlySales = 20; // This would be calculated from order history
      const leadTimeDays = 7;
      const safetyStock = 10;
      
      const suggestedQuantity = Math.ceil(
        (averageMonthlySales * (leadTimeDays / 30)) + safetyStock
      );

      return {
        productId: product._id,
        name: product.title,
        sku: product.sku,
        currentStock: product.stock,
        suggestedQuantity,
        priority: product.stock === 0 ? 'urgent' : product.stock <= 5 ? 'high' : 'medium',
        estimatedCost: product.price * suggestedQuantity * 0.6 // Assuming 60% cost ratio
      };
    });

    type Priority = 'urgent' | 'high' | 'medium';
    const priorityOrder: Record<Priority, number> = { urgent: 3, high: 2, medium: 1 };

    res.json({
      suggestionsCount: suggestions.length,
      totalEstimatedCost: suggestions.reduce((sum: number, s: any) => sum + s.estimatedCost, 0),
      suggestions: suggestions.sort((a: any, b: any) => {
        return priorityOrder[b.priority as Priority] - priorityOrder[a.priority as Priority];
      })
    });
  } catch (error) {
    console.error('Error generating restock suggestions:', error);
    res.status(500).json({ message: 'Error generating restock suggestions' });
  }
};
