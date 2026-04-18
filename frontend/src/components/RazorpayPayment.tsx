'use client';

import React, { useState } from 'react';

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
  orderId?: string; // Optional, can be fetched if not provided
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ 
  amount, 
  onSuccess, 
  onFailure, 
  buttonText = 'Pay Now',
  className = '',
  orderId: providedOrderId
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create Order in Backend
      const orderRes = await fetch('http://localhost:5000/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const orderData = await orderRes.json();

      if (!orderData.id) {
        throw new Error('Failed to create Razorpay order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID', // Use public key from env
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SegriFy",
        description: "Waste Management Service Payment",
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment in Backend
          const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            onSuccess(verifyData);
          } else {
            if (onFailure) onFailure(verifyData);
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#5C5D47", // Matching SegriFy brand primary color
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      if (onFailure) onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className={className}
    >
      {loading ? 'Initializing...' : buttonText}
    </button>
  );
};

export default RazorpayPayment;
