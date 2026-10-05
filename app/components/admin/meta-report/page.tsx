"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import MetaReportFilters from "@/app/components/admin/meta/MetaReportFilters";
import MetaReportCharts from "@/app/components/admin/meta/MetaReportCharts";
import MetaReportInsights from "@/app/components/admin/meta/MetaReportInsights";
import MetaReportTable from "@/app/components/admin/meta/MetaReportTable";

type MetaLead = {
  id: string;
  meta_lead_id: string | null;
  created_time: string | null;

  ad_id: string | null;
  ad_name: string | null;

  ad_set_id: string | null;
  ad_set_name: string | null;

  campaign_id: string | null;
  campaign_name: string | null;

  form_id: string | null;
  form_name: string | null;

  platform: string | null;
  is_organic: boolean | null;

  full_name: string | null;
  whatsapp_number: string | null;
  age: string | null;
  education: string | null;
  english_level: string | null;
  demo_class_time: string | null;
  knows_zoom: string | null;
};

type Option = {
  value: string;
  label: string;
};

const uniqueOptions = (
  leads: MetaLead[],
  key: keyof MetaLead
): Option[] => {
  const values = Array.from(
    new Set(
      leads
        .map((lead) => lead[key])
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim() !== ""
        )
    )
  );

  return values
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      value,
      label: value,
    }));
};

