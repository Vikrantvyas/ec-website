
"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
    ShieldCheck,
    GraduationCap,
    CalendarCheck,
    Users,
    LoaderCircle,
    Trash2,
    CalendarDays,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type LeadStatus = {
    id: string;
    created_time: string | null;
    community_joined: boolean | null;
    demo_attended: boolean | null;
    class_joined: boolean | null;
    whatsapp_opted_out: boolean | null;
};

type ContactStatus = {
    id: string;
    consent_status: string | null;
};

type Props = {
    phone: string;
    name?: string;
    contactId?: string | null;
    leadId?: string | null;
    children: ReactNode;
    onUpdated?: () => Promise<unknown> | void;
};

function localDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizePhone(value: string) {
    return value.replace(/\D/g, "");
}

function phoneVariants(value: string) {
    const digits = normalizePhone(value);
    const variants = new Set<string>([digits]);

    if (digits.startsWith("91") && digits.length === 12) {
        variants.add(digits.slice(2));
        variants.add(`+${digits}`);
    } else if (digits.length === 10) {
        variants.add(`91${digits}`);
        variants.add(`+91${digits}`);
    } else if (digits.startsWith("0") && digits.length === 11) {
        const local = digits.slice(1);
        variants.add(local);
        variants.add(`91${local}`);
        variants.add(`+91${local}`);
    } else if (digits) {
        variants.add(`+${digits}`);
    }

    return [...variants].filter(Boolean);
}

const BLOCKED_STATUSES = [
    "opted_out",
    "optout",
    "unsubscribed",
    "stopped",
    "blocked",
];

