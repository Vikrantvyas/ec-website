"use client";

import { useState, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { Input, SelectField } from "@/app/components/ui/FormFields";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function ReceiptPage(){

const router = useRouter();
const searchParams = useSearchParams();
const studentIdParam = searchParams.get("student");
const branchParam = searchParams.get("branch");

const today = new Date().toISOString().split("T")[0];

function formatDate(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

const accountOptions = [
  { label: "Registration", value: "Registration" },
  { label: "1st Installment", value: "1st Installment" },
  { label: "2nd Installment", value: "2nd Installment" },
  { label: "Full Fee", value: "Full Fee" },
  { label: "Monthly", value: "Monthly" }
];

const paymentModes = [
  { label: "Cash", value: "Cash" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "Card" },
  { label: "Bank Transfer", value: "Bank Transfer" }
];

/* STATES */

const [branch,setBranch] = useState("");
const [branches,setBranches] = useState<any[]>([]);
const [branchName,setBranchName] = useState("");

const [students,setStudents] = useState<any[]>([]);
const [selectedStudent,setSelectedStudent] = useState("");
const [searchText,setSearchText] = useState("");

const [batches,setBatches] = useState<any[]>([]);
const [batch,setBatch] = useState("");

const [studentInfo,setStudentInfo] = useState<any>(null);

const [date,setDate] = useState(today);
const [amount,setAmount] = useState("");
const [receiptNo,setReceiptNo] = useState("");
const [account,setAccount] = useState("");
const [mode,setMode] = useState("Cash");

const [totalFee,setTotalFee] = useState("");
const [discount,setDiscount] = useState("");
const [due,setDue] = useState("");
const [days,setDays] = useState("");
const [dueDate,setDueDate] = useState("");

const [receipts,setReceipts] = useState<any[]>([]);

const [showConfirm,setShowConfirm] = useState(false);
const [saving,setSaving] = useState(false);

/* CALCULATIONS */

const totalFeeVal = Number(receipts[0]?.total_fee || 0);
const discountVal = Number(receipts[0]?.discount || 0);
const totalPaid = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
const finalDue = totalFeeVal - discountVal - totalPaid;

/* LOAD INITIAL */

useEffect(()=>{ fetchBranches(); },[]);

useEffect(()=>{
if(!branchParam || !branches.length) return;
const b = branches.find(
(x:any)=> (x.name || "").trim().toLowerCase() === (branchParam || "").trim().toLowerCase()
);
if(b && branchName !== b.name){
setBranchName(b.name.trim());
setBranch(b.id);
}
},[branchParam,branches]);

useEffect(()=>{
if(branch){
fetchStudents();
fetchBatches();
}
},[branch]);

useEffect(()=>{
if(studentIdParam && students.length){
const s = students.find((x:any)=>x.id === studentIdParam);
if(s){
handleStudentChange(s.student_name);
}
}
},[studentIdParam,students]);

useEffect(()=>{
const fee = Number(totalFee)||0;
const disc = Number(discount)||0;
const amt = Number(amount)||0;
const d = fee - disc - amt;
setDue(d>0 ? String(d) : "0");
},[totalFee,discount,amount]);

useEffect(()=>{
if(!due || Number(due)===0){
setDays("");
setDueDate("");
return;
}
if(days){
const base = new Date(date);
base.setDate(base.getDate()+Number(days));
setDueDate(base.toISOString().split("T")[0]);
}
},[days,due,date]);

/* FETCH */

const fetchBranches = async ()=>{
const { data } = await supabase.from("branches").select("id,name").order("name");
setBranches(data||[]);
};

const fetchStudents = async ()=>{

let allStudents:any[] = [];
let from = 0;
let to = 999;
let finished = false;

while(!finished){

const { data, error } = await supabase
.from("leads")
.select("id,student_name,department,course")
.eq("branch_id",branch)
.order("student_name")
.range(from,to);

if(error){ console.log(error); return; }

if(data){ allStudents = [...allStudents, ...data]; }

if(!data || data.length < 1000){ finished = true; }

from += 1000;
to += 1000;
}

setStudents(allStudents);
};

const fetchBatches = async ()=>{
const { data } = await supabase
.from("batches")
.select("batch_name,branch_id")
.eq("branch_id",branch);
setBatches(data||[]);
};

const loadReceipts = async (student:string)=>{
const { data } = await supabase
.from("receipts")
.select("*")
.eq("student_name",student)
.order("created_at",{ascending:true});
setReceipts(data||[]);
};

/* STUDENT CHANGE */

const handleStudentChange = (name:string)=>{
setSelectedStudent(name);
setSearchText("");
const s = students.find((x:any)=>x.student_name===name);
if(s){
setStudentInfo(s);
loadReceipts(name);
}
};

/* SAVE FLOW */

const handleSubmit = (e:any)=>{
e.preventDefault();

if(!selectedStudent || !amount || !account){
alert("Please fill required fields");
return;
}

setShowConfirm(true);
};

const handleFinalSave = async ()=>{

setSaving(true);

const payload = {
branch_id:branch,
student_name:selectedStudent,
batch,
department:studentInfo?.department,
course:studentInfo?.course,
date: date || null,
receipt_no:receiptNo,
account,
mode,
amount:Number(amount),
total_fee:Number(totalFee||0),
discount:Number(discount||0),
due:Number(due||0),
due_date: dueDate || null
};

const { data, error } = await supabase.from("receipts").insert([payload]);

setSaving(false);

if(error){
alert(error.message);
console.log(error);
return;
}

alert("Receipt Saved Successfully");

await loadReceipts(selectedStudent);

setAmount("");
setReceiptNo("");
setAccount("");
setTotalFee("");
setDiscount("");
setDue("");
setDays("");
setDueDate("");

setShowConfirm(false);

router.refresh();
};

/* UI */

return(

<PermissionGuard page="Receipt">

<div className="space-y-6 p-6">

<button onClick={()=>router.back()} className="text-sm text-blue-600">
⬅ Back
</button>

<div className="flex gap-2 overflow-x-auto pb-2">
  {branches.map((b:any)=>(
    <button
      key={b.id}
      onClick={()=>{
        setBranch(b.id);
        setBranchName(b.name);
      }}
      className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap shadow-sm transition
        ${
          branch === b.id
            ? "bg-blue-600 text-white"
            : "bg-white"
        }`}
    >
      {b.name}
    </button>
  ))}
</div>

<div className="flex gap-3">

<div className="flex-1">

<div className="relative">

<Input
label="Student Name"
value={searchText || selectedStudent}
onChange={(e:any)=>{
setSearchText(e.target.value);
setSelectedStudent("");
}}
/>

{searchText && (

<div className="absolute z-20 w-full bg-white border rounded-md max-h-60 overflow-y-auto">

{students
.filter((s:any)=>
s.student_name
.toLowerCase()
.includes(searchText.toLowerCase())
)
.map((s:any)=>(
<div
key={s.id}
className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
onClick={()=>handleStudentChange(s.student_name)}
>
{s.student_name}
</div>
))}

</div>

)}

</div>

</div>

<button
type="button"
onClick={()=>router.push("/admin/admission")}
className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md"
>
Add
</button>

</div>

{studentInfo && (

<div className="border rounded-lg p-4 space-y-4 bg-gray-50">

<div className={`text-sm font-semibold ${
finalDue > 0 ? "text-red-600" : "text-green-600"
}`}>
{studentInfo.student_name} - {studentInfo.department} - {studentInfo.course} - {batch}
</div>

<table className="w-full text-sm">

<thead className="bg-gray-100">
<tr>
<th className="text-left px-2 py-1">Date</th>
<th className="text-right px-2 py-1">Amount</th>
<th className="text-left px-2 py-1">R. No.</th>
<th className="text-left px-2 py-1">Account</th>
<th className="text-left px-2 py-1">Mode</th>
<th className="text-right px-2 py-1">Total Fee</th>
<th className="text-right px-2 py-1">Discount</th>
<th className="text-right px-2 py-1">Due</th>
<th className="text-left px-2 py-1">Due Date</th>
</tr>
</thead>

<tbody>

{receipts.map((r:any, index:number) => {
  return (
    <tr key={r.id} className="border-t text-sm">
      <td className="px-2 py-1">{formatDate(r.date)}</td>
      <td className="text-right px-2 py-1">{Number(r.amount || 0).toFixed(2)}</td>
      <td className="px-2 py-1">{r.receipt_no}</td>
      <td className="px-2 py-1">{r.account}</td>
      <td className="px-2 py-1">{r.mode}</td>
      <td className="text-right px-2 py-1">{Number(r.total_fee || 0).toFixed(2)}</td>
      <td className="text-right px-2 py-1">{Number(r.discount || 0).toFixed(2)}</td>
      <td className={`text-right px-2 py-1 ${
        index === receipts.length - 1 && Number(r.due) > 0
          ? "text-red-600 font-semibold"
          : "text-green-600 font-semibold"
      }`}>
        {Number(r.due || 0).toFixed(2)}
      </td>
      <td className="px-2 py-1">{formatDate(r.due_date)}</td>
    </tr>
  );
})}

</tbody>

</table>

</div>

)}

<form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-4">

<Input label="Date" type="date" value={date} onChange={(e:any)=>setDate(e.target.value)} />
<Input label="Amount" type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} />
<Input label="R. N." value={receiptNo} onChange={(e:any)=>setReceiptNo(e.target.value)} />
<SelectField label="Account" value={account} options={accountOptions} onChange={(v:string)=>setAccount(v)} />
<SelectField label="Mode" value={mode} options={paymentModes} onChange={(v:string)=>setMode(v)} />
<Input label="Total Fee" type="number" value={totalFee} onChange={(e:any)=>setTotalFee(e.target.value)} />
<Input label="Discount" type="number" value={discount} onChange={(e:any)=>setDiscount(e.target.value)} />
<Input label="Due" value={due} readOnly />
<Input label="Days" type="number" value={days} onChange={(e:any)=>setDays(e.target.value)} />
<Input label="Due Date" type="date" value={dueDate} readOnly />

<div className="md:col-span-5 flex justify-end">
<button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">
Save Receipt
</button>
</div>

</form>

{showConfirm && (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white p-5 rounded-lg w-[90%] max-w-md">

<h3 className="font-semibold mb-3">Confirm Receipt</h3>

<div className="text-sm space-y-1">
<div><b>Name:</b> {selectedStudent}</div>
<div><b>Amount:</b> ₹{amount}</div>
<div><b>Account:</b> {account}</div>
<div><b>Mode:</b> {mode}</div>
<div><b>Due:</b> {due}</div>
</div>

<div className="flex justify-end gap-2 mt-4">
<button onClick={()=>setShowConfirm(false)} className="px-3 py-1 bg-gray-300 rounded">
Cancel
</button>

<button onClick={handleFinalSave} className="px-4 py-1 bg-blue-600 text-white rounded">
{saving ? "Saving..." : "OK"}
</button>
</div>

</div>
</div>
)}

</div>

</PermissionGuard>

);

}