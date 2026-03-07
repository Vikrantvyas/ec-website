"use client";

import AdmissionForm from "@/app/components/admin/admission/AdmissionForm";

export default function AdmissionPage() {

  return (

    <div className="max-w-6xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        Admission
      </h1>

      <AdmissionForm />

    </div>

  );

}