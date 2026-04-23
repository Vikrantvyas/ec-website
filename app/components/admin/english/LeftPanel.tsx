"use client";

export default function LeftPanel({
  courses,
  days,
  topics,
  selectedCourse,
  selectedDays,
  selectedTopics,
  setSelectedCourse,
  setSelectedDays,
  setSelectedTopics
}: any) {

  const toggleDay = (id:string) => {
    setSelectedDays((prev:string[]) =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const toggleTopic = (id:string) => {
    setSelectedTopics((prev:string[]) =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  return (

    <div className="w-60 bg-white border-r flex flex-col">

      {/* COURSE SELECT */}
      <div className="p-3 border-b">

        <select
          value={selectedCourse}
          onChange={(e)=>setSelectedCourse(e.target.value)}
          className="border px-2 py-2 rounded w-full"
        >
          <option value="">Select Course</option>

          {courses.map((c:any)=>(
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      {/* DAYS + TOPICS */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {days.map((d:any)=>{

          const dayTopics = topics.filter((t:any)=>t.day_id === d.id);
          const isSelected = selectedDays.includes(d.id);
          const hasTopics = dayTopics.length > 0;

          return (

            <div key={d.id} className="mb-2">

              {/* DAY CHECKBOX */}
              <label
  className={`w-full flex justify-between items-center px-3 py-2 rounded cursor-pointer border ${
    isSelected
      ? "bg-blue-600 text-white border-blue-700"
      : "bg-gray-200 border-gray-300"
  }`}
>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={()=>toggleDay(d.id)}
                  />
                  <div className="flex items-center gap-2">
  <span>Day {d.day_number}</span>

  {hasTopics && (
    <span className="font-bold text-lg">
      +
    </span>
  )}
</div>
                </div>

              </label>

              {/* TOPICS */}
              {isSelected && hasTopics && (

                <div className="ml-4 mt-1 space-y-1">

                  {dayTopics.map((t:any)=>{

                    const count = t.sentences?.[0]?.count || 0;
                    const isTopicSelected = selectedTopics.includes(t.id);

                    return (

                      <label
                        key={t.id}
                        className={`flex justify-between items-center px-2 py-1 rounded text-sm cursor-pointer ${
                          isTopicSelected
                            ? "bg-green-600 text-white"
                            : "bg-gray-100"
                        }`}
                      >

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isTopicSelected}
                            onChange={()=>toggleTopic(t.id)}
                          />
                          <span>{t.topic_name}</span>
                        </div>

                        {/* COUNT */}
                        {count > 0 && (
                          <span className="text-xs">
                            ({count})
                          </span>
                        )}

                      </label>

                    );

                  })}

                </div>

              )}
<div className="border-b my-2"></div>
            </div>

          );

        })}

      </div>

    </div>
  );
}