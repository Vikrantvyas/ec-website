
"use client";

import { useMemo, useState, type SetStateAction } from "react";
import {
    CalendarDays,
    SlidersHorizontal,
    MessageCircle,
    X,
    ArrowRight,
    LoaderCircle,
    Search,
} from "lucide-react";

export type InboxDemoSchedule = {
    id: string;
    phone_number: string;
    demo_date: string;
    start_time: string;
    status: string;
};

export type InboxSmartSearch = {
    text: string;
    scope: "incoming" | "outgoing" | "both";
    fromDate: string;
    toDate: string;
};

type Props = {
    demoSchedules: InboxDemoSchedule[];
    showDemoSlots: boolean;
    setShowDemoSlots: (value: boolean) => void;
    selectedSlotKeys: string[];
    draftSlotKeys: string[];
    setDraftSlotKeys: (value: SetStateAction<string[]>) => void;
    demoSlotDate: string;
    setDemoSlotDate: (value: string) => void;
    onApplySlots: (slotKeys: string[]) => void;
    openTextOnly: boolean;
    openTextLoading: boolean;
    onOpenTextChange: (checked: boolean) => void;
    onNextToBulk?: () => void;
    smartSearch?: InboxSmartSearch;
    onApplySmartSearch?: (search: InboxSmartSearch) => void;
};

