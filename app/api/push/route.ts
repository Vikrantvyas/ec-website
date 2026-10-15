import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "EC WhatsApp Push API is running.",
    });
}

export async function POST(request: NextRequest) {
    try {
        const authorization = request.headers.get("authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, message: "Login token missing." },
                { status: 401 }
            );
        }

        const accessToken = authorization.slice(7);

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
                global: {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error || !data.user) {
            return NextResponse.json(
                { success: false, message: "Login required." },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const subscription = body?.subscription;

        // Sirf login verification ki request
        if (!subscription) {
            return NextResponse.json({
                success: true,
                message: "Login verification successful.",
                userId: data.user.id,
            });
        }

        if (
            typeof subscription.endpoint !== "string" ||
            !subscription.keys?.p256dh ||
            !subscription.keys?.auth
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid push subscription." },
                { status: 400 }
            );
        }

        const { data: existing, error: lookupError } = await supabase
            .from("push_subscriptions")
            .select("id")
            .eq("endpoint", subscription.endpoint)
            .maybeSingle();

        if (lookupError) {
            return NextResponse.json(
                { success: false, message: lookupError.message },
                { status: 500 }
            );
        }

        if (existing) {
            return NextResponse.json({
                success: true,
                message: "Push subscription already saved.",
                userId: data.user.id,
            });
        }

        const { error: insertError } = await supabase
            .from("push_subscriptions")
            .insert({
                user_id: data.user.id,
                endpoint: subscription.endpoint,
                subscription,
            });

        if (insertError) {
            return NextResponse.json(
                { success: false, message: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Push subscription saved successfully.",
            userId: data.user.id,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Push API error.",
            },
            { status: 500 }
        );
    }
}
