"use client";

import { useState } from "react";

type Props = {
  leadId: string | null;
};

export default function ChatBot({ leadId }: Props) {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">

        <div className="bg-white w-[90%] max-w-sm rounded-lg shadow-lg p-4 space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-center">
                Start Your Free Demo 🚀
              </h2>

              <p className="text-sm text-gray-600 text-center">
                Enter your WhatsApp number to continue
              </p>

              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full border px-3 py-2 rounded"
              />

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Next
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-center">
                Select Your Gender
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex flex-col items-center border p-3 rounded w-full"
                >
                  <span>Male</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="flex flex-col items-center border p-3 rounded w-full"
                >
                  <span>Female</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-center">
                🎉 Done!
              </h2>

              <button
                onClick={() => setShow(false)}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}