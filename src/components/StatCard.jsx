import '../styles/StatCard.css';

function StatCard({ label, value, color, highlight }) {
  return (
    <div 
      className={`stat-card ${highlight ? 'highlight' : ''}`}
      style={{ '--stat-color': color }}
    >
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export default StatCard;
