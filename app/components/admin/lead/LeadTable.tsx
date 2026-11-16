
"use client";

import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
function getDepartmentGroup(value: any): string {
  let departments: string[] = [];

  if (Array.isArray(value)) {
    departments = value.map(String);
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      departments = Array.isArray(parsed)
        ? parsed.map(String)
        : [value];
    } catch {
      departments = [value];
    }
  }

  const normalized = departments.map((item) =>
    item.trim().toLowerCase()
  );

  const hasEnglish = normalized.includes("english");
  const hasComputer = normalized.includes("computer");

  if (hasEnglish && hasComputer) return "Both";
  if (hasEnglish) return "English";
  if (hasComputer) return "Computer";

  return "Blank";
}
export default function LeadTable({
  leads,
  receipts,
  setLeadCount
}: {
  leads: any[];
  receipts: any[];
  setLeadCount?: (n: number) => void;
}) {

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showColumns, setShowColumns] = useState(false);

  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const pageSize = 50;

  // WhatsApp Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const lastSelectedIndexRef = useRef<number | null>(null);

  const [columns, setColumns] = useState({
    branch: true,
    date: true,
    name: true,
    mobile: true,
    department: true,
    course: true,
    receipt: true,
    actions: true
  });

  const [filters, setFilters] = useState({
    department: "",
    course: "",
    branch: ""
  });

  const [branchList, setBranchList] = useState<any[]>([]);

  /* RESET PAGE */

  useEffect(() => {
    setPage(1);
  }, [search, filters, fromDate, toDate]);

  /* LOAD BRANCHES */

  useEffect(() => {

    const loadBranches = async () => {

      const { data } = await supabase
        .from("branches")
        .select("id,name")
        .eq("status", "Active");

      if (data) {
        setBranchList(data);
      }

    };

    loadBranches();

  }, []);

  /* RECEIPT MAP */

  const receiptMap: any = {};

  receipts?.forEach((r: any) => {

    const name = r.student_name?.trim().toLowerCase();

    if (!receiptMap[name]) {
      receiptMap[name] = 0;
    }

    receiptMap[name] += Number(r.amount || 0);

  });

  /* UNIQUE LEADS */

  const uniqueLeads = Array.from(
    new Map(leads.map((l) => [l.id, l])).values()
  );

  /* SEARCH */

  let filtered = uniqueLeads.filter((lead) => {

    const name = lead.student_name?.toLowerCase() || "";
    const mobile = lead.mobile_number || "";

    return (
      name.includes(search.toLowerCase()) ||
      mobile.includes(search)
    );

  });

  /* FILTERS */
  /* DATE RANGE FILTER */

  if (fromDate || toDate) {
    filtered = filtered.filter((lead) => {
      const enquiryDate = lead.enquiry_date || "";

      return (
        (!fromDate || enquiryDate >= fromDate) &&
        (!toDate || enquiryDate <= toDate)
      );
    });
  }
  if (filters.department) {
    filtered = filtered.filter(
      l => getDepartmentGroup(l.department) === filters.department
    );
  }

  if (filters.course) {
    filtered = filtered.filter(
      l => l.course === filters.course
    );
  }

  if (filters.branch) {
    filtered = filtered.filter(
      l => l.branch_id === filters.branch
    );
  }

  /* SORT */

  filtered = filtered.sort((a, b) => {

    let v1 = a[sortField];
    let v2 = b[sortField];

    if (sortField === "created_at") {
      v1 = new Date(v1).getTime();
      v2 = new Date(v2).getTime();
    }

    if (v1 < v2) return sortOrder === "asc" ? -1 : 1;
    if (v1 > v2) return sortOrder === "asc" ? 1 : -1;

    return 0;

  });

  /* UPDATE COUNT */

  useEffect(() => {
    setLeadCount?.(filtered.length);
  }, [search, filters, sortField, sortOrder, leads, fromDate, toDate]);

  /* PAGINATION */

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* SORT */

  const toggleSort = (field: string) => {

    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

  };

  const arrow = (field: string) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  /* WHATSAPP PHONE VALIDATION */

  const normalizeWhatsAppPhone = (value: string) => {

    let digits = String(value || "").replace(/\D/g, "");

    if (digits.length === 10) {
      digits = `91${digits}`;
    }

    if (digits.length !== 12 || !digits.startsWith("91")) {
      return "";
    }

    const mobile = digits.slice(2);

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return "";
    }

    return digits;

  };

  /* LEAD SELECTION */

  const handleLeadSelection = (
    leadId: string,
    index: number,
    event: ReactMouseEvent<HTMLInputElement>
  ) => {

    const lastIndex = lastSelectedIndexRef.current;

    if (event.shiftKey && lastIndex !== null) {

      const start = Math.min(lastIndex, index);
      const end = Math.max(lastIndex, index);

      const rangeIds = paginated
        .slice(start, end + 1)
        .map((lead) => lead.id);

      setSelectedIds((current) =>
        Array.from(new Set([...current, ...rangeIds]))
      );

      lastSelectedIndexRef.current = index;

      return;
    }

    setSelectedIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId]
    );

    lastSelectedIndexRef.current = index;

  };



  /* SELECT / DESELECT ALL FILTERED LEADS */

  const allFilteredLeadsSelected =
    filtered.length > 0 &&
    filtered.every((lead) => selectedIds.includes(lead.id));

  const handleSelectAll = (checked: boolean) => {
    const filteredIds = filtered.map((lead) => lead.id);

    if (checked) {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...filteredIds]))
      );
    } else {
      setSelectedIds((current) =>
        current.filter((id) => !filteredIds.includes(id))
      );

      lastSelectedIndexRef.current = null;
    }
  };


  /* SEND SELECTED LEADS TO WHATSAPP */

  const handleSendSelectedLeads = () => {

    if (selectedIds.length === 0) {
      alert("Pehle kam se kam ek Lead select karein.");
      return;
    }

    const selectedLeads = uniqueLeads
      .filter((lead) => selectedIds.includes(lead.id))
      .map((lead) => ({
        id: lead.id,
        name: lead.student_name || "Name not available",
        phone: String(lead.mobile_number || ""),
        source: "leads" as const
      }))


    if (selectedLeads.length === 0) {
      alert("Selected Leads mein valid WhatsApp number nahi mila.");
      return;
    }

    try {

      sessionStorage.setItem(
        "ec_lead_list_selected_leads",
        JSON.stringify(selectedLeads)
      );

      window.location.href =
        "/admin/whatsapp?source=leads&from=lead-list";

    } catch {

      alert("Selected Leads save nahi ho sake. Dobara try karein.");

    }

  };

  /* ACTIONS */

  const handleEdit = (lead: any) => {
    alert("Edit Lead: " + lead.student_name);
  };

  const handleDelete = (lead: any) => {
    if (confirm("Delete lead?")) {
      alert("Lead deleted: " + lead.student_name);
    }
  };

  return (

    <div className="w-full space-y-3">

      {/* HEADER */}

      <div className="flex flex-wrap justify-between items-center gap-3">

        <h1 className="text-lg font-semibold text-gray-800">
          Leads <span className="text-gray-400">({filtered.length})</span>
        </h1>

        <div className="flex flex-wrap gap-2 items-center relative">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From Date"
            className="px-2 py-1.5 border rounded-md text-sm"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="To Date"
            min={fromDate || undefined}
            className="px-2 py-1.5 border rounded-md text-sm"
          />

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="px-2 py-1.5 border rounded-md text-sm text-red-600"
            >
              Clear
            </button>
          )}
          <span className="text-xs text-gray-600">
            Selected: {selectedIds.length}
          </span>

          <button
            onClick={handleSendSelectedLeads}
            disabled={selectedIds.length === 0}
            className="px-3 py-1.5 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Msg ({selectedIds.length})
          </button>

          <input
            type="text"
            placeholder="Search name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setShowColumns(!showColumns)}
            className="px-3 py-1.5 border rounded-md text-sm bg-gray-50 hover:bg-gray-100"
          >
            Columns
          </button>

          {showColumns && (

            <div className="absolute right-0 top-9 bg-white border shadow-lg rounded-md p-3 z-20 text-sm">

              {Object.keys(columns).map((c) => {

                const key = c as keyof typeof columns;

                return (

                  <label key={c} className="flex gap-2 py-1">

                    <input
                      type="checkbox"
                      checked={columns[key]}
                      onChange={() => setColumns({
                        ...columns,
                        [key]: !columns[key]
                      })}
                    />

                    {c}

                  </label>

                );

              })}

            </div>

          )}

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-auto max-h-[72vh]">

        <table className="w-full text-sm">

          <thead className="sticky top-0 bg-white shadow-sm text-gray-500">

            <tr>

              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allFilteredLeadsSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all filtered leads"
                  className="h-4 w-4"
                />
              </th>

              {columns.branch && (

                <th className="px-4 py-3 text-left text-xs font-semibold">

                  <div className="flex flex-col gap-1">

                    <span>Branch</span>

                    <select
                      className="text-xs border rounded"
                      value={filters.branch}
                      onChange={(e) => setFilters({
                        ...filters,
                        branch: e.target.value
                      })}
                    >
                      <option value="">All</option>
                      {branchList.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>

                  </div>

                </th>

              )}

              {columns.date && (

                <th
                  onClick={() => toggleSort("created_at")}
                  className="px-4 py-3 text-left text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Enq_Date{arrow("created_at")}
                </th>

              )}

              {columns.name && (

                <th
                  onClick={() => toggleSort("student_name")}
                  className="px-4 py-3 text-left text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Name{arrow("student_name")}
                </th>

              )}

              {columns.mobile && (

                <th className="px-4 py-3 text-left text-xs font-semibold">
                  Mobile
                </th>

              )}

              {columns.department && (

                <th className="px-4 py-3 text-left text-xs font-semibold">

                  <div className="flex flex-col gap-1">

                    <span
                      onClick={() => toggleSort("department")}
                      className="cursor-pointer"
                    >
                      Department{arrow("department")}
                    </span>

                    <select
                      className="text-xs border rounded"
                      value={filters.department}
                      onChange={(e) => setFilters({
                        ...filters,
                        department: e.target.value
                      })}
                    >
                      <option value="">All</option>
                      <option value="English">English</option>
                      <option value="Computer">Computer</option>
                      <option value="Both">Both (English + Computer)</option>
                      <option value="Blank">Blank</option>
                    </select>

                  </div>

                </th>

              )}

              {columns.course && (

                <th className="px-4 py-3 text-left text-xs font-semibold w-[180px] min-w-[180px] max-w-[180px]">

                  <div className="flex flex-col gap-1">

                    <span
                      onClick={() => toggleSort("course")}
                      className="cursor-pointer"
                    >
                      Course{arrow("course")}
                    </span>

                    <select
                      className="text-xs border rounded"
                      value={filters.course}
                      onChange={(e) => setFilters({
                        ...filters,
                        course: e.target.value
                      })}
                    >
                      <option value="">All</option>
                      {[...new Set(uniqueLeads.map(l => l.course))].map((d: any) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>

                  </div>

                </th>

              )}

              {columns.receipt && (

                <th className="px-4 py-3 text-left text-xs font-semibold">
                  Receipt
                </th>

              )}

              {columns.actions && (

                <th className="px-4 py-3 text-left text-xs font-semibold">
                  Actions
                </th>

              )}

            </tr>

          </thead>

          <tbody>

            {paginated.map((lead, index) => {

              const name = lead.student_name?.trim().toLowerCase();
              const amount = receiptMap[name] || 0;

              return (

                <tr
                  key={lead.id}
                  className={`
                    group
                    ${selectedIds.includes(lead.id)
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-blue-100 odd:bg-white even:bg-gray-100"
                    }
                    transition
                  `}
                >

                  <td className="px-3 py-3.5">

                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead.id)}
                      onClick={(event) => {
                        handleLeadSelection(lead.id, index, event);
                      }}
                      onChange={() => undefined}
                      aria-label={`Select ${lead.student_name || "lead"}`}
                      className="h-4 w-4"
                    />

                  </td>

                  {columns.branch && (

                    <td className="px-4 py-3.5">
                      {
                        branchList.find((b: any) => b.id === lead.branch_id)?.name || "-"
                      }
                    </td>

                  )}

                  {columns.date && (

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {lead.enquiry_date}
                    </td>

                  )}

                  {columns.name && (

                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                      {lead.student_name}
                    </td>

                  )}

                  {columns.mobile && (

                    <td className="px-4 py-3.5">

                      <a
                        href={`tel:${lead.mobile_number}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lead.mobile_number}
                      </a>

                    </td>

                  )}

                  {columns.department && (

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getDepartmentGroup(lead.department) === "Both"
                        ? "Both (English + Computer)"
                        : getDepartmentGroup(lead.department) === "Blank"
                          ? ""
                          : getDepartmentGroup(lead.department)}
                    </td>

                  )}

                  {columns.course && (

                    <td className="px-4 py-3.5 w-[180px] min-w-[180px] max-w-[180px] whitespace-normal break-words">
                      {lead.course}
                    </td>

                  )}

                  {columns.receipt && (

                    <td className="px-4 py-3.5 text-green-600 font-semibold">
                      {Number(amount).toFixed(2)}
                    </td>

                  )}

                  {columns.actions && (

                    <td className="px-4 py-3.5">

                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">

                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleDelete(lead)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑
                        </button>

                      </div>

                    </td>

                  )}

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="flex gap-3 text-sm text-gray-600">

        {page > 1 && (
          <a
            className="cursor-pointer text-blue-600"
            onClick={() => setPage(page - 1)}
          >
            Prev
          </a>
        )}

        <span>
          Page {page} / {totalPages}
        </span>

        {page < totalPages && (
          <a
            className="cursor-pointer text-blue-600"
            onClick={() => setPage(page + 1)}
          >
            Next
          </a>
        )}

      </div>

    </div>

  );

}
