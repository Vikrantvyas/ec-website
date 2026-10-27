
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    GripVertical,
    LoaderCircle,
    RefreshCw,
    Save,
    X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type DemoStatus = "scheduled" | "attended" | "absent";

type DemoSchedule = {
    id: string;
    lead_id: string;
    student_name: string;
    phone_number: string;
    demo_date: string;
    start_time: string;
    status: DemoStatus;
    notes: string | null;
    created_at: string;
    english_level?: string | null;
};

const SLOT_STARTS = Array.from({ length: 14 }, (_, index) => index + 8);

function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
function normalizePhone(value: string) {
    return String(value || "")
        .replace(/\D/g, "")
        .replace(/^91(?=\d{10}$)/, "");
}

async function hasDuplicateSlot(
    demo: DemoSchedule,
    targetDate: string,
    targetTime: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from("demo_schedules")
        .select("id, lead_id, phone_number")
        .eq("demo_date", targetDate)
        .eq("start_time", targetTime)
        .neq("id", demo.id);

    if (error) throw error;

    return (data || []).some((item) => {
        const sameLead =
            Boolean(demo.lead_id) &&
            item.lead_id === demo.lead_id;

        const samePhone =
            Boolean(demo.phone_number) &&
            normalizePhone(item.phone_number) ===
            normalizePhone(demo.phone_number);

        return sameLead || samePhone;
    });
}
function timeValue(value: string) {
    return String(value || "08:00").slice(0, 5);
}

function timeLabel(hour: number) {
    const startHour = hour % 12 || 12;
    const endHour = (hour + 1) % 12 || 12;
    const startPeriod = hour < 12 ? "AM" : "PM";
    const endPeriod = hour + 1 < 12 ? "AM" : "PM";

    return `${startHour} ${startPeriod} – ${endHour} ${endPeriod}`;
}

