import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import '../styles/DraftsView.css';

function DraftsView({ onEditDraft, onRefresh }) {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.getDrafts();
      if (response.success) {
        setDrafts(response.data.drafts || []);
      }
    } catch (err) {
      toast.error('Failed to load drafts');
      console.error('Failed to fetch drafts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await ordersAPI.deleteDraft(id);
      if (response.success) {
        toast.success('Draft deleted');
        fetchDrafts();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete draft');
    }
  };

  const handleEdit = async (draft) => {
    try {
      // Fetch full draft details
      const response = await ordersAPI.getDraftById(draft.id);
      if (response.success) {
        onEditDraft(response.data.draft);
      }
    } catch (err) {
      toast.error('Failed to load draft');
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { background: '#FEE2E2', color: '#DC2626' };
      case 'Medium':
        return { background: '#FEF3C7', color: '#D97706' };
      case 'Low':
        return { background: '#D1FAE5', color: '#059669' };
      default:
        return { background: '#E2E8F0', color: '#64748B' };
    }
  };

  if (isLoading) {
    return (
      <div className="drafts-view">
        <div className="drafts-loading">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="drafts-view">
      <div className="drafts-header">
        <div className="drafts-title-section">
          <h2 className="drafts-title">📝 Saved Drafts</h2>
          <p className="drafts-subtitle">Continue working on your saved orders</p>
        </div>
        <button onClick={fetchDrafts} className="btn btn-secondary">
          ↻ Refresh
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="no-drafts">
          <div className="no-drafts-icon">📋</div>
          <h3>No Saved Drafts</h3>
          <p>When you save an order as draft, it will appear here so you can continue later.</p>
        </div>
      ) : (
        <div className="drafts-list">
          {drafts.map(draft => (
            <div key={draft.id} className="draft-card">
              <div className="draft-header">
                <span className="draft-number">{draft.orderNumber}</span>
                <span className="priority-badge" style={getPriorityStyle(draft.priority)}>
                  {draft.priority}
                </span>
              </div>

              <div className="draft-details">
                {draft.country && (
                  <div className="draft-info-row">
                    <span className="info-label">Country:</span>
                    <span className="info-value">{draft.country}</span>
                  </div>
                )}
                <div className="draft-info-row">
                  <span className="info-label">Items:</span>
                  <span className="info-value">{draft.itemCount} item{draft.itemCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="draft-info-row">
                  <span className="info-label">Est. Value:</span>
                  <span className="info-value">${draft.totalValue.toFixed(2)}</span>
                </div>
                {draft.interventionType && (
                  <div className="draft-info-row">
                    <span className="info-label">Intervention:</span>
                    <span className="info-value">{draft.interventionType}</span>
                  </div>
                )}
                {draft.pateoRef && (
                  <div className="draft-info-row">
                    <span className="info-label">PATEO Ref:</span>
                    <span className="info-value">{draft.pateoRef}</span>
                  </div>
                )}
              </div>

              {draft.notes && (
                <div className="draft-notes">
                  <span className="notes-label">Notes:</span>
                  <span className="notes-text">{draft.notes.substring(0, 100)}{draft.notes.length > 100 ? '...' : ''}</span>
                </div>
              )}

              <div className="draft-footer">
                <div className="draft-timestamp">
                  <span className="timestamp-label">Last saved:</span>
                  <span className="timestamp-value">
                    {formatDateTime(draft.draftUpdatedAt || draft.createdAt)}
                  </span>
                </div>
                <div className="draft-actions">
                  <button
                    onClick={() => handleEdit(draft)}
                    className="btn btn-primary btn-sm"
                  >
                    ✏️ Continue Editing
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="btn btn-danger btn-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="drafts-info">
        <div className="info-icon">💡</div>
        <p>
          Drafts are automatically saved with your progress. You can continue editing anytime 
          before submitting. Once submitted, the order cannot be converted back to a draft.
        </p>
      </div>
    </div>
  );
}

export default DraftsView;
