"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BatchMaster(){

const [department,setDepartment] = useState("");
const [courses,setCourses] = useState<string[]>([]);
const [teacher,setTeacher] = useState("");

const [departments,setDepartments] = useState<any[]>([]);
const [coursesList,setCoursesList] = useState<any[]>([]);
const [filteredCourses,setFilteredCourses] = useState<any[]>([]);
const [teachers,setTeachers] = useState<any[]>([]);
const [leads,setLeads] = useState<any[]>([]);

const [startTime,setStartTime] = useState("");
const [endTime,setEndTime] = useState("");
const [classroom,setClassroom] = useState("");
const [capacity,setCapacity] = useState("");
const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");
const [status,setStatus] = useState("Active");

const [students,setStudents] = useState<string[]>([]);
const [batchList,setBatchList] = useState<any[]>([]);
const [editId,setEditId] = useState<string | null>(null);

useEffect(()=>{
fetchDepartments();
fetchCourses();
fetchTeachers();
fetchLeads();
fetchBatches();
},[]);

const fetchDepartments = async ()=>{
const { data } = await supabase.from("departments").select("*").order("name");
if(data) setDepartments(data);
};

const fetchCourses = async ()=>{
const { data } = await supabase.from("courses").select("*").order("name");
if(data) setCoursesList(data);
};

const fetchTeachers = async ()=>{
const { data } = await supabase.from("teachers").select("*").order("name");
if(data) setTeachers(data);
};

const fetchLeads = async ()=>{
const { data } = await supabase
.from("leads")
.select("id,student_name")
.order("student_name");
if(data) setLeads(data);
};

const fetchBatches = async ()=>{

const { data:batches } = await supabase
.from("batches")
.select("*")
.order("start_time");

const { data:teacherData } = await supabase
.from("teachers")
.select("id,name");

const { data:batchCourseLinks } = await supabase
.from("batch_courses")
.select("batch_id,course_id");

const { data:courseData } = await supabase
.from("courses")
.select("id,name");

const teacherMap:any = {};
teacherData?.forEach(t=>{
teacherMap[t.id] = t.name;
});

const courseMap:any = {};
courseData?.forEach(c=>{
courseMap[c.id] = c.name;
});

const batchCourses:any = {};

batchCourseLinks?.forEach(link=>{

if(!batchCourses[link.batch_id]){
batchCourses[link.batch_id] = [];
}

batchCourses[link.batch_id].push(
courseMap[link.course_id]
);

});

const finalData = batches?.map(b=>({
...b,
teacher_name: teacherMap[b.teacher_id] || "",
course_names: batchCourses[b.id] || []
}));

setBatchList(finalData || []);

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

const handleStudentSelect = (leadId:string)=>{

if(students.includes(leadId)){
setStudents(students.filter(s=>s!==leadId));
}else{
setStudents([...students,leadId]);
}

};

const resetForm = ()=>{
setDepartment("");
setCourses([]);
setTeacher("");
setStartTime("");
setEndTime("");
setClassroom("");
setCapacity("");
setStartDate("");
setEndDate("");
setStudents([]);
setStatus("Active");
setEditId(null);
};

const handleSubmit = async (e:any)=>{

e.preventDefault();

let batchId = editId;

if(!editId){

const { data,error } = await supabase
.from("batches")
.insert([{
department,
teacher_id:teacher,
start_time:startTime,
end_time:endTime,
classroom,
capacity,
start_date:startDate,
end_date:endDate,
status
}])
.select();

if(error){
alert(error.message);
return;
}

batchId = data[0].id;

}else{

await supabase
.from("batches")
.update({
department,
teacher_id:teacher,
start_time:startTime,
end_time:endTime,
classroom,
capacity,
start_date:startDate,
end_date:endDate,
status
})
.eq("id",editId);

await supabase.from("batch_courses").delete().eq("batch_id",editId);
await supabase.from("batch_students").delete().eq("batch_id",editId);

}

if(courses.length){

const courseRows = courses.map(courseId=>({
batch_id:batchId,
course_id:courseId
}));

await supabase.from("batch_courses").insert(courseRows);

}

if(students.length){

const studentRows = students.map(leadId=>({
batch_id:batchId,
lead_id:leadId
}));

await supabase.from("batch_students").insert(studentRows);

}

resetForm();
fetchBatches();

};

const deleteBatch = async (id:string)=>{

if(!confirm("Delete this batch?")) return;

await supabase.from("batches").delete().eq("id",id);

fetchBatches();

};

const editBatch = (b:any)=>{
setEditId(b.id);
setDepartment(b.department);
setTeacher(b.teacher_id);
setStartTime(b.start_time);
setEndTime(b.end_time);
setStatus(b.status);
};

return(

<div className="space-y-6">

<p className="font-semibold text-blue-600">
Batch Master
</p>

<form
onSubmit={handleSubmit}
className="grid md:grid-cols-4 gap-4"
>

<div>
<label className="text-sm text-gray-600">Department</label>

<select
value={department}
onChange={(e)=>handleDepartmentChange(e.target.value)}
className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
>

<option value="">Select Department</option>

{departments.map((d)=>(
<option key={d.id} value={d.name}>
{d.name}
</option>
))}

</select>
</div>

<div className="md:col-span-3">

<label className="text-sm text-gray-600">
Courses
</label>

<div className="border rounded-lg bg-gray-50 p-3 max-h-32 overflow-y-auto">

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

<div>

<label className="text-sm text-gray-600">
Faculty / Teacher
</label>

<select
value={teacher}
onChange={(e)=>setTeacher(e.target.value)}
className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
>

<option value="">Select Teacher</option>

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
<input type="text" value={classroom} onChange={(e)=>setClassroom(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
</div>

<div>
<label className="text-sm text-gray-600">Batch Capacity</label>
<input type="number" value={capacity} onChange={(e)=>setCapacity(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"/>
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

<div className="md:col-span-3">

<label className="text-sm text-gray-600">
Current Students
</label>

<div className="border rounded-lg bg-gray-50 p-3 max-h-32 overflow-y-auto">

{leads.map((lead)=>(
<label
key={lead.id}
className="flex items-center gap-2 text-sm"
>

<input
type="checkbox"
checked={students.includes(lead.id)}
onChange={()=>handleStudentSelect(lead.id)}
/>

{lead.student_name}

</label>
))}

</div>

</div>

<div className="md:col-span-4 flex justify-end">

<button
type="submit"
className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
>
{editId ? "Update Batch" : "Save Batch"}
</button>

</div>

</form>

<div className="bg-white rounded-xl shadow-sm overflow-hidden">

<table className="w-full text-sm">

<thead className="bg-gray-100">

<tr>
<th className="p-3 text-left">Department</th>
<th className="p-3 text-left">Courses</th>
<th className="p-3 text-left">Teacher</th>
<th className="p-3 text-left">Time</th>
<th className="p-3 text-left">Status</th>
<th className="p-3 text-left">Action</th>
</tr>

</thead>

<tbody>

{batchList.map((b)=>(
<tr key={b.id} className="border-t">

<td className="p-3">{b.department}</td>

<td className="p-3">
{b.course_names?.join(", ") || "-"}
</td>

<td className="p-3">{b.teacher_name}</td>

<td className="p-3">{b.start_time} - {b.end_time}</td>

<td className="p-3">{b.status}</td>

<td className="p-3 space-x-2">

<button
onClick={()=>editBatch(b)}
className="text-blue-600"
>
Edit
</button>

<button
onClick={()=>deleteBatch(b.id)}
className="text-red-600"
>
Delete
</button>

</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

);

}