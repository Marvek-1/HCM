"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { EPRLogo } from "@/components/epr-logo"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Cart } from "@/components/cart"

export function MainNavigation() {
  const pathname = usePathname()
  const { cart } = useCart()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "All Items", href: "/category/all" },
    { label: "ERH Kits", href: "/erh-kits" },
    { label: "Scrolling View", href: "/scroll" },
  ]

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu)
  const closeMobileMenu = () => setShowMobileMenu(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-6">
              <EPRLogo className="h-10 w-auto" />
              <img src="/images/who-afro-logo.png" alt="WHO African Region" className="h-10 w-auto ml-3" />
              <span className="ml-3 text-lg font-medium text-[#005A9C] hidden md:block">
                WHO AFRO Nairobi Hub (OSL)
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#0093D5]/10 text-[#0093D5]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#0093D5]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#0093D5] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md z-40">
                <Cart onClose={() => {}} />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="sm" className="md:hidden ml-2" onClick={toggleMobileMenu}>
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {showMobileMenu && (
          <nav className="md:hidden mt-2 pt-2 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    pathname === link.href
                      ? "bg-[#0093D5]/10 text-[#0093D5]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#0093D5]",
                  )}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
