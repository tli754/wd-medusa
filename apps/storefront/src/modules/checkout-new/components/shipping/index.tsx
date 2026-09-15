"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod, updateCart } from "@lib/data/cart"
import {
  calculatePriceForShippingOption,
  listCartShippingMethods,
} from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import Input from "@modules/common/components/input"
import MedusaRadio from "@modules/common/components/radio"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import { useEffect, useState } from "react"

const Shipping = ({
  cart,
  isOpen,
  onEdit,
  onBack,
  onContinue,
}: {
  cart: HttpTypes.StoreCart
  isOpen: boolean
  onEdit: () => void
  onBack: () => void
  onContinue: () => void
}) => {
  const [streetAddress, setStreetAddress] = useState(
    cart.shipping_address?.address_1 ?? ""
  )
  const [suburb, setSuburb] = useState(cart.shipping_address?.address_2 ?? "")
  const [city, setCity] = useState(cart.shipping_address?.city ?? "")
  const [postcode, setPostcode] = useState(
    cart.shipping_address?.postal_code ?? ""
  )

  const [shippingOptions, setShippingOptions] = useState<
    HttpTypes.StoreCartShippingOption[] | null
  >(cart.shipping_address?.address_1 ? [] : null)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id ?? null
  )

  const [isCalculating, setIsCalculating] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const isComplete =
    !!cart.shipping_address?.address_1 && (cart.shipping_methods?.length ?? 0) > 0

  const metadata = (cart.metadata ?? {}) as Record<string, string>
  const hasContactInfo = !!(
    metadata.checkout_full_name && metadata.checkout_phone
  )

  const fetchOptionsAndPrices = async () => {
    const options = await listCartShippingMethods(cart.id)
    setShippingOptions(options ?? [])

    if (options?.length) {
      const calculated = options.filter((o) => o.price_type === "calculated")
      const results = await Promise.allSettled(
        calculated.map((option) =>
          calculatePriceForShippingOption(option.id, cart.id)
        )
      )

      const pricesMap: Record<string, number> = {}
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.id) {
          pricesMap[result.value.id] = result.value.amount ?? 0
        }
      })
      setCalculatedPricesMap(pricesMap)
    }
  }

  useEffect(() => {
    if (cart.shipping_address?.address_1) {
      fetchOptionsAndPrices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCalculateDelivery = async () => {
    if (!hasContactInfo) {
      setError("Please complete your contact details first.")
      return
    }

    if (!streetAddress.trim() || !city.trim() || !postcode.trim()) {
      setError("Street address, Town/City and Postcode are all required.")
      return
    }

    setError(null)
    setIsCalculating(true)

    const [firstName, ...rest] = (metadata.checkout_full_name ?? "")
      .trim()
      .split(" ")

    const address = {
      first_name: firstName || "",
      last_name: rest.join(" "),
      address_1: streetAddress.trim(),
      address_2: suburb.trim(),
      city: city.trim(),
      postal_code: postcode.trim(),
      country_code: cart.region?.countries?.[0]?.iso_2,
      phone: metadata.checkout_phone ?? "",
    }

    try {
      await updateCart({
        shipping_address: address,
        billing_address: address,
      })

      await fetchOptionsAndPrices()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSelectShippingMethod = async (id: string) => {
    setError(null)
    setIsSelecting(true)
    const previousId = shippingMethodId
    setShippingMethodId(id)

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(previousId)
        setError(err.message)
      })
      .finally(() => setIsSelecting(false))
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            { "opacity-50 pointer-events-none select-none": !isOpen && !isComplete }
          )}
        >
          Shipping
          {!isOpen && isComplete && <CheckCircleSolid />}
        </Heading>
        {!isOpen && isComplete && (
          <Text>
            <button
              onClick={onEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-shipping-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        !hasContactInfo ? (
          <div className="pb-8">
            <Text className="text-ui-fg-muted mb-4">
              Please complete your contact details before entering a delivery
              address.
            </Text>
            <button
              onClick={onBack}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="back-to-details-button"
            >
              Back to details
            </button>
          </div>
        ) : (
        <div className="pb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input
              label="Street address"
              name="street_address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
              data-testid="shipping-street-address-input"
            />
            <Input
              label="Suburb"
              name="suburb"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              data-testid="shipping-suburb-input"
            />
            <Input
              label="Town/City"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              data-testid="shipping-city-input"
            />
            <Input
              label="Postcode"
              name="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
              data-testid="shipping-postcode-input"
            />
          </div>
          <Button
            variant="secondary"
            isLoading={isCalculating}
            onClick={handleCalculateDelivery}
            data-testid="calculate-delivery-button"
          >
            Calculate delivery
          </Button>

          {shippingOptions !== null && (
            <div className="mt-6" data-testid="delivery-options-container">
              {shippingOptions.length === 0 ? (
                <Text className="text-ui-fg-muted">
                  No delivery options are available for this address.
                </Text>
              ) : (
                <RadioGroup
                  value={shippingMethodId}
                  onChange={(v) => v && handleSelectShippingMethod(v)}
                >
                  {shippingOptions.map((option) => {
                    const isDisabled =
                      option.price_type === "calculated" &&
                      typeof calculatedPricesMap[option.id] !== "number"

                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        disabled={isDisabled}
                        data-testid="delivery-option-radio"
                        className={clx(
                          "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                          {
                            "border-ui-border-interactive":
                              option.id === shippingMethodId,
                            "hover:shadow-brders-none cursor-not-allowed":
                              isDisabled,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <MedusaRadio checked={option.id === shippingMethodId} />
                          <span className="text-base-regular">{option.name}</span>
                        </div>
                        <span className="justify-self-end text-ui-fg-base">
                          {option.price_type === "flat" ? (
                            convertToLocale({
                              amount: option.amount!,
                              currency_code: cart.currency_code,
                            })
                          ) : typeof calculatedPricesMap[option.id] === "number" ? (
                            convertToLocale({
                              amount: calculatedPricesMap[option.id],
                              currency_code: cart.currency_code,
                            })
                          ) : (
                            <Loader />
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>
              )}
            </div>
          )}

          <ErrorMessage error={error} data-testid="shipping-error-message" />

          <Button
            size="large"
            className="mt-6"
            onClick={onContinue}
            isLoading={isSelecting}
            disabled={!cart.shipping_methods?.length}
            data-testid="submit-shipping-button"
          >
            Continue to payment
          </Button>
        </div>
        )
      ) : (
        <div className="text-small-regular">
          {isComplete && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">Method</Text>
              <Text className="txt-medium text-ui-fg-subtle">
                {cart.shipping_methods!.at(-1)!.name}{" "}
                {convertToLocale({
                  amount: cart.shipping_methods!.at(-1)!.amount!,
                  currency_code: cart.currency_code,
                })}
              </Text>
            </div>
          )}
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
