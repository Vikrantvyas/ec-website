"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadTable from "@/app/components/admin/lead/LeadTable";
import BranchSelector from "@/app/components/ui/BranchSelector";

export default function LeadListPage() {

const [leads,setLeads] = useState<any[]>([]);
const [allLeads,setAllLeads] = useState<any[]>([]);
const [branches,setBranches] = useState<string[]>([]);
const [selectedBranch,setSelectedBranch] = useState("");
const [loading,setLoading] = useState(true);

/* LOAD DATA */

useEffect(()=>{

const loadData = async ()=>{

/* load branches */

const { data:branchData } = await supabase
.from("branches")
.select("name")
.order("name");

if(branchData){
setBranches(branchData.map((b:any)=>b.name));
}

/* load leads */

let all:any[] = [];
let from = 0;
let to = 999;
let finished = false;

while(!finished){

const { data,error } = await supabase
.from("leads")
.select("*")
.order("created_at",{ascending:false})
.range(from,to);

if(error){
console.log(error);
break;
}

if(data){
all = [...all,...data];
}

if(!data || data.length < 1000){
finished = true;
}

from += 1000;
to += 1000;

}

setAllLeads(all);
setLeads(all);

setLoading(false);

};

loadData();

},[]);

/* BRANCH FILTER */

useEffect(()=>{

if(!selectedBranch){

setLeads(allLeads);

}else{

const filtered = allLeads.filter(
(l:any)=>l.branch === selectedBranch
);

setLeads(filtered);

}

},[selectedBranch,allLeads]);

/* LOADING */

if(loading){
return <div className="p-6">Loading Leads...</div>;
}

/* UI */

return(

<PermissionGuard page="Lead List">

<div className="w-full px-6 py-6 bg-white space-y-4">

{/* BRANCH */}

<BranchSelector
branches={branches}
value={selectedBranch}
onChange={setSelectedBranch}
/>

{/* HEADING */}

<h1 className="text-lg font-semibold">

Leads ({leads.length})

</h1>

{/* TABLE */}

<LeadTable leads={leads} />

</div>

</PermissionGuard>

);

}