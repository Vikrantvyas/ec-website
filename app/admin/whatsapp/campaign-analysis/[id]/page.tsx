
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    CheckCircle2,
    Eye,
    RefreshCw,
    Send,
    ShieldAlert,
    Users,
    XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";

type Campaign = {
    id: string;
    name: string;
    status: string;
    total_recipients: number | null;
    accepted_count: number | null;
    delivered_count: number | null;
    read_count: number | null;
    failed_count: number | null;
    estimated_cost: number | null;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
};

type Recipient = {
    id: string;
    campaign_id: string;
    contact_id: string;
    status: string;
    message_id: string | null;
    error_code: string | null;
    error_message: string | null;
    attempts: number | null;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    created_at: string;
};

type ContactInfo = {
    id: string;
    name: string | null;
    phone_number: string | null;
};
type InboundReply = {
    phone_number: string;
    message_text: string | null;
    received_at: string;
};
type MessageLog = {
    message_id: string | null;
    status: string | null;
    error_code: string | null;
    error_message: string | null;
    event_at: string;
    created_at: string;
};

type DeliveryStatus =
    | "read"
    | "delivered"
    | "failed"
    | "sent"
    | "accepted"
    | "pending"
    | "unknown";

type RecipientView = Recipient & {
    finalStatus: DeliveryStatus;
    finalError: string;
};

type SortKey =
    | "name"
    | "phone_number"
    | "last_reply"
    | "finalStatus"
    | "sent_at";

function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function number(value: number | null | undefined) {
    return Number(value ?? 0).toLocaleString("en-IN");
}

function percent(value: number, total: number) {
    if (!total) return "0.0%";
    return `${((value / total) * 100).toFixed(1)}%`;
}

function normalizeStatus(value: string | null | undefined): DeliveryStatus {
    const status = (value ?? "").toLowerCase().trim();

    if (status === "read") return "read";
    if (status === "delivered") return "delivered";
    if (status === "failed") return "failed";
    if (status === "sent") return "sent";
    if (status === "accepted") return "accepted";

    if (
        status === "queued" ||
        status === "sending" ||
        status === "skipped"
    ) {
        return "pending";
    }

    return "unknown";
}

