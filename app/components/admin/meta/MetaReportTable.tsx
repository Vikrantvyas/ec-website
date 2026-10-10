"use client";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
type MetaLead = {
  id: string;
  meta_lead_id: string | null;
  created_time: string | null;
  ad_id: string | null;
  ad_name: string | null;
  ad_set_id: string | null;
  ad_set_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  form_id: string | null;
  form_name: string | null;
  platform: string | null;
  is_organic: boolean | null;
  full_name: string | null;
  whatsapp_number: string | null;
  age: string | null;
  education: string | null;
  english_level: string | null;
  demo_class_time: string | null;
  knows_zoom: string | null;
  lead_source: string | null;
  community_button_clicked: boolean | null;
  community_button_clicked_at: string | null;
  joining_status?: string | null;
};
type ColumnKey =
  | "date"
  | "name"
  | "whatsapp"
  | "campaign"
  | "adSet"
  | "ad"
  | "form"
  | "age"
  | "education"
  | "english"
  | "demo"
  | "zoom"
  | "platform"
  | "type"
  | "source"
  | "community"
  | "communityTime"
  | "joiningStatus";
type MetaReportTableProps = {
  leads: MetaLead[];
  totalLeads: number;
  loading: boolean;
  onRefresh: () => void;
};
const columns: {
  key: ColumnKey;
  label: string;
}[] = [
    { key: "date", label: "Date" },
    { key: "name", label: "Name" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "campaign", label: "Campaign" },
    { key: "adSet", label: "Ad Set" },
    { key: "ad", label: "Ad" },
    { key: "form", label: "Form" },
    { key: "age", label: "Age" },
    { key: "education", label: "Education" },
    { key: "english", label: "English" },
    { key: "demo", label: "Demo" },
    { key: "zoom", label: "Zoom" },
    { key: "platform", label: "Platform" },
    { key: "type", label: "Type" },
    { key: "source", label: "Source" },
    { key: "community", label: "Community" },
    { key: "communityTime", label: "Community Click Time" },
    { key: "joiningStatus", label: "Joining Status" },
  ];
