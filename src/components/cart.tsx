"use client"

import { useState } from "react"
import { X, Trash2, Download, Check, FileText } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useCart } from "./../context/cart-context"
import { motion, AnimatePresence } from "framer-motion"
import { OrderRequestForm } from "../components/order-request-form"
import { CheckoutProcess } from "../components/checkout-process"

interface CartProps {
  onClose: () => void
}

export function Cart({ onClose }: CartProps) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "excel">("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0
      return total + price * item.quantity
    }, 0)
  }

  const handleExport = () => {
    // In a real application, this would generate and download the selected format
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
    }, 2000)
  }

  if (showOrderForm) {
    return <OrderRequestForm onClose={() => setShowOrderForm(false)} />
  }

  return (
    <div className="text-[#333333] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-4 py-3 border-b">
        <h2 className="text-lg md:text-xl font-medium">Your Cart</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-gray-500">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
            </div>
            <p className="text-sm md:text-base">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-3 md:p-4 rounded-lg"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex-grow w-full sm:w-auto">
                    <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-sm border-gray-300 focus:border-[#0093D5] focus:ring-[#0093D5]"
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-sm md:text-base font-medium">
                        {item.price === "$0.00"
                          ? "$0.00"
                          : `$${(Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(2)}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t bg-white p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm md:text-base">Total Cost:</span>
            <span className="text-xl md:text-2xl font-bold text-[#0093D5]">${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
              <select
                className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <motion.div
                  animate={{ opacity: isExporting ? 0 : 1, y: isExporting ? -20 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button className="w-full bg-[#0093D5] hover:bg-[#005A9C] text-white text-sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </motion.div>

                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExporting ? 1 : 0, y: isExporting ? 0 : 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm cursor-default">
                    <Check className="mr-2 h-4 w-4" /> Exported
                  </Button>
                </motion.div>
              </div>

              <Button
                className="flex-1 bg-[#FFC20E] hover:bg-[#FFD44F] text-[#333333] font-medium text-sm"
                onClick={() => setShowCheckout(true)}
              >
                <FileText className="mr-2 h-4 w-4" /> Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
      {showCheckout && <CheckoutProcess onClose={() => setShowCheckout(false)} />}
    </div>
  )
}

function ShoppingCart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
