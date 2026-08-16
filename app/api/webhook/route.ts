import Stripe from "stripe";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Webhook Error: Missing Stripe-Signature", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId) {
      return new NextResponse("Webhook Error: Missing metadata", {
        status: 400,
      });
    }

    await prisma.purchase.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {},
      create: {
        courseId,
        userId,
      },
    });
  } else {
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 200 });
}
