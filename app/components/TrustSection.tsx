"use client";

import { useEffect, useState } from "react";
import {
  FaClock,
  FaUsers,
  FaBuilding,
  FaBriefcase,
} from "react-icons/fa";

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
    <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="flex justify-center mb-4">
        <span className="px-5 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          Our Impact
        </span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-700">
        Trusted by Learners in Indore
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl p-6 border shadow-sm text-center hover-lift">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
            <FaClock />
          </div>
          <p className="text-4xl font-bold">
            <CountUp end={15} />+
          </p>
          <p className="text-gray-600 mt-1">Years Experience</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm text-center hover-lift">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 text-2xl">
            <FaUsers />
          </div>
          <p className="text-4xl font-bold">
            <CountUp end={1000} />+
          </p>
          <p className="text-gray-600 mt-1">Students Trained</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm text-center hover-lift">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
            <FaBuilding />
          </div>
          <p className="text-4xl font-bold">
            <CountUp end={3} />
          </p>
          <p className="text-gray-600 mt-1">Branches in Indore</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm text-center hover-lift">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 text-2xl">
            <FaBriefcase />
          </div>
          <p className="text-3xl font-bold">
            <CountUp end={500} />+
          </p>
          <p className="text-gray-600 mt-1">Job Placements</p>
        </div>

      </div>
    </section>
  );
}
