"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function BatchStudentsPage() {

  const params = useParams();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBatch();
  }, []);

  async function loadBatch() {

    const { data } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .single();

    if (data) {
      setBatch(data);
    }

  }

  async function searchStudents(value: string) {

    setSearch(value);

    if (value.length < 2) {
      setStudents([]);
      return;
    }

    const { data } = await supabase
      .from("leads")
      .select("id, student_name")
      .ilike("student_name", `%${value}%`)
      .limit(10);

    if (data) {
      setStudents(data);
    }

  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold">
        Batch Students
      </h1>

      {batch && (

        <div className="mt-2 text-gray-600">

          <div>
            {batch.batch_name}
          </div>

          <div className="text-sm">
            {batch.department}
          </div>

        </div>

      )}

      <div className="mt-6">

        <input
          type="text"
          value={search}
          onChange={(e)=>searchStudents(e.target.value)}
          placeholder="Search Student"
          className="border px-3 py-2 rounded w-full"
        />

      </div>

      <div className="mt-4 space-y-2">

        {students.map((s)=>(
          
          <div
            key={s.id}
            className="border rounded p-2 flex justify-between"
          >

            <span>
              {s.student_name}
            </span>

            <button
              className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              Add
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}