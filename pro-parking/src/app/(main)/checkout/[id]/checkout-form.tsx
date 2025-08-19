"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PriceTier } from "@/types";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  priceTier: PriceTier;
  customerInfo: {
    email: string;
    phone: string;
    licensePlate: string;
    licenseState: string;
  };
  clientSecret: string;
}

export function CheckoutForm({ customerInfo, priceTier }: CheckoutFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    // Use PaymentElement directly
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL or success redirect URL
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: {
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        },
      },
      // Optional: prevent automatic redirect for manual handling
      redirect: "if_required",
    });

    if (stripeError && stripeError.type !== "validation_error") {
      setError(stripeError.message ?? "Payment failed");
    } else if (paymentIntent) {
      // Payment succeeded, handle success manually if needed
      setTimeout(() => {
        router.push(`/checkout/success?session_id=${paymentIntent.id}`);
      }, 500);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Enter your card details to complete the payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <PaymentElement
              options={{
                fields: {
                  billingDetails: {
                    email: "auto",
                    address: {
                      postalCode: "auto", // 🔑 force ZIP/postal
                      country: "auto",
                      city: "auto",
                      line1: "auto",
                      line2: "never",
                      state: "auto",
                    },
                  },
                },
              }}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>Pay {formatPrice(priceTier.price)}</>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
