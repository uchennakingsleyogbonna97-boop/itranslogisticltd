import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, AlertTriangle, Clock, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Environment-based Paystack key
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_2519edc73a85391f6d988e2fca9baab6234666c';

interface ShipmentData {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  paymentAmount: number;
  paymentCurrency: string;
  recipientName: string;
  recipientEmail: string;
}

// Mock shipment database
const shipmentDatabase: Record<string, ShipmentData> = {
  'ITR78738957': {
    trackingNumber: 'ITR78738957',
    origin: 'Glasgow Airport, United Kingdom',
    destination: 'Wrocław, Poland',
    status: 'Arrived at Destination - Customs Hold',
    paymentAmount: 450,
    paymentCurrency: 'PLN',
    recipientName: 'Jan Kowalski',
    recipientEmail: 'jan.kowalski@email.com'
  },
  'ITR78738954': {
    trackingNumber: 'ITR78738954',
    origin: 'Tel Aviv (TLV), Israel',
    destination: 'Sibiu, Romania',
    status: 'Arrived at Destination - Customs Hold',
    paymentAmount: 380,
    paymentCurrency: 'RON',
    recipientName: 'Maria Popescu',
    recipientEmail: 'maria.popescu@email.com'
  },
  'ITR78738953': {
    trackingNumber: 'ITR78738953',
    origin: 'Tel Aviv (TLV), Israel',
    destination: 'Paris, France',
    status: 'Arrived at Destination - Customs Hold',
    paymentAmount: 120,
    paymentCurrency: 'EUR',
    recipientName: 'Pierre Dubois',
    recipientEmail: 'pierre.dubois@email.com'
  },
  'ITR78738955': {
    trackingNumber: 'ITR78738955',
    origin: 'Tel Aviv (TLV), Israel',
    destination: 'Romania',
    status: 'Arrived at Destination - Customs Hold',
    paymentAmount: 420,
    paymentCurrency: 'RON',
    recipientName: 'Ion Georgescu',
    recipientEmail: 'ion.georgescu@email.com'
  },
  'ITR78738952': {
    trackingNumber: 'ITR78738952',
    origin: 'Tel Aviv (TLV), Israel',
    destination: 'Texas, USA',
    status: 'Arrived at Destination - Customs Hold',
    paymentAmount: 85,
    paymentCurrency: 'USD',
    recipientName: 'John Smith',
    recipientEmail: 'john.smith@email.com'
  },
  'ITR78738951': {
    trackingNumber: 'ITR78738951',
    origin: 'Tel Aviv (TLV), Israel',
    destination: 'Senec, Slovakia',
    status: 'Arrived at Destination - Customs Hold',
    paymentAmount: 65,
    paymentCurrency: 'EUR',
    recipientName: 'Ján Novák',
    recipientEmail: 'jan.novak@email.com'
  }
};

// Load Paystack script
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('paystack-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const trackingNumber = searchParams.get('tracking') || '';

  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadPaystackScript().catch(err => console.error('Paystack load error:', err));

    if (trackingNumber) {
      const data = shipmentDatabase[trackingNumber.toUpperCase()];
      if (data) {
        setShipment(data);
        setEmail(data.recipientEmail);
        setName(data.recipientName);
      }
    }
    setLoading(false);
  }, [trackingNumber]);

  const handlePayment = async () => {
    if (!shipment) return;
    if (!email || !name) {
      toast.error('Please fill in your email and name');
      return;
    }

    setIsPaying(true);

    try {
      await loadPaystackScript();

      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: shipment.paymentAmount * 100,
        currency: shipment.paymentCurrency,
        ref: `ITR-${shipment.trackingNumber}-${Date.now()}`,
        metadata: {
          custom_fields: [
            { display_name: "Tracking Number", variable_name: "tracking_number", value: shipment.trackingNumber },
            { display_name: "Recipient Name", variable_name: "recipient_name", value: name },
            { display_name: "Phone", variable_name: "phone", value: phone },
            { display_name: "Destination", variable_name: "destination", value: shipment.destination }
          ]
        },
        callback: function(response: any) {
          setPaymentSuccess(true);
          setPaymentRef(response.reference);
          setIsPaying(false);
          toast.success('Payment successful! Your shipment will be released.');
        },
        onClose: function() {
          setIsPaying(false);
          toast.info('Payment window closed. You can try again.');
        }
      });

      handler.openIframe();
    } catch (error) {
      setIsPaying(false);
      toast.error('Failed to initialize payment. Please try again.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 animate-spin text-primary" />
          <span className="text-text-dark font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-black mb-2">Invalid Tracking Number</h1>
          <p className="text-text-light mb-6">The tracking number you provided could not be found.</p>
          <a href="#/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-black mb-2">Payment Successful!</h1>
          <p className="text-text-light mb-6">
            Your customs clearance fee has been paid successfully. Your shipment is now released for delivery.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-text-light text-sm">Tracking Number</span>
              <span className="font-medium text-black">{shipment.trackingNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-text-light text-sm">Amount Paid</span>
              <span className="font-medium text-black">{shipment.paymentAmount} {shipment.paymentCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light text-sm">Reference</span>
              <span className="font-medium text-black text-sm">{paymentRef}</span>
            </div>
          </div>

          <a 
            href="#/" 
            className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors"
          >
            <Package className="w-5 h-5" />
            Back to Tracking
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-black">
              itr<span className="text-primary">ans</span>
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-black mb-1">Complete Your Payment</h1>
          <p className="text-text-light text-sm">Pay customs clearance fee to release your shipment</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Alert Banner */}
          <div className="bg-orange-50 border-b border-orange-100 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-800 font-medium text-sm">Customs Hold</p>
                <p className="text-orange-600 text-xs mt-0.5">
                  Your shipment has arrived at {shipment.destination} and is held pending customs clearance payment.
                </p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-display font-bold text-black mb-4">Shipment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-light text-sm">Tracking Number</span>
                <span className="font-medium text-black">{shipment.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light text-sm">Origin</span>
                <span className="font-medium text-black text-right text-sm max-w-[200px]">{shipment.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light text-sm">Destination</span>
                <span className="font-medium text-black text-right text-sm max-w-[200px]">{shipment.destination}</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="p-6 border-b border-gray-100 bg-primary/5">
            <div className="text-center">
              <p className="text-text-light text-sm mb-1">Amount Due</p>
              <p className="font-display text-4xl font-bold text-primary">
                {shipment.paymentAmount} <span className="text-2xl">{shipment.paymentCurrency}</span>
              </p>
              <p className="text-text-light text-xs mt-1">Customs clearance & handling fee</p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            <h3 className="font-display font-bold text-black mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-text-dark text-sm font-medium mb-2">Full Name *</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-text-dark text-sm font-medium mb-2">Email Address *</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-text-dark text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full bg-primary hover:bg-primary-600 text-white py-6 rounded-xl font-medium text-lg mt-2"
              >
                {isPaying ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pay {shipment.paymentAmount} {shipment.paymentCurrency}
                  </span>
                )}
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 text-text-light text-xs">
              <Shield className="w-4 h-4" />
              <span>Secured by Paystack — Accepts Visa, Mastercard, Verve & AMEX</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a href="#/" className="inline-flex items-center gap-2 text-text-light hover:text-primary text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}