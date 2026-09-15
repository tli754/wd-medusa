"use client"

import { HttpTypes } from "@medusajs/types"
import Details from "@modules/checkout-new/components/details"
import Payment from "@modules/checkout-new/components/payment"
import Shipping from "@modules/checkout-new/components/shipping"
import { useState } from "react"

type Step = "address" | "delivery" | "payment"

export default function CheckoutSteps({
  cart,
  customer,
  paymentMethods,
  initialStep,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  paymentMethods: { id: string }[]
  initialStep: Step
}) {
  const [activeStep, setActiveStep] = useState<Step>(initialStep)

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Details
        cart={cart}
        customer={customer}
        isOpen={activeStep === "address"}
        onEdit={() => setActiveStep("address")}
        onContinue={() => setActiveStep("delivery")}
      />
      <Shipping
        cart={cart}
        isOpen={activeStep === "delivery"}
        onEdit={() => setActiveStep("delivery")}
        onBack={() => setActiveStep("address")}
        onContinue={() => setActiveStep("payment")}
      />
      <Payment
        cart={cart}
        availablePaymentMethods={paymentMethods}
        isOpen={activeStep === "payment"}
      />
    </div>
  )
}
