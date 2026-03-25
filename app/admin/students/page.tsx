"use client";

import { useEffect, useState, useMemo } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";
import BranchSelector from "@/app/components/ui/BranchSelector";

type Student = {
  id: string;
  name: string;
  mobile: string;
  course: string;
  batch: string;
  branch: string;
  total_fee: number;
  paid: number;
  due: number;
};

export default function StudentsPage() {

  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

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
      .select("student_name, amount, total_fee, discount");

    if (!leads || !batches || !branchesData) return;

    // branch map
    const branchMap: Record<string, string> = {};
    branchesData.forEach((b: any) => {
      branchMap[b.id] = b.name;
    });

    setBranches(branchesData.map((b: any) => b.name));

    // batch map
    const batchMap: Record<string, { name: string; branch: string }> = {};
    batches.forEach((b: any) => {
      batchMap[b.id] = {
        name: b.batch_name,
        branch: branchMap[b.branch_id] || ""
      };
    });

    // fee maps
    const paidMap: Record<string, number> = {};
    const feeMap: Record<string, number> = {};

    (receipts || []).forEach((r: any) => {
      const name = r.student_name || "";

      paidMap[name] = (paidMap[name] || 0) + (r.amount || 0);

      if (!feeMap[name]) {
        feeMap[name] = (r.total_fee || 0) - (r.discount || 0);
      }
    });

    // final
    const result: Student[] = [];

    batchStudents.forEach((b: any, index: number) => {

      const lead = leads.find((l: any) => l.id === b.lead_id);
      if (!lead) return;

      const batchInfo = batchMap[b.batch_id] || { name: "", branch: "" };

      const total = feeMap[lead.student_name] || 0;
      const paid = paidMap[lead.student_name] || 0;

      result.push({
        id: lead.id + "_" + index,
        name: lead.student_name || "",
        mobile: lead.mobile_number || "",
        course: lead.course || "",
        batch: batchInfo.name,
        branch: batchInfo.branch,
        total_fee: total,
        paid: paid,
        due: Math.max(total - paid, 0),
      });

    });

    setStudents(result);
  }

  const formatAmount = (num: number) => num.toFixed(2);

  const filteredStudents = useMemo(() => {

    if (!selectedBranch) return students;

    return students.filter(s => s.branch === selectedBranch);

  }, [students, selectedBranch]);

  return (

    <PermissionGuard page="Students">

      <div className="p-6 space-y-4">

        {/* Branch */}
        <BranchSelector
          branches={branches}
          value={selectedBranch}
          onChange={setSelectedBranch}
        />

        {/* Heading */}
        <h1 className="text-xl font-semibold">
          Students ({filteredStudents.length})
        </h1>

        <div className="overflow-x-auto bg-white rounded shadow">

          <table className="min-w-full text-sm">

            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left">Batch</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-right">Fee</th>
                <th className="p-2 text-right">Paid</th>
                <th className="p-2 text-right">Due</th>
                <th className="p-2 text-left">Mobile</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-medium">{s.batch}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.course}</td>
                  <td className="p-2 text-right">{formatAmount(s.total_fee)}</td>
                  <td className="p-2 text-right">{formatAmount(s.paid)}</td>
                  <td className="p-2 text-right text-red-600 font-medium">
                    {formatAmount(s.due)}
                  </td>
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