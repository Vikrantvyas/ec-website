"use client";

import { useState, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { Input, SelectField } from "@/app/components/ui/FormFields";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";
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

const [students,setStudents] = useState<any[]>([]);
const [selectedStudent,setSelectedStudent] = useState("");

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

const [batch,setBatch] = useState("");

const [totalFee,setTotalFee] = useState("");
const [discount,setDiscount] = useState("");
const [due,setDue] = useState("");
const [dueDate,setDueDate] = useState(nextMonthDate);

const [history,setHistory] = useState<any[]>([]);
const [receipts,setReceipts] = useState<any[]>([]);

/* LOAD DATA */

useEffect(()=>{
fetchStudents();
fetchDepartments();
fetchCourses();
},[]);

const fetchStudents = async ()=>{

const { data } = await supabase
.from("leads")
.select("id,student_name")
.order("student_name");

setStudents(data || []);

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

const handleStudentChange = (id:string)=>{

setSelectedStudent(id);

const studentReceipts =
receipts.filter((r:any)=>r.studentId === id);

setHistory(studentReceipts);

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

studentId:selectedStudent,
studentName:
students.find((s:any)=>s.id===selectedStudent)?.student_name,

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

const studentReceipts =
updated.filter((r:any)=>r.studentId === selectedStudent);

setHistory(studentReceipts);

};

/* UI */

return(

<PermissionGuard page="Receipt">

<div className="space-y-6 p-6">

<p className="font-semibold text-blue-600">
Receipt Entry
</p>

{/* STUDENT SEARCH */}

<div className="flex gap-3">

<div className="flex-1">

<BottomSheetSelect
label="Name of Student"
value={selectedStudent}
options={students.map((s:any)=>({
label:s.student_name,
value:s.id
}))}
onChange={(val:string)=>handleStudentChange(val)}
placeholder="Type student name..."
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

{/* FORM */}

<form
onSubmit={handleSubmit}
className="grid md:grid-cols-4 gap-4"
>

<Input
label="Date"
type="date"
value={date}
onChange={(e:any)=>setDate(e.target.value)}
/>

<Input
label="Amount"
type="number"
value={amount}
onChange={(e:any)=>setAmount(e.target.value)}
/>

<Input
label="Receipt No."
value={receiptNo}
onChange={(e:any)=>setReceiptNo(e.target.value)}
/>

<SelectField
label="Account"
value={account}
options={accountOptions}
onChange={(val:string)=>setAccount(val)}
/>

<SelectField
label="Mode of Payment"
value={mode}
options={paymentModes}
onChange={(val:string)=>setMode(val)}
/>

<Input
label="Batch"
value={batch}
onChange={(e:any)=>setBatch(e.target.value)}
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

<Input
label="Total Fee"
type="number"
value={totalFee}
onChange={(e:any)=>setTotalFee(e.target.value)}
/>

<Input
label="Discount"
type="number"
value={discount}
onChange={(e:any)=>setDiscount(e.target.value)}
/>

<Input
label="Due"
type="number"
value={due}
onChange={(e:any)=>setDue(e.target.value)}
/>

<Input
label="Due Date"
type="date"
value={dueDate}
onChange={(e:any)=>setDueDate(e.target.value)}
/>

<div className="md:col-span-4 flex justify-end">

<button
type="submit"
className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
>
Save Receipt
</button>

</div>

</form>

{/* HISTORY */}

{selectedStudent && (

<div className="bg-white rounded-xl shadow-sm overflow-hidden">

<p className="p-4 font-semibold">
Previous Receipts
</p>

<table className="w-full text-sm">

<thead className="bg-gray-100">

<tr>
<th className="p-3 text-left">Date</th>
<th className="p-3 text-left">Receipt</th>
<th className="p-3 text-left">Account</th>
<th className="p-3 text-left">Mode</th>
<th className="p-3 text-left">Amount</th>
<th className="p-3 text-left">Due</th>
</tr>

</thead>

<tbody>

{history.map((r:any,i:number)=>(

<tr key={i} className="border-t">

<td className="p-3">{r.date}</td>
<td className="p-3">{r.receiptNo}</td>
<td className="p-3">{r.account}</td>
<td className="p-3">{r.mode}</td>
<td className="p-3">{r.amount}</td>
<td className="p-3">{r.due}</td>

</tr>

))}

</tbody>

</table>

</div>

)}

</div>

</PermissionGuard>

);

}