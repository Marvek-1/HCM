import '../styles/TimelineItem.css';

function TimelineItem({ label, date, by, tracking, completed }) {
  return (
    <div className="timeline-item">
      <div className={`timeline-marker ${completed ? 'completed' : 'pending'}`}>
        {completed && '✓'}
      </div>
      <div className="timeline-content">
        <div className={`timeline-label ${completed ? 'completed' : 'pending'}`}>
          {label}
        </div>
        {date && (
          <div className="timeline-details">
            {date} {by && `• ${by}`}
          </div>
        )}
        {tracking && (
          <div className="timeline-tracking">Tracking: {tracking}</div>
        )}
      </div>
    </div>
  );
}

export default TimelineItem;
