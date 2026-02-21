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
    <div className="bg-white border-b border-gray-200">

      {/* Tabs Row */}
      <div className="flex gap-8 overflow-x-auto overflow-y-hidden px-4">

        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(index)}
            className={`relative py-3 text-sm font-medium whitespace-nowrap transition ${
              currentTab === index
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab}

            {/* Active Indicator Line */}
            {currentTab === index && (
              <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>
        ))}

      </div>

    </div>
  );
}