export default function InboxRightClick({
    phone,
    name,
    contactId,
    leadId,
    children,
    onUpdated,
}: Props) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [lead, setLead] = useState<LeadStatus | null>(null);
    const [contact, setContact] = useState<ContactStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [demoModalOpen, setDemoModalOpen] = useState(false);
    const [demoDate, setDemoDate] = useState(localDateString());
    const [demoTime, setDemoTime] = useState("08:00");
    const [demoSaving, setDemoSaving] = useState(false);

    const isOptedOut = BLOCKED_STATUSES.includes(
        String(contact?.consent_status ?? "").toLowerCase()
    );

    async function loadStatus() {
        setLoading(true);
        setError("");
        setNotice("");

        try {
            const variants = phoneVariants(phone);

            let leadQuery = supabase
                .from("meta_leads")
                .select(
                    "id,created_time,community_joined,demo_attended,class_joined,whatsapp_opted_out"
                );

            if (leadId) {
                leadQuery = leadQuery.eq("id", leadId);
            } else {
                leadQuery = leadQuery
                    .in("whatsapp_number", variants)
                    .order("created_time", { ascending: false })
                    .limit(1);
            }

            const { data: leadRows, error: leadError } = await leadQuery;

            if (leadError) throw leadError;

            setLead((leadRows?.[0] as LeadStatus | undefined) ?? null);

            let contactQuery = supabase
                .from("whatsapp_contacts")
                .select("id,consent_status");

            if (contactId) {
                contactQuery = contactQuery.eq("id", contactId);
            } else {
                contactQuery = contactQuery.in("phone_number", variants);
            }

            const { data: contactRows, error: contactError } =
                await contactQuery.limit(1);

            if (contactError) throw contactError;

            setContact((contactRows?.[0] as ContactStatus | undefined) ?? null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Status load nahi ho saka."
            );
        } finally {
            setLoading(false);
        }
    }

    function openMenu(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();

        setPosition({
            x: Math.max(8, Math.min(event.clientX, window.innerWidth - 240)),
            y: Math.max(8, Math.min(event.clientY, window.innerHeight - 300)),
        });

        void loadStatus();
    }

    useEffect(() => {
        if (!position) return;

        function closeMenu(event: PointerEvent) {
            const target = event.target;

            if (
                target instanceof Element &&
                target.closest("[data-inbox-rightclick-menu]")
            ) {
                return;
            }

            setPosition(null);
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setPosition(null);
        }

        document.addEventListener("pointerdown", closeMenu);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("pointerdown", closeMenu);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [position]);

    function hideChatTemporarily() {
        const phoneKey = normalizePhone(phone);
        if (!phoneKey) {
            setError("Is chat ka phone number sahi nahi hai.");
            return;
        }

        if (
            !window.confirm(
                `${name || phone} ko Inbox list se hide karein? Chat history delete nahi hogi. Is number se naya incoming message aane par chat wapas dikhne lagegi.`
            )
        ) {
            return;
        }

        try {
            const storageKey = "ec_whatsapp_inbox_hidden_chats_v1";
            let hiddenChats: Record<string, number> = {};

            try {
                const saved = window.localStorage.getItem(storageKey);
                if (saved) {
                    const parsed: unknown = JSON.parse(saved);
                    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        hiddenChats = parsed as Record<string, number>;
                    }
                }
            } catch {
                // Corrupt local setting ko ignore karke fresh map use karein.
            }

            hiddenChats[phoneKey] = Date.now();
            window.localStorage.setItem(storageKey, JSON.stringify(hiddenChats));
            window.dispatchEvent(
                new CustomEvent("inbox-chat-hidden", { detail: { phoneKey } })
            );
            setPosition(null);
        } catch {
            setError("Chat hide nahi ho saki. Browser storage permission check karein.");
        }
    }

    async function updateLeadStatus(
        field: "community_joined" | "demo_attended" | "class_joined",
        label: string
    ) {
        if (saving) return;

        setSaving(true);
        setError("");
        setNotice("");

        try {
            let targetLead = lead;

            // Right-click ke waqt load hua record purana ho sakta hai.
            // Save karne se pehle latest record dobara fetch karein.
            const variants = phoneVariants(phone);

            let query = supabase
                .from("meta_leads")
                .select(
                    "id,created_time,community_joined,demo_attended,class_joined,whatsapp_opted_out"
                );

            if (leadId) {
                query = query.eq("id", leadId);
            } else {
                query = query
                    .in("whatsapp_number", variants)
                    .order("created_time", { ascending: false })
                    .limit(1);
            }

            const { data: rows, error: readError } = await query;

            if (readError) throw readError;

            targetLead = (rows?.[0] as LeadStatus | undefined) ?? null;

            if (!targetLead) {
                throw new Error(
                    "Is number ke liye Meta Report mein koi enquiry nahi mili."
                );
            }

            const nextValue = !targetLead[field];

            const { error: updateError } = await supabase
                .from("meta_leads")
                .update({ [field]: nextValue })
                .eq("id", targetLead.id);

            if (updateError) throw updateError;

            setLead({ ...targetLead, [field]: nextValue });

            setNotice(
                `${label}: ${nextValue ? "Joined/Attended" : "Not Joined/Attended"} save ho gaya.`
            );

            await onUpdated?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Status update nahi hua."
            );
        } finally {
            setSaving(false);
        }
    }

    async function saveDemoSchedule() {
        if (!lead) {
            setError("Is number ke liye Meta Report mein enquiry nahi mili.");
            return;
        }
        if (!demoDate || !demoTime) {
            setError("Demo ki date aur time select karein.");
            return;
        }

        setDemoSaving(true);
        setError("");
        setNotice("");

        try {
            const { data: existingEntries, error: duplicateCheckError } =
                await supabase
                    .from("demo_schedules")
                    .select("id, lead_id, phone_number")
                    .eq("demo_date", demoDate)
                    .eq("start_time", demoTime);

            if (duplicateCheckError) throw duplicateCheckError;

            const currentPhone = normalizePhone(phone);

            const duplicate = (existingEntries || []).some((item) => {
                const sameLead =
                    Boolean(lead.id) &&
                    String(item.lead_id) === String(lead.id);

                const samePhone =
                    Boolean(currentPhone) &&
                    normalizePhone(item.phone_number) === currentPhone;

                return sameLead || samePhone;
            });

            if (duplicate) {
                setError(
                    `${name || phone} का demo इस तारीख और स्लॉट में पहले से scheduled है।`
                );
                return;
            }

            const { error: insertError } = await supabase
                .from("demo_schedules")
                .insert({
                    lead_id: String(lead.id),
                    student_name: name || phone,
                    phone_number: phone,
                    demo_date: demoDate,
                    start_time: demoTime,
                    status: "scheduled",
                });
          

        if (insertError) throw insertError;
        setDemoModalOpen(false);
        setPosition(null);
        setNotice("Demo schedule save ho gaya.");
        await onUpdated?.();
        window.alert(`${name || phone} ka demo ${demoDate} ko ${demoTime} par schedule ho gaya.`);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Demo schedule save nahi hua.");
    } finally {
        setDemoSaving(false);
    }
}

