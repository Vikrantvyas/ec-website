
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Only trusted server-to-server requests are allowed.
        const expectedSecret = process.env.PUSH_WEBHOOK_SECRET;
        const receivedSecret = request.headers.get(
            "x-push-webhook-secret"
        );

        if (
            !expectedSecret ||
            !receivedSecret ||
            receivedSecret !== expectedSecret
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;

        if (
            !supabaseUrl ||
            !serviceRoleKey ||
            !publicKey ||
            !privateKey
        ) {
            console.error("Push webhook API environment configuration missing.");

            return NextResponse.json(
                {
                    success: false,
                    message: "Server push configuration is incomplete.",
                },
                { status: 500 }
            );
        }

        const body = await request.json().catch(() => null);

        if (
            !body ||
            body.event !== "new_incoming_message" ||
            typeof body.messageId !== "string" ||
            !body.messageId.trim()
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid notification event." },
                { status: 400 }
            );
        }

        const supabase = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        );

        webpush.setVapidDetails(
            "mailto:admin@ecindore.com",
            publicKey,
            privateKey
        );

        // Load the incoming WhatsApp message details.
        const { data: message, error: messageError } = await supabase
            .from("whatsapp_inbound_messages")
            .select("phone_number, message_type, message_text, contact_id")
            .eq("message_id", body.messageId)
            .maybeSingle();

        if (messageError) {
            console.error(
                "Incoming message lookup failed:",
                messageError.message
            );

            return NextResponse.json(
                { success: false, message: "Could not load message details." },
                { status: 500 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { success: false, message: "Incoming message not found." },
                { status: 404 }
            );
        }

        // Load the sender's WhatsApp profile name.
        let senderName: string | null = null;

        if (message.contact_id) {
            const { data: contact, error: contactError } = await supabase
                .from("whatsapp_contacts")
                .select("name")
                .eq("id", message.contact_id)
                .maybeSingle();

            if (contactError) {
                console.error(
                    "Contact name lookup failed:",
                    contactError.message
                );
            } else {
                senderName = contact?.name?.trim() || null;
            }
        }

        const phoneNumber =
            typeof message.phone_number === "string"
                ? message.phone_number.trim()
                : "";

        const title =
            senderName || phoneNumber || "New WhatsApp Message";

        const messageType = String(
            message.message_type || ""
        ).toLowerCase();

        const messageText =
            typeof message.message_text === "string"
                ? message.message_text.trim()
                : "";

        let preview = messageText;

        if (!preview) {
            const typeLabels: Record<string, string> = {
                image: "📷 Photo",
                video: "🎥 Video",
                audio: "🎤 Audio message",
                document: "📎 Document",
                sticker: "Sticker",
                location: "📍 Location",
                contacts: "Contact shared",
                interactive: "Interactive reply",
                button: "Button reply",
                reaction: "Reaction",
            };

            preview =
                typeLabels[messageType] || "New WhatsApp message";
        }

        if (preview.length > 120) {
            preview = `${preview.slice(0, 117)}...`;
        }

        const notificationBody = phoneNumber
            ? `${phoneNumber} • ${preview}`
            : preview;

        // Keep the notification tag unique for each incoming message.
        const payload = JSON.stringify({
            title,
            body: notificationBody,
            url: "/admin/whatsapp/inbox",
            tag: `whatsapp-${body.messageId}`,
        });

        const { data: subscriptions, error: dbError } = await supabase
            .from("push_subscriptions")
            .select("id, subscription");

        if (dbError) {
            console.error("Push subscription lookup failed:", dbError.message);

            return NextResponse.json(
                { success: false, message: "Could not load subscriptions." },
                { status: 500 }
            );
        }

        if (!subscriptions?.length) {
            return NextResponse.json({
                success: true,
                sentCount: 0,
                message: "No push subscriptions found.",
            });
        }

        let sentCount = 0;
        let failedCount = 0;
        const expiredIds: string[] = [];

        await Promise.all(
            subscriptions.map(async (item) => {
                try {
                    await webpush.sendNotification(
                        item.subscription,
                        payload
                    );

                    sentCount++;
                } catch (error) {
                    failedCount++;

                    const statusCode =
                        typeof error === "object" &&
                        error !== null &&
                        "statusCode" in error
                            ? Number(error.statusCode)
                            : 0;

                    // Remove subscriptions that the push provider has expired.
                    if (statusCode === 404 || statusCode === 410) {
                        expiredIds.push(item.id);
                    }

                    console.error(
                        "Push delivery failed:",
                        statusCode || "unknown",
                        error instanceof Error
                            ? error.message
                            : "Unknown error"
                    );
                }
            })
        );

        if (expiredIds.length > 0) {
            const { error: deleteError } = await supabase
                .from("push_subscriptions")
                .delete()
                .in("id", expiredIds);

            if (deleteError) {
                console.error(
                    "Expired subscription cleanup failed:",
                    deleteError.message
                );
            }
        }

        return NextResponse.json({
            success: sentCount > 0 || subscriptions.length === 0,
            sentCount,
            failedCount,
            cleanedSubscriptions: expiredIds.length,
        });
    } catch (error) {
        console.error(
            "Push webhook error:",
            error instanceof Error ? error.message : "Unknown error"
        );

        return NextResponse.json(
            { success: false, message: "Push notification failed." },
            { status: 500 }
        );
    }
}
