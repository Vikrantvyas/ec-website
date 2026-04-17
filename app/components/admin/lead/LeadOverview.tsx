"use client";

type Props = {
  lead: any;
  lastFU: any;
  isEdit: boolean;
  setFormData: any;
};

export default function LeadOverview({ lead, lastFU, isEdit, setFormData }: Props) {

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="space-y-3 text-sm">

      {/* 1️⃣ ENQUIRY */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p>
          <b>Date:</b>{" "}
          {isEdit ? (
            <input
              type="date"
              value={lead.enquiry_date || ""}
              onChange={(e) => handleChange("enquiry_date", e.target.value)}
              className="border px-1"
            />
          ) : lead.enquiry_date}{" "}
          | <b>Time:</b>{" "}
          {isEdit ? (
            <input
              value={lead.enquiry_time || ""}
              onChange={(e) => handleChange("enquiry_time", e.target.value)}
              className="border px-1 w-20"
            />
          ) : lead.enquiry_time}
        </p>

        <p>
          <b>Method:</b>{" "}
          {isEdit ? (
            <input
              value={lead.method || ""}
              onChange={(e) => handleChange("method", e.target.value)}
              className="border px-1"
            />
          ) : lead.method}{" "}
          | <b>Channel:</b>{" "}
          {isEdit ? (
            <input
              value={lead.channel || ""}
              onChange={(e) => handleChange("channel", e.target.value)}
              className="border px-1"
            />
          ) : lead.channel}
        </p>

        <p>
          <b>Enquired By:</b>{" "}
          {isEdit ? (
            <input
              value={lead.enquired_by || ""}
              onChange={(e) => handleChange("enquired_by", e.target.value)}
              className="border px-1"
            />
          ) : lead.enquired_by}
        </p>

        <p>
          <b>For:</b>{" "}
          {isEdit ? (
            <input
              value={lead.for_whom || ""}
              onChange={(e) => handleChange("for_whom", e.target.value)}
              className="border px-1"
            />
          ) : lead.for_whom}
        </p>
      </div>

      {/* 2️⃣ COURSE */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p>
          <b>Department:</b>{" "}
          {isEdit ? (
            <input
              value={lead.department || ""}
              onChange={(e) => handleChange("department", e.target.value)}
              className="border px-1"
            />
          ) : lead.department}
        </p>

        <p>
          <b>Course:</b>{" "}
          {isEdit ? (
            <input
              value={lead.course || ""}
              onChange={(e) => handleChange("course", e.target.value)}
              className="border px-1"
            />
          ) : lead.course}
        </p>
      </div>

      {/* 3️⃣ PERSONAL */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p>
          <b>Alt Number:</b>{" "}
          {isEdit ? (
            <input
              value={lead.alternate_number || ""}
              onChange={(e) => handleChange("alternate_number", e.target.value)}
              className="border px-1"
            />
          ) : lead.alternate_number}
        </p>

        <p>
          <b>Profession:</b>{" "}
          {isEdit ? (
            <input
              value={lead.profession || ""}
              onChange={(e) => handleChange("profession", e.target.value)}
              className="border px-1"
            />
          ) : lead.profession}
        </p>

        <p>
          <b>Education:</b>{" "}
          {isEdit ? (
            <input
              value={lead.education || ""}
              onChange={(e) => handleChange("education", e.target.value)}
              className="border px-1"
            />
          ) : lead.education}
        </p>

        <p>
          <b>Marital:</b>{" "}
          {isEdit ? (
            <input
              value={lead.marital_status || ""}
              onChange={(e) => handleChange("marital_status", e.target.value)}
              className="border px-1"
            />
          ) : lead.marital_status}
        </p>

        <p>
          <b>School/Job:</b>{" "}
          {isEdit ? (
            <input
              value={lead.school_college_job || ""}
              onChange={(e) => handleChange("school_college_job", e.target.value)}
              className="border px-1"
            />
          ) : lead.school_college_job}
        </p>
      </div>

      {/* 4️⃣ STATUS */}
      <div className="bg-white p-3 rounded shadow space-y-1">
        <p>
          <b>Stage:</b>{" "}
          {isEdit ? (
            <input
              value={lead.lead_stage || ""}
              onChange={(e) => handleChange("lead_stage", e.target.value)}
              className="border px-1"
            />
          ) : lead.lead_stage}
        </p>

        <p>
          <b>Chances:</b>{" "}
          {isEdit ? (
            <input
              value={lead.lead_chances || ""}
              onChange={(e) => handleChange("lead_chances", e.target.value)}
              className="border px-1"
            />
          ) : lead.lead_chances}
        </p>

        <p>
          <b>Counsellor:</b>{" "}
          {isEdit ? (
            <input
              value={lead.counsellor || ""}
              onChange={(e) => handleChange("counsellor", e.target.value)}
              className="border px-1"
            />
          ) : lead.counsellor}
        </p>

        <p>
          <b>Next Follow:</b>{" "}
          {isEdit ? (
            <input
              type="date"
              value={lead.next_follow_date || ""}
              onChange={(e) => handleChange("next_follow_date", e.target.value)}
              className="border px-1"
            />
          ) : lead.next_follow_date}
        </p>

        <p>
          <b>Remark:</b>{" "}
          {isEdit ? (
            <input
              value={lead.remark || ""}
              onChange={(e) => handleChange("remark", e.target.value)}
              className="border px-1 w-full"
            />
          ) : lead.remark}
        </p>
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