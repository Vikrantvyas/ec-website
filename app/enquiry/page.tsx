"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
    full_name: string;
    whatsapp_number: string;
    age: string;
    education: string;
    english_level: string;
    demo_class_time: string;
    knows_zoom: string;
};

const initialForm: FormData = {
    full_name: "",
    whatsapp_number: "",
    age: "",
    education: "",
    english_level: "",
    demo_class_time: "",
    knows_zoom: "",
};

export default function EnquiryPage() {
    const [formData, setFormData] = useState<FormData>(initialForm);
    const [submitted, setSubmitted] = useState(false);
    const [started, setStarted] = useState(false);

    const nameIsValid =
        formData.full_name.trim().length >= 2 &&
        /^[A-Za-z\u0900-\u097F ]+$/.test(formData.full_name.trim());

    const phoneIsValid =
        /^[6-9][0-9]{9}$/.test(formData.whatsapp_number);

    const basicDetailsValid = nameIsValid && phoneIsValid;

    const updateField = (
        field: keyof FormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;

        if (/^[A-Za-z\u0900-\u097F ]*$/.test(value)) {
            updateField("full_name", value);
        }
    };

    const handlePhoneChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);

        updateField("whatsapp_number", value);
    };

    const handleOption = (
        field: keyof FormData,
        value: string
    ) => {
        updateField(field, value);

        if (field === "knows_zoom") {
            setStarted(true);
        }
    };

    const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (
    !basicDetailsValid ||
    !formData.age ||
    !formData.education ||
    !formData.english_level ||
    !formData.demo_class_time ||
    !formData.knows_zoom
  ) {
    return;
  }

  const { error } = await supabase.from("meta_leads").insert({
    meta_lead_id: null,
    created_time: new Date().toISOString(),

    form_name: "Website Enquiry",
    platform: "website",
    is_organic: true,

    full_name: formData.full_name.trim(),
    whatsapp_number: formData.whatsapp_number,
    age: formData.age,
    education: formData.education,
    english_level: formData.english_level,
    demo_class_time: formData.demo_class_time,
    knows_zoom: formData.knows_zoom,

    processed: false,
  });

  if (error) {
    console.error("Website enquiry insert error:", error);
    alert("जानकारी जमा नहीं हो पाई। कृपया दोबारा प्रयास करें।");
    return;
  }

  setSubmitted(true);
};

    const optionClass = (selected: boolean) =>
        `w-full rounded-xl border-2 px-4 py-4 text-left transition ${selected
            ? "border-blue-600 bg-blue-50 text-blue-800"
            : "border-gray-200 bg-white text-gray-800 hover:border-blue-400"
        }`;

    if (submitted) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm border">
                    <div className="text-5xl mb-4">✅</div>

                    <p className="text-xl font-semibold text-gray-900">

                        जानकारी देने के लिए धन्‍यवाद,
                        इस जानकारी के आधार पर आपको जल्‍द ही
                        फ्री डेमो क्‍लास का टाईम और जू़म लिंक दिए गए नम्‍बर पर भेजी जाएगी।
                    </p>

                    <p className="mt-4 text-lg font-bold text-gray-800">
                        English Club
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="mx-auto max-w-xl">

                {/* HEADER */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        English Club
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Free Demo Class Enquiry Form
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
                >

                    {/* NAME */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-800">
                            Full Name *
                        </label>

                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={handleNameChange}
                            placeholder="अपना नाम लिखें"
                            autoComplete="name"
                            className={`w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 ${formData.full_name && !nameIsValid
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                        />

                        {formData.full_name && !nameIsValid && (
                            <p className="mt-1 text-sm text-red-600">
                                कृपया सही नाम दर्ज करें।
                            </p>
                        )}
                    </div>

                    {/* WHATSAPP */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-800">
                            WhatsApp Number *
                        </label>

                        <input
                            type="tel"
                            value={formData.whatsapp_number}
                            onChange={handlePhoneChange}
                            placeholder="10 अंकों का WhatsApp Number"
                            inputMode="numeric"
                            autoComplete="tel"
                            maxLength={10}
                            className={`w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 ${formData.whatsapp_number &&
                                    !phoneIsValid
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                        />

                        {formData.whatsapp_number &&
                            !phoneIsValid && (
                                <p className="mt-1 text-sm text-red-600">
                                    10 अंकों का सही भारतीय मोबाइल नंबर दर्ज करें।
                                </p>
                            )}
                    </div>

                    {/* CONTINUE */}
                    {!started && (
                        <button
                            type="button"
                            disabled={!basicDetailsValid}
                            onClick={() => setStarted(true)}
                            className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition ${basicDetailsValid
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "cursor-not-allowed bg-gray-300"
                                }`}
                        >
                            Continue →
                        </button>
                    )}

                    {/* QUESTIONS */}
                    {started && (
                        <div className="space-y-7">

                            {/* AGE */}
                            <div>
                                <label className="mb-3 block font-semibold text-gray-800">
                                    आपकी उम्र क्या है? *
                                </label>

                                <div className="space-y-2">
                                    {[
                                        "10 से 20 के बीच",
                                        "20 से 30 के बीच",
                                        "30 से 40 के बीच",
                                        "40 से अधिक",
                                    ].map((option) => (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() =>
                                                handleOption("age", option)
                                            }
                                            className={optionClass(
                                                formData.age === option
                                            )}
                                        >
                                            <span className="mr-3">
                                                {formData.age === option
                                                    ? "◉"
                                                    : "○"}
                                            </span>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* EDUCATION */}
                            {formData.age && (
                                <div>
                                    <label className="mb-3 block font-semibold text-gray-800">
                                        आपकी पढ़ाई क्या हुई है? *
                                    </label>

                                    <div className="space-y-2">
                                        {[
                                            "8th से कम",
                                            "8th से 12th के बीच",
                                            "12th से अधिक",
                                            "अभी पढ़ाई चल रही है, कॉलेज में हैं",
                                            "अभी पढ़ाई चल रही है, school में हैं",
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option}
                                                onClick={() =>
                                                    handleOption(
                                                        "education",
                                                        option
                                                    )
                                                }
                                                className={optionClass(
                                                    formData.education === option
                                                )}
                                            >
                                                <span className="mr-3">
                                                    {formData.education === option
                                                        ? "◉"
                                                        : "○"}
                                                </span>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ENGLISH LEVEL */}
                            {formData.education && (
                                <div>
                                    <label className="mb-3 block font-semibold text-gray-800">
                                        अभी इंग्लिश का लेवल क्या है? *
                                    </label>

                                    <div className="space-y-2">
                                        {[
                                            "इंग्लिश पढ़ना भी नहीं आता है",
                                            "शुरू से सीखना है",
                                            "need_advanced_batch",
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option}
                                                onClick={() =>
                                                    handleOption(
                                                        "english_level",
                                                        option
                                                    )
                                                }
                                                className={optionClass(
                                                    formData.english_level ===
                                                    option
                                                )}
                                            >
                                                <span className="mr-3">
                                                    {formData.english_level ===
                                                        option
                                                        ? "◉"
                                                        : "○"}
                                                </span>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* DEMO TIME */}
                            {formData.english_level && (
                                <div>
                                    <label className="mb-3 block font-semibold text-gray-800">
                                        आप फ्री डेमो क्लास कब ज्वाइन करना चाहेंगे? *
                                    </label>

                                    <div className="space-y-2">
                                        {[
                                            "सुबह 8 से 11 के बीच",
                                            "दोपहर 11 से 4 के बीच",
                                            "शाम 4 से 7 के बीच",
                                            "शाम 7 के बाद",
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option}
                                                onClick={() =>
                                                    handleOption(
                                                        "demo_class_time",
                                                        option
                                                    )
                                                }
                                                className={optionClass(
                                                    formData.demo_class_time ===
                                                    option
                                                )}
                                            >
                                                <span className="mr-3">
                                                    {formData.demo_class_time ===
                                                        option
                                                        ? "◉"
                                                        : "○"}
                                                </span>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ZOOM */}
                            {formData.demo_class_time && (
                                <div>
                                    <label className="mb-3 block font-semibold text-gray-800">
                                        क्या आप जूम क्लास के बारे में जानते हैं? *
                                    </label>

                                    <div className="space-y-2">
                                        {[
                                            "हाँ, मुझे जूम क्लास के बारे में जानकारी है",
                                            "नहीं, मुझे जूम क्लास के बारे में कुछ पता नहीं है",
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option}
                                                onClick={() =>
                                                    handleOption(
                                                        "knows_zoom",
                                                        option
                                                    )
                                                }
                                                className={optionClass(
                                                    formData.knows_zoom === option
                                                )}
                                            >
                                                <span className="mr-3">
                                                    {formData.knows_zoom === option
                                                        ? "◉"
                                                        : "○"}
                                                </span>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SUBMIT */}
                            {formData.knows_zoom && (
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            )}

                            <p className="text-center text-xs text-gray-500">
                                आपकी जानकारी केवल English Club द्वारा आपसे
                                संपर्क करने के लिए उपयोग की जाएगी।
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </main>
    );
}