function formatDemoTime(value: string) {
    const [hoursText, minutesText] = value.split(":");
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return value;
    }

    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"
        }`;
}

function getLocalDateString(date: Date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function normalizeStudentPhone(value: string) {
    let phone = value.replace(/\D/g, "");

    if (phone.length === 12 && phone.startsWith("91")) {
        phone = phone.slice(2);
    }

    if (phone.length === 11 && phone.startsWith("0")) {
        phone = phone.slice(1);
    }

    return phone;
}
const EMPTY_SMART_SEARCH: InboxSmartSearch = {
    text: "",
    scope: "incoming",
    fromDate: "",
    toDate: "",
};
export default function InboxFilters({
    demoSchedules,
    showDemoSlots,
    setShowDemoSlots,
    selectedSlotKeys,
    draftSlotKeys,
    setDraftSlotKeys,
    demoSlotDate,
    setDemoSlotDate,
    onApplySlots,
    openTextOnly,
    openTextLoading,
    onOpenTextChange,
    onNextToBulk,
    smartSearch = EMPTY_SMART_SEARCH,
    onApplySmartSearch = () => { },
}: Props) {
    const [demoSlotsEnabled, setDemoSlotsEnabled] = useState(
        selectedSlotKeys.length > 0
    );

    const defaultSmartSearch: InboxSmartSearch = {
        text: "",
        scope: "incoming",
        fromDate: "",
        toDate: "",
    };

    const [draftSearch, setDraftSearch] =
        useState<InboxSmartSearch>(smartSearch ?? defaultSmartSearch);

    const dateSchedules = useMemo(
        () =>
            demoSchedules.filter(
                (schedule) => schedule.demo_date === demoSlotDate
            ),
        [demoSchedules, demoSlotDate]
    );

    const uniqueSlots = useMemo(() => {
        const slots = new Map<string, InboxDemoSchedule>();

        dateSchedules.forEach((schedule) => {
            const key = `${schedule.demo_date}|${schedule.start_time.slice(0, 5)}`;

            if (!slots.has(key)) {
                slots.set(key, schedule);
            }
        });

        return Array.from(slots.entries());
    }, [dateSchedules]);

    const dateStudentCount = new Set(
        dateSchedules
            .map((schedule) => normalizeStudentPhone(schedule.phone_number))
            .filter(Boolean)
    ).size;

    function getSlotStudentCount(slotKey: string) {
        return new Set(
            dateSchedules
                .filter(
                    (schedule) =>
                        `${schedule.demo_date}|${schedule.start_time.slice(0, 5)}` ===
                        slotKey
                )
                .map((schedule) => normalizeStudentPhone(schedule.phone_number))
                .filter(Boolean)
        ).size;
    }

    const allDateSlotsSelected =
        uniqueSlots.length > 0 &&
        uniqueSlots.every(([key]) => draftSlotKeys.includes(key));

    function toggleAllDateSlots(checked: boolean) {
        const dateSlotKeys = uniqueSlots.map(([key]) => key);

        setDraftSlotKeys((current) =>
            checked
                ? [
                    ...new Set([
                        ...current.filter(
                            (key) => !key.startsWith(`${demoSlotDate}|`)
                        ),
                        ...dateSlotKeys,
                    ]),
                ]
                : current.filter(
                    (key) => !key.startsWith(`${demoSlotDate}|`)
                )
        );
    }

    function openPopup() {
        setDraftSlotKeys([...selectedSlotKeys]);
        setDemoSlotsEnabled(selectedSlotKeys.length > 0);
        setDraftSearch(smartSearch ?? defaultSmartSearch);
        setShowDemoSlots(true);
    }

    function closePopup() {
        setShowDemoSlots(false);
    }

    function clearFilters() {
        setDraftSlotKeys([]);
        setDemoSlotsEnabled(false);
        onApplySlots([]);

        const emptySearch: InboxSmartSearch = {
            text: "",
            scope: "incoming",
            fromDate: "",
            toDate: "",
        };

        setDraftSearch(emptySearch);
        onApplySmartSearch?.(emptySearch);

        if (openTextOnly) {
            onOpenTextChange(false);
        }
    }

    function applySearch() {
        onApplySlots(demoSlotsEnabled ? draftSlotKeys : []);
        onApplySmartSearch?.(draftSearch);
        onNextToBulk?.();
    }

    const hasSearchCriteria =
        draftSearch.text.trim().length > 0 ||
        draftSearch.fromDate.length > 0 ||
        draftSearch.toDate.length > 0;

    const hasSelectedFilters =
        (demoSlotsEnabled && draftSlotKeys.length > 0) ||
        openTextOnly ||
        hasSearchCriteria;

    const activeFilterCount =
        selectedSlotKeys.length +
        (openTextOnly ? 1 : 0) +
        (smartSearch.text.trim() ||
            smartSearch.fromDate ||
            smartSearch.toDate
            ? 1
            : 0);

    return (
        <>
            <button
                type="button"
                onClick={openPopup}
                title="Filter chats"
                aria-label="Filter chats"
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-[#008069] hover:bg-green-50"
            >
                <SlidersHorizontal size={15} />
                Filter

                {activeFilterCount > 0 && (
                    <span className="rounded-full bg-green-100 px-1.5 text-[10px] font-bold text-green-800">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {showDemoSlots && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-3 sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closePopup();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inbox-filters-title"
                        className="flex max-h-[90dvh] min-h-[400px] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal
                                    size={18}
                                    className="text-[#008069]"
                                />
                                <h3
                                    id="inbox-filters-title"
                                    className="font-semibold text-gray-900"
                                >
                                    Filter Chats
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closePopup}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                            {/* Smart message search */}
                            <section className="rounded-lg border border-gray-200 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Search
                                        size={17}
                                        className="text-[#008069]"
                                    />
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Search Messages
                                    </h4>
                                </div>

                                <input
                                    type="text"
                                    value={draftSearch.text}
                                    onChange={(event) =>
                                        setDraftSearch((current) => ({
                                            ...current,
                                            text: event.target.value,
                                        }))
                                    }
                                    placeholder="Search message text, e.g. दोपहर 2 से 3"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#008069]"
                                />

                                <div className="mt-3">
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Search In
                                    </label>

                                    <div className="flex flex-wrap gap-4">
                                        {(
                                            [
                                                ["incoming", "Student Replies"],
                                                ["outgoing", "Our Replies"],
                                                ["both", "Both"],
                                            ] as const
                                        ).map(([value, label]) => (
                                            <label
                                                key={value}
                                                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                                            >
                                                <input
                                                    type="radio"
                                                    name="inbox-search-scope"
                                                    value={value}
                                                    checked={
                                                        draftSearch.scope === value
                                                    }
                                                    onChange={() =>
                                                        setDraftSearch(
                                                            (current) => ({
                                                                ...current,
                                                                scope: value,
                                                            })
                                                        )
                                                    }
                                                    className="accent-[#008069]"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <label className="text-xs font-medium text-gray-600">
                                        From Date
                                        <input
                                            type="date"
                                            value={draftSearch.fromDate}
                                            max={draftSearch.toDate || undefined}
                                            onChange={(event) =>
                                                setDraftSearch((current) => ({
                                                    ...current,
                                                    fromDate: event.target.value,
                                                }))
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </label>

                                    <label className="text-xs font-medium text-gray-600">
                                        To Date
                                        <input
                                            type="date"
                                            value={draftSearch.toDate}
                                            min={draftSearch.fromDate || undefined}
                                            onChange={(event) =>
                                                setDraftSearch((current) => ({
                                                    ...current,
                                                    toDate: event.target.value,
                                                }))
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </label>
                                </div>
                            </section>

                            {/* Existing Open Text and Demo Slots filters */}
                            <section className="rounded-lg border border-gray-200 p-4">
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-gray-200 pb-4">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={openTextOnly}
                                            disabled={openTextLoading}
                                            onChange={(event) =>
                                                onOpenTextChange(
                                                    event.target.checked
                                                )
                                            }
                                            className="accent-[#008069]"
                                        />
                                        Open Text

                                        {openTextLoading && (
                                            <LoaderCircle
                                                size={14}
                                                className="animate-spin text-gray-500"
                                            />
                                        )}
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={demoSlotsEnabled}
                                            onChange={(event) => {
                                                const checked =
                                                    event.target.checked;

                                                setDemoSlotsEnabled(checked);
                                                setDraftSlotKeys([]);

                                                if (checked) {
                                                    setDemoSlotDate(
                                                        getLocalDateString(
                                                            new Date()
                                                        )
                                                    );
                                                }
                                            }}
                                            className="accent-[#008069]"
                                        />
                                        <CalendarDays size={16} />
                                        Demo Slots
                                    </label>
                                </div>

                                {demoSlotsEnabled && (
                                    <div className="pt-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <label className="block text-xs font-medium text-gray-600">
                                                Select Date
                                                <input
                                                    type="date"
                                                    value={demoSlotDate}
                                                    onChange={(event) => {
                                                        const nextDate =
                                                            event.target.value;
                                                        setDemoSlotDate(nextDate);
                                                        setDraftSlotKeys((current) =>
                                                            current.filter((key) =>
                                                                key.startsWith(
                                                                    `${nextDate}|`
                                                                )
                                                            )
                                                        );
                                                    }}
                                                    className="mt-1 block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </label>

                                            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
                                                Total Students: {dateStudentCount}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-2 border-b border-gray-200 pb-2">
                                            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={allDateSlotsSelected}
                                                    onChange={(event) =>
                                                        toggleAllDateSlots(
                                                            event.target.checked
                                                        )
                                                    }
                                                    disabled={!uniqueSlots.length}
                                                    className="accent-[#008069]"
                                                />
                                                Select All Slots
                                            </label>

                                            <span className="text-xs text-gray-500">
                                                {uniqueSlots.length} time slots
                                            </span>
                                        </div>

                                        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-md bg-gray-50 p-2">
                                            {uniqueSlots.map(([key, schedule]) => (
                                                <label
                                                    key={key}
                                                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={draftSlotKeys.includes(
                                                            key
                                                        )}
                                                        onChange={(event) => {
                                                            const checked =
                                                                event.target.checked;

                                                            setDraftSlotKeys(
                                                                (current) =>
                                                                    checked
                                                                        ? current.includes(
                                                                            key
                                                                        )
                                                                            ? current
                                                                            : [
                                                                                ...current,
                                                                                key,
                                                                            ]
                                                                        : current.filter(
                                                                            (item) =>
                                                                                item !== key
                                                                        )
                                                            );
                                                        }}
                                                        className="accent-[#008069]"
                                                    />

                                                    <span>
                                                        {formatDemoTime(
                                                            schedule.start_time
                                                        )}
                                                    </span>

                                                    <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                        {getSlotStudentCount(key)} students
                                                    </span>
                                                </label>
                                            ))}

                                            {uniqueSlots.length === 0 && (
                                                <p className="p-3 text-xs text-gray-500">
                                                    Is date par koi scheduled demo slot nahi hai.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t bg-gray-50 px-4 py-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                            >
                                Clear Filters
                            </button>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closePopup}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={applySearch}
                                    disabled={
                                        (!hasSelectedFilters &&
                                            !hasSearchCriteria) ||
                                        openTextLoading
                                    }
                                    className="flex items-center gap-1.5 rounded-lg bg-[#008069] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006e5b] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    <MessageCircle size={15} />
                                    Apply & Bulk Actions
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
