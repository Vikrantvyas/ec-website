"use client";

import { useEffect, useState, useMemo } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";
import BranchSelector from "@/app/components/ui/BranchSelector";
import Link from "next/link";

type AttendanceItem = {
  date: string;
  status: string;
};

type Student = {
  id: string;
  lead_id: string;
  name: string;
  mobile: string;
  course: string;
  batch: string;
  branch: string;
  total_fee: number;
  paid: number;
  due: number;
  due_date: string;
  attendance: AttendanceItem[];
};

type SortKey = "batch" | "name" | "course" | "total_fee" | "paid" | "due" | "due_date";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

export default function StudentsPage() {

  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("batch");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {

    const { data: batchStudents } = await supabase
      .from("batch_students")
      .select("lead_id, batch_id");

    if (!batchStudents) return;

    const leadIds = batchStudents.map((b: any) => b.lead_id);

    const { data: leads } = await supabase
      .from("leads")
      .select("id, student_name, mobile_number, course")
      .in("id", leadIds);

    const { data: batches } = await supabase
      .from("batches")
      .select("id, batch_name, branch_id");

    const { data: branchesData } = await supabase
      .from("branches")
      .select("id, name");

    const { data: receipts } = await supabase
      .from("receipts")
      .select("*");

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("lead_id, batch_id, status, attendance_date")
      .in("lead_id", leadIds)
      .order("attendance_date", { ascending: false });

    if (!leads || !batches || !branchesData) return;

    const branchMap: Record<string, string> = {};
    branchesData.forEach((b: any) => {
      branchMap[b.id] = b.name;
    });

    setBranches(branchesData.map((b: any) => b.name));

    const batchMap: Record<string, { name: string; branch: string }> = {};
    batches.forEach((b: any) => {
      batchMap[b.id] = {
        name: b.batch_name,
        branch: branchMap[b.branch_id] || ""
      };
    });

    const paidMap: Record<string, number> = {};
    const totalMap: Record<string, number> = {};
    const discountMap: Record<string, number> = {};
    const dueDateMap: Record<string, string> = {};

    (receipts || []).forEach((r: any) => {
      const key = (r.student_name || "").toLowerCase().trim();

      paidMap[key] = (paidMap[key] || 0) + (r.amount || 0);

      if (!totalMap[key] || r.total_fee > totalMap[key]) {
        totalMap[key] = r.total_fee || 0;
      }

      if (!discountMap[key] || r.discount > discountMap[key]) {
        discountMap[key] = r.discount || 0;
      }

      if (!dueDateMap[key] && r.due_date) {
        dueDateMap[key] = r.due_date;
      }
    });

    const uniqueMap = new Map<string, Student>();

    batchStudents.forEach((b: any) => {

      const lead = leads.find((l: any) => l.id === b.lead_id);
      if (!lead) return;

      const batchInfo = batchMap[b.batch_id] || { name: "", branch: "" };

      const key = `${lead.id}_${b.batch_id}`;
      if (uniqueMap.has(key)) return;

      const nameKey = (lead.student_name || "").toLowerCase().trim();

      const total = totalMap[nameKey] || 0;
      const discount = discountMap[nameKey] || 0;
      const finalTotal = total - discount;

      const paid = paidMap[nameKey] || 0;
      const due = Math.max(finalTotal - paid, 0);
      const dueDate = dueDateMap[nameKey] || "";

      const att = (attendanceData || [])
        .filter(a => a.lead_id === lead.id && a.batch_id === b.batch_id)
        .slice(0, 10)
        .map(a => ({
          date: a.attendance_date,
          status: a.status || "N"
        }));

      while (att.length < 10) {
        att.push({ date: "", status: "N" });
      }

      uniqueMap.set(key, {
        id: key,
        lead_id: lead.id,
        name: lead.student_name || "",
        mobile: lead.mobile_number || "",
        course: lead.course || "",
        batch: batchInfo.name,
        branch: batchInfo.branch,
        total_fee: finalTotal,
        paid: paid,
        due: due,
        due_date: dueDate,
        attendance: att,
      });

    });

    setStudents(Array.from(uniqueMap.values()));
  }

  const formatAmount = (num: number) => num.toFixed(2);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function getBadge(s: Student) {
    if (s.total_fee === 0) return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">New</span>;
    if (s.due === 0) return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Paid</span>;
    return <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">Due</span>;
  }

  const filteredStudents = useMemo(() => {
    let data = students;

    if (selectedBranch) data = data.filter(s => s.branch === selectedBranch);

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(st =>
        st.name.toLowerCase().includes(s) ||
        st.course.toLowerCase().includes(s) ||
        st.batch.toLowerCase().includes(s)
      );
    }

    data = [...data].sort((a, b) => {
      let A: any = a[sortKey];
      let B: any = b[sortKey];

      if (typeof A === "string") A = A.toLowerCase();
      if (typeof B === "string") B = B.toLowerCase();

      if (A < B) return sortAsc ? -1 : 1;
      if (A > B) return sortAsc ? 1 : -1;
      return 0;
    });

    return data;

  }, [students, selectedBranch, search, sortKey, sortAsc]);

  return (
    <PermissionGuard page="Students">
      <div className="p-3 space-y-2">

        <BranchSelector
          branches={branches}
          value={selectedBranch}
          onChange={setSelectedBranch}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-base font-semibold">
            Students ({filteredStudents.length})
          </h1>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-2 py-1 rounded text-sm w-60"
          />
        </div>

        <div className="overflow-auto bg-white rounded shadow h-[75vh]">

          <table className="min-w-full text-sm">

            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th onClick={() => handleSort("batch")} className="p-2 cursor-pointer">Batch</th>
                <th onClick={() => handleSort("name")} className="p-2 cursor-pointer">Name</th>
                <th onClick={() => handleSort("course")} className="p-2 cursor-pointer">Course</th>
                <th className="p-2">Att</th>
                <th onClick={() => handleSort("total_fee")} className="p-2 cursor-pointer text-right">Fee</th>
                <th onClick={() => handleSort("paid")} className="p-2 cursor-pointer text-right">Paid</th>
                <th onClick={() => handleSort("due")} className="p-2 cursor-pointer text-right">Due</th>
                <th onClick={() => handleSort("due_date")} className="p-2 cursor-pointer">Due Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2">{s.batch}</td>

                  <td className="p-2 flex gap-2 items-center">
                    <Link href={`/admin/lead/${s.lead_id}`} className="text-blue-600 underline">
                      {s.name}
                    </Link>
                    {getBadge(s)}
                  </td>

                  <td className="p-2">{s.course}</td>

                  <td className="p-2">
                    <div className="flex gap-1">
                      {s.attendance.map((a, i) => (
                        <span key={i} className={`text-xs px-1 rounded ${
                          a.status === "P" ? "bg-green-500 text-white" :
                          a.status === "A" ? "bg-red-500 text-white" :
                          "bg-gray-200"
                        }`}>
                          {a.status}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-2 text-right">{formatAmount(s.total_fee)}</td>
                  <td className="p-2 text-right">{formatAmount(s.paid)}</td>
                  <td className="p-2 text-right">{formatAmount(s.due)}</td>
                  <td className="p-2">{formatDate(s.due_date)}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </PermissionGuard>
  );
}