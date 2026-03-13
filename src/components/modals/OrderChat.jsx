import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { chatAPI } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import '../../styles/modals/OrderChat.css';

function OrderChat({ orderId, currentUser, onMessageCountChange }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (orderId) {
      fetchMessages();
    }
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages(orderId);
      if (response.success) {
        setMessages(response.data.messages || []);
        if (onMessageCountChange) {
          onMessageCountChange(response.data.messages?.length || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await chatAPI.sendMessage(orderId, newMessage.trim());
      if (response.success) {
        setMessages([...messages, response.data.message]);
        setNewMessage('');
        if (onMessageCountChange) {
          onMessageCountChange(messages.length + 1);
        }
        inputRef.current?.focus();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = async (messageId) => {
    if (!editText.trim()) return;

    try {
      const response = await chatAPI.updateMessage(messageId, editText.trim());
      if (response.success) {
        setMessages(messages.map(m => 
          m.id === messageId ? response.data.message : m
        ));
        setEditingId(null);
        setEditText('');
        toast.success('Message updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const response = await chatAPI.deleteMessage(messageId);
      if (response.success) {
        setMessages(messages.map(m => 
          m.id === messageId ? { ...m, isDeleted: true, message: '[Message deleted]' } : m
        ));
        setShowDeleteConfirm(null);
        toast.success('Message deleted');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete message');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await chatAPI.deleteConversation(orderId, false);
      if (response.success) {
        setMessages(messages.map(m => ({ ...m, isDeleted: true, message: '[Message deleted]' })));
        setShowDeleteAllConfirm(false);
        toast.success(`${response.data.deletedCount} message(s) deleted`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete conversation');
    }
  };

  const startEdit = (message) => {
    setEditingId(message.id);
    setEditText(message.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Country Office': return { bg: '#DBEAFE', color: '#1D4ED8' };
      case 'Laboratory Team': return { bg: '#F3E8FF', color: '#7C3AED' };
      case 'OSL Team': return { bg: '#D1FAE5', color: '#059669' };
      case 'Super Admin': return { bg: '#FEE2E2', color: '#DC2626' };
      default: return { bg: '#E2E8F0', color: '#64748B' };
    }
  };

  const isOwnMessage = (message) => message.userId === currentUser?.id;
  const canEdit = (message) => isOwnMessage(message) && !message.isDeleted;
  const canDelete = (message) => (isOwnMessage(message) || currentUser?.role === 'Super Admin') && !message.isDeleted;
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  if (isLoading) {
    return (
      <div className="order-chat">
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="order-chat">
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-icon">💬</span>
          <h4>Order Discussion</h4>
          <span className="message-count">{messages.filter(m => !m.isDeleted).length} messages</span>
        </div>
        {isSuperAdmin && messages.length > 0 && (
          <button 
            className="btn btn-danger btn-sm"
            onClick={() => setShowDeleteAllConfirm(true)}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet</p>
            <span>Start the conversation about this order</span>
          </div>
        ) : (
          messages.map(message => {
            const roleBadge = getRoleBadgeColor(message.userRole);
            const isOwn = isOwnMessage(message);
            
            return (
              <div 
                key={message.id} 
                className={`chat-message ${isOwn ? 'own' : ''} ${message.isDeleted ? 'deleted' : ''}`}
              >
                <div className="message-header">
                  <div className="message-sender">
                    <span className="sender-name">{message.userName}</span>
                    <span 
                      className="sender-role"
                      style={{ background: roleBadge.bg, color: roleBadge.color }}
                    >
                      {message.userRole}
                    </span>
                  </div>
                  <span className="message-time">
                    {formatDateTime(message.createdAt)}
                    {message.isEdited && <span className="edited-tag">(edited)</span>}
                  </span>
                </div>
                
                {editingId === message.id ? (
                  <div className="message-edit">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                      rows={2}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(message.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="message-content">
                      {message.message}
                    </div>
                    {!message.isDeleted && (canEdit(message) || canDelete(message)) && (
                      <div className="message-actions">
                        {canEdit(message) && (
                          <button 
                            className="action-btn edit"
                            onClick={() => startEdit(message)}
                            title="Edit message"
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete(message) && (
                          <button 
                            className="action-btn delete"
                            onClick={() => setShowDeleteConfirm(message.id)}
                            title="Delete message"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {showDeleteConfirm === message.id && (
                  <div className="delete-confirm">
                    <span>Delete this message?</span>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(message.id)}
                    >
                      Yes
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows={2}
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary send-btn"
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? '...' : '➤'}
        </button>
      </form>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="delete-all-modal">
          <div className="delete-all-content">
            <h4>⚠️ Delete All Messages?</h4>
            <p>This will delete all {messages.filter(m => !m.isDeleted).length} messages in this conversation. This action cannot be undone.</p>
            <div className="delete-all-actions">
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAll}
              >
                Yes, Delete All
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteAllConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderChat;
