/**
 * Checkout orchestration — the only place that creates orders.
 *
 * Never put checkout logic in a route handler or a client
 * component. The browser only supplies the shipping address,
 * an optional promotion code and notes; prices, stock, totals
 * and the promotion usage counter are computed inside
 * PostgreSQL by the place_order() SECURITY DEFINER function
 * (see supabase/migrations/20260816000010_orders_atomic.sql).
 *
 * Called with the authenticated caller's session: auth.uid()
 * inside the RPC is the signed-in user, so an order can never
 * be created for someone else.
 */
import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PlaceOrderInput {
  shippingAddress: unknown;
  promotionCode?: string;
  notes?: string;
}

export interface PlaceOrderResult {
  orderId: string;
}

/**
 * Creates an order from the caller's cart.
 *
 * @throws on any validation failure (empty cart, insufficient
 * stock, invalid/expired promotion, unauthenticated user).
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("place_order", {
    p_shipping_address: input.shippingAddress,
    p_promotion_code: input.promotionCode ?? null,
    p_notes: input.notes ?? null,
  });

  if (error) {
    // The RPC raises on validation failures; PostgREST surfaces
    // them as error.code 22P02 / P0001 with a readable message.
    throw new Error(`place_order a échoué : ${error.message}`);
  }

  return { orderId: data as string };
}