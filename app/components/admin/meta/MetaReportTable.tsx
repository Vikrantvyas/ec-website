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
  community_joined: boolean | null;
  demo_attended: boolean | null;
  class_joined: boolean | null;
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
  ;
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
function normalizePhoneForMatch(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits;
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

  const [sortColumn, setSortColumn] = useState<ColumnKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [savingStatus, setSavingStatus] = useState(false);
  const [deletingLeads, setDeletingLeads] = useState(false);
  const [inboxPhones, setInboxPhones] = useState<string[]>([]);
  useEffect(() => {
    async function loadInboxPhones() {
      const { data, error } = await supabase
        .from("whatsapp_contacts")
        .select("phone_number");

      if (error) {
        console.error("Inbox contacts load failed:", error.message);
        return;
      }

      setInboxPhones(
        (data ?? [])
          .map((contact) => normalizePhoneForMatch(contact.phone_number ?? ""))
          .filter(Boolean)
      );
    }

    void loadInboxPhones();
  }, []);
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
  function handleSendSelectedLeads() {
    const selectedLeads = leads
      .filter((lead) => selectedIds.includes(lead.id))
      .filter((lead) => {
        const digits = String(lead.whatsapp_number ?? "").replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      })
      .map((lead) => ({
        id: lead.id,
        name: lead.full_name || "Name not available",
        phone: String(lead.whatsapp_number ?? "").replace(/\D/g, ""),
        source: "meta_leads" as const,
      }));
    if (selectedIds.length === 0) {
      window.alert("Pehle kam se kam ek Meta Lead select karein.");
      return;
    }
    if (selectedLeads.length === 0) {
      window.alert("Selected Leads mein valid WhatsApp number nahi mila.");
      return;
    }

    try {
      sessionStorage.setItem(
        "ec_meta_report_selected_leads",
        JSON.stringify(selectedLeads),
      );
      window.location.href = "/admin/whatsapp?source=meta_leads&from=meta-report";
    } catch {
      window.alert("Selected Leads save nahi ho sake. Dobara try karein.");
    }
  }
  async function deleteSelectedLeads() {
    if (selectedIds.length === 0) {
      window.alert("Pehle kam se kam ek Lead select karein.");
      return;
    }

    const confirmed = window.confirm(
      `Kya aap ${selectedIds.length} selected Meta Lead(s) ko delete karna chahte hain?\n\n` +
      "Iske saath related WhatsApp Contacts, Messages, Campaign Records, Bot Sessions, Form Followups aur Demo Schedules bhi delete ho sakte hain.\n\n" +
      "Offline CRM, Attendance aur Batch records delete nahi honge.\n\n" +
      "Ye action undo nahi kiya ja sakta."
    );

    if (!confirmed) return;

    setDeletingLeads(true);

    try {
      const { data, error } = await supabase.rpc(
        "delete_meta_report_leads",
        {
          p_meta_ids: selectedIds,
        }
      );

      if (error) {
        window.alert(`Delete failed: ${error.message}`);
        return;
      }

      const deletedCount = data?.deleted_meta_leads ?? 0;

      setSelectedIds([]);
      lastSelectedIndexRef.current = null;

      window.alert(
        `${deletedCount} Meta Lead(s) successfully deleted.`
      );

      onRefresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Delete karte samay error aaya."
      );
    } finally {
      setDeletingLeads(false);
    }
  }
  async function updateSelectedStatus(
    field: "community_joined" | "demo_attended" | "class_joined",
    value: boolean,
    label: string
  ) {
    if (selectedIds.length === 0) {
      window.alert("Pehle kam se kam ek Lead select karein.");
      return;
    }
    setSavingStatus(true);
    const { error } = await supabase
      .from("meta_leads")
      .update({ [field]: value })
      .in("id", selectedIds);
    setSavingStatus(false);
    if (error) {
      window.alert(`${label} status save nahi hua: ${error.message}`);
      return;
    }
    window.alert(`${selectedIds.length} Lead(s) ka ${label} status update ho gaya.`);
    setSelectedIds([]);
    lastSelectedIndexRef.current = null;
    onRefresh();
  }
  async function toggleLeadStatus(
    lead: MetaLead,
    field: "community_joined" | "demo_attended" | "class_joined",
    label: string
  ) {
    const nextValue = !lead[field];
    setSavingStatus(true);
    const { error } = await supabase
      .from("meta_leads")
      .update({ [field]: nextValue })
      .eq("id", lead.id);
    setSavingStatus(false);
    if (error) {
      window.alert(`${label} status save nahi hua: ${error.message}`);
      return;
    }
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

  function handleSort(column: ColumnKey) {
    if (sortColumn === column) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    if (!sortColumn) return 0;

    let valueA = getCellValue(a, sortColumn);
    let valueB = getCellValue(b, sortColumn);

    if (sortColumn === "date" || sortColumn === "communityTime") {
      const dateA = sortColumn === "date" ? a.created_time : a.community_button_clicked_at;
      const dateB = sortColumn === "date" ? b.created_time : b.community_button_clicked_at;

      valueA = dateA || "";
      valueB = dateB || "";
    }

    const comparison = String(valueA).localeCompare(
      String(valueB),
      undefined,
      { numeric: true, sensitivity: "base" }
    );

    return sortDirection === "asc" ? comparison : -comparison;
  });

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
          <button
            type="button"
            onClick={handleSendSelectedLeads}
            disabled={savingStatus || selectedIds.length === 0}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send Msg ({selectedIds.length})
          </button>
                    <button
            type="button"
            onClick={deleteSelectedLeads}
            disabled={
              savingStatus ||
              deletingLeads ||
              selectedIds.length === 0
            }
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingLeads
              ? "Deleting..."
              : `Delete (${selectedIds.length})`}
          </button>
          <select
            value=""
            disabled={savingStatus}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "community") updateSelectedStatus("community_joined", true, "Community");
              if (value === "demo") updateSelectedStatus("demo_attended", true, "Demo");
              if (value === "class") updateSelectedStatus("class_joined", true, "Class");
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            aria-label="Update selected lead statuses"
          >
            <option value="">{savingStatus ? "Saving..." : "Update Status ▾"}</option>
            <option value="community">Community</option>
            <option value="demo">Demo</option>
            <option value="class">Class</option>
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        leads.length > 0 &&
                        leads.every((lead) => selectedIds.includes(lead.id))
                      }
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds((current) =>
                            Array.from(
                              new Set([...current, ...leads.map((lead) => lead.id)])
                            )
                          );
                        } else {
                          setSelectedIds((current) =>
                            current.filter(
                              (id) => !leads.some((lead) => lead.id === id)
                            )
                          );
                          lastSelectedIndexRef.current = null;
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Select all filtered leads"
                    />

                  </label>
                </th>

                {visibleColumnList.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3"
                  >

                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}

                      className="inline-flex cursor-pointer items-center gap-1 font-semibold hover:text-blue-600"

                    >
                      {column.label}
                      {sortColumn === column.key && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>

                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">

              {sortedLeads.map((lead, index) => (

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
                      {column.key === "whatsapp" && lead.whatsapp_number ? (
                        <a
                          href={`/admin/whatsapp/inbox?phone=${encodeURIComponent(
                            lead.whatsapp_number
                          )}`}
                          className="font-medium text-green-600 hover:text-green-700 hover:underline"
                          title="WhatsApp Inbox mein chat kholen"
                        >
                          {lead.whatsapp_number}
                        </a>
                      ) : column.key === "name" ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span>{lead.full_name || "-"}</span>
                          {lead.whatsapp_number &&
                            inboxPhones.includes(
                              normalizePhoneForMatch(lead.whatsapp_number)
                            ) && (
                              <span
                                title="This lead is already in WhatsApp Inbox"
                                className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold leading-4 text-green-800"
                              >
                                Inbox
                              </span>
                            )}
                          {lead.community_joined && (
                            <button type="button" disabled={savingStatus} onClick={() => toggleLeadStatus(lead, "community_joined", "Community")} title="Community joined — click to remove" className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold leading-4 text-green-800 hover:bg-green-200 disabled:opacity-50">Com</button>
                          )}
                          {lead.demo_attended && (
                            <button type="button" disabled={savingStatus} onClick={() => toggleLeadStatus(lead, "demo_attended", "Demo")} title="Demo attended — click to remove" className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-semibold leading-4 text-blue-800 hover:bg-blue-200 disabled:opacity-50">Demo</button>
                          )}
                          {lead.class_joined && (
                            <button type="button" disabled={savingStatus} onClick={() => toggleLeadStatus(lead, "class_joined", "Class")} title="Class joined — click to remove" className="inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-[10px] font-semibold leading-4 text-purple-800 hover:bg-purple-200 disabled:opacity-50">Class</button>
                          )}
                        </div>
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
