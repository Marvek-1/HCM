export function EPRLogo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/images/epr-logo.png"
        alt="WHO AFRO Emergency Preparedness and Response Cluster"
        className={`h-auto ${inverted ? "invert" : ""}`}
        style={{ maxHeight: "60px", width: "auto" }}
      />
    </div>
  )
}
