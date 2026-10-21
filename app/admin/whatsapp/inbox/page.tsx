"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import {
    Search,
    Send,
    RefreshCw,
    MessageCircle,
    UserRound,
    Phone,
    Check,
    CheckCheck,
    LoaderCircle,
    AlertCircle,
    ArrowLeft,
    MessageSquare,
    Wifi,
    WifiOff,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Contact = {
    id: string;
    name: string | null;
    phone_number: string;
};

type InboundMessage = {
    id: string;
    contact_id: string | null;
    phone_number: string;
    message_id: string;
    message_type: string | null;
    message_text: string | null;
    received_at: string;
};

type MessageLog = {
    id: string;
    contact_id: string | null;
    recipient_id: string | null;
    direction: string;
    message_id: string | null;
    message_type: string | null;
    message_text: string | null;
    status: string | null;
    error_message: string | null;
    event_at: string;
};

type ChatMessage = {
    id: string;
    direction: string;
    text: string;
    status: string;
    at: string;
};

type Conversation = {
    phone: string;
    contactId: string | null;
    name: string;
    lastText: string;
    lastAt: string;
};

function normalizePhone(value: string) {
    return value.replace(/\D/g, "");
}

function formatTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
}

function formatChatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getMessageText(
    text: string | null | undefined,
    type?: string | null,
) {
    if (text?.trim()) return text;

    const labels: Record<string, string> = {
        image: "📷 Image",
        video: "🎥 Video",
        audio: "🎤 Audio",
        document: "📎 Document",
        sticker: "Sticker",
        location: "📍 Location",
        contacts: "Contact",
        interactive: "Interactive message",
        button: "Button reply",
    };

    return labels[type ?? ""] ?? "Message";
}

function StatusIcon({ status }: { status: string }) {
    const value = status.toLowerCase();

    if (value === "read" || value === "played") {
        return (
            <CheckCheck
                size={15}
                className="shrink-0 text-sky-500"
                aria-label="Read"
            />
        );
    }

    if (value === "delivered") {
        return (
            <CheckCheck
                size={15}
                className="shrink-0 text-gray-500"
                aria-label="Delivered"
            />
        );
    }

    if (
        value === "failed" ||
        value === "error"
    ) {
        return (
            <AlertCircle
                size={14}
                className="shrink-0 text-red-500"
                aria-label="Failed"
            />
        );
    }

    if (value === "accepted" || value === "sent") {
        return (
            <CheckCheck
                size={15}
                className="shrink-0 text-gray-400"
                aria-label="Sent"
            />
        );
    }

    return (
        <Check
            size={14}
            className="shrink-0 text-gray-400"
            aria-label={status || "Pending"}
        />
    );
}

