
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
    Users,
    XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";

type Campaign = {
    id: string;
    template_id: string | null;
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
type TemplateComponent = {
    type?: string;
    text?: string;
    format?: string;
    buttons?: {
        type?: string;
        text?: string;
    }[];
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
type BotAnalysisRow = {
    bot_name: string;
    parent_node_id: string | null;
    parent_button_id: string | null;
    parent_button_name: string | null;
    node_id: string;
    question: string;
    button_id: string;
    button_name: string;
    next_node_id: string | null;
    has_child_buttons: boolean;
    total_clicks: number;
    unique_users: number;
};

type BotClickUser = {
    inbound_id: string;
    recipient_id: string;
    phone_number: string;
    message_text: string | null;
    received_at: string;
    bot_name: string;
    parent_node_id: string | null;
    parent_button_id: string | null;
    parent_button_name: string | null;
    node_id: string;
    question: string;
    button_id: string;
    button_name: string;
    next_node_id: string | null;
};
type BotSummary = {
    total_clicks: number;
    unique_users: number;
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

function BotAnalysisSection({
    rows,
    clickUsers,
    summary,
    expandedButtons,
    selectedButton,
    onButtonClick,
    onUsersClick,
}: {
    rows: BotAnalysisRow[];
    clickUsers: BotClickUser[];
    summary: BotSummary;
    expandedButtons: string[];
    selectedButton: string | null;
    onButtonClick: (pathKey: string, nextNodeId: string | null) => void;
    onUsersClick: (pathKey: string) => void;
}) {
    if (rows.length === 0) return null;

    const rowsByNode = new Map<string, BotAnalysisRow[]>();

    rows.forEach((row) => {
        const current = rowsByNode.get(row.node_id) ?? [];
        current.push(row);
        rowsByNode.set(row.node_id, current);
    });

    const allNodeIds = Array.from(rowsByNode.keys());

    const childNodeIds = new Set(
        rows
            .map((row) => row.next_node_id)
            .filter((id): id is string => Boolean(id))
    );

    const rootNodeIds = allNodeIds.filter((id) => !childNodeIds.has(id));

    const renderNode = (
        nodeId: string,
        parentButtonId: string | null,
        depth = 0,
        path: string[] = []
    ): React.ReactNode => {
        if (path.includes(nodeId)) return null;

        const nodeRows = (rowsByNode.get(nodeId) ?? []).filter(
            (row) => row.parent_button_id === parentButtonId
        );

        if (nodeRows.length === 0) return null;

        const nextPath = [...path, nodeId];
        const parentRow = parentButtonId
            ? rows.find(
                (row) =>
                    row.node_id === nodeRows[0].parent_node_id &&
                    row.button_id === parentButtonId
            )
            : null;

        const answeredUsers = new Set(
            clickUsers
                .filter(
                    (user) =>
                        user.node_id === nodeId &&
                        user.parent_button_id === parentButtonId
                )
                .map((user) => user.phone_number)
        ).size;

        const questionPendingUsers = parentButtonId
            ? Math.max((parentRow?.unique_users ?? 0) - answeredUsers, 0)
            : 0;
        return (
            <div
                key={`${parentButtonId ?? "root"}-${nodeId}-${depth}`}
                className={`relative ${depth > 0
                    ? "ml-3 border-l-2 border-green-200 pl-4 sm:ml-6 sm:pl-6"
                    : ""
                    }`}
            >
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 px-4 py-3">
                        <p className="whitespace-pre-wrap text-sm font-normal leading-6 text-gray-800">
                            {nodeRows[0].question || "Bot Question"}
                        </p>

                        {parentButtonId && (
                            <span className="shrink-0 rounded-lg bg-orange-50 px-2.5 py-2 text-xs font-semibold text-orange-800">
                                Pending {number(questionPendingUsers)}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2 p-3">
                        {nodeRows.map((row) => {
                            const pathKey = `${parentButtonId ?? "root"}:${nodeId}:${row.button_id}`;

                            const isExpanded = expandedButtons.includes(pathKey);
                            const isSelected = selectedButton === pathKey;
                            const users = clickUsers.filter(
                                (user) =>
                                    user.button_id === row.button_id &&
                                    user.node_id === row.node_id &&
                                    user.parent_button_id === row.parent_button_id
                            );

                            const directChildUsers = row.has_child_buttons
                                ? clickUsers.filter(
                                    (user) =>
                                        user.node_id === row.next_node_id &&
                                        user.parent_node_id === row.node_id &&
                                        user.parent_button_id === row.button_id
                                )
                                : [];

                            const childTotalClicks = directChildUsers.length;

                            const childUniqueUsers = new Set(
                                directChildUsers.map((user) => user.phone_number)
                            ).size;

                            const pendingUsers = Math.max(
                                row.unique_users - childUniqueUsers,
                                0
                            );



                            return (
                                <div
                                    key={pathKey}
                                    className="overflow-hidden rounded-lg border border-gray-200"
                                >

                                    <div className="flex flex-wrap items-center gap-2 p-2 sm:p-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onButtonClick(
                                                    pathKey,
                                                    row.has_child_buttons ? row.next_node_id : null
                                                )
                                            }
                                            className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-gray-800 hover:text-green-700"
                                        >
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-50 text-xs font-bold text-green-700">
                                                {row.next_node_id
                                                    ? isExpanded
                                                        ? "−"
                                                        : "+"
                                                    : "•"}
                                            </span>

                                            <span className="break-words">
                                                {row.button_name || "Unnamed Button"}
                                            </span>
                                        </button>

                                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => onUsersClick(pathKey)}
                                                className={`rounded-lg px-2.5 py-2 ${isSelected
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                                    }`}
                                            >
                                                Users {number(row.unique_users)}
                                            </button>


                                            {row.has_child_buttons && (
                                                <>
                                                    <span className="rounded-lg bg-green-50 px-2.5 py-2 text-green-800">
                                                        Button Clicks {number(childTotalClicks)}
                                                    </span>

                                                    <span className="rounded-lg bg-orange-50 px-2.5 py-2 text-orange-800">
                                                        Pending {number(pendingUsers)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>




                                    {isSelected && (
                                        <div className="border-t bg-blue-50/50 p-3">
                                            <p className="mb-3 text-xs font-bold text-gray-700">
                                                Users who clicked this button ({users.length})
                                            </p>

                                            {users.length === 0 ? (
                                                <p className="text-xs text-gray-500">
                                                    No users found.
                                                </p>
                                            ) : (
                                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                                    {users.map((user) => (
                                                        <div
                                                            key={user.inbound_id}
                                                            className="rounded-lg border bg-white p-3 text-xs"
                                                        >
                                                            <p className="font-semibold text-gray-800">
                                                                {user.phone_number || "Unknown number"}
                                                            </p>

                                                            {user.message_text && (
                                                                <p className="mt-1 text-gray-600">
                                                                    {user.message_text}
                                                                </p>
                                                            )}

                                                            <p className="mt-1 text-gray-400">
                                                                {formatDate(user.received_at)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isExpanded && row.has_child_buttons && row.next_node_id && (
                                        <div className="border-t bg-gray-50/70 p-3">
                                            {renderNode(
                                                row.next_node_id,
                                                row.button_id,
                                                depth + 1,
                                                nextPath
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="rounded-xl border bg-white p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  
                    <p className="mt-1 text-sm text-green-700">
                        Bot: {rows[0]?.bot_name}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-2 text-gray-700">
                        Users {number(summary.unique_users)}
                    </span>

                    <span className="rounded-lg bg-green-50 px-2.5 py-2 text-green-800">
                        Button Clicks {number(summary.total_clicks)}
                    </span>
                </div>
            </div>



            <div className="space-y-4">
                {(rootNodeIds.length ? rootNodeIds : allNodeIds).map((nodeId) =>
                    renderNode(nodeId, null)
                )}
            </div>
        </section>
    );
}

function CampaignDetailsContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const campaignId = params.id;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [templateComponents, setTemplateComponents] = useState<TemplateComponent[]>([]);
    const [botAnalysis, setBotAnalysis] = useState<BotAnalysisRow[]>([]);
    const [botSummary, setBotSummary] = useState<BotSummary>({
        total_clicks: 0,
        unique_users: 0,
    });
    const [botClickUsers, setBotClickUsers] = useState<BotClickUser[]>([]);
    const [expandedBotButtons, setExpandedBotButtons] = useState<string[]>([]);
    const [selectedBotButton, setSelectedBotButton] = useState<string | null>(null);
    const [recipientExpanded, setRecipientExpanded] = useState(false);
    const [recipientLoading, setRecipientLoading] = useState(false);
    const [recipientLoaded, setRecipientLoaded] = useState(false);
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
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, pageSize]);
    const loadRecipientDetails = useCallback(async () => {
        if (!campaignId || recipientLoaded || recipientLoading) return;

        setRecipientLoading(true);

        try {
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
            setContactsById(contactMap);
            setLastRepliesByPhone(repliesByPhone);
            setLogs(logRows);
            setRecipientLoaded(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Recipient Details load nahi ho sake."
            );
        } finally {
            setRecipientLoading(false);
        }
    }, [campaignId, recipientLoaded, recipientLoading]);
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
                    "id,name,template_id,status,total_recipients,accepted_count,delivered_count,read_count,failed_count,estimated_cost,created_at,started_at,completed_at"
                )
                .eq("id", campaignId)
                .single();

            if (campaignError) throw campaignError;

            setCampaign(campaignData as Campaign);
            setTemplateName("");
            setTemplateComponents([]);
            setBotAnalysis([]);
            setBotSummary({
                total_clicks: 0,
                unique_users: 0,
            });
            if (campaignData.id) {
                const { data: botData, error: botError } = await supabase.rpc(
                    "get_whatsapp_campaign_bot_path_analysis",
                    {
                        p_campaign_id: campaignData.id,
                    }
                );

                if (botError) throw botError;

                setBotAnalysis((botData ?? []) as BotAnalysisRow[]);
                const { data: summaryData, error: summaryError } = await supabase.rpc(
                    "get_whatsapp_campaign_bot_summary",
                    {
                        p_campaign_id: campaignData.id,
                    }
                );

                if (summaryError) throw summaryError;

                setBotSummary(
                    (summaryData?.[0] ?? {
                        total_clicks: 0,
                        unique_users: 0,
                    }) as BotSummary
                );
            }

            if (campaignData.template_id) {
                const { data: templateData, error: templateError } = await supabase
                    .from("whatsapp_templates")
                    .select("template_name,components")
                    .eq("id", campaignData.template_id)
                    .maybeSingle();

                if (templateError) throw templateError;

                if (templateData) {
                    setTemplateName(templateData.template_name ?? "");
                    setTemplateComponents(
                        Array.isArray(templateData.components)
                            ? (templateData.components as TemplateComponent[])
                            : []
                    );
                }
            }
            const { data: clickUserData, error: clickUserError } = await supabase.rpc(
                "get_whatsapp_campaign_bot_path_click_users",
                {
                    p_campaign_id: campaignId,
                }
            );

            if (clickUserError) throw clickUserError;

            setBotClickUsers((clickUserData ?? []) as BotClickUser[]);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Campaign details load nahi ho sake."
            );

            setRecipients([]);
            setBotClickUsers([]);
            setExpandedBotButtons([]);
            setSelectedBotButton(null);
            setContactsById({});
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        void loadDetails();
    }, [loadDetails]);

    const counts = useMemo(() => ({
        total: Number(campaign?.total_recipients ?? 0),
        read: Number(campaign?.read_count ?? 0),
        delivered: Number(campaign?.delivered_count ?? 0),
        sent: 0,
        accepted: Number(campaign?.accepted_count ?? 0),
        failed: Number(campaign?.failed_count ?? 0),
        pending: 0,
        unknown: 0,
    }), [campaign]);

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
    const totalPages = Math.max(1, Math.ceil(visibleRecipients.length / pageSize));

    const paginatedRecipients = visibleRecipients.slice(
        (page - 1) * pageSize,
        page * pageSize
    );
    const handleBotButtonClick = (
        pathKey: string,
        nextNodeId: string | null
    ) => {
        if (!nextNodeId) return;

        setExpandedBotButtons((current) =>
            current.includes(pathKey)
                ? current.filter((id) => id !== pathKey)
                : [...current, pathKey]
        );
    };

    const handleBotUsersClick = (pathKey: string) => {
        setSelectedBotButton((current) =>
            current === pathKey ? null : pathKey
        );
    };
    const sortLabel = (key: SortKey) =>
        sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕";

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/whatsapp/campaign-analysis")}
                        className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    {campaign && (
                        <h1 className="text-2xl font-bold text-gray-900">
                            {campaign.name}
                        </h1>
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

            {loading ? (
                <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                    Campaign analysis load ho rahi hai...
                </div>
            ) : campaign ? (
                <>

                    <div className="overflow-x-auto rounded-xl border bg-white">
                        <div className="flex min-w-max divide-x divide-gray-200">
                            <div className="min-w-[150px] p-4">
                                <p className="text-xs text-gray-500">Started</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {formatDate(campaign.started_at)}
                                </p>
                            </div>

                            <div className="min-w-[150px] p-4">
                                <p className="text-xs text-gray-500">Completed</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {formatDate(campaign.completed_at)}
                                </p>
                            </div>

                            <div className="min-w-[110px] p-4">
                                <p className="text-xs text-gray-500">Status</p>
                                <div className="mt-2">
                                    <StatusBadge status={campaign.status} />
                                </div>
                            </div>
                            <div className="min-w-[130px] p-4">
                                <p className="text-xs text-gray-500">Recipients</p>
                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {number(counts.total)}
                                </p>
                            </div>

                            <div className="min-w-[110px] p-4">
                                <p className="text-xs text-gray-500">Failed</p>
                                <p className="mt-1 text-xl font-bold text-red-700">
                                    {number(counts.failed)}
                                    <span className="ml-1 text-xs font-medium">
                                        ({percent(counts.failed, counts.total)})
                                    </span>
                                </p>
                            </div>

                            <div className="min-w-[120px] p-4">
                                <p className="text-xs text-gray-500">Delivered</p>
                                <p className="mt-1 text-xl font-bold text-green-700">
                                    {number(counts.delivered)}
                                    <span className="ml-1 text-xs font-medium">
                                        ({percent(counts.delivered, counts.total)})
                                    </span>
                                </p>
                            </div>

                            <div className="min-w-[110px] p-4">
                                <p className="text-xs text-gray-500">Read</p>
                                <p className="mt-1 text-xl font-bold text-purple-700">
                                    {number(counts.read)}
                                    <span className="ml-1 text-xs font-medium">
                                        ({percent(counts.read, counts.total)})
                                    </span>
                                </p>
                            </div>

                            <div className="min-w-[150px] p-4">
                                <p className="text-xs text-gray-500">Cost (₹)</p>
                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    ₹{Number(campaign.estimated_cost ?? 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <BotAnalysisSection
                        rows={botAnalysis}
                        summary={botSummary}
                        clickUsers={botClickUsers}
                        expandedButtons={expandedBotButtons}
                        selectedButton={selectedBotButton}
                        onButtonClick={handleBotButtonClick}
                        onUsersClick={handleBotUsersClick}
                    />
                    <section className="rounded-xl border bg-white">
                        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !recipientExpanded;
                                    setRecipientExpanded(next);

                                    if (next) {
                                        void loadRecipientDetails();
                                    }
                                }}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <span className="text-lg font-semibold text-gray-900">
                                    Recipient Details
                                </span>
                                <span className="text-xl font-bold text-gray-600">
                                    {recipientExpanded ? "−" : "+"}
                                </span>
                            </button>
                            {recipientExpanded && (
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
                            )}
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
                                    {paginatedRecipients.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                Is filter ke liye recipient nahi mila.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRecipients.map((recipient, index) => {
                                            const contact = contactsById[recipient.contact_id];

                                            return (
                                                <tr key={recipient.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-3">{(page - 1) * pageSize + index + 1}</td>
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

                        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">
                                Showing {visibleRecipients.length === 0 ? 0 : (page - 1) * pageSize + 1}
                                {" - "}
                                {Math.min(page * pageSize, visibleRecipients.length)}
                                {" of "}
                                {visibleRecipients.length} recipients
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={pageSize}
                                    onChange={(event) => setPageSize(Number(event.target.value))}
                                    className="rounded-lg border bg-white px-2 py-1.5 text-xs"
                                >
                                    <option value={50}>50 rows</option>
                                    <option value={100}>100 rows</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <span className="text-xs text-gray-600">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page >= totalPages}
                                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
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
