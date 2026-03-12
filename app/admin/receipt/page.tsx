"use client";

import { useState, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { Input, SelectField } from "@/app/components/ui/FormFields";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ReceiptPage(){

const router = useRouter();

/* DEFAULT DATES */

const today = new Date().toISOString().split("T")[0];

const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth()+1);
const nextMonthDate = nextMonth.toISOString().split("T")[0];

/* STATES */

const [branch,setBranch] = useState("");
const [branches,setBranches] = useState<any[]>([]);
const [branchName,setBranchName] = useState("");

const [students,setStudents] = useState<any[]>([]);
const [selectedStudent,setSelectedStudent] = useState("");

const [batches,setBatches] = useState<any[]>([]);
const [batch,setBatch] = useState("");

const [date,setDate] = useState(today);
const [amount,setAmount] = useState("");
const [receiptNo,setReceiptNo] = useState("");
const [account,setAccount] = useState("");
const [mode,setMode] = useState("Cash");

const [departments,setDepartments] = useState<string[]>([]);
const [department,setDepartment] = useState<string[]>([]);

const [courses,setCourses] = useState<any[]>([]);
const [coursesList,setCoursesList] = useState<string[]>([]);
const [course,setCourse] = useState<string[]>([]);

const [totalFee,setTotalFee] = useState("");
const [discount,setDiscount] = useState("");
const [due,setDue] = useState("");
const [dueDate,setDueDate] = useState(nextMonthDate);

const [history,setHistory] = useState<any[]>([]);
const [receipts,setReceipts] = useState<any[]>([]);

/* LOAD INITIAL DATA */

useEffect(()=>{
fetchBranches();
fetchDepartments();
fetchCourses();
},[]);

/* LOAD BRANCH DEPENDENT DATA */

useEffect(()=>{
if(branchName){
fetchStudents();
fetchBatches();
}
},[branchName]);

const fetchBranches = async ()=>{

const { data } = await supabase
.from("branches")
.select("id,name")
.order("name");

setBranches(data || []);

};

const fetchStudents = async ()=>{

const { data } = await supabase
.from("leads")
.select("id,student_name,department,course,branch")
.eq("branch",branchName)
.order("student_name");

setStudents(data || []);

};

const fetchBatches = async ()=>{

const { data } = await supabase
.from("batches")
.select("batch_name,branch_id")
.eq("branch_id",branch)
.order("batch_name");

setBatches(data || []);

};

const fetchDepartments = async ()=>{

const { data } = await supabase
.from("departments")
.select("name")
.order("name");

setDepartments(data?.map((d:any)=>d.name) || []);

};

const fetchCourses = async ()=>{

const { data } = await supabase
.from("courses")
.select("*")
.order("name");

setCourses(data || []);

};

/* FILTER COURSES */

useEffect(()=>{

const filtered =
courses
.filter((c:any)=>department.includes(c.department))
.map((c:any)=>c.name);

setCoursesList(filtered);

},[department,courses]);

/* STUDENT CHANGE */

const handleStudentChange = (name:string)=>{

setSelectedStudent(name);

const student = students.find((s:any)=>s.student_name===name);

if(student){

if(student.department){
setDepartment([student.department]);
}

if(student.course){
setCourse([student.course]);
}

}

};

/* OPTIONS */

const accountOptions = [
{label:"Registration",value:"Registration"},
{label:"1st Installment",value:"1st Installment"},
{label:"2nd Installment",value:"2nd Installment"},
{label:"Full Fee",value:"Full Fee"},
{label:"Monthly",value:"Monthly"}
];

const paymentModes = [
{label:"Cash",value:"Cash"},
{label:"UPI",value:"UPI"},
{label:"Card",value:"Card"},
{label:"Bank Transfer",value:"Bank Transfer"}
];

/* SUBMIT */

const handleSubmit = (e:any)=>{

e.preventDefault();

const newReceipt = {

studentName:selectedStudent,
date,
amount,
receiptNo,
account,
mode,
batch,
department:department.join(", "),
course:course.join(", "),
totalFee,
discount,
due,
dueDate

};

const updated = [newReceipt,...receipts];

setReceipts(updated);

};

/* UI */

return(

<PermissionGuard page="Receipt">

<div className="space-y-6 p-6">

<p className="font-semibold text-blue-600">
Receipt Entry
</p>

{/* BRANCH */}

<BranchSelector
branches={branches.map((b:any)=>b.name)}
value={branchName}
onChange={(name)=>{

setBranchName(name);

const selected = branches.find((b:any)=>b.name===name);
if(selected) setBranch(selected.id);

}}
/>

{/* STUDENT */}

<div className="flex gap-3">

<div className="flex-1">

<BottomSheetSelect
label="Name of Student"
value={selectedStudent}
options={students.map((s:any)=>({
label:s.student_name,
value:s.student_name
}))}
onChange={(val:string)=>handleStudentChange(val)}
placeholder="Select student"
/>

</div>

<button
type="button"
onClick={()=>router.push("/admin/admission")}
className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>
Add New
</button>

</div>

<form
onSubmit={handleSubmit}
className="grid md:grid-cols-4 gap-4"
>

<Input label="Date" type="date" value={date} onChange={(e:any)=>setDate(e.target.value)} />

<Input label="Amount" type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} />

<Input label="Receipt No." value={receiptNo} onChange={(e:any)=>setReceiptNo(e.target.value)} />

<SelectField label="Account" value={account} options={accountOptions} onChange={(val:string)=>setAccount(val)} />

<SelectField label="Mode of Payment" value={mode} options={paymentModes} onChange={(val:string)=>setMode(val)} />

<SelectField
label="Batch"
value={batch}
options={batches.map((b:any)=>({label:b.batch_name,value:b.batch_name}))}
onChange={(val:string)=>setBatch(val)}
/>

<SelectField
label="Department"
value={department}
multiple
options={departments.map((d:any)=>({label:d,value:d}))}
onChange={(val:any)=>setDepartment(val)}
/>

<SelectField
label="Course"
value={course}
multiple
options={coursesList.map((c:any)=>({label:c,value:c}))}
onChange={(val:any)=>setCourse(val)}
/>

<Input label="Total Fee" type="number" value={totalFee} onChange={(e:any)=>setTotalFee(e.target.value)} />

<Input label="Discount" type="number" value={discount} onChange={(e:any)=>setDiscount(e.target.value)} />

<Input label="Due" type="number" value={due} onChange={(e:any)=>setDue(e.target.value)} />

<Input label="Due Date" type="date" value={dueDate} onChange={(e:any)=>setDueDate(e.target.value)} />

<div className="md:col-span-4 flex justify-end">
<button type="submit" className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
Save Receipt
</button>
</div>

</form>

</div>

</PermissionGuard>

);

}