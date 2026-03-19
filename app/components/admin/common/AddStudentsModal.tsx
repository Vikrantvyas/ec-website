"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  batchId: string | null;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
};

export default function AddStudentsModal({
  batchId,
  onClose,
  onSuccess,
}: Props) {

  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any[]>([]);
  const [existing, setExisting] = useState<any[]>([]);
  const [existingIds, setExistingIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState("");
  const [batchCount, setBatchCount] = useState(0);

  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showQuickForm, setShowQuickForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    if (batchId) {
      loadBatchInfo();
      loadStudents();
      loadExistingStudents();
      setSelected([]);
      setRemoveIds([]);
      setSearch("");
    }
  }, [batchId]);

  async function loadBatchInfo() {
    const { data } = await supabase
      .from("batches")
      .select("batch_name")
      .eq("id", batchId)
      .single();

    if (data) setBatchName(data.batch_name);
  }

  async function loadStudents() {

    let all:any[] = [];
    let from = 0;
    let to = 999;

    while (true) {

      const { data } = await supabase
        .from("leads")
        .select("id, student_name")
        .order("student_name")
        .range(from, to);

      if (!data || data.length === 0) break;

      all = [...all, ...data];

      if (data.length < 1000) break;

      from += 1000;
      to += 1000;
    }

    setStudents(all);
  }

  async function loadExistingStudents() {

    if (!batchId) return;

    const { data } = await supabase
      .from("batch_students")
      .select("lead_id")
      .eq("batch_id", batchId);

    if (!data) return;

    const ids = data.map((d:any)=>d.lead_id);

    setBatchCount(ids.length);
    setExistingIds(ids);

    if (ids.length === 0) {
      setExisting([]);
      return;
    }

    const { data:leadData } = await supabase
      .from("leads")
      .select("id, student_name")
      .in("id", ids);

    if (leadData) setExisting(leadData);
  }

  function toggleStudent(student:any) {

    const exists = selected.find((s)=>s.id===student.id);

    if (exists) {
      setSelected(selected.filter((s)=>s.id!==student.id));
    } else {
      setSelected([...selected, student]);
    }
  }

  function removeStudent(id:string) {
    setSelected(selected.filter((s)=>s.id!==id));
  }

  function toggleRemove(id:string) {

    if (removeIds.includes(id)) {
      setRemoveIds(removeIds.filter(x=>x!==id));
    } else {
      setRemoveIds([...removeIds, id]);
    }
  }

  // ✅ FINAL FIXED APPLY
  async function applyChanges() {

    if (removeIds.length > 0) {
      await supabase
        .from("batch_students")
        .delete()
        .in("lead_id", removeIds)
        .eq("batch_id", batchId);
    }

    if (selected.length > 0) {
      const rows = selected.map((s)=>({
        batch_id: batchId,
        lead_id: s.id
      }));
      await supabase.from("batch_students").insert(rows);
    }

    // ✅ FIX → refresh FIRST
    if (onSuccess) await onSuccess();

    // ✅ update modal UI
    await loadExistingStudents();
    setSelected([]);
    setRemoveIds([]);
    setShowConfirm(false);

    // ✅ close LAST
    onClose();
  }

  async function createQuickLead() {

    if (!newStudent.name || !newStudent.mobile) {
      alert("Name & Mobile required");
      return;
    }

    const { data: batchData } = await supabase
      .from("batches")
      .select("branch_id, batch_name, start_time")
      .eq("id", batchId)
      .single();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert([{
        student_name: newStudent.name,
        mobile_number: newStudent.mobile,
        age: newStudent.age ? Number(newStudent.age) : null,
        gender: newStudent.gender,
        branch: batchData?.branch_id,
        preferred_batch: batchData?.batch_name,
        preferred_timing: batchData?.start_time,
        enquiry_date: new Date().toISOString().split("T")[0]
      }])
      .select()
      .single();

    if (error || !lead) {
      alert("Error creating lead");
      return;
    }

    await supabase.from("batch_students").insert([{
      batch_id: batchId,
      lead_id: lead.id
    }]);

    alert("Student Added");

    setShowQuickForm(false);
    setNewStudent({
      name: "",
      mobile: "",
      age: "",
      gender: "",
    });

    if (onSuccess) await onSuccess();
    await loadExistingStudents();
  }

  const filteredStudents = students
    .filter((s)=>!existingIds.includes(s.id))
    .filter((s)=>
      s.student_name.toLowerCase().includes(search.toLowerCase())
    );

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full h-full md:w-[600px] md:h-[90vh] rounded-none md:rounded-lg flex flex-col p-4">

        <div className="mb-3">

          <h2 className="text-lg font-semibold">
            {batchName} ({batchCount})
          </h2>

          <input
            type="text"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search Student"
            className="w-full border px-3 py-2 rounded mt-3"
          />

          <div
            onClick={() => setShowQuickForm(!showQuickForm)}
            className="text-blue-600 text-sm mt-2 cursor-pointer underline"
          >
            + Create New Student
          </div>

        </div>

        {showQuickForm && (
          <div className="border p-3 rounded mb-3 bg-gray-50 space-y-2">

            <input
              placeholder="Name"
              value={newStudent.name}
              onChange={(e)=>setNewStudent({...newStudent, name:e.target.value})}
              className="w-full border px-2 py-1 rounded text-sm"
            />

            <input
              placeholder="Mobile"
              value={newStudent.mobile}
              onChange={(e)=>setNewStudent({...newStudent, mobile:e.target.value})}
              className="w-full border px-2 py-1 rounded text-sm"
            />

            <div className="flex gap-2">
              <input
                placeholder="Age"
                value={newStudent.age}
                onChange={(e)=>setNewStudent({...newStudent, age:e.target.value})}
                className="w-1/2 border px-2 py-1 rounded text-sm"
              />

              <select
                value={newStudent.gender}
                onChange={(e)=>setNewStudent({...newStudent, gender:e.target.value})}
                className="w-1/2 border px-2 py-1 rounded text-sm"
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <button
              onClick={createQuickLead}
              className="w-full bg-green-600 text-white py-1.5 rounded text-sm"
            >
              Save & Add
            </button>

          </div>
        )}

        {existing.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existing.map((s)=>(
              <div
                key={s.id}
                onClick={()=>toggleRemove(s.id)}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded cursor-pointer ${
                  removeIds.includes(s.id)
                    ? "bg-red-200 line-through opacity-60"
                    : "bg-gray-200"
                }`}
              >
                {s.student_name} ✕
              </div>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selected.map((s)=>(
              <div
                key={s.id}
                className="flex items-center gap-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded"
              >
                {s.student_name}
                <button onClick={()=>removeStudent(s.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredStudents.map((s)=>{
            const checked = selected.find((x)=>x.id===s.id);
            return (
              <div
                key={s.id}
                onClick={()=>toggleStudent(s)}
                className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 ${checked?"bg-blue-50 border-blue-400":""}`}
              >
                <input type="checkbox" checked={!!checked} readOnly />
                <span className="text-sm">{s.student_name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-3 pt-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded">
            Cancel
          </button>
          <button
            onClick={()=>setShowConfirm(true)}
            className="px-4 py-2 text-sm bg-[#0a1f44] text-white rounded"
          >
            OK
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded w-[90%] max-w-md">

              <h3 className="font-semibold mb-2">Confirm Changes</h3>

              {selected.length > 0 && (
                <div className="mb-2">
                  <div className="text-green-600 text-sm">Add:</div>
                  {selected.map(s=>(
                    <div key={s.id} className="text-xs">{s.student_name}</div>
                  ))}
                </div>
              )}

              {removeIds.length > 0 && (
                <div>
                  <div className="text-red-600 text-sm">Remove:</div>
                  {existing.filter(e=>removeIds.includes(e.id)).map(s=>(
                    <div key={s.id} className="text-xs">{s.student_name}</div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-3">
                <button onClick={()=>setShowConfirm(false)} className="px-3 py-1 bg-gray-200 rounded">
                  Cancel
                </button>
                <button onClick={applyChanges} className="px-3 py-1 bg-blue-600 text-white rounded">
                  Confirm
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}