"use client";

import {
  Phone,
  MapPin,
  User,
  Briefcase,
  BookOpen,
  Clock,
  Calendar,
  MessageCircle,
} from "lucide-react";

type Props = {
  lead: any;
};

export default function LeadDetails({ lead }: Props) {

  const Row = ({ icon, value }: any) => (
    <div className={`flex items-start gap-2 ${value ? "text-gray-800" : "text-gray-400"}`}>
      {icon}
      <span>{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="bg-white p-3 rounded shadow-sm text-sm space-y-3">

      {/* DATE + TIME */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<Calendar size={14} />} value={lead.enquiry_date} />
        <Row icon={<Clock size={14} />} value={lead.enquiry_time} />
      </div>

      {/* METHOD + CHANNEL */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<MessageCircle size={14} />} value={lead.method} />
        <Row icon={<MessageCircle size={14} />} value={lead.channel} />
      </div>

      {/* ENQUIRED */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<User size={14} />} value={lead.enquired_by} />
        <Row icon={<User size={14} />} value={lead.for_whom} />
      </div>

      {/* ✅ MOBILE + ALT COMBINED */}
      <Row
        icon={<Phone size={14} />}
        value={`${lead.mobile || ""}${lead.alternate_number ? " / " + lead.alternate_number : ""}`}
      />

      {/* LOCATION */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<MapPin size={14} />} value={lead.city} />
        <Row icon={<MapPin size={14} />} value={lead.area} />
      </div>

      {/* PROFILE */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<User size={14} />} value={lead.age} />
        <Row icon={<User size={14} />} value={lead.gender} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Row icon={<User size={14} />} value={lead.marital_status} />
        <Row icon={<Briefcase size={14} />} value={lead.profession} />
      </div>

      {/* ✅ EDUCATION + SCHOOL */}
      <Row
        icon={<BookOpen size={14} />}
        value={`${lead.education || ""}${lead.school_college_job ? " / " + lead.school_college_job : ""}`}
      />

      <div className="grid grid-cols-2 gap-2">
        <Row icon={<Clock size={14} />} value={lead.school_timing} />
        <Row icon={<Clock size={14} />} value={lead.contact_time} />
      </div>

      {/* COURSE */}
      <Row icon={<BookOpen size={14} />} value={lead.department} />

      {/* ✅ PREFERRED TIME + BATCH SAME ROW */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<BookOpen size={14} />} value={lead.preferred_timing} />
        <Row icon={<BookOpen size={14} />} value={lead.preferred_batch} />
      </div>

      {/* COUNSELLING */}
      <div className="grid grid-cols-2 gap-2">
        <Row icon={<User size={14} />} value={lead.lead_stage} />
        <Row icon={<User size={14} />} value={lead.lead_chances} />
      </div>

      <Row icon={<MessageCircle size={14} />} value={lead.action} />

      <div className="grid grid-cols-2 gap-2">
        <Row icon={<Calendar size={14} />} value={lead.next_follow_date} />
        <Row icon={<Clock size={14} />} value={lead.next_follow_time} />
      </div>

      {/* ✅ REMARK FIRST */}
      <Row icon={<MessageCircle size={14} />} value={lead.remark} />

      {/* ✅ COUNSELLOR AFTER REMARK */}
      <Row icon={<User size={14} />} value={lead.counsellor} />

    </div>
  );
}