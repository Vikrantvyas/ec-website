
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
    full_name: string;
    whatsapp_number: string;
    age: string;
    career_status: string;
    interview_experience: string;
    demo_class_time: string;
};

type ExistingEnquiry = FormData & {
    id: string;
    created_time: string;
};

const initialForm: FormData = {
    full_name: "",
    whatsapp_number: "",
    age: "",
    career_status: "",
    interview_experience: "",
    demo_class_time: "",
};

const formatName = (name: string) =>
    name
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .map(
            (word) =>
                word.charAt(0).toLocaleUpperCase("en-IN") +
                word.slice(1).toLocaleLowerCase("en-IN")
        )
        .join(" ");

function InterviewEnquiryPage() {
    const searchParams = useSearchParams();

    const trackingId = searchParams.get("tracking_id");
    const leadSource = searchParams.get("source") || "direct";

    const metaAttribution = {
        campaign_id: searchParams.get("campaign_id"),
        campaign_name: searchParams.get("campaign_name"),
        ad_set_id: searchParams.get("adset_id"),
        ad_set_name: searchParams.get("adset_name"),
        ad_id: searchParams.get("ad_id"),
        ad_name: searchParams.get("ad_name"),
    };

    const [formData, setFormData] =
        useState<FormData>(initialForm);

    const [started, setStarted] = useState(false);
    const [questionStep, setQuestionStep] = useState(1);

    const [checkingDuplicate, setCheckingDuplicate] =
        useState(false);

    const [existingEnquiry, setExistingEnquiry] =
        useState<ExistingEnquiry | null>(null);

    const [editingExistingId, setEditingExistingId] =
        useState<string | null>(null);

    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [submittedLeadId, setSubmittedLeadId] =
        useState<string | null>(null);

    const [errorMessage, setErrorMessage] = useState("");

    const nameIsValid =
        formData.full_name.trim().length >= 2 &&
        /^[A-Za-z\u0900-\u097F ]+$/.test(
            formData.full_name.trim()
        );

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

    // Interview Enquiry Duplicate Check
    const checkDuplicateEnquiry = async () => {
        const { data, error } = await supabase
            .from("meta_leads")
            .select(`
                id,
                created_time,
                full_name,
                whatsapp_number,
                age,
                career_status,
                interview_experience,
                demo_class_time
            `)
            .eq("whatsapp_number", formData.whatsapp_number)
            .eq("form_name", "Interview Enquiry")
            .order("created_time", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(
                "Interview duplicate check error:",
                error
            );
            throw error;
        }

        return data as ExistingEnquiry | null;
    };

    const startForm = async () => {
        if (!basicDetailsValid || checkingDuplicate) return;

        setCheckingDuplicate(true);
        setErrorMessage("");

        try {
            const duplicate = await checkDuplicateEnquiry();

            if (duplicate) {
                setExistingEnquiry(duplicate);
                return;
            }

            setStarted(true);
            setQuestionStep(1);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "Unable to verify your details. Please try again."
            );
        } finally {
            setCheckingDuplicate(false);
        }
    };

    const handleOption = (
        field: keyof FormData,
        value: string
    ) => {
        updateField(field, value);
        setErrorMessage("");

        setQuestionStep((prev) => prev + 1);
    };

    const goBack = () => {
        if (questionStep === 1) {
            setStarted(false);
            return;
        }

        setQuestionStep((prev) => Math.max(1, prev - 1));
    };

    const startEditing = () => {
        if (!existingEnquiry) return;

        setFormData({
            full_name: existingEnquiry.full_name || "",
            whatsapp_number:
                existingEnquiry.whatsapp_number || "",
            age: existingEnquiry.age || "",
            career_status:
                existingEnquiry.career_status || "",
            interview_experience:
                existingEnquiry.interview_experience || "",
            demo_class_time:
                existingEnquiry.demo_class_time || "",
        });

        setEditingExistingId(existingEnquiry.id);
        setExistingEnquiry(null);
        setStarted(true);
        setQuestionStep(1);
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (submitting) return;

        if (
            !basicDetailsValid ||
            !formData.age ||
            !formData.career_status ||
            !formData.interview_experience ||
            !formData.demo_class_time
        ) {
            setErrorMessage(
                "Please complete all questions before submitting."
            );
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            let submittedId: string | null = editingExistingId;

            if (editingExistingId) {
                const { error } = await supabase
                    .from("meta_leads")
                    .update({
                        full_name: formatName(formData.full_name),
                        whatsapp_number:
                            formData.whatsapp_number,
                        age: formData.age,
                        career_status: formData.career_status,
                        interview_experience:
                            formData.interview_experience,
                        demo_class_time: formData.demo_class_time,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingExistingId);

                if (error) throw error;
            } else {
                const urlSource =
                    new URLSearchParams(
                        window.location.search
                    ).get("source");

                const effectiveLeadSource = (
                    urlSource || leadSource || "direct"
                )
                    .trim()
                    .toLowerCase();

                const { data, error } = await supabase
                    .from("meta_leads")
                    .insert({
                        meta_lead_id: null,
                        created_time: new Date().toISOString(),

                        form_name: "Interview Enquiry",
                        platform: "website",

                        is_organic:
                            effectiveLeadSource !== "meta_ad",

                        lead_source: effectiveLeadSource,

                        campaign_id:
                            metaAttribution.campaign_id,
                        campaign_name:
                            metaAttribution.campaign_name,
                        ad_set_id:
                            metaAttribution.ad_set_id,
                        ad_set_name:
                            metaAttribution.ad_set_name,
                        ad_id: metaAttribution.ad_id,
                        ad_name: metaAttribution.ad_name,

                        full_name: formatName(
                            formData.full_name
                        ),
                        whatsapp_number:
                            formData.whatsapp_number,

                        age: formData.age,
                        career_status: formData.career_status,
                        interview_experience:
                            formData.interview_experience,
                        demo_class_time:
                            formData.demo_class_time,

                        processed: false,
                    })
                    .select("id")
                    .single();

                if (error) throw error;

                submittedId = data.id;

                (window as any).fbq?.("track", "Lead");
            }

            if (trackingId && submittedId) {
                const { error } =
                    await supabase.functions.invoke(
                        "whatsapp-form-submit",
                        {
                            body: {
                                tracking_id: trackingId,
                                lead_id: submittedId,
                            },
                        }
                    );

                if (error) {
                    console.error(
                        "Interview WhatsApp notification error:",
                        error
                    );
                }
            }

            setSubmittedLeadId(submittedId);
            setSubmitted(true);
        } catch (error: any) {
            console.error(
                "Interview enquiry submit error:",
                error
            );

            if (error?.code === "23505") {
                setErrorMessage(
                    "This Interview Enquiry has already been submitted with these details."
                );
            } else {
                setErrorMessage(
                    "Unable to submit your enquiry. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const progress = Math.min(questionStep - 1, 4) * 25;

    const optionClass = (selected: boolean) =>
        `w-full rounded-xl border-2 px-4 py-4 text-left font-semibold transition-all duration-200 ${
            selected
                ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                : "border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50/50"
        }`;

    const questions = [
        {
            number: 1,
            title: "What is your age?",
            options: [
                "18–25 Years",
                "26–35 Years",
                "Above 35 Years",
            ],
            field: "age" as const,
        },
        {
            number: 2,
            title: "What is your current career status?",
            options: [
                "Fresher (Looking for My First Job)",
                "Job Change (Looking for a Better Opportunity)",
            ],
            field: "career_status" as const,
        },
        {
            number: 3,
            title: "Have you ever attended a Job Interview?",
            options: ["Yes", "No"],
            field: "interview_experience" as const,
        },
        {
            number: 4,
            title: "When would you like to attend a Free Demo Class?",
            options: [
                "Morning",
                "Afternoon",
                "Evening",
                "Night",
            ],
            field: "demo_class_time" as const,
        },
    ];

    const currentQuestion =
        questions[questionStep - 1];

    // Existing Interview Enquiry
    if (existingEnquiry) {
        return (
            <main
                className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(8,25,48,.78),rgba(8,25,48,.78)),url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=85')",
                }}
            >
                <div className="w-full max-w-lg rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-9">
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                            ✓
                        </div>

                        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
                            Enquiry Already Submitted
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            We found an existing Interview Enquiry
                            with this WhatsApp number.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3 rounded-2xl bg-blue-50 p-4">
                        <div>
                            <p className="text-xs text-gray-500">
                                Full Name
                            </p>
                            <p className="font-bold text-gray-900">
                                {existingEnquiry.full_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                WhatsApp Number
                            </p>
                            <p className="font-bold text-gray-900">
                                {existingEnquiry.whatsapp_number}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Career Status
                            </p>
                            <p className="font-bold text-gray-900">
                                {existingEnquiry.career_status || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Demo Class Time
                            </p>
                            <p className="font-bold text-blue-700">
                                {existingEnquiry.demo_class_time || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                        <button
                            type="button"
                            onClick={startEditing}
                            className="w-full rounded-xl border-2 border-blue-600 bg-blue-50 px-4 py-3 font-bold text-blue-700 hover:bg-blue-100"
                        >
                            Edit My Information
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSubmittedLeadId(
                                    existingEnquiry.id
                                );
                                setExistingEnquiry(null);
                                setSubmitted(true);
                            }}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
                        >
                            My Information Is Correct →
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm font-bold text-gray-500">
                        English Club
                    </p>
                </div>
            </main>
        );
    }

    // Success Screen
    if (submitted) {
        return (
            <main
                className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(8,25,48,.78),rgba(8,25,48,.78)),url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=85')",
                }}
            >
                <div className="w-full max-w-lg rounded-3xl bg-white/95 p-7 text-center shadow-2xl backdrop-blur-md sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
                        ✓
                    </div>

                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Thank You!
                    </h1>

                    <p className="mt-3 text-lg font-semibold text-blue-700">
                        Your Interview Enquiry Has Been Submitted.
                    </p>

                    <p className="mt-4 leading-7 text-gray-600">
                        Our team at English Club will contact you
                        on your WhatsApp number regarding your
                        Free Interview Demo Class.
                    </p>

                    <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-left">
                        <p className="text-sm text-gray-500">
                            Preferred Demo Time
                        </p>
                        <p className="mt-1 text-xl font-extrabold text-blue-700">
                            {formData.demo_class_time}
                        </p>
                    </div>

                    <p className="mt-7 font-extrabold text-gray-900">
                        English Club
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Interview Practice Program
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed px-4 py-8 sm:py-12"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(8,25,48,.72),rgba(8,25,48,.72)),url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=85')",
            }}
        >
            <div className="w-full max-w-xl">

                {/* BRAND HEADER */}
                <div className="mb-5 text-center text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                        English Club
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                        Interview Practice
                    </h1>

                    <p className="mt-2 text-sm text-blue-100 sm:text-base">
                        Prepare Yourself. Build Confidence. Get Hired.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-3xl border border-white/50 bg-white/95 shadow-2xl backdrop-blur-md"
                >

                    {/* FORM INTRO */}
                    {!started && (
                        <div className="border-b border-gray-100 px-6 py-7 text-center sm:px-9">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                                💼
                            </div>

                            <h2 className="mt-4 text-xl font-extrabold text-gray-900 sm:text-2xl">
                                Start Your Interview Journey
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600">
                                Fill in a few details to book your
                                Free Interview Demo Class.
                            </p>
                        </div>
                    )}

                    {/* PROGRESS */}
                    {started && (
                        <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-bold text-blue-700">
                                    Interview Assessment
                                </span>

                                <span className="text-sm font-bold text-gray-500">
                                    {Math.min(questionStep, 4)} / 4
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>

                            <p className="mt-3 text-xs text-gray-500">
                                Just a few more steps to complete your enquiry.
                            </p>
                        </div>
                    )}

                    <div className="p-5 sm:p-8">

                        {/* BASIC DETAILS */}
                        {!started && (
                            <div className="space-y-5">

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-800">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={handleNameChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                    />

                                    {formData.full_name &&
                                        !nameIsValid && (
                                            <p className="mt-1 text-xs text-red-600">
                                                Please enter a valid name.
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-800">
                                        WhatsApp Number *
                                    </label>

                                    <input
                                        type="tel"
                                        value={formData.whatsapp_number}
                                        onChange={handlePhoneChange}
                                        placeholder="Enter 10-digit mobile number"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        maxLength={10}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                    />

                                    {formData.whatsapp_number &&
                                        !phoneIsValid && (
                                            <p className="mt-1 text-xs text-red-600">
                                                Enter a valid 10-digit Indian mobile number.
                                            </p>
                                        )}
                                </div>

                                {errorMessage && (
                                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                        {errorMessage}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    disabled={
                                        !basicDetailsValid ||
                                        checkingDuplicate
                                    }
                                    onClick={startForm}
                                    className={`w-full rounded-xl px-5 py-4 font-extrabold text-white transition ${
                                        basicDetailsValid &&
                                        !checkingDuplicate
                                            ? "bg-blue-600 shadow-lg hover:bg-blue-700"
                                            : "cursor-not-allowed bg-gray-300"
                                    }`}
                                >
                                    {checkingDuplicate
                                        ? "Checking Your Details..."
                                        : "Continue →"}
                                </button>

                                <p className="text-center text-xs leading-5 text-gray-500">
                                    Your information will only be used
                                    by English Club to contact you
                                    regarding Interview Practice.
                                </p>
                            </div>
                        )}

                        {/* QUESTIONS */}
                        {started && (
                            <div>

                                {/* BACK BUTTON */}
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="mb-5 text-sm font-bold text-gray-500 transition hover:text-blue-700"
                                >
                                    ← Back
                                </button>

                                {/* QUESTION OPTIONS */}
                                {questionStep <= 4 && currentQuestion && (
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                                            Question {currentQuestion.number}
                                        </p>

                                        <h2 className="mb-6 text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">
                                            {currentQuestion.title}
                                        </h2>

                                        <div className="space-y-3">
                                            {currentQuestion.options.map(
                                                (option) => (
                                                    <button
                                                        type="button"
                                                        key={option}
                                                        onClick={() =>
                                                            handleOption(
                                                                currentQuestion.field,
                                                                option
                                                            )
                                                        }
                                                        className={optionClass(
                                                            formData[
                                                                currentQuestion.field
                                                            ] === option
                                                        )}
                                                    >
                                                        <span className="mr-3 text-blue-600">
                                                            {formData[
                                                                currentQuestion.field
                                                            ] === option
                                                                ? "◉"
                                                                : "○"}
                                                        </span>

                                                        {option}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* FINAL SUBMIT */}
                                {questionStep === 5 && (
                                    <div className="text-center">
                                        <div className="mb-4 text-5xl">
                                            🎉
                                        </div>

                                        <h2 className="text-2xl font-extrabold text-gray-900">
                                            Almost Done!
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            Your details are ready.
                                            Submit your enquiry to
                                            arrange your Free Demo Class.
                                        </p>

                                        <div className="mt-6 space-y-3 rounded-2xl bg-blue-50 p-4 text-left">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Name
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {formatName(formData.full_name)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Career Status
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {formData.career_status}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Preferred Demo Time
                                                </p>
                                                <p className="font-bold text-blue-700">
                                                    {formData.demo_class_time}
                                                </p>
                                            </div>
                                        </div>

                                        {errorMessage && (
                                            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                                {errorMessage}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 font-extrabold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {submitting
                                                ? "Submitting..."
                                                : "Submit Interview Enquiry →"}
                                        </button>
                                    </div>
                                )}

                                <p className="mt-7 text-center text-xs leading-5 text-gray-500">
                                    Your information is safe with English Club.
                                </p>
                            </div>
                        )}
                    </div>
                </form>

                <p className="mt-5 text-center text-xs text-white/80">
                    © English Club | Interview Practice Program
                </p>
            </div>
        </main>
    );
}

export default function InterviewEnquiryPageWrapper() {
    return (
        <Suspense fallback={null}>
            <InterviewEnquiryPage />
        </Suspense>
    );
}
