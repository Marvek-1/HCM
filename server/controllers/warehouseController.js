const { Warehouse } = require('../models');

// Get all warehouses with inventory summary
exports.getAll = async (req, res) => {
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
      message: 'An error occurred while fetching warehouses.'
    });
  }
};

// Get warehouse by ID with detailed inventory
exports.getById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    // Get warehouse stock
    const stock = await Warehouse.getStock(req.params.id);

    res.json({
      success: true,
      data: {
        warehouse,
        stock
      }
    });
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching warehouse details.'
    });
  }
};

// Create new warehouse (Super Admin only)
exports.create = async (req, res) => {
  const { name, location, code, capacity, contactName, contactPhone, contactEmail } = req.body;

  try {
    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse name and code are required.'
      });
    }

    // Check if code already exists
    const existing = await Warehouse.findByCode(code);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse code already exists.'
      });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      code: code.toUpperCase(),
      capacity: capacity ? parseInt(capacity) : null,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail
    });

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully.',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating warehouse.'
    });
  }
};

// Update warehouse (Super Admin only)
exports.update = async (req, res) => {
  const { name, location, code, capacity, contactName, contactPhone, contactEmail, isActive } = req.body;

  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    // If updating code, check it's not already in use by another warehouse
    if (code && code !== warehouse.code) {
      const existing = await Warehouse.findByCode(code);
      if (existing && existing.id !== parseInt(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse code already in use.'
        });
      }
    }

    const updatedWarehouse = await Warehouse.update(req.params.id, {
      name,
      location,
      code: code ? code.toUpperCase() : undefined,
      capacity: capacity ? parseInt(capacity) : null,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      is_active: isActive !== undefined ? isActive : undefined
    });

    res.json({
      success: true,
      message: 'Warehouse updated successfully.',
      data: { warehouse: updatedWarehouse }
    });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating warehouse.'
    });
  }
};

// Toggle warehouse active status (Super Admin only)
exports.toggleStatus = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    const updatedWarehouse = await Warehouse.update(req.params.id, {
      is_active: !warehouse.is_active
    });

    res.json({
      success: true,
      message: `Warehouse ${updatedWarehouse.is_active ? 'activated' : 'deactivated'} successfully.`,
      data: { warehouse: updatedWarehouse }
    });
  } catch (error) {
    console.error('Toggle warehouse status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating warehouse status.'
    });
  }
};

// Get warehouse inventory/stock
exports.getStock = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    const stock = await Warehouse.getStock(req.params.id);

    res.json({
      success: true,
      data: { stock }
    });
  } catch (error) {
    console.error('Get warehouse stock error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching warehouse stock.'
    });
  }
};

// Update stock for a specific commodity in warehouse (Super Admin only)
exports.updateStock = async (req, res) => {
  const { commodityId, quantity } = req.body;

  try {
    if (!commodityId || quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Commodity ID and valid quantity are required.'
      });
    }

    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    await Warehouse.updateStock(
      req.params.id,
      parseInt(commodityId),
      parseInt(quantity),
      req.user.id
    );

    res.json({
      success: true,
      message: 'Warehouse stock updated successfully.'
    });
  } catch (error) {
    console.error('Update warehouse stock error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating stock.'
    });
  }
};

module.exports = exports;
