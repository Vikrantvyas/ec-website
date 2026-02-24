"use client";

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
    <div className="sticky top-0 z-40 bg-white p-3 shadow-sm space-y-2">

      <div className="flex gap-2 flex-wrap text-xs">
        <select
          className="border px-2 py-1 rounded"
          value={filter1}
          onChange={(e) => setFilter1(e.target.value)}
        >
          <option>All</option>
          <option>Nanda Nagar</option>
          <option>Bapat Square</option>
          <option>Aurobindo</option>
        </select>

        <select
          className="border px-2 py-1 rounded"
          value={filter2}
          onChange={(e) => {
            setFilter2(e.target.value);
            setFilter3("All");
          }}
        >
          <option>All</option>
          <option>Gender</option>
          <option>Status</option>
          <option>Sort</option>
        </select>

        <select
          className="border px-2 py-1 rounded"
          value={filter3}
          onChange={(e) => setFilter3(e.target.value)}
        >
          <option>All</option>

          {filter2 === "Gender" && (
            <>
              <option>Male</option>
              <option>Female</option>
            </>
          )}

          {filter2 === "Status" && (
            <>
              <option>Demo</option>
              <option>Admission</option>
              <option>Not Interested</option>
            </>
          )}

          {filter2 === "Sort" && (
            <>
              <option>Oldest</option>
              <option>Most Followups</option>
              <option>A - Z</option>
              <option>Z - A</option>
            </>
          )}
        </select>
      </div>

      <input
        type="text"
        placeholder="Search..."
        className="w-full border rounded px-2 py-1 text-xs"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}