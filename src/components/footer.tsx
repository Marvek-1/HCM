import { Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#005A9C] text-white">
      {/* News ticker */}
      <div className="bg-[#0093D5] py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-4">⚠️ Emergency Response Coordination Active for East Africa Region</span>
          <span className="mx-4">📦 New medical supplies available in Nairobi Hub</span>
          <span className="mx-4">🚨 Updated Emergency Health Kits now in stock</span>
          <span className="mx-4">📋 Submit order requests 72 hours in advance for priority processing</span>
          <span className="mx-4">🔔 Contact the emergency hotline for urgent requests</span>
        </div>
      </div>

      {/* Contact information */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between text-xs">
          <div className="flex items-center gap-x-6 gap-y-1 flex-wrap">
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span className="font-bold text-[#FFC20E]">General:</span>
              <Link href="mailto:afroslsupply@who.int" className="ml-1 hover:underline">
                afroslsupply@who.int
              </Link>
              ,
              <Link href="mailto:nbohubsupplystaff@who.int" className="ml-1 hover:underline">
                nbohubsupplystaff@who.int
              </Link>
            </div>

            <div className="flex items-center">
              <span className="font-bold text-[#FFC20E]">Staff:</span>
              <span className="ml-1">Fatima TAFIDA (Supply Chain Chief):</span>
              <Link href="mailto:tafidaf@who.int" className="ml-1 hover:underline">
                tafidaf@who.int
              </Link>
            </div>

            <div className="flex items-center">
              <span>Carla MENDIZABAL (Operation Officer):</span>
              <Link href="mailto:mendizabalc@who.int" className="ml-1 hover:underline">
                mendizabalc@who.int
              </Link>
            </div>

            <div className="flex items-center">
              <span>Miquel SERRA SOLER (Supply Officer):</span>
              <Link href="mailto:serram@who.int" className="ml-1 hover:underline">
                serram@who.int
              </Link>
            </div>

            <div className="flex items-center">
              <span>Lucy WAINAINA:</span>
              <Link href="mailto:wainainal@who.int" className="ml-1 hover:underline">
                wainainal@who.int
              </Link>
            </div>
          </div>

          <div className="text-xs mt-2 md:mt-0">
            © {new Date().getFullYear()} WHO AFRO Emergency Preparedness and Response
          </div>
        </div>
      </div>
    </footer>
  )
}
