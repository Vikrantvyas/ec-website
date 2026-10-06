"use client";

type MetaLead = {
  created_time: string | null;
  campaign_name: string | null;
  ad_name: string | null;
  age: string | null;
  education: string | null;
  english_level: string | null;
  demo_class_time: string | null;
  knows_zoom: string | null;
};

type MetaReportChartsProps = {
  leads: MetaLead[];
};

type CountItem = {
  label: string;
  count: number;
};

function normalizeValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCounts(
  leads: MetaLead[],
  key: keyof MetaLead
): CountItem[] {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    const value = lead[key];

    if (typeof value !== "string" || !value.trim()) {
      return;
    }

    const normalizedValue = normalizeValue(value);

    counts[normalizedValue] =
      (counts[normalizedValue] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function ChartCard({
  title,
  items,
}: {
  title: string;
  items: CountItem[];
}) {
  const max = Math.max(
    ...items.map((item) => item.count),
    1
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-800">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No data
        </p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 8).map((item) => {
            const width = Math.max(
              (item.count / max) * 100,
              4
            );

            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-xs text-gray-600">
                    {item.label}
                  </span>

                  <span className="shrink-0 text-xs font-semibold text-gray-800">
                    {item.count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DailyTrend({
  leads,
}: {
  leads: MetaLead[];
}) {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    if (!lead.created_time) return;

    const date = new Date(lead.created_time);

    const key = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    counts[key] = (counts[key] || 0) + 1;
  });

  const items = Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .reverse();

  const max = Math.max(
    ...items.map((item) => item.count),
    1
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Daily Leads Trend
        </h3>

        <span className="text-xs text-gray-400">
          {items.length} days
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          No data
        </p>
      ) : (
        <div className="flex h-56 items-end gap-2 overflow-x-auto pb-6">
          {items.map((item) => {
            const height = Math.max(
              (item.count / max) * 100,
              5
            );

            return (
              <div
                key={item.label}
                className="flex h-full min-w-[42px] flex-col items-center justify-end"
              >
                <span className="mb-1 text-[10px] font-semibold text-gray-700">
                  {item.count}
                </span>

                <div className="flex h-40 w-7 items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-600"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="mt-2 whitespace-nowrap text-[10px] text-gray-500">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MetaReportCharts({
  leads,
}: MetaReportChartsProps) {
  const campaigns = getCounts(
    leads,
    "campaign_name"
  );

  const ads = getCounts(
    leads,
    "ad_name"
  );

  const ages = getCounts(
    leads,
    "age"
  );

  const education = getCounts(
    leads,
    "education"
  );

  const englishLevels = getCounts(
    leads,
    "english_level"
  );

  const demoTimes = getCounts(
    leads,
    "demo_class_time"
  );

  const zoom = getCounts(
    leads,
    "knows_zoom"
  );

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Lead Analytics
        </h2>

        <p className="text-sm text-gray-500">
          Visual breakdown of the currently filtered leads
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DailyTrend leads={leads} />

        <ChartCard
          title="Campaign Performance"
          items={campaigns}
        />

        <ChartCard
          title="Ad Performance"
          items={ads}
        />

        <ChartCard
          title="English Level"
          items={englishLevels}
        />

        <ChartCard
          title="Age Group"
          items={ages}
        />

        <ChartCard
          title="Education"
          items={education}
        />

        <ChartCard
          title="Demo Time Preference"
          items={demoTimes}
        />

        <ChartCard
          title="Zoom Knowledge"
          items={zoom}
        />
      </div>
    </div>
  );
}