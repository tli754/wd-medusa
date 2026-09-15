import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import CheckoutSteps from "@modules/checkout-new/templates/checkout-form/checkout-steps"

function getInitialStep(cart: HttpTypes.StoreCart) {
  const metadata = (cart.metadata ?? {}) as Record<string, string>

  const detailsComplete = !!(
    cart.email &&
    metadata.checkout_full_name &&
    metadata.checkout_phone
  )
  if (!detailsComplete) {
    return "address" as const
  }

  const shippingComplete =
    !!cart.shipping_address?.address_1 && (cart.shipping_methods?.length ?? 0) > 0
  if (!shippingComplete) {
    return "delivery" as const
  }

  return "payment" as const
}

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!paymentMethods) {
    return null
  }

  return (
    <CheckoutSteps
      cart={cart}
      customer={customer}
      paymentMethods={paymentMethods}
      initialStep={getInitialStep(cart)}
    />
  )
}
