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
    <p className={`flex items-start gap-2 ${value ? "text-gray-800" : "text-gray-400"}`}>
      {icon}
      <span>{value || "N/A"}</span>
    </p>
  );

  return (
    <div className="bg-white p-3 rounded shadow-sm text-sm space-y-2 leading-5">

      <Row icon={<Phone size={14} />} value={lead.mobile} />
      <Row icon={<Phone size={14} />} value={lead.alternate_number} />

      <Row icon={<MapPin size={14} />} value={`${lead.area || ""} ${lead.city || ""}`} />

      <Row icon={<User size={14} />} value={`${lead.gender || ""} ${lead.age || ""}`} />
      <Row icon={<User size={14} />} value={lead.marital_status} />

      <Row icon={<Briefcase size={14} />} value={lead.profession} />
      <Row icon={<BookOpen size={14} />} value={lead.education} />
      <Row icon={<BookOpen size={14} />} value={lead.school_college_job} />

      <Row icon={<Clock size={14} />} value={lead.contact_time} />
      <Row icon={<Clock size={14} />} value={lead.school_timing} />

      <Row icon={<Calendar size={14} />} value={`${lead.enquiry_date || ""} ${lead.enquiry_time || ""}`} />
      <Row icon={<MessageCircle size={14} />} value={`${lead.method || ""} / ${lead.channel || ""}`} />

      <Row icon={<User size={14} />} value={lead.enquired_by} />
      <Row icon={<User size={14} />} value={lead.for_whom} />

      <Row icon={<BookOpen size={14} />} value={lead.department} />
      <Row icon={<BookOpen size={14} />} value={lead.preferred_timing} />
      <Row icon={<BookOpen size={14} />} value={lead.preferred_batch} />

      <Row icon={<Clock size={14} />} value={`${lead.next_follow_date || ""} ${lead.next_follow_time || ""}`} />
      <Row icon={<User size={14} />} value={lead.counsellor} />

      <Row icon={<MessageCircle size={14} />} value={lead.remark} />

    </div>
  );
}