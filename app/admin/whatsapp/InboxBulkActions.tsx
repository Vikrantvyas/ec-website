
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle, Search, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import InboxRightClick from "@/app/admin/whatsapp/InboxRightClick";
type InboxConversation = {
    phone: string;
    contactId: string | null;
    name: string;
    lastText: string;
    lastAt: string;
};

type InboxContact = {
    id: string;
    name: string | null;
    phone_number: string;
    consent_status?: string | null;
};

type InboxInbound = {
    id: string;
    contact_id: string | null;
    phone_number: string;
    message_text: string | null;
    message_type?: string | null;
    received_at: string;
};

type InboxLog = {
    id: string;
    contact_id: string | null;
    direction: string;
    message_text: string | null;
    event_at: string;
};

type BotTemplate = {
    id: string;
    name: string;
    status: string;
    start_mode: string;
};
type DemoSchedule = {
    id: string;
    phone_number: string;
    demo_date: string;
    start_time: string;
    status: string;
};
type Props = {
    conversations: InboxConversation[];
    formSubmittedPhones: string[];
    contacts: InboxContact[];
    inbound: InboxInbound[];
    logs: InboxLog[];
    botTemplates: BotTemplate[];
    selectedBotId: string;
    onSelectedBotIdChange: (id: string) => void;
    activeBotPhones: string[];
    onOpenConversation: (phone: string) => void;
    selectedPhone: string;
    onRefreshInbox: () => Promise<unknown> | void;
};

function normalizePhone(value: string) {
    return value.replace(/\D/g, "");
}

const HIDDEN_CHATS_STORAGE_KEY = "ec_whatsapp_inbox_hidden_chats_v1";
const HIDDEN_CHAT_EVENT = "inbox-chat-hidden";

type HiddenChats = Record<string, number>;

function readHiddenChats(): HiddenChats {
    try {
        const saved = window.localStorage.getItem(HIDDEN_CHATS_STORAGE_KEY);
        if (!saved) return {};

        const parsed: unknown = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

        const result: HiddenChats = {};
        for (const [phone, timestamp] of Object.entries(parsed)) {
            if (phone && typeof timestamp === "number" && Number.isFinite(timestamp)) {
                result[phone] = timestamp;
            }
        }
        return result;
    } catch {
        return {};
    }
}
function normalizeEnquiryPhone(value: string) {
    let phone = normalizePhone(value);

    if (phone.length === 12 && phone.startsWith("91")) {
        phone = phone.slice(2);
    }

    if (phone.length === 11 && phone.startsWith("0")) {
        phone = phone.slice(1);
    }

    return phone;
}
function getMessageText(text: string | null | undefined, type?: string | null) {
    if (text?.trim()) return text;

    const labels: Record<string, string> = {
        image: "Image",
        video: "Video",
        audio: "Audio",
        document: "Document",
        interactive: "Interactive message",
        button: "Button reply",
    };

    return labels[type ?? ""] ?? "Message";
}

