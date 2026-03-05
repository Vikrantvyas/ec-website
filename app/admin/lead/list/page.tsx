"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadTable from "@/app/components/admin/lead/LeadTable";

export default function LeadListPage() {

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchLeads = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("role_id")
        .eq("email", user.email)
        .single();

      if (!userData) return;

      const { data: roleData } = await supabase
        .from("roles")
        .select("name, branch_access")
        .eq("id", userData.role_id)
        .single();

      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      // Admin → all leads
      if (roleData?.name !== "Admin") {

        const branches = roleData?.branch_access || [];

        if (branches.length > 0) {
          query = query.in("branch", branches);
        } else {
          query = query.limit(0);
        }

      }

      const { data } = await query;

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