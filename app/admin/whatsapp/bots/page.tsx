
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowDown,
    Bot,
    Check,
    CirclePause,
    Copy,
    GitBranch,
    LoaderCircle,
    MessageSquare,
    Pencil,
    Plus,
    Search,
    Settings2,
    Trash2,
    Workflow,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type BotStatus = "draft" | "active" | "paused";
type StartMode = "manual" | "automatic" | "both";

type BotOption = {
    id: string;
    title: string;
    nextNodeId: string;
};

type BotNode = {
    id: string;
    question: string;
    type: "buttons" | "list" | "text";
    options: BotOption[];
    delayMinutes?: number;
};
type BotFlow = {
    nodes: BotNode[];
};

type BotTemplate = {
    id: string;
    name: string;
    description: string | null;
    status: BotStatus;
    start_mode: StartMode;
    trigger_keyword: string | null;
    flow: BotFlow;
    source_template_id?: string | null;
    created_at: string;
    updated_at: string;
};
type ApprovedWhatsAppTemplate = {
    id: string;
    template_name: string;
    language_code: string;
    status: string;
    components: any[];
};
const emptyFlow: BotFlow = {
    nodes: [
        {
            id: "question_1",
            question: "क्या आप हमारे कोर्स की जानकारी चाहते हैं?",
            type: "buttons",
            options: [
                { id: "yes", title: "Yes", nextNodeId: "" },
                { id: "no", title: "No", nextNodeId: "" },
            ],
        },
    ],
};

const card =
    "rounded-2xl border border-slate-200 bg-white shadow-sm";
const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const primary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50";
const secondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