function readableDate(value: string) {
    if (!value) return "";

    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function DemoPlannerPage() {
    const [selectedDate, setSelectedDate] = useState(localDateString());
    const [demos, setDemos] = useState<DemoSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [showCompleted, setShowCompleted] = useState(true);
    const [contextMenu, setContextMenu] = useState<{
        demo: DemoSchedule;
        x: number;
        y: number;
    } | null>(null);

    const [editing, setEditing] = useState<DemoSchedule | null>(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("08:00");
    const [editStatus, setEditStatus] = useState<DemoStatus>("scheduled");

    const loadDemos = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data, error: queryError } = await supabase
                .from("demo_schedules")
                .select(
                    "id,lead_id,student_name,phone_number,demo_date,start_time,status,notes,created_at"
                )
                .eq("demo_date", selectedDate)
                .order("start_time", { ascending: true });

            if (queryError) throw queryError;

            const demoRows = data || [];
            const leadIds = [...new Set(demoRows.map((demo) => demo.lead_id))];

            let levelMap: Record<string, string | null> = {};

            if (leadIds.length > 0) {
                const { data: leadRows, error: leadError } = await supabase
                    .from("meta_leads")
                    .select("id, english_level")
                    .in("id", leadIds);

                if (leadError) throw leadError;

                levelMap = Object.fromEntries(
                    (leadRows || []).map((lead) => [lead.id, lead.english_level])
                );
            }

            setDemos(
                demoRows.map((demo) => ({
                    ...demo,
                    english_level: levelMap[demo.lead_id] ?? null,
                })) as DemoSchedule[]
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Demo list load nahi hui."
            );
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        void loadDemos();
    }, [loadDemos]);

    const visibleDemos = useMemo(
        () =>
            showCompleted
                ? demos
                : demos.filter((demo) => demo.status === "scheduled"),
        [demos, showCompleted]
    );

    const bySlot = useMemo(() => {
        const groups: Record<number, DemoSchedule[]> = {};

        for (const hour of SLOT_STARTS) {
            groups[hour] = [];
        }

        for (const demo of visibleDemos) {
            const hour = Number(timeValue(demo.start_time).slice(0, 2));

            if (groups[hour]) {
                groups[hour].push(demo);
            }
        }

        for (const hour of SLOT_STARTS) {
            groups[hour].sort((a, b) =>
                (a.student_name || "").localeCompare(
                    b.student_name || "",
                    undefined,
                    { sensitivity: "base" }
                )
            );
        }

        return groups;
    }, [visibleDemos]);

    const scheduledCount = demos.filter(
        (demo) => demo.status === "scheduled"
    ).length;

    const attendedCount = demos.filter(
        (demo) => demo.status === "attended"
    ).length;

    const absentCount = demos.filter(
        (demo) => demo.status === "absent"
    ).length;

    function changeDateBy(days: number) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const next = new Date(year, month - 1, day);

        next.setDate(next.getDate() + days);
        setSelectedDate(localDateString(next));
    }

    async function moveDemoToSlot(id: string, hour: number) {
        const newTime = `${String(hour).padStart(2, "0")}:00`;
        const demo = demos.find((item) => item.id === id);

        if (!demo || timeValue(demo.start_time) === newTime) {
            return;
        }

        setSavingId(id);
        setError("");
        setNotice("");

        try {
            const duplicate = await hasDuplicateSlot(
                demo,
                selectedDate,
                newTime
            );

            if (duplicate) {
                setError(
                    "यह विद्यार्थी इस तारीख और स्लॉट में पहले से मौजूद है।"
                );
                return;
            }

            const { error: updateError } = await supabase
                .from("demo_schedules")
                .update({ start_time: newTime })
                .eq("id", id);

            if (updateError) throw updateError;

            setNotice("Demo ka time update ho gaya.");
            await loadDemos();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Demo ka time update nahi hua."
            );
        } finally {
            setSavingId(null);
        }
    }
    function openEdit(demo: DemoSchedule) {
        setContextMenu(null);
        setEditing(demo);
        setEditDate(demo.demo_date);
        setEditTime(timeValue(demo.start_time));
        setEditStatus(demo.status);
        setError("");
        setNotice("");
    }


    async function updateDemo(
        id: string,
        changes: Partial<
            Pick<DemoSchedule, "demo_date" | "start_time" | "status">
        >
    ): Promise<boolean> {
        setSavingId(id);
        setError("");
        setNotice("");

        try {
            const currentDemo = demos.find((item) => item.id === id);

            if (
                currentDemo &&
                (changes.demo_date !== undefined ||
                    changes.start_time !== undefined)
            ) {
                const targetDate =
                    changes.demo_date ?? currentDemo.demo_date;

                const targetTime =
                    changes.start_time ?? currentDemo.start_time;

                const duplicate = await hasDuplicateSlot(
                    currentDemo,
                    targetDate,
                    targetTime
                );

                if (duplicate) {
                    setError(
                        "यह विद्यार्थी इस तारीख और स्लॉट में पहले से मौजूद है।"
                    );
                    return false;
                }
            }

            const { error: updateError } = await supabase
                .from("demo_schedules")
                .update(changes)
                .eq("id", id);

            if (updateError) throw updateError;

            setNotice("Demo update save ho gaya.");
            await loadDemos();
            return true;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Demo update nahi hua."
            );
            return false;
        } finally {
            setSavingId(null);
        }
    }

    async function saveEdit() {
        if (!editing || !editDate || !editTime) return;

        const success = await updateDemo(editing.id, {
            demo_date: editDate,
            start_time: editTime,
            status: editStatus,
        });

        if (!success) return;

        const newDate = editDate;
        setEditing(null);

        if (newDate !== selectedDate) {
            setSelectedDate(newDate);
        }
    }

    async function changeDemoStatus(status: DemoStatus) {
        if (!contextMenu) return;

        const id = contextMenu.demo.id;
        setContextMenu(null);

        await updateDemo(id, { status });
    }

    async function deleteDemo() {
        if (!contextMenu) return;

        const demo = contextMenu.demo;

        const confirmed = window.confirm(
            `Kya aap "${demo.student_name}" ka demo schedule delete karna chahte hain?`
        );

        if (!confirmed) return;

        setContextMenu(null);
        setSavingId(demo.id);
        setError("");
        setNotice("");

        try {
            const { data: deletedRows, error: deleteError } = await supabase
                .from("demo_schedules")
                .delete()
                .eq("id", demo.id)
                .select("id");

            if (deleteError) throw deleteError;

            if (!deletedRows || deletedRows.length === 0) {
                throw new Error(
                    "Record delete nahi hua. Supabase DELETE permission / RLS policy check karein."
                );
            }

            setDemos((current) => current.filter((item) => item.id !== demo.id));
            setNotice("Demo schedule delete ho gaya.");
            await loadDemos();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Demo schedule delete nahi hua."
            );
        } finally {
            setSavingId(null);
        }
    }

    function handleDrop(event: DragEvent<HTMLDivElement>, hour: number) {
        event.preventDefault();

        const id = event.dataTransfer.getData("text/demo-schedule-id");

        if (!id) return;

        const demo = demos.find((item) => item.id === id);

        if (!demo || demo.status !== "scheduled") return;

        void moveDemoToSlot(id, hour);
    }

    return (
        <main className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-[1800px] space-y-4">
                <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-700">
                            <CalendarDays size={21} />
                            <span className="text-xs font-bold uppercase tracking-[0.18em]">
                                English Club · Admin
                            </span>
                        </div>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Demo Control Room
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Ek nazar mein demos, time slots aur student count.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => changeDateBy(-1)}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                            aria-label="Previous day"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                            className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                        />

                        <button
                            type="button"
                            onClick={() => changeDateBy(1)}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                            aria-label="Next day"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedDate(localDateString())}
                            className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                            Today
                        </button>

                        <button
                            type="button"
                            onClick={() => void loadDemos()}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                            aria-label="Refresh"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                        </button>
                    </div>
                </header>

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">
                            {readableDate(selectedDate)}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Scheduled student ko drag karke doosre time slot par drop karein.
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={showCompleted}
                            onChange={(event) => setShowCompleted(event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        Attended / Absent bhi dikhayein
                    </label>
                </div>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Scheduled
                        </p>
                        <p className="mt-1 text-2xl font-bold text-blue-950">
                            {scheduledCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Attended
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-950">
                            {attendedCount}
                        </p>
                    </div>

                    <div className="col-span-2 rounded-xl border border-rose-100 bg-rose-50 p-3 sm:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                            Absent
                        </p>
                        <p className="mt-1 text-2xl font-bold text-rose-950">
                            {absentCount}
                        </p>
                    </div>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {notice && (
                    <div
                        role="status"
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                    >
                        {notice}
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
                        <LoaderCircle className="animate-spin" size={20} />
                        Demo slots load ho rahe hain...
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {SLOT_STARTS.map((hour) => {
                            const slotDemos = bySlot[hour] || [];

                            return (
                                <div
                                    key={hour}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => handleDrop(event, hour)}
                                    className="flex min-h-36 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Clock3 size={15} className="text-indigo-600" />
                                            <h2 className="text-sm font-bold text-slate-800">
                                                {timeLabel(hour)}
                                            </h2>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${slotDemos.length
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "bg-slate-200 text-slate-600"
                                                }`}
                                        >
                                            {slotDemos.length} students
                                        </span>
                                    </div>

                                    <div className="flex flex-1 flex-col gap-1 p-1.5">
                                        {slotDemos.length === 0 && (
                                            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 px-2 py-4 text-xs text-slate-400">
                                                Yahan drop karein
                                            </div>
                                        )}

                                        {slotDemos.map((demo) => (
                                            <article
                                                key={demo.id}
                                                onContextMenu={(event) => {
                                                    event.preventDefault();

                                                    setContextMenu({
                                                        demo,
                                                        x: event.clientX,
                                                        y: event.clientY,
                                                    });
                                                }}
                                                draggable={demo.status === "scheduled" && savingId !== demo.id}
                                                onDragStart={(event) =>
                                                    event.dataTransfer.setData(
                                                        "text/demo-schedule-id",
                                                        demo.id
                                                    )
                                                }
                                                title={`${demo.student_name || "Unnamed student"} · ${demo.phone_number}`}
                                                className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 ${demo.status === "attended"
                                                    ? "border-emerald-200 bg-emerald-50/70"
                                                    : demo.status === "absent"
                                                        ? "border-rose-200 bg-rose-50/70"
                                                        : "border-slate-200 bg-white"
                                                    } ${demo.status === "scheduled"
                                                        ? "cursor-grab active:cursor-grabbing"
                                                        : "cursor-default"
                                                    }`}
                                            >
                                                <GripVertical
                                                    size={14}
                                                    className="shrink-0 text-slate-300"
                                                    aria-label="Drag student to another time slot"
                                                />

                                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-900">
    {demo.student_name || "Unnamed student"}
    {demo.english_level && (
        <span className="ml-1 font-medium text-indigo-600">
            ({demo.english_level})
        </span>
    )}
</span>
                                                <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-500">
                                                    {demo.phone_number}
                                                </span>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
                {contextMenu && (
                    <div
                        className="fixed z-[10000] min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
                        style={{
                            left: Math.min(
                                contextMenu.x,
                                typeof window !== "undefined"
                                    ? window.innerWidth - 190
                                    : contextMenu.x
                            ),
                            top: Math.min(
                                contextMenu.y,
                                typeof window !== "undefined"
                                    ? window.innerHeight - 220
                                    : contextMenu.y
                            ),
                        }}
                        onContextMenu={(event) => event.preventDefault()}
                    >
                        <div className="border-b border-slate-100 px-3 py-2">
                            <p className="max-w-52 truncate text-sm font-semibold text-slate-900">
                                {contextMenu.demo.student_name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {contextMenu.demo.phone_number}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void changeDemoStatus("scheduled")}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                        >
                            Scheduled
                        </button>

                        <button
                            type="button"
                            onClick={() => void changeDemoStatus("attended")}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
                        >
                            Attended
                        </button>

                        <button
                            type="button"
                            onClick={() => void changeDemoStatus("absent")}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                        >
                            Absent
                        </button>

                        <button
                            type="button"
                            onClick={() => openEdit(contextMenu.demo)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                            Edit / Move
                        </button>
                        <button
                            type="button"
                            onClick={() => void deleteDemo()}
                            disabled={savingId === contextMenu.demo.id}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            Delete Demo
                        </button>
                        <button
                            type="button"
                            onClick={() => setContextMenu(null)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-400 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {editing && (
                    <div
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/40 p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setEditing(null);
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-demo-title"
                            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h2
                                        id="edit-demo-title"
                                        className="text-lg font-bold text-slate-900"
                                    >
                                        Edit / Move Demo
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {editing.student_name} · {editing.phone_number}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">
                                    Date
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(event) => setEditDate(event.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Time
                                    <select
                                        value={editTime}
                                        onChange={(event) => setEditTime(event.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                                    >
                                        {SLOT_STARTS.map((hour) => (
                                            <option
                                                key={hour}
                                                value={`${String(hour).padStart(2, "0")}:00`}
                                            >
                                                {timeLabel(hour)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Status
                                    <select
                                        value={editStatus}
                                        onChange={(event) =>
                                            setEditStatus(event.target.value as DemoStatus)
                                        }
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="attended">Attended</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </label>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(null)}
                                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => void saveEdit()}
                                        disabled={!editDate || !editTime || savingId === editing.id}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        <Save size={15} />
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
