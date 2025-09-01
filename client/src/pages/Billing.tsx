import { useState, useEffect } from 'react'
import { useAppSelector } from '../lib/hooks'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import api from '../lib/api'

interface Invoice {
  _id: string
  orderId: string
  invoiceNumber: string
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  amount: number
  items: {
    description: string
    quantity: number
    rate: number
    amount: number
  }[]
  billingAddress: {
    name: string
    email: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  taxBreakdown: {
    subtotal: number
    cgst: number
    sgst: number
    igst: number
    total: number
  }
}

const Billing = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'list' | 'detail'>('list')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/billing/invoices')
      setInvoices(response.data.invoices || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      // Mock data for demo
      setInvoices([
        {
          _id: '1',
          orderId: 'ORD-2024-001',
          invoiceNumber: 'INV-2024-001',
          date: '2024-01-15',
          dueDate: '2024-01-30',
          status: 'paid',
          amount: 8500,
          items: [
            {
              description: 'Dior Sauvage Eau de Toilette 100ml',
              quantity: 1,
              rate: 8500,
              amount: 8500
            }
          ],
          billingAddress: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            line1: '123 Main Street',
            line2: 'Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: '+91 9876543210'
          },
          taxBreakdown: {
            subtotal: 7200,
            cgst: 650,
            sgst: 650,
            igst: 0,
            total: 8500
          }
        },
        {
          _id: '2',
          orderId: 'ORD-2024-002',
          invoiceNumber: 'INV-2024-002',
          date: '2024-01-20',
          dueDate: '2024-02-05',
          status: 'pending',
          amount: 12500,
          items: [
            {
              description: 'Chanel No. 5 Eau de Parfum 100ml',
              quantity: 1,
              rate: 10000,
              amount: 10000
            },
            {
              description: 'Tom Ford Black Orchid 50ml',
              quantity: 1,
              rate: 2500,
              amount: 2500
            }
          ],
          billingAddress: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            line1: '123 Main Street',
            line2: 'Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: '+91 9876543210'
          },
          taxBreakdown: {
            subtotal: 10593,
            cgst: 953,
            sgst: 954,
            igst: 0,
            total: 12500
          }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await api.get(`/billing/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. This feature is coming soon!')
    }
  }

  const printInvoice = () => {
    window.print()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your billing information</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (view === 'detail' && selectedInvoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                setView('list')
                setSelectedInvoice(null)
              }}
              className="text-primary-600 hover:text-primary-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Invoices
            </button>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={printInvoice}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </Button>
              <Button onClick={() => downloadInvoice(selectedInvoice._id)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </Button>
            </div>
          </div>

          {/* Invoice */}
          <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-none">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-lg text-gray-600 mt-2">#{selectedInvoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-primary-600">Scentrise</h2>
                <p className="text-gray-600">Premium Perfume Store</p>
                <p className="text-sm text-gray-500 mt-2">
                  123 Business Street<br />
                  Mumbai, Maharashtra 400001<br />
                  GSTIN: 27AAAAA0000A1Z5
                </p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Bill To</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{selectedInvoice.billingAddress.name}</p>
                  <p>{selectedInvoice.billingAddress.email}</p>
                  <p>{selectedInvoice.billingAddress.line1}</p>
                  {selectedInvoice.billingAddress.line2 && <p>{selectedInvoice.billingAddress.line2}</p>}
                  <p>{selectedInvoice.billingAddress.city}, {selectedInvoice.billingAddress.state} {selectedInvoice.billingAddress.pincode}</p>
                  <p>{selectedInvoice.billingAddress.phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Invoice Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{selectedInvoice.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="font-medium">{formatDate(selectedInvoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                      <th className="text-center py-3 text-sm font-medium text-gray-600">Qty</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Rate</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 text-gray-900">{item.description}</td>
                        <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                        <td className="py-4 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.taxBreakdown.subtotal)}</span>
                  </div>
                  {selectedInvoice.taxBreakdown.cgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CGST (9%):</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.taxBreakdown.cgst)}</span>
                    </div>
                  )}
                  {selectedInvoice.taxBreakdown.sgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SGST (9%):</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.taxBreakdown.sgst)}</span>
                    </div>
                  )}
                  {selectedInvoice.taxBreakdown.igst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IGST (18%):</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.taxBreakdown.igst)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.taxBreakdown.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>Thank you for your business!</p>
              <p className="mt-2">For any queries, contact us at support@scentrise.com or +91 99999 99999</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Invoices</h1>
          <p className="text-gray-600">Manage your invoices and billing information</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.filter(inv => inv.status === 'paid').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.filter(inv => inv.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Invoices</h2>
          </div>
          
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setView('detail')
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => downloadInvoice(invoice._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by making your first purchase</p>
              <div className="mt-6">
                <Link to="/catalog">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Billing
