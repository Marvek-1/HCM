const { User, Order } = require('../models');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');

// Helper to log activity
const logActivity = async (req, action, entityType, entityId, details = {}) => {
  try {
    await User.logActivity({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userName: req.user?.name,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Get all users with pagination and search
exports.getUsers = async (req, res) => {
  try {
    const { search, role, isActive, page, limit } = req.query;
    
    const result = await User.findAll({
      search,
      role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users.'
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get login history
    const loginHistory = await User.getLoginHistory(user.id);

    res.json({
      success: true,
      data: { user, loginHistory }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  const { email, name, role, country, oslAdminLevel, warehouseId } = req.body;

  try {
    // Validate required fields
    if (!email || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and role are required.'
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Validate role
    const validRoles = ['Country Office', 'Laboratory Team', 'OSL Team', 'Super Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role.'
      });
    }

    // Country Office requires country
    if (role === 'Country Office' && !country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required for Country Office users.'
      });
    }

    // Validate OSL admin level if provided
    if (role === 'OSL Team' && oslAdminLevel !== undefined) {
      if (![0, 1, 2].includes(parseInt(oslAdminLevel))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OSL admin level. Must be 0, 1, or 2.'
        });
      }
    }

    // OSL Team requires warehouse
    if (role === 'OSL Team' && !warehouseId) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse is required for OSL Team users.'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

    // Create user
    const user = await User.create({
      email,
      password: tempPassword,
      name,
      role,
      country: role === 'Country Office' ? country : null,
      oslAdminLevel: role === 'OSL Team' ? (oslAdminLevel !== undefined ? parseInt(oslAdminLevel) : 0) : null,
      warehouseId: role === 'OSL Team' ? parseInt(warehouseId) : null,
      createdBy: req.user.id
    });

    // Send email notification
    await emailService.sendAccountCreatedEmail(user, tempPassword);

    // Log activity
    await logActivity(req, 'user_created', 'user', user.id, { email, name, role, country, oslAdminLevel: user.osl_admin_level, warehouseId: user.warehouse_id });

    res.status(201).json({
      success: true,
      message: 'User created successfully. An email with login credentials has been sent.',
      data: { user, tempPassword } // Include temp password for display (remove in production if needed)
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating user.'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { name, role, country, isActive, oslAdminLevel, warehouseId } = req.body;
  const userId = parseInt(req.params.id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent modifying self in certain ways
    if (userId === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.'
      });
    }

    // Validate OSL admin level if provided
    const newRole = role || user.role;
    if (newRole === 'OSL Team' && oslAdminLevel !== undefined) {
      if (![0, 1, 2].includes(parseInt(oslAdminLevel))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OSL admin level. Must be 0, 1, or 2.'
        });
      }
    }

    // Determine OSL admin level: null for non-OSL, keep current or set new for OSL
    let oslLevel = null;
    if (newRole === 'OSL Team') {
      oslLevel = oslAdminLevel !== undefined ? parseInt(oslAdminLevel) : (user.osl_admin_level ?? 0);
    }

    // Determine warehouse: null for non-OSL, keep current or set new for OSL
    let warehouseIdValue = null;
    if (newRole === 'OSL Team') {
      warehouseIdValue = warehouseId !== undefined ? (warehouseId ? parseInt(warehouseId) : null) : (user.warehouse_id ?? null);
    }

    const updatedUser = await User.update(userId, {
      name,
      role,
      country,
      is_active: isActive,
      oslAdminLevel: oslLevel,
      warehouseId: warehouseIdValue
    });

    // Log activity
    await logActivity(req, 'user_updated', 'user', userId, { name, role, country, isActive, oslAdminLevel: oslLevel, warehouseId: warehouseIdValue });

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user.'
    });
  }
};

// Reset user password
exports.resetPassword = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Generate new temporary password
    const tempPassword = await User.resetPassword(userId);

    // Send email notification
    await emailService.sendPasswordResetEmail(user, tempPassword);

    // Log activity
    await logActivity(req, 'password_reset', 'user', userId, { email: user.email });

    res.json({
      success: true,
      message: 'Password reset successfully. An email has been sent to the user.',
      data: { tempPassword } // Include for display (remove in production if needed)
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password.'
    });
  }
};

// Deactivate user
exports.deactivateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { reason } = req.body;

  try {
    // Prevent self-deactivation
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const deactivatedUser = await User.deactivate(userId);

    // Send email notification
    await emailService.sendAccountStatusEmail(user, false, reason);

    // Log activity
    await logActivity(req, 'user_deactivated', 'user', userId, { email: user.email, reason });

    res.json({
      success: true,
      message: 'User deactivated successfully.',
      data: { user: deactivatedUser }
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deactivating user.'
    });
  }
};

// Activate user
exports.activateUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const activatedUser = await User.activate(userId);

    // Send email notification
    await emailService.sendAccountStatusEmail(user, true);

    // Log activity
    await logActivity(req, 'user_activated', 'user', userId, { email: user.email });

    res.json({
      success: true,
      message: 'User activated successfully.',
      data: { user: activatedUser }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while activating user.'
    });
  }
};

