"use client";

import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

type Props = {
  filter1: string;
  setFilter1: (val: string) => void;
  filter2: string;
  setFilter2: (val: string) => void;
  filter3: string;
  setFilter3: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
};

export default function FiltersBar({
  filter1,
  setFilter1,
  filter2,
  setFilter2,
  filter3,
  setFilter3,
  search,
  setSearch,
}: Props) {
  return (
    <div className="sticky top-0 z-40 bg-white p-3 shadow-sm space-y-3">

      {/* FILTERS ROW */}
      <div className="grid grid-cols-3 gap-2 text-xs">

        {/* BRANCH FILTER */}
        <BottomSheetSelect
          label="Branch"
          value={filter1}
          options={[
            { label: "All", value: "All" },
            { label: "Nanda Nagar", value: "Nanda Nagar" },
            { label: "Bapat Square", value: "Bapat Square" },
            { label: "Aurobindo", value: "Aurobindo" },
          ]}
          onChange={setFilter1}
        />

        {/* FILTER TYPE */}
        <BottomSheetSelect
          label="Filter By"
          value={filter2}
          options={[
            { label: "All", value: "All" },
            { label: "Gender", value: "Gender" },
            { label: "Status", value: "Status" },
            { label: "Sort", value: "Sort" },
          ]}
          onChange={(val) => {
            setFilter2(val);
            setFilter3("All");
          }}
        />

        {/* FILTER VALUE */}
        <BottomSheetSelect
          label="Select"
          value={filter3}
          options={[
            { label: "All", value: "All" },

            ...(filter2 === "Gender"
              ? [
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]
              : []),

            ...(filter2 === "Status"
              ? [
                  { label: "Cold", value: "Cold" },
                  { label: "Warm", value: "Warm" },
                  { label: "Hot", value: "Hot" },
                  { label: "Closed", value: "Closed" },
                ]
              : []),

            ...(filter2 === "Sort"
              ? [
                  { label: "Oldest", value: "Oldest" },
                  { label: "Most Followups", value: "Most Followups" },
                  { label: "A - Z", value: "A - Z" },
                  { label: "Z - A", value: "Z - A" },
                ]
              : []),
          ]}
          onChange={setFilter3}
        />
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search..."
        className="
          w-full
          border border-gray-300
          rounded-md
          px-3 py-2
          text-xs
          shadow-[0_1px_2px_rgba(0,0,0,0.05)]
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
          focus:border-blue-500
          transition
        "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}