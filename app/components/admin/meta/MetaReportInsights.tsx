"use client";

type MetaLead = {
  campaign_name: string | null;
  ad_name: string | null;
  age: string | null;
  education: string | null;
  english_level: string | null;
  demo_class_time: string | null;
  knows_zoom: string | null;
};

type Insight = {
  title: string;
  value: string;
  count: number;
};

function getTopValue(
  leads: MetaLead[],
  key: keyof MetaLead
): { value: string; count: number } {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    const value = lead[key];

    if (typeof value !== "string" || !value.trim()) {
      return;
    }

    counts[value] = (counts[value] || 0) + 1;
  });

  const result = Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (!result) {
    return {
      value: "No data",
      count: 0,
    };
  }

  return {
    value: result[0],
    count: result[1],
  };
}

function InsightCard({
  insight,
}: {
  insight: Insight;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">
        {insight.title}
      </p>

      <p className="mt-2 line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-900">
        {insight.value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {insight.count} lead
        {insight.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default function MetaReportInsights({
  leads,
}: {
  leads: MetaLead[];
}) {
  const campaign = getTopValue(leads, "campaign_name");
  const ad = getTopValue(leads, "ad_name");
  const demo = getTopValue(leads, "demo_class_time");
  const english = getTopValue(leads, "english_level");
  const age = getTopValue(leads, "age");
  const education = getTopValue(leads, "education");
  const zoom = getTopValue(leads, "knows_zoom");

  const insights: Insight[] = [
    {
      title: "Top Campaign",
      value: campaign.value,
      count: campaign.count,
    },
    {
      title: "Top Ad",
      value: ad.value,
      count: ad.count,
    },
    {
      title: "Most Preferred Demo Time",
      value: demo.value,
      count: demo.count,
    },
    {
      title: "Most Common English Level",
      value: english.value,
      count: english.count,
    },
    {
      title: "Largest Age Group",
      value: age.value,
      count: age.count,
    },
    {
      title: "Most Common Education",
      value: education.value,
      count: education.count,
    },
    {
      title: "Most Common Zoom Response",
      value: zoom.value,
      count: zoom.count,
    },
  ];

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Quick Insights
        </h2>

        <p className="text-sm text-gray-500">
          Automatic insights from the currently filtered leads
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight) => (
          <InsightCard
            key={insight.title}
            insight={insight}
          />
        ))}
      </div>
    </div>
  );
}