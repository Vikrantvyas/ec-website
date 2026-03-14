"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadTable from "@/app/components/admin/lead/LeadTable";

export default function LeadListPage() {

const [leads,setLeads] = useState<any[]>([]);
const [receipts,setReceipts] = useState<any[]>([]);
const [loading,setLoading] = useState(true);
const [leadCount,setLeadCount] = useState(0);

/* LOAD DATA */

useEffect(()=>{

const loadData = async ()=>{

/* LOAD LEADS */

let allLeads:any[] = [];
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
allLeads = [...allLeads,...data];
}

if(!data || data.length < 1000){
finished = true;
}

from += 1000;
to += 1000;

}

/* LOAD RECEIPTS */

let allReceipts:any[] = [];
let rfrom = 0;
let rto = 999;
let rfinished = false;

while(!rfinished){

const { data,error } = await supabase
.from("receipts")
.select("student_name,amount")
.range(rfrom,rto);

if(error){
console.log(error);
break;
}

if(data){
allReceipts = [...allReceipts,...data];
}

if(!data || data.length < 1000){
rfinished = true;
}

rfrom += 1000;
rto += 1000;

}

setLeads(allLeads);
setReceipts(allReceipts);
setLeadCount(allLeads.length);

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
receipts={receipts}
setLeadCount={setLeadCount}
/>

</div>

</PermissionGuard>

);

}