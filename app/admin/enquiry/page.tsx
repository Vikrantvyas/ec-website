"use client";

import { useState } from "react";
import EnqMainPanel from "../../components/admin/enquiry/EnqMainPanel";
import EnqSidebar from "../../components/admin/enquiry/EnqSidebar";
import { Menu } from "lucide-react";

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-full relative">

      {/* ===== MOBILE TOP BAR (ONLY MOBILE) ===== */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4 z-20">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Menu size={18} />
          Leads
        </button>
      </div>

      {/* ===== SIDEBAR ===== */}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[420px] border-r border-gray-200 bg-white shrink-0">
        <EnqSidebar
          onSelectEnquiry={(enq) => {
            setSelectedLead(enq);
            setIsNewEnquiry(false);
          }}
          onNewEnquiry={() => {
            setIsNewEnquiry(true);
            setSelectedLead(null);
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] bg-white shadow-xl">
            <EnqSidebar
              onSelectEnquiry={(enq) => {
                setSelectedLead(enq);
                setIsNewEnquiry(false);
                setMobileSidebarOpen(false);
              }}
              onNewEnquiry={() => {
                setIsNewEnquiry(true);
                setSelectedLead(null);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ===== MAIN PANEL ===== */}
      <div className="flex-1 bg-white min-w-0 md:pt-0 pt-12">
        <EnqMainPanel
          selectedStudent={selectedLead}
          isNewEnquiry={isNewEnquiry}
          onAddEnquiry={() => {}}
        />
      </div>

    </div>
  );
}