const defaultVisibleColumns: Record<ColumnKey, boolean> = {
  date: true,
  name: true,
  whatsapp: true,
  campaign: true,
  adSet: true,
  ad: true,
  form: true,
  age: true,
  education: true,
  english: true,
  demo: true,
  zoom: true,
  platform: true,
  type: true,
  source: true,
  community: true,
  communityTime: true,
  joiningStatus: true,
};
function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function getCellValue(
  lead: MetaLead,
  column: ColumnKey
) {
  switch (column) {
    case "date":
      return formatDate(lead.created_time);
    case "name":
      return lead.full_name || "-";
    case "whatsapp":
      return lead.whatsapp_number || "-";
    case "campaign":
      return lead.campaign_name || "-";
    case "adSet":
      return lead.ad_set_name || "-";
    case "ad":
      return lead.ad_name || "-";
    case "form":
      return lead.form_name || "-";
    case "age":
      return lead.age || "-";
    case "education":
      return lead.education || "-";
    case "english":
      return lead.english_level || "-";
    case "demo":
      return lead.demo_class_time || "-";
    case "zoom":
      return lead.knows_zoom || "-";
    case "platform":
      return lead.platform || "-";
    case "type":
      return lead.is_organic ? "Organic" : "Paid";
    case "source": {
      const sourceLabels: Record<string, string> = {
        meta_lead_form: "Meta Lead Form",
        meta_ad: "Meta Ad",
        meta_whatsapp: "Meta WhatsApp",
        whatsapp: "WhatsApp",
        direct: "Direct",
      };
      if (!lead.lead_source) {
        return "-";
      }
      return (
        sourceLabels[lead.lead_source] ||
        lead.lead_source
      );
    }
    case "community":
      return lead.community_button_clicked
        ? "Clicked"
        : "Not Clicked";
    case "communityTime":
      return formatDate(
        lead.community_button_clicked_at
      );
    case "joiningStatus":
      return lead.joining_status || "-";
    default:
      return "-";
  }
}
function getWhatsAppUrl(number: string) {
  const cleanNumber = number.replace(/\D/g, "");
  if (!cleanNumber) return "#";
  const whatsappNumber =
    cleanNumber.length === 10
      ? `91${cleanNumber}`
      : cleanNumber;
  return `https://wa.me/${whatsappNumber}`;
}
export default function MetaReportTable({
  leads,
  totalLeads,
  loading,
  onRefresh,
}: MetaReportTableProps) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const lastSelectedIndexRef = useRef<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savingStatus, setSavingStatus] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<ColumnKey, boolean>
  >(() => {
    if (typeof window === "undefined") {
      return defaultVisibleColumns;
    }
    try {
      const saved = localStorage.getItem(
        "meta-report-visible-columns"
      );
      if (!saved) {
        return defaultVisibleColumns;
      }
      const parsed = JSON.parse(saved);
      return {
        ...defaultVisibleColumns,
        ...parsed,
      };
    } catch {
      return defaultVisibleColumns;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(
        "meta-report-visible-columns",
        JSON.stringify(visibleColumns)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [visibleColumns]);
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowColumnMenu(false);
      }
    }
    if (showColumnMenu) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }
    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [showColumnMenu]);
  function handleLeadSelection(
    leadId: string,
    index: number,
    event: ReactMouseEvent<HTMLInputElement>
  ) {
    const lastIndex = lastSelectedIndexRef.current;

    if (event.shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, index);
      const end = Math.max(lastIndex, index);
      const rangeIds = leads.slice(start, end + 1).map((lead) => lead.id);

      setSelectedIds((current) =>
        Array.from(new Set([...current, ...rangeIds]))
      );
      lastSelectedIndexRef.current = index;
      return;
    }

    // Normal click toggles only this checkbox, preserving other selections.
    setSelectedIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId]
    );

    lastSelectedIndexRef.current = index;
  }

  async function handleJoiningStatusChange(status: string) {
    if (!status) return;

    if (selectedIds.length === 0) {
      window.alert("Pehle kam se kam ek Lead select karein.");
      return;
    }

    setSavingStatus(true);
    const { error } = await supabase
      .from("meta_leads")
      .update({ joining_status: status })
      .in("id", selectedIds);

    setSavingStatus(false);

    if (error) {
      window.alert(`Joining Status save nahi hua: ${error.message}`);
      return;
    }

    window.alert(`${selectedIds.length} Lead(s) ka Joining Status ${status} save ho gaya.`);
    setSelectedIds([]);
    lastSelectedIndexRef.current = null;
    onRefresh();
  }

  function toggleColumn(column: ColumnKey) {
    setVisibleColumns((current) => ({
      ...current,
      [column]: !current[column],
    }));
  }
  function showAllColumns() {
    const allVisible = {} as Record<ColumnKey, boolean>;
    columns.forEach((column) => {
      allVisible[column.key] = true;
    });
    setVisibleColumns(allVisible);
  }
  function hideAllColumns() {
    const allHidden = {} as Record<ColumnKey, boolean>;
    columns.forEach((column) => {
      allHidden[column.key] = false;
    });
    setVisibleColumns(allHidden);
  }
  const visibleColumnList = columns.filter(
    (column) => visibleColumns[column.key]
  );
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4">
        <div>
          <h2 className="font-semibold text-gray-800">
            Lead Details
          </h2>
          <p className="text-xs text-gray-500">
            Showing {leads.length} of {totalLeads} leads
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">
            Selected: {selectedIds.length}
          </span>
          <select
            value=""
            disabled={savingStatus}
            onChange={(event) => handleJoiningStatusChange(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            aria-label="Update Joining Status"
          >
            <option value="">{savingStatus ? "Saving..." : "Joining Status ▾"}</option>
            <option value="Community">Community</option>
            <option value="Demo">Demo</option>
            <option value="Class">Class</option>
          </select>
          {/* Column Selection */}
          <div
            ref={columnMenuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setShowColumnMenu((current) => !current)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Columns ▾
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    Select Columns
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setShowColumnMenu(false)
                    }
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={showAllColumns}
                    className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={hideAllColumns}
                    className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    None
                  </button>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {columns.map((column) => (
                    <label
                      key={column.key}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.key]}
                        onChange={() =>
                          toggleColumn(column.key)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {column.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>
      {/* Table */}
      {loading ? (
        <div className="p-10 text-center text-sm text-gray-500">
          Loading Meta leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">
          No leads found.
        </div>
      ) : visibleColumnList.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">
          Please select at least one column.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-max w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">
                  Select
                </th>
                {visibleColumnList.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={
                    selectedIds.includes(lead.id)
                      ? "bg-blue-50 hover:bg-blue-100"
                      : lead.community_button_clicked
                        ? "bg-green-50 hover:bg-green-100"
                        : "hover:bg-gray-50"
                  }
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${lead.full_name || "lead"}`}
                      checked={selectedIds.includes(lead.id)}
                      onClick={(event) => {
                        handleLeadSelection(lead.id, index, event);
                      }}
                      onChange={() => undefined}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                  {visibleColumnList.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 ${column.key === "name"
                        ? "font-medium text-gray-800"
                        : ""
                        } ${column.key === "date" ||
                          column.key === "whatsapp"
                          ? "whitespace-nowrap"
                          : ""
                        }`}
                    >
                      {column.key === "whatsapp" &&
                        lead.whatsapp_number ? (
                        <a
                          href={getWhatsAppUrl(
                            lead.whatsapp_number
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-600 hover:text-green-700 hover:underline"
                        >
                          {lead.whatsapp_number}
                        </a>
                      ) : (
                        getCellValue(lead, column.key)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
