"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  batchId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
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

  useEffect(() => {
    if (batchId) {
      loadBatchInfo();
      loadStudents();
      loadExistingStudents();
      setSelected([]);
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

  async function removeExisting(id:string) {

    await supabase
      .from("batch_students")
      .delete()
      .eq("batch_id", batchId)
      .eq("lead_id", id);

    setExisting(existing.filter((s)=>s.id!==id));
    setExistingIds(existingIds.filter((x)=>x!==id));
    setBatchCount(batchCount-1);
  }

  async function addStudents() {

    if (!batchId || selected.length === 0) return;

    const rows = selected.map((s)=>({
      batch_id: batchId,
      lead_id: s.id
    }));

    await supabase
      .from("batch_students")
      .insert(rows);

    if (onSuccess) onSuccess();
    onClose();
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

        </div>

        {existing.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existing.map((s)=>(
              <div
                key={s.id}
                className="flex items-center gap-2 bg-gray-200 text-xs px-2 py-1 rounded"
              >
                {s.student_name}
                <button onClick={()=>removeExisting(s.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selected.map((s)=>(
              <div
                key={s.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
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
                <input
                  type="checkbox"
                  checked={!!checked}
                  onChange={()=>toggleStudent(s)}
                />

                <span className="text-sm">
                  {s.student_name}
                </span>
              </div>
            );
          })}

        </div>

        <div className="flex justify-end gap-3 mt-3 pt-3 border-t">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={addStudents}
            className="px-4 py-2 text-sm bg-[#0a1f44] text-white rounded hover:bg-[#163d7a]"
          >
            Add Students
          </button>

        </div>

      </div>

    </div>
  );
}