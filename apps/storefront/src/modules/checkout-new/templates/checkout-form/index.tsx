import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Details from "@modules/checkout-new/components/details"
import Payment from "@modules/checkout-new/components/payment"
import Shipping from "@modules/checkout-new/components/shipping"

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
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Details cart={cart} customer={customer} />
      <Shipping cart={cart} />
      <Payment cart={cart} availablePaymentMethods={paymentMethods} />
    </div>
  )
}
