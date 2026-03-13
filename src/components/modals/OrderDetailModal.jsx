import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ordersAPI, chatAPI } from '../../services/api';
import { getStatusStyle, getPriorityStyle, formatDateTime, formatDateRange, getTimeElapsed, getPendingDurationClass } from '../../utils/helpers';
import TimelineItem from '../TimelineItem';
import OrderChat from './OrderChat';
import '../../styles/modals/Modal.css';
import '../../styles/modals/OrderDetailModal.css';

function OrderDetailModal({ 
  order: initialOrder, 
  role, 
  oslAdminLevel,
  currentUser,
  commodities = [],
  warehouses = [],
  onClose, 
  onForward, 
  onReject, 
  onSmartFulfill,
  onSplitFulfill,
  onCreateShipment,
  onShip,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onRefresh
}) {
  const [order, setOrder] = useState(initialOrder);
  const printRef = useRef();
  
  // OSL permission helpers
  const isOSL = role === 'OSL Team';
  const isCountryOffice = role === 'Country Office';
  const isLab = role === 'Laboratory Team';
  const canOSLEdit = isOSL && (oslAdminLevel === 0 || oslAdminLevel === 1);
  const canOSLAdjustQty = isOSL && oslAdminLevel === 0;
  const isOSLViewOnly = isOSL && oslAdminLevel === 2;
  const canLabEdit = isLab && order.status === 'Submitted';
  const canEdit = canLabEdit || (canOSLEdit && order.status === 'Forwarded to OSL');
  const canSplitFulfill = canOSLAdjustQty && order.status === 'Forwarded to OSL';
  const canDeleteItem = (isLab && order.status === 'Submitted') || (canOSLAdjustQty && ['Forwarded to OSL', 'Partially Fulfilled'].includes(order.status));
  const canCancelOrder = isCountryOffice && !order.shipping_booked && order.country === currentUser?.country && !['Completed', 'Cancelled', 'Shipped', 'Delivered'].includes(order.status);
  const canViewCart = isLab || isOSL || isCountryOffice; // All roles can view cart

  // Collapsible stage states
  const [collapsedStages, setCollapsedStages] = useState({});

  // PATEO verification state
  const [pateoNotes, setPateoNotes] = useState(order.pateo_verification_notes || '');
  const [pateoBudgetVerified, setPateoBudgetVerified] = useState(order.pateo_budget_verified || false);
  
  // Packaging checklist state
  const [packagingChecklist, setPackagingChecklist] = useState([]);
  
  // Enhanced shipping state
  const [shippingData, setShippingData] = useState({
    actualShipDate: '',
    shippingCompany: order.shipping_company || '',
    trackingNumber: order.shipping_tracking_number || '',
    carrierContact: order.shipping_carrier_contact || '',
    carrierPhone: order.shipping_carrier_phone || '',
    estimatedDeliveryFrom: order.estimated_delivery_from || '',
    estimatedDeliveryTo: order.estimated_delivery_to || '',
    shippingNotes: order.shipping_notes || '',
    shippingCost: order.shipping_cost || '',
    shippingWeight: order.shipping_weight_kg || '',
    shippingPackages: order.shipping_packages || 1
  });
  
  // Feedback state
  const [feedbackData, setFeedbackData] = useState({
    orderAccuracy: 0, timeliness: 0, conditionQuality: 0,
    communication: 0, customerEffort: 0, overallSatisfaction: 0, comments: ''
  });
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [receiptNotes, setReceiptNotes] = useState('');
  const [carrierNotes, setCarrierNotes] = useState('');

  // Item editing state
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [modificationReasons, setModificationReasons] = useState({});
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ commodityId: '', quantity: 1 });
  
  // Delete item state
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  
  // Cancel order state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Amendment state
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendmentNotes, setAmendmentNotes] = useState('');
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  
  // Split fulfillment state
  const [splitMode, setSplitMode] = useState(null);
  const [splitFulfillments, setSplitFulfillments] = useState({});
  const [warehouseStock, setWarehouseStock] = useState({});
  const [showFulfillmentConfirm, setShowFulfillmentConfirm] = useState(false);
  
  // Country validation state
  const [validationMode, setValidationMode] = useState(false);
  const [itemsValidation, setItemsValidation] = useState([]);

  // Modification history & Chat state
  const [showModHistory, setShowModHistory] = useState(false);
  const [modificationHistory, setModificationHistory] = useState([]);
  const [showChat, setShowChat] = useState(order?.openChat || false);
  const [chatMessageCount, setChatMessageCount] = useState(0);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // ==================== WORKFLOW STAGES ====================
  const STAGES = [
    { id: 1, name: 'PATEO Verification', icon: '📄', key: 'pateo_confirmed', byField: 'pateo_confirmed_by_name' },
    { id: 2, name: 'Contact Confirmation', icon: '📍', key: 'contact_confirmed', byField: 'contact_confirmed_by_name' },
    { id: 3, name: 'Items & Fulfillment', icon: '📋', key: 'fulfillment_confirmed', byField: 'fulfillment_confirmed_by_name' },
    { id: 4, name: 'Packing Validation', icon: '📦', key: 'packaging_confirmed', byField: 'packaging_confirmed_by_name' },
    { id: 5, name: 'Book Shipping', icon: '📄', key: 'shipping_booked', byField: 'shipping_booked_by_name' },
    { id: 6, name: 'Ship Order', icon: '🚚', key: 'shipping_confirmed', byField: 'shipping_confirmed_by_name' },
    { id: 7, name: 'Carrier Delivery', icon: '📬', key: 'carrier_delivery_confirmed', byField: 'carrier_delivery_confirmed_by_name' },
    { id: 8, name: 'Country Receipt', icon: '✅', key: 'country_receipt_confirmed', byField: 'country_receipt_confirmed_by_name' },
    { id: 9, name: 'Feedback', icon: '⭐', key: 'feedback_submitted' }
  ];

  const getWorkflowStage = () => {
    if (existingFeedback) return 10;
    if (order.country_receipt_confirmed) return 9;
    if (order.carrier_delivery_confirmed) return 8;
    if (order.shipping_confirmed) return 7;
    if (order.shipping_booked) return 6;
    if (order.packaging_confirmed) return 5;
    if (order.fulfillment_confirmed) return 4;
    if (order.contact_confirmed) return 3;
    if (order.pateo_confirmed) return 2;
    return 1;
  };

  const currentStage = getWorkflowStage();
  const progressPercent = Math.round(((currentStage - 1) / STAGES.length) * 100);
  const isOSLProcessing = ['Forwarded to OSL', 'Approved', 'Partially Fulfilled', 'Shipped', 'Completed'].includes(order.status);

  // Toggle stage collapse
  const toggleStageCollapse = (stageId) => {
    setCollapsedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (order.fulfillment_confirmed) fetchPackagingChecklist();
  }, [order.fulfillment_confirmed]);

  useEffect(() => {
    if (order.country_receipt_confirmed) fetchFeedback();
  }, [order.country_receipt_confirmed]);

  useEffect(() => {
    if (order?.openChat) setShowChat(true);
  }, [order?.openChat]);

  useEffect(() => {
    const fetchChatCount = async () => {
      if (order?.id) {
        try {
          const response = await chatAPI.getMessages(order.id);
          if (response.success) setChatMessageCount(response.data.messages?.length || 0);
        } catch (err) { console.error('Failed to fetch chat count:', err); }
      }
    };
    fetchChatCount();
  }, [order?.id]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (order?.id) {
        try {
          const response = await ordersAPI.getModificationHistory(order.id);
          if (response.success) setModificationHistory(response.data.modifications || []);
        } catch (err) { console.error('Failed to fetch modification history:', err); }
      }
    };
    fetchHistory();
  }, [order?.id]);

  // ==================== DATA FETCHING ====================
  const fetchPackagingChecklist = async () => {
    try {
      const response = await ordersAPI.getPackagingChecklist(order.id);
      if (response.success) setPackagingChecklist(response.data.checklist || []);
    } catch (err) { console.error('Failed to fetch packaging checklist:', err); }
  };

  const fetchFeedback = async () => {
    try {
      const response = await ordersAPI.getFeedback(order.id);
      if (response.success && response.data.feedback) setExistingFeedback(response.data.feedback);
    } catch (err) { console.error('Failed to fetch feedback:', err); }
  };

  const refreshOrder = async () => {
    try {
      const response = await ordersAPI.getById(order.id);
      if (response.success) {
        setOrder(response.data.order);
        if (onRefresh) onRefresh(response.data.order);
      }
    } catch (err) { console.error('Failed to refresh order:', err); }
  };

  // ==================== STYLING HELPERS ====================
  const statusStyle = getStatusStyle(order.status);
  const priorityStyle = getPriorityStyle(order.priority);
  const orderDate = formatDateTime(order.created_at);
  const isPending = ['Submitted', 'Forwarded to OSL', 'Partially Fulfilled'].includes(order.status);
  const pendingTime = isPending ? getTimeElapsed(order.created_at) : null;
  const durationClass = isPending ? getPendingDurationClass(order.created_at) : '';

  const total = order.items?.reduce((sum, item) => {
    return sum + (parseFloat(item.unitPrice || 0) * (item.quantity || 0));
  }, 0) || 0;

  const availableCommodities = commodities.filter(
    c => !order.items?.some(item => item.commodity?.id === c.id)
  );

  // ==================== PRINT FUNCTIONALITY ====================
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order ${order.order_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              position: relative;
            }
            body::before {
              content: 'WHO';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 180px;
              font-weight: bold;
              color: rgba(0, 154, 222, 0.08);
              z-index: -1;
              pointer-events: none;
            }
            .who-logo {
              position: absolute;
              top: 20px;
              right: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .who-logo-text {
              font-weight: bold;
              color: #009ADE;
              font-size: 24px;
              font-family: Arial, sans-serif;
            }
            .who-logo-badge {
              background: #009ADE;
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 16px;
              font-weight: bold;
            }
            .print-header {
              border-bottom: 2px solid #009ADE;
              padding-bottom: 15px;
              margin-bottom: 20px;
              margin-top: 50px;
            }
            .print-header h1 { margin: 0 0 10px 0; font-size: 24px; color: #1A2B4A; }
            .status-badges { display: flex; gap: 10px; }
            .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
            .order-info div { padding: 5px 0; }
            .order-info label { font-weight: bold; color: #555; display: block; font-size: 11px; text-transform: uppercase; }
            .order-info span { font-size: 14px; }
            h3 { margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .items-table th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; }
            .items-table td { font-size: 13px; }
            .total-row { font-weight: bold; background: #f0f7ff; }
            .total-row td { border-top: 2px solid #333; }
            .workflow-section { margin-top: 25px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
            .workflow-item { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
            .workflow-item:last-child { border-bottom: none; }
            .workflow-item.completed { color: #059669; }
            .workflow-item .label { font-weight: 500; }
            .workflow-item .by { font-size: 12px; color: #666; }
            .amendment-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .print-footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 11px; text-align: center; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="who-logo">
            <div class="who-logo-badge">WHO</div>
            <div class="who-logo-text">World Health Organization</div>
          </div>

          <div class="print-header">
            <h1>Order: ${order.order_number}</h1>
            <div class="status-badges">
              <span class="badge" style="background: ${statusStyle.background}; color: ${statusStyle.color}">${order.status}</span>
              <span class="badge" style="background: ${priorityStyle.background}; color: ${priorityStyle.color}">${order.priority} Priority</span>
              ${order.is_outbreak ? '<span class="badge" style="background: #FEE2E2; color: #DC2626">🚨 Outbreak</span>' : ''}
            </div>
          </div>
          
          ${order.amendment_requested ? '<div class="amendment-notice">⚠️ <strong>Amendment Requested:</strong> ' + (order.amendment_notes || 'Please review and make adjustments') + '</div>' : ''}
          
          <div class="order-info">
            <div><label>Country</label><span>${order.country}</span></div>
            <div><label>Submitted Date</label><span>${formatDateTime(order.created_at)}</span></div>
            <div><label>Submitted By</label><span>${order.submitted_by_name || order.created_by_name || 'N/A'}</span></div>
            <div><label>PATEO Reference</label><span>${order.pateo_ref || 'N/A'}</span></div>
            <div><label>Intervention Type</label><span>${order.intervention_type || 'N/A'}</span></div>
            ${order.forwarded_by_name ? `<div><label>Forwarded By</label><span>${order.forwarded_by_name}</span></div>` : ''}
          </div>
          
          <h3>Delivery Information</h3>
          <div class="order-info">
            <div><label>Contact Name</label><span>${order.delivery_contact_name || 'N/A'}</span></div>
            <div><label>Phone</label><span>${order.delivery_contact_phone || 'N/A'}</span></div>
            <div><label>Email</label><span>${order.delivery_contact_email || 'N/A'}</span></div>
            <div><label>Shipping Method</label><span>${order.preferred_shipping_method || 'Standard'}</span></div>
            <div style="grid-column: span 2;"><label>Address</label><span>${order.delivery_address || 'N/A'}${order.delivery_city ? ', ' + order.delivery_city : ''}</span></div>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Supplier</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.commodity?.name || 'N/A'}</td>
                  <td>${item.commodity?.supplierName || 'N/A'}</td>
                  <td>${item.commodity?.unit || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>$${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                  <td>$${(parseFloat(item.unitPrice || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="7">No items</td></tr>'}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;"><strong>Order Total:</strong></td>
                <td><strong>$${total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          ${['Shipped', 'Completed'].includes(order.status) && order.shipping_company ? `
            <h3>Shipping Information</h3>
            <div class="order-info">
              <div><label>Shipping Company</label><span>${order.shipping_company}</span></div>
              <div><label>Tracking Number</label><span>${order.shipping_tracking_number || 'N/A'}</span></div>
              <div><label>Ship Date</label><span>${formatDateTime(order.actual_ship_date)}</span></div>
              <div><label>Packages</label><span>${order.shipping_packages || 1}</span></div>
            </div>
          ` : ''}
          
          ${order.status === 'Completed' || isOSLProcessing ? `
            <div class="workflow-section">
              <h3 style="margin-top: 0; border: none;">Workflow Authorization</h3>
              ${order.pateo_confirmed ? `<div class="workflow-item completed"><span class="label">✓ PATEO Verified</span><span class="by">${order.pateo_confirmed_by_name || 'System'} - ${formatDateTime(order.pateo_confirmed_at)}</span></div>` : ''}
              ${order.contact_confirmed ? `<div class="workflow-item completed"><span class="label">✓ Contact Confirmed</span><span class="by">${order.contact_confirmed_by_name || 'System'} - ${formatDateTime(order.contact_confirmed_at)}</span></div>` : ''}
              ${order.fulfillment_confirmed ? `<div class="workflow-item completed"><span class="label">✓ Fulfillment Confirmed</span><span class="by">${order.fulfillment_confirmed_by_name || 'System'} - ${formatDateTime(order.fulfillment_confirmed_at)}</span></div>` : ''}
              ${order.packaging_confirmed ? `<div class="workflow-item completed"><span class="label">✓ Packaging Confirmed</span><span class="by">${order.packaging_confirmed_by_name || 'System'} - ${formatDateTime(order.packaging_confirmed_at)}</span></div>` : ''}
              ${order.shipping_booked ? `<div class="workflow-item completed"><span class="label">✓ Shipping Booked</span><span class="by">${order.shipping_booked_by_name || 'System'} - ${formatDateTime(order.shipping_booked_at)}</span></div>` : ''}
              ${order.shipping_confirmed ? `<div class="workflow-item completed"><span class="label">✓ Shipped</span><span class="by">${order.shipping_confirmed_by_name || 'System'} - ${formatDateTime(order.shipping_confirmed_at)}</span></div>` : ''}
              ${order.carrier_delivery_confirmed ? `<div class="workflow-item completed"><span class="label">✓ Carrier Delivery</span><span class="by">${order.carrier_delivery_confirmed_by_name || 'System'} - ${formatDateTime(order.carrier_delivery_confirmed_at)}</span></div>` : ''}
              ${order.country_receipt_confirmed ? `<div class="workflow-item completed"><span class="label">✓ Receipt Confirmed</span><span class="by">${order.country_receipt_confirmed_by_name || 'System'} - ${formatDateTime(order.country_receipt_confirmed_at)}</span></div>` : ''}
              ${existingFeedback ? `<div class="workflow-item completed"><span class="label">⭐ Feedback Submitted</span><span class="by">${existingFeedback.submitted_by_name || 'Country Office'} - ${formatDateTime(existingFeedback.submitted_at)}</span></div>` : ''}
            </div>
          ` : ''}
          
          <div class="print-footer">
            <p>HCOMS - Health Commodities Order Management System</p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ==================== WORKFLOW ACTIONS ====================
  const handleConfirmPateo = async () => {
    if (!pateoBudgetVerified) { toast.error('Please verify that PATEO budget is sufficient'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmPateo(order.id, { verificationNotes: pateoNotes, budgetVerified: pateoBudgetVerified });
      if (response.success) { toast.success('PATEO verified'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to verify PATEO'); }
    finally { setIsLoading(false); }
  };

  const handleConfirmContact = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmContact(order.id);
      if (response.success) { toast.success('Contact information confirmed'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to confirm contact'); }
    finally { setIsLoading(false); }
  };

  const handleConfirmFulfillment = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmFulfillment(order.id);
      if (response.success) { toast.success('Fulfillment confirmed'); setOrder(response.data.order); fetchPackagingChecklist(); }
    } catch (err) { toast.error(err.message || 'Failed to confirm fulfillment'); }
    finally { setIsLoading(false); }
  };

  const handleForwardToWarehouse = async () => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse');
      return;
    }
    setIsLoading(true);
    try {
      await onForward(parseInt(selectedWarehouse));
      setShowForwardModal(false);
      setSelectedWarehouse('');
      // Success message is handled by parent component (App.jsx)
    } catch (err) {
      toast.error(err.message || 'Failed to forward order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackagingItem = (itemId, field, value) => {
    setPackagingChecklist(prev => prev.map(item => item.order_item_id === itemId ? { ...item, [field]: value } : item));
  };

  const handleSavePackaging = async () => {
    setIsLoading(true);
    try {
      const items = packagingChecklist.map(item => ({
        orderItemId: item.order_item_id, quantityPacked: item.quantity_packed || 0,
        quantityFound: item.quantity_found || 0, isVerified: item.is_verified || false, notes: item.notes || ''
      }));
      const response = await ordersAPI.updatePackaging(order.id, { items });
      if (response.success) { toast.success('Packaging checklist saved'); setPackagingChecklist(response.data); }
    } catch (err) { toast.error(err.message || 'Failed to save packaging'); }
    finally { setIsLoading(false); }
  };

  const handleConfirmPackaging = async () => {
    if (!packagingChecklist.every(item => item.is_verified)) { toast.error('All items must be verified'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmPackaging(order.id);
      if (response.success) { toast.success('Packaging confirmed'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to confirm packaging'); }
    finally { setIsLoading(false); }
  };

  const handleBookShipping = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.bookShipping(order.id);
      if (response.success) { toast.success('Shipping booked'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to book shipping'); }
    finally { setIsLoading(false); }
  };

  const handleConfirmShipping = async () => {
    if (!shippingData.shippingCompany.trim()) { toast.error('Shipping company is required'); return; }
    if (!shippingData.trackingNumber.trim()) { toast.error('Tracking number is required'); return; }
    if (!shippingData.actualShipDate) { toast.error('Ship date is required'); return; }
    if (!shippingData.estimatedDeliveryFrom) { toast.error('ETA from date is required'); return; }
    if (!shippingData.estimatedDeliveryTo) { toast.error('ETA to date is required'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmShipping(order.id, shippingData);
      if (response.success) { toast.success('Shipping confirmed'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to confirm shipping'); }
    finally { setIsLoading(false); }
  };

  const handleCarrierDelivery = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmCarrierDelivery(order.id, { notes: carrierNotes });
      if (response.success) { toast.success('Carrier delivery confirmed'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to confirm delivery'); }
    finally { setIsLoading(false); }
  };

  const handleConfirmReceipt = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.confirmCountryReceipt(order.id, { notes: receiptNotes });
      if (response.success) { toast.success('Receipt confirmed! Order completed.'); setOrder(response.data.order); }
    } catch (err) { toast.error(err.message || 'Failed to confirm receipt'); }
    finally { setIsLoading(false); }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackData.overallSatisfaction === 0) { toast.error('Please rate overall satisfaction'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.submitFeedback(order.id, feedbackData);
      if (response.success) { toast.success('Thank you for your feedback!'); setExistingFeedback(response.data.feedback); }
    } catch (err) { toast.error(err.message || 'Failed to submit feedback'); }
    finally { setIsLoading(false); }
  };

  // ==================== CANCEL & AMENDMENT ====================
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a cancellation reason'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.cancelOrder(order.id, { reason: cancelReason });
      if (response.success) { toast.success('Order cancelled'); setOrder(response.data.order); setShowCancelModal(false); }
    } catch (err) { toast.error(err.message || 'Failed to cancel order'); }
    finally { setIsLoading(false); }
  };

  const handleRequestAmendment = async () => {
    if (!amendmentNotes.trim()) { toast.error('Please provide amendment notes'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.requestAmendment(order.id, { notes: amendmentNotes });
      if (response.success) { toast.success('Order returned for amendment'); setOrder(response.data.order); setShowAmendModal(false); if (onRefresh) onRefresh(); }
    } catch (err) { toast.error(err.message || 'Failed to request amendment'); }
    finally { setIsLoading(false); }
  };

  // ==================== RESUBMIT ORDER (after amendment) ====================
  const handleResubmitOrder = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.resubmitOrder(order.id);
      if (response.success) { toast.success('Order resubmitted successfully'); setOrder(response.data.order); if (onRefresh) onRefresh(); }
    } catch (err) { toast.error(err.message || 'Failed to resubmit order'); }
    finally { setIsLoading(false); }
  };

  // ==================== DELETE ITEM ====================
  const handleDeleteItem = async () => {
    if (!deleteReason.trim()) { toast.error('Please provide a deletion reason'); return; }
    setIsLoading(true);
    try {
      const response = await ordersAPI.deleteItem(order.id, deleteItemId, { reason: deleteReason });
      if (response.success) { toast.success('Item deleted'); setOrder(response.data.order); setDeleteItemId(null); setDeleteReason(''); }
    } catch (err) { toast.error(err.message || 'Failed to delete item'); }
    finally { setIsLoading(false); }
  };

  // ==================== COUNTRY VALIDATION ====================
  const startValidation = () => {
    setItemsValidation(order.items.map(item => ({
      itemId: item.id, quantityReceived: item.quantity, notes: ''
    })));
    setValidationMode(true);
  };

  const updateItemValidation = (itemId, field, value) => {
    setItemsValidation(prev => prev.map(item => item.itemId === itemId ? { ...item, [field]: value } : item));
  };

  const handleValidateItems = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.validateItemsReceived(order.id, { items: itemsValidation });
      if (response.success) { toast.success('Items validated'); setOrder(response.data.order); setValidationMode(false); }
    } catch (err) { toast.error(err.message || 'Failed to validate items'); }
    finally { setIsLoading(false); }
  };

  // ==================== PACKING SUMMARY ====================
  const generatePackingSummary = () => {
    let summary = `PACKING SUMMARY - Order ${order.order_number}\n`;
    summary += `Date: ${new Date().toLocaleDateString()}\nCountry: ${order.country}\n`;
    summary += `PATEO: ${order.pateo_ref || 'N/A'}\n${'='.repeat(50)}\n\nITEMS:\n`;
    packagingChecklist.forEach((item, idx) => {
      summary += `${idx + 1}. ${item.commodity_name}\n`;
      summary += `   Req: ${item.quantity_requested} | Found: ${item.quantity_found || 0} | Packed: ${item.quantity_packed || 0}\n`;
      summary += `   Verified: ${item.is_verified ? 'Yes ✓' : 'No'}\n\n`;
    });
    return summary;
  };

  const handleDownloadSummary = () => {
    const summary = generatePackingSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `packing-summary-${order.order_number}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded');
  };

  // ==================== ITEM EDITING ====================
  const handleEditStart = () => {
    setEditedItems(order.items.map(item => ({ ...item, originalQty: item.quantity, editedQty: item.quantity })));
    setModificationReasons({});
    setEditMode(true);
  };

  const handleQtyChange = (itemId, newQty) => {
    setEditedItems(prev => prev.map(item => item.id === itemId ? { ...item, editedQty: parseInt(newQty) || 0 } : item));
  };

  const handleReasonChange = (itemId, reason) => {
    setModificationReasons(prev => ({ ...prev, [itemId]: reason }));
  };

  const getQtyChangeStatus = (item) => {
    if (item.editedQty > item.originalQty) return 'increased';
    if (item.editedQty < item.originalQty) return 'decreased';
    return 'unchanged';
  };

  const handleSaveEdits = async () => {
    const changedItems = editedItems.filter(item => item.editedQty !== item.originalQty);
    for (const item of changedItems) {
      if (!modificationReasons[item.id]?.trim()) {
        toast.error(`Please provide a reason for changing ${item.commodity?.name}`);
        return;
      }
    }
    setIsLoading(true);
    try {
      for (const item of changedItems) {
        await onUpdateItem(order.id, item.id, { quantity: item.editedQty, reason: modificationReasons[item.id] });
      }
      setEditMode(false);
      await refreshOrder();
      toast.success('Changes saved');
    } catch (err) { toast.error(err.message || 'Failed to save changes'); }
    finally { setIsLoading(false); }
  };

  // ==================== SPLIT FULFILLMENT ====================
  const getWarehouseFulfillments = (item) => item.warehouseFulfillments?.filter(wf => wf.quantityFulfilled > 0) || [];

  const getFulfillmentBadge = (item) => {
    const fulfilled = item.fulfilledQuantity || 0;
    const requested = item.quantity;
    if (fulfilled === 0) return <span className="badge badge-pending">Pending</span>;
    if (fulfilled >= requested) return <span className="badge badge-fulfilled">Fulfilled</span>;
    return <span className="badge badge-partial">Partial ({fulfilled}/{requested})</span>;
  };

  const handleSplitFulfillStart = async (itemId) => {
    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    // Fetch warehouse stock for this commodity
    const stockData = {};
    for (const warehouse of warehouses) {
      // Find stock for this commodity in this warehouse
      const stock = warehouse.stock?.find(s => s.commodityId === item.commodityId);
      stockData[warehouse.id] = stock?.quantity || 0;
    }
    setWarehouseStock(stockData);

    const initialSplits = {};
    warehouses.forEach(w => {
      const existing = item.warehouseFulfillments?.find(wf => wf.warehouseId === w.id);
      initialSplits[w.id] = existing?.quantityFulfilled || 0;
    });
    setSplitFulfillments(initialSplits);
    setSplitMode(itemId);
  };

  const handleSplitQtyChange = (warehouseId, qty) => {
    setSplitFulfillments(prev => ({ ...prev, [warehouseId]: parseInt(qty) || 0 }));
  };

  const handleSplitSave = async (itemId) => {
    const fulfillments = Object.entries(splitFulfillments)
      .filter(([_, qty]) => qty > 0)
      .map(([warehouseId, quantity]) => ({ warehouseId: parseInt(warehouseId), quantity }));
    if (fulfillments.length === 0) { toast.error('Specify at least one warehouse'); return; }
    const item = order.items.find(i => i.id === itemId);
    const totalFulfill = fulfillments.reduce((sum, f) => sum + f.quantity, 0);
    if (totalFulfill > item.quantity) { toast.error(`Total (${totalFulfill}) exceeds requested (${item.quantity})`); return; }

    // Check for stock warnings
    const warnings = [];
    fulfillments.forEach(f => {
      const warehouse = warehouses.find(w => w.id === parseInt(f.warehouseId));
      const availableStock = warehouseStock[f.warehouseId] || 0;
      if (f.quantity > availableStock) {
        warnings.push(`${warehouse?.name}: Requested ${f.quantity}, only ${availableStock} available`);
      }
    });

    if (warnings.length > 0) {
      const proceed = window.confirm(
        `⚠️ Stock Warning\n\n${warnings.join('\n')}\n\nProceed anyway?`
      );
      if (!proceed) return;
    }

    setIsLoading(true);
    try {
      await onSplitFulfill(order.id, itemId, fulfillments);
      setSplitMode(null);
      setWarehouseStock({});
      await refreshOrder();
      toast.success('Fulfillment updated');
    } catch (err) { toast.error(err.message || 'Failed to update fulfillment'); }
    finally { setIsLoading(false); }
  };

  // ==================== STAR RATING ====================
  const renderStarRating = (field, currentValue) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" className={`star-btn ${star <= currentValue ? 'filled' : ''}`}
          onClick={() => setFeedbackData(prev => ({ ...prev, [field]: star }))}>
          {star <= currentValue ? '★' : '☆'}
        </button>
      ))}
    </div>
  );

  // ==================== STAGE HELPERS ====================
  const isStageComplete = (stageId) => {
    if (stageId === 9) return !!existingFeedback;
    const stage = STAGES.find(s => s.id === stageId);
    return stage ? order[stage.key] : false;
  };

  const isStageActive = (stageId) => currentStage === stageId;
  const isStageAvailable = (stageId) => currentStage >= stageId;

  // ==================== RENDER ====================
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content order-detail-modal workflow-modal three-pane" ref={printRef}>
        {/* Header */}
        <div className="modal-header">
          <div className="order-detail-header-info">
            <h2>Order {order.order_number}</h2>
            <span className="badge" style={statusStyle}>{order.status}</span>
            <span className="badge" style={priorityStyle}>{order.priority}</span>
            {order.is_outbreak && <span className="outbreak-tag">🚨 Outbreak</span>}
            {order.amendment_requested && <span className="amendment-tag">⚠️ Amendment Requested</span>}
          </div>
          <div className="header-actions">
            <button className="btn btn-sm btn-secondary" onClick={handlePrint} title="Print Order">🖨️ Print</button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Progress Tracker - ON TOP OF FORM */}
        {isOSLProcessing && (
          <div className="progress-tracker-bar">
            <div className="progress-stages-horizontal">
              {STAGES.map((stage) => {
                const isComplete = isStageComplete(stage.id);
                const isActive = isStageActive(stage.id);
                return (
                  <div key={stage.id} className={`progress-stage-item ${isComplete ? 'completed' : isActive ? 'active' : 'locked'}`}>
                    <div className="stage-indicator">{isComplete ? '✓' : stage.id}</div>
                    <span className="stage-label">{stage.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${((currentStage - 1) / 9) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Amendment Notice */}
        {order.amendment_requested && (
          <div className="amendment-notice-banner">
            <strong>⚠️ Amendment Requested:</strong> {order.amendment_notes || 'Please review and make adjustments'}
            <span className="amendment-by">By: {order.amendment_requested_by_name} on {formatDateTime(order.amendment_requested_at)}</span>
          </div>
        )}

        {/* Body - Two Panel Layout */}
        <div className="two-pane-body">
          {/* LEFT PANEL - Order Info & Verification */}
          <div className="detail-panel left-panel">
            <div className="panel-header"><h3>📋 Order Information</h3></div>
            <div className="panel-scrollable">
              {/* Order Summary */}
              <div className="summary-card">
                <div className="summary-row"><span className="label">Country</span><span className="value">{order.country}</span></div>
                <div className="summary-row"><span className="label">Submitted</span><span className="value">{orderDate} {isPending && <span className={`pending-duration ${durationClass}`}>({pendingTime})</span>}</span></div>
                <div className="summary-row"><span className="label">Submitted By</span><span className="value">{order.submitted_by_name || order.created_by_name || 'N/A'}</span></div>
                <div className="summary-row"><span className="label">Intervention</span><span className="value">{order.intervention_type}</span></div>
                <div className="summary-row"><span className="label">PATEO Ref</span><span className="value pateo-ref">{order.pateo_ref || 'N/A'}</span></div>
                {order.forwarded_by_name && <div className="summary-row"><span className="label">Forwarded By</span><span className="value">{order.forwarded_by_name}</span></div>}
                <div className="summary-row total-row"><span className="label">Order Total</span><span className="value">${total.toFixed(2)}</span></div>
              </div>

              {/* PATEO Verification Stage - Collapsible */}
              {isOSLProcessing && (
                <div className={`workflow-stage ${isStageComplete(1) ? 'completed' : isStageActive(1) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(1)}>
                    <span className="stage-num">{isStageComplete(1) ? '✓' : '1'}</span>
                    <span>📄 PATEO Verification</span>
                    <span className="collapse-icon">{collapsedStages[1] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[1] && (
                    <div className="stage-content">
                      <div className="pateo-info">
                        <div className="info-row"><label>PATEO Reference</label><span className="pateo-ref">{order.pateo_ref || 'Not provided'}</span></div>
                        {order.pateo_file && <div className="info-row"><label>Document</label><a href={order.pateo_file} target="_blank" rel="noopener noreferrer" className="doc-link">📎 View</a></div>}
                        <div className="info-row highlight"><label>Order Total</label><span className="amount">${total.toFixed(2)}</span></div>
                      </div>
                      {!order.pateo_confirmed && canOSLEdit ? (
                        <div className="verification-form">
                          <label className="checkbox-label">
                            <input type="checkbox" checked={pateoBudgetVerified} onChange={(e) => setPateoBudgetVerified(e.target.checked)} />
                            <span>Budget sufficient (${total.toFixed(2)})</span>
                          </label>
                          <textarea value={pateoNotes} onChange={(e) => setPateoNotes(e.target.value)} placeholder="Verification notes..." rows={2} />
                          <button onClick={handleConfirmPateo} className="btn btn-primary btn-block" disabled={isLoading || !pateoBudgetVerified}>✓ Confirm PATEO</button>
                        </div>
                      ) : order.pateo_confirmed ? (
                        <div className="confirmed-badge success">✓ Verified by {order.pateo_confirmed_by_name || 'System'} - {formatDateTime(order.pateo_confirmed_at)}</div>
                      ) : <div className="awaiting-message">Awaiting verification...</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Confirmation Stage - Collapsible */}
              {isOSLProcessing && (
                <div className={`workflow-stage ${isStageComplete(2) ? 'completed' : isStageActive(2) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(2)}>
                    <span className="stage-num">{isStageComplete(2) ? '✓' : '2'}</span>
                    <span>📍 Contact Confirmation</span>
                    <span className="collapse-icon">{collapsedStages[2] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[2] && currentStage >= 2 && (
                    <div className="stage-content">
                      <div className="delivery-info-grid">
                        <div className="info-item"><label>Name</label><span>{order.delivery_contact_name || '-'}</span></div>
                        <div className="info-item"><label>Phone</label><span>{order.delivery_contact_phone || '-'}</span></div>
                        <div className="info-item"><label>Email</label><span>{order.delivery_contact_email || '-'}</span></div>
                        <div className="info-item"><label>Method</label><span>{order.preferred_shipping_method || 'Standard'}</span></div>
                        <div className="info-item full-width"><label>Address</label><span>{order.delivery_address || '-'}</span></div>
                      </div>
                      {!order.contact_confirmed && canOSLEdit && order.pateo_confirmed ? (
                        <button onClick={handleConfirmContact} className="btn btn-primary btn-block" disabled={isLoading}>✓ Confirm Contact</button>
                      ) : order.contact_confirmed ? (
                        <div className="confirmed-badge success">✓ Confirmed by {order.contact_confirmed_by_name || 'System'} - {formatDateTime(order.contact_confirmed_at)}</div>
                      ) : !order.pateo_confirmed ? <div className="locked-message">🔒 Complete PATEO first</div> : null}
                    </div>
                  )}
                </div>
              )}

              {/* Chat & History */}
              <div className="form-section">
                <div className="section-header" onClick={() => setShowChat(!showChat)}>
                  <span>💬 Discussion {chatMessageCount > 0 && <span className="chat-count-badge">{chatMessageCount}</span>}</span>
                  <span>{showChat ? '▼' : '▶'}</span>
                </div>
                {showChat && <OrderChat orderId={order.id} currentUser={currentUser} onMessageCountChange={setChatMessageCount} />}
              </div>

              <div className="form-section">
                <div className="section-header" onClick={() => setShowModHistory(!showModHistory)}>
                  <span>📜 Modification History</span>
                  <span>{showModHistory ? '▼' : '▶'}</span>
                </div>
                {showModHistory && (
                  <div className="modification-list">
                    {modificationHistory.length === 0 ? <div className="modification-empty">No modifications</div> : 
                      modificationHistory.map((mod, idx) => (
                        <div key={idx} className="modification-item">
                          <div className="modification-header"><span>{mod.modifier_name} ({mod.modifier_role})</span><span className="modification-date">{formatDateTime(mod.created_at)}</span></div>
                          <div className="modification-action">{mod.action} {mod.commodity_name && `- ${mod.commodity_name}`}</div>
                          {mod.reason && <div className="modification-reason">Reason: {mod.reason}</div>}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Items & Processing */}
          <div className="detail-panel right-panel">
            <div className="panel-header"><h3>📦 Items & Processing</h3><span className="total-value">${total.toFixed(2)}</span></div>
            <div className="panel-scrollable">
              {/* Items & Fulfillment Stage - Collapsible - VISIBLE TO ALL INCLUDING COUNTRY */}
              <div className={`workflow-stage ${isStageComplete(3) ? 'completed' : isStageActive(3) ? 'active' : ''}`}>
                <div className="stage-header-row" onClick={() => toggleStageCollapse(3)}>
                  <span className="stage-num">{isStageComplete(3) ? '✓' : '3'}</span>
                  <span>📋 Items & Fulfillment ({order.items?.length || 0} items)</span>
                  <span className="collapse-icon">{collapsedStages[3] ? '▶' : '▼'}</span>
                </div>
                {!collapsedStages[3] && (
                  <div className="stage-content">
                    {/* Edit Bar - Lab/OSL only */}
                    {canEdit && !order.fulfillment_confirmed && (
                      <div className="items-edit-bar">
                        {!editMode ? <button onClick={handleEditStart} className="btn btn-sm btn-secondary">✏️ Edit Quantities</button>
                          : <><button onClick={() => setEditMode(false)} className="btn btn-sm btn-secondary">Cancel</button>
                              <button onClick={handleSaveEdits} className="btn btn-sm btn-primary">Save</button></>}
                        {canOSLEdit && order.status === 'Forwarded to OSL' && <button onClick={() => onSmartFulfill(order.id)} className="btn btn-sm btn-success">⚡ Auto-Fulfill</button>}
                      </div>
                    )}

                    {/* Items List - Visible to all */}
                    <div className="items-list">
                      {order.items?.map((item, i) => {
                        const price = parseFloat(item.unitPrice || 0);
                        const showFulfillment = isOSLProcessing;
                        const warehouseFulfillments = getWarehouseFulfillments(item);
                        const isSplitting = splitMode === item.id;
                        const isDeleting = deleteItemId === item.id;

                        return (
                          <div key={i} className="item-card">
                            <div className="item-main">
                              <div className="item-name">{item.commodity?.name}</div>
                              <div className="item-meta">
                                <span className="item-unit">{item.commodity?.unit}</span>
                                {item.commodity?.supplierName && <span className="item-supplier">📦 {item.commodity.supplierName}</span>}
                                {showFulfillment && getFulfillmentBadge(item)}
                              </div>
                              {warehouseFulfillments.length > 0 && (
                                <div className="warehouse-badges">
                                  {warehouseFulfillments.map((wf, idx) => <span key={idx} className="warehouse-badge">{wf.warehouseName}: {wf.quantityFulfilled}</span>)}
                                </div>
                              )}
                              {/* Country Validation Display */}
                              {item.receivedValidated && (
                                <div className="received-info">
                                  <span className="received-qty">Received: {item.quantityReceived || 0}</span>
                                  {item.receivedNotes && <span className="received-notes">{item.receivedNotes}</span>}
                                </div>
                              )}
                            </div>
                            <div className="item-qty-price">
                              {editMode && canEdit ? (
                                <div className="item-edit">
                                  <input 
                                    type="number" 
                                    className={`qty-input ${editedItems.find(e => e.id === item.id)?.editedQty !== item.quantity ? (editedItems.find(e => e.id === item.id)?.editedQty > item.quantity ? 'qty-increased' : 'qty-decreased') : ''}`}
                                    value={editedItems.find(e => e.id === item.id)?.editedQty || item.quantity}
                                    onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                    min="1"
                                  />
                                  {editedItems.find(e => e.id === item.id)?.editedQty !== item.quantity && (
                                    <input 
                                      type="text" 
                                      className="reason-input"
                                      placeholder="Reason for change..."
                                      value={modificationReasons[item.id] || ''}
                                      onChange={(e) => handleReasonChange(item.id, e.target.value)}
                                    />
                                  )}
                                </div>
                              ) : (
                                <>
                                  <span className="item-qty">×{item.quantity}</span>
                                  <span className="item-price">${(price * item.quantity).toFixed(2)}</span>
                                </>
                              )}
                            </div>

                            {/* Delete Item - Lab/OSL with justification */}
                            {canDeleteItem && !order.fulfillment_confirmed && order.items.length > 1 && (
                              <div className="item-actions">
                                {!isDeleting ? (
                                  <button onClick={() => setDeleteItemId(item.id)} className="btn btn-sm btn-danger-outline">🗑️ Delete</button>
                                ) : (
                                  <div className="delete-form">
                                    <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="Reason for deletion (required)..." rows={2} />
                                    <div className="delete-actions">
                                      <button onClick={() => { setDeleteItemId(null); setDeleteReason(''); }} className="btn btn-sm">Cancel</button>
                                      <button onClick={handleDeleteItem} className="btn btn-sm btn-danger" disabled={isLoading}>Delete</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Split Fulfillment - OSL Level 0 only */}
                            {canSplitFulfill && !order.fulfillment_confirmed && (
                              <div className="split-actions">
                                {!isSplitting ? <button onClick={() => handleSplitFulfillStart(item.id)} className="btn btn-sm btn-outline">Split Fulfill</button> : (
                                  <div className="split-form">
                                    <div className="split-header"><strong>Allocate from warehouses</strong><span className="split-total">Total: {Object.values(splitFulfillments).reduce((a, b) => a + (parseInt(b) || 0), 0)} / {item.quantity}</span></div>
                                    <div className="split-warehouses">
                                      {warehouses.map(w => {
                                        const stock = warehouseStock[w.id] || 0;
                                        const requested = splitFulfillments[w.id] || 0;
                                        const hasWarning = requested > stock;
                                        return (
                                          <div key={w.id} className={`split-warehouse-row ${hasWarning ? 'warning' : ''}`}>
                                            <div className="warehouse-info">
                                              <span className="warehouse-name">{w.name}</span>
                                              <span className={`stock-badge ${stock === 0 ? 'out-of-stock' : stock < 10 ? 'low-stock' : ''}`}>
                                                Stock: {stock}
                                              </span>
                                            </div>
                                            <div className="warehouse-input">
                                              <input
                                                type="number"
                                                min="0"
                                                max={item.quantity}
                                                value={splitFulfillments[w.id] || 0}
                                                onChange={(e) => handleSplitQtyChange(w.id, e.target.value)}
                                              />
                                              {hasWarning && (
                                                <span className="stock-warning" title="Requested quantity exceeds available stock">
                                                  ⚠️
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="split-actions-btns">
                                      <button onClick={() => setSplitMode(null)} className="btn btn-sm">Cancel</button>
                                      <button onClick={() => handleSplitSave(item.id)} className="btn btn-sm btn-primary" disabled={isLoading}>Save</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Country Validation Input */}
                            {validationMode && isCountryOffice && (
                              <div className="validation-form">
                                <label>Qty Received:</label>
                                <input type="number" min="0" max={item.quantity}
                                  value={itemsValidation.find(v => v.itemId === item.id)?.quantityReceived || 0}
                                  onChange={(e) => updateItemValidation(item.id, 'quantityReceived', parseInt(e.target.value) || 0)} />
                                <input type="text" placeholder="Notes..."
                                  value={itemsValidation.find(v => v.itemId === item.id)?.notes || ''}
                                  onChange={(e) => updateItemValidation(item.id, 'notes', e.target.value)} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Country Validation Button */}
                    {isCountryOffice && order.carrier_delivery_confirmed && !order.items_validated_by_country && (
                      !validationMode ? <button onClick={startValidation} className="btn btn-secondary btn-block">📋 Validate Items Received</button>
                        : <div className="validation-actions">
                            <button onClick={() => setValidationMode(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleValidateItems} className="btn btn-primary" disabled={isLoading}>✓ Confirm Validation</button>
                          </div>
                    )}

                    {/* Fulfillment Confirmation - OSL only */}
                    {!order.fulfillment_confirmed && canOSLEdit && order.contact_confirmed && <button onClick={handleConfirmFulfillment} className="btn btn-primary btn-block" disabled={isLoading}>✓ Confirm Fulfillment</button>}
                    {order.fulfillment_confirmed && <div className="confirmed-badge success">✓ Confirmed by {order.fulfillment_confirmed_by_name || 'System'} - {formatDateTime(order.fulfillment_confirmed_at)}</div>}
                    {!order.fulfillment_confirmed && !order.contact_confirmed && isOSLProcessing && <div className="locked-message">🔒 Complete contact first</div>}
                  </div>
                )}
              </div>

              {/* Packing Validation Stage - Collapsible */}
              {currentStage >= 4 && (
                <div className={`workflow-stage ${isStageComplete(4) ? 'completed' : isStageActive(4) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(4)}>
                    <span className="stage-num">{isStageComplete(4) ? '✓' : '4'}</span>
                    <span>📦 Packing Validation</span>
                    <span className="collapse-icon">{collapsedStages[4] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[4] && (
                    <div className="stage-content">
                      <div className="packing-checklist">
                        {packagingChecklist.map((item, idx) => (
                          <div key={idx} className={`packing-item ${item.is_verified ? 'verified' : ''}`}>
                            <label className="checkbox-label">
                              <input type="checkbox" checked={item.is_verified || false} onChange={(e) => handleUpdatePackagingItem(item.order_item_id, 'is_verified', e.target.checked)} disabled={order.packaging_confirmed || !canOSLEdit} />
                              <span>{item.commodity_name}</span>
                            </label>
                            <div className="packing-details">
                              <span>Req: {item.quantity_requested}</span>
                              <span>Found:</span><input type="number" min="0" value={item.quantity_found || 0} onChange={(e) => handleUpdatePackagingItem(item.order_item_id, 'quantity_found', parseInt(e.target.value) || 0)} disabled={order.packaging_confirmed || !canOSLEdit} />
                              <span>Packed:</span><input type="number" min="0" value={item.quantity_packed || 0} onChange={(e) => handleUpdatePackagingItem(item.order_item_id, 'quantity_packed', parseInt(e.target.value) || 0)} disabled={order.packaging_confirmed || !canOSLEdit} />
                            </div>
                          </div>
                        ))}
                      </div>
                      {!order.packaging_confirmed && canOSLEdit && (
                        <div className="packing-actions">
                          <button onClick={handleSavePackaging} className="btn btn-secondary" disabled={isLoading}>💾 Save</button>
                          <button onClick={handleConfirmPackaging} className="btn btn-primary" disabled={isLoading || !packagingChecklist.every(i => i.is_verified)}>✓ Confirm Packed</button>
                        </div>
                      )}
                      {order.packaging_confirmed && <div className="confirmed-badge success">✓ Confirmed by {order.packaging_confirmed_by_name || 'System'} - {formatDateTime(order.packaging_confirmed_at)}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Book Shipping Stage - Collapsible */}
              {currentStage >= 5 && (
                <div className={`workflow-stage ${isStageComplete(5) ? 'completed' : isStageActive(5) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(5)}>
                    <span className="stage-num">{isStageComplete(5) ? '✓' : '5'}</span>
                    <span>📄 Book Shipping</span>
                    <span className="collapse-icon">{collapsedStages[5] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[5] && (
                    <div className="stage-content">
                      <div className="summary-preview"><strong>Order {order.order_number}</strong> • {order.country}<div>Items: {packagingChecklist.length} • Verified: {packagingChecklist.filter(i => i.is_verified).length}</div></div>
                      <button onClick={handleDownloadSummary} className="btn btn-secondary btn-block">📥 Download Packing Summary</button>
                      {!order.shipping_booked && canOSLEdit && order.packaging_confirmed && <button onClick={handleBookShipping} className="btn btn-primary btn-block" disabled={isLoading}>📦 Book for Shipping</button>}
                      {order.shipping_booked && <div className="confirmed-badge success">✓ Booked by {order.shipping_booked_by_name || 'System'} - {formatDateTime(order.shipping_booked_at)}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Ship Order Stage - Collapsible */}
              {currentStage >= 6 && (
                <div className={`workflow-stage ${isStageComplete(6) ? 'completed' : isStageActive(6) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(6)}>
                    <span className="stage-num">{isStageComplete(6) ? '✓' : '6'}</span>
                    <span>🚚 Ship Order</span>
                    <span className="collapse-icon">{collapsedStages[6] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[6] && (
                    <div className="stage-content">
                      {!order.shipping_confirmed && canOSLEdit ? (
                        <div className="shipping-form">
                          <div className="form-row">
                            <div className="form-group"><label>Shipping Company *</label><input type="text" value={shippingData.shippingCompany} onChange={(e) => setShippingData(prev => ({ ...prev, shippingCompany: e.target.value }))} /></div>
                            <div className="form-group"><label>Tracking # *</label><input type="text" value={shippingData.trackingNumber} onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))} /></div>
                          </div>
                          <div className="form-row">
                            <div className="form-group"><label>Carrier Contact</label><input type="text" value={shippingData.carrierContact} onChange={(e) => setShippingData(prev => ({ ...prev, carrierContact: e.target.value }))} /></div>
                            <div className="form-group"><label>Carrier Phone</label><input type="text" value={shippingData.carrierPhone} onChange={(e) => setShippingData(prev => ({ ...prev, carrierPhone: e.target.value }))} /></div>
                          </div>
                          <div className="form-row">
                            <div className="form-group"><label>Ship Date *</label><input type="datetime-local" value={shippingData.actualShipDate} onChange={(e) => setShippingData(prev => ({ ...prev, actualShipDate: e.target.value }))} /></div>
                            <div className="form-group"><label>Packages</label><input type="number" min="1" value={shippingData.shippingPackages} onChange={(e) => setShippingData(prev => ({ ...prev, shippingPackages: parseInt(e.target.value) || 1 }))} /></div>
                          </div>
                          <div className="form-row">
                            <div className="form-group"><label>ETA From *</label><input type="date" value={shippingData.estimatedDeliveryFrom} onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDeliveryFrom: e.target.value }))} /></div>
                            <div className="form-group"><label>ETA To *</label><input type="date" value={shippingData.estimatedDeliveryTo} onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDeliveryTo: e.target.value }))} /></div>
                          </div>
                          <div className="form-row">
                            <div className="form-group"><label>Weight (kg)</label><input type="number" step="0.1" value={shippingData.shippingWeight} onChange={(e) => setShippingData(prev => ({ ...prev, shippingWeight: e.target.value }))} /></div>
                            <div className="form-group"><label>Cost ($)</label><input type="number" step="0.01" value={shippingData.shippingCost} onChange={(e) => setShippingData(prev => ({ ...prev, shippingCost: e.target.value }))} /></div>
                          </div>
                          <div className="form-group"><label>Notes</label><textarea value={shippingData.shippingNotes} onChange={(e) => setShippingData(prev => ({ ...prev, shippingNotes: e.target.value }))} rows={2} /></div>
                          <button onClick={handleConfirmShipping} className="btn btn-primary btn-block" disabled={isLoading || !shippingData.shippingCompany.trim() || !shippingData.trackingNumber.trim() || !shippingData.actualShipDate || !shippingData.estimatedDeliveryFrom || !shippingData.estimatedDeliveryTo}>✓ Confirm Shipped</button>
                        </div>
                      ) : order.shipping_confirmed ? (
                        <div className="shipping-details-display">
                          <div className="detail-grid">
                            <div><strong>Company:</strong> {order.shipping_company}</div>
                            <div><strong>Tracking:</strong> {order.shipping_tracking_number || '-'}</div>
                            <div><strong>Ship Date:</strong> {formatDateTime(order.actual_ship_date)}</div>
                            <div><strong>Packages:</strong> {order.shipping_packages || 1}</div>
                          </div>
                          <div className="confirmed-badge success">✓ Shipped by {order.shipping_confirmed_by_name || 'System'} - {formatDateTime(order.shipping_confirmed_at)}</div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* Carrier Delivery Stage - Collapsible */}
              {currentStage >= 7 && (
                <div className={`workflow-stage ${isStageComplete(7) ? 'completed' : isStageActive(7) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(7)}>
                    <span className="stage-num">{isStageComplete(7) ? '✓' : '7'}</span>
                    <span>📬 Carrier Delivery</span>
                    <span className="collapse-icon">{collapsedStages[7] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[7] && (
                    <div className="stage-content">
                      {!order.carrier_delivery_confirmed && canOSLEdit ? (
                        <><textarea value={carrierNotes} onChange={(e) => setCarrierNotes(e.target.value)} placeholder="Delivery notes..." rows={2} />
                          <button onClick={handleCarrierDelivery} className="btn btn-primary btn-block" disabled={isLoading}>✓ Confirm Delivery</button></>
                      ) : order.carrier_delivery_confirmed ? (
                        <>{order.carrier_delivery_notes && <div className="notes-display">{order.carrier_delivery_notes}</div>}
                          <div className="confirmed-badge success">✓ Delivered {order.carrier_delivery_confirmed_by_name && `by ${order.carrier_delivery_confirmed_by_name}`} - {formatDateTime(order.carrier_delivery_confirmed_at)}</div></>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* Country Receipt Stage - Collapsible */}
              {currentStage >= 8 && (
                <div className={`workflow-stage ${isStageComplete(8) ? 'completed' : isStageActive(8) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(8)}>
                    <span className="stage-num">{isStageComplete(8) ? '✓' : '8'}</span>
                    <span>✅ Country Receipt</span>
                    <span className="collapse-icon">{collapsedStages[8] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[8] && (
                    <div className="stage-content">
                      {!order.country_receipt_confirmed && isCountryOffice ? (
                        <>
                          {/* Items Validation */}
                          {!order.items_validated_by_country ? (
                            <>
                              <div className="info-banner">
                                <strong>📋 Verify Received Items</strong>
                                <p>Please verify the quantity received for each item below:</p>
                              </div>

                              <div className="items-validation-list">
                                {validationMode ? (
                                  <>
                                    {itemsValidation.map((item, idx) => {
                                      const orderItem = order.items.find(oi => oi.id === item.itemId);
                                      return (
                                        <div key={item.itemId} className="validation-item">
                                          <div className="validation-item-header">
                                            <span className="item-number">{idx + 1}.</span>
                                            <span className="item-name">{orderItem?.commodity_name}</span>
                                          </div>
                                          <div className="validation-row">
                                            <div className="form-group">
                                              <label>Ordered Qty</label>
                                              <input type="number" value={orderItem?.quantity || 0} disabled className="qty-display" />
                                            </div>
                                            <div className="form-group">
                                              <label>Received Qty *</label>
                                              <input
                                                type="number"
                                                min="0"
                                                value={item.quantityReceived}
                                                onChange={(e) => updateItemValidation(item.itemId, 'quantityReceived', parseInt(e.target.value) || 0)}
                                                className="form-input"
                                              />
                                            </div>
                                          </div>
                                          <div className="form-group">
                                            <label>Notes (optional)</label>
                                            <input
                                              type="text"
                                              value={item.notes}
                                              onChange={(e) => updateItemValidation(item.itemId, 'notes', e.target.value)}
                                              placeholder="Any discrepancies or notes..."
                                              className="form-input"
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <div className="validation-actions">
                                      <button onClick={() => setValidationMode(false)} className="btn btn-secondary">Cancel</button>
                                      <button onClick={handleValidateItems} className="btn btn-primary" disabled={isLoading}>✓ Save Quantities</button>
                                    </div>
                                  </>
                                ) : (
                                  <button onClick={startValidation} className="btn btn-primary btn-block">📋 Start Item Verification</button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Show validated items */}
                              <div className="validated-items-summary">
                                <div className="confirmed-badge success">✓ Items Validated - {formatDateTime(order.items_validated_at)}</div>
                                <table className="items-received-table">
                                  <thead>
                                    <tr>
                                      <th>Item</th>
                                      <th>Ordered</th>
                                      <th>Received</th>
                                      <th>Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => (
                                      <tr key={item.id}>
                                        <td>{idx + 1}. {item.commodity_name}</td>
                                        <td>{item.quantity}</td>
                                        <td className={item.quantity_received !== item.quantity ? 'qty-mismatch' : 'qty-match'}>
                                          {item.quantity_received || 0}
                                        </td>
                                        <td>{item.received_notes || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Final confirmation */}
                              <div className="final-confirmation-section">
                                <label>Final Notes (optional)</label>
                                <textarea value={receiptNotes} onChange={(e) => setReceiptNotes(e.target.value)} placeholder="Any additional notes about the delivery..." rows={2} className="form-input" />
                                <button onClick={handleConfirmReceipt} className="btn btn-success btn-block" disabled={isLoading}>✅ Confirm Receipt Complete</button>
                              </div>
                            </>
                          )}
                        </>
                      ) : order.country_receipt_confirmed ? (
                        <>
                          {/* Show completed receipt info */}
                          <div className="validated-items-summary">
                            <table className="items-received-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Ordered</th>
                                  <th>Received</th>
                                  <th>Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, idx) => (
                                  <tr key={item.id}>
                                    <td>{idx + 1}. {item.commodity_name}</td>
                                    <td>{item.quantity}</td>
                                    <td className={item.quantity_received !== item.quantity ? 'qty-mismatch' : 'qty-match'}>
                                      {item.quantity_received || item.quantity}
                                    </td>
                                    <td>{item.received_notes || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {order.country_receipt_notes && <div className="notes-display"><strong>Receipt Notes:</strong> {order.country_receipt_notes}</div>}
                          <div className="confirmed-badge success">✅ Received by {order.country_receipt_confirmed_by_name || 'System'} - {formatDateTime(order.country_receipt_confirmed_at)}</div>
                        </>
                      ) : <div className="awaiting-message">Awaiting Country Office...</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Stage - Collapsible */}
              {currentStage >= 9 && (
                <div className={`workflow-stage ${existingFeedback ? 'completed' : isStageActive(9) ? 'active' : 'locked'}`}>
                  <div className="stage-header-row" onClick={() => toggleStageCollapse(9)}>
                    <span className="stage-num">{existingFeedback ? '✓' : '9'}</span>
                    <span>⭐ Feedback</span>
                    <span className="collapse-icon">{collapsedStages[9] ? '▶' : '▼'}</span>
                  </div>
                  {!collapsedStages[9] && (
                    <div className="stage-content">
                      {existingFeedback ? (
                        <div className="feedback-summary">
                          {['order_accuracy', 'timeliness', 'condition_quality', 'communication', 'customer_effort', 'overall_satisfaction'].map(key => (
                            <div key={key} className="rating-item"><span>{key.replace(/_/g, ' ')}</span><span className="stars">{'★'.repeat(existingFeedback[key])}{'☆'.repeat(5 - existingFeedback[key])}</span></div>
                          ))}
                          <div className="confirmed-badge">✓ Submitted</div>
                        </div>
                      ) : isCountryOffice ? (
                        <div className="feedback-form">
                          <h4>How was your experience?</h4>
                          {[{ key: 'orderAccuracy', label: 'Order Accuracy' }, { key: 'timeliness', label: 'Timeliness' }, { key: 'conditionQuality', label: 'Condition & Quality' }, { key: 'communication', label: 'Communication' }, { key: 'customerEffort', label: 'Customer Effort' }, { key: 'overallSatisfaction', label: 'Overall Satisfaction *' }].map(({ key, label }) => (
                            <div key={key} className="feedback-field"><label>{label}</label>{renderStarRating(key, feedbackData[key])}</div>
                          ))}
                          <textarea value={feedbackData.comments} onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))} placeholder="Comments..." rows={2} />
                          <button onClick={handleSubmitFeedback} className="btn btn-primary btn-block" disabled={isLoading}>Submit Feedback</button>
                        </div>
                      ) : <div className="awaiting-message">Awaiting Country Office feedback...</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-left">
            {isLab && order.status === 'Submitted' && (
              <>
                <button onClick={() => setShowAmendModal(true)} className="btn btn-warning">⚠️ Amend</button>
                <button onClick={() => setShowForwardModal(true)} className="btn btn-success">Forward to Warehouse →</button>
              </>
            )}
            {/* Country can resubmit amended orders */}
            {isCountryOffice && order.status === 'Amend Requested' && order.country === currentUser?.country && (
              <button onClick={handleResubmitOrder} className="btn btn-primary" disabled={isLoading}>📤 Resubmit Order</button>
            )}
            {canCancelOrder && <button onClick={() => setShowCancelModal(true)} className="btn btn-danger">Cancel Order</button>}
          </div>
          <div className="footer-right">
            {isOSLViewOnly && <span className="view-only-notice">📋 View Only</span>}
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal">
              <h3>Cancel Order</h3>
              <p>Are you sure you want to cancel this order?</p>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation (required)..." rows={3} />
              <div className="sub-modal-actions">
                <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary">No, Keep Order</button>
                <button onClick={handleCancelOrder} className="btn btn-danger" disabled={isLoading || !cancelReason.trim()}>Yes, Cancel Order</button>
              </div>
            </div>
          </div>
        )}

        {/* Amendment Modal */}
        {showAmendModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal">
              <h3>Request Amendment</h3>
              <p>Return this order to the Country Office for adjustments.</p>
              <textarea value={amendmentNotes} onChange={(e) => setAmendmentNotes(e.target.value)} placeholder="Describe what needs to be adjusted (required)..." rows={3} />
              <div className="sub-modal-actions">
                <button onClick={() => setShowAmendModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleRequestAmendment} className="btn btn-warning" disabled={isLoading || !amendmentNotes.trim()}>Return for Amendment</button>
              </div>
            </div>
          </div>
        )}

        {/* Forward to Warehouse Modal */}
        {showForwardModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal">
              <h3>📦 Forward to Warehouse</h3>
              <p>Select the warehouse that will handle this order based on proximity to destination country: <strong>{order.country}</strong></p>
              <div className="form-group">
                <label>Select Warehouse *</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="form-select"
                  autoFocus
                >
                  <option value="">-- Select Warehouse --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name} ({w.location})
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  Choose the warehouse closest to the destination country for faster delivery
                </small>
              </div>
              <div className="sub-modal-actions">
                <button onClick={() => { setShowForwardModal(false); setSelectedWarehouse(''); }} className="btn btn-secondary">Cancel</button>
                <button onClick={handleForwardToWarehouse} className="btn btn-success" disabled={isLoading || !selectedWarehouse}>
                  Forward to Warehouse →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailModal;
