"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { Input, SelectField } from "@/app/components/ui/FormFields";

export default function FeeMaster(){

const [branch,setBranch] = useState("");
const [branches,setBranches] = useState<any[]>([]);

const [schemeName,setSchemeName] = useState("");
const [course,setCourse] = useState("");
const [courseDuration,setCourseDuration] = useState("");
const [classDuration,setClassDuration] = useState("");

const [totalFee,setTotalFee] = useState("");
const [installments,setInstallments] = useState("");
const [discountAllowed,setDiscountAllowed] = useState("Yes");

const [courses,setCourses] = useState<any[]>([]);
const [feeList,setFeeList] = useState<any[]>([]);

const [editId,setEditId] = useState<string | null>(null);

const mapOptions = (arr:any[]) =>
arr.map((v:any)=>({label:v,value:v}));

useEffect(()=>{
fetchBranches();
fetchCourses();
},[]);

useEffect(()=>{
if(branch) fetchFees();
},[branch]);

const fetchBranches = async ()=>{

const { data } = await supabase
.from("branches")
.select("id,name")
.order("name");

if(data) setBranches(data);

};

const fetchCourses = async ()=>{

const { data } = await supabase
.from("courses")
.select("*")
.order("name");

if(data) setCourses(data);

};

const fetchFees = async ()=>{

const { data } = await supabase
.from("fee_schemes")
.select(`
*,
courses(name),
branches(name)
`)
.eq("branch_id",branch)
.order("scheme_name");

setFeeList(data || []);

};

const resetForm = ()=>{

setSchemeName("");
setCourse("");
setCourseDuration("");
setClassDuration("");
setTotalFee("");
setInstallments("");
setDiscountAllowed("Yes");
setEditId(null);

};

const handleSubmit = async (e:any)=>{

e.preventDefault();

const payload = {

branch_id:branch,
scheme_name:schemeName,
course_id:course,
course_duration:courseDuration,
class_duration:classDuration,
total_fee:totalFee,
installments,
discount_allowed:discountAllowed

};

if(editId){

await supabase
.from("fee_schemes")
.update(payload)
.eq("id",editId);

}else{

await supabase
.from("fee_schemes")
.insert([payload]);

}

resetForm();
fetchFees();

};

const deleteFee = async (id:string)=>{

if(!confirm("Delete scheme?")) return;

await supabase
.from("fee_schemes")
.delete()
.eq("id",id);

fetchFees();

};

const editFee = (f:any)=>{

setEditId(f.id);
setSchemeName(f.scheme_name);
setCourse(f.course_id);
setCourseDuration(f.course_duration);
setClassDuration(f.class_duration);
setTotalFee(f.total_fee);
setInstallments(f.installments);
setDiscountAllowed(f.discount_allowed);

};

return(

<div className="space-y-6">

<p className="font-semibold text-blue-600">
Fee Master
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
label="Scheme Name"
value={schemeName}
onChange={(e:any)=>setSchemeName(e.target.value)}
/>

<SelectField
label="Course"
value={course}
options={courses.map((c:any)=>({
label:c.name,
value:c.id
}))}
onChange={(val:string)=>setCourse(val)}
/>

<Input
label="Course Duration"
value={courseDuration}
onChange={(e:any)=>setCourseDuration(e.target.value)}
/>

<Input
label="Class Duration"
value={classDuration}
onChange={(e:any)=>setClassDuration(e.target.value)}
/>

<Input
label="Total Fee"
type="number"
value={totalFee}
onChange={(e:any)=>setTotalFee(e.target.value)}
/>

<Input
label="Installments"
type="number"
value={installments}
onChange={(e:any)=>setInstallments(e.target.value)}
/>

<SelectField
label="Discount Allowed"
value={discountAllowed}
options={mapOptions(["Yes","No"])}
onChange={(val:string)=>setDiscountAllowed(val)}
/>

<div className="md:col-span-4 flex justify-end">

<button
type="submit"
className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
>

{editId ? "Update Scheme" : "Save Scheme"}

</button>

</div>

</form>

<div className="bg-white rounded-xl shadow-sm overflow-hidden">

<table className="w-full text-sm">

<thead className="bg-gray-100">

<tr>
<th className="p-3 text-left">Scheme</th>
<th className="p-3 text-left">Course</th>
<th className="p-3 text-left">Duration</th>
<th className="p-3 text-left">Fee</th>
<th className="p-3 text-left">Installments</th>
<th className="p-3 text-left">Discount</th>
<th className="p-3 text-left">Action</th>
</tr>

</thead>

<tbody>

{feeList.map((f:any)=>(

<tr key={f.id} className="border-t">

<td className="p-3">{f.scheme_name}</td>
<td className="p-3">{f.courses?.name}</td>
<td className="p-3">{f.course_duration}</td>
<td className="p-3">{f.total_fee}</td>
<td className="p-3">{f.installments}</td>
<td className="p-3">{f.discount_allowed}</td>

<td className="p-3 space-x-2">

<button
onClick={()=>editFee(f)}
className="text-blue-600"
>
Edit
</button>

<button
onClick={()=>deleteFee(f.id)}
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