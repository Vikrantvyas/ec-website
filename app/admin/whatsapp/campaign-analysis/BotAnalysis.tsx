
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import Link from "next/link";
type BotSession = {
    id: string;
    bot_id: string | null;
    phone_number: string;
    status: string | null;
    started_at: string;
    current_node_id: string | null;
};

type BotTemplate = {
    id: string;
    name: string;
};

type InboundMessage = {
    phone_number: string;
    message_text: string | null;
    message_type: string | null;
    received_at: string;
};

type WhatsAppContact = {
    name: string | null;
    phone_number: string;
};

type BotSummary = {
    id: string;
    name: string;
    sessions: BotSession[];
};

function getIndiaDate() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

function getIndiaDateRange(date: string) {
    const start = new Date(`${date}T00:00:00+05:30`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    return {
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
    };
}

function normalizePhone(value: string | null | undefined) {
    return (value ?? "").replace(/\D/g, "").replace(/^0+/, "");
}

function formatDate(value: string | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function getStatusLabel(status: string | null) {
    const value = (status ?? "unknown").toLowerCase();

    if (value === "completed") return "Completed";
    if (value === "active") return "Active";
    if (value === "paused") return "Paused";
    if (value === "failed") return "Failed";

    return status || "Unknown";
}

export function BotAnalysis() {
    const [selectedDate, setSelectedDate] = useState(getIndiaDate);
    const [sessions, setSessions] = useState<BotSession[]>([]);
    const [templates, setTemplates] = useState<BotTemplate[]>([]);
    const [replies, setReplies] = useState<InboundMessage[]>([]);
    const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
    const [expandedBotId, setExpandedBotId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadAnalysis = useCallback(async () => {
        if (!selectedDate) return;

        setLoading(true);
        setError("");
        setExpandedBotId(null);

        try {
            const { startUtc, endUtc } = getIndiaDateRange(selectedDate);

            // 1. Selected date ke bot sessions load karein.
            const { data: sessionData, error: sessionError } = await supabase
                .from("whatsapp_bot_sessions")
                .select(
                    "id,bot_id,phone_number,status,started_at,current_node_id"
                )
                .gte("started_at", startUtc)
                .lt("started_at", endUtc)
                .order("started_at", { ascending: false });

            if (sessionError) throw sessionError;

            const sessionRows = (sessionData ?? []) as BotSession[];
            setSessions(sessionRows);

            // 2. Student/contact names load karein.
            const { data: contactData, error: contactError } = await supabase
                .from("whatsapp_contacts")
                .select("name,phone_number");

            if (contactError) throw contactError;

            setContacts((contactData ?? []) as WhatsAppContact[]);

            // 3. Sessions se related bot templates load karein.
            const botIds = Array.from(
                new Set(
                    sessionRows
                        .map((session) => session.bot_id)
                        .filter((id): id is string => Boolean(id))
                )
            );

            if (botIds.length) {
                const { data: templateData, error: templateError } =
                    await supabase
                        .from("whatsapp_bot_templates")
                        .select("id,name")
                        .in("id", botIds);

                if (templateError) throw templateError;

                setTemplates((templateData ?? []) as BotTemplate[]);
            } else {
                setTemplates([]);
            }

            // 4. Selected date ke inbound replies load karein.
            const { data: inboundData, error: inboundError } = await supabase
                .from("whatsapp_inbound_messages")
                .select("phone_number,message_text,message_type,received_at")
                .gte("received_at", startUtc)
                .lt("received_at", endUtc)
                .order("received_at", { ascending: true });

            if (inboundError) throw inboundError;

            setReplies((inboundData ?? []) as InboundMessage[]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Bot analysis load nahi ho saki."
            );

            setSessions([]);
            setTemplates([]);
            setReplies([]);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        void loadAnalysis();
    }, [loadAnalysis]);

    const bots = useMemo<BotSummary[]>(() => {
        const groups = new Map<string, BotSummary>();

        for (const session of sessions) {
            const id = session.bot_id || "unknown";
            const template = templates.find((item) => item.id === id);
            const name = template?.name || "Unknown Bot";

            if (!groups.has(id)) {
                groups.set(id, {
                    id,
                    name,
                    sessions: [],
                });
            }

            groups.get(id)!.sessions.push(session);
        }

        return Array.from(groups.values()).sort(
            (a, b) => b.sessions.length - a.sessions.length
        );
    }, [sessions, templates]);

    // Phone number se contact ka naam nikalein.
    function getContactName(phoneNumber: string) {
        const normalized = normalizePhone(phoneNumber);

        const contact = contacts.find(
            (item) => normalizePhone(item.phone_number) === normalized
        );

        return contact?.name?.trim() || "Name not available";
    }

    function getRepliesForSession(session: BotSession) {
        const sessionPhone = normalizePhone(session.phone_number);
        const startTime = new Date(session.started_at).getTime();

        return replies.filter((reply) => {
            const replyTime = new Date(reply.received_at).getTime();

            return (
                normalizePhone(reply.phone_number) === sessionPhone &&
                replyTime >= startTime
            );
        });
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                        <BarChart3 className="h-6 w-6 text-green-700" />
                        Bot Analysis
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Date-wise bot runs, sessions aur student replies dekhein.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <label className="text-sm text-gray-600">
                        Date
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) =>
                                setSelectedDate(event.target.value)
                            }
                            className="mt-1 block rounded-lg border px-3 py-2"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={() => void loadAnalysis()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Bots Run</p>
                    <p className="mt-1 text-2xl font-bold">{bots.length}</p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Total Sessions</p>
                    <p className="mt-1 text-2xl font-bold">
                        {sessions.length}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Completed Sessions</p>
                    <p className="mt-1 text-2xl font-bold">
                        {
                            sessions.filter(
                                (session) =>
                                    (session.status ?? "").toLowerCase() ===
                                    "completed"
                            ).length
                        }
                    </p>
                </div>
            </div>

            <section className="overflow-hidden rounded-xl border bg-white">
                <div className="border-b p-4">
                    <h3 className="font-semibold text-gray-900">
                        Bots run on {selectedDate}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Date India time (IST) ke hisaab se filter hoti hai.
                    </p>
                </div>

                {loading ? (
                    <p className="p-8 text-center text-sm text-gray-500">
                        Bot analysis load ho rahi hai...
                    </p>
                ) : bots.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-500">
                        Is date par koi bot session nahi mila.
                    </p>
                ) : (
                    <div className="divide-y">
                        {bots.map((bot) => {
                            const expanded = expandedBotId === bot.id;

                            const completed = bot.sessions.filter(
                                (session) =>
                                    (session.status ?? "").toLowerCase() ===
                                    "completed"
                            ).length;

                            const active = bot.sessions.filter(
                                (session) =>
                                    (session.status ?? "").toLowerCase() ===
                                    "active"
                            ).length;

                            const repliedSessions = bot.sessions.filter(
                                (session) =>
                                    getRepliesForSession(session).length > 0
                            ).length;

                            return (
                                <div key={bot.id}>
                                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {bot.name}
                                            </h4>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Bot ID: {bot.id}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                                                    Sessions: {bot.sessions.length}
                                                </span>

                                                <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">
                                                    Completed: {completed}
                                                </span>

                                                <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                                                    Active: {active}
                                                </span>

                                                <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">
                                                    Replied: {repliedSessions}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedBotId(
                                                    expanded ? null : bot.id
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                        >
                                            {expanded
                                                ? "Hide Analysis"
                                                : "Analyze Bot"}

                                            {expanded ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {expanded && (
                                        <div className="border-t bg-gray-50 p-4">
                                            <h5 className="mb-3 font-semibold text-gray-800">
                                                Student-wise session details
                                            </h5>

                                            <div className="overflow-x-auto rounded-lg border bg-white">
                                                <table className="w-full min-w-[1000px] text-left text-sm">
                                                    <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                                                        <tr>
                                                            <th className="px-3 py-3">
                                                                Date
                                                            </th>
                                                            <th className="px-3 py-3">
                                                                Name
                                                            </th>
                                                            <th className="px-3 py-3">
                                                                Contact Number
                                                            </th>
                                                            <th className="px-3 py-3">
                                                                Status
                                                            </th>
                                                            <th className="px-3 py-3">
                                                                Replies
                                                            </th>
                                                            <th className="px-3 py-3">
                                                                Reply Details
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y">
                                                        {bot.sessions.map(
                                                            (session) => {
                                                                const sessionReplies =
                                                                    getRepliesForSession(
                                                                        session
                                                                    );

                                                                return (
                                                                    <tr
                                                                        key={session.id}
                                                                        className="align-top"
                                                                    >
                                                                        <td className="whitespace-nowrap px-3 py-3">
                                                                            {formatDate(
                                                                                session.started_at
                                                                            )}
                                                                        </td>

                                                                        <td className="px-3 py-3">
                                                                            {getContactName(
                                                                                session.phone_number
                                                                            )}
                                                                        </td>

                                                                       <td className="whitespace-nowrap px-3 py-3">
    <Link
        href={`/admin/whatsapp/inbox?phone=${encodeURIComponent(session.phone_number)}`}
        className="font-medium text-green-700 underline decoration-green-300 underline-offset-2 hover:text-green-900"
        title="WhatsApp Inbox mein chat kholein"
    >
        {session.phone_number}
    </Link>
</td>

                                                                        <td className="px-3 py-3">
                                                                            {getStatusLabel(
                                                                                session.status
                                                                            )}
                                                                        </td>

                                                                        <td className="px-3 py-3">
                                                                            {sessionReplies.length}
                                                                        </td>

                                                                        <td className="max-w-md px-3 py-3">
                                                                            {sessionReplies.length ===
                                                                            0 ? (
                                                                                <span className="text-gray-400">
                                                                                    Is date ke data mein reply nahi mila.
                                                                                </span>
                                                                            ) : (
                                                                                <div className="space-y-2">
                                                                                    {sessionReplies.map(
                                                                                        (
                                                                                            reply,
                                                                                            index
                                                                                        ) => (
                                                                                            <div
                                                                                                key={`${reply.received_at}-${index}`}
                                                                                                className="rounded-md bg-gray-50 p-2"
                                                                                            >
                                                                                                <p className="break-words">
                                                                                                    {reply.message_text ||
                                                                                                        `[${reply.message_type || "Message"}]`}
                                                                                                </p>

                                                                                                <p className="mt-1 text-xs text-gray-400">
                                                                                                    {formatDate(
                                                                                                        reply.received_at
                                                                                                    )}
                                                                                                </p>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <p className="mt-3 text-xs text-gray-500">
                                                Reply count inbound messages par
                                                based hai. Yeh attendance ya
                                                delivered/read status ka proof
                                                nahi hai. Purane failed/skipped
                                                reasons database mein save nahi
                                                hon to yahan unki details nahi
                                                dikhengi.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
