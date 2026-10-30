
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
    full_name: string;
    whatsapp_number: string;
    age: string;
    education: string;
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
    education: "",
    career_status: "",
    interview_experience: "",
    demo_class_time: "",
};

const OFFICE_BACKGROUND =
    "linear-gradient(rgba(8,25,48,.58),rgba(8,25,48,.58)),url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=85')";

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
                education,
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
            education: existingEnquiry.education || "",
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
            !formData.education ||
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
                        education: formData.education,
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
                        education: formData.education,
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
            title: "What is your highest educational qualification?",
            options: [
                "Below 10th",
                "10th Pass",
                "12th Pass",
                "Diploma",
                "Graduate",
                "Postgraduate",
                "Currently Studying",
                "Other",
            ],
            field: "education" as const,
        },
        {
            number: 3,
            title: "What is your current career status?",
            options: [
                "Fresher (Looking for My First Job)",
                "Job Change (Looking for a Better Opportunity)",
            ],
            field: "career_status" as const,
        },
        {
            number: 4,
            title: "Have you ever attended a Job Interview?",
            options: ["Yes", "No"],
            field: "interview_experience" as const,
        },
        {
            number: 5,
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

    const currentQuestion = questions[questionStep - 1];

    const progress = Math.min(questionStep - 1, 5) * 20;

    const optionClass = (selected: boolean) =>
        `w-full rounded-xl border-2 px-4 py-4 text-left font-semibold transition-all duration-200 ${
            selected
                ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                : "border-gray-200 bg-white text-gray-800 hover:border-blue-400"
        }`;

    // Existing Interview Enquiry
    if (existingEnquiry) {
        return (
            <main
                className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
                style={{ backgroundImage: OFFICE_BACKGROUND }}
            >
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900">
                        Interview Enquiry Already Submitted
                    </h2>

                    <div className="mt-5 space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">
                                Full Name
                            </p>
                            <p className="font-semibold text-gray-900">
                                {existingEnquiry.full_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                WhatsApp Number
                            </p>
                            <p className="font-semibold text-gray-900">
                                {existingEnquiry.whatsapp_number}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Education
                            </p>
                            <p className="font-semibold text-gray-900">
                                {existingEnquiry.education || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Career Status
                            </p>
                            <p className="font-semibold text-gray-900">
                                {existingEnquiry.career_status || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Demo Class Time
                            </p>
                            <p className="font-semibold text-blue-700">
                                {existingEnquiry.demo_class_time || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                        <button
                            type="button"
                            onClick={startEditing}
                            className="w-full rounded-xl border-2 border-blue-600 bg-blue-50 px-4 py-3 font-bold text-blue-700"
                        >
                            Edit My Information
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSubmittedLeadId(existingEnquiry.id);
                                setExistingEnquiry(null);
                                setSubmitted(true);
                            }}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
                        >
                            My Information Is Correct
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // Success Screen
    if (submitted) {
        return (
            <main
                className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
                style={{ backgroundImage: OFFICE_BACKGROUND }}
            >
                <div className="w-full max-w-lg rounded-2xl bg-white p-7 text-center shadow-xl sm:p-9">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                        ✓
                    </div>

                    <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
                        Thank You!
                    </h1>

                    <p className="mt-3 leading-7 text-gray-600">
                        Your Interview Enquiry has been submitted successfully.
                        Our team will contact you on WhatsApp regarding your
                        Free Interview Demo Class.
                    </p>

                    <p className="mt-5 font-bold text-blue-700">
                        Preferred Demo Time: {formData.demo_class_time}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed px-4 py-6 sm:py-10"
            style={{ backgroundImage: OFFICE_BACKGROUND }}
        >
            <div className="w-full max-w-xl">
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
                >
                    {/* PROGRESS */}
                    {started && (
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-7">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-blue-700">
                                    Interview Enquiry
                                </span>

                                <span className="text-sm font-bold text-gray-500">
                                    {Math.min(questionStep, 5)} / 5
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-5 sm:p-7">
                        {/* BASIC DETAILS */}
                        {!started && (
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={handleNameChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        className={`w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 ${
                                            formData.full_name && !nameIsValid
                                                ? "border-red-400 focus:ring-red-100"
                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                    />

                                    {formData.full_name && !nameIsValid && (
                                        <p className="mt-1 text-sm text-red-600">
                                            Please enter a valid name.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">
                                        WhatsApp Number *
                                    </label>

                                    <input
                                        type="tel"
                                        value={formData.whatsapp_number}
                                        onChange={handlePhoneChange}
                                        placeholder="Enter 10-digit WhatsApp Number"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        maxLength={10}
                                        className={`w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 ${
                                            formData.whatsapp_number && !phoneIsValid
                                                ? "border-red-400 focus:ring-red-100"
                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                    />

                                    {formData.whatsapp_number && !phoneIsValid && (
                                        <p className="mt-1 text-sm text-red-600">
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
                                    disabled={!basicDetailsValid || checkingDuplicate}
                                    onClick={startForm}
                                    className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition ${
                                        basicDetailsValid && !checkingDuplicate
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "cursor-not-allowed bg-gray-300"
                                    }`}
                                >
                                    {checkingDuplicate
                                        ? "Checking Your Details..."
                                        : "Continue →"}
                                </button>
                            </div>
                        )}

                        {/* QUESTIONS */}
                        {started && (
                            <div>
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="mb-5 text-sm font-semibold text-gray-600 hover:text-blue-600"
                                >
                                    ← Back
                                </button>

                                {questionStep <= 5 && currentQuestion && (
                                    <div>
                                        <h2 className="mb-5 text-lg font-semibold leading-snug text-gray-800 sm:text-xl">
                                            {currentQuestion.title} *
                                        </h2>

                                        <div className="space-y-2">
                                            {currentQuestion.options.map((option) => (
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
                                                        formData[currentQuestion.field] === option
                                                    )}
                                                >
                                                    <span className="mr-3 text-blue-600">
                                                        {formData[currentQuestion.field] === option
                                                            ? "◉"
                                                            : "○"}
                                                    </span>
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* FINAL SUBMIT */}
                                {questionStep === 6 && (
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            All Questions Completed
                                        </h2>

                                        <p className="mt-2 text-sm text-gray-600">
                                            Submit your details to arrange your Free Demo Class.
                                        </p>

                                        <div className="mt-5 space-y-3 rounded-xl bg-blue-50 p-4 text-left">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Full Name
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {formatName(formData.full_name)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Education
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {formData.education}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Career Status
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {formData.career_status}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Preferred Demo Time
                                                </p>
                                                <p className="font-semibold text-blue-700">
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
                                            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {submitting
                                                ? "Submitting..."
                                                : "Submit Enquiry →"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </form>
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
