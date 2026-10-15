import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

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

        const { data: authData, error: authError } =
            await supabase.auth.getUser(accessToken);

        if (authError || !authData.user) {
            return NextResponse.json(
                { success: false, message: "Login required." },
                { status: 401 }
            );
        }

        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;

        if (!publicKey || !privateKey) {
            return NextResponse.json(
                { success: false, message: "VAPID keys missing." },
                { status: 500 }
            );
        }

        webpush.setVapidDetails(
            "mailto:admin@ecindore.com",
            publicKey,
            privateKey
        );

        const { data: subscriptions, error: dbError } = await supabase
            .from("push_subscriptions")
            .select("id, subscription")
            .eq("user_id", authData.user.id);

        if (dbError) {
            return NextResponse.json(
                { success: false, message: dbError.message },
                { status: 500 }
            );
        }

        if (!subscriptions?.length) {
            return NextResponse.json(
                { success: false, message: "No push subscription found." },
                { status: 404 }
            );
        }

        const payload = JSON.stringify({
            title: "EC WhatsApp Inbox",
            body: "Test successful! Aapke push notifications kaam kar rahe hain.",
            url: "/admin/whatsapp/inbox",
        });

        const results = await Promise.allSettled(
            subscriptions.map(async (item) => {
                await webpush.sendNotification(item.subscription, payload);
            })
        );

        const sentCount = results.filter(
            (result) => result.status === "fulfilled"
        ).length;

        if (sentCount === 0) {
            const failed = results.find(
                (result) => result.status === "rejected"
            );

            const reason =
                failed?.status === "rejected"
                    ? String(failed.reason)
                    : "Push delivery failed.";

            return NextResponse.json(
                { success: false, message: reason },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Test push notification sent.",
            sentCount,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Push test failed.",
            },
            { status: 500 }
        );
    }
}