async function updateOptOut(optOut: boolean) {
    if (saving) return;

    if (
        !optOut &&
        !window.confirm(
            "Kya aapne is contact ki written consent verify kar li hai? Confirm karne par WhatsApp opt-out hataya jayega."
        )
    ) {
        return;
    }

    if (
        optOut &&
        !window.confirm(
            `${name || phone} ko WhatsApp opt-out mark karein? Is contact ko marketing messages nahi bhejne chahiye.`
        )
    ) {
        return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const now = new Date().toISOString();
    const variants = phoneVariants(phone);

    try {
        // Campaign checker Meta Lead ka flag bhi check karta hai.
        const { error: leadError } = await supabase
            .from("meta_leads")
            .update({ whatsapp_opted_out: optOut })
            .in("whatsapp_number", variants);

        if (leadError) throw leadError;

        const consentStatus = optOut ? "opted_out" : "opted_in";

        const contactUpdate = {
            consent_status: consentStatus,
            consent_source: optOut
                ? "manual_admin"
                : "manual_written_consent",
            consent_at: now,
            updated_at: now,
        };

        if (contact?.id) {
            const { error: contactError } = await supabase
                .from("whatsapp_contacts")
                .update(contactUpdate)
                .eq("id", contact.id);

            if (contactError) throw contactError;
        } else {
            const { data: newContact, error: insertError } = await supabase
                .from("whatsapp_contacts")
                .insert({
                    ...contactUpdate,
                    phone_number: phone,
                    name: name || phone,
                })
                .select("id,consent_status")
                .single();

            if (insertError) throw insertError;

            setContact(newContact as ContactStatus);
        }

        setContact((current) =>
            current ? { ...current, consent_status: consentStatus } : current
        );

        setNotice(
            optOut
                ? "Opt-out save ho gaya."
                : "Opt-in save ho gaya. Written consent verify karke hi opt-in karein."
        );

        await onUpdated?.();
    } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : "Opt-out status update nahi hua."
        );
    } finally {
        setSaving(false);
    }
}

const menuButton =
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