export default function InboxBulkActions({
    conversations,
    formSubmittedPhones,
    contacts,
    inbound,
    logs,
    botTemplates,
    selectedBotId,
    onSelectedBotIdChange,
    activeBotPhones,
    onOpenConversation,
    selectedPhone,
    onRefreshInbox,
}: Props) {
    const [search, setSearch] = useState("");
    const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
    const [demoSchedules, setDemoSchedules] = useState<DemoSchedule[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function loadDemoSchedules() {
            const now = new Date();
            const today =
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

            const { data, error } = await supabase
                .from("demo_schedules")
                .select("id, phone_number, demo_date, start_time, status")
                .gte("demo_date", today)
                .eq("status", "scheduled")
                .order("demo_date", { ascending: true })
                .order("start_time", { ascending: true });

            if (cancelled) return;

            if (error) {
                console.error("Demo schedules load failed:", error.message);
                return;
            }

            setDemoSchedules((data ?? []) as DemoSchedule[]);
        }

        loadDemoSchedules();

        const channel = supabase
            .channel("inbox-demo-schedules")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "demo_schedules",
                },
                () => {
                    loadDemoSchedules();
                }
            )
            .subscribe();

        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
        };
    }, []);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [openTextOnly, setOpenTextOnly] = useState(false);
    const [openTextLoading, setOpenTextLoading] = useState(false);
    const [latestInboundByPhone, setLatestInboundByPhone] = useState<
        Record<string, number>
    >({});
    const [hiddenChats, setHiddenChats] = useState<HiddenChats>({});

    useEffect(() => {
        setHiddenChats(readHiddenChats());

        function handleChatHidden(event: Event) {
            const customEvent = event as CustomEvent<{ phoneKey?: string }>;
            const phoneKey = customEvent.detail?.phoneKey;
            if (!phoneKey) return;
            setHiddenChats(readHiddenChats());
            setSelectedPhones((current) =>
                current.filter((phone) => normalizePhone(phone) !== phoneKey)
            );
        }

        window.addEventListener(HIDDEN_CHAT_EVENT, handleChatHidden);
        return () => window.removeEventListener(HIDDEN_CHAT_EVENT, handleChatHidden);
    }, []);

    // Naya incoming message agar hide kiye jane ke baad aaya ho, to chat ko wapas dikhayein.
    useEffect(() => {
        if (inbound.length === 0) return;

        const latestInboundAtByPhone: Record<string, number> = {};
        for (const message of inbound) {
            const phoneKey = normalizePhone(message.phone_number);
            const timestamp = new Date(message.received_at).getTime();
            if (!phoneKey || !Number.isFinite(timestamp)) continue;
            if (
                latestInboundAtByPhone[phoneKey] === undefined ||
                timestamp > latestInboundAtByPhone[phoneKey]
            ) {
                latestInboundAtByPhone[phoneKey] = timestamp;
            }
        }

        setHiddenChats((current) => {
            const next = { ...current };
            let changed = false;
            for (const [phoneKey, hiddenAt] of Object.entries(current)) {
                const latestInboundAt = latestInboundAtByPhone[phoneKey];
                if (latestInboundAt !== undefined && latestInboundAt > hiddenAt) {
                    delete next[phoneKey];
                    changed = true;
                }
            }
            if (changed) {
                try {
                    window.localStorage.setItem(HIDDEN_CHATS_STORAGE_KEY, JSON.stringify(next));
                } catch {
                    // State mein chat show rahegi; storage error ko silently handle karein.
                }
            }
            return changed ? next : current;
        });
    }, [inbound]);
    const latestInboundAtByPhone = useMemo(() => {
        const latest: Record<string, number> = {};

        for (const message of inbound) {
            const phone = normalizePhone(message.phone_number);
            const timestamp = new Date(message.received_at).getTime();

            if (!phone || !Number.isFinite(timestamp)) continue;

            if (
                latest[phone] === undefined ||
                timestamp > latest[phone]
            ) {
                latest[phone] = timestamp;
            }
        }

        return latest;
    }, [inbound]);

    function getWindowStatus(phone: string) {
        const lastInboundAt = latestInboundAtByPhone[normalizePhone(phone)];

        if (lastInboundAt === undefined) {
            return "unknown" as const;
        }

        const elapsed = Date.now() - lastInboundAt;

        if (elapsed < 0) return "unknown" as const;

        return elapsed < 24 * 60 * 60 * 1000
            ? "open" as const
            : "closed" as const;
    }
    const visibleConversations = useMemo(
        () => conversations.filter((conversation) => !hiddenChats[normalizePhone(conversation.phone)]),
        [conversations, hiddenChats]
    );

    const [actionMode, setActionMode] = useState<"text" | "bot">("text");
    const [bulkText, setBulkText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const formSubmittedPhoneSet = useMemo(
        () => new Set(formSubmittedPhones.map(normalizeEnquiryPhone).filter(Boolean)),
        [formSubmittedPhones]
    );
    const demoScheduleByPhone = useMemo(() => {
        const scheduleMap = new Map<string, DemoSchedule>();

        for (const schedule of demoSchedules) {
            const phone = normalizeEnquiryPhone(schedule.phone_number);

            if (phone && !scheduleMap.has(phone)) {
                scheduleMap.set(phone, schedule);
            }
        }

        return scheduleMap;
    }, [demoSchedules]);

    function formatDemoTime(value: string) {
        const [hoursText, minutesText] = value.split(":");
        const hours = Number(hoursText);
        const minutes = Number(minutesText);

        if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
            return value;
        }

        const suffix = hours >= 12 ? "PM" : "AM";
        const displayHour = hours % 12 || 12;

        return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
    }

    function getLocalDateString(date: Date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");
    }
    const windowOpenConversations = useMemo(() => {
        if (!openTextOnly) return visibleConversations;

        const now = Date.now();
        const windowMs = 24 * 60 * 60 * 1000;

        return visibleConversations.filter((conversation) => {
            const phoneKey = normalizePhone(conversation.phone);
            const latestInboundAt = latestInboundByPhone[phoneKey];

            return (
                latestInboundAt !== undefined &&
                latestInboundAt <= now &&
                now - latestInboundAt <= windowMs
            );
        });
    }, [openTextOnly, visibleConversations, latestInboundByPhone]);


    const filteredConversations = useMemo(() => {
        const query = search.trim().toLowerCase();
        const normalizedQuery = normalizePhone(query);

        if (!query) return windowOpenConversations;

        return windowOpenConversations.filter((conversation) => {
            const phoneKey = normalizePhone(conversation.phone);

            const incomingText = inbound
                .filter(
                    (message) =>
                        normalizePhone(message.phone_number) === phoneKey
                )
                .map((message) =>
                    getMessageText(message.message_text, message.message_type)
                )
                .join(" ");

            const contact = contacts.find(
                (item) => normalizePhone(item.phone_number) === phoneKey
            );

            const conversationContactId = contact?.id ?? conversation.contactId;

            const outgoingText = logs
                .filter(
                    (message) =>
                        Boolean(conversationContactId) &&
                        message.direction === "outbound" &&
                        message.contact_id === conversationContactId
                )
                .map((message) => message.message_text ?? "")
                .join(" ");

            const searchableText = [
                conversation.name,
                conversation.phone,
                conversation.lastText,
                incomingText,
                outgoingText,
            ]
                .join(" ")
                .toLowerCase();

            return (
                searchableText.includes(query) ||
                (!!normalizedQuery && phoneKey.includes(normalizedQuery))
            );
        });
    }, [search, windowOpenConversations, inbound, logs, contacts]);

    const selectedBot = botTemplates.find((bot) => bot.id === selectedBotId);
    async function loadOpenTextContacts() {
        if (openTextLoading) return;

        setOpenTextLoading(true);
        setError("");

        try {
            const latestByPhone: Record<string, number> = {};
            const batchSize = 1000;
            let from = 0;

            while (true) {
                const { data, error: queryError } = await supabase
                    .from("whatsapp_inbound_messages")
                    .select("phone_number, received_at")
                    .order("received_at", { ascending: false })
                    .range(from, from + batchSize - 1);

                if (queryError) throw queryError;

                const rows = data ?? [];

                for (const row of rows) {
                    const phone = normalizePhone(row.phone_number);
                    const timestamp = new Date(row.received_at).getTime();

                    if (
                        phone &&
                        Number.isFinite(timestamp) &&
                        latestByPhone[phone] === undefined
                    ) {
                        latestByPhone[phone] = timestamp;
                    }
                }

                if (rows.length < batchSize) break;

                from += batchSize;
            }

            setLatestInboundByPhone(latestByPhone);
            setOpenTextOnly(true);
            setSelectedPhones([]);
            setActionMode("text");
            setNotice("");
            setShowBulkActions(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? `Open Text filter load nahi hua: ${err.message}`
                    : "Open Text filter load nahi hua."
            );
        } finally {
            setOpenTextLoading(false);
        }
    }
    function togglePhone(phone: string) {
        const key = normalizePhone(phone);

        setSelectedPhones((current) =>
            current.some((item) => normalizePhone(item) === key)
                ? current.filter((item) => normalizePhone(item) !== key)
                : [...current, phone]
        );
    }

    function toggleAllVisible() {
        const visibleKeys = new Set(
            filteredConversations.map((item) => normalizePhone(item.phone))
        );

        const allVisibleSelected =
            filteredConversations.length > 0 &&
            filteredConversations.every((conversation) =>
                selectedPhones.some(
                    (phone) =>
                        normalizePhone(phone) === normalizePhone(conversation.phone)
                )
            );

        setSelectedPhones((current) =>
            allVisibleSelected
                ? current.filter((phone) => !visibleKeys.has(normalizePhone(phone)))
                : [
                    ...current.filter(
                        (phone) => !visibleKeys.has(normalizePhone(phone))
                    ),
                    ...filteredConversations
                        .filter(
                            (conversation) =>
                                !current.some(
                                    (phone) =>
                                        normalizePhone(phone) ===
                                        normalizePhone(conversation.phone)
                                )
                        )
                        .map((conversation) => conversation.phone),
                ]
        );
    }

    async function sendBulkAction() {
        if (sending) return;

        const phones = [
            ...new Set(selectedPhones.map(normalizePhone).filter(Boolean)),
        ];

        if (phones.length === 0) {
            setError("Pehle chats select karein.");
            return;
        }

        if (phones.length > 100) {
            setError("Ek baar mein maximum 100 contacts select karein.");
            return;
        }

        if (actionMode === "text" && !bulkText.trim()) {
            setError("Normal Text message likhein.");
            return;
        }

        if (actionMode === "bot" && !selectedBotId) {
            setError("Bot dropdown se Bot select karein.");
            return;
        }

        setSending(true);
        setError("");
        setNotice("");

        let sent = 0;
        let failed = 0;
        const failures: string[] = [];

        try {
            let botFlow: any = null;
            let botName = "";

            if (actionMode === "bot") {
                const { data, error: botError } = await supabase
                    .from("whatsapp_bot_templates")
                    .select("id,name,flow,status")
                    .eq("id", selectedBotId)
                    .eq("status", "active")
                    .single();

                if (botError) throw botError;

                botFlow = data.flow;
                botName = data.name;

                if (!Array.isArray(botFlow?.nodes) || botFlow.nodes.length === 0) {
                    throw new Error("Selected Bot mein koi question nahi hai.");
                }
            }

            for (const phone of phones) {
                let createdSessionId: string | null = null;

                try {
                    const contact = contacts.find(
                        (item) => normalizePhone(item.phone_number) === phone
                    );

                    const consent = String(contact?.consent_status ?? "").toLowerCase();

                    if (
                        [
                            "opted_out",
                            "optout",
                            "unsubscribed",
                            "stopped",
                            "blocked",
                        ].includes(consent)
                    ) {
                        throw new Error("Contact has opted out.");
                    }

                    const phoneVariants = [...new Set([phone, `+${phone}`])];

                    const {
                        data: optedOutLeads,
                        error: optOutError,
                    } = await supabase
                        .from("meta_leads")
                        .select("id")
                        .in("whatsapp_number", phoneVariants)
                        .eq("whatsapp_opted_out", true)
                        .limit(1);

                    if (optOutError) {
                        throw new Error("Opt-out status verify nahi hua; message skip kiya.");
                    }

                    if (optedOutLeads?.length) {
                        throw new Error("Contact ne WhatsApp opt-out kiya hai.");
                    }

                    const latestInbound = inbound
                        .filter(
                            (message) => normalizePhone(message.phone_number) === phone
                        )
                        .reduce<InboxInbound | null>((latest, message) => {
                            if (
                                !latest ||
                                new Date(message.received_at).getTime() >
                                new Date(latest.received_at).getTime()
                            ) {
                                return message;
                            }

                            return latest;
                        }, null);

                    const lastInboundAt = latestInbound
                        ? new Date(latestInbound.received_at).getTime()
                        : 0;

                    if (
                        !lastInboundAt ||
                        Date.now() - lastInboundAt > 24 * 60 * 60 * 1000
                    ) {
                        throw new Error(
                            "WhatsApp 24-hour window closed hai; free-form send skip hua."
                        );
                    }

                    let contactId = contact?.id ?? null;

                    if (!contactId) {
                        const { data: newContact, error: contactError } =
                            await supabase
                                .from("whatsapp_contacts")
                                .upsert(
                                    { phone_number: phone, name: phone },
                                    { onConflict: "phone_number" }
                                )
                                .select("id")
                                .single();

                        if (contactError) throw contactError;
                        contactId = newContact?.id ?? null;
                    }

                    if (actionMode === "text") {
                        const message = bulkText.trim();

                        if (message.length > 4096) {
                            throw new Error("Message maximum 4096 characters ka ho sakta hai.");
                        }

                        const { data, error: sendError } =
                            await supabase.functions.invoke("whatsapp-send", {
                                body: {
                                    to: phone,
                                    type: "text",
                                    message,
                                },
                            });

                        if (sendError) throw sendError;

                        if (!data?.success || !data?.message_id) {
                            throw new Error(data?.error || "Message send failed.");
                        }

                        const { error: logError } = await supabase
                            .from("whatsapp_message_logs")
                            .insert({
                                contact_id: contactId,
                                direction: "outbound",
                                message_id: data.message_id,
                                message_type: "text",
                                message_text: message,
                                status: data.initial_status ?? "accepted",
                                event_at: new Date().toISOString(),
                            });

                        if (logError) {
                            console.error("Bulk message log save failed:", logError.message);
                        }

                        sent++;
                        continue;
                    }

                    const activeSession = await supabase
                        .from("whatsapp_bot_sessions")
                        .select("id")
                        .eq("phone_number", phone)
                        .eq("status", "active")
                        .maybeSingle();

                    if (activeSession.error) throw activeSession.error;

                    if (activeSession.data) {
                        throw new Error("Is contact ka Bot pehle se active hai.");
                    }

                    const firstNode = botFlow.nodes[0];
                    const options = Array.isArray(firstNode.options)
                        ? firstNode.options
                        : [];

                    if (!firstNode?.id || !String(firstNode.question ?? "").trim()) {
                        throw new Error("Bot ka first question khaali hai.");
                    }

                    let requestBody: Record<string, unknown>;
                    let loggedMessage = String(firstNode.question);
                    let loggedType = "text";

                    if (firstNode.type === "text") {
                        requestBody = {
                            to: phone,
                            type: "text",
                            message: loggedMessage,
                        };
                    } else if (firstNode.type === "buttons") {
                        if (options.length < 1 || options.length > 3) {
                            throw new Error("Bot buttons ke liye 1 se 3 options chahiye.");
                        }

                        requestBody = {
                            to: phone,
                            type: "buttons",
                            message: loggedMessage,
                            buttons: options.map((option: any) => ({
                                id: option.id,
                                title: option.title,
                            })),
                        };

                        loggedType = "interactive";
                        loggedMessage += "\n" +
                            options.map((option: any) => `• ${option.title}`).join("\n");
                    } else if (firstNode.type === "list") {
                        if (options.length < 1 || options.length > 10) {
                            throw new Error("Bot list ke liye 1 se 10 options chahiye.");
                        }

                        requestBody = {
                            to: phone,
                            type: "list",
                            message: loggedMessage,
                            button_text: "Options",
                            sections: [
                                {
                                    title: "Options",
                                    rows: options.map((option: any) => ({
                                        id: option.id,
                                        title: option.title,
                                    })),
                                },
                            ],
                        };

                        loggedType = "interactive";
                        loggedMessage += "\n" +
                            options.map((option: any) => `• ${option.title}`).join("\n");
                    } else {
                        throw new Error("Bot question type Text, Buttons ya List hona chahiye.");
                    }

                    const { data: session, error: sessionError } = await supabase
                        .from("whatsapp_bot_sessions")
                        .insert({
                            bot_id: selectedBotId,
                            phone_number: phone,
                            current_node_id: firstNode.id,
                            status: "active",
                        })
                        .select("id")
                        .single();

                    if (sessionError) throw sessionError;
                    createdSessionId = session.id;

                    const { data: sendData, error: sendError } =
                        await supabase.functions.invoke("whatsapp-send", {
                            body: requestBody,
                        });

                    if (sendError) throw sendError;

                    if (!sendData?.success || !sendData?.message_id) {
                        throw new Error(
                            sendData?.error || "Bot ka first question send nahi hua."
                        );
                    }

                    const { error: logError } = await supabase
                        .from("whatsapp_message_logs")
                        .insert({
                            contact_id: contactId,
                            direction: "outbound",
                            message_id: sendData.message_id,
                            message_type: loggedType,
                            message_text: loggedMessage,
                            status: sendData.initial_status ?? "accepted",
                            event_at: new Date().toISOString(),
                        });

                    if (logError) {
                        console.error("Bot message log save failed:", logError.message);
                    }

                    sent++;
                } catch (recipientError) {
                    failed++;

                    if (createdSessionId) {
                        await supabase
                            .from("whatsapp_bot_sessions")
                            .update({ status: "paused" })
                            .eq("id", createdSessionId)
                            .eq("status", "active");
                    }

                    failures.push(
                        `${phone}: ${recipientError instanceof Error
                            ? recipientError.message
                            : "Send failed"
                        }`
                    );
                }
            }

            await onRefreshInbox();

            setNotice(
                `Complete. Sent/started: ${sent}. Failed/skipped: ${failed}.` +
                (actionMode === "bot" ? ` Bot: ${botName}.` : "")
            );

            if (failures.length) {
                setError(
                    failures.slice(0, 8).join("\n") +
                    (failures.length > 8 ? `\n...and ${failures.length - 8} more.` : "")
                );
            }

            if (sent > 0) {
                setSelectedPhones([]);
                if (actionMode === "text") setBulkText("");
            }
        } catch (sendError) {
            setError(
                sendError instanceof Error
                    ? sendError.message
                    : "Bulk action failed."
            );
        } finally {
            setSending(false);
        }
    }

    const allVisibleSelected =
        filteredConversations.length > 0 &&
        filteredConversations.every((conversation) =>
            selectedPhones.some(
                (phone) =>
                    normalizePhone(phone) === normalizePhone(conversation.phone)
            )
        );

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 space-y-3 border-b border-gray-200 bg-white p-3">
                {error && (
                    <div className="flex items-start gap-2 whitespace-pre-wrap rounded-lg bg-red-50 p-2 text-xs text-red-700">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        <span className="min-w-0 flex-1">{error}</span>
                        <button type="button" onClick={() => setError("")}>×</button>
                    </div>
                )}

                {notice && (
                    <p className="rounded-lg bg-green-50 p-2 text-xs text-green-800">
                        {notice}
                    </p>
                )}

                <div className="flex items-center gap-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f0f2f5] px-3">
                        <Search size={16} className="shrink-0 text-gray-500" />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, phone, Bot question or answer"
                            className="h-9 min-w-0 w-full bg-transparent text-xs outline-none"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="shrink-0 text-gray-500"
                            >
                                ×
                            </button>
                        )}
                    </label>

                    <button
                        type="button"
                        onClick={() => setShowBulkActions(true)}
                        className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Send size={14} />
                        Go
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-800">
                            {selectedPhones.length}
                        </span>
                    </button>
                </div>

                {selectedPhones.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setSelectedPhones([])}
                        disabled={sending}
                        className="text-xs font-medium text-[#008069] hover:bg-green-50 disabled:opacity-50"
                    >
                        Clear selection
                    </button>
                )}

                {showBulkActions && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-5"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget && !sending) {
                                setShowBulkActions(false);
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="bulk-actions-title"
                            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
                                <div>
                                    <h3
                                        id="bulk-actions-title"
                                        className="font-semibold text-gray-900"
                                    >
                                        Bulk Actions
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {selectedPhones.length} contacts selected
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowBulkActions(false)}
                                    disabled={sending}
                                    className="flex size-9 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                    aria-label="Close bulk actions"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={toggleAllVisible}
                                            disabled={!filteredConversations.length || sending}
                                            className="accent-[#008069]"
                                        />
                                        Select all filtered ({filteredConversations.length})
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedPhones([])}
                                        disabled={!selectedPhones.length || sending}
                                        className="text-xs font-medium text-[#008069] disabled:text-gray-400"
                                    >
                                        Clear selection
                                    </button>
                                </div>

                                <select
                                    value={actionMode}
                                    onChange={(event) =>
                                        setActionMode(event.target.value as "text" | "bot")
                                    }
                                    disabled={sending}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="text">Normal Text</option>
                                    <option value="bot">Start Bot</option>
                                </select>

                                {actionMode === "text" ? (
                                    <textarea
                                        value={bulkText}
                                        onChange={(event) => setBulkText(event.target.value)}
                                        maxLength={4096}
                                        rows={4}
                                        placeholder="Type message for selected contacts..."
                                        disabled={sending}
                                        className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#008069]"
                                    />
                                ) : (
                                    <label className="block space-y-1">
                                        <span className="text-xs font-medium text-gray-600">
                                            Select Bot
                                        </span>

                                        <select
                                            value={selectedBotId}
                                            onChange={(event) =>
                                                onSelectedBotIdChange(event.target.value)
                                            }
                                            disabled={sending}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        >
                                            <option value="">Select an active bot...</option>
                                            {botTemplates.map((bot) => (
                                                <option key={bot.id} value={bot.id}>
                                                    {bot.name}
                                                </option>
                                            ))}
                                        </select>

                                        {selectedBot && (
                                            <span className="text-xs text-gray-500">
                                                Selected: {selectedBot.name}
                                            </span>
                                        )}
                                    </label>
                                )}

                                <button
                                    type="button"
                                    onClick={() => void sendBulkAction()}
                                    disabled={
                                        sending ||
                                        selectedPhones.length === 0 ||
                                        (actionMode === "text" && !bulkText.trim()) ||
                                        (actionMode === "bot" && !selectedBotId)
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008069] px-3 py-3 text-sm font-semibold text-white hover:bg-[#006e5b] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {sending ? (
                                        <>
                                            <LoaderCircle size={16} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            {actionMode === "bot"
                                                ? `Start Bot (${selectedPhones.length})`
                                                : `Send Text (${selectedPhones.length})`}
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                        {error}
                                    </div>
                                )}

                                {notice && (
                                    <div className="rounded-lg bg-green-50 p-3 text-xs text-green-800">
                                        {notice}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-gray-500">
                    <span>
                        Chats ({filteredConversations.length})
                    </span>

                    <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-[#111b21]">
                        <input
                            type="checkbox"
                            checked={openTextOnly}
                            onChange={(event) => {
                                const checked = event.target.checked;

                                if (checked) {
                                    void loadOpenTextContacts();
                                } else {
                                    setOpenTextOnly(false);
                                    setSelectedPhones([]);
                                }
                            }}
                            disabled={sending || openTextLoading}
                            className="size-3.5 accent-[#008069]"
                        />
                        Open Text
                    </label>
                </div>

                {filteredConversations.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-gray-500">
                        No conversations found
                    </p>
                ) : (
                    filteredConversations.map((conversation) => {
                        const phoneKey = normalizePhone(conversation.phone);
                        const checked = selectedPhones.some(
                            (phone) => normalizePhone(phone) === phoneKey
                        );
                        const botActive = activeBotPhones.some(
                            (phone) => normalizePhone(phone) === phoneKey
                        );
                        const isActiveChat =
                            normalizePhone(selectedPhone) === phoneKey;
                        return (
                            <div
                                key={phoneKey}
                                className={`flex items-center gap-2 border-b border-[#f0f2f5] border-l-4 pr-2 ${isActiveChat
                                    ? "border-l-[#008069] bg-[#e7fce9]"
                                    : checked
                                        ? "border-l-transparent bg-[#f0f2f5]"
                                        : "border-l-transparent bg-white"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    aria-label={`Select ${conversation.name}`}
                                    checked={checked}
                                    onChange={() => togglePhone(conversation.phone)}
                                    disabled={sending}
                                    className="ml-3 size-4 shrink-0 accent-[#008069]"
                                />

                                <InboxRightClick
                                    phone={conversation.phone}
                                    name={conversation.name}
                                    contactId={
                                        contacts.find(
                                            (item) =>
                                                normalizePhone(item.phone_number) === phoneKey
                                        )?.id ?? conversation.contactId
                                    }
                                    onUpdated={onRefreshInbox}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onOpenConversation(conversation.phone)}
                                        className="flex min-w-0 flex-1 items-center gap-2 text-left hover:bg-[#f5f6f6]"
                                    >
                                        <div className="min-w-0 flex-1 py-2">
                                            <div className="flex min-w-0 items-center justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-1.5">
                                                    <span className="truncate text-[15px] font-medium leading-5 text-[#111b21]">
                                                        {conversation.name}
                                                    </span>

                                                    {formSubmittedPhoneSet.has(
                                                        normalizeEnquiryPhone(conversation.phone)
                                                    ) && (
                                                            <span
                                                                className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800"
                                                                title="Form submitted"
                                                            >
                                                                Form Filled
                                                            </span>
                                                        )}

                                                    {(() => {
                                                        const schedule = demoScheduleByPhone.get(
                                                            normalizeEnquiryPhone(conversation.phone)
                                                        );

                                                        if (!schedule) return null;

                                                        const isToday =
                                                            schedule.demo_date === getLocalDateString(new Date());

                                                        return (
                                                            <span
                                                                title={`Demo scheduled for ${schedule.demo_date} at ${formatDemoTime(schedule.start_time)}`}
                                                                className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${isToday
                                                                    ? "animate-pulse border-fuchsia-300 bg-gradient-to-r from-fuchsia-100 via-amber-100 to-cyan-100 text-fuchsia-800 shadow-sm"
                                                                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
                                                                    }`}
                                                            >
                                                                <span className="mr-1">●</span>
                                                                {formatDemoTime(schedule.start_time)}
                                                            </span>
                                                        );
                                                    })()}

                                                    {botActive && (
                                                        <span
                                                            className="size-2 shrink-0 rounded-full bg-[#25d366]"
                                                            title="Bot Active"
                                                        />
                                                    )}
                                                </div>

                                                <span className="shrink-0 text-[11px] leading-4 text-[#667781]">
                                                    {(() => {
                                                        if (!conversation.lastAt) return "";

                                                        const date = new Date(conversation.lastAt);
                                                        if (Number.isNaN(date.getTime())) return "";

                                                        const today = new Date();
                                                        const yesterday = new Date();
                                                        yesterday.setDate(today.getDate() - 1);

                                                        const isSameDay = (a: Date, b: Date) =>
                                                            a.getFullYear() === b.getFullYear() &&
                                                            a.getMonth() === b.getMonth() &&
                                                            a.getDate() === b.getDate();

                                                        if (isSameDay(date, today)) {
                                                            return date.toLocaleTimeString("en-US", {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                            });
                                                        }

                                                        if (isSameDay(date, yesterday)) {
                                                            return "Yesterday";
                                                        }

                                                        return date.toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        });
                                                    })()}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="min-w-0 flex-1 truncate text-[13px] leading-[19px] text-[#667781]">
                                                    {conversation.lastText || "No messages yet"}
                                                </div>

                                                {(() => {
                                                    const status = getWindowStatus(conversation.phone);

                                                    if (status === "unknown") return null;

                                                    return status === "open" ? (
                                                        <span
                                                            className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800"
                                                            title="Customer service window open"
                                                        >
                                                            Open
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-800"
                                                            title="Customer service window closed"
                                                        >
                                                            Closed
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </button>
                                </InboxRightClick>
                            </div>

                        );
                    })
                )}
            </div>
        </div>
    );
}
