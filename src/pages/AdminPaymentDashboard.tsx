import { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Download, CheckCircle, 
  XCircle, Clock, Package, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PaymentRecord {
  reference: string;
  trackingNumber: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  destination: string;
  origin: string;
  createdAt: string;
  paidAt?: string;
  paystackRef?: string;
}

const mockPayments: PaymentRecord[] = [
  {
    reference: 'ITR-ITR78738957-1721234567890',
    trackingNumber: 'ITR78738957',
    recipientName: 'Jan Kowalski',
    recipientEmail: 'jan.kowalski@email.com',
    recipientPhone: '+48 123 456 789',
    amount: 450,
    currency: 'PLN',
    status: 'paid',
    destination: 'Wrocław, Poland',
    origin: 'Glasgow Airport, UK',
    createdAt: '2026-07-15T10:30:00Z',
    paidAt: '2026-07-15T10:35:22Z',
    paystackRef: 'TRX_abc123xyz'
  },
  {
    reference: 'ITR-ITR78738954-1721234600000',
    trackingNumber: 'ITR78738954',
    recipientName: 'Maria Popescu',
    recipientEmail: 'maria.popescu@email.com',
    recipientPhone: '+40 123 456 789',
    amount: 380,
    currency: 'RON',
    status: 'paid',
    destination: 'Sibiu, Romania',
    origin: 'Tel Aviv, Israel',
    createdAt: '2026-07-15T11:00:00Z',
    paidAt: '2026-07-15T11:05:15Z',
    paystackRef: 'TRX_def456uvw'
  },
  {
    reference: 'ITR-ITR78738953-1721234700000',
    trackingNumber: 'ITR78738953',
    recipientName: 'Pierre Dubois',
    recipientEmail: 'pierre.dubois@email.com',
    recipientPhone: '+33 1 23 45 67 89',
    amount: 120,
    currency: 'EUR',
    status: 'pending',
    destination: 'Paris, France',
    origin: 'Tel Aviv, Israel',
    createdAt: '2026-07-15T12:00:00Z'
  },
  {
    reference: 'ITR-ITR78738955-1721234800000',
    trackingNumber: 'ITR78738955',
    recipientName: 'Ion Georgescu',
    recipientEmail: 'ion.georgescu@email.com',
    recipientPhone: '+40 123 456 789',
    amount: 420,
    currency: 'RON',
    status: 'failed',
    destination: 'Romania',
    origin: 'Tel Aviv, Israel',
    createdAt: '2026-07-15T13:00:00Z'
  },
  {
    reference: 'ITR-ITR78738952-1721234900000',
    trackingNumber: 'ITR78738952',
    recipientName: 'John Smith',
    recipientEmail: 'john.smith@email.com',
    recipientPhone: '+1 512 345 6789',
    amount: 85,
    currency: 'USD',
    status: 'paid',
    destination: 'Texas, USA',
    origin: 'Tel Aviv, Israel',
    createdAt: '2026-07-15T14:00:00Z',
    paidAt: '2026-07-15T14:03:45Z',
    paystackRef: 'TRX_ghi789rst'
  }
];

export default function AdminPaymentDashboard() {
  const [payments] = useState<PaymentRecord[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidCount = payments.filter(p => p.status === 'paid').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;
  const totalCount = payments.length;

  useEffect(() => {
    let filtered = [...payments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.trackingNumber.toLowerCase().includes(query) ||
        p.recipientName.toLowerCase().includes(query) ||
        p.recipientEmail.toLowerCase().includes(query) ||
        p.destination.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.createdAt);
        switch (dateFilter) {
          case 'today':
            return paymentDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return paymentDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return paymentDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchQuery, statusFilter, dateFilter]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Payments refreshed');
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Reference', 'Tracking', 'Name', 'Email', 'Amount', 'Currency', 'Status', 'Destination', 'Date'];
    const rows = filteredPayments.map(p => [
      p.reference,
      p.trackingNumber,
      p.recipientName,
      p.recipientEmail,
      p.amount,
      p.currency,
      p.status,
      p.destination,
      new Date(p.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Payments exported to CSV');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="#/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-xl font-bold">
                  itr<span className="text-primary">ans</span>
                </span>
              </a>
              <span className="text-gray-300">|</span>
              <h1 className="font-display text-lg font-semibold text-gray-800">Payment Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                onClick={fetchPayments} 
                disabled={isLoading}
              >
                <Clock className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Total Revenue</span>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Multiple currencies</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Paid</span>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-green-600">{paidCount}</div>
            <div className="text-xs text-gray-400 mt-1">{((paidCount / totalCount) * 100).toFixed(0)}% success rate</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Pending</span>
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-gray-400 mt-1">Awaiting payment</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Failed</span>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-xs text-gray-400 mt-1">Requires follow-up</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by tracking number, name, email, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No payments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.reference} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{payment.trackingNumber}</div>
                        <div className="text-xs text-gray-400">{payment.reference.slice(-12)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{payment.recipientName}</div>
                        <div className="text-xs text-gray-400">{payment.recipientEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{payment.destination}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-display font-bold text-gray-900">
                          {payment.amount} <span className="text-sm font-normal text-gray-500">{payment.currency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {filteredPayments.length} of {payments.length} payments
            </span>
          </div>
        </div>
      </div>

      {/* Payment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Payment Details</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {selectedPayment.amount} {selectedPayment.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Reference</span>
                  <span className="text-sm font-mono text-gray-700">{selectedPayment.reference}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Tracking Number</span>
                  <span className="text-sm font-medium text-gray-700">{selectedPayment.trackingNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Recipient</span>
                  <span className="text-sm text-gray-700">{selectedPayment.recipientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Email</span>
                  <span className="text-sm text-gray-700">{selectedPayment.recipientEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="text-sm text-gray-700">{selectedPayment.recipientPhone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Origin</span>
                  <span className="text-sm text-gray-700">{selectedPayment.origin}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Destination</span>
                  <span className="text-sm text-gray-700">{selectedPayment.destination}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Created</span>
                  <span className="text-sm text-gray-700">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                </div>
                {selectedPayment.paidAt && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Paid At</span>
                    <span className="text-sm text-gray-700">{new Date(selectedPayment.paidAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedPayment.paystackRef && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500 text-sm">Paystack Ref</span>
                    <span className="text-sm font-mono text-gray-700">{selectedPayment.paystackRef}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 h-10 px-4 py-2 flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPayment.reference);
                    toast.success('Reference copied');
                  }}
                >
                  Copy Reference
                </button>
                {selectedPayment.status === 'pending' && (
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2 flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Send Reminder
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}