// Delete user (permanent deletion)
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { reason, confirmPassword } = req.body;

  try {
    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    // Verify admin password for critical operation
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete a user.'
      });
    }

    // Verify current admin's password
    const adminUser = await User.findByEmail(req.user.email);
    const isPasswordValid = await User.comparePassword(confirmPassword, adminUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. User deletion cancelled.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent deletion of the last Super Admin
    if (user.role === 'Super Admin') {
      const adminCount = await User.countByRole('Super Admin');
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last Super Admin account.'
        });
      }
    }

    // Store user info before deletion for logging
    const userInfo = {
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country
    };

    // Delete user
    await User.delete(userId);

    // Send email notification to deleted user
    try {
      await emailService.sendAccountDeletedEmail(user, reason);
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError);
      // Don't fail the entire operation if email fails
    }

    // Log activity
    await logActivity(req, 'user_deleted', 'user', userId, { ...userInfo, reason });

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting user.'
    });
  }
};

// Get user statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await User.getStats();
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { userId, action, entityType, startDate, endDate, page, limit } = req.query;
    
    const result = await User.getActivityLogs({
      userId: userId ? parseInt(userId) : undefined,
      action,
      entityType,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// User profile - get own profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const loginHistory = await User.getLoginHistory(req.user.id, 5);

    res.json({
      success: true,
      data: { user, loginHistory }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// User profile - update own profile (name and username - not email/country)
exports.updateProfile = async (req, res) => {
  const { name, username } = req.body;

  try {
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.'
      });
    }

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken.'
        });
      }
    }

    const user = await User.updateProfile(req.user.id, { 
      name: name ? name.trim() : undefined, 
      username: username !== undefined ? username : undefined 
    });

    // Log activity
    await logActivity(req, 'profile_updated', 'user', req.user.id, { name, username });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// User profile - change own password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.'
      });
    }

    // Get user with password
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Verify current password
    const isValid = await User.comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Change password
    await User.changePassword(req.user.id, newPassword);

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user);

    // Log activity
    await logActivity(req, 'password_changed', 'user', req.user.id, {});

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Preview orders that will be deleted
exports.previewOrderDeletion = async (req, res) => {
  try {
    const { country, dateFrom, dateTo, status, all } = req.query;

    // Check if this is a "clear all" operation
    if (all === 'true') {
      const orders = await Order.findAllOrdersForDeletion();
      return res.json({
        success: true,
        data: {
          totalOrders: orders.length,
          orders: orders
        }
      });
    }

    // Otherwise, require country
    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required.'
      });
    }

    // Build query for preview
    const orders = await Order.findOrdersForDeletion(country, dateFrom, dateTo, status);

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        orders: orders
      }
    });
  } catch (error) {
    console.error('Preview order deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while previewing orders.'
    });
  }
};

// Clear orders (delete order history)
exports.clearOrders = async (req, res) => {
  try {
    const { country, dateFrom, dateTo, status, password, reason, all } = req.body;

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for confirmation.'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for deletion.'
      });
    }

    // For non-all mode, country is required
    if (!all && !country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required.'
      });
    }

    // Verify admin's password
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    let ordersToDelete, orderCount, deleteResult;

    if (all) {
      // DELETE ALL ORDERS (nuclear option)
      ordersToDelete = await Order.findAllOrdersForDeletion();
      orderCount = ordersToDelete.length;

      if (orderCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'No orders found in the database.'
        });
      }

      // Delete all orders
      deleteResult = await Order.deleteAllOrders();

      // Log activity
      await logActivity(req, 'orders_cleared_all', 'orders', null, {
        scope: 'ALL_ORDERS_ALL_COUNTRIES',
        orderCount,
        reason: reason.trim(),
        orderNumbers: ordersToDelete.slice(0, 10).map(o => o.order_number)
      });

      console.log(`🚨 Super Admin ${req.user.email} deleted ALL ${orderCount} orders from ALL countries`);

      res.json({
        success: true,
        message: `Successfully deleted ALL ${orderCount} order(s) from ALL countries.`,
        data: {
          deletedCount: orderCount
        }
      });
    } else {
      // Delete by country (existing logic)
      ordersToDelete = await Order.findOrdersForDeletion(country, dateFrom, dateTo, status);
      orderCount = ordersToDelete.length;

      if (orderCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'No orders found matching the criteria.'
        });
      }

      // Delete orders
      await Order.deleteOrdersByCountry(country, dateFrom, dateTo, status);

      // Log activity
      await logActivity(req, 'orders_cleared', 'orders', null, {
        country,
        dateFrom: dateFrom || 'all',
        dateTo: dateTo || 'all',
        status: status || 'all',
        orderCount,
        reason: reason.trim(),
        orderNumbers: ordersToDelete.slice(0, 10).map(o => o.order_number)
      });

      console.log(`Super Admin ${req.user.email} deleted ${orderCount} orders for ${country}`);

      res.json({
        success: true,
        message: `Successfully deleted ${orderCount} order(s) for ${country}.`,
        data: {
          deletedCount: orderCount
        }
      });
    }
  } catch (error) {
    console.error('Clear orders error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting orders.'
    });
  }
};
