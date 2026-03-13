export function HotTips() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h3 className="mb-2 text-lg font-semibold text-amber-800">Hot Tips for Emergency Inventory</h3>
      <ul className="space-y-2 text-sm text-amber-700">
        <li className="flex items-start">
          <span className="mr-2 text-amber-600">•</span>
          <span>For items marked "Low Stock", consider ordering replacements at least 4-6 weeks in advance.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-amber-600">•</span>
          <span>Cold Chain Equipment should be checked monthly for proper temperature regulation.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-amber-600">•</span>
          <span>PPE items have a shelf life - check expiration dates quarterly.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-amber-600">•</span>
          <span>Emergency Health Kits should be inspected every 3 months for completeness.</span>
        </li>
      </ul>
    </div>
  )
}
