import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2026-07-29.dahlia",
  typescript: true,
});
