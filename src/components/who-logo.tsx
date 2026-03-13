// This component is kept for backward compatibility but now uses the EPR logo
export function WHOLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/images/epr-logo.png"
        alt="WHO AFRO Emergency Preparedness and Response Cluster"
        className="h-auto"
        style={{ maxHeight: "60px", width: "auto" }}
      />
    </div>
  )
}
