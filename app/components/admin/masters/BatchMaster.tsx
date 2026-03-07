"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BranchMaster() {

  const [department,setDepartment] = useState("");
  const [courses,setCourses] = useState<string[]>([]);
  const [teacher,setTeacher] = useState("");

  const [departments,setDepartments] = useState<any[]>([]);
  const [coursesList,setCoursesList] = useState<any[]>([]);
  const [filteredCourses,setFilteredCourses] = useState<any[]>([]);
  const [teachers,setTeachers] = useState<any[]>([]);

  const [startTime,setStartTime] = useState("");
  const [endTime,setEndTime] = useState("");
  const [classroom,setClassroom] = useState("");
  const [capacity,setCapacity] = useState("");
  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");
  const [status,setStatus] = useState("Active");

  const [students,setStudents] = useState<string[]>([]);

  const dummyStudents = [
    "Rahul Sharma",
    "Aman Verma",
    "Priya Singh",
    "Neha Gupta",
    "Rohit Jain"
  ];

  const [batchList,setBatchList] = useState<any[]>([]);

  useEffect(()=>{
    fetchDepartments();
    fetchCourses();
    fetchTeachers();
  },[]);

  const fetchDepartments = async ()=>{

    const { data } = await supabase
      .from("departments")
      .select("*")
      .order("name",{ ascending:true });

    if(data) setDepartments(data);

  };

  const fetchCourses = async ()=>{

    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("name",{ ascending:true });

    if(data) setCoursesList(data);

  };

  const fetchTeachers = async ()=>{

    const { data } = await supabase
      .from("teachers")
      .select("*")
      .order("name",{ ascending:true });

    if(data) setTeachers(data);

  };

  const handleDepartmentChange = (deptName:string)=>{

    setDepartment(deptName);
    setCourses([]);

    const filtered = coursesList.filter(
      (c:any)=>c.department === deptName
    );

    setFilteredCourses(filtered);

  };

  const handleCourseSelect = (courseId:string)=>{

    if(courses.includes(courseId)){
      setCourses(courses.filter(c=>c!==courseId));
    }else{
      setCourses([...courses,courseId]);
    }

  };

  const handleStudentSelect = (student:string)=>{

    if(students.includes(student)){
      setStudents(students.filter(s=>s!==student));
    }else{
      setStudents([...students,student]);
    }

  };

  const handleSubmit = (e:any)=>{

    e.preventDefault();

    const batchData = {
      department,
      courses,
      teacher,
      startTime,
      endTime,
      classroom,
      capacity,
      startDate,
      endDate,
      status,
      students
    };

    setBatchList([...batchList,batchData]);

  };

  return (

    <div className="space-y-6">

      <p className="font-semibold text-blue-600">
        Batch Master
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-4 gap-4"
      >

        {/* Department */}

        <div>

          <label className="text-sm text-gray-600">
            Department
          </label>

          <select
            value={department}
            onChange={(e)=>handleDepartmentChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          >

            <option value="">
              Select Department
            </option>

            {departments.map((d)=>(
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}

          </select>

        </div>

        {/* Courses */}

        <div className="md:col-span-3">

          <label className="text-sm text-gray-600">
            Courses
          </label>

          <div className="border rounded-lg bg-gray-50 p-3 max-h-32 overflow-y-auto">

            {filteredCourses.length === 0 && (
              <p className="text-gray-400 text-sm">
                Select Department
              </p>
            )}

            {filteredCourses.map((course)=>(
              <label
                key={course.id}
                className="flex items-center gap-2 text-sm"
              >

                <input
                  type="checkbox"
                  checked={courses.includes(course.id)}
                  onChange={()=>handleCourseSelect(course.id)}
                />

                {course.name}

              </label>
            ))}

          </div>

        </div>

        {/* Teacher */}

        <div>

          <label className="text-sm text-gray-600">
            Faculty / Teacher
          </label>

          <select
            value={teacher}
            onChange={(e)=>setTeacher(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
          >

            <option value="">
              Select Teacher
            </option>

            {teachers.map((t)=>(
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}

          </select>

        </div>

        <div>
          <label className="text-sm text-gray-600">Start Time</label>
          <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
        </div>

        <div>
          <label className="text-sm text-gray-600">End Time</label>
          <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
        </div>

        <div>
          <label className="text-sm text-gray-600">Classroom</label>
          <input type="text" placeholder="e.g. Lab 1" value={classroom} onChange={(e)=>setClassroom(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
        </div>

        <div>
          <label className="text-sm text-gray-600">Batch Capacity</label>
          <input type="number" placeholder="e.g. 25" value={capacity} onChange={(e)=>setCapacity(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
        </div>

        <div>
          <label className="text-sm text-gray-600">Start Date</label>
          <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
        </div>

        <div>
          <label className="text-sm text-gray-600">End Date</label>
          <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
        </div>

        <div>
          <label className="text-sm text-gray-600">Status</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Students */}

        <div className="md:col-span-3">

          <label className="text-sm text-gray-600">
            Current Students
          </label>

          <div className="border rounded-lg bg-gray-50 p-3 max-h-32 overflow-y-auto">

            {dummyStudents.map((student)=>(
              <label
                key={student}
                className="flex items-center gap-2 text-sm"
              >

                <input
                  type="checkbox"
                  checked={students.includes(student)}
                  onChange={()=>handleStudentSelect(student)}
                />

                {student}

              </label>
            ))}

          </div>

        </div>

        <div className="md:col-span-4 flex justify-end">

          <button
            type="submit"
            className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Batch
          </button>

        </div>

      </form>

      {/* Batch List */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Courses</th>
              <th className="p-3 text-left">Teacher</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Status</th>
            </tr>

          </thead>

          <tbody>

            {batchList.map((b,i)=>(
              <tr key={i} className="border-t">

                <td className="p-3">{b.department}</td>

                <td className="p-3">
                  {b.courses.length}
                </td>

                <td className="p-3">{b.teacher}</td>

                <td className="p-3">
                  {b.startTime} - {b.endTime}
                </td>

                <td className="p-3">{b.status}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}