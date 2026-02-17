interface Props {
  tabs: string[];
  currentTab: number;
  setCurrentTab: (index: number) => void;
}

export default function EnquiryTabs({
  tabs,
  currentTab,
  setCurrentTab,
}: Props) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b px-6">
      <div className="flex gap-6 overflow-x-auto">

        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(index)}
            className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              currentTab === index
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}

      </div>
    </div>
  );
}
