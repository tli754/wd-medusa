"use client"

import { updateCart } from "@lib/data/cart"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import Input from "@modules/common/components/input"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { useEffect, useState } from "react"

const Details = ({
  cart,
  customer,
  isOpen,
  onEdit,
  onContinue,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  isOpen: boolean
  onEdit: () => void
  onContinue: () => void
}) => {
  const metadata = (cart.metadata ?? {}) as Record<string, string>

  const [fullName, setFullName] = useState(
    metadata.checkout_full_name ??
      [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")
  )
  const [email, setEmail] = useState(cart.email ?? customer?.email ?? "")
  const [phone, setPhone] = useState(metadata.checkout_phone ?? customer?.phone ?? "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const isComplete = !!(
    cart.email &&
    metadata.checkout_full_name &&
    metadata.checkout_phone
  )

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Full name, email and phone are all required.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const trimmedName = fullName.trim()
      const trimmedPhone = phone.trim()
      const [firstName, ...rest] = trimmedName.split(" ")

      const updatedAddress = cart.shipping_address
        ? {
            ...cart.shipping_address,
            first_name: firstName || "",
            last_name: rest.join(" "),
            phone: trimmedPhone,
          }
        : undefined

      await updateCart({
        email,
        metadata: {
          ...cart.metadata,
          checkout_full_name: trimmedName,
          checkout_phone: trimmedPhone,
        },
        ...(updatedAddress
          ? { shipping_address: updatedAddress, billing_address: updatedAddress }
          : {}),
      })

      onContinue()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          Details
          {!isOpen && isComplete && <CheckCircleSolid />}
        </Heading>
        {!isOpen && isComplete && (
          <Text>
            <button
              onClick={onEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-details-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <div className="pb-8">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full name"
              name="full_name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              data-testid="details-full-name-input"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="details-email-input"
            />
            <Input
              label="Phone"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              data-testid="details-phone-input"
            />
          </div>
          <Button
            className="mt-6"
            size="large"
            onClick={handleSubmit}
            isLoading={isLoading}
            data-testid="submit-details-button"
          >
            Continue to delivery
          </Button>
          <ErrorMessage error={error} data-testid="details-error-message" />
        </div>
      ) : (
        <div className="text-small-regular">
          {isComplete && (
            <div className="flex items-start gap-x-8">
              <div className="flex flex-col w-1/3" data-testid="details-summary">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Contact
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {metadata.checkout_full_name}
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">{cart.email}</Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {metadata.checkout_phone}
                </Text>
              </div>
            </div>
          )}
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Details
