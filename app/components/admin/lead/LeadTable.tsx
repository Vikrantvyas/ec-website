"use client";

import { useState, useEffect } from "react";

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
receipt:true
});

const [widths,setWidths] = useState<Record<string,number>>({
branch:160,
date:120,
name:220,
mobile:160,
department:180,
course:180,
receipt:140
});

const [filters,setFilters] = useState({
department:"",
course:"",
branch:""
});

/* RESET PAGE WHEN SEARCH OR FILTER */

useEffect(()=>{
setPage(1);
},[search,filters]);

/* RECEIPT MAP (FIXED NAME MATCHING) */

const receiptMap:any = {};

receipts?.forEach((r:any)=>{

const name = r.student_name?.trim().toLowerCase();

if(!receiptMap[name]){
receiptMap[name] = 0;
}

receiptMap[name] += Number(r.amount || 0);

});

/* REMOVE DUPLICATES */

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
filtered = filtered.filter(l=>l.branch === filters.branch);
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

/* RESIZE */

const startResize = (e:any,col:keyof typeof widths)=>{

const startX = e.clientX;
const startWidth = widths[col];

const onMove = (ev:any)=>{

const diff = ev.clientX - startX;

setWidths({
...widths,
[col]:startWidth + diff
});

};

const onUp = ()=>{

window.removeEventListener("mousemove",onMove);
window.removeEventListener("mouseup",onUp);

};

window.addEventListener("mousemove",onMove);
window.addEventListener("mouseup",onUp);

};

return(

<div className="space-y-2 w-full">

{/* HEADER */}

<div className="flex justify-between items-center border-b pb-2">

<h1 className="text-lg font-semibold">
Leads ({filtered.length})
</h1>

<div className="flex gap-3 items-center relative">

<div className="relative">

<span className="absolute left-2 top-2 text-gray-400 text-sm">
🔍
</span>

<input
type="text"
placeholder="Search..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="pl-7 pr-3 py-1.5 border rounded text-sm"
/>

</div>

<button
onClick={()=>setShowColumns(!showColumns)}
className="px-3 py-1.5 border rounded text-sm bg-gray-50"
>
Columns
</button>

{showColumns && (

<div className="absolute right-0 top-9 bg-white border shadow-md rounded p-3 z-20 text-sm">

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

<div className="overflow-auto max-h-[72vh] w-full shadow-sm border">

<table className="w-full text-sm">

<thead className="sticky top-0 bg-gray-100">

<tr>

{columns.branch && (

<th style={{width:widths.branch}} className="px-3 py-2 border text-left">

<div className="flex flex-col">

<span>Branch</span>

<select
className="text-xs border rounded"
value={filters.branch}
onChange={(e)=>setFilters({...filters,branch:e.target.value})}
>

<option value="">All</option>

{[...new Set(uniqueLeads.map(l=>l.branch))].map((d:any)=>(
<option key={d}>{d}</option>
))}

</select>

</div>

</th>

)}

{columns.date && (

<th
style={{width:widths.date}}
onClick={()=>toggleSort("created_at")}
className="px-3 py-2 border cursor-pointer text-left"
>

Date{arrow("created_at")}

</th>

)}

{columns.name && (

<th
style={{width:widths.name}}
onClick={()=>toggleSort("student_name")}
className="px-3 py-2 border cursor-pointer text-left"
>

Name{arrow("student_name")}

</th>

)}

{columns.mobile && (

<th style={{width:widths.mobile}} className="px-3 py-2 border text-left">

Mobile

</th>

)}

{columns.department && (

<th style={{width:widths.department}} className="px-3 py-2 border text-left">

<div className="flex flex-col">

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

<th style={{width:widths.course}} className="px-3 py-2 border text-left">

<div className="flex flex-col">

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

<th style={{width:widths.receipt}} className="px-3 py-2 border text-left">

Receipt

</th>

)}

</tr>

</thead>

<tbody>

{paginated.map((lead)=>{

const name = lead.student_name?.trim().toLowerCase();

const amount = receiptMap[name] || 0;

return(

<tr key={lead.id} className="hover:bg-blue-50">

{columns.branch && <td className="px-3 py-2 border">{lead.branch}</td>}

{columns.date && (
<td className="px-3 py-2 border">
{new Date(lead.created_at).toLocaleDateString()}
</td>
)}

{columns.name && (
<td className="px-3 py-2 border">
{lead.student_name}
</td>
)}

{columns.mobile && (
<td className="px-3 py-2 border">
<a href={`tel:${lead.mobile_number}`} className="text-blue-600 hover:underline">
{lead.mobile_number}
</a>
</td>
)}

{columns.department && (
<td className="px-3 py-2 border">
{lead.department}
</td>
)}

{columns.course && (
<td className="px-3 py-2 border">
{lead.course}
</td>
)}

{columns.receipt && (
<td className="px-3 py-2 border font-medium text-green-700">
{Number(amount).toFixed(2)}
</td>
)}

</tr>

);

})}

</tbody>

</table>

</div>

{/* PAGINATION */}

<div className="text-sm text-gray-600 flex gap-3">

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