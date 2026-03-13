const { Commodity, Warehouse } = require('../models');

// Get all commodities with pagination and search
exports.getAll = async (req, res) => {
  try {
    const { search, category, page, limit, simple } = req.query;
    
    // If simple=true, return all without pagination (for dropdowns)
    if (simple === 'true') {
      const commodities = await Commodity.findAllSimple();
      return res.json({
        success: true,
        data: { commodities }
      });
    }
    
    const result = await Commodity.findAll({
      search,
      category,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get commodities error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching commodities.'
    });
  }
};

// Get commodity by ID
exports.getById = async (req, res) => {
  try {
    const commodity = await Commodity.findById(req.params.id);

    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Commodity not found.'
      });
    }

    res.json({
      success: true,
      data: { commodity }
    });
  } catch (error) {
    console.error('Get commodity error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Create new commodity (OSL only)
exports.create = async (req, res) => {
  const { name, category, unit, price, stock, description, storageRequirements, shelfLife } = req.body;

  try {
    // Validate required fields
    if (!name || !category || !unit || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, unit, and price are required.'
      });
    }

    const commodity = await Commodity.create({
      name,
      category,
      unit,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description,
      storageRequirements,
      shelfLife
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Commodity created successfully.',
      data: { commodity }
    });
  } catch (error) {
    console.error('Create commodity error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating commodity.'
    });
  }
};

// Update commodity (OSL only)
exports.update = async (req, res) => {
  const { name, category, unit, price, description, storageRequirements, shelfLife } = req.body;

  try {
    const commodity = await Commodity.findById(req.params.id);
    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Commodity not found.'
      });
    }

    const updatedCommodity = await Commodity.update(req.params.id, {
      name,
      category,
      unit,
      price: price !== undefined ? parseFloat(price) : undefined,
      description,
      storageRequirements,
      shelfLife
    }, req.user.id);

    res.json({
      success: true,
      message: 'Commodity updated successfully.',
      data: { commodity: updatedCommodity }
    });
  } catch (error) {
    console.error('Update commodity error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating commodity.'
    });
  }
};

// Update stock only (OSL only) - backward compatibility
exports.updateStock = async (req, res) => {
  const { stock } = req.body;

  try {
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required.'
      });
    }

    const commodity = await Commodity.updateStock(req.params.id, parseInt(stock), req.user.id);
    
    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Commodity not found.'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully.',
      data: { commodity }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating stock.'
    });
  }
};

// Update warehouse stock (OSL only)
exports.updateWarehouseStock = async (req, res) => {
  const { warehouseId, quantity } = req.body;

  try {
    if (!warehouseId || quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID and valid quantity are required.'
      });
    }

    const commodity = await Commodity.updateWarehouseStock(
      req.params.id, 
      parseInt(warehouseId), 
      parseInt(quantity),
      req.user.id
    );
    
    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Commodity not found.'
      });
    }

    res.json({
      success: true,
      message: 'Warehouse stock updated successfully.',
      data: { commodity }
    });
  } catch (error) {
    console.error('Update warehouse stock error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating warehouse stock.'
    });
  }
};

// Get low stock commodities
exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 100;
    const commodities = await Commodity.getLowStock(threshold);

    res.json({
      success: true,
      data: { 
        commodities,
        threshold
      }
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Commodity.getCategories();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Create category (OSL only)
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const category = await Commodity.createCategory({ name, description }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating category.'
    });
  }
};

// Update category (OSL only)
exports.updateCategory = async (req, res) => {
  const { name, description, isActive } = req.body;

  try {
    const category = await Commodity.updateCategory(req.params.id, { name, description, isActive });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating category.'
    });
  }
};

// Delete category (OSL only) - soft delete
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Commodity.deleteCategory(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting category.'
    });
  }
};

// Get all warehouses
exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll();

    res.json({
      success: true,
      data: { warehouses }
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Delete commodity (OSL only)
exports.delete = async (req, res) => {
  try {
    const commodity = await Commodity.delete(req.params.id);
    
    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Commodity not found.'
      });
    }

    res.json({
      success: true,
      message: 'Commodity deleted successfully.'
    });
  } catch (error) {
    console.error('Delete commodity error:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Cannot delete commodity. It is used in existing orders.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting commodity.'
    });
  }
};
