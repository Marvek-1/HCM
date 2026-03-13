const jwt = require('jsonwebtoken');
const { User, LoginLog, Session } = require('../models');
const { validateWHOEmail } = require('../middleware/auth');

// Helper to get client info
const getClientInfo = (req) => ({
  ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
  userAgent: req.headers['user-agent']
});

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const clientInfo = getClientInfo(req);

  console.log(`Login attempt for: ${email}`);

  try {
    // Validate email format
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Validate email format
    if (!validateWHOEmail(email)) {
      console.log(`Login failed: Invalid email format for ${email}`);
      try {
        await LoginLog.create({
          email,
          ...clientInfo,
          status: 'failed',
          failureReason: 'Invalid email format'
        });
      } catch (logError) {
        console.error('Failed to create login log:', logError.message);
      }

      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Check if account is locked
    const lockedUntil = await User.isLocked(email);
    if (lockedUntil) {
      console.log(`Login failed: Account locked for ${email}`);
      try {
        await LoginLog.create({
          email,
          ...clientInfo,
          status: 'locked',
          failureReason: 'Account locked due to multiple failed attempts'
        });
      } catch (logError) {
        console.error('Failed to create login log:', logError.message);
      }

      return res.status(423).json({
        success: false,
        message: `Account is locked. Please try again after ${new Date(lockedUntil).toLocaleTimeString()}.`
      });
    }

    // Find user
    console.log(`Looking up user: ${email}`);
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`Login failed: User not found for ${email}`);
      try {
        await LoginLog.create({
          email,
          ...clientInfo,
          status: 'failed',
          failureReason: 'User not found'
        });
      } catch (logError) {
        console.error('Failed to create login log:', logError.message);
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    console.log(`User found: ${user.name} (${user.role})`);

    // Check if user is active
    if (!user.is_active) {
      console.log(`Login failed: Account deactivated for ${email}`);
      try {
        await LoginLog.create({
          userId: user.id,
          email,
          userName: user.name,
          ...clientInfo,
          status: 'failed',
          failureReason: 'Account deactivated'
        });
      } catch (logError) {
        console.error('Failed to create login log:', logError.message);
      }

      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Verify password
    console.log(`Verifying password for ${email}`);
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for ${email}`);
      const attempts = await User.incrementLoginAttempts(email);
      
      try {
        await LoginLog.create({
          userId: user.id,
          email,
          userName: user.name,
          ...clientInfo,
          status: 'failed',
          failureReason: 'Invalid password'
        });
      } catch (logError) {
        console.error('Failed to create login log:', logError.message);
      }

      const remainingAttempts = 5 - (attempts?.login_attempts || 0);
      return res.status(401).json({
        success: false,
        message: remainingAttempts > 0 
          ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
          : 'Account locked due to multiple failed attempts.'
      });
    }

    console.log(`Password verified successfully for ${email}`);

    // Reset login attempts on successful login
    await User.resetLoginAttempts(email);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact administrator.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Calculate expiration time
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const hours = parseInt(expiresIn) || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Create session
    console.log(`Creating session for ${email}`);
    try {
      await Session.create({
        userId: user.id,
        token,
        ...clientInfo,
        expiresAt
      });
    } catch (sessionError) {
      console.error('Failed to create session:', sessionError.message);
    }

    // Update last login
    try {
      await User.updateLastLogin(user.id);
    } catch (updateError) {
      console.error('Failed to update last login:', updateError.message);
    }

    // Log successful login with userName and userCountry
    try {
      await LoginLog.create({
        userId: user.id,
        email,
        userName: user.name,
        userCountry: user.country,
        ...clientInfo,
        status: 'success'
      });
    } catch (logError) {
      console.error('Failed to create success login log:', logError.message);
    }

    console.log(`Login successful for ${email} (${user.role})`);

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          country: user.country,
          oslAdminLevel: user.osl_admin_level,
          mustChangePassword: user.must_change_password || false
        },
        token,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please check server logs.'
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    await Session.delete(req.token);

    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.'
    });
  }
};

// Logout from all devices
exports.logoutAll = async (req, res) => {
  try {
    await Session.deleteAllForUser(req.user.id);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully.'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          country: user.country,
          lastLogin: user.last_login,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Get login history for current user
exports.getLoginHistory = async (req, res) => {
  try {
    const logs = await LoginLog.findByUserId(req.user.id, 20);

    res.json({
      success: true,
      data: {
        loginHistory: logs.map(log => ({
          id: log.id,
          status: log.status,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          failureReason: log.failure_reason,
          createdAt: log.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Get active sessions for current user
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.findByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          expiresAt: session.expires_at,
          createdAt: session.created_at,
          isCurrent: session.token_hash === require('crypto').createHash('sha256').update(req.token).digest('hex')
        }))
      }
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Change password
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
        message: 'New password must be at least 8 characters long.'
      });
    }

    const user = await User.findById(req.user.id);
    const isPasswordValid = await User.comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    await User.updatePassword(req.user.id, newPassword);

    // Invalidate all other sessions
    await Session.deleteAllForUser(req.user.id);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password.'
    });
  }
};

// Get login monitoring data (admin only)
exports.getLoginMonitoring = async (req, res) => {
  try {
    const [recentLogs, statistics, suspiciousActivity] = await Promise.all([
      LoginLog.findAll(50),
      LoginLog.getStatistics(7),
      LoginLog.getSuspiciousActivity(5, 24)
    ]);

    res.json({
      success: true,
      data: {
        recentLogs: recentLogs.map(log => ({
          id: log.id,
          email: log.email,
          userName: log.user_name,
          userRole: log.user_role,
          status: log.status,
          ipAddress: log.ip_address,
          failureReason: log.failure_reason,
          createdAt: log.created_at
        })),
        statistics,
        suspiciousActivity
      }
    });
  } catch (error) {
    console.error('Get login monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
};

// Register new user (admin only or self-registration if enabled)
exports.register = async (req, res) => {
  const { email, password, name, role, country } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and role are required.'
      });
    }

    // Validate WHO email
    if (!validateWHOEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only WHO email addresses (@who.int) are allowed.'
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Validate role
    const validRoles = ['Country Office', 'Laboratory Team', 'OSL Team'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: Country Office, Laboratory Team, OSL Team.'
      });
    }

    // Country is required for Country Office role
    if (role === 'Country Office' && !country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required for Country Office role.'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      country: role === 'Country Office' ? country : null
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          country: user.country
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.'
    });
  }
};

// Forgot Password - Send reset email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const emailService = require('../services/emailService');

  try {
    // Find user by email
    const user = await User.findByEmail(email);

    // Always return success to prevent user enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const result = await User.setResetToken(email);

      if (result) {
        // Send reset email
        await emailService.sendForgotPasswordEmail(result, result.token);
        console.log(`Password reset email sent to: ${email}`);
      }
    }

    // Always return success message
    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.'
    });
  }
};

// Reset Password - With token
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Reset password with token
    const user = await User.resetPasswordWithToken(token, newPassword);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
    }

    console.log(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password.'
    });
  }
};
