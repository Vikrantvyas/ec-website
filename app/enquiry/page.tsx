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
    const [questionStep, setQuestionStep] = useState(0);

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
        const value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 10);

        updateField("whatsapp_number", value);
    };

    const handleOption = (
        field: keyof FormData,
        value: string
    ) => {
        updateField(field, value);

        if (field === "age") {
            setQuestionStep(2);
        }

        if (field === "education") {
            setQuestionStep(3);
        }

        if (field === "english_level") {
            setQuestionStep(4);
        }

        if (field === "demo_class_time") {
            setQuestionStep(5);
        }

        if (field === "knows_zoom") {
            setQuestionStep(6);
        }
    };

    const goBack = () => {
        if (questionStep === 1) {
            setStarted(false);
            setQuestionStep(0);
            return;
        }

        setQuestionStep((prev) => Math.max(1, prev - 1));
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
            console.error(
                "Website enquiry insert error:",
                error
            );

            alert(
                "जानकारी जमा नहीं हो पाई। कृपया दोबारा प्रयास करें।"
            );

            return;
        }

        setSubmitted(true);
    };

    const optionClass = (selected: boolean) =>
        `w-full rounded-xl border-2 px-4 py-4 text-left transition ${selected
            ? "border-blue-600 bg-blue-50 text-blue-800"
            : "border-gray-200 bg-white text-gray-800 hover:border-blue-400"
        }`;

    const progress = Math.min(questionStep, 5) * 20;

    const motivation =
        questionStep === 1
            ? "🎯 शुरुआत हो गई! बस 5 छोटे जवाब और।"
            : questionStep === 2
                ? "बहुत बढ़िया! 4 जवाब और बाकी हैं।"
                : questionStep === 3
                    ? "आप सही दिशा में बढ़ रहे हैं! 3 जवाब और।"
                    : questionStep === 4
                        ? "मंज़िल करीब है! सिर्फ 2 जवाब और।"
                        : questionStep === 5
                            ? "बस 1 जवाब और… आपका Perfect Demo Time सामने है!"
                            : questionStep === 6
                                ? "🎉 शानदार! आपने सभी 5 सवाल पूरे कर लिए।"
                                : "";

    if (submitted) {
        const communityData = {
            "सुबह 8 से 11 के बीच": {
                buttonText: "Join 8–11 WhatsApp Community",
                link: "https://chat.whatsapp.com/IZEW8r7qukL2kDi4q4NGOE",
            },
            "दोपहर 11 से 4 के बीच": {
                buttonText: "Join 11–4 WhatsApp Community",
                link: "https://chat.whatsapp.com/GGtaS8m3PUPCW38Eua13Hf",
            },
            "शाम 4 से 7 के बीच": {
                buttonText: "Join 4–7 WhatsApp Community",
                link: "https://chat.whatsapp.com/LP9vhD6uQwuE35tzQl0Afk",
            },
            "शाम 7 के बाद": {
                buttonText: "Join After 7 PM WhatsApp Community",
                link: "https://chat.whatsapp.com/KPIrjlVn6ju1aljRoOFDWl",
            },
        } as const;

        const selectedCommunity =
            communityData[
            formData.demo_class_time as keyof typeof communityData
            ];

        return (
            <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-green-50 px-4 py-8">
                <div className="mx-auto w-full max-w-2xl">

                    {/* MAIN CARD */}
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

                        {/* SUCCESS HEADER */}
                        <div className="px-5 pt-7 text-center sm:px-8 sm:pt-8">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-sm">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-2xl text-white">
                                    ✓
                                </div>
                            </div>

                            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                                अब सबसे महत्वपूर्ण कदम
                            </h1>

                            <div className="mx-auto mt-4 max-w-xl">
                                <p className="text-base leading-7 text-gray-700 sm:text-lg">
                                    {" "}
                                    <span className="font-extrabold text-blue-700">
                                        {formData.demo_class_time}
                                    </span>{" "}
                                    वाले स्टूडेंट्स की हमने एक{" "}
                                    <span className="font-bold text-gray-900">
                                        WhatsApp Community
                                    </span>{" "}
                                    बनाई है।
                                </p>
                            </div>
                        </div>

                        {/* PRIVACY BENEFITS */}
                        <div className="grid gap-4 px-5 pt-6 sm:grid-cols-2 sm:px-8">

                            {/* PRIVACY */}
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                                    🔒
                                </div>

                                <p className="font-bold text-gray-900">
                                    आपका मोबाइल नंबर सुरक्षित
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-700">
                                    Community में किसी सदस्य को किसी भी अन्य सदस्य
                                    का मोबाइल नंबर दिखाई नहीं देता।
                                </p>
                            </div>

                            {/* MESSAGES */}
                            <div className="rounded-2xl border border-green-100 bg-green-50/70 p-5">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                                    📢
                                </div>

                                <p className="font-bold text-gray-900">
                                    केवल हम ही मैसेज करेंगे
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-700">
                                    इसमें मैसेज भी सिर्फ हम ही कर सकते हैं,
                                    अन्य सदस्य नहीं। यानी आपकी privacy और
                                    सुविधा दोनों का पूरा ध्यान रखा जाता है।
                                </p>
                            </div>
                        </div>

                        {/* COMMUNITY CTA */}
                        {selectedCommunity && (
                            <div className="mx-5 mt-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 sm:mx-8 sm:p-6">

                                {/* PURPOSE */}
                                <p className="text-base font-bold leading-7 text-gray-900 text-center sm:text-lg">
                                    📢 प्रतिदिन की फ्री डेमो क्लास के टाइम,
                                    लिंक और अन्य अपडेट्स के लिए
                                    Community ज्वाइन करें 👇
                                </p>

                                {/* JOIN BUTTON */}
                                <a
                                    href={selectedCommunity.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-green-700 hover:shadow-xl active:scale-[0.99] sm:text-lg"
                                >
                                    <span className="text-2xl">☘</span>
                                    {selectedCommunity.buttonText}
                                    <span className="text-xl">→</span>
                                </a>

                              

                                
                            </div>
                        )}

                        {/* FOOTER */}
                        <div className="px-5 py-6 text-center sm:px-8">
                            <p className="text-lg font-extrabold text-gray-900">
                                English Club
                            </p>

                            
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-5 sm:py-8">
            <div className="mx-auto w-full max-w-xl">

                {/* HEADER */}
                <div className="mb-5 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        English Club
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        अपना Perfect Demo Class Time जानने के लिए
                        कुछ आसान सवालों के जवाब दें।
                    </p>
                </div>
                {/* FIRST SCREEN JOURNEY */}
                {!started && (
                    <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
                        <div className="text-center">
                            <p className="text-base sm:text-lg font-bold text-blue-700">
                                🚪 बहुत टाल दिया, अब और नहीं...
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                अगले 2 महीनों में हमें अपना लक्ष्‍य पाना ही है
                            </p>
                        </div>

                        {/* JOURNEY VISUAL */}
                        <div className="relative mt-4 h-28 overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50 to-green-50">

                            {/* Ground */}
                            <div className="absolute bottom-5 left-5 right-5 h-1 rounded-full bg-gray-300" />

                            {/* Person */}
                            <div className="absolute bottom-7 left-[22%] text-4xl">
                                🧑
                            </div>

                            {/* Hand / Knocking effect */}
                            <div className="absolute bottom-[54px] left-[31%] text-xl">
                                ✊
                            </div>

                            {/* Door */}
                            <div className="absolute bottom-5 right-[14%] text-6xl">
                                🚪
                            </div>

                            {/* Goal */}
                            <div className="absolute right-3 top-3 text-2xl">
                                🎯
                            </div>

                            {/* Motivation text */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-500">
                                Knock → Answer → Reach Your Goal
                            </div>
                        </div>

                        <p className="mt-3 text-center text-sm font-semibold text-gray-700">
                            ✨ आपके नाम और नम्‍बर के बिना, आपको सही बैच का टाईम और लिंक नहीं भेज पाएंगे
                        </p>
                    </div>
                )}
                {/* MOTIVATION + PROGRESS */}
                {started && (
                    <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">

                        <div className="flex items-center justify-between gap-3 mb-3">
                            <p className="text-sm sm:text-base font-semibold text-blue-700">
                                {motivation}
                            </p>

                            <span className="shrink-0 text-sm font-bold text-gray-500">
                                {Math.min(questionStep, 5)}/5
                            </span>
                        </div>

                        {/* JOURNEY */}
                        <div className="relative h-20 overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50 to-green-50">

                            {/* Road */}
                            <div className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>

                            {/* Moving Character */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 text-3xl transition-all duration-700"
                                style={{
                                    left: `calc(${progress}% - 15px)`,
                                }}
                            >
                                🧗
                            </div>

                            {/* Goal */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl">
                                🎯
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm"
                >

                    {/* BASIC DETAILS */}
                    {!started && (
                        <div className="space-y-5">

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
                            <button
                                type="button"
                                disabled={!basicDetailsValid}
                                onClick={() => {
                                    setStarted(true);
                                    setQuestionStep(1);
                                }}
                                className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition ${basicDetailsValid
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "cursor-not-allowed bg-gray-300"
                                    }`}
                            >
                                दरवाज़ा खटखटाएँ और शुरुआत करें 🚪 →
                            </button>
                        </div>
                    )}

                    {/* QUESTIONS */}
                    {started && (
                        <div>
                            {/* BACK BUTTON */}
                            {questionStep >= 1 && questionStep <= 5 && (
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                                >
                                    ← पिछला सवाल
                                </button>
                            )}
                            {/* QUESTION 1 — AGE */}
                            {questionStep === 1 && (
                                <div>
                                    <label className="mb-4 block text-lg font-semibold text-gray-800">
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
                            )}

                            {/* QUESTION 2 — EDUCATION */}
                            {questionStep === 2 && (
                                <div>
                                    <label className="mb-4 block text-lg font-semibold text-gray-800">
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

                            {/* QUESTION 3 — ENGLISH LEVEL */}
                            {questionStep === 3 && (
                                <div>
                                    <label className="mb-4 block text-lg font-semibold text-gray-800">
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
                                                    formData.english_level === option
                                                )}
                                            >
                                                <span className="mr-3">
                                                    {formData.english_level === option
                                                        ? "◉"
                                                        : "○"}
                                                </span>

                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* QUESTION 4 — DEMO TIME */}
                            {questionStep === 4 && (
                                <div>
                                    <label className="mb-4 block text-lg font-semibold text-gray-800">
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

                            {/* QUESTION 5 — ZOOM */}
                            {questionStep === 5 && (
                                <div>
                                    <label className="mb-4 block text-lg font-semibold text-gray-800">
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
                            {questionStep === 6 && (
                                <div className="text-center">

                                    <div className="mb-5 text-5xl">
                                        🎉
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        शानदार!
                                    </h2>

                                    <p className="mt-2 text-gray-600">
                                        सभी सवाल खत्‍म ! बधाई
                                    </p>

                                    <button
                                        type="submit"
                                        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        Free Demo Class के टाईम और लिंक के लिए क्लिक करें  →
                                    </button>
                                </div>
                            )}

                            {/* PRIVACY */}
                            <p className="mt-6 text-center text-xs text-gray-500">
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