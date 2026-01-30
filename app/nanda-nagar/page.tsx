import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Nanda Nagar Indore | English Club",
  description:
    "English Club offers spoken English and personality development classes in Nanda Nagar, Indore. Exact location, daily speaking practice, and experienced trainers. Since 2010. Call 9713014234.",
};

export default function NandaNagarPage() {
  return (
    <main className="px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes in Nanda Nagar, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute located in
        Nanda Nagar, Indore. We help students, job-seekers, and professionals
        improve their English fluency, confidence, and communication skills
        through practical training and daily speaking practice. Serving
        students since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar & Sentence Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Nanda Nagar Branch
      </h2>
      <p className="mb-4 text-gray-700">
        📍 Nanda Nagar, Indore  
        <br />
        📞{" "}
        <a href="tel:9713014234" className="text-blue-600 font-medium">
          9713014234
        </a>{" "}
        <br />
        💬 WhatsApp available
      </p>

      {/* Exact Google Map – Real Location */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d29432.469728363794!2d75.84927061541217!3d22.763202152135715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x396302f83c75f507%3A0x9882efd61834e42f!2sPremium%20Park%20Rd%2C%20Sanwer%20Road%20Industrial%20Area%2C%20Indore%2C%20Madhya%20Pradesh%20453555%2C%20India!3m2!1d22.783957899999997!2d75.8556423!4m5!1s0x3962fd707ec2ca33%3A0x7e2bc9aa52c3162!2sEnglish%20Club%20-%20Best%20Spoken%20English%20classes%20in%20Indore%2C%20Bhamori%20Road%2C%20Astha%20Talkies%20Rd%2C%20opp.%20Anop%20Talkies%2C%20near%20shani%20temple%2C%20Patnipura%2C%20Nanda%20Nagar%2C%20Indore%2C%20Madhya%20Pradesh%20452011!3m2!1d22.7437667!2d75.8841039!5e0!3m2!1sen!2sin!4v1769752661537!5m2!1sen!2sin"
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
