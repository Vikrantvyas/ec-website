"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadTable from "@/app/components/admin/lead/LeadTable";

export default function LeadListPage() {

const [leads,setLeads] = useState<any[]>([]);
const [loading,setLoading] = useState(true);
const [leadCount,setLeadCount] = useState(0);

/* LOAD DATA */

useEffect(()=>{

const loadData = async ()=>{

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

setLeads(all);
setLeadCount(all.length);

setLoading(false);

};

loadData();

},[]);

/* LOADING */

if(loading){
return <div className="p-6">Loading Leads...</div>;
}

/* UI */

return(

<PermissionGuard page="Lead List">

<div className="w-full px-6 py-0 bg-white">

<LeadTable
leads={leads}
setLeadCount={setLeadCount}
/>

</div>

</PermissionGuard>

);

}