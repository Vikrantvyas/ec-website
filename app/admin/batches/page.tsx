"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BatchCard from "@/app/components/admin/batches/BatchCard";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { supabase } from "@/lib/supabaseClient";

export default function BatchesPage() {

  const router = useRouter();

  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);

  const [studentCounts, setStudentCounts] = useState<any>({});

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (branchId) {
      loadBatches();
    }
  }, [branchId]);

  async function loadBranches() {

    const { data } = await supabase
      .from("branches")
      .select("*");

    if (data) {
      setBranches(data);
      if (data.length > 0) {
        setBranchId(data[0].id);
      }
    }
  }

  async function loadBatches() {

    const { data } = await supabase
      .from("batches")
      .select(`
        *,
        teachers (
          name
        )
      `)
      .eq("branch_id", branchId)
      .order("start_time", { ascending: true });

    if (data) {
      setBatches(data);
      loadStudentCounts(data);
    }
  }

  async function loadStudentCounts(batchList:any[]) {

    const ids = batchList.map((b)=>b.id);

    const { data } = await supabase
      .from("batch_students")
      .select("batch_id");

    if (!data) return;

    const counts:any = {};

    ids.forEach((id)=>{
      counts[id] = data.filter((d)=>d.batch_id===id).length;
    });

    setStudentCounts(counts);
  }

  const englishBatches = batches.filter(b => b.department === "English");
  const computerBatches = batches.filter(b => b.department === "Computer");

  return (

    <div className="batches-page flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-white">
      {/* 🔒 TOP FIXED BAR */}
      <div className="shrink-0 bg-white p-4 shadow-sm space-y-3">

        <div className="flex items-center justify-between">

          <div className="flex gap-2 overflow-x-auto">
  {branches.map((b:any)=>(
    <button
      key={b.id}
      onClick={()=>setBranchId(b.id)}
      className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap shadow-sm transition
        ${
          branchId === b.id
            ? "bg-blue-600 text-white"
            : "bg-white"
        }`}
    >
      {b.name}
    </button>
  ))}
</div>

          <button
            onClick={() => router.push("/admin/masters?tab=batches")}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            + Create Batch
          </button>

        </div>

      </div>

      {/* ✅ SCROLL AREA (CARDS) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">

        {batches.length === 0 ? (

          <p className="text-gray-500">
            No batches found
          </p>

        ) : (

          <>

            {englishBatches.length > 0 && (
              <div>

                <h2 className="text-lg font-semibold mb-3 text-blue-700">
                  English Batches
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">

                  {englishBatches.map((batch) => (

                    <BatchCard
                      key={batch.id}
                      id={batch.id}
                      name={batch.batch_name}
                      department={batch.department}
                      teacher={batch.teachers?.name}
                      courses={[batch.course]}
                      students={studentCounts[batch.id] || 0}
                    />

                  ))}

                </div>

              </div>
            )}

            {computerBatches.length > 0 && (
              <div>

                <h2 className="text-lg font-semibold mb-3 text-green-700">
                  Computer Batches
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">

                  {computerBatches.map((batch) => (

                    <BatchCard
                      key={batch.id}
                      id={batch.id}
                      name={batch.batch_name}
                      department={batch.department}
                      teacher={batch.teachers?.name}
                      courses={[batch.course]}
                      students={studentCounts[batch.id] || 0}
                    />

                  ))}

                </div>

              </div>
            )}

          </>

        )}

      </div>

    </div>

  );

}