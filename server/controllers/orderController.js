const { Order, Commodity, Warehouse, User } = require('../models');
const emailService = require('../services/emailService');

// Get orders based on user role
exports.getOrders = async (req, res) => {
  try {
    let orders;

    switch (req.user.role) {
      case 'Country Office':
        orders = await Order.findByCountry(req.user.country);
        break;
      case 'Laboratory Team':
        orders = await Order.findAllSubmitted();
        break;
      case 'OSL Team':
        orders = await Order.findForwardedToOSL();
        break;
      case 'Super Admin':
        // Super Admin can view all orders from all countries
        orders = await Order.findAll();
        break;
      default:
        orders = [];
    }

    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching orders.' });
  }
};

// Get single order by ID
exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check access based on role
    if (req.user.role === 'Country Office' && order.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Create new order (Country Office only) - with intervention type and shipping details
exports.create = async (req, res) => {
  const { 
    priority, pateoRef, pateoFile, notes, items, 
    interventionType, situationStartDate, isOutbreak,
    deliveryContactName, deliveryContactPhone, deliveryContactEmail,
    deliveryAddress, deliveryCity, deliveryCountry, preferredShippingMethod,
    targetCountry // Lab team can specify target country
  } = req.body;

  try {
    if (!interventionType) {
      return res.status(400).json({ success: false, message: 'Intervention type is required.' });
    }

    if (!pateoRef) {
      return res.status(400).json({ success: false, message: 'PATEO reference is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required.' });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority level.' });
    }

    // Determine the order country
    // Lab team can create orders for any country
    let orderCountry = req.user.country;
    if (req.user.role === 'Laboratory Team' && targetCountry) {
      orderCountry = targetCountry;
    }

    if (!orderCountry) {
      return res.status(400).json({ success: false, message: 'Target country is required.' });
    }

    // Validate situation start date is not in the future
    if (situationStartDate && new Date(situationStartDate) > new Date()) {
      return res.status(400).json({ success: false, message: 'Situation start date cannot be in the future.' });
    }

    // Validate and get commodity prices
    const orderItems = [];
    for (const item of items) {
      const commodity = await Commodity.findById(item.commodityId);
      if (!commodity) {
        return res.status(400).json({ success: false, message: `Commodity with ID ${item.commodityId} not found.` });
      }
      orderItems.push({
        commodityId: item.commodityId,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(commodity.price)
      });
    }

    const order = await Order.create({
      country: orderCountry,
      priority,
      pateoRef,
      pateoFile,
      notes,
      createdBy: req.user.id,
      createdByName: req.user.name,
      items: orderItems,
      interventionType,
      situationDate: situationStartDate || null,
      // Shipping details from country
      deliveryContactName,
      deliveryContactPhone,
      deliveryContactEmail,
      deliveryAddress,
      deliveryCity,
      deliveryCountry: deliveryCountry || orderCountry,
      preferredShippingMethod
    });

    res.status(201).json({ success: true, message: 'Order created successfully.', data: { order } });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while creating order.' });
  }
};

// Update order item with modification tracking
exports.updateItem = async (req, res) => {
  const { quantity, notes, reason } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Lab can edit submitted orders, OSL can edit forwarded orders
    if (req.user.role === 'Laboratory Team' && order.status !== 'Submitted') {
      return res.status(400).json({ success: false, message: 'Lab can only edit submitted orders.' });
    }

    if (req.user.role === 'OSL Team' && !['Forwarded to OSL', 'Partially Fulfilled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'OSL can only edit forwarded or partially fulfilled orders.' });
    }

    const updatedItem = await Order.updateItem(
      req.params.itemId, 
      { quantity, notes: reason || notes },
      req.user.id,
      req.user.role,
      req.user.name
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const updatedOrder = await Order.findById(req.params.orderId);

    res.json({ success: true, message: 'Item updated successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Add item to order (Lab Team only)
exports.addItem = async (req, res) => {
  const { commodityId, quantity } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'Submitted') {
      return res.status(400).json({ success: false, message: 'Can only add items to submitted orders.' });
    }

    const commodity = await Commodity.findById(commodityId);
    if (!commodity) {
      return res.status(404).json({ success: false, message: 'Commodity not found.' });
    }

    await Order.addItem(req.params.orderId, {
      commodityId,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(commodity.price)
    }, req.user.id, req.user.role, req.user.name);

    const updatedOrder = await Order.findById(req.params.orderId);

    res.json({ success: true, message: 'Item added successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Remove item from order (Lab Team only)
exports.removeItem = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'Submitted') {
      return res.status(400).json({ success: false, message: 'Can only remove items from submitted orders.' });
    }

    if (order.items.length <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot remove the last item. Reject the order instead.' });
    }

    await Order.removeItem(req.params.orderId, req.params.itemId, req.user.id, req.user.role, req.user.name);
    const updatedOrder = await Order.findById(req.params.orderId);

    res.json({ success: true, message: 'Item removed successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Forward order to OSL (Laboratory Team only)
exports.forwardToOSL = async (req, res) => {
  const { notes, warehouseId } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'Submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted orders can be forwarded.' });
    }

    if (!warehouseId) {
      return res.status(400).json({ success: false, message: 'Warehouse selection is required.' });
    }

    const updatedOrder = await Order.forwardToOSL(req.params.id, req.user.id, req.user.name, notes, parseInt(warehouseId));

    res.json({ success: true, message: 'Order forwarded to warehouse successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Forward order error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred while forwarding order.' });
  }
};

// Request amendment (Laboratory Team returns order to Country for adjustments)
exports.requestAmendment = async (req, res) => {
  const { notes } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'Submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted orders can be returned for amendment.' });
    }

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Amendment notes are required.' });
    }

    const updatedOrder = await Order.requestAmendment(req.params.id, req.user.id, req.user.name, notes);

    res.json({ success: true, message: 'Order returned for amendment.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Request amendment error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Cancel order (Country Office only, before shipping booked)
exports.cancelOrder = async (req, res) => {
  const { reason } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check if user is from the same country as the order
    if (req.user.country !== order.country && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Can only cancel before shipping is booked
    if (order.shipping_booked) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order after shipping has been booked.' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required.' });
    }

    const updatedOrder = await Order.cancelOrder(req.params.id, req.user.id, req.user.name, reason);

    res.json({ success: true, message: 'Order cancelled.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Delete item from order (Lab/OSL with justification)
exports.deleteItem = async (req, res) => {
  const { reason } = req.body;
  
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check permissions
    const canDelete = (req.user.role === 'Laboratory Team' && order.status === 'Submitted') ||
                      (req.user.role === 'OSL Team' && req.user.oslAdminLevel === 0 && ['Forwarded to OSL', 'Partially Fulfilled'].includes(order.status));

    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete items from this order.' });
    }

    // Must have at least 2 items to delete one
    if (order.items.length <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete the last item. Cancel the order instead.' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Deletion reason is required.' });
    }

    const updatedOrder = await Order.deleteItem(req.params.orderId, req.params.itemId, req.user.id, req.user.name, reason);

    res.json({ success: true, message: 'Item deleted.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Validate items received by country
exports.validateItemsReceived = async (req, res) => {
  const { items } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check if user is from the same country as the order
    if (req.user.country !== order.country && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Can only validate after carrier delivery confirmed
    if (!order.carrier_delivery_confirmed) {
      return res.status(400).json({ success: false, message: 'Cannot validate items before carrier delivery is confirmed.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items data is required.' });
    }

    const updatedOrder = await Order.validateItemsReceived(req.params.id, items, req.user.id, req.user.name);

    res.json({ success: true, message: 'Items validated.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Validate items error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Reject order (Laboratory Team or OSL) - deprecated, use requestAmendment
exports.reject = async (req, res) => {
  const { notes } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role === 'Laboratory Team' && order.status !== 'Submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted orders can be rejected by Laboratory Team.' });
    }

    if (req.user.role === 'OSL Team' && order.status !== 'Forwarded to OSL') {
      return res.status(400).json({ success: false, message: 'Only forwarded orders can be rejected by OSL.' });
    }

    const updatedOrder = await Order.reject(req.params.id, req.user.id, req.user.role, notes);

    res.json({ success: true, message: 'Order rejected.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Resubmit order after amendment (Country Office only)
exports.resubmitAfterAmendment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'Amend Requested') {
      return res.status(400).json({ success: false, message: 'Order is not in amendment status.' });
    }

    if (order.country !== req.user.country && req.user.role === 'Country Office') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updatedOrder = await Order.resubmitAfterAmendment(req.params.id, req.user.name);

    res.json({ success: true, message: 'Order resubmitted successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Resubmit order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Cancel order (Country Office only, before shipping booked)
exports.cancelOrder = async (req, res) => {
  const { reason } = req.body;
  
  try {
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required.' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Country can only cancel their own orders
    if (req.user.role === 'Country Office' && order.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updatedOrder = await Order.cancelOrder(req.params.id, req.user.id, req.user.name, reason);

    res.json({ success: true, message: 'Order cancelled successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Split fulfill item - fulfill from multiple warehouses (OSL only)
exports.splitFulfillItem = async (req, res) => {
  const { fulfillments } = req.body; // Array of { warehouseId, quantity, notes }

  try {
    if (!fulfillments || !Array.isArray(fulfillments) || fulfillments.length === 0) {
      return res.status(400).json({ success: false, message: 'Fulfillment data is required.' });
    }

    const updatedOrder = await Order.splitFulfillItem(req.params.itemId, fulfillments, req.user.id, req.user.name);

    res.json({ 
      success: true, 
      message: 'Item fulfilled successfully.', 
      data: { order: updatedOrder } 
    });
  } catch (error) {
    console.error('Split fulfill item error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Smart auto-fulfill order based on proximity and stock (OSL only)
exports.smartFulfillOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!['Forwarded to OSL', 'Partially Fulfilled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be fulfilled in current status.' });
    }

    const updatedOrder = await Order.smartFulfillOrder(req.params.id, order.country, req.user.id, req.user.name);

    const message = updatedOrder.status === 'Partially Fulfilled' 
      ? 'Order partially fulfilled. Some items were unavailable or limited.'
      : 'Order fulfilled successfully.';

    res.json({ success: true, message, data: { order: updatedOrder } });
  } catch (error) {
    console.error('Smart fulfill order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Create shipment (OSL only)
exports.createShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!['Approved', 'Partially Fulfilled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot create shipment for this order status.' });
    }

    const updatedOrder = await Order.createShipment(req.params.id, req.body, req.user.id);

    res.json({ success: true, message: 'Shipment created successfully.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Update shipment (OSL only)
exports.updateShipment = async (req, res) => {
  try {
    const updatedShipment = await Order.updateShipment(req.params.shipmentId, req.body);

    if (!updatedShipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found.' });
    }

    res.json({ success: true, message: 'Shipment updated successfully.', data: { shipment: updatedShipment } });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Mark order as shipped (OSL only)
exports.markShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!['Approved', 'Partially Fulfilled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Only approved or partially fulfilled orders can be marked as shipped.' });
    }

    const updatedOrder = await Order.markShipped(req.params.id);

    // Send email notifications to Country Office and Lab Team
    try {
      // Notify the Country Office user who created the order
      if (updatedOrder.created_by) {
        const countryUser = await User.findById(updatedOrder.created_by);
        if (countryUser) {
          await emailService.sendOrderShippedEmail(countryUser, updatedOrder);
          console.log(`Shipment notification sent to Country Office: ${countryUser.email}`);
        }
      }

      // Notify the Lab Team user who reviewed the order
      if (updatedOrder.lab_reviewed_by) {
        const labUser = await User.findById(updatedOrder.lab_reviewed_by);
        if (labUser) {
          await emailService.sendOrderShippedEmail(labUser, updatedOrder);
          console.log(`Shipment notification sent to Lab Team: ${labUser.email}`);
        }
      }
    } catch (emailError) {
      console.error('Error sending shipment notification emails:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ success: true, message: 'Order marked as shipped.', data: { order: updatedOrder } });
  } catch (error) {
    console.error('Ship order error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get quantity modification history
exports.getModificationHistory = async (req, res) => {
  try {
    const modifications = await Order.getModificationHistory(req.params.id);

    res.json({ success: true, data: { modifications } });
  } catch (error) {
    console.error('Get modification history error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get order statistics
exports.getStatistics = async (req, res) => {
  try {
    let country = null;
    if (req.user.role === 'Country Office') {
      country = req.user.country;
    }

    const stats = await Order.getStatistics(country);

    let lowStockCount = 0;
    if (req.user.role === 'OSL Team') {
      const lowStock = await Commodity.getLowStock(100);
      lowStockCount = lowStock.length;
    }

    res.json({ success: true, data: { statistics: stats, lowStockItems: lowStockCount } });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get intervention types
exports.getInterventionTypes = async (req, res) => {
  try {
    const types = await Order.getInterventionTypes();
    res.json({ success: true, data: { interventionTypes: types } });
  } catch (error) {
    console.error('Get intervention types error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// ==================== DRAFT ORDER ENDPOINTS ====================

// Get all drafts for the user's country
exports.getDrafts = async (req, res) => {
  try {
    const drafts = req.user.role === 'Laboratory Team'
      ? await Order.getDraftsByUser(req.user.id)
      : await Order.getDrafts(req.user.country, req.user.id);

    res.json({ success: true, data: { drafts } });
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching drafts.' });
  }
};

// Get a specific draft by ID
exports.getDraftById = async (req, res) => {
  try {
    const draft = await Order.getDraftById(req.params.id);

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found.' });
    }

    // Country Office: must match assigned country; Lab: must be the creator
    if (req.user.role === 'Country Office' && draft.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'Laboratory Team' && draft.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { draft } });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Save draft (create new or update existing)
exports.saveDraft = async (req, res) => {
  try {
    const {
      id, // Optional - null for new draft, ID to update existing
      priority,
      pateoRef,
      pateoFile,
      notes,
      items,
      interventionType,
      situationStartDate,
      deliveryContactName,
      deliveryContactPhone,
      deliveryContactEmail,
      deliveryAddress,
      deliveryCity,
      deliveryCountry,
      preferredShippingMethod,
      targetCountry // Lab team specifies target country
    } = req.body;

    // Determine the draft's country
    const draftCountry = req.user.role === 'Laboratory Team' ? targetCountry : req.user.country;

    // If updating, verify ownership
    if (id) {
      const existing = await Order.getDraftById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Draft not found.' });
      }
      if (req.user.role === 'Country Office' && existing.country !== req.user.country) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (req.user.role === 'Laboratory Team' && existing.created_by !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    // Validate situation start date is not in the future
    if (situationStartDate && new Date(situationStartDate) > new Date()) {
      return res.status(400).json({ success: false, message: 'Situation start date cannot be in the future.' });
    }

    // Get commodity prices for items
    const itemsWithPrices = [];
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.commodityId && item.quantity > 0) {
          const commodity = await Commodity.findById(item.commodityId);
          itemsWithPrices.push({
            commodityId: item.commodityId,
            quantity: item.quantity,
            unitPrice: commodity ? commodity.price : 0
          });
        }
      }
    }

    const draft = await Order.saveDraft({
      id: id || null,
      country: draftCountry || null,
      priority,
      pateoRef,
      pateoFile,
      notes,
      createdBy: req.user.id,
      items: itemsWithPrices,
      interventionType,
      situationDate: situationStartDate,
      deliveryContactName,
      deliveryContactPhone,
      deliveryContactEmail,
      deliveryAddress,
      deliveryCity,
      deliveryCountry: deliveryCountry || draftCountry,
      preferredShippingMethod
    });

    res.json({
      success: true,
      message: id ? 'Draft updated successfully.' : 'Draft saved successfully.',
      data: { draft }
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred while saving draft.' });
  }
};

// Delete a draft
exports.deleteDraft = async (req, res) => {
  try {
    const draft = await Order.getDraftById(req.params.id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found.' });
    }

    if (req.user.role === 'Country Office' && draft.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'Laboratory Team' && draft.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await Order.deleteDraft(req.params.id, req.user.id);
    res.json({ success: true, message: 'Draft deleted successfully.' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred while deleting draft.' });
  }
};

// Submit a draft (convert to submitted order)
exports.submitDraft = async (req, res) => {
  try {
    const { pateoRef, pateoFile } = req.body;

    const draft = await Order.getDraftById(req.params.id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found.' });
    }

    if (req.user.role === 'Country Office' && draft.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'Laboratory Team' && draft.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const order = await Order.submitDraft(req.params.id, {
      pateoRef,
      pateoFile,
      submittedByName: req.user.name
    });
    res.json({
      success: true,
      message: 'Order submitted successfully.',
      data: { order }
    });
  } catch (error) {
    console.error('Submit draft error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred while submitting the order.' });
  }
};

// ==================== WORKFLOW STAGE ENDPOINTS ====================

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentReference, paymentNotes } = req.body;
    
    const order = await Order.confirmPayment(req.params.id, {
      confirmedBy: req.user.id,
      paymentReference,
      paymentNotes
    });
    
    res.json({ success: true, message: 'Payment confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Confirm contact/delivery info
exports.confirmContact = async (req, res) => {
  try {
    const order = await Order.confirmContact(req.params.id, req.user.id, req.user.name);
    res.json({ success: true, message: 'Contact information confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm contact error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Confirm fulfillment
exports.confirmFulfillment = async (req, res) => {
  try {
    const order = await Order.confirmFulfillment(req.params.id, req.user.id, req.user.name);
    res.json({ success: true, message: 'Fulfillment confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm fulfillment error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Update packaging checklist
exports.updatePackaging = async (req, res) => {
  try {
    const { items } = req.body; // [{ orderItemId, quantityPacked, quantityFound, isVerified, notes }]
    
    const result = await Order.updatePackaging(req.params.id, items, req.user.id);
    res.json({ success: true, message: 'Packaging updated.', data: result });
  } catch (error) {
    console.error('Update packaging error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Confirm packaging complete
exports.confirmPackaging = async (req, res) => {
  try {
    const order = await Order.confirmPackaging(req.params.id, req.user.id, req.user.name);
    res.json({ success: true, message: 'Packaging confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm packaging error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Get packaging checklist
exports.getPackagingChecklist = async (req, res) => {
  try {
    const checklist = await Order.getPackagingChecklist(req.params.id);
    res.json({ success: true, data: { checklist } });
  } catch (error) {
    console.error('Get packaging checklist error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Book shipping
exports.bookShipping = async (req, res) => {
  try {
    const order = await Order.bookShipping(req.params.id, req.user.id, req.user.name);
    res.json({ success: true, message: 'Shipping booked.', data: { order } });
  } catch (error) {
    console.error('Book shipping error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Confirm shipping (items dispatched)
exports.confirmShipping = async (req, res) => {
  try {
    const { 
      actualShipDate,
      shippingCompany,
      trackingNumber,
      carrierContact,
      carrierPhone,
      estimatedDeliveryFrom,
      estimatedDeliveryTo,
      shippingNotes,
      shippingCost,
      shippingWeight,
      shippingPackages
    } = req.body;
    
    // Validate required fields
    if (!shippingCompany) {
      return res.status(400).json({ success: false, message: 'Shipping company is required.' });
    }
    if (!trackingNumber || !trackingNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Tracking number is required.' });
    }
    if (!actualShipDate) {
      return res.status(400).json({ success: false, message: 'Ship date is required.' });
    }
    if (!estimatedDeliveryFrom) {
      return res.status(400).json({ success: false, message: 'ETA from date is required.' });
    }
    if (!estimatedDeliveryTo) {
      return res.status(400).json({ success: false, message: 'ETA to date is required.' });
    }
    
    const order = await Order.confirmShipping(req.params.id, { 
      confirmedBy: req.user.id,
      confirmedByName: req.user.name,
      actualShipDate,
      shippingCompany,
      trackingNumber,
      carrierContact,
      carrierPhone,
      estimatedDeliveryFrom,
      estimatedDeliveryTo,
      shippingNotes,
      shippingCost,
      shippingWeight,
      shippingPackages
    });
    res.json({ success: true, message: 'Shipping confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm shipping error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Carrier confirms delivery
exports.confirmCarrierDelivery = async (req, res) => {
  try {
    const { notes } = req.body;
    const order = await Order.confirmCarrierDelivery(req.params.id, { 
      confirmedBy: req.user.id,
      confirmedByName: req.user.name,
      notes 
    });
    res.json({ success: true, message: 'Carrier delivery confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm carrier delivery error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Country confirms receipt
exports.confirmCountryReceipt = async (req, res) => {
  try {
    const { notes } = req.body;

    // Only Country Office can confirm receipt
    if (req.user.role !== 'Country Office') {
      return res.status(403).json({ success: false, message: 'Only Country Office can confirm receipt.' });
    }

    const order = await Order.confirmCountryReceipt(req.params.id, {
      confirmedBy: req.user.id,
      confirmedByName: req.user.name,
      notes
    });

    // Send email notification to Lab Team
    try {
      // Notify the Lab Team user who reviewed the order
      if (order.lab_reviewed_by) {
        const labUser = await User.findById(order.lab_reviewed_by);
        if (labUser) {
          await emailService.sendReceiptConfirmedEmail(labUser, order);
          console.log(`Receipt confirmation notification sent to Lab Team: ${labUser.email}`);
        }
      }
    } catch (emailError) {
      console.error('Error sending receipt confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ success: true, message: 'Receipt confirmed.', data: { order } });
  } catch (error) {
    console.error('Confirm country receipt error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { 
      orderAccuracy, 
      timeliness, 
      conditionQuality, 
      communication, 
      customerEffort, 
      overallSatisfaction, 
      comments 
    } = req.body;
    
    // Only Country Office can submit feedback
    if (req.user.role !== 'Country Office') {
      return res.status(403).json({ success: false, message: 'Only Country Office can submit feedback.' });
    }
    
    const feedback = await Order.submitFeedback(req.params.id, {
      submittedBy: req.user.id,
      orderAccuracy,
      timeliness,
      conditionQuality,
      communication,
      customerEffort,
      overallSatisfaction,
      comments
    });
    
    res.json({ success: true, message: 'Feedback submitted. Thank you!', data: { feedback } });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Get feedback for an order
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Order.getFeedback(req.params.id);
    res.json({ success: true, data: { feedback } });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};

// Confirm PATEO verification
exports.confirmPateo = async (req, res) => {
  try {
    const { verificationNotes, budgetVerified } = req.body;
    
    const order = await Order.confirmPateo(req.params.id, {
      confirmedBy: req.user.id,
      confirmedByName: req.user.name,
      verificationNotes,
      budgetVerified: budgetVerified || false
    });
    
    res.json({ success: true, message: 'PATEO verified.', data: { order } });
  } catch (error) {
    console.error('Confirm PATEO error:', error);
    res.status(500).json({ success: false, message: error.message || 'An error occurred.' });
  }
};
