"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentButton from "@modules/checkout/components/payment-button"
import PaymentContainer, {
  StripePaymentContainer,
} from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import { Heading, Text, clx } from "@modules/common/components/ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const [, setPaymentComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitiating, setIsInitiating] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "payment"

  const setPaymentMethod = async (method: string) => {
    const previousMethod = selectedPaymentMethod

    setError(null)
    setSelectedPaymentMethod(method)

    setIsInitiating(true)
    try {
      await initiatePaymentSession(cart, { provider_id: method })
      // This step never navigates to a new `?step=`, so nothing else
      // forces the Server Component tree to refetch `cart`. Without this,
      // PaymentWrapper's Stripe Elements client secret and PaymentButton's
      // cart prop would stay stale (missing the session just created).
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSelectedPaymentMethod(previousMethod)
    } finally {
      setIsInitiating(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx("flex flex-row text-3xl-regular gap-x-2 items-baseline", {
            "opacity-50 pointer-events-none select-none": !isOpen,
          })}
        >
          Payment
        </Heading>
      </div>
      {isOpen && (
        <div>
          {availablePaymentMethods?.length ? (
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={setPaymentMethod}
              disabled={isInitiating}
            >
              {availablePaymentMethods.map((paymentMethod) => (
                <div key={paymentMethod.id}>
                  {isStripeLike(paymentMethod.id) ? (
                    <StripePaymentContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      paymentInfoMap={paymentInfoMap}
                      setError={setError}
                      setPaymentComplete={setPaymentComplete}
                    />
                  ) : (
                    <PaymentContainer
                      paymentInfoMap={paymentInfoMap}
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                    />
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Text className="text-ui-fg-muted">No payment methods available.</Text>
          )}

          <ErrorMessage error={error} data-testid="payment-method-error-message" />

          <div className="mt-6">
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
