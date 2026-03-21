"use client";

type Props = {
  lead: any;
  lastFU: any;
};

export default function LeadOverview({ lead, lastFU }: Props) {
  return (
    <div className="space-y-3 text-sm">

      {/* 1️⃣ ENQUIRY */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p><b>Date:</b> {lead.enquiry_date} | <b>Time:</b> {lead.enquiry_time}</p>
        <p><b>Method:</b> {lead.method} | <b>Channel:</b> {lead.channel}</p>
        <p><b>Enquired By:</b> {lead.enquired_by}</p>
        <p><b>For:</b> {lead.for_whom}</p>
      </div>

      {/* 2️⃣ COURSE */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p><b>Department:</b> {lead.department}</p>
        <p><b>Course:</b> {lead.course}</p>
      </div>

      {/* 3️⃣ PERSONAL */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p><b>Alt Number:</b> {lead.alternate_number}</p>
        <p><b>Profession:</b> {lead.profession}</p>
        <p><b>Education:</b> {lead.education}</p>
        <p><b>Marital:</b> {lead.marital_status}</p>
        <p><b>School/Job:</b> {lead.school_college_job}</p>
        <p><b>School Timing:</b> {lead.school_timing}</p>
        <p><b>Contact Time:</b> {lead.contact_time}</p>
      </div>

      {/* 4️⃣ STATUS */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p><b>Stage:</b> {lead.lead_stage}</p>
        <p><b>Chances:</b> {lead.lead_chances}</p>
        <p><b>Counsellor:</b> {lead.counsellor}</p>
        <p><b>Next Follow:</b> {lead.next_follow_date} {lead.next_follow_time}</p>
        <p><b>Action:</b> {lead.action}</p>
        <p><b>Remark:</b> {lead.remark}</p>
      </div>

      {/* 5️⃣ LAST FOLLOW-UP */}
      {lastFU && (
        <div className="bg-white p-3 rounded shadow space-y-1">
          <p><b>Last Call:</b> {new Date(lastFU.created_at).toLocaleDateString()}</p>
          <p><b>Result:</b> {lastFU.result}</p>
          {lastFU.mood && <p><b>Mood:</b> {lastFU.mood}</p>}
          {lastFU.remark && <p><b>Remark:</b> {lastFU.remark}</p>}
        </div>
      )}

      {/* 6️⃣ ACTION */}
      <div className="bg-white p-3 rounded shadow flex justify-around text-blue-600">
        <a href={`tel:${lead.mobile_number}`}>Call</a>
        <a href={`https://wa.me/91${lead.mobile_number}`} target="_blank">
          WhatsApp
        </a>
      </div>

    </div>
  );
}