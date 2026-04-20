"use client";

export default function LeftPanel({
  courses,
  days,
  topics,
  selectedCourse,
  selectedDay,
  selectedTopic,
  setSelectedCourse,
  setSelectedDay,
  setSelectedTopic
}: any) {

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
          const isExpanded = selectedDay === d.id;
          const hasTopics = dayTopics.length > 0;

          return (

            <div key={d.id}>

              {/* DAY BUTTON */}
              <button
                onClick={()=>setSelectedDay(isExpanded ? "" : d.id)}
                className={`w-full flex justify-between items-center px-2 py-2 rounded ${
                  isExpanded ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >

                <span>Day {d.day_number}</span>

                {/* + / - ICON */}
                {hasTopics && (
                  <span className="text-lg font-bold">
                    {isExpanded ? "−" : "+"}
                  </span>
                )}

              </button>

              {/* TOPICS */}
              {isExpanded && hasTopics && (

                <div className="ml-3 mt-1 space-y-1">

                  {dayTopics.map((t:any)=>{

                    const count = t.sentences?.[0]?.count || 0;

                    return (

                      <button
                        key={t.id}
                        onClick={()=>setSelectedTopic(t.id)}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                          selectedTopic === t.id
                            ? "bg-green-600 text-white"
                            : "bg-gray-100"
                        }`}
                      >

                        {t.topic_name}

                        {/* COUNT */}
                        {count > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({count})
                          </span>
                        )}

                      </button>

                    );

                  })}

                </div>

              )}

            </div>

          );

        })}

      </div>

    </div>
  );
}