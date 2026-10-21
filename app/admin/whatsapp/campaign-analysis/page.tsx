
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  CheckSquare,
  Eye,
  RefreshCw,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";

type Campaign = {
  id: string;
  name: string;
  status: string;
  total_recipients: number | null;
  accepted_count: number | null;
  delivered_count: number | null;
  read_count: number | null;
  failed_count: number | null;
  estimated_cost: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    running: "bg-blue-100 text-blue-800",
    queued: "bg-amber-100 text-amber-800",
    paused: "bg-amber-100 text-amber-800",
    cancelled: "bg-gray-100 text-gray-700",
    draft: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status.toLowerCase()] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function CampaignHistoryContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const { data, error: queryError } = await supabase
        .from("whatsapp_campaigns")
        .select(
          "id,name,status,total_recipients,accepted_count,delivered_count,read_count,failed_count,estimated_cost,created_at,started_at,completed_at"
        )
        .order("created_at", { ascending: false })
        .limit(500);

      if (queryError) throw queryError;

      const rows = (data ?? []) as Campaign[];

      setCampaigns(rows);

      setSelectedIds((current) =>
        current.filter((id) => rows.some((row) => row.id === id))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Campaign history load nahi ho saki."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns = useMemo(() => {
    const term = search.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesSearch =
        !term ||
        (campaign.name ?? "").toLowerCase().includes(term) ||
        (campaign.status ?? "").toLowerCase().includes(term);

      const timestamp = new Date(campaign.created_at).getTime();

      const createdDate = Number.isNaN(timestamp)
        ? ""
        : new Date(timestamp).toISOString().slice(0, 10);

      return (
        matchesSearch &&
        (!dateFrom || createdDate >= dateFrom) &&
        (!dateTo || createdDate <= dateTo)
      );
    });
  }, [campaigns, search, dateFrom, dateTo]);

  const allVisibleSelected =
    filteredCampaigns.length > 0 &&
    filteredCampaigns.every((campaign) =>
      selectedIds.includes(campaign.id)
    );

  function toggleCampaign(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleVisibleCampaigns() {
    if (allVisibleSelected) {
      const visibleIds = new Set(
        filteredCampaigns.map((campaign) => campaign.id)
      );

      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.has(id))
      );
    } else {
      setSelectedIds((current) =>
        Array.from(
          new Set([
            ...current,
            ...filteredCampaigns.map((campaign) => campaign.id),
          ])
        )
      );
    }
  }

  async function deleteSelectedCampaigns() {
    if (!selectedIds.length || deleting) return;

    const confirmed = window.confirm(
      `${selectedIds.length} selected campaign(s) aur unke recipient records delete karne hain? Yeh action undo nahi ho sakta.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      const idsToDelete = [...selectedIds];

      const { data: recipientData, error: recipientFetchError } =
        await supabase
          .from("whatsapp_campaign_recipients")
          .select("id,message_id")
          .in("campaign_id", idsToDelete);

      if (recipientFetchError) throw recipientFetchError;

      const messageIds = Array.from(
        new Set(
          (recipientData ?? [])
            .map((row) => row.message_id as string | null)
            .filter((id): id is string => Boolean(id))
        )
      );

      for (let i = 0; i < messageIds.length; i += 100) {
        const batch = messageIds.slice(i, i + 100);

        const { error: logDeleteError } = await supabase
          .from("whatsapp_message_logs")
          .delete()
          .eq("direction", "outbound")
          .in("message_id", batch);

        if (logDeleteError) throw logDeleteError;
      }

      const { error: recipientDeleteError } = await supabase
        .from("whatsapp_campaign_recipients")
        .delete()
        .in("campaign_id", idsToDelete);

      if (recipientDeleteError) throw recipientDeleteError;

      const { error: campaignDeleteError } = await supabase
        .from("whatsapp_campaigns")
        .delete()
        .in("id", idsToDelete);

      if (campaignDeleteError) throw campaignDeleteError;

      setSelectedIds([]);

      setNotice(`${idsToDelete.length} campaign(s) delete ho gayi.`);

      await loadCampaigns();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Campaign delete nahi ho saki. Database permissions check karein."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-green-700" />

            <h1 className="text-2xl font-bold text-gray-900">
              WhatsApp Campaign Analysis
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Campaign history, delivery performance aur recipient analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadCampaigns()}
          disabled={loading || deleting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Campaigns loaded</p>
          <p className="mt-2 text-2xl font-bold">
            {campaigns.length.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Latest 500 campaigns
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Selected campaigns</p>
          <p className="mt-2 text-2xl font-bold">
            {selectedIds.length.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            For bulk deletion
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Visible campaigns</p>
          <p className="mt-2 text-2xl font-bold">
            {filteredCampaigns.length.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            After filters
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="space-y-4 border-b p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaign History
            </h2>

            <button
              type="button"
              onClick={() => void deleteSelectedCampaigns()}
              disabled={!selectedIds.length || deleting || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />

              {deleting
                ? "Deleting..."
                : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Campaign name search karein..."
                className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm"
              />
            </div>

            <label className="text-sm text-gray-600">
              From

              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm text-gray-600">
              To

              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleVisibleCampaigns}
                    title="Select or deselect visible campaigns"
                    aria-label="Select or deselect visible campaigns"
                  >
                    {allVisibleSelected ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>

                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Recipients</th>
                <th className="px-4 py-3">Accepted</th>
                <th className="px-4 py-3">Read</th>
                <th className="px-4 py-3">Failed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Campaigns load ho rahi hain...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Koi campaign nahi mili.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className={
                      selectedIds.includes(campaign.id)
                        ? "bg-red-50/50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(campaign.id)}
                        onChange={() => toggleCampaign(campaign.id)}
                        aria-label={`Select ${campaign.name}`}
                        className="h-4 w-4 rounded"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {campaign.name}
                      </p>

                      <p className="mt-1 max-w-[240px] truncate text-xs text-gray-400">
                        {campaign.id}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {formatDate(campaign.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      {Number(campaign.total_recipients ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      {Number(campaign.accepted_count ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      {Number(campaign.read_count ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      {Number(campaign.failed_count ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/whatsapp/campaign-analysis/${encodeURIComponent(campaign.id)}`}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Analyze
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 text-xs text-gray-500">
          Showing {filteredCampaigns.length} of {campaigns.length} loaded
          campaigns. Saved counters webhook updates na hone par actual delivery
          status se alag ho sakte hain.
        </div>
      </section>
    </div>
  );
}

export default function WhatsAppCampaignAnalysisPage() {
  return (
    <PermissionGuard page="WhatsApp Campaign Analysis">
      <CampaignHistoryContent />
    </PermissionGuard>
  );
}
