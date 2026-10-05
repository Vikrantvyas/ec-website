"use client";

type FilterOption = {
  value: string;
  label: string;
};

type MetaReportFiltersProps = {
  dateFrom: string;
  dateTo: string;
  campaign: string;
  adSet: string;
  ad: string;
  form: string;
  platform: string;
  age: string;
  education: string;
  englishLevel: string;
  demoTime: string;
  zoom: string;
  search: string;

  campaigns: FilterOption[];
  adSets: FilterOption[];
  ads: FilterOption[];
  forms: FilterOption[];
  platforms: FilterOption[];
  ages: FilterOption[];
  educations: FilterOption[];
  englishLevels: FilterOption[];
  demoTimes: FilterOption[];
  zoomOptions: FilterOption[];

  onChange: (name: string, value: string) => void;
  onReset: () => void;
};

export default function MetaReportFilters({
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

  campaigns,
  adSets,
  ads,
  forms,
  platforms,
  ages,
  educations,
  englishLevels,
  demoTimes,
  zoomOptions,

  onChange,
  onReset,
}: MetaReportFiltersProps) {
  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";

  const selectClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";

  const options = (items: FilterOption[]) => (
    <>
      <option value="">All</option>

      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Filters
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date From
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onChange("dateFrom", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date To
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(e) => onChange("dateTo", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Campaign
          </label>

          <select
            value={campaign}
            onChange={(e) => onChange("campaign", e.target.value)}
            className={selectClass}
          >
            {options(campaigns)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Ad Set
          </label>

          <select
            value={adSet}
            onChange={(e) => onChange("adSet", e.target.value)}
            className={selectClass}
          >
            {options(adSets)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Ad
          </label>

          <select
            value={ad}
            onChange={(e) => onChange("ad", e.target.value)}
            className={selectClass}
          >
            {options(ads)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Form
          </label>

          <select
            value={form}
            onChange={(e) => onChange("form", e.target.value)}
            className={selectClass}
          >
            {options(forms)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Platform
          </label>

          <select
            value={platform}
            onChange={(e) => onChange("platform", e.target.value)}
            className={selectClass}
          >
            {options(platforms)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Age
          </label>

          <select
            value={age}
            onChange={(e) => onChange("age", e.target.value)}
            className={selectClass}
          >
            {options(ages)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Education
          </label>

          <select
            value={education}
            onChange={(e) => onChange("education", e.target.value)}
            className={selectClass}
          >
            {options(educations)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            English Level
          </label>

          <select
            value={englishLevel}
            onChange={(e) => onChange("englishLevel", e.target.value)}
            className={selectClass}
          >
            {options(englishLevels)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Demo Time
          </label>

          <select
            value={demoTime}
            onChange={(e) => onChange("demoTime", e.target.value)}
            className={selectClass}
          >
            {options(demoTimes)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Zoom
          </label>

          <select
            value={zoom}
            onChange={(e) => onChange("zoom", e.target.value)}
            className={selectClass}
          >
            {options(zoomOptions)}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Search Name / WhatsApp / Meta Lead ID
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Search..."
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}