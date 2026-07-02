'use client'

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-6 py-2.5 rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] font-medium text-sm transition-colors shadow-sm"
    >
      Cetak PDF
    </button>
  )
}