function resolveStatus(
    recipient: Recipient,
    logs: MessageLog[]
): { status: DeliveryStatus; error: string } {
    const usableLogs = logs.filter(
        (log) => log.status && log.status.toLowerCase() !== "status"
    );

    const statuses = usableLogs.map((log) => normalizeStatus(log.status));

    let finalStatus: DeliveryStatus;

    if (statuses.includes("read")) {
        finalStatus = "read";
    } else if (statuses.includes("delivered")) {
        finalStatus = "delivered";
    } else if (statuses.includes("failed")) {
        finalStatus = "failed";
    } else if (statuses.includes("sent")) {
        finalStatus = "sent";
    } else if (statuses.includes("accepted")) {
        finalStatus = "accepted";
    } else {
        finalStatus = normalizeStatus(recipient.status);
    }

    const errorLog = [...usableLogs]
        .filter((log) => log.error_message || log.error_code)
        .sort(
            (a, b) =>
                new Date(b.event_at).getTime() - new Date(a.event_at).getTime()
        )[0];

    return {
        status: finalStatus,
        error:
            errorLog?.error_message ||
            errorLog?.error_code ||
            recipient.error_message ||
            recipient.error_code ||
            "",
    };
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        read: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
        sent: "bg-blue-100 text-blue-800",
        accepted: "bg-sky-100 text-sky-800",
        failed: "bg-red-100 text-red-800",
        completed: "bg-green-100 text-green-800",
        running: "bg-blue-100 text-blue-800",
        queued: "bg-amber-100 text-amber-800",
        paused: "bg-amber-100 text-amber-800",
        cancelled: "bg-gray-100 text-gray-700",
        draft: "bg-gray-100 text-gray-700",
        pending: "bg-amber-100 text-amber-800",
        unknown: "bg-gray-100 text-gray-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status.toLowerCase()] ?? "bg-gray-100 text-gray-700"
                }`}
        >
            {status || "Unknown"}
        </span>
    );
}

function MetricCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="mt-2 break-words text-2xl font-bold text-gray-900">
                        {value}
                    </p>
                    {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
                </div>
                <div className="rounded-lg bg-green-50 p-2 text-green-700">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function CampaignDetailsContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const campaignId = params.id;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [recipients, setRecipients] = useState<RecipientView[]>([]);
    const [contactsById, setContactsById] = useState<
        Record<string, ContactInfo>
    >({});
    const [logs, setLogs] = useState<MessageLog[]>([]);
    const [lastRepliesByPhone, setLastRepliesByPhone] = useState<
        Record<string, InboundReply>
    >({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortKey, setSortKey] = useState<SortKey>("sent_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const loadDetails = useCallback(async () => {
        if (!campaignId) {
            setError("Campaign ID URL mein nahi mili. Campaign History par jaakar Analyze par click karein.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        setError("");

        try {
            const { data: campaignData, error: campaignError } = await supabase
                .from("whatsapp_campaigns")
                .select(
                    "id,name,status,total_recipients,accepted_count,delivered_count,read_count,failed_count,estimated_cost,created_at,started_at,completed_at"
                )
                .eq("id", campaignId)
                .single();

            if (campaignError) throw campaignError;

            setCampaign(campaignData as Campaign);

            const { data: recipientData, error: recipientError } = await supabase
                .from("whatsapp_campaign_recipients")
                .select(
                    "id,campaign_id,contact_id,status,message_id,error_code,error_message,attempts,sent_at,delivered_at,read_at,created_at"
                )
                .eq("campaign_id", campaignId)
                .order("created_at", { ascending: true })
                .limit(5000);

            if (recipientError) throw recipientError;

            const recipientRows = (recipientData ?? []) as Recipient[];
            const contactIds = Array.from(
                new Set(
                    recipientRows
                        .map((row) => row.contact_id)
                        .filter((id): id is string => Boolean(id))
                )
            );

            const contactMap: Record<string, ContactInfo> = {};

            for (let i = 0; i < contactIds.length; i += 100) {
                const batch = contactIds.slice(i, i + 100);

                const { data: contactData, error: contactError } = await supabase
                    .from("whatsapp_contacts")
                    .select("id,name,phone_number")
                    .in("id", batch);

                if (contactError) throw contactError;

                for (const contact of (contactData ?? []) as ContactInfo[]) {
                    contactMap[contact.id] = contact;
                }
            }

            setContactsById(contactMap);
            const phoneNumbers = Array.from(
                new Set(
                    Object.values(contactMap)
                        .map((contact) => contact.phone_number)
                        .filter((phone): phone is string => Boolean(phone))
                )
            );

            const repliesByPhone: Record<string, InboundReply> = {};

            for (let i = 0; i < phoneNumbers.length; i += 100) {
                const batch = phoneNumbers.slice(i, i + 100);

                const { data: inboundData, error: inboundError } = await supabase
                    .from("whatsapp_inbound_messages")
                    .select("phone_number,message_text,received_at")
                    .in("phone_number", batch)
                    .order("received_at", { ascending: false })
                    .limit(5000);

                if (inboundError) throw inboundError;

                for (const reply of (inboundData ?? []) as InboundReply[]) {
                    if (
                        reply.phone_number &&
                        !repliesByPhone[reply.phone_number]
                    ) {
                        repliesByPhone[reply.phone_number] = reply;
                    }
                }
            }

            setLastRepliesByPhone(repliesByPhone);
            const messageIds = Array.from(
                new Set(
                    recipientRows
                        .map((row) => row.message_id)
                        .filter((id): id is string => Boolean(id))
                )
            );

            let logRows: MessageLog[] = [];

            for (let i = 0; i < messageIds.length; i += 100) {
                const batch = messageIds.slice(i, i + 100);

                const { data: logData, error: logError } = await supabase
                    .from("whatsapp_message_logs")
                    .select(
                        "message_id,status,error_code,error_message,event_at,created_at"
                    )
                    .eq("direction", "outbound")
                    .in("message_id", batch)
                    .order("event_at", { ascending: false })
                    .limit(1000);

                if (logError) throw logError;

                logRows = logRows.concat((logData ?? []) as MessageLog[]);
            }

            const logsByMessage = new Map<string, MessageLog[]>();

            for (const log of logRows) {
                if (!log.message_id) continue;
                const current = logsByMessage.get(log.message_id) ?? [];
                current.push(log);
                logsByMessage.set(log.message_id, current);
            }

            const views: RecipientView[] = recipientRows.map((recipient) => {
                const relatedLogs = recipient.message_id
                    ? logsByMessage.get(recipient.message_id) ?? []
                    : [];

                const result = resolveStatus(recipient, relatedLogs);

                return {
                    ...recipient,
                    finalStatus: result.status,
                    finalError: result.error,
                };
            });

            setRecipients(views);
            setLogs(logRows);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Campaign details load nahi ho sake."
            );
            setCampaign(null);
            setRecipients([]);
            setContactsById({});
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        void loadDetails();
    }, [loadDetails]);

    const counts = useMemo(() => {
        const result = {
            total: recipients.length,
            read: 0,
            delivered: 0,
            sent: 0,
            accepted: 0,
            failed: 0,
            pending: 0,
            unknown: 0,
        };

        for (const recipient of recipients) {
            result[recipient.finalStatus] += 1;
        }

        return result;
    }, [recipients]);

    const visibleRecipients = useMemo(() => {
        const term = search.trim().toLowerCase();

        const filtered = recipients.filter((recipient) => {
            const contact = contactsById[recipient.contact_id];

            const matchesStatus =
                statusFilter === "all" || recipient.finalStatus === statusFilter;

            const searchableText = [
                contact?.name ?? "",
                contact?.phone_number ?? "",
                recipient.contact_id,
                recipient.message_id ?? "",
                recipient.finalError,
                recipients,
                contactsById,
                statusFilter,
                recipient.error_code ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return matchesStatus && (!term || searchableText.includes(term));
        });

        return [...filtered].sort((a, b) => {
            const contactA = contactsById[a.contact_id];
            const contactB = contactsById[b.contact_id];

            let valueA = "";
            let valueB = "";

            switch (sortKey) {
                case "name":
                    valueA = contactA?.name ?? "";
                    valueB = contactB?.name ?? "";
                    break;
                case "phone_number":
                    valueA = contactA?.phone_number ?? "";
                    valueB = contactB?.phone_number ?? "";
                    break;
                case "last_reply":
                    valueA =
                        lastRepliesByPhone[contactA?.phone_number ?? ""]?.message_text ?? "";
                    valueB =
                        lastRepliesByPhone[contactB?.phone_number ?? ""]?.message_text ?? "";
                    break;
                case "finalStatus":
                    valueA = a.finalStatus;
                    valueB = b.finalStatus;
                    break;
                case "sent_at":
                    valueA = a.sent_at ?? "";
                    valueB = b.sent_at ?? "";
                    break;
            }

            const comparison =
                sortKey === "sent_at"
                    ? (new Date(valueA).getTime() || 0) -
                    (new Date(valueB).getTime() || 0)
                    : valueA.localeCompare(valueB, undefined, {
                        numeric: sortKey === "phone_number",
                        sensitivity: "base",
                    });

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [
        recipients,
        contactsById,
        statusFilter,
        lastRepliesByPhone,
        search,
        sortKey,
        sortDirection,
    ]);

    const sortLabel = (key: SortKey) =>
        sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕";

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/whatsapp/campaign-analysis")}
                        className="mb-3 inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaign History
                    </button>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-green-700" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Campaign Analysis
                        </h1>
                    </div>
                    {campaign && (
                        <p className="mt-1 text-sm text-gray-500">{campaign.name}</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => void loadDetails()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                    Campaign analysis load ho rahi hai...
                </div>
            ) : campaign ? (
                <>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <div className="flex items-start gap-2">
                            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>
                                Delivery status available message logs aur recipient records
                                se calculate kiya gaya hai. Saved campaign counters purane ho
                                sakte hain. Replies aur bot sessions ko campaign-attributed
                                conversion nahi maana gaya hai.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4 md:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {campaign.name}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Created: {formatDate(campaign.created_at)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Started: {formatDate(campaign.started_at)} · Completed:{" "}
                                    {formatDate(campaign.completed_at)}
                                </p>
                            </div>
                            <StatusBadge status={campaign.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            title="Recipient rows"
                            value={number(counts.total)}
                            icon={<Users className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Read"
                            value={number(counts.read)}
                            subtitle={percent(counts.read, counts.total)}
                            icon={<Eye className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Delivered"
                            value={number(counts.delivered)}
                            subtitle={percent(counts.delivered, counts.total)}
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Failed"
                            value={number(counts.failed)}
                            subtitle={percent(counts.failed, counts.total)}
                            icon={<XCircle className="h-5 w-5" />}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <MetricCard
                            title="Sent / Accepted"
                            value={number(counts.sent + counts.accepted)}
                            subtitle={percent(counts.sent + counts.accepted, counts.total)}
                            icon={<Send className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Estimated cost saved"
                            value={`₹${Number(campaign.estimated_cost ?? 0).toFixed(2)}`}
                            icon={<BarChart3 className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Matched log rows"
                            value={number(logs.length)}
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                    </div>

                    <section className="rounded-xl border bg-white">
                        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recipient Details
                            </h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Name, mobile, message ID..."
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="rounded-lg border bg-white px-3 py-2 text-sm"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="read">Read</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="sent">Sent</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="failed">Failed</option>
                                    <option value="pending">Pending</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-3 py-3">#</th>
                                        <th className="px-3 py-3">
                                            <button type="button" onClick={() => handleSort("name")}>
                                                Name{sortLabel("name")}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("phone_number")}
                                            >
                                                Mobile Number{sortLabel("phone_number")}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("last_reply")}
                                            >
                                                Last Reply{sortLabel("last_reply")}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("finalStatus")}
                                            >
                                                Status{sortLabel("finalStatus")}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("sent_at")}
                                            >
                                                Sent At{sortLabel("sent_at")}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3">Error</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {visibleRecipients.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                Is filter ke liye recipient nahi mila.
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleRecipients.map((recipient, index) => {
                                            const contact = contactsById[recipient.contact_id];

                                            return (
                                                <tr key={recipient.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-3">{index + 1}</td>
                                                    <td className="px-3 py-3">
                                                        {contact?.name || "—"}
                                                    </td>
                                                  <td className="whitespace-nowrap px-3 py-3">
    {contact?.phone_number ? (
        <button
            type="button"
            onClick={() =>
                router.push(
                    `/admin/whatsapp/inbox?phone=${encodeURIComponent(contact.phone_number!)}`
                )
            }
            className="font-medium text-green-700 underline decoration-green-300 underline-offset-2 hover:text-green-900"
            title="WhatsApp Inbox mein chat kholein"
        >
            {contact.phone_number}
        </button>
    ) : (
        "—"
    )}
</td>
                                                    <td
                                                        className="max-w-[320px] px-3 py-3"
                                                        title={
                                                            lastRepliesByPhone[contact?.phone_number ?? ""]?.message_text ?? ""
                                                        }
                                                    >
                                                        <div className="max-w-[320px] whitespace-normal break-words text-sm">
                                                            {lastRepliesByPhone[contact?.phone_number ?? ""]?.message_text || "—"}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <StatusBadge status={recipient.finalStatus} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">
                                                        {formatDate(recipient.sent_at)}
                                                    </td>
                                                    <td className="max-w-[260px] px-3 py-3 text-xs text-red-700">
                                                        {recipient.finalError || "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t px-4 py-3 text-xs text-gray-500">
                            Showing {visibleRecipients.length} of {recipients.length} recipient
                            rows. Column headings par click karke sorting badal sakte hain.
                        </div>
                    </section>
                </>
            ) : (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <p className="text-gray-700">Campaign nahi mila.</p>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/whatsapp/campaign-analysis")}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaign History
                    </button>
                </div>
            )}
        </div>
    );
}

export default function WhatsAppCampaignDetailsPage() {
    return (
        <PermissionGuard page="WhatsApp Campaign Analysis">
            <CampaignDetailsContent />
        </PermissionGuard>
    );
}
