"use client";

import { useState, useEffect } from "react";

export default function LeadTable({
leads,
setLeadCount
}:{leads:any[],setLeadCount?:(n:number)=>void}){

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
course:true
});

const [widths,setWidths] = useState<Record<string,number>>({
branch:160,
date:120,
name:220,
mobile:160,
department:180,
course:180
});

const [filters,setFilters] = useState({
department:"",
course:"",
branch:""
});

/* REMOVE DUPLICATES */

const uniqueLeads = Array.from(
new Map(leads.map((l)=>[l.id,l])).values()
);

/* SEARCH */

let filtered = uniqueLeads.filter((lead)=>
lead.student_name?.toLowerCase().includes(search.toLowerCase()) ||
lead.mobile_number?.includes(search)
);

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

<div className="space-y-4 w-full">

{/* HEADER ROW */}

<div className="flex justify-between items-center">

<h1 className="text-lg font-semibold">
Leads ({filtered.length})
</h1>

<div className="flex gap-3 items-center relative">

<div className="relative">

<span className="absolute left-2 top-2 text-gray-400 text-sm">🔍</span>

<input
type="text"
placeholder="Search..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="pl-7 pr-3 py-2 border rounded text-sm"
/>

</div>

<button
onClick={()=>setShowColumns(!showColumns)}
className="px-3 py-2 border rounded text-sm bg-gray-50"
>
Columns
</button>

{showColumns && (

<div className="absolute right-0 top-10 bg-white border shadow-md rounded p-3 z-20 text-sm">

{Object.keys(columns).map((c)=>{

const key = c as keyof typeof columns;

return(

<label key={c} className="flex gap-2 py-1">

<input
type="checkbox"
checked={columns[key]}
onChange={()=>
setColumns({
...columns,
[key]:!columns[key]
})
}
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

<div className="overflow-auto max-h-[70vh] w-full">

<table className="w-full text-sm border border-gray-300">

<thead className="sticky top-0 z-10">

<tr className="bg-gradient-to-b from-gray-100 to-gray-200 border">

{columns.branch && (
<th style={{width:widths.branch}} className="px-3 py-2 border">

Branch

<select
className="ml-2 text-xs"
value={filters.branch}
onChange={(e)=>setFilters({...filters,branch:e.target.value})}
>
<option value="">All</option>
{[...new Set(uniqueLeads.map(l=>l.branch))].map((d:any)=>(
<option key={d}>{d}</option>
))}
</select>

</th>
)}

{columns.date && (
<th
style={{width:widths.date}}
onClick={()=>toggleSort("created_at")}
className="px-3 py-2 border cursor-pointer"
>

Date{arrow("created_at")}

<div
onMouseDown={(e)=>startResize(e,"date")}
className="float-right w-1 cursor-col-resize"
/>

</th>
)}

{columns.name && (
<th
style={{width:widths.name}}
onClick={()=>toggleSort("student_name")}
className="px-3 py-2 border cursor-pointer"
>

Name{arrow("student_name")}

<div
onMouseDown={(e)=>startResize(e,"name")}
className="float-right w-1 cursor-col-resize"
/>

</th>
)}

{columns.mobile && (
<th style={{width:widths.mobile}} className="px-3 py-2 border">
Mobile
</th>
)}

{columns.department && (
<th
style={{width:widths.department}}
onClick={()=>toggleSort("department")}
className="px-3 py-2 border cursor-pointer"
>

Department{arrow("department")}

<select
className="ml-2 text-xs"
value={filters.department}
onChange={(e)=>setFilters({...filters,department:e.target.value})}
>
<option value="">All</option>
{[...new Set(uniqueLeads.map(l=>l.department))].map((d:any)=>(
<option key={d}>{d}</option>
))}
</select>

</th>
)}

{columns.course && (
<th
style={{width:widths.course}}
onClick={()=>toggleSort("course")}
className="px-3 py-2 border cursor-pointer"
>

Course{arrow("course")}

<select
className="ml-2 text-xs"
value={filters.course}
onChange={(e)=>setFilters({...filters,course:e.target.value})}
>
<option value="">All</option>
{[...new Set(uniqueLeads.map(l=>l.course))].map((d:any)=>(
<option key={d}>{d}</option>
))}
</select>

</th>
)}

</tr>

</thead>

<tbody>

{paginated.map((lead)=>(

<tr key={lead.id} className="hover:bg-blue-50">

{columns.branch && <td className="px-3 py-2 border">{lead.branch}</td>}

{columns.date && (
<td className="px-3 py-2 border">
{new Date(lead.created_at).toLocaleDateString()}
</td>
)}

{columns.name && <td className="px-3 py-2 border">{lead.student_name}</td>}

{columns.mobile && (
<td className="px-3 py-2 border">
<a href={`tel:${lead.mobile_number}`} className="text-blue-600 hover:underline">
{lead.mobile_number}
</a>
</td>
)}

{columns.department && <td className="px-3 py-2 border">{lead.department}</td>}

{columns.course && <td className="px-3 py-2 border">{lead.course}</td>}

</tr>

))}

</tbody>

</table>

</div>

{/* PAGINATION */}

<div className="flex gap-3 items-center">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
className="px-3 py-1 border rounded"
>
Prev
</button>

<span>
Page {page} / {totalPages}
</span>

<button
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
className="px-3 py-1 border rounded"
>
Next
</button>

</div>

</div>

);

}