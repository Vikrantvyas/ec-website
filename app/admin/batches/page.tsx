"use client";

import { useEffect, useState } from "react";
import BatchCard from "@/app/components/admin/batches/BatchCard";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { supabase } from "@/lib/supabaseClient";

export default function BatchesPage() {

  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);

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
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (data) {
      setBatches(data);
    }

  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold">
        Batches
      </h1>

      <div className="mt-4">

        <BranchSelector
          branches={branches.map((b)=>b.name)}
          value={branches.find((b)=>b.id===branchId)?.name || ""}
          onChange={(name)=>{

            const branch = branches.find((b)=>b.name===name);

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

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {batches.map((batch) => (

            <BatchCard
              key={batch.id}
              name={batch.batch_name}
              department={batch.department}
              courses={[batch.course]}
              students={0}
            />

          ))}

        </div>

      )}

    </div>

  );

}