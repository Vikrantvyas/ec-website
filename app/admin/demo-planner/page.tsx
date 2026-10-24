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
};

const SLOT_STARTS = Array.from({ length: 14 }, (_, index) => index + 8);

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function statusLabel(status: DemoStatus) {
  if (status === "attended") return "Attended";
  if (status === "absent") return "Absent";
  return "Scheduled";
}

export default function DemoPlannerPage() {
  const [selectedDate, setSelectedDate] = useState(localDateString());
  const [demos, setDemos] = useState<DemoSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
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
        .select("id,lead_id,student_name,phone_number,demo_date,start_time,status,notes,created_at")
        .eq("demo_date", selectedDate)
        .order("start_time", { ascending: true });
      if (queryError) throw queryError;
      setDemos((data || []) as DemoSchedule[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo list load nahi hui.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadDemos();
  }, [loadDemos]);

  const visibleDemos = useMemo(
    () => showCompleted ? demos : demos.filter((demo) => demo.status === "scheduled"),
    [demos, showCompleted]
  );

  const bySlot = useMemo(() => {
    const groups: Record<number, DemoSchedule[]> = {};
    for (const hour of SLOT_STARTS) groups[hour] = [];
    for (const demo of visibleDemos) {
      const hour = Number(timeValue(demo.start_time).slice(0, 2));
      if (groups[hour]) groups[hour].push(demo);
    }
    return groups;
  }, [visibleDemos]);

  const scheduledCount = demos.filter((demo) => demo.status === "scheduled").length;
  const attendedCount = demos.filter((demo) => demo.status === "attended").length;
  const absentCount = demos.filter((demo) => demo.status === "absent").length;

  function changeDateBy(days: number) {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const next = new Date(year, month - 1, day);
    next.setDate(next.getDate() + days);
    setSelectedDate(localDateString(next));
  }

  async function updateDemo(id: string, changes: Partial<Pick<DemoSchedule, "demo_date" | "start_time" | "status">>) {
    setSavingId(id);
    setError("");
    setNotice("");
    try {
      const { error: updateError } = await supabase
        .from("demo_schedules")
        .update(changes)
        .eq("id", id);
      if (updateError) throw updateError;
      setNotice("Demo update save ho gaya.");
      await loadDemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo update nahi hua.");
    } finally {
      setSavingId(null);
    }
  }

  function openEdit(demo: DemoSchedule) {
    setEditing(demo);
    setEditDate(demo.demo_date);
    setEditTime(timeValue(demo.start_time));
    setEditStatus(demo.status);
    setError("");
    setNotice("");
  }

  async function saveEdit() {
    if (!editing || !editDate || !editTime) return;
    const id = editing.id;
    await updateDemo(id, { demo_date: editDate, start_time: editTime, status: editStatus });
    setEditing(null);
    if (editDate !== selectedDate) {
      setSelectedDate(editDate);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, hour: number) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/demo-schedule-id");
    if (!id) return;
    const demo = demos.find((item) => item.id === id);
    if (!demo || timeValue(demo.start_time) === `${String(hour).padStart(2, "0")}:00`) return;
    void updateDemo(id, { start_time: `${String(hour).padStart(2, "0")}:00` });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1800px] space-y-4">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700">
              <CalendarDays size={21} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">English Club · Admin</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Demo Control Room</h1>
            <p className="mt-1 text-sm text-slate-500">Ek nazar mein aaj ke demos, time slots aur student status.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => changeDateBy(-1)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" aria-label="Previous day"><ChevronLeft size={18} /></button>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" />
            <button type="button" onClick={() => changeDateBy(1)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" aria-label="Next day"><ChevronRight size={18} /></button>
            <button type="button" onClick={() => setSelectedDate(localDateString())} className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Today</button>
            <button type="button" onClick={() => void loadDemos()} disabled={loading} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50" aria-label="Refresh"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{readableDate(selectedDate)}</p>
            <p className="mt-0.5 text-xs text-slate-500">Student card ko drag karke doosre time slot par drop karein. Date badalne ke liye card ka Edit button use karein.</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            Attended / Absent bhi dikhayein
          </label>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Scheduled</p><p className="mt-1 text-2xl font-bold text-blue-950">{scheduledCount}</p></div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Attended</p><p className="mt-1 text-2xl font-bold text-emerald-950">{attendedCount}</p></div>
          <div className="col-span-2 rounded-xl border border-rose-100 bg-rose-50 p-3 sm:col-span-1"><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Absent</p><p className="mt-1 text-2xl font-bold text-rose-950">{absentCount}</p></div>
        </section>

        {error && <div role="alert" className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500"><LoaderCircle className="animate-spin" size={20} /> Demo slots load ho rahe hain...</div>
        ) : (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {SLOT_STARTS.map((hour) => {
              const slotDemos = bySlot[hour] || [];
              return (
                <div key={hour} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, hour)} className="flex min-h-44 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-2"><Clock3 size={15} className="text-indigo-600" /><h2 className="text-sm font-bold text-slate-800">{timeLabel(hour)}</h2></div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${slotDemos.length ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>{slotDemos.length} students</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-2.5">
                    {slotDemos.length === 0 && <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 px-2 py-5 text-xs text-slate-400">Yahan drop karein</div>}
                    {slotDemos.map((demo) => (
                      <article key={demo.id} draggable={demo.status === "scheduled"} onDragStart={(event) => event.dataTransfer.setData("text/demo-schedule-id", demo.id)} className={`rounded-lg border p-2.5 ${demo.status === "attended" ? "border-emerald-200 bg-emerald-50/70" : demo.status === "absent" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-white"} ${demo.status === "scheduled" ? "cursor-grab active:cursor-grabbing" : ""}`}>
                        <div className="flex items-start gap-2">
                          <GripVertical size={16} className="mt-0.5 shrink-0 text-slate-300" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{demo.student_name || "Unnamed student"}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{demo.phone_number}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${demo.status === "attended" ? "bg-emerald-100 text-emerald-800" : demo.status === "absent" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}`}>{statusLabel(demo.status)}</span>
                              <button type="button" onClick={() => openEdit(demo)} className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Edit / Move</button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <button type="button" disabled={savingId === demo.id} onClick={() => void updateDemo(demo.id, { status: "attended" })} className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Attended</button>
                              <button type="button" disabled={savingId === demo.id} onClick={() => void updateDemo(demo.id, { status: "absent" })} className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50">Absent</button>
                              {demo.status !== "scheduled" && <button type="button" disabled={savingId === demo.id} onClick={() => void updateDemo(demo.id, { status: "scheduled" })} className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Reopen</button>}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {editing && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="edit-demo-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between"><div><h2 id="edit-demo-title" className="text-lg font-bold text-slate-900">Reschedule Demo</h2><p className="mt-1 text-sm text-slate-500">{editing.student_name} · {editing.phone_number}</p></div><button type="button" onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Date<input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <label className="block text-sm font-medium text-slate-700">Time<select value={editTime} onChange={(event) => setEditTime(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">{SLOT_STARTS.map((hour) => <option key={hour} value={`${String(hour).padStart(2, "0")}:00`}>{timeLabel(hour)}</option>)}</select></label>
                <label className="block text-sm font-medium text-slate-700">Status<select value={editStatus} onChange={(event) => setEditStatus(event.target.value as DemoStatus)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"><option value="scheduled">Scheduled</option><option value="attended">Attended</option><option value="absent">Absent</option></select></label>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Cancel</button><button type="button" onClick={() => void saveEdit()} disabled={!editDate || !editTime || savingId === editing.id} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><Save size={15} /> Save changes</button></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
