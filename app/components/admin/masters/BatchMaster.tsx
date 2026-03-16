"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { Input, SelectField } from "@/app/components/ui/FormFields";

export default function BatchMaster(){

const [branch,setBranch] = useState("");
const [branches,setBranches] = useState<any[]>([]);

const [batchName,setBatchName] = useState("");

const [department,setDepartment] = useState<string[]>([]);
const [courses,setCourses] = useState<string[]>([]);
const [teacher,setTeacher] = useState("");

const [departments,setDepartments] = useState<any[]>([]);
const [coursesList,setCoursesList] = useState<any[]>([]);
const [teachers,setTeachers] = useState<any[]>([]);

const [startTime,setStartTime] = useState("");
const [endTime,setEndTime] = useState("");
const [classroom,setClassroom] = useState("");
const [capacity,setCapacity] = useState("");
const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");
const [status,setStatus] = useState("Active");

const [batchList,setBatchList] = useState<any[]>([]);
const [editId,setEditId] = useState<string | null>(null);

const mapOptions = (arr:any[]) =>
arr.map((v:any)=>({label:v,value:v}));

/* TIME FORMAT */

const formatTime = (t:string)=>{

if(!t) return "";

const [h,m] = t.split(":");

let hour = parseInt(h);

const ampm = hour >= 12 ? "PM" : "AM";

hour = hour % 12;
hour = hour ? hour : 12;

return `${hour.toString().padStart(2,"0")}:${m} ${ampm}`;

};

useEffect(()=>{
fetchBranches();
fetchDepartments();
fetchCourses();
fetchTeachers();
},[]);

useEffect(()=>{
if(branch) fetchBatches();
},[branch]);

const fetchBranches = async ()=>{

const { data } = await supabase
.from("branches")
.select("id,name")
.order("name");

if(data) setBranches(data);

};

const fetchDepartments = async ()=>{

const { data } = await supabase
.from("departments")
.select("*")
.order("name");

if(data) setDepartments(data);

};

const fetchCourses = async ()=>{

const { data } = await supabase
.from("courses")
.select("*")
.order("name");

if(data) setCoursesList(data);

};

const fetchTeachers = async ()=>{

const { data } = await supabase
.from("teachers")
.select("id,name,branch_id")
.order("name");

if(data) setTeachers(data);

};

const fetchBatches = async ()=>{

const { data } = await supabase
.from("batches")
.select(`
*,
teachers(name),
branches(name)
`)
.eq("branch_id",branch)
.order("start_time");

setBatchList(data || []);

};

const filteredCourses = coursesList.filter(
(c:any)=>department.includes(c.department)
);

const filteredTeachers = teachers.filter(
(t:any)=>t.branch_id === branch
);

useEffect(()=>{

if(startTime && department.length > 0){

const generated =
`${startTime}_${department[0]}`;

setBatchName(generated);

}

},[startTime, department.join(",")]);

const resetForm = ()=>{

setBatchName("");
setDepartment([]);
setCourses([]);
setTeacher("");
setStartTime("");
setEndTime("");
setClassroom("");
setCapacity("");
setStartDate("");
setEndDate("");
setStatus("Active");
setEditId(null);

};

const handleSubmit = async (e:any)=>{

e.preventDefault();

const payload = {

branch_id:branch,
batch_name:batchName,
department:department.join(", "),
teacher_id:teacher,
start_time:startTime,
end_time:endTime,
classroom,
capacity,
start_date:startDate,
end_date:endDate,
status

};

let batchId = editId;

if(editId){

await supabase
.from("batches")
.update(payload)
.eq("id",editId);

}else{

const { data } = await supabase
.from("batches")
.insert([payload])
.select()
.single();

batchId = data?.id;

}

if(batchId){

await supabase
.from("batch_courses")
.delete()
.eq("batch_id",batchId);

if(courses.length){

const rows = courses.map((c)=>({

batch_id:batchId,
course_id:c

}));

await supabase
.from("batch_courses")
.insert(rows);

}

const { data: courseNames } = await supabase
.from("courses")
.select("name")
.in("id",courses);

const courseText = courseNames
?.map((c:any)=>c.name)
.join(", ");

await supabase
.from("batches")
.update({
course:courseText
})
.eq("id",batchId);

}

resetForm();
fetchBatches();

};

const deleteBatch = async (id:string)=>{

if(!confirm("Delete batch?")) return;

await supabase
.from("batch_courses")
.delete()
.eq("batch_id",id);

await supabase
.from("batches")
.delete()
.eq("id",id);

fetchBatches();

};

const editBatch = async (b:any)=>{

setEditId(b.id);

setBatchName(b.batch_name);

setDepartment(b.department ? b.department.split(", ") : []);

setTeacher(b.teacher_id || "");

setStartTime(b.start_time ? b.start_time.slice(0,5) : "");
setEndTime(b.end_time ? b.end_time.slice(0,5) : "");

setClassroom(b.classroom || "");
setCapacity(b.capacity || "");
setStartDate(b.start_date || "");
setEndDate(b.end_date || "");
setStatus(b.status || "Active");

const { data } = await supabase
.from("batch_courses")
.select("course_id")
.eq("batch_id",b.id);

if(data){
setCourses(data.map((c:any)=>c.course_id));
}

};

return(

<div className="space-y-6">

<p className="font-semibold text-blue-600">
Batch Master
</p>

<BranchSelector
branches={branches.map(b=>b.name)}
value={branches.find(b=>b.id===branch)?.name || ""}
onChange={(name)=>{

const selected = branches.find(b=>b.name===name);
if(selected) setBranch(selected.id);

}}
/>

<form
onSubmit={handleSubmit}
className="grid md:grid-cols-4 gap-4"
>

<Input
label="Batch Name"
value={batchName}
onChange={(e:any)=>setBatchName(e.target.value)}
/>

<SelectField
label="Department"
value={department}
multiple
options={mapOptions(departments.map(d=>d.name))}
onChange={(val:any)=>setDepartment(val)}
/>

<SelectField
label="Courses"
value={courses}
multiple
options={filteredCourses.map((c:any)=>({
label:c.name,
value:c.id
}))}
onChange={(val:any)=>setCourses(val)}
/>

<SelectField
label="Teacher"
value={teacher}
options={filteredTeachers.map(t=>({
label:t.name,
value:t.id
}))}
onChange={(val:any)=>setTeacher(val)}
/>

<Input
label="Start Time"
type="time"
value={startTime}
onChange={(e:any)=>setStartTime(e.target.value)}
/>

<Input
label="End Time"
type="time"
value={endTime}
onChange={(e:any)=>setEndTime(e.target.value)}
/>

<Input
label="Classroom"
value={classroom}
onChange={(e:any)=>setClassroom(e.target.value)}
/>

<Input
label="Capacity"
type="number"
value={capacity}
onChange={(e:any)=>setCapacity(e.target.value)}
/>

<Input
label="Start Date"
type="date"
value={startDate}
onChange={(e:any)=>setStartDate(e.target.value)}
/>

<Input
label="End Date"
type="date"
value={endDate}
onChange={(e:any)=>setEndDate(e.target.value)}
/>

<SelectField
label="Status"
value={status}
options={mapOptions(["Active","Inactive"])}
onChange={(val:string)=>setStatus(val)}
/>

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
<th className="p-3 text-left">Batch</th>
<th className="p-3 text-left">Department</th>
<th className="p-3 text-left">Teacher</th>
<th className="p-3 text-left">Time</th>
<th className="p-3 text-left">Status</th>
<th className="p-3 text-left">Action</th>
</tr>

</thead>

<tbody>

{batchList.map((b:any)=>(

<tr key={b.id} className="border-t">

<td className="p-3">{b.batch_name}</td>
<td className="p-3">{b.department}</td>
<td className="p-3">{b.teachers?.name}</td>

<td className="p-3">
{formatTime(b.start_time)} - {formatTime(b.end_time)}
</td>

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