function makeId() {
    return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeFlow(value: unknown): BotFlow {
    if (
        value &&
        typeof value === "object" &&
        "nodes" in value &&
        Array.isArray((value as BotFlow).nodes)
    ) {
        return {
    nodes: (value as BotFlow).nodes.map((node) => ({
        ...node,
        delayMinutes: node.delayMinutes ?? 0,
    })),
};
    }

    return { nodes: [] };
}

function StatusBadge({ status }: { status: BotStatus }) {
    const styles: Record<BotStatus, string> = {
        draft: "bg-slate-100 text-slate-600",
        active: "bg-emerald-100 text-emerald-700",
        paused: "bg-amber-100 text-amber-700",
    };

    const labels: Record<BotStatus, string> = {
        draft: "Draft",
        active: "Active",
        paused: "Paused",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}

export default function WhatsAppBotsPage() {
    const [bots, setBots] = useState<BotTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"templates" | "builder">("templates");
    const [builderTab, setBuilderTab] = useState<"form" | "flow">("form");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [automationEnabled, setAutomationEnabled] = useState(true);
    const [defaultBotId, setDefaultBotId] = useState("");
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const loadBotSettings = useCallback(async () => {
        setSettingsLoading(true);
        setError("");

        const { data, error: settingsError } = await supabase
            .from("whatsapp_bot_automation_settings")
            .select("automation_enabled, default_bot_id")
            .eq("id", 1)
            .maybeSingle();

        if (settingsError) {
            setError(settingsError.message);
            setSettingsLoading(false);
            return;
        }

        if (data) {
            setAutomationEnabled(data.automation_enabled);
            setDefaultBotId(data.default_bot_id ?? "");
        }

        setSettingsLoading(false);
    }, []);

    useEffect(() => {
        void loadBotSettings();
    }, [loadBotSettings]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<BotStatus>("draft");
    const [approvedTemplates, setApprovedTemplates] = useState<ApprovedWhatsAppTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [startMode, setStartMode] = useState<StartMode>("manual");
    const [triggerKeyword, setTriggerKeyword] = useState("");
    const [flow, setFlow] = useState<BotFlow>(emptyFlow);
    async function saveBotSettings() {
        setSettingsSaving(true);
        setError("");
        setNotice("");

        const { error: settingsError } = await supabase
            .from("whatsapp_bot_automation_settings")
            .upsert(
                {
                    id: 1,
                    automation_enabled: automationEnabled,
                    default_bot_id: defaultBotId || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" },
            );

        if (settingsError) {
            setError(settingsError.message);
            setSettingsSaving(false);
            return;
        }

        setNotice("Bot Automation Settings सफलतापूर्वक Save हो गईं।");
        setSettingsSaving(false);
    }
    const loadBots = useCallback(async () => {
        setLoading(true);
        setError("");

        const { data, error: queryError } = await supabase
            .from("whatsapp_bot_templates")
            .select("*")
            .order("updated_at", { ascending: false });

        if (queryError) {
            setError(queryError.message);
            setBots([]);
        } else {
            setBots(
                (data ?? []).map((item) => ({
                    ...item,
                    flow: normalizeFlow(item.flow),
                })) as BotTemplate[]
            );
        }

        setLoading(false);
    }, []);
    const loadApprovedTemplates = useCallback(async () => {
        const { data, error } = await supabase
            .from("whatsapp_templates")
            .select("id, template_name, language_code, status, components")
            .eq("status", "Active")
            .order("template_name", { ascending: true });

        if (error) {
            setError(error.message);
            return;
        }

        setApprovedTemplates((data ?? []) as ApprovedWhatsAppTemplate[]);
    }, []);

    useEffect(() => {
        void loadApprovedTemplates();
    }, [loadApprovedTemplates]);

    useEffect(() => {
        void loadBots();
    }, [loadBots]);

    const filteredBots = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return bots;

        return bots.filter(
            (bot) =>
                bot.name.toLowerCase().includes(term) ||
                (bot.description ?? "").toLowerCase().includes(term)
        );
    }, [bots, search]);

    function resetBuilder() {
        setEditingId(null);
        setName("");
        setDescription("");
        setStatus("draft");
        setStartMode("manual");
        setTriggerKeyword("");
        setFlow({
            nodes: [
                {
                    id: makeId(),
                    question: "",
                    type: "buttons",
                    options: [
                        { id: makeId(), title: "Yes", nextNodeId: "" },
                        { id: makeId(), title: "No", nextNodeId: "" },
                    ],
                },
            ],
        });
        setBuilderTab("form");
        setError("");
        setNotice("");
        setView("builder");
    }

    function editBot(bot: BotTemplate) {
        setEditingId(bot.id);
        setSelectedTemplateId(bot.source_template_id ?? "");
        setName(bot.name);
        setDescription(bot.description ?? "");
        setStatus(bot.status);
        setStartMode(bot.start_mode);
        setTriggerKeyword(bot.trigger_keyword ?? "");
        setFlow(normalizeFlow(bot.flow));
        setBuilderTab("form");
        setError("");
        setNotice("");
        setView("builder");
    }

    function updateNode(nodeId: string, patch: Partial<BotNode>) {
        setFlow((current) => ({
            ...current,
            nodes: current.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...patch } : node
            ),
        }));
    }

    function addNode() {
        const newNode: BotNode = {
            id: makeId(),
            question: "",
            type: "buttons",
            options: [
                { id: makeId(), title: "Option 1", nextNodeId: "" },
                { id: makeId(), title: "Option 2", nextNodeId: "" },
            ],
        };

        setFlow((current) => ({
            nodes: [...current.nodes, newNode],
        }));
    }

    function deleteNode(nodeId: string) {
        setFlow((current) => ({
            nodes: current.nodes
                .filter((node) => node.id !== nodeId)
                .map((node) => ({
                    ...node,
                    options: node.options.map((option) =>
                        option.nextNodeId === nodeId
                            ? { ...option, nextNodeId: "" }
                            : option
                    ),
                })),
        }));
    }

    function addOption(nodeId: string) {
        setFlow((current) => ({
            nodes: current.nodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        options: [
                            ...node.options,
                            {
                                id: makeId(),
                                title: `Option ${node.options.length + 1}`,
                                nextNodeId: "",
                            },
                        ],
                    }
                    : node
            ),
        }));
    }

    function updateOption(
        nodeId: string,
        optionId: string,
        patch: Partial<BotOption>
    ) {
        setFlow((current) => ({
            nodes: current.nodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        options: node.options.map((option) =>
                            option.id === optionId
                                ? { ...option, ...patch }
                                : option
                        ),
                    }
                    : node
            ),
        }));
    }

    function deleteOption(nodeId: string, optionId: string) {
        setFlow((current) => ({
            nodes: current.nodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        options: node.options.filter(
                            (option) => option.id !== optionId
                        ),
                    }
                    : node
            ),
        }));
    }

    async function saveBot() {
        setError("");
        setNotice("");

        if (!name.trim()) {
            setError("कृपया Bot का नाम भरें।");
            return;
        }

        if (!flow.nodes.length) {
            setError("कम-से-कम एक Question जोड़ें।");
            return;
        }

        for (const node of flow.nodes) {
            if (!node.question.trim()) {
                setError("हर Question का Text भरें।");
                return;
            }

            if (
                node.type !== "text" &&
                (node.options.length === 0 ||
                    node.options.some((option) => !option.title.trim()))
            ) {
                setError("हर Button/List Option का नाम भरें।");
                return;
            }

            if (
                node.type === "buttons" &&
                node.options.length > 3
            ) {
                setError(
                    "WhatsApp Reply Buttons में अधिकतम 3 विकल्प रखें। अधिक विकल्पों के लिए List चुनें।"
                );
                return;
            }

            const invalidNext = node.options.some(
                (option) =>
                    option.nextNodeId &&
                    !flow.nodes.some((target) => target.id === option.nextNodeId)
            );

            if (invalidNext) {
                setError("एक या अधिक Options का अगला Question मौजूद नहीं है।");
                return;
            }
        }

        if (
            (startMode === "automatic" || startMode === "both") &&
            !triggerKeyword.trim()
        ) {
            setError(
                "Automatic Start के लिए अभी Trigger Keyword भरें।"
            );
            return;
        }

        setSaving(true);

        const payload = {
            name: name.trim(),
            description: description.trim(),
            status,
            start_mode: startMode,
            trigger_keyword: triggerKeyword.trim(),
            flow,
            source_template_id: selectedTemplateId || null,
            updated_at: new Date().toISOString(),
        };

        const result = editingId
            ? await supabase
                .from("whatsapp_bot_templates")
                .update(payload)
                .eq("id", editingId)
                .select()
                .single()
            : await supabase
                .from("whatsapp_bot_templates")
                .insert(payload)
                .select()
                .single();

        if (result.error) {
            setError(result.error.message);
            setSaving(false);
            return;
        }

        setSaving(false);
        setNotice("Bot सफलतापूर्वक Save हो गया।");
        await loadBots();
        setView("templates");
    }

    async function duplicateBot(bot: BotTemplate) {
        setError("");
        const { error: insertError } = await supabase
            .from("whatsapp_bot_templates")
            .insert({
                name: `${bot.name} Copy`,
                description: bot.description,
                status: "draft",
                start_mode: bot.start_mode,
                trigger_keyword: bot.trigger_keyword,
                flow: bot.flow,
            });

        if (insertError) {
            setError(insertError.message);
            return;
        }

        setNotice("Bot की Copy बना दी गई।");
        await loadBots();
    }

    async function changeStatus(bot: BotTemplate) {
        const nextStatus: BotStatus =
            bot.status === "active" ? "paused" : "active";

        const { error: updateError } = await supabase
            .from("whatsapp_bot_templates")
            .update({
                status: nextStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", bot.id);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setNotice(`Bot ${nextStatus === "active" ? "Active" : "Paused"} है।`);
        await loadBots();
    }

    async function deleteBot(bot: BotTemplate) {
        if (!window.confirm(`"${bot.name}" को Delete करना है?`)) return;

        const { error: deleteError } = await supabase
            .from("whatsapp_bot_templates")
            .delete()
            .eq("id", bot.id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        setNotice("Bot Delete कर दिया गया।");
        await loadBots();
    }

    const activeCount = bots.filter((bot) => bot.status === "active").length;
    const draftCount = bots.filter((bot) => bot.status === "draft").length;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <Bot size={18} />
                            WhatsApp Automation
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                            Bot Manager
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            अपने Bots बनाएँ, Templates में Save करें और उनके Flows manage करें।
                        </p>
                    </div>

                    {view === "templates" ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/admin/whatsapp/bots/settings"
                                className={secondary}
                            >
                                <Settings2 size={17} />
                                Automation Settings
                            </Link>

                            <button className={primary} onClick={resetBuilder}>
                                <Plus size={18} />
                                Create New Bot
                            </button>
                        </div>
                    ) : (
                        <button
                            className={secondary}
                            onClick={() => {
                                setView("templates");
                                setError("");
                            }}
                        >
                            Back to Templates
                        </button>
                    )}
                </header>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {notice && view === "templates" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        {notice}
                    </div>
                )}

                {view === "templates" ? (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    label: "Total Bots",
                                    value: bots.length,
                                    icon: Bot,
                                    color: "text-violet-600 bg-violet-50",
                                },
                                {
                                    label: "Active Bots",
                                    value: activeCount,
                                    icon: Activity,
                                    color: "text-emerald-600 bg-emerald-50",
                                },
                                {
                                    label: "Drafts",
                                    value: draftCount,
                                    icon: Pencil,
                                    color: "text-blue-600 bg-blue-50",
                                },
                                {
                                    label: "Start Modes",
                                    value: "2",
                                    icon: Zap,
                                    color: "text-amber-600 bg-amber-50",
                                },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div key={item.label} className={`${card} p-5`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">
                                                {item.label}
                                            </span>
                                            <span className={`rounded-xl p-2 ${item.color}`}>
                                                <Icon size={20} />
                                            </span>
                                        </div>
                                        <div className="mt-3 text-3xl font-bold text-slate-900">
                                            {item.value}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        <section className={`${card} overflow-hidden`}>
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Your Bot Templates
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Save करें और किसी भी Chat में उपयोग करने के लिए तैयार रखें।
                                    </p>
                                </div>

                                <div className="relative w-full sm:max-w-xs">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={17}
                                    />
                                    <input
                                        className={`${field} pl-9`}
                                        placeholder="Search bots..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                                    <LoaderCircle className="animate-spin" size={20} />
                                    Loading bots...
                                </div>
                            ) : filteredBots.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                        <Workflow size={28} />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">
                                        अभी कोई Bot नहीं है
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        अपना पहला Bot बनाएँ और उसे Template के रूप में Save करें।
                                    </p>
                                    <button className={`${primary} mt-4`} onClick={resetBuilder}>
                                        <Plus size={17} /> Create First Bot
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredBots.map((bot) => (
                                        <div
                                            key={bot.id}
                                            className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 md:flex-row md:items-center"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                                <Bot size={24} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">
                                                        {bot.name}
                                                    </h3>
                                                    <StatusBadge status={bot.status} />
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {bot.description || "No description"}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                                                        {bot.flow.nodes.length} Questions
                                                    </span>
                                                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                                                        Start: {bot.start_mode}
                                                    </span>
                                                    {bot.trigger_keyword && (
                                                        <span className="rounded-lg bg-slate-100 px-2 py-1">
                                                            Trigger: {bot.trigger_keyword}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className={secondary}
                                                    title="Edit"
                                                    onClick={() => editBot(bot)}
                                                >
                                                    <Pencil size={16} /> Edit
                                                </button>
                                                <button
                                                    className={secondary}
                                                    title="Duplicate"
                                                    onClick={() => void duplicateBot(bot)}
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    className={secondary}
                                                    title={bot.status === "active" ? "Pause" : "Activate"}
                                                    onClick={() => void changeStatus(bot)}
                                                >
                                                    {bot.status === "active" ? (
                                                        <CirclePause size={16} />
                                                    ) : (
                                                        <Check size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    className="inline-flex items-center justify-center rounded-xl border border-red-100 p-2.5 text-red-600 hover:bg-red-50"
                                                    title="Delete"
                                                    onClick={() => void deleteBot(bot)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                            <div className="flex items-start gap-3">
                                <Settings2 size={20} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">अगला Integration Step</p>
                                    <p className="mt-1 text-blue-800">
                                        Templates और Flows यहाँ Save होंगे। Inbox से Bot Start,
                                        Automatic Triggers और WhatsApp पर प्रश्न भेजने के लिए
                                        अगला चरण Bot Engine तथा Webhook integration है।
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-5">
                        <section className={`${card} p-5`}>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingId ? "Edit Bot" : "Create New Bot"}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Basic details और start settings
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-1.5 text-sm font-medium text-slate-700">
                                    Bot Name *
                                    <input
                                        className={field}
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="e.g. Admission Enquiry"
                                    />
                                </label>

                                <label className="space-y-1.5 text-sm font-medium text-slate-700">
                                    Status
                                    <select
                                        className={field}
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(event.target.value as BotStatus)
                                        }
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                    </select>
                                </label>

                                <label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
                                    Description
                                    <input
                                        className={field}
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="यह Bot किस काम के लिए है?"
                                    />
                                </label>
                            </div>

                            <div className="mt-4">
                                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                                    Approved WhatsApp Template
                                    <select
                                        className={field}
                                        value={selectedTemplateId}
                                        onChange={(event) => {
                                            const templateId = event.target.value;
                                            setSelectedTemplateId(templateId);

                                            if (!templateId) return;

                                            const existingBot = bots.find(
                                                (bot) => bot.source_template_id === templateId
                                            );

                                            if (existingBot) {
                                                editBot(existingBot);
                                                setNotice(`यह Template पहले से "${existingBot.name}" Bot से जुड़ा है।`);
                                                return;
                                            }

                                            const template = approvedTemplates.find(
                                                (item) => item.id === templateId
                                            );

                                            if (!template) return;

                                            setName(template.template_name);
                                            setDescription(
                                                `WhatsApp Template: ${template.template_name} (${template.language_code})`
                                            );

                                            const components = template.components ?? [];
                                            const body = components.find(
                                                (item: any) => item.type === "BODY"
                                            );
                                            const buttonsComponent = components.find(
                                                (item: any) => item.type === "BUTTONS"
                                            );

                                            const quickReplies = (
                                                buttonsComponent?.buttons ?? []
                                            ).filter(
                                                (item: any) => item.type === "QUICK_REPLY"
                                            );

                                            setFlow({
                                                nodes: [
                                                    {
                                                        id: makeId(),
                                                        question: body?.text ?? "",
                                                        type: quickReplies.length > 0 ? "buttons" : "text",
                                                        options: quickReplies.slice(0, 3).map(
                                                            (item: any) => ({
                                                                id: item.text,
                                                                title: item.text,
                                                                nextNodeId: "",
                                                            })
                                                        ),
                                                    },
                                                ],
                                            });

                                            setStatus("draft");
                                            setStartMode("manual");
                                            setTriggerKeyword("");
                                        }}
                                    >
                                        <option value="">Select approved template</option>
                                        {approvedTemplates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.template_name} ({template.language_code})
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {approvedTemplates.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-700">
                                        कोई approved template नहीं मिला। पहले Templates page पर Sync करें।
                                    </p>
                                )}
                            </div>

                            <div className="mt-5">
                                <p className="mb-2 text-sm font-semibold text-slate-800">
                                    Bot Start Mode
                                </p>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {(
                                        [
                                            ["manual", "Manual", "Inbox से Start करें"],
                                            ["automatic", "Automatic", "Keyword Trigger"],
                                            ["both", "Both", "दोनों तरीके"],
                                        ] as const
                                    ).map(([value, title, subtitle]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setStartMode(value)}
                                            className={`rounded-xl border p-3 text-left transition ${startMode === value
                                                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                                                : "border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            <span className="block font-semibold text-slate-900">
                                                {title}
                                            </span>
                                            <span className="mt-1 block text-xs text-slate-500">
                                                {subtitle}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(startMode === "automatic" || startMode === "both") && (
                                <label className="mt-4 block space-y-1.5 text-sm font-medium text-slate-700">
                                    Trigger Keyword
                                    <input
                                        className={field}
                                        value={triggerKeyword}
                                        onChange={(event) =>
                                            setTriggerKeyword(event.target.value)
                                        }
                                        placeholder="Phrases या words ko # se alag karein"
                                    />
                                   
                                </label>
                            )}
                        </section>

                        <section className={`${card} overflow-hidden`}>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                                <div>
                                    <h2 className="font-bold text-slate-900">Bot Flow Builder</h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Form से edit करें या Visual Flow में connections देखें।
                                    </p>
                                </div>

                                <div className="flex rounded-xl bg-slate-100 p-1">
                                    <button
                                        onClick={() => setBuilderTab("form")}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium ${builderTab === "form"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500"
                                            }`}
                                    >
                                        Form Builder
                                    </button>
                                    <button
                                        onClick={() => setBuilderTab("flow")}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium ${builderTab === "flow"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500"
                                            }`}
                                    >
                                        Visual Flow
                                    </button>
                                </div>
                            </div>

                            {builderTab === "form" ? (
                                <div className="space-y-4 p-4">
                                    {flow.nodes.map((node, index) => (
                                        <div
                                            key={node.id}
                                            className="rounded-2xl border border-slate-200 p-4"
                                        >
                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">
                                                            Question {index + 1}
                                                        </h3>
                                                        <p className="text-xs text-slate-500">
                                                            ID: {node.id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    title="Delete Question"
                                                    onClick={() => deleteNode(node.id)}
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>

                                            <label className="mb-4 block space-y-1.5 text-sm font-medium text-slate-700">
                                                Question Text *
                                                <textarea
                                                    className={field}
                                                    rows={2}
                                                    value={node.question}
                                                    onChange={(event) =>
                                                        updateNode(node.id, {
                                                            question: event.target.value,
                                                        })
                                                    }
                                                    placeholder="ग्राहक को क्या प्रश्न भेजना है?"
                                                />
                                            </label>

                                            <label className="mb-4 block space-y-1.5 text-sm font-medium text-slate-700">
                                                Reply Type
                                                <select
                                                    className={field}
                                                    value={node.type}
                                                    onChange={(event) =>
                                                        updateNode(node.id, {
                                                            type: event.target.value as BotNode["type"],
                                                        })
                                                    }
                                                >
                                                    <option value="buttons">Reply Buttons (max 3)</option>
                                                    <option value="list">List Message</option>
                                                    <option value="text">Text Question</option>
                                                </select>
                                            </label>

                                            {node.type !== "text" && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            Reply Options
                                                        </p>
                                                        <button
                                                            className={secondary}
                                                            onClick={() => addOption(node.id)}
                                                            disabled={
                                                                node.type === "buttons" &&
                                                                node.options.length >= 3
                                                            }
                                                        >
                                                            <Plus size={15} /> Add Option
                                                        </button>
                                                    </div>

                                                    {node.options.map((option) => (
                                                        <div
                                                            key={option.id}
                                                            className="grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-[1fr_1fr_1.5fr_auto]"
                                                        >
                                                            <input
                                                                className={field}
                                                                value={option.title}
                                                                onChange={(event) =>
                                                                    updateOption(node.id, option.id, {
                                                                        title: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="Button / Option label"
                                                            />
                                                            <input
                                                                className={field}
                                                                value={option.id}
                                                                readOnly
                                                                title="Reply ID"
                                                            />
                                                            <select
                                                                className={field}
                                                                value={option.nextNodeId}
                                                                onChange={(event) =>
                                                                    updateOption(node.id, option.id, {
                                                                        nextNodeId: event.target.value,
                                                                    })
                                                                }
                                                            >
                                                                <option value="">End / No next question</option>
                                                                {flow.nodes
                                                                    .filter((target) => target.id !== node.id)
                                                                    .map((target) => (
                                                                        <option
                                                                            key={target.id}
                                                                            value={target.id}
                                                                        >
                                                                            {target.question.trim()
                                                                                ? target.question.slice(0, 55)
                                                                                : `Question ${flow.nodes.indexOf(target) + 1}`}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                            <button
                                                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                                onClick={() =>
                                                                    deleteOption(node.id, option.id)
                                                                }
                                                                title="Remove Option"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        className={`${secondary} w-full border-dashed py-3`}
                                        onClick={addNode}
                                    >
                                        <Plus size={17} /> Add Next Question
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto bg-slate-50 p-5">
                                    <div className="mx-auto flex min-w-[300px] max-w-2xl flex-col items-center gap-3">
                                        {flow.nodes.map((node, index) => (
                                            <div key={node.id} className="w-full">
                                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                                                            <MessageSquare size={15} />
                                                            QUESTION {index + 1}
                                                        </span>
                                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                                            {node.type}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-slate-900">
                                                        {node.question || "Question text यहाँ लिखें"}
                                                    </p>

                                                    {node.type !== "text" && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {node.options.map((option) => {
                                                                const target = flow.nodes.find(
                                                                    (item) => item.id === option.nextNodeId
                                                                );

                                                                return (
                                                                    <div
                                                                        key={option.id}
                                                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
                                                                    >
                                                                        <span className="font-semibold">
                                                                            {option.title}
                                                                        </span>
                                                                        <span className="mt-1 block text-emerald-700">
                                                                            →{" "}
                                                                            {target
                                                                                ? target.question || "Next Question"
                                                                                : "End"}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {index < flow.nodes.length - 1 && (
                                                    <div className="flex justify-center py-2 text-slate-400">
                                                        <ArrowDown size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                            <GitBranch size={15} />
                                            Connections बदलने के लिए Form Builder का उपयोग करें।
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {notice && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                {notice}
                            </div>
                        )}

                        <div className="sticky bottom-3 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                            <button
                                className={secondary}
                                onClick={() => setView("templates")}
                            >
                                Cancel
                            </button>
                            <button
                                className={primary}
                                disabled={saving}
                                onClick={() => void saveBot()}
                            >
                                {saving ? (
                                    <LoaderCircle className="animate-spin" size={17} />
                                ) : (
                                    <Check size={17} />
                                )}
                                {saving ? "Saving..." : "Save Bot Template"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
