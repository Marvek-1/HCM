"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useInventory } from "@/context/inventory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { X, Printer, Save, FileSpreadsheet, Plus, Minus } from "lucide-react"
import { format } from "date-fns"
import { EPRLogo } from "@/components/epr-logo"

interface OrderRequestFormProps {
  onClose: () => void
}

interface OrderItem {
  id: number
  name: string
  description: string
  price: string
  category: string
  quantity: number
  detailedDescription?: string
  image?: string
}

interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "date" | "select" | "number"
  required?: boolean
  options?: string[]
  placeholder?: string
  rows?: number
}

interface FormSection {
  id: string
  title: string
  fields: FormField[]
  required?: boolean
}

const FORM_SECTIONS: FormSection[] = [
  {
    id: "basic",
    title: "Basic Information",
    required: true,
    fields: [
      {
        id: "yourRef",
        label: "Your Reference",
        type: "text",
        required: true,
        placeholder: "Enter your reference number",
      },
      {
        id: "description",
        label: "Order Description",
        type: "textarea",
        required: true,
        placeholder: "Enter general description of this order request",
        rows: 3,
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: [
          "Emergency Health Kits",
          "Biomedical Equipment",
          "PPE",
          "Vehicles",
          "Cold Chain Equipment",
          "Field Support Materials",
          "Biomedical Consumables",
        ],
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping Information",
    required: true,
    fields: [
      {
        id: "fromInitiator",
        label: "From (Initiator)",
        type: "text",
        required: true,
        placeholder: "Enter initiator name/organization",
      },
      {
        id: "shippingAddress",
        label: "Shipping Address",
        type: "textarea",
        required: true,
        placeholder: "Enter complete shipping address",
        rows: 3,
      },
      {
        id: "to",
        label: "To (Recipient)",
        type: "text",
        required: true,
        placeholder: "Enter recipient name/organization",
      },
      {
        id: "consigneeAddress",
        label: "Consignee Address",
        type: "textarea",
        required: true,
        placeholder: "Enter complete consignee address",
        rows: 3,
      },
      {
        id: "modeOfShipment",
        label: "Mode of Shipment",
        type: "select",
        required: true,
        options: ["AIR", "SEA", "LAND"],
      },
    ],
  },
  {
    id: "administrative",
    title: "Administrative Details",
    fields: [
      { id: "pteao", label: "PTEAO", type: "text", placeholder: "Enter PTEAO number" },
      { id: "requesterRef", label: "Requester Reference", type: "text", placeholder: "Enter requester reference" },
      { id: "dateSent", label: "Date Sent", type: "date", required: true },
      { id: "requestedDelDate", label: "Requested Delivery Date", type: "date" },
      { id: "confDeliveryDate", label: "Confirmed Delivery Date", type: "date" },
    ],
  },
  {
    id: "additional",
    title: "Additional Information",
    fields: [
      {
        id: "remarks",
        label: "Remarks",
        type: "textarea",
        placeholder: "Enter any additional remarks or special instructions",
        rows: 4,
      },
      { id: "urgencyLevel", label: "Urgency Level", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      {
        id: "specialHandling",
        label: "Special Handling Requirements",
        type: "textarea",
        placeholder: "Enter any special handling requirements",
        rows: 2,
      },
    ],
  },
]

export function OrderRequestForm({ onClose }: OrderRequestFormProps) {
  const { cart } = useCart()
  const { inventory } = useInventory()
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)

  const today = format(new Date(), "yyyy-MM-dd")

  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    cart.map((item) => ({
      ...item,
      detailedDescription: item.description || "",
    })),
  )

  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [itemDescription, setItemDescription] = useState("")
  const [showItemSearch, setShowItemSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const [itemQuantity, setItemQuantity] = useState(1)
  const [currentTab, setCurrentTab] = useState("form")
  const [activeSections, setActiveSections] = useState<string[]>(["basic", "shipping"])

  const [formData, setFormData] = useState({
    yourRef: "",
    description: "",
    fromInitiator: "",
    shippingAddress: "",
    pteao: "",
    requesterRef: "",
    modeOfShipment: "AIR",
    category: "",
    dateSent: today,
    requestedDelDate: "",
    confDeliveryDate: "",
    to: "",
    consigneeAddress: "",
    remarks: "",
    urgencyLevel: "",
    specialHandling: "",
    nbOfLines: orderItems.length.toString(),
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      nbOfLines: orderItems.length.toString(),
    }))
  }, [orderItems.length])

  const updateFormField = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0
      return total + price * item.quantity
    }, 0)
  }

  const handlePrint = () => {
    window.print()
  }

  const saveOrder = () => {
    alert("Order saved successfully!")
  }

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx")
      const workbook = XLSX.utils.book_new()

      const exportData = []

      exportData.push(["WHO Inventory Catalog - Order Request Form"])
      exportData.push(["Generated on:", new Date().toLocaleString()])
      exportData.push([])

      FORM_SECTIONS.forEach((section) => {
        if (activeSections.includes(section.id)) {
          exportData.push([section.title])
          section.fields.forEach((field) => {
            const value = formData[field.id as keyof typeof formData] || ""
            exportData.push([field.label, value])
          })
          exportData.push([])
        }
      })

      exportData.push(["ORDER ITEMS"])
      exportData.push(["#", "Item Name", "Description", "Category", "Quantity", "Unit Price", "Total Price"])

      orderItems.forEach((item, index) => {
        const unitPrice = Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0
        const totalPrice = unitPrice * item.quantity
        exportData.push([
          index + 1,
          item.name,
          item.detailedDescription || item.description,
          item.category,
          item.quantity,
          `$${unitPrice.toFixed(2)}`,
          `$${totalPrice.toFixed(2)}`,
        ])
      })

      exportData.push([])
      exportData.push(["", "", "", "", "", "TOTAL:", `$${calculateOrderTotal().toFixed(2)}`])

      const worksheet = XLSX.utils.aoa_to_sheet(exportData)

      worksheet["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }]

      XLSX.utils.book_append_sheet(workbook, worksheet, "Order Request")

      const filename = `WHO_Order_Request_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`

      // Use the correct method for browser environment
      XLSX.writeFile(workbook, filename)

      alert("Order exported to Excel successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    }
  }

  const toggleSection = (sectionId: string) => {
    setActiveSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const updateItemQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setOrderItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setOrderItems((items) => items.filter((item) => item.id !== id))
  }

  const searchResults = inventory.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  })

  const addItemToOrder = () => {
    if (!selectedItem) return

    const existingItem = orderItems.find((item) => item.id === selectedItem.id)

    if (existingItem) {
      setOrderItems((items) =>
        items.map((item) => (item.id === selectedItem.id ? { ...item, quantity: item.quantity + itemQuantity } : item)),
      )
    } else {
      setOrderItems((items) => [
        ...items,
        {
          ...selectedItem,
          quantity: itemQuantity,
          detailedDescription: selectedItem.description || "",
        },
      ])
    }

    setShowItemSearch(false)
    setSearchQuery("")
    setSelectedItem(null)
    setItemQuantity(1)
  }

  const renderFormField = (field: FormField) => {
    const fieldId = field.id
    const value = formData[fieldId as keyof typeof formData] || ""

    return (
      <div key={fieldId} className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {field.type === "text" && (
          <Input
            id={fieldId}
            value={value}
            onChange={(e) => updateFormField(fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full focus:border-[#0093D5] focus:ring-[#0093D5]"
          />
        )}

        {field.type === "textarea" && (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => updateFormField(fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 3}
            className="w-full resize-none focus:border-[#0093D5] focus:ring-[#0093D5]"
          />
        )}

        {field.type === "date" && (
          <Input
            id={fieldId}
            type="date"
            value={value}
            onChange={(e) => updateFormField(fieldId, e.target.value)}
            required={field.required}
            className="w-full focus:border-[#0093D5] focus:ring-[#0093D5]"
          />
        )}

        {field.type === "number" && (
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => updateFormField(fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full focus:border-[#0093D5] focus:ring-[#0093D5]"
          />
        )}

        {field.type === "select" && field.options && (
          <Select value={value} onValueChange={(val) => updateFormField(fieldId, val)}>
            <SelectTrigger className="w-full focus:border-[#0093D5] focus:ring-[#0093D5]">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
        ref={formRef}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-[#0093D5] to-[#005A9C] text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded">
              <EPRLogo />
            </div>
            <h2 className="text-2xl font-semibold">Enhanced Order Request Form</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={saveOrder}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportToExcel}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export XLSX
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10 text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 m-4 print:hidden">
              <TabsTrigger value="form">Form Builder</TabsTrigger>
              <TabsTrigger value="items">Items ({orderItems.length})</TabsTrigger>
              <TabsTrigger value="preview">Preview & Export</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0093D5]">Select Form Sections</CardTitle>
                  <p className="text-sm text-gray-600">Choose which sections to include in your order request form</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FORM_SECTIONS.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={section.id}
                          checked={activeSections.includes(section.id)}
                          onChange={() => toggleSection(section.id)}
                          className="h-4 w-4 text-[#0093D5] focus:ring-[#0093D5] border-gray-300 rounded"
                        />
                        <label htmlFor={section.id} className="flex-1 cursor-pointer">
                          <div className="font-medium text-gray-900">{section.title}</div>
                          <div className="text-sm text-gray-500">{section.fields.length} fields</div>
                          {section.required && <span className="text-xs text-red-500">Required</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {FORM_SECTIONS.filter((section) => activeSections.includes(section.id)).map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="text-lg text-[#0093D5] flex items-center gap-2">
                        {section.title}
                        {section.required && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.fields.map((field) => renderFormField(field))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="items" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0093D5] flex items-center justify-between">
                    Order Items ({orderItems.length})
                    <Button onClick={() => setShowItemSearch(true)} className="bg-[#0093D5] hover:bg-[#005A9C]">
                      <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showItemSearch && (
                    <Card className="mb-6 border-[#0093D5]/20">
                      <CardHeader>
                        <CardTitle className="text-base">Add New Item</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-3">
                            <Label>Search Item</Label>
                            <Input
                              placeholder="Search by name, description or category"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="focus:border-[#0093D5] focus:ring-[#0093D5]"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={itemQuantity}
                              onChange={(e) => setItemQuantity(Number.parseInt(e.target.value) || 1)}
                              className="focus:border-[#0093D5] focus:ring-[#0093D5]"
                            />
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                          {searchResults.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No items found</div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {searchResults.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                    selectedItem?.id === item.id ? "bg-[#0093D5]/10" : ""
                                  }`}
                                  onClick={() => setSelectedItem(item)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                                      <p className="text-sm text-gray-500">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium text-gray-900">{item.price}</div>
                                      <input
                                        type="radio"
                                        checked={selectedItem?.id === item.id}
                                        onChange={() => setSelectedItem(item)}
                                        className="h-4 w-4 text-[#0093D5] focus:ring-[#0093D5] border-gray-300"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowItemSearch(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={addItemToOrder}
                            disabled={!selectedItem}
                            className="bg-[#0093D5] hover:bg-[#005A9C]"
                          >
                            Add to Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items in order. Click "Add Item" to add items.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderItems.map((item) => (
                        <Card key={item.id} className="border-l-4 border-l-[#0093D5]">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <div className="md:col-span-2">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.category}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-600">{item.detailedDescription || item.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Unit: {item.price}</div>
                                  <div className="font-medium">
                                    Total: $
                                    {(Number.parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(
                                      2,
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Card className="bg-[#0093D5]/5">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-900">Total Order Value:</span>
                            <span className="text-xl font-bold text-[#0093D5]">
                              ${calculateOrderTotal().toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0093D5]">Order Request Preview</CardTitle>
                  <p className="text-sm text-gray-600">Review your order request before submitting</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {FORM_SECTIONS.filter((section) => activeSections.includes(section.id)).map((section) => (
                    <div key={section.id}>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{section.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {section.fields.map((field) => {
                          const value = formData[field.id as keyof typeof formData] || ""
                          return (
                            <div key={field.id} className="bg-gray-50 p-3 rounded">
                              <div className="text-sm font-medium text-gray-700">{field.label}:</div>
                              <div className="text-gray-900">{value || "Not specified"}</div>
                            </div>
                          )
                        })}
                      </div>
                      <Separator />
                    </div>
                  ))}

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items Summary</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-600 mb-2">Total Items: {orderItems.length}</div>
                      <div className="text-lg font-medium text-[#0093D5]">
                        Total Value: ${calculateOrderTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={exportToExcel} className="bg-[#0093D5] hover:bg-[#005A9C]">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export to Excel
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Form
                    </Button>
                    <Button variant="outline" onClick={saveOrder}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
