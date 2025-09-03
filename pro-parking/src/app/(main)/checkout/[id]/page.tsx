"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, ArrowRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./checkout-form";
import { formatCurrency, formatPhone, formatTime, validateLicense, validatePhone } from "@/lib/utils";

import { STATES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ParkingLot, PriceTier } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRecaptcha } from "@/hooks/useRecaptcha";

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const checkoutSchema = z.
  object({
    email: z.email("Invalid email address"),
    phone: z
      .string()
      .refine(validatePhone, {
        message: "Phone number must be 10 digits.",
      }),
    licensePlate: z
      .string()
      .min(2, "License plate must be at least 2 characters")
      .max(10, "License plate must be at most 10 characters")
      .refine(validateLicense, {
        message:
          "License plate must be 1–10 characters and can only contain letters, numbers, hyphens, or spaces.",
      }),
    licenseState: z.string().min(2, "Please select a state"),
  })

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lotId = params.id as string;
  const scheduleId = searchParams.get("scheduleId") as string;
  const priceTierId = searchParams.get("priceTierId") as string;
  const { getToken } = useRecaptcha();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      phone: "",
      licensePlate: "",
      licenseState: STATES[0].code,
    },
  });

  const [clientSecret, setClientSecret] = useState<string>("");

  const {
    data: priceTier,
    isLoading: priceTierLoading,
    error: priceTierError,
  } = useQuery({
    queryKey: ["priceTier"],
    queryFn: async (): Promise<PriceTier> => {
      const res = await fetch(`/api/price-tiers?id=${priceTierId}`);
      if (!res.ok) throw new Error("Error fetching price tier");
      return res.json();
    },
  });

  const { data: lot } = useQuery({
    queryKey: ["lots"],
    queryFn: async (): Promise<ParkingLot> => {
      const res = await fetch(`/api/lots?id=${lotId}`);
      if (!res.ok) throw new Error("Error fetching lot");
      return res.json();
    },
  });

  const { data: timeData } = useQuery({
    queryKey: ['time'],
    queryFn: async (): Promise<string> => {
      const res = await fetch(`/api/time`)
      if (!res.ok) throw new Error('Error fetching time')
      return res.json()
    }
  });

  const createPaymentIntent = async () => {
    if (!priceTier || !lot) return;
    try {

      const token = await getToken("create_payment_intent");
      if (!token) return;

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedule: {
            scheduleId: scheduleId,
            tierId: priceTier.price_id,
          },
          lot: {
            lotId: lotId,
            location: lot.location,
            name: lot.name,
          },
          customerInfo: form.getValues(),
          recaptchaToken: token,
        }),
      });

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error("Payment intent error:", error);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  if (priceTierLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading checkout information...
          </p>
        </div>
      </div>
    );
  }

  if (priceTierError || !priceTier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">
            {"Invalid checkout information"}
          </p>
          <Button
            onClick={() => router.back()}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
        <div className="mb-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parking Lot
          </Button>
        </div>

        <div className="flex flex-col gap-4 px-6 h-full">
          <div
            key={priceTier.price_id}
            className={`space-y-2 border p-4 rounded-lg cursor-pointer transition-all duration-200 border-primary bg-primary/5 shadow-md`}
          >
            <div className="flex justify-between w-full">
              <p className="font-semibold flex items-center gap-1">
                {priceTier.maxHour} hours
              </p>
              <h4 className="font-semibold text-lg">
                {formatCurrency(priceTier.price)}
              </h4>
            </div>
            <div className="flex gap-2 items-center">
              <p>{timeData ? formatTime(new Date(timeData).toISOString()) : ''}</p>
              <ArrowRight className="w-4 h-4" />
              <p>
                {timeData ?
                  formatTime(
                    new Date(
                      new Date(timeData).getTime() + 1000 * 60 * 60 * priceTier.maxHour
                    ).toISOString()
                  ) : ''}
              </p>
            </div>
          </div>
          {/* Customer Information Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Please provide your details to complete the booking
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(createPaymentIntent)} className="space-y-4">
                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const formatted = formatPhone(e.target.value);
                                field.onChange(formatted); // update RHF state with formatted value
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* License Plate */}
                      <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ABC123"
                                {...field}
                                onChange={(e) => {
                                  const cleaned = e?.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9- ]/g, "")
                                    .slice(0, 10);
                                  field.onChange(cleaned);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* License State */}
                      <FormField
                        control={form.control}
                        name="licenseState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License State *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                  {STATES.map((state) => (
                                    <SelectItem key={state.code} value={state.code}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Stripe Payment */}
                    {clientSecret && priceTier ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                          customerInfo={form.getValues()}
                          clientSecret={clientSecret}
                          priceTier={priceTier}
                        />
                      </Elements>
                    ) : (
                      <Button
                        type="submit"
                        disabled={
                          !form.watch("email") ||
                          !form.watch("phone") ||
                          !form.watch("licensePlate") ||
                          !form.watch("licenseState") ||
                          !priceTier
                        }
                        className="w-full"
                      >
                        Continue to Payment
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
