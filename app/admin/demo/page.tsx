"use client";

import { useEffect, useState } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { getDepartments, getCourses, getBatches } from "@/lib/masterData";

export default function DemoPage() {

  const [isNewDemo, setIsNewDemo] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [branch, setBranch] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [demoDate, setDemoDate] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const data = await getDepartments();
    setDepartments(data);
  };

  const handleDepartmentChange = async (id: string) => {
    setDepartmentId(id);
    setCourseId("");
    setBatchId("");

    const data = await getCourses(id);
    setCourses(data);
  };

  const handleCourseChange = async (id: string) => {
    setCourseId(id);
    setBatchId("");

    const data = await getBatches(id);
    setBatches(data);
  };

  const handleCancel = () => {
    setIsNewDemo(false);
  };

  return (

    <PermissionGuard page="Demo">

      <div className="bg-white min-h-screen">

        <div className="p-4 max-w-md">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-semibold">Demo</h2>

            <button
              onClick={() => setIsNewDemo(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
            >
              + New Demo
            </button>

          </div>

          {!isNewDemo && (
            <div className="text-gray-400 text-center py-20">
              Click New Demo to schedule demo
            </div>
          )}

          {isNewDemo && (

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <select
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_name}
                  </option>
                ))}
              </select>

              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_name} ({b.batch_time})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Preferred Time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="date"
                value={demoDate}
                onChange={(e) => setDemoDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <textarea
                placeholder="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <div className="flex gap-3">

                <button
                  onClick={handleCancel}
                  className="w-full border py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                  Save Demo
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </PermissionGuard>

  );

}