return (
    <>
        <div className="contents" onContextMenu={openMenu}>
            {children}
        </div>

        {position && (
            <div
                data-inbox-rightclick-menu
                role="menu"
                className="fixed z-[9999] w-56 max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
                style={{ left: position.x, top: position.y }}
            >
                <div className="border-b border-gray-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {name || phone}
                    </p>
                    <p className="truncate text-xs text-gray-500">{phone}</p>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-gray-500">
                        <LoaderCircle size={16} className="animate-spin" />
                        Status load ho raha hai...
                    </div>
                ) : (
                    <div className="space-y-1 py-1">
                        <button
                            type="button"
                            role="menuitem"
                            disabled={saving}
                            onClick={() => void updateOptOut(!isOptedOut)}
                            className={menuButton}
                        >
                            <ShieldCheck size={16} />
                            {isOptedOut ? "Opt-in (Consent verified)" : "Opt-out"}
                        </button>

                        <div className="my-1 border-t border-gray-100" />

                        <button
                            type="button"
                            role="menuitem"
                            disabled={saving}
                            onClick={hideChatTemporarily}
                            className={`${menuButton} text-red-700 hover:bg-red-50`}
                        >
                            <Trash2 size={16} />
                            Delete Chat (Hide only)
                        </button>

                        <div className="my-1 border-t border-gray-100" />

                        <button
                            type="button"
                            role="menuitem"
                            disabled={saving || !lead}
                            onClick={() => {
                                setError("");
                                setNotice("");
                                setDemoDate(localDateString());
                                setDemoTime("08:00");
                                setPosition(null);
                                setDemoModalOpen(true);
                            }}
                            className={`${menuButton} text-indigo-700 hover:bg-indigo-50`}
                            title={!lead ? "Meta Lead nahi mili" : "Demo date aur time set karein"}
                        >
                            <CalendarDays size={16} />
                            Demo Schedule
                        </button>

                        <div className="my-1 border-t border-gray-100" />

                        <button
                            type="button"
                            role="menuitem"
                            disabled={saving || !lead}
                            onClick={() =>
                                void updateLeadStatus("class_joined", "Class")
                            }
                            className={menuButton}
                            title={!lead ? "Meta Lead nahi mili" : ""}
                        >
                            <GraduationCap size={16} />
                            Class: {lead?.class_joined ? "Joined ✓" : "Not joined"}
                        </button>

                        <button
                            type="button"
                            role="menuitem"
                            disabled={saving || !lead}
                            onClick={() =>
                                void updateLeadStatus("demo_attended", "Demo")
                            }
                            className={menuButton}
                            title={!lead ? "Meta Lead nahi mili" : ""}
                        >
                            <CalendarCheck size={16} />
                            Demo: {lead?.demo_attended ? "Attended ✓" : "Not attended"}
                        </button>

                        <button
                            type="button"
                            role="menuitem"
                            disabled={saving || !lead}
                            onClick={() =>
                                void updateLeadStatus("community_joined", "Community")
                            }
                            className={menuButton}
                            title={!lead ? "Meta Lead nahi mili" : ""}
                        >
                            <Users size={16} />
                            Community: {lead?.community_joined ? "Joined ✓" : "Not joined"}
                        </button>
                    </div>
                )}

                {saving && (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                        <LoaderCircle size={14} className="animate-spin" />
                        Saving...
                    </div>
                )}

                {error && (
                    <p role="alert" className="whitespace-pre-wrap px-3 py-2 text-xs text-red-700">
                        {error}
                    </p>
                )}

                {notice && (
                    <p role="status" className="whitespace-pre-wrap px-3 py-2 text-xs text-green-700">
                        {notice}
                    </p>
                )}

                <button
                    type="button"
                    onClick={() => setPosition(null)}
                    className="mt-1 w-full rounded-md border-t border-gray-100 px-3 py-2 text-left text-xs text-gray-500 hover:bg-gray-50"
                >
                    Close
                </button>
            </div>
        )}

        {demoModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => {
                if (event.target === event.currentTarget && !demoSaving) setDemoModalOpen(false);
            }}>
                <div role="dialog" aria-modal="true" aria-labelledby="demo-schedule-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 id="demo-schedule-title" className="text-lg font-semibold text-gray-900">Demo Schedule</h2>
                            <p className="mt-1 text-sm text-gray-500">{name || phone} · {phone}</p>
                        </div>
                        <button type="button" onClick={() => setDemoModalOpen(false)} disabled={demoSaving} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100">✕</button>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Demo Date
                            <input type="date" value={demoDate} onChange={(event) => setDemoDate(event.target.value)} min={localDateString()} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">
                            Demo Time
                            <select value={demoTime} onChange={(event) => setDemoTime(event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                                {Array.from({ length: 14 }, (_, index) => {
                                    const hour = index + 8;
                                    const value = `${String(hour).padStart(2, "0")}:00`;
                                    const labelHour = hour % 12 || 12;
                                    const period = hour < 12 ? "AM" : "PM";
                                    return <option key={value} value={value}>{`${labelHour}:00 ${period} (${value})`}</option>;
                                })}
                            </select>
                        </label>
                        {error && <p role="alert" className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setDemoModalOpen(false)} disabled={demoSaving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="button" onClick={() => void saveDemoSchedule()} disabled={demoSaving || !lead} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{demoSaving ? "Saving..." : "Save Demo"}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
);
}
