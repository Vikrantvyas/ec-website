"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
export default function LeadTable({
leads,
receipts,
setLeadCount
}:{
leads:any[],
receipts:any[],
setLeadCount?:(n:number)=>void
}){

const [search,setSearch] = useState("");
const [showColumns,setShowColumns] = useState(false);

const [sortField,setSortField] = useState("created_at");
const [sortOrder,setSortOrder] = useState("desc");

const [page,setPage] = useState(1);
const pageSize = 50;

const [columns,setColumns] = useState({
branch:true,
date:true,
name:true,
mobile:true,
department:true,
course:true,
receipt:true,
actions:true
});

const [filters,setFilters] = useState({
department:"",
course:"",
branch:""
});
const [branchList,setBranchList] = useState<any[]>([]);
/* RESET PAGE */

useEffect(()=>{
setPage(1);
},[search,filters]);
useEffect(()=>{

const loadBranches = async ()=>{

const { data } = await supabase
.from("branches")
.select("id,name")
.eq("status","Active");

if(data){
setBranchList(data);
}

};

loadBranches();

},[]);
/* RECEIPT MAP */

const receiptMap:any = {};

receipts?.forEach((r:any)=>{

const name = r.student_name?.trim().toLowerCase();

if(!receiptMap[name]){
receiptMap[name] = 0;
}

receiptMap[name] += Number(r.amount || 0);

});

/* UNIQUE LEADS */

const uniqueLeads = Array.from(
new Map(leads.map((l)=>[l.id,l])).values()
);

/* SEARCH */

let filtered = uniqueLeads.filter((lead)=>{

const name = lead.student_name?.toLowerCase() || "";
const mobile = lead.mobile_number || "";

return(
name.includes(search.toLowerCase()) ||
mobile.includes(search)
);

});

/* FILTERS */

if(filters.department){
filtered = filtered.filter(l=>l.department === filters.department);
}

if(filters.course){
filtered = filtered.filter(l=>l.course === filters.course);
}

if(filters.branch){
filtered = filtered.filter(l=>l.branch_id === filters.branch);
}

/* SORT */

filtered = filtered.sort((a,b)=>{

let v1 = a[sortField];
let v2 = b[sortField];

if(sortField === "created_at"){
v1 = new Date(v1).getTime();
v2 = new Date(v2).getTime();
}

if(v1 < v2) return sortOrder === "asc" ? -1 : 1;
if(v1 > v2) return sortOrder === "asc" ? 1 : -1;
return 0;

});

/* UPDATE COUNT */

useEffect(()=>{
setLeadCount?.(filtered.length);
},[search,filters,sortField,sortOrder,leads]);

/* PAGINATION */

const totalPages = Math.ceil(filtered.length / pageSize);

const paginated = filtered.slice(
(page-1)*pageSize,
page*pageSize
);

/* SORT */

const toggleSort = (field:string)=>{

if(sortField === field){
setSortOrder(sortOrder === "asc" ? "desc" : "asc");
}else{
setSortField(field);
setSortOrder("asc");
}

};

const arrow = (field:string)=>{
if(sortField !== field) return "";
return sortOrder === "asc" ? " ▲" : " ▼";
};

/* ACTIONS */

const handleEdit = (lead:any)=>{
alert("Edit Lead: "+lead.student_name);
};

const handleDelete = (lead:any)=>{
if(confirm("Delete lead?")){
alert("Lead deleted: "+lead.student_name);
}
};

return(

<div className="w-full space-y-3">

{/* HEADER */}

<div className="flex justify-between items-center">

<h1 className="text-lg font-semibold text-gray-800">
Leads <span className="text-gray-400">({filtered.length})</span>
</h1>

<div className="flex gap-3 items-center relative">

<input
type="text"
placeholder="Search name or mobile..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

<button
onClick={()=>setShowColumns(!showColumns)}
className="px-3 py-1.5 border rounded-md text-sm bg-gray-50 hover:bg-gray-100"
>
Columns
</button>

{showColumns && (

<div className="absolute right-0 top-9 bg-white border shadow-lg rounded-md p-3 z-20 text-sm">

{Object.keys(columns).map((c)=>{

const key = c as keyof typeof columns;

return(

<label key={c} className="flex gap-2 py-1">

<input
type="checkbox"
checked={columns[key]}
onChange={()=>setColumns({
...columns,
[key]:!columns[key]
})}
/>

{c}

</label>

);

})}

</div>

)}

</div>

</div>

{/* TABLE */}

<div className="overflow-auto max-h-[72vh]">

<table className="w-full text-sm">

<thead className="sticky top-0 bg-white shadow-sm text-gray-500">

<tr>

{columns.branch && (

<th className="px-4 py-3 text-left text-xs font-semibold">

<div className="flex flex-col gap-1">

<span>Branch</span>

<select
className="text-xs border rounded"
value={filters.branch}
onChange={(e)=>setFilters({...filters,branch:e.target.value})}
>
<option value="">All</option>
{branchList.map((b:any)=>(
<option key={b.id} value={b.id}>{b.name}</option>
))}
</select>

</div>

</th>

)}

{columns.date && (

<th
onClick={()=>toggleSort("created_at")}
className="px-4 py-3 text-left text-xs font-semibold cursor-pointer"
>
Enq_Date{arrow("created_at")}
</th>

)}

{columns.name && (

<th
onClick={()=>toggleSort("student_name")}
className="px-4 py-3 text-left text-xs font-semibold cursor-pointer"
>
Name{arrow("student_name")}
</th>

)}

{columns.mobile && (
<th className="px-4 py-3 text-left text-xs font-semibold">
Mobile
</th>
)}

{columns.department && (

<th className="px-4 py-3 text-left text-xs font-semibold">

<div className="flex flex-col gap-1">

<span onClick={()=>toggleSort("department")} className="cursor-pointer">
Department{arrow("department")}
</span>

<select
className="text-xs border rounded"
value={filters.department}
onChange={(e)=>setFilters({...filters,department:e.target.value})}
>
<option value="">All</option>
{[...new Set(uniqueLeads.map(l=>l.department))].map((d:any)=>(
<option key={d}>{d}</option>
))}
</select>

</div>

</th>

)}

{columns.course && (

<th className="px-4 py-3 text-left text-xs font-semibold">

<div className="flex flex-col gap-1">

<span onClick={()=>toggleSort("course")} className="cursor-pointer">
Course{arrow("course")}
</span>

<select
className="text-xs border rounded"
value={filters.course}
onChange={(e)=>setFilters({...filters,course:e.target.value})}
>
<option value="">All</option>
{[...new Set(uniqueLeads.map(l=>l.course))].map((d:any)=>(
<option key={d}>{d}</option>
))}
</select>

</div>

</th>

)}

{columns.receipt && (
<th className="px-4 py-3 text-left text-xs font-semibold">
Receipt
</th>
)}

{columns.actions && (
<th className="px-4 py-3 text-left text-xs font-semibold">
Actions
</th>
)}

</tr>

</thead>

<tbody>

{paginated.map((lead)=>{

const name = lead.student_name?.trim().toLowerCase();
const amount = receiptMap[name] || 0;

return(

<tr
key={lead.id}
className="
group
hover:bg-blue-100
odd:bg-white
even:bg-gray-100
transition
cursor-pointer
"
>

{columns.branch && (
<td className="px-4 py-3.5">
{
  branchList.find((b:any)=>b.id === lead.branch_id)?.name || "-"
}
</td>
)}

{columns.date && (
<td className="px-4 py-3.5">
{lead.enquiry_date}
</td>
)}

{columns.name && (
<td className="px-4 py-3.5 font-semibold text-gray-800">
{lead.student_name}
</td>
)}

{columns.mobile && (
<td className="px-4 py-3.5">
<a href={`tel:${lead.mobile_number}`} className="text-blue-600 hover:underline">
{lead.mobile_number}
</a>
</td>
)}

{columns.department && (
<td className="px-4 py-3.5">
{lead.department}
</td>
)}

{columns.course && (
<td className="px-4 py-3.5">
{lead.course}
</td>
)}

{columns.receipt && (
<td className="px-4 py-3.5 text-green-600 font-semibold">
{Number(amount).toFixed(2)}
</td>
)}

{columns.actions && (
<td className="px-4 py-3.5">

<div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">

<button
onClick={()=>handleEdit(lead)}
className="text-blue-600 hover:text-blue-800"
>
✏️
</button>

<button
onClick={()=>handleDelete(lead)}
className="text-red-600 hover:text-red-800"
>
🗑
</button>

</div>

</td>
)}

</tr>

);

})}

</tbody>

</table>

</div>

{/* PAGINATION */}

<div className="flex gap-3 text-sm text-gray-600">

{page > 1 && (
<a className="cursor-pointer text-blue-600" onClick={()=>setPage(page-1)}>
Prev
</a>
)}

<span>
Page {page} / {totalPages}
</span>

{page < totalPages && (
<a className="cursor-pointer text-blue-600" onClick={()=>setPage(page+1)}>
Next
</a>
)}

</div>

</div>

);

}