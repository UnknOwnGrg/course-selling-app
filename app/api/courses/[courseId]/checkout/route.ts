import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;

    // 1. Authentication
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    // 2. Find published course
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", {
        status: 404,
      });
    }

    // 3. Validate price
    if (course.price === null || course.price <= 0) {
      return new NextResponse("Invalid course price", {
        status: 400,
      });
    }

    // 4. Check whether the user already purchased the course
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingPurchase) {
      return new NextResponse("Course already purchased", {
        status: 400,
      });
    }

    // 5. Find existing Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: {
        userId,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    // 6. Create Stripe customer if one doesn't exist
    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });

      stripeCustomer = await prisma.stripeCustomer.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
        },
      });
    }

    // 7. Create Stripe Checkout Session
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description ?? undefined,
          },
          unit_amount: Math.round(course.price * 100),
        },
      },
    ];

    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const protocol =
      req.headers.get("x-forwarded-proto") ??
      (host?.includes("localhost") ? "http" : "https");
    const requestOrigin = host
      ? `${protocol}://${host}`
      : new URL(req.url).origin;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      requestOrigin;

    const successUrl = new URL(`/courses/${course.id}`, appUrl);
    successUrl.searchParams.set("success", "1");

    const cancelUrl = new URL(`/courses/${course.id}`, appUrl);
    cancelUrl.searchParams.set("canceled", "1");

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,

      mode: "payment",

      line_items: lineItems,

      success_url: successUrl.toString(),

      cancel_url: cancelUrl.toString(),

      metadata: {
        userId,
        courseId: course.id,
      },
    });

    // 8. Return Checkout URL
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("[COURSE_ID_CHECKOUT]", error);

    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
