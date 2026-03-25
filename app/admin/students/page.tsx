"use client";

import { useEffect, useState, useMemo } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";
import BranchSelector from "@/app/components/ui/BranchSelector";
import Link from "next/link";

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
};

type SortKey = "batch" | "name" | "course" | "total_fee" | "paid" | "due" | "due_date";

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
      .select("id, student_name, mobile_number, course, next_follow_date")
      .in("id", leadIds);

    const { data: batches } = await supabase
      .from("batches")
      .select("id, batch_name, branch_id");

    const { data: branchesData } = await supabase
      .from("branches")
      .select("id, name");

    const { data: receipts } = await supabase
      .from("receipts")
      .select("student_name, amount, total_fee, discount");

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
    const feeMap: Record<string, number> = {};

    (receipts || []).forEach((r: any) => {
      const name = r.student_name || "";

      paidMap[name] = (paidMap[name] || 0) + (r.amount || 0);

      if (!feeMap[name]) {
        feeMap[name] = (r.total_fee || 0) - (r.discount || 0);
      }
    });

    const result: Student[] = [];

    batchStudents.forEach((b: any, index: number) => {

      const lead = leads.find((l: any) => l.id === b.lead_id);
      if (!lead) return;

      const batchInfo = batchMap[b.batch_id] || { name: "", branch: "" };

      const total = feeMap[lead.student_name] || 0;
      const paid = paidMap[lead.student_name] || 0;

      result.push({
        id: lead.id + "_" + index,
        lead_id: lead.id,
        name: lead.student_name || "",
        mobile: lead.mobile_number || "",
        course: lead.course || "",
        batch: batchInfo.name,
        branch: batchInfo.branch,
        total_fee: total,
        paid: paid,
        due: Math.max(total - paid, 0),
        due_date: lead.next_follow_date || "",
      });

    });

    setStudents(result);
  }

  const formatAmount = (num: number) => num.toFixed(2);

  const filteredStudents = useMemo(() => {

    let data = students;

    if (selectedBranch) {
      data = data.filter(s => s.branch === selectedBranch);
    }

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(st =>
        st.name.toLowerCase().includes(s) ||
        st.mobile.includes(s) ||
        st.course.toLowerCase().includes(s) ||
        st.batch.toLowerCase().includes(s)
      );
    }

    data = [...data].sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return data;

  }, [students, selectedBranch, search, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (

    <PermissionGuard page="Students">

      <div className="p-3 space-y-2">

        <BranchSelector
          branches={branches}
          value={selectedBranch}
          onChange={setSelectedBranch}
        />

        <div className="flex items-center justify-between">
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
                <th onClick={() => handleSort("batch")} className="p-2 text-left cursor-pointer">Batch</th>
                <th onClick={() => handleSort("name")} className="p-2 text-left cursor-pointer">Name</th>
                <th onClick={() => handleSort("course")} className="p-2 text-left cursor-pointer">Course</th>
                <th onClick={() => handleSort("total_fee")} className="p-2 text-right cursor-pointer">Fee</th>
                <th onClick={() => handleSort("paid")} className="p-2 text-right cursor-pointer">Paid</th>
                <th onClick={() => handleSort("due")} className="p-2 text-right cursor-pointer">Due</th>
                <th onClick={() => handleSort("due_date")} className="p-2 text-left cursor-pointer">Due Date</th>
                <th className="p-2 text-left">Mobile</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-medium">{s.batch}</td>

                  <td className="p-2 text-blue-600 underline">
                    <Link href={`/admin/lead/${s.lead_id}`}>
                      {s.name}
                    </Link>
                  </td>

                  <td className="p-2">{s.course}</td>
                  <td className="p-2 text-right">{formatAmount(s.total_fee)}</td>
                  <td className="p-2 text-right">{formatAmount(s.paid)}</td>
                  <td className="p-2 text-right text-red-600 font-medium">
                    {formatAmount(s.due)}
                  </td>
                  <td className="p-2">{s.due_date}</td>
                  <td className="p-2">{s.mobile}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </PermissionGuard>

  );
}