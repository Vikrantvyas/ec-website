"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePermissions } from "@/lib/permissionsContext";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadTable from "@/app/components/admin/lead/LeadTable";

export default function LeadListPage() {

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchLeads = async () => {

      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setLeads(data);
      }

      setLoading(false);

    };

    fetchLeads();

  }, []);

  if (loading) {
    return <div className="p-6">Loading Leads...</div>;
  }

  return (

    <PermissionGuard page="Lead">

      <div className="w-full px-6 py-6 bg-white">

        <h1 className="text-lg font-semibold mb-4">Leads</h1>

        <LeadTable leads={leads} />

      </div>

    </PermissionGuard>

  );

}