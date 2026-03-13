const nodemailer = require('nodemailer');

// Create transporter (configure based on your email service)
const createTransporter = () => {
  // For production, use environment variables
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // For development/testing, use ethereal or console logging
  console.log('Email service: No SMTP configured, emails will be logged to console');
  return null;
};

const transporter = createTransporter();

// Send email helper
const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || 'HCOMS <noreply@who.int>';
  
  if (!transporter) {
    // Log email to console in development
    console.log('\n📧 EMAIL NOTIFICATION (Dev Mode)');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', text || html);
    console.log('---\n');
    return { success: true, mode: 'console' };
  }
  
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // Account created notification
  accountCreated: ({ name, email, tempPassword, loginUrl }) => ({
    subject: 'HCOMS - Your Account Has Been Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009ADE; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
          <p style="color: white; margin: 5px 0 0;">Health Commodity Order Management System</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">Welcome to HCOMS, ${name}!</h2>
          <p>Your account has been created by an administrator. Here are your login credentials:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          <p style="color: #DC2626;"><strong>Important:</strong> You will be required to change your password upon first login.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #009ADE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to HCOMS</a>
          </div>
          <p style="color: #64748B; font-size: 14px;">If you did not expect this email, please contact your administrator.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748B; font-size: 12px;">
          <p>World Health Organization - Health Commodity Order Management System</p>
        </div>
      </div>
    `,
    text: `
Welcome to HCOMS, ${name}!

Your account has been created by an administrator.

Email: ${email}
Temporary Password: ${tempPassword}

IMPORTANT: You will be required to change your password upon first login.

Login at: ${loginUrl}

If you did not expect this email, please contact your administrator.
    `
  }),

  // Password reset notification
  passwordReset: ({ name, email, tempPassword, loginUrl }) => ({
    subject: 'HCOMS - Your Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009ADE; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">Password Reset</h2>
          <p>Hello ${name},</p>
          <p>Your password has been reset by an administrator. Here is your new temporary password:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; letter-spacing: 2px; font-family: monospace;">${tempPassword}</p>
          </div>
          <p style="color: #DC2626;"><strong>Important:</strong> You will be required to change this password upon your next login.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #009ADE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Login Now</a>
          </div>
        </div>
      </div>
    `,
    text: `
Hello ${name},

Your password has been reset by an administrator.

Your new temporary password is: ${tempPassword}

IMPORTANT: You will be required to change this password upon your next login.

Login at: ${loginUrl}
    `
  }),

  // Account status change
  accountStatusChanged: ({ name, isActive, reason }) => ({
    subject: `HCOMS - Your Account Has Been ${isActive ? 'Activated' : 'Deactivated'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isActive ? '#059669' : '#DC2626'}; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">Account ${isActive ? 'Activated' : 'Deactivated'}</h2>
          <p>Hello ${name},</p>
          <p>Your HCOMS account has been <strong>${isActive ? 'activated' : 'deactivated'}</strong> by an administrator.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          ${isActive ? '<p>You can now log in to the system.</p>' : '<p>If you believe this is an error, please contact your administrator.</p>'}
        </div>
      </div>
    `,
    text: `
Hello ${name},

Your HCOMS account has been ${isActive ? 'activated' : 'deactivated'} by an administrator.
${reason ? `Reason: ${reason}` : ''}

${isActive ? 'You can now log in to the system.' : 'If you believe this is an error, please contact your administrator.'}
    `
  }),

  // Password changed confirmation
  passwordChanged: ({ name }) => ({
    subject: 'HCOMS - Your Password Has Been Changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009ADE; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">Password Changed</h2>
          <p>Hello ${name},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not make this change, please contact your administrator immediately.</p>
        </div>
      </div>
    `,
    text: `
Hello ${name},

Your password has been successfully changed.

If you did not make this change, please contact your administrator immediately.
    `
  }),

  // Forgot password reset link
  forgotPassword: ({ name, resetUrl }) => ({
    subject: 'HCOMS - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009ADE; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
          <p style="color: white; margin: 5px 0 0;">Health Commodity Order Management System</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your HCOMS account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #009ADE; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #64748B; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: white; padding: 12px; border-radius: 4px; font-size: 13px; color: #1A2B4A;">${resetUrl}</p>
          <p style="color: #DC2626; margin-top: 25px;"><strong>⚠️ Security Notice:</strong></p>
          <ul style="color: #64748B; font-size: 14px;">
            <li>This link will expire in <strong>1 hour</strong></li>
            <li>If you did not request this reset, please ignore this email</li>
            <li>Your password will not change until you create a new one</li>
          </ul>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748B; font-size: 12px;">
          <p>World Health Organization - Health Commodity Order Management System</p>
        </div>
      </div>
    `,
    text: `
Hello ${name},

We received a request to reset your password for your HCOMS account.

To reset your password, visit this link:
${resetUrl}

SECURITY NOTICE:
- This link will expire in 1 hour
- If you did not request this reset, please ignore this email
- Your password will not change until you create a new one

World Health Organization - Health Commodity Order Management System
    `
  }),

  // Order message notification
  orderMessage: ({ recipientName, senderName, senderRole, orderNumber, messagePreview, orderUrl }) => ({
    subject: `HCOMS - New message on order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009ADE; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
          <p style="color: white; margin: 5px 0 0;">Health Commodity Order Management System</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">💬 New Message</h2>
          <p>Hello ${recipientName},</p>
          <p>You have a new message on order <strong>${orderNumber}</strong>:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #009ADE;">
            <p style="margin: 0 0 10px; color: #64748B; font-size: 14px;">
              <strong>${senderName}</strong> (${senderRole})
            </p>
            <p style="margin: 0; color: #1A2B4A;">"${messagePreview}"</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="background: #009ADE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order & Reply</a>
          </div>
          <p style="color: #64748B; font-size: 14px;">You're receiving this because you're involved in this order or have been mentioned in the conversation.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748B; font-size: 12px;">
          <p>World Health Organization - Health Commodity Order Management System</p>
        </div>
      </div>
    `,
    text: `
Hello ${recipientName},

You have a new message on order ${orderNumber}:

${senderName} (${senderRole}):
"${messagePreview}"

View order and reply at: ${orderUrl}

You're receiving this because you're involved in this order or have been mentioned in the conversation.
    `
  }),

  // Order shipped notification
  orderShipped: ({ recipientName, orderNumber, country, totalItems, orderUrl }) => ({
    subject: `HCOMS - Order ${orderNumber} has been shipped`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009ADE; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
          <p style="color: white; margin: 5px 0 0;">Health Commodity Order Management System</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">📦 Order Shipped</h2>
          <p>Hello ${recipientName},</p>
          <p>Order <strong>${orderNumber}</strong> has been marked as shipped and is now on its way to <strong>${country}</strong>.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Destination:</strong> ${country}</p>
            <p style="margin: 5px 0;"><strong>Total Items:</strong> ${totalItems}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669;">Shipped</span></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="background: #009ADE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Details</a>
          </div>
          <p style="color: #64748B; font-size: 14px;">Country Office: Please confirm receipt once the order arrives.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748B; font-size: 12px;">
          <p>World Health Organization - Health Commodity Order Management System</p>
        </div>
      </div>
    `,
    text: `
Hello ${recipientName},

Order ${orderNumber} has been marked as shipped and is now on its way to ${country}.

Order Details:
- Order Number: ${orderNumber}
- Destination: ${country}
- Total Items: ${totalItems}
- Status: Shipped

View order details at: ${orderUrl}

Country Office: Please confirm receipt once the order arrives.
    `
  }),

  // Receipt confirmed notification
  receiptConfirmed: ({ recipientName, orderNumber, country, confirmedByName, notes, orderUrl }) => ({
    subject: `HCOMS - Receipt confirmed for order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WHO HCOMS</h1>
          <p style="color: white; margin: 5px 0 0;">Health Commodity Order Management System</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A2B4A;">✅ Receipt Confirmed</h2>
          <p>Hello ${recipientName},</p>
          <p><strong>${country}</strong> has confirmed receipt of order <strong>${orderNumber}</strong>.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Country:</strong> ${country}</p>
            <p style="margin: 5px 0;"><strong>Confirmed By:</strong> ${confirmedByName}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669;">Completed</span></p>
            ${notes ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 5px 0; color: #64748B; font-size: 14px;"><strong>Notes:</strong></p>
              <p style="margin: 5px 0; color: #1A2B4A;">${notes}</p>
            </div>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Details</a>
          </div>
          <p style="color: #64748B; font-size: 14px;">This order is now complete.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748B; font-size: 12px;">
          <p>World Health Organization - Health Commodity Order Management System</p>
        </div>
      </div>
    `,
    text: `
Hello ${recipientName},

${country} has confirmed receipt of order ${orderNumber}.

Order Details:
- Order Number: ${orderNumber}
- Country: ${country}
- Confirmed By: ${confirmedByName}
- Status: Completed
${notes ? `\nNotes: ${notes}` : ''}

View order details at: ${orderUrl}

This order is now complete.
    `
  })
};

// Export functions
module.exports = {
  sendEmail,
  
  // Send account created email
  sendAccountCreatedEmail: async (user, tempPassword) => {
    const template = emailTemplates.accountCreated({
      name: user.name,
      email: user.email,
      tempPassword,
      loginUrl: process.env.APP_URL || 'http://localhost:5173'
    });
    return sendEmail({ to: user.email, ...template });
  },

  // Send password reset email
  sendPasswordResetEmail: async (user, tempPassword) => {
    const template = emailTemplates.passwordReset({
      name: user.name,
      email: user.email,
      tempPassword,
      loginUrl: process.env.APP_URL || 'http://localhost:5173'
    });
    return sendEmail({ to: user.email, ...template });
  },

  // Send account status change email
  sendAccountStatusEmail: async (user, isActive, reason = null) => {
    const template = emailTemplates.accountStatusChanged({
      name: user.name,
      isActive,
      reason
    });
    return sendEmail({ to: user.email, ...template });
  },

  // Send password changed confirmation
  sendPasswordChangedEmail: async (user) => {
    const template = emailTemplates.passwordChanged({
      name: user.name
    });
    return sendEmail({ to: user.email, ...template });
  },

  // Send order message notification
  sendOrderMessageNotification: async (recipient, order, message, sender) => {
    const template = emailTemplates.orderMessage({
      recipientName: recipient.name,
      senderName: sender.name,
      senderRole: sender.role,
      orderNumber: order.order_number || order.orderNumber,
      messagePreview: message.message ? message.message.substring(0, 200) : '',
      orderUrl: `${process.env.APP_URL || 'http://localhost:5173'}?order=${order.id}`
    });
    return sendEmail({ to: recipient.email, ...template });
  },

  // Send forgot password email with reset link
  sendForgotPasswordEmail: async (user, resetToken) => {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const template = emailTemplates.forgotPassword({
      name: user.name,
      resetUrl
    });
    return sendEmail({ to: user.email, ...template });
  },

  // Send order shipped notification
  sendOrderShippedEmail: async (recipient, order) => {
    const orderUrl = `${process.env.APP_URL || 'http://localhost:5173'}?order=${order.id}`;
    const template = emailTemplates.orderShipped({
      recipientName: recipient.name,
      orderNumber: order.order_number,
      country: order.country,
      totalItems: order.items ? order.items.length : 0,
      orderUrl
    });
    return sendEmail({ to: recipient.email, ...template });
  },

  // Send receipt confirmed notification
  sendReceiptConfirmedEmail: async (recipient, order) => {
    const orderUrl = `${process.env.APP_URL || 'http://localhost:5173'}?order=${order.id}`;
    const template = emailTemplates.receiptConfirmed({
      recipientName: recipient.name,
      orderNumber: order.order_number,
      country: order.country,
      confirmedByName: order.country_receipt_confirmed_by_name,
      notes: order.country_receipt_notes,
      orderUrl
    });
    return sendEmail({ to: recipient.email, ...template });
  }
};
