import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Spoken English Classes near Aurobindo Hospital Indore | English Club",
  description:
    "English Club offers spoken English classes near Aurobindo Hospital, Indore with exact Google Maps location. Ideal for students, professionals and job-seekers. Since 2010. Call 9713014234.",
};

export default function AurobindoHospitalPage() {
  return (
    <main className="px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes near Aurobindo Hospital, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute located near
        Aurobindo Hospital, Indore. Our practical, speaking-focused training
        helps students, job-seekers and working professionals improve their
        English fluency, confidence and communication skills. Serving learners
        successfully since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar with Daily Speaking Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Why Choose English Club near Aurobindo Hospital?
      </h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Convenient location near hospital area</li>
        <li>Experienced and supportive trainers</li>
        <li>Small batches with personal attention</li>
        <li>Affordable course fees</li>
        <li>Trusted institute since 2010</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Aurobindo Hospital Area Branch
      </h2>
      <p className="mb-4 text-gray-700">
        📍 Near Aurobindo Hospital, Indore  
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
        src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d14718.964637760524!2d75.88825034999999!3d22.7378602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x396303b75af59373%3A0xc2f255d82b1e4738!2sEnglish%20Club%20Computer%20G%20Aurobindo%20Branch%2C%20Joggers%20Pk%20Rd%2C%20247%20premium%20park%2C%20near%20Arvindo%20Hospital%2C%20247%2C%20Sanwer%20Rd%2C%20near%20Bhangiya%20and%20Kalindi%20Gold%20City%2C%20Premium%20Park%20Colony%2C%20Jakhya%2C%20Indore%2C%20Madhya%20Pradesh%20453555!3m2!1d22.798720199999998!2d75.8557239!5e0!3m2!1sen!2sin!4v1769752997977!5m2!1sen!2sin"
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
