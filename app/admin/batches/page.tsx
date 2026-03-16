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

    <div className="p-6">

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-semibold">
          Batches
        </h1>

        <button
          onClick={() => router.push("/admin/masters?tab=batches")}
          className="bg-[#0a1f44] text-white px-4 py-2 rounded-md hover:bg-[#163d7a] transition"
        >
          Create Batch
        </button>

      </div>

      <div className="mt-4">

        <BranchSelector
          branches={branches.map((b) => b.name)}
          value={branches.find((b) => b.id === branchId)?.name || ""}
          onChange={(name) => {

            const branch = branches.find((b) => b.name === name);

            if (branch) {
              setBranchId(branch.id);
            }

          }}
        />

      </div>

      {batches.length === 0 ? (

        <p className="mt-6 text-gray-500">
          No batches found
        </p>

      ) : (

        <div className="mt-6 space-y-8">

          {englishBatches.length > 0 && (
            <div>

              <h2 className="text-lg font-semibold mb-3 text-blue-700">
                English Batches
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">

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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">

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

        </div>

      )}

    </div>

  );

}