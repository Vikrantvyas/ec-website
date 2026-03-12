"use client";

import { useEffect, useState } from "react";
import BatchCard from "@/app/components/admin/batches/BatchCard";
import { supabase } from "@/lib/supabaseClient";

export default function BatchesPage() {

  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    loadBatches();
  }, []);

  async function loadBatches() {

    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBatches(data);
    }
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold">Batches</h1>

      {batches.length === 0 ? (
        <p className="mt-6 text-gray-500">No batches found</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {batches.map((batch) => (
            <BatchCard
              key={batch.id}
              name={batch.batch_name}
              students={0}
            />
          ))}

        </div>
      )}

    </div>
  );
}