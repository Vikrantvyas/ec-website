"use client";

import { useEffect, useState } from "react";

function CountUp({ end }: { end: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = Math.max(Math.floor(duration / end), 20);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [end]);

  return <>{count}</>;
}

export default function TrustSection() {
  return (
    <section className="py-16 px-4 bg-[#fafafa]">
      {/* Pill */}
      <div className="flex justify-center mb-4">
        <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          Our Impact
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Trusted by Learners in Indore
      </h2>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
            ⏱️
          </div>
          <p className="text-4xl font-bold">
            <CountUp end={15} />+
          </p>
          <p className="text-gray-600 mt-1">Years Experience</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 text-2xl">
            👥
          </div>
          <p className="text-4xl font-bold">
            <CountUp end={1000} />+
          </p>
          <p className="text-gray-600 mt-1">Students Trained</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 text-2xl">
            🏫
          </div>
          <p className="text-4xl font-bold">
            <CountUp end={3} />
          </p>
          <p className="text-gray-600 mt-1">Branches in Indore</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-2xl">
            🎤
          </div>
          <p className="text-2xl font-bold">Daily</p>
          <p className="text-gray-600 mt-1">Speaking Practice</p>
        </div>
      </div>
    </section>
  );
}
