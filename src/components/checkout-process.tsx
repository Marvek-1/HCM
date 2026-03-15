"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { Truck, MapPin, User, CheckCircle, ArrowLeft, ArrowRight, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CheckoutProcessProps {
  onClose: () => void
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  shippingMethod: "standard" | "express" | "overnight"
  specialInstructions: string
}

interface OrderSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export function CheckoutProcess({ onClose }: CheckoutProcessProps) {
  const { cart, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    shippingMethod: "standard",
    specialInstructions: "",
  })

  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0
      return total + price * item.quantity
    }, 0)

    const shippingCosts = {
      standard: 0,
      express: 25,
      overnight: 50,
    }

    const shipping = shippingCosts[shippingInfo.shippingMethod]
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + shipping + tax

    return { subtotal, shipping, tax, total }
  }

  const orderSummary = calculateOrderSummary()

  const updateShippingInfo = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Shipping Information
        return !!(
          shippingInfo.firstName &&
          shippingInfo.lastName &&
          shippingInfo.email &&
          shippingInfo.address &&
          shippingInfo.city &&
          shippingInfo.zipCode
        )
      case 2: // Review
        return cart.length > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const processOrder = async () => {
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const orderNum = `WHO-${Date.now().toString().slice(-6)}`
    setOrderNumber(orderNum)
    setOrderComplete(true)
    setIsProcessing(false)
    clearCart()
  }

  const steps = [
    { number: 1, title: "Shipping", icon: Truck },
    { number: 2, title: "Review", icon: Package },
    { number: 3, title: "Complete", icon: CheckCircle },
  ]

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h2>
          <p className="text-gray-600 mb-4">Your order has been successfully submitted.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-lg font-bold text-[#0093D5]">{orderNumber}</p>
          </div>
          <Button onClick={onClose} className="w-full bg-[#0093D5] hover:bg-[#005A9C]">
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0093D5] to-[#005A9C] text-white p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Checkout</h2>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">
              ×
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-white text-[#0093D5] border-white"
                      : "border-white/50 text-white/50"
                  }`}
                >
                  <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="ml-2 text-sm sm:text-base font-medium hidden sm:inline">{step.title}</span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      currentStep > step.number ? "bg-white" : "bg-white/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={shippingInfo.firstName}
                              onChange={(e) => updateShippingInfo("firstName", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={shippingInfo.lastName}
                              onChange={(e) => updateShippingInfo("lastName", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={shippingInfo.email}
                            onChange={(e) => updateShippingInfo("email", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={shippingInfo.phone}
                              onChange={(e) => updateShippingInfo("phone", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="organization">Organization</Label>
                            <Input
                              id="organization"
                              value={shippingInfo.organization}
                              onChange={(e) => updateShippingInfo("organization", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Shipping Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="address">Address *</Label>
                          <Input
                            id="address"
                            value={shippingInfo.address}
                            onChange={(e) => updateShippingInfo("address", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={shippingInfo.city}
                              onChange={(e) => updateShippingInfo("city", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={shippingInfo.state}
                              onChange={(e) => updateShippingInfo("state", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP Code *</Label>
                            <Input
                              id="zipCode"
                              value={shippingInfo.zipCode}
                              onChange={(e) => updateShippingInfo("zipCode", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-5 w-5" />
                          Shipping Method
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { value: "standard", label: "Standard Shipping", time: "5-7 business days", cost: "Free" },
                          { value: "express", label: "Express Shipping", time: "2-3 business days", cost: "$25.00" },
                          { value: "overnight", label: "Overnight Shipping", time: "1 business day", cost: "$50.00" },
                        ].map((method) => (
                          <div
                            key={method.value}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              shippingInfo.shippingMethod === method.value
                                ? "border-[#0093D5] bg-[#0093D5]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => updateShippingInfo("shippingMethod", method.value as any)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{method.label}</div>
                                <div className="text-sm text-gray-600">{method.time}</div>
                              </div>
                              <div className="font-medium">{method.cost}</div>
                            </div>
                          </div>
                        ))}

                        <div>
                          <Label htmlFor="specialInstructions">Special Instructions</Label>
                          <Textarea
                            id="specialInstructions"
                            value={shippingInfo.specialInstructions}
                            onChange={(e) => updateShippingInfo("specialInstructions", e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Summary Sidebar */}
                  <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="flex-1 truncate">
                                {item.name} × {item.quantity}
                              </span>
                              <span>
                                ${(Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${orderSummary.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{orderSummary.shipping === 0 ? "Free" : `$${orderSummary.shipping.toFixed(2)}`}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>${orderSummary.tax.toFixed(2)}</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${orderSummary.total.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Review Your Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                                <img
                                  src={`/placeholder.svg?height=64&width=64`}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.category}</p>
                                <p className="text-sm">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  $
                                  {(Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Contact</p>
                            <p>
                              {shippingInfo.firstName} {shippingInfo.lastName}
                            </p>
                            <p>{shippingInfo.email}</p>
                            {shippingInfo.phone && <p>{shippingInfo.phone}</p>}
                          </div>
                          <div>
                            <p className="font-medium">Address</p>
                            <p>{shippingInfo.address}</p>
                            <p>
                              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${orderSummary.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{orderSummary.shipping === 0 ? "Free" : `$${orderSummary.shipping.toFixed(2)}`}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>${orderSummary.tax.toFixed(2)}</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${orderSummary.total.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {currentStep < 2 ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="bg-[#0093D5] hover:bg-[#005A9C] flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={processOrder}
                  disabled={isProcessing}
                  className="bg-[#0093D5] hover:bg-[#005A9C] flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
