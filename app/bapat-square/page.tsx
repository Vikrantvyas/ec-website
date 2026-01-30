import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Bapat Square Indore | English Club",
  description:
    "English Club offers spoken English classes in Bapat Square, Indore with exact location on Google Maps. Improve fluency, confidence and communication skills. Since 2010. Call 9713014234.",
};

export default function BapatSquarePage() {
  return (
    <main className="px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes in Bapat Square, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute near Bapat Square,
        Indore. We help students, job-seekers, teachers and working professionals
        speak English confidently through daily speaking practice and practical
        training. Serving students successfully since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar with Speaking Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Why Choose English Club – Bapat Square?
      </h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Experienced and supportive trainers</li>
        <li>Daily speaking & confidence-building activities</li>
        <li>Small batches with personal attention</li>
        <li>Affordable fees</li>
        <li>Trusted institute since 2010</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Bapat Square Branch
      </h2>
      <p className="mb-4 text-gray-700">
        📍 Near Bapat Square, Indore  
        <br />
        📞{" "}
        <a href="tel:9713014234" className="text-blue-600 font-medium">
          9713014234
        </a>{" "}
        <br />
        💬 WhatsApp Available
      </p>

      {/* Exact Google Map – Real Location */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m26!1m12!1m3!1d14718.12769074311!2d75.87230185271746!3d22.745632869898493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m11!3e6!4m3!3m2!1d22.7378602!2d75.8882503!4m5!1s0x3963031a839efe51%3A0xe35ceb2dca18f457!2sEnglish%20Club%20-%20Sukhliya%20Best%20Spoken%20English%20classes%20in%20Indore%2C%20Water%20Tank%2C%20AM-181%20Main%20Road%2C%20Near%2C%20Bapat%20Square%2C%20opp.%20New%2C%20Sukhliya%2C%20Indore%2C%20Madhya%20Pradesh%20452010!3m2!1d22.7549416!2d75.8762407!5e0!3m2!1sen!2sin!4v1769752837625!5m2!1sen!2sin"
        width="100%"
        height="320"
        loading="lazy"
        className="rounded-xl mb-6"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      <div className="flex gap-4">
        <a
          href="tel:9713014234"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Call Now
        </a>

        <a
          href="https://wa.me/919713014234"
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          WhatsApp Now
        </a>
      </div>
    </main>
  );
}