export default function WhatsAppInboxPage() {
    const searchParams = useSearchParams();
    const requestedPhone = searchParams.get("phone") ?? "";
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [formSubmittedPhones, setFormSubmittedPhones] = useState<string[]>([]);
    const [inbound, setInbound] = useState<InboundMessage[]>([]);
    const [logs, setLogs] = useState<MessageLog[]>([]);

    const [selectedPhone, setSelectedPhone] = useState("");
    const [search, setSearch] = useState("");
    const [draft, setDraft] = useState("");

    const [messageMode, setMessageMode] = useState<"text" | "buttons" | "list">("text");
    const [button1, setButton1] = useState("");
    const [button2, setButton2] = useState("");
    const [button3, setButton3] = useState("");
    const [listButtonText, setListButtonText] = useState("Choose an option");
    const [listRows, setListRows] = useState([
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
    ]);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const [botTemplates, setBotTemplates] = useState<
        { id: string; name: string; status: string; start_mode: string }[]
    >([]);
    const [selectedBotId, setSelectedBotId] = useState("");
    const [botLoading, setBotLoading] = useState(false);
    const [activeBotPhones, setActiveBotPhones] = useState<string[]>([]);
    const [endingBot, setEndingBot] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const previousInboundIdsRef = useRef<Set<string>>(new Set());
    const inboxInitializedRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const unlockAudio = () => {
            if (audioContextRef.current) {
                if (audioContextRef.current.state === "suspended") {
                    void audioContextRef.current.resume();
                }
                return;
            }

            const AudioContextClass =
                window.AudioContext ||
                (window as typeof window & {
                    webkitAudioContext?: typeof AudioContext;
                }).webkitAudioContext;

            if (!AudioContextClass) return;

            const audio = new AudioContextClass();
            audioContextRef.current = audio;

            if (audio.state === "suspended") {
                void audio.resume();
            }
        };

        window.addEventListener("pointerdown", unlockAudio);
        window.addEventListener("keydown", unlockAudio);

        return () => {
            window.removeEventListener("pointerdown", unlockAudio);
            window.removeEventListener("keydown", unlockAudio);
        };
    }, []);

    function playNotificationSound() {
        const audio = audioContextRef.current;
        if (!audio) return;

        void (async () => {
            try {
                if (audio.state === "suspended") {
                    await audio.resume();
                }

                const now = audio.currentTime;

                [1046, 1397].forEach((frequency, index) => {
                    const start = now + index * 0.16;
                    const oscillator = audio.createOscillator();
                    const gain = audio.createGain();

                    oscillator.type = "triangle";
                    oscillator.frequency.value = frequency;

                    gain.gain.setValueAtTime(0.001, start);
                    gain.gain.linearRampToValueAtTime(0.5, start + 0.015);
                    gain.gain.setValueAtTime(0.5, start + 0.12);
                    gain.gain.linearRampToValueAtTime(0.001, start + 0.32);

                    oscillator.connect(gain);
                    gain.connect(audio.destination);

                    oscillator.start(start);
                    oscillator.stop(start + 0.33);
                });
            } catch (error) {
                console.error("Notification sound failed:", error);
            }
        })();
    }




    async function enableInboxNotifications() {
        try {
            setError("");
            setNotice("");

            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                setError("Is browser mein Web Push supported nahi hai.");
                return;
            }

            if (!("Notification" in window)) {
                setError("Is browser mein notifications supported nahi hain.");
                return;
            }

            if (Notification.permission === "denied") {
                setError("Browser settings mein notifications allow karein.");
                return;
            }

            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();

                if (permission !== "granted") {
                    setError("Notification permission nahi mili.");
                    return;
                }
            }

            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            const accessToken = sessionData.session?.access_token;

            if (sessionError || !accessToken) {
                setError("Login session nahi mila. Dobara login karein.");
                return;
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                setError("VAPID public key .env.local mein nahi mili.");
                return;
            }

            const registration = await navigator.serviceWorker.register("/sw.js");
            await navigator.serviceWorker.ready;

            const base64Key = vapidPublicKey
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const paddedKey = base64Key.padEnd(
                base64Key.length + ((4 - (base64Key.length % 4)) % 4),
                "="
            );

            const applicationServerKey = Uint8Array.from(
                atob(paddedKey),
                (character) => character.charCodeAt(0)
            );

            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                });
            }

            const saveResponse = await fetch("/api/push", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                }),
            });

            const saveResult = await saveResponse.json();

            if (!saveResponse.ok || !saveResult.success) {
                setError(saveResult.message || "Push subscription save nahi hui.");
                return;
            }


            const audio = audioContextRef.current;

            if (audio && audio.state === "suspended") {
                await audio.resume();
            }


            setNotificationsEnabled(true);
            setNotice("Subscription save ho gayi. Test notification bhej rahe hain...");

            const testResponse = await fetch("/api/push/test", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const testResult = await testResponse.json();

            if (!testResponse.ok || !testResult.success) {
                setError(
                    "Subscription save ho gayi, lekin test notification fail hui: " +
                    (testResult.message || "Unknown error")
                );
                return;
            }

            setNotice("Test push notification bhej di gayi. Browser/Android par check karein.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Push notifications enable nahi ho sake."
            );
        }
    }
    const selectedBotActive = activeBotPhones.includes(
        normalizePhone(selectedPhone)
    );
    const loadInbox = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);

        try {
            const [
                contactsResult,
                inboundResult,
                logsResult,
                botSessionsResult,
                formSubmittedResult,
            ] = await Promise.all([
                supabase
                    .from("whatsapp_contacts")
                    .select("id,name,phone_number")
                    .order("updated_at", { ascending: false }),

                supabase
                    .from("whatsapp_inbound_messages")
                    .select(
                        "id,contact_id,phone_number,message_id,message_type,message_text,received_at",
                    )
                    .order("received_at", { ascending: false })
                    .limit(1000),

                supabase
                    .from("whatsapp_message_logs")
                    .select(
                        "id,contact_id,recipient_id,direction,message_id,message_type,message_text,status,error_message,event_at",
                    )
                    .order("event_at", { ascending: false })
                    .limit(2000),

                supabase
                    .from("whatsapp_bot_sessions")
                    .select("phone_number")
                    .eq("status", "active"),

                supabase
                    .from("whatsapp_form_followups")
                    .select("phone_number")
                    .eq("status", "submitted"),
            ]);


            if (contactsResult.error) throw contactsResult.error;
            if (inboundResult.error) throw inboundResult.error;
            if (logsResult.error) throw logsResult.error;
            if (botSessionsResult.error) throw botSessionsResult.error;

            if (formSubmittedResult.error) throw formSubmittedResult.error;

            setFormSubmittedPhones([
                ...new Set(
                    (formSubmittedResult.data ?? []).map((item) =>
                        normalizePhone(item.phone_number)
                    )
                ),
            ]);

            setActiveBotPhones([
                ...new Set(
                    (botSessionsResult.data ?? []).map((session) =>
                        normalizePhone(session.phone_number)
                    )
                ),
            ]);

            const nextContacts = (contactsResult.data ?? []) as Contact[];


            const nextInbound = (inboundResult.data ?? []) as InboundMessage[];

            const currentIds = new Set(nextInbound.map((message) => message.id));

            if (inboxInitializedRef.current) {
                const previousIds = previousInboundIdsRef.current;

                const hasNewInbound = nextInbound.some(
                    (message) => !previousIds.has(message.id)
                );

                if (hasNewInbound) {
                    playNotificationSound();
                }
            }

            previousInboundIdsRef.current = currentIds;
            inboxInitializedRef.current = true;

            const nextLogs = (logsResult.data ?? []) as MessageLog[];


            setContacts(nextContacts);
            setInbound(nextInbound);
            setLogs(nextLogs);
            setError("");

            const availablePhones = [
                ...nextContacts.map((item) => item.phone_number),
                ...nextInbound.map((item) => item.phone_number),
            ];

            const uniquePhones = [
                ...new Map(
                    availablePhones
                        .filter(Boolean)
                        .map((phone) => [normalizePhone(phone), phone]),
                ).values(),
            ];

            setSelectedPhone((current) => {
                if (
                    current &&
                    uniquePhones.some(
                        (phone) =>
                            normalizePhone(phone) === normalizePhone(current),
                    )
                ) {
                    return current;
                }

                const firstInbound = nextInbound[0]?.phone_number;

                return firstInbound ?? uniquePhones[0] ?? "";
            });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Inbox load failed.",
            );
        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    // Initial load + Supabase Realtime subscriptions.
    useEffect(() => {
        let active = true;

        void loadInbox(true);

        const channel = supabase
            .channel("whatsapp-inbox-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "whatsapp_inbound_messages",
                },
                () => {
                    if (active) void loadInbox(false);
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "whatsapp_message_logs",
                },
                () => {
                    if (active) void loadInbox(false);
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "whatsapp_contacts",
                },
                () => {
                    if (active) void loadInbox(false);
                },
            )
            .subscribe((status) => {
                if (!active) return;

                setRealtimeConnected(status === "SUBSCRIBED");

                if (status === "SUBSCRIBED") {
                    void loadInbox(false);
                }
            });

        // Fallback refresh in case the realtime connection is interrupted.
        const fallbackInterval = setInterval(() => {
            if (active) void loadInbox(false);


        }, 2000);



        return () => {
            active = false;
            clearInterval(fallbackInterval);
            void supabase.removeChannel(channel);
        };
    }, [loadInbox]);
    useEffect(() => {
        async function loadBotTemplates() {
            const { data, error } = await supabase
                .from("whatsapp_bot_templates")
                .select("id, name, status, start_mode")
                .eq("status", "active")
                .order("name");

            if (error) {
                console.error("Failed to load bot templates:", error.message);
                setError("Bot templates load nahi hue: " + error.message);
                return;
            }

            setBotTemplates(data ?? []);
        }

        void loadBotTemplates();
    }, []);
    useEffect(() => {
        if (!requestedPhone || contacts.length === 0 && inbound.length === 0) {
            return;
        }

        const requestedNormalized = normalizePhone(requestedPhone);

        const matchingPhone =
            contacts.find(
                (contact) =>
                    normalizePhone(contact.phone_number) === requestedNormalized
            )?.phone_number ??
            inbound.find(
                (message) =>
                    normalizePhone(message.phone_number) === requestedNormalized
            )?.phone_number;

        if (matchingPhone) {
            openConversation(matchingPhone);
        }
    }, [requestedPhone, contacts, inbound]);
    const conversations = useMemo(() => {
        const map = new Map<string, Conversation>();

        const contactByPhone = new Map(
            contacts.map((contact) => [
                normalizePhone(contact.phone_number),
                contact,
            ]),
        );

        const allMessages = [
            ...inbound.map((message) => ({
                phone: message.phone_number,
                contactId: message.contact_id,
                text: getMessageText(message.message_text, message.message_type),
                at: message.received_at,
            })),

            ...logs
                .filter((message) => message.direction === "outbound")
                .map((message) => {
                    const contact = contacts.find(
                        (item) => item.id === message.contact_id,
                    );

                    return {
                        phone: contact?.phone_number ?? "",
                        contactId: message.contact_id,
                        text: getMessageText(message.message_text, message.message_type),
                        at: message.event_at,
                    };
                }),
        ]
            .filter((message) => message.phone)
            .sort(
                (a, b) =>
                    new Date(b.at).getTime() - new Date(a.at).getTime(),
            );

        for (const message of allMessages) {
            const phoneKey = normalizePhone(message.phone);

            if (!phoneKey || map.has(phoneKey)) continue;

            const contact = contactByPhone.get(phoneKey);

            map.set(phoneKey, {
                phone: message.phone,
                contactId: message.contactId ?? contact?.id ?? null,
                name: contact?.name || message.phone,
                lastText: message.text,
                lastAt: message.at,
            });
        }

        return [...map.values()].filter((conversation) => {
            const query = search.trim().toLowerCase();

            return (
                !query ||
                conversation.name.toLowerCase().includes(query) ||
                conversation.phone.includes(query)
            );
        });
    }, [contacts, inbound, logs, search]);

    const selectedContact = contacts.find(
        (contact) =>
            normalizePhone(contact.phone_number) ===
            normalizePhone(selectedPhone),
    );

    const chatMessages = useMemo(() => {
        const phone = normalizePhone(selectedPhone);

        if (!phone) return [];

        const inboundMessages: ChatMessage[] = inbound
            .filter(
                (message) => normalizePhone(message.phone_number) === phone,
            )
            .map((message) => ({
                id: message.message_id || message.id,
                direction: "inbound",
                text: getMessageText(message.message_text, message.message_type),
                status: "received",
                at: message.received_at,
            }));

        const outboundMessages: ChatMessage[] = logs
            .filter(
                (message) =>
                    message.direction === "outbound" &&
                    !!selectedContact &&
                    message.contact_id === selectedContact.id,
            )
            .map((message) => ({
                id: message.message_id ?? message.id,
                direction: "outbound",
                text: getMessageText(message.message_text, message.message_type),
                status: message.status ?? "sent",
                at: message.event_at,
            }));

        // Avoid showing the same message twice if a log is updated.
        const unique = new Map<string, ChatMessage>();

        for (const message of [...inboundMessages, ...outboundMessages]) {
            const key = `${message.direction}-${message.id}`;

            const existing = unique.get(key);

            if (
                !existing ||
                new Date(message.at).getTime() >=
                new Date(existing.at).getTime()
            ) {
                unique.set(key, message);
            }
        }

        return [...unique.values()].sort(
            (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
        );
    }, [inbound, logs, selectedPhone, selectedContact]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const previousSelectedPhoneRef = useRef("");



    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const conversationChanged =
            previousSelectedPhoneRef.current !== selectedPhone;

        previousSelectedPhoneRef.current = selectedPhone;

        if (conversationChanged) {
            shouldAutoScrollRef.current = true;
            container.scrollTop = container.scrollHeight;
            return;
        }

        if (shouldAutoScrollRef.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [chatMessages, selectedPhone]);

    async function sendReply() {
        const message = draft.trim();
        const phone = normalizePhone(selectedPhone);

        if (!phone || !message || sending) return;

        if (messageMode === "text" && message.length > 4096) {
            setError("Message 4096 characters se chhota hona chahiye.");
            return;
        }

        if (messageMode !== "text" && message.length > 1024) {
            setError("Buttons/List message 1024 characters se chhota hona chahiye.");
            return;
        }

        let requestBody: Record<string, unknown> = {
            to: phone,
            message,
        };

        if (messageMode === "buttons") {
            const titles = [button1, button2, button3]
                .map((title) => title.trim())
                .filter(Boolean);


            if (titles.length === 0) {
                setError("Kam se kam ek button title likhein.");
                return;
            }

            if (titles.some((title) => title.length > 60)) {
                setError("Har button title maximum 20 characters ka hona chahiye.");
                return;
            }

            if (new Set(titles).size !== titles.length) {
                setError("Har button ka title alag rakhein.");
                return;
            }


            requestBody = {
                ...requestBody,
                type: "buttons",
                buttons: titles.map((title, index) => ({
                    id: `reply_${index + 1}`,
                    title,
                })),
            };
        }

        if (messageMode === "list") {
            const rows = listRows
                .map((row, index) => ({
                    id: `option_${index + 1}`,
                    title: row.title.trim(),
                    description: row.description.trim(),
                }))
                .filter((row) => row.title);

            if (!listButtonText.trim()) {
                setError("List button ka text likhein.");
                return;
            }

            if (rows.length === 0) {
                setError("Kam se kam ek list option likhein.");
                return;
            }

            if (rows.length > 10) {
                setError("List mein maximum 10 options ho sakte hain.");
                return;
            }

            if (rows.some((row) => row.title.length > 24 || row.description.length > 72)) {
                setError("Option title maximum 24 aur description maximum 72 characters ka hona chahiye.");
                return;
            }

            if (new Set(rows.map((row) => row.title)).size !== rows.length) {
                setError("Har list option ka title alag rakhein.");
                return;
            }

            requestBody = {
                ...requestBody,
                type: "list",
                button_text: listButtonText.trim(),
                sections: [
                    {
                        title: "Options",
                        rows,
                    },
                ],
            };
        }

        setSending(true);
        setError("");
        setNotice("");

        try {
            const { data, error: functionError } =
                await supabase.functions.invoke("whatsapp-send", {
                    body: requestBody,
                });

            if (functionError) throw functionError;

            if (!data?.success || !data?.message_id) {
                throw new Error(data?.error || "WhatsApp message send failed.");
            }

            let contact =
                selectedContact ??
                contacts.find(
                    (item) => normalizePhone(item.phone_number) === phone,
                );

            if (!contact) {
                const { data: newContact, error: contactError } = await supabase
                    .from("whatsapp_contacts")
                    .insert({
                        phone_number: phone,
                        name: phone,
                    })
                    .select("id,name,phone_number")
                    .single();

                if (!contactError && newContact) {
                    contact = newContact as Contact;
                }
            }

            const loggedMessage =
                messageMode === "text"
                    ? message
                    : messageMode === "buttons"
                        ? `${message}\n${[button1, button2, button3]
                            .map((title) => title.trim())
                            .filter(Boolean)
                            .map((title) => `• ${title}`)
                            .join("\n")}`
                        : `${message}\n${listRows
                            .filter((row) => row.title.trim())
                            .map((row) => `• ${row.title.trim()}${row.description.trim() ? ` — ${row.description.trim()}` : ""}`)
                            .join("\n")}`;

            const { error: logError } = await supabase
                .from("whatsapp_message_logs")
                .insert({
                    contact_id: contact?.id ?? null,
                    direction: "outbound",
                    message_id: data.message_id,
                    message_type: messageMode === "text" ? "text" : "interactive",
                    message_text: loggedMessage,
                    status: data.initial_status ?? "accepted",
                    event_at: new Date().toISOString(),
                });

            setDraft("");

            if (messageMode === "buttons") {
                setButton1("");
                setButton2("");
                setButton3("");
            }

            if (messageMode === "list") {
                setListButtonText("Choose an option");
                setListRows([
                    { title: "", description: "" },
                    { title: "", description: "" },
                    { title: "", description: "" },
                ]);
            }

            setMessageMode("text");

            if (logError) {
                setNotice("Message send ho gaya, lekin chat history save nahi hui.");
            } else {
                setNotice("");
            }

            await loadInbox(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Message send failed.",
            );
        } finally {
            setSending(false);
        }
    }


    function openConversation(phone: string) {
        setSelectedPhone(phone);
        setMobileChatOpen(true);
        setNotice("");
        setError("");
    }

    return (
        <main className="flex h-[calc(100dvh-96px)] min-h-[480px] flex-col overflow-hidden bg-white text-[#111b21]">
            {/* Compact page header */}


            {/* Inline alerts */}
            {error && (
                <div className="flex shrink-0 items-center gap-2 bg-red-50 px-4 py-2 text-sm text-red-700">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="min-w-0 flex-1 break-words">{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="shrink-0 px-2 font-bold"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {notice && (
                <div className="shrink-0 bg-green-50 px-4 py-2 text-xs text-green-800">
                    {notice}
                </div>
            )}

            {/* WhatsApp-style workspace */}
            <section className="flex min-h-0 flex-1 overflow-hidden bg-white border-t border-gray-200">
                {/* Conversation sidebar */}
                <aside
                    className={`${mobileChatOpen ? "hidden sm:flex" : "flex"
                        } w-full shrink-0 flex-col border-r border-gray-200 sm:w-[300px] md:w-[330px] lg:w-[360px] xl:w-[390px]`}
                >
                    <div className="flex shrink-0 items-center justify-between bg-white px-3 py-2">
                        <h2 className="text-sm font-semibold">
                            Chats
                            <span className="ml-2 font-normal text-gray-500">
                                {conversations.length}
                            </span>
                        </h2>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                title="Refresh inbox"
                                onClick={() => void loadInbox()}
                                className="..."
                            >
                                <RefreshCw
                                    size={16}
                                    className={loading ? "animate-spin" : ""}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() => void enableInboxNotifications()}
                                title="Enable sound and desktop notifications"
                                className={`flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium ${notificationsEnabled
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                🔔 {notificationsEnabled ? "On" : "Notify"}
                            </button>
                        </div>
                    </div>

                    <div className="shrink-0 bg-white px-3 py-2">
                        <label className="flex items-center gap-3 rounded-lg bg-[#f0f2f5] px-3">
                            <Search size={17} className="shrink-0 text-gray-500" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name or phone"
                                className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="text-gray-500"
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </label>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {loading && conversations.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
                                <LoaderCircle size={18} className="animate-spin" />
                                Loading chats...
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-gray-500">
                                <MessageCircle size={34} strokeWidth={1.4} />
                                <p className="text-sm">No conversations found</p>
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const isSelected =
                                    normalizePhone(selectedPhone) ===
                                    normalizePhone(conversation.phone);

                                return (
                                    <button
                                        key={normalizePhone(conversation.phone)}
                                        type="button"
                                        onClick={() => openConversation(conversation.phone)}
                                        className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-3 text-left transition ${isSelected
                                            ? "bg-[#f0f2f5]"
                                            : "bg-white hover:bg-[#f5f6f6]"
                                            }`}
                                    >
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-gray-600">
                                            <UserRound size={23} strokeWidth={1.6} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate text-[14px] font-medium text-[#111b21]">
                                                    <span className="flex min-w-0 items-center gap-1.5">
                                                        <span className="truncate text-[14px] font-medium text-[#111b21]">
                                                            {conversation.name}
                                                            {formSubmittedPhones.includes(normalizePhone(conversation.phone)) && (
                                                                <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                                                                    Form
                                                                </span>
                                                            )}
                                                        </span>

                                                        {activeBotPhones.includes(
                                                            normalizePhone(conversation.phone)
                                                        ) && (
                                                                <span
                                                                    title="Bot Session Active"
                                                                    className="size-2 shrink-0 rounded-full bg-green-500"
                                                                />
                                                            )}
                                                    </span>
                                                </span>

                                                <span className="shrink-0 text-[10px] text-gray-500">
                                                    {formatTime(conversation.lastAt)}
                                                </span>
                                            </div>

                                            <div className="mt-1 truncate text-xs text-gray-500">
                                                {conversation.phone}
                                            </div>

                                            <div className="mt-1 truncate text-[13px] text-[#667781]">
                                                {conversation.lastText}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Chat panel */}
                <div
                    className={`${mobileChatOpen ? "flex" : "hidden"
                        } min-h-0 min-w-0 flex-1 flex-col sm:flex`}
                >
                    {selectedPhone ? (
                        <>
                            {/* Chat contact header */}
                            <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 py-1.5 sm:px-4">
                                <button
                                    type="button"
                                    onClick={() => setMobileChatOpen(false)}
                                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 sm:hidden"
                                    aria-label="Back to chats"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-gray-600">
                                    <UserRound size={22} strokeWidth={1.6} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">
                                        {selectedContact?.name || selectedPhone}
                                    </div>

                                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                        <Phone size={11} />
                                        <span>{selectedPhone}</span>
                                    </div>
                                </div>
                            </header>
                            {/* Bot Starter */}

                            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:px-4">
                                <select
                                    value={selectedBotId}
                                    onChange={(event) => setSelectedBotId(event.target.value)}
                                    disabled={botLoading}
                                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                >
                                    <option value="">Select an active bot...</option>
                                    {botTemplates.map((bot) => (
                                        <option key={bot.id} value={bot.id}>
                                            {bot.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    disabled={
                                        !selectedBotId ||
                                        !selectedPhone ||
                                        botLoading ||
                                        selectedBotActive
                                    }
                                    onClick={async () => {
                                        const phone = normalizePhone(selectedPhone);

                                        if (!selectedBotId || !phone || botLoading) return;

                                        setBotLoading(true);
                                        setError("");
                                        setNotice("");

                                        try {
                                            const bot = botTemplates.find(
                                                (item) => item.id === selectedBotId
                                            );

                                            if (!bot) {
                                                throw new Error("Selected Bot nahi mila.");
                                            }

                                            const { data: existingSession, error: sessionError } =
                                                await supabase
                                                    .from("whatsapp_bot_sessions")
                                                    .select("id")
                                                    .eq("phone_number", phone)
                                                    .eq("status", "active")
                                                    .maybeSingle();

                                            if (sessionError) throw sessionError;

                                            if (existingSession) {
                                                throw new Error(
                                                    "Is customer ke liye ek active Bot Session pehle se chal raha hai."
                                                );
                                            }

                                            const { data: botData, error: botError } = await supabase
                                                .from("whatsapp_bot_templates")
                                                .select("flow")
                                                .eq("id", selectedBotId)
                                                .eq("status", "active")
                                                .single();

                                            if (botError) throw botError;

                                            const nodes = Array.isArray(botData.flow?.nodes)
                                                ? botData.flow.nodes
                                                : [];

                                            if (nodes.length === 0) {
                                                throw new Error("Is Bot mein koi Question nahi hai.");
                                            }

                                            // Step 1: Pehla Question prepare karein
                                            const firstNode = nodes[0];

                                            if (!firstNode.id || !firstNode.question?.trim()) {
                                                throw new Error("First question ka message khaali hai.");
                                            }

                                            const options = Array.isArray(firstNode.options)
                                                ? firstNode.options
                                                : [];

                                            let requestBody: Record<string, unknown>;
                                            let loggedMessage = firstNode.question;
                                            let loggedMessageType = "text";

                                            if (firstNode.type === "text") {
                                                requestBody = {
                                                    to: phone,
                                                    type: "text",
                                                    message: firstNode.question,
                                                };
                                            } else if (firstNode.type === "buttons") {
                                                if (options.length < 1 || options.length > 3) {
                                                    throw new Error("Reply Buttons ke liye 1 se 3 options zaroori hain.");
                                                }

                                                requestBody = {
                                                    to: phone,
                                                    type: "buttons",
                                                    message: firstNode.question,
                                                    buttons: options.map((option: { id: string; title: string }) => ({
                                                        id: option.id,
                                                        title: option.title,
                                                    })),
                                                };

                                                loggedMessageType = "interactive";
                                                loggedMessage += "\n" + options
                                                    .map((option: { title: string }) => `• ${option.title}`)
                                                    .join("\n");
                                            } else if (firstNode.type === "list") {
                                                if (options.length < 1 || options.length > 10) {
                                                    throw new Error("List ke liye 1 se 10 options zaroori hain.");
                                                }

                                                requestBody = {
                                                    to: phone,
                                                    type: "list",
                                                    message: firstNode.question,
                                                    button_text: "Options",
                                                    sections: [
                                                        {
                                                            title: "Options",
                                                            rows: options.map(
                                                                (option: { id: string; title: string }) => ({
                                                                    id: option.id,
                                                                    title: option.title,
                                                                })
                                                            ),
                                                        },
                                                    ],
                                                };

                                                loggedMessageType = "interactive";
                                                loggedMessage += "\n" + options
                                                    .map((option: { title: string }) => `• ${option.title}`)
                                                    .join("\n");
                                            } else {
                                                throw new Error("Question type Text, Buttons ya List hona chahiye.");
                                            }

                                            // Step 2: WhatsApp par pehla question bhejein
                                            const { data: sendData, error: sendError } =
                                                await supabase.functions.invoke("whatsapp-send", {
                                                    body: requestBody,
                                                });

                                            if (sendError) throw sendError;

                                            if (!sendData?.success || !sendData?.message_id) {
                                                throw new Error(sendData?.error || "Pehla WhatsApp question send nahi hua.");
                                            }

                                            // Step 3: Message log save karein
                                            const { data: contact } = await supabase
                                                .from("whatsapp_contacts")
                                                .select("id")
                                                .eq("phone_number", phone)
                                                .maybeSingle();

                                            const { error: logError } = await supabase
                                                .from("whatsapp_message_logs")
                                                .insert({
                                                    contact_id: contact?.id ?? null,
                                                    direction: "outbound",
                                                    message_id: sendData.message_id,
                                                    message_type: loggedMessageType,
                                                    message_text: loggedMessage,
                                                    status: sendData.initial_status ?? "accepted",
                                                    event_at: new Date().toISOString(),
                                                });

                                            if (logError) {
                                                console.error("Bot message log save failed:", logError.message);
                                            }

                                            // Step 4: Session create karein
                                            const { error: insertError } = await supabase
                                                .from("whatsapp_bot_sessions")
                                                .insert({
                                                    bot_id: selectedBotId,
                                                    phone_number: phone,
                                                    current_node_id: firstNode.id,
                                                    status: "active",
                                                });

                                            if (insertError) throw insertError;

                                            setNotice(`Bot "${bot.name}" ka pehla question WhatsApp par bhej diya gaya.`);
                                            await loadInbox(false);

                                            setNotice(
                                                `Bot "${bot.name}" customer ${phone} ke liye start ho gaya. Abhi sirf session create hua hai; pehla WhatsApp question agle step mein bhejenge.`
                                            );
                                        } catch (err) {
                                            setError(
                                                err instanceof Error
                                                    ? err.message
                                                    : "Bot start nahi ho saka."
                                            );
                                        } finally {
                                            setBotLoading(false);
                                        }
                                    }}
                                    className="rounded-lg bg-[#008069] px-4 py-2 text-sm font-medium text-white hover:bg-[#006e5b] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {botLoading ? "Starting..." : "Start Bot"}
                                </button>
                                {selectedBotActive && (
                                    <button
                                        type="button"
                                        disabled={endingBot}
                                        onClick={async () => {
                                            if (!selectedPhone || endingBot) return;

                                            setEndingBot(true);
                                            setError("");
                                            setNotice("");

                                            try {
                                                const phone = normalizePhone(selectedPhone);

                                                const { error: endError } = await supabase
                                                    .from("whatsapp_bot_sessions")
                                                    .update({ status: "paused" })
                                                    .eq("phone_number", phone)
                                                    .eq("status", "active");

                                                if (endError) throw endError;

                                                await loadInbox(false);
                                                setNotice("Bot Session successfully ended.");
                                            } catch (err) {
                                                setError(
                                                    err instanceof Error
                                                        ? err.message
                                                        : "Bot Session end nahi hua."
                                                );
                                            } finally {
                                                setEndingBot(false);
                                            }
                                        }}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {endingBot ? "Ending..." : "End Bot"}
                                    </button>
                                )}
                            </div>

                            {/* Messages */}

                            <div
                                ref={messagesContainerRef}
                                onScroll={(event) => {
                                    const container = event.currentTarget;

                                    const distanceFromBottom =
                                        container.scrollHeight -
                                        container.scrollTop -
                                        container.clientHeight;

                                    shouldAutoScrollRef.current = distanceFromBottom < 100;
                                }}
                                className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#efeae2] px-3 py-4 sm:px-5 md:px-8"
                            >

                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(#9a8f80 0.7px, transparent 0.7px)",
                                        backgroundSize: "18px 18px",
                                    }}
                                />


                                <div className="relative z-10 my-0 flex flex-col gap-2">

                                    {chatMessages.length === 0 ? (
                                        <div className="m-auto mt-8 max-w-xs rounded-lg bg-[#fff7df] px-4 py-3 text-center text-xs leading-5 text-gray-600 shadow-sm">
                                            Messages sent or received with this contact will appear
                                            here.
                                        </div>
                                    ) : (
                                        chatMessages.map((message, index) => {
                                            const outgoing = message.direction === "outbound";

                                            const previous = chatMessages[index - 1];

                                            const showDate =
                                                !previous ||
                                                new Date(previous.at).toDateString() !==
                                                new Date(message.at).toDateString();

                                            return (
                                                <div
                                                    key={`${message.direction}-${message.id}-${index}`}
                                                    className="flex w-full flex-col"
                                                >
                                                    {showDate && (
                                                        <div className="my-2 flex justify-center">
                                                            <span className="rounded-md bg-white/90 px-3 py-1 text-[10px] text-gray-600 shadow-sm">
                                                                {new Date(message.at).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`flex ${outgoing ? "justify-end" : "justify-start"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`max-w-[92%] rounded-lg px-3 py-2 shadow-sm sm:max-w-[82%] md:max-w-[75%] lg:max-w-[68%] ${outgoing
                                                                ? "rounded-tr-none bg-[#d9fdd3]"
                                                                : "rounded-tl-none bg-white"
                                                                }`}
                                                        >
                                                            <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.5] text-[#111b21] sm:text-sm">
                                                                {message.text || "(Empty message)"}
                                                            </p>

                                                            <div className="mt-1 flex items-center justify-end gap-1.5">
                                                                <span className="text-[10px] text-gray-500">
                                                                    {formatChatDate(message.at)}
                                                                </span>

                                                                {outgoing && (
                                                                    <span
                                                                        className="flex items-center gap-0.5"
                                                                        title={message.status}
                                                                    >
                                                                        <StatusIcon status={message.status} />
                                                                        <span className="max-w-20 truncate text-[9px] text-gray-500">
                                                                            {message.status}
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Message composer */}



                            {messageMode !== "text" && (
                                <div className="shrink-0 space-y-3 border-t border-gray-100 bg-white px-3 py-3 sm:px-4">
                                    {messageMode === "buttons" ? (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-700">
                                                Reply Buttons (maximum 3)
                                            </p>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                <input
                                                    value={button1}
                                                    onChange={(event) => setButton1(event.target.value)}
                                                    maxLength={60}
                                                    placeholder="Button 1 (required)"
                                                    className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                                />
                                                <input
                                                    value={button2}
                                                    onChange={(event) => setButton2(event.target.value)}
                                                    maxLength={60}
                                                    placeholder="Button 2 (optional)"
                                                    className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                                />
                                                <input
                                                    value={button3}
                                                    onChange={(event) => setButton3(event.target.value)}
                                                    maxLength={60}
                                                    placeholder="Button 3 (optional)"
                                                    className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-700">
                                                List Message (maximum 10 options)
                                            </p>
                                            <input
                                                value={listButtonText}
                                                onChange={(event) => setListButtonText(event.target.value)}
                                                maxLength={60}
                                                placeholder="List button text"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                            />
                                            {listRows.map((row, index) => (
                                                <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    <input
                                                        value={row.title}
                                                        onChange={(event) =>
                                                            setListRows((current) =>
                                                                current.map((item, i) =>
                                                                    i === index ? { ...item, title: event.target.value } : item
                                                                )
                                                            )
                                                        }
                                                        maxLength={24}
                                                        placeholder={`Option ${index + 1} (required)`}
                                                        className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                                    />
                                                    <input
                                                        value={row.description}
                                                        onChange={(event) =>
                                                            setListRows((current) =>
                                                                current.map((item, i) =>
                                                                    i === index ? { ...item, description: event.target.value } : item
                                                                )
                                                            )
                                                        }
                                                        maxLength={72}
                                                        placeholder="Description (optional)"
                                                        className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                disabled={listRows.length >= 10}
                                                onClick={() =>
                                                    setListRows((current) => [
                                                        ...current,
                                                        { title: "", description: "" },
                                                    ])
                                                }
                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                + Add option
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void sendReply();
                                }}
                                className="shrink-0 border-t border-gray-200 bg-transparent px-2 py-2 sm:px-4 sm:py-3"
                            >
                                <div className="bg-white"></div>
                                <div className="flex items-end gap-2 sm:gap-3">
                                    <select
                                        value={messageMode}
                                        onChange={(event) =>
                                            setMessageMode(event.target.value as "text" | "buttons" | "list")
                                        }
                                        disabled={sending}
                                        aria-label="Message type"
                                        className="h-11 w-28 shrink-0 rounded-xl border border-gray-200 bg-white px-2 text-sm outline-none focus:border-[#008069] sm:w-36"
                                    >
                                        <option value="text">Normal Text</option>
                                        <option value="buttons">Reply Buttons</option>
                                        <option value="list">List Message</option>
                                    </select>
                                    <div className="flex h-11 min-h-11 min-w-0 flex-1 items-center rounded-xl bg-white px-3 py-1.5 shadow-sm">
                                        <textarea
                                            value={draft}
                                            onChange={(event) => setDraft(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey &&
                                                    !event.nativeEvent.isComposing
                                                ) {
                                                    event.preventDefault();
                                                    void sendReply();
                                                }
                                            }}
                                            maxLength={4096}
                                            rows={1}
                                            placeholder="Type a message"
                                            className="h-8 max-h-8 min-h-8 flex-1 resize-none self-center overflow-y-auto bg-transparent py-1.5 text-sm leading-5 outline-none placeholder:text-gray-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending || !draft.trim()}
                                        title="Send message"
                                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#008069] text-white transition hover:bg-[#006e5b] disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        {sending ? (
                                            <LoaderCircle size={19} className="animate-spin" />
                                        ) : (
                                            <Send size={19} />
                                        )}
                                    </button>

                                </div>

                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center bg-[#f7f9fa] px-6 text-center">
                            <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#e4f5ed] text-[#008069]">
                                <MessageCircle size={40} strokeWidth={1.3} />
                            </div>

                            <h2 className="text-xl font-light text-[#41525d]">
                                WhatsApp Inbox
                            </h2>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                Chat dekhne aur message bhejne ke liye left side se
                                conversation select karein.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}