export default function MetaReportPage() {
  const [leads, setLeads] = useState<MetaLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [campaign, setCampaign] = useState("");
  const [adSet, setAdSet] = useState("");
  const [ad, setAd] = useState("");
  const [form, setForm] = useState("");
  const [platform, setPlatform] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [demoTime, setDemoTime] = useState("");
  const [zoom, setZoom] = useState("");
  const [search, setSearch] = useState("");

 useEffect(() => {
  loadLeads();

  const refreshInterval = setInterval(() => {
    loadLeads();
  }, 30000);

  return () => clearInterval(refreshInterval);
}, []);

  async function loadLeads() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("meta_leads")
      .select("*")
      .order("created_time", { ascending: false });

    if (error) {
      setError(error.message);
      setLeads([]);
      setLoading(false);
      return;
    }

    setLeads((data || []) as MetaLead[]);
    setLoading(false);
  }

  const campaigns = useMemo(
    () => uniqueOptions(leads, "campaign_name"),
    [leads]
  );

  /*
   * Campaign select hone par
   * sirf us Campaign ke Ad Sets dikhenge.
   */
  const adSets = useMemo(() => {
    const source = campaign
      ? leads.filter(
          (lead) => lead.campaign_name === campaign
        )
      : leads;

    return uniqueOptions(source, "ad_set_name");
  }, [leads, campaign]);

  /*
   * Ad Set select hone par
   * sirf us Ad Set ke Ads dikhenge.
   *
   * Agar Campaign bhi selected hai,
   * to Campaign + Ad Set dono match honge.
   */
  const ads = useMemo(() => {
    let source = leads;

    if (campaign) {
      source = source.filter(
        (lead) => lead.campaign_name === campaign
      );
    }

    if (adSet) {
      source = source.filter(
        (lead) => lead.ad_set_name === adSet
      );
    }

    return uniqueOptions(source, "ad_name");
  }, [leads, campaign, adSet]);

  const forms = useMemo(
    () => uniqueOptions(leads, "form_name"),
    [leads]
  );

  const platforms = useMemo(
    () => uniqueOptions(leads, "platform"),
    [leads]
  );

  const ages = useMemo(
    () => uniqueOptions(leads, "age"),
    [leads]
  );

  const educations = useMemo(
    () => uniqueOptions(leads, "education"),
    [leads]
  );

  const englishLevels = useMemo(
    () => uniqueOptions(leads, "english_level"),
    [leads]
  );

  const demoTimes = useMemo(
    () => uniqueOptions(leads, "demo_class_time"),
    [leads]
  );

  const zoomOptions = useMemo(
    () => uniqueOptions(leads, "knows_zoom"),
    [leads]
  );

  /*
   * Agar Campaign change hone par
   * current Ad Set available nahi hai,
   * to Ad Set aur Ad clear kar do.
   */
  useEffect(() => {
    if (
      adSet &&
      !adSets.some((option) => option.value === adSet)
    ) {
      setAdSet("");
      setAd("");
    }
  }, [adSet, adSets]);

  /*
   * Agar Ad Set change hone par
   * current Ad available nahi hai,
   * to Ad clear kar do.
   */
  useEffect(() => {
    if (
      ad &&
      !ads.some((option) => option.value === ad)
    ) {
      setAd("");
    }
  }, [ad, ads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const leadDate = lead.created_time
        ? new Date(lead.created_time)
        : null;

      if (dateFrom && leadDate) {
        const from = new Date(`${dateFrom}T00:00:00`);

        if (leadDate < from) {
          return false;
        }
      }

      if (dateTo && leadDate) {
        const to = new Date(`${dateTo}T23:59:59`);

        if (leadDate > to) {
          return false;
        }
      }

      if (campaign && lead.campaign_name !== campaign) {
        return false;
      }

      if (adSet && lead.ad_set_name !== adSet) {
        return false;
      }

      if (ad && lead.ad_name !== ad) {
        return false;
      }

      if (form && lead.form_name !== form) {
        return false;
      }

      if (platform && lead.platform !== platform) {
        return false;
      }

      if (age && lead.age !== age) {
        return false;
      }

      if (education && lead.education !== education) {
        return false;
      }

      if (englishLevel && lead.english_level !== englishLevel) {
        return false;
      }

      if (demoTime && lead.demo_class_time !== demoTime) {
        return false;
      }

      if (zoom && lead.knows_zoom !== zoom) {
        return false;
      }

      if (search.trim()) {
        const text = search.toLowerCase();

        const searchable = [
          lead.full_name,
          lead.whatsapp_number,
          lead.meta_lead_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(text)) {
          return false;
        }
      }

      return true;
    });
  }, [
    leads,
    dateFrom,
    dateTo,
    campaign,
    adSet,
    ad,
    form,
    platform,
    age,
    education,
    englishLevel,
    demoTime,
    zoom,
    search,
  ]);

  const todayCount = useMemo(() => {
    const today = new Date();

    return filteredLeads.filter((lead) => {
      if (!lead.created_time) {
        return false;
      }

      const date = new Date(lead.created_time);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [filteredLeads]);

  const weekCount = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);

    return filteredLeads.filter((lead) => {
      if (!lead.created_time) {
        return false;
      }

      return new Date(lead.created_time) >= start;
    }).length;
  }, [filteredLeads]);

  const monthCount = useMemo(() => {
    const now = new Date();

    return filteredLeads.filter((lead) => {
      if (!lead.created_time) {
        return false;
      }

      const date = new Date(lead.created_time);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  }, [filteredLeads]);

  function handleFilterChange(
    name: string,
    value: string
  ) {
    switch (name) {
      case "dateFrom":
        setDateFrom(value);
        break;

      case "dateTo":
        setDateTo(value);
        break;

      case "campaign":
        setCampaign(value);
        setAdSet("");
        setAd("");
        break;

      case "adSet":
        setAdSet(value);
        setAd("");
        break;

      case "ad":
        setAd(value);
        break;

      case "form":
        setForm(value);
        break;

      case "platform":
        setPlatform(value);
        break;

      case "age":
        setAge(value);
        break;

      case "education":
        setEducation(value);
        break;

      case "englishLevel":
        setEnglishLevel(value);
        break;

      case "demoTime":
        setDemoTime(value);
        break;

      case "zoom":
        setZoom(value);
        break;

      case "search":
        setSearch(value);
        break;
    }
  }

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setCampaign("");
    setAdSet("");
    setAd("");
    setForm("");
    setPlatform("");
    setAge("");
    setEducation("");
    setEnglishLevel("");
    setDemoTime("");
    setZoom("");
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Meta Leads Report
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Meta Lead Forms Analytics & Detailed Report
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <MetaReportFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          campaign={campaign}
          adSet={adSet}
          ad={ad}
          form={form}
          platform={platform}
          age={age}
          education={education}
          englishLevel={englishLevel}
          demoTime={demoTime}
          zoom={zoom}
          search={search}
          campaigns={campaigns}
          adSets={adSets}
          ads={ads}
          forms={forms}
          platforms={platforms}
          ages={ages}
          educations={educations}
          englishLevels={englishLevels}
          demoTimes={demoTimes}
          zoomOptions={zoomOptions}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            title="Total Leads"
            value={leads.length}
          />

          <KpiCard
            title="Today"
            value={todayCount}
          />

          <KpiCard
            title="This Week"
            value={weekCount}
          />

          <KpiCard
            title="This Month"
            value={monthCount}
          />

          <KpiCard
            title="Filtered Leads"
            value={filteredLeads.length}
          />
        </div>

        <MetaReportCharts leads={filteredLeads} />

        <MetaReportInsights leads={filteredLeads} />

        <MetaReportTable
          leads={filteredLeads}
          totalLeads={leads.length}
          loading={loading}
          onRefresh={loadLeads}
        />

      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}