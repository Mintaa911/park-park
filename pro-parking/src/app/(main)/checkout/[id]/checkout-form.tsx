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
import { useRecaptcha } from "@/hooks/useRecaptcha";


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
  const { getToken } = useRecaptcha();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 🔹 Get reCAPTCHA token (checkout_submit action)
      const recaptchaToken = await getToken("checkout_submit");

      if (!recaptchaToken) {
        setError("Failed to verify security check");
        setLoading(false);
        return;
      }

      // 🔹 Send token to your backend for verification
      const verifyRes = await fetch("/api/recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken, action: "checkout_submit" }),
      });

      const { success, score } = await verifyRes.json();
      console.log(success, score)
      if (!success || score < 0.9) {
        setError("Suspicious activity detected, please try again.");
        setLoading(false);
        return;
      }


      // 🔹 Now confirm payment only after reCAPTCHA passes
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        },
        redirect: "if_required",
      });

      if (stripeError && stripeError.type !== "validation_error") {
        setError(stripeError.message ?? "Payment failed");
      } else if (paymentIntent) {
        setTimeout(() => {
          router.push(`/checkout/success?session_id=${paymentIntent.id}`);
        }, 500);
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);

  };

  return (
    <Card>
      <CardHeader className="z-1">
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
          type="button"
          onClick={handleSubmit}
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
  );
}
