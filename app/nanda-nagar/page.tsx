import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Nanda Nagar Indore | English Club",
  description:
    "Join English Club Nanda Nagar, Indore for spoken English classes. Morning & evening batches, daily speaking practice, experienced trainer, notes & real classroom learning. Since 2010. Call 9713014234.",
};

export default function NandaNagarPage() {
  return (
    <main className="px-4 py-10 max-w-5xl mx-auto">

      {/* HERO */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes in Nanda Nagar, Indore
      </h1>

      <p className="text-gray-700 mb-8">
        English Club is a trusted spoken English institute in Nanda Nagar,
        Indore. We help students, job-seekers and professionals speak English
        confidently through daily speaking practice and practical training.
        Serving students since <strong>2010</strong>.
      </p>

      {/* 🔔 ANNOUNCEMENT */}
      <section className="mb-10">
        <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-1">
            🎉 New Spoken English Batches Starting
          </h2>
          <p className="text-gray-700 text-sm mb-3">
            Morning & Evening batches available. Limited seats.
          </p>
          <a
            href="https://wa.me/919713014234"
            className="inline-block bg-green-600 text-white px-5 py-2 rounded-xl text-sm"
          >
            Enquire on WhatsApp
          </a>
        </div>
      </section>

      {/* ⚡ QUICK INFO */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          ⏰
          <p className="font-semibold mt-1">Flexible Timings</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          👩‍🏫
          <p className="font-semibold mt-1">Experienced Trainer</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          🎤
          <p className="font-semibold mt-1">Daily Speaking</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          📍
          <p className="font-semibold mt-1">Nanda Nagar</p>
        </div>
      </section>

      {/* COURSES */}
      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-8 text-gray-700">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar for Speaking</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      {/* ⏰ BATCH TIMINGS */}
      <h2 className="text-xl font-semibold mb-4">Batch Timings</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {["8:00 AM", "9:00 AM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"].map(
          (time) => (
            <div
              key={time}
              className="bg-white border rounded-xl p-3 text-center"
            >
              {time}
            </div>
          )
        )}
      </div>

      {/* 📘 SYLLABUS */}
      <h2 className="text-xl font-semibold mb-2">What You Will Learn</h2>
      <ul className="list-disc ml-6 mb-10 text-gray-700">
        <li>Daily sentence speaking practice</li>
        <li>Grammar for correct English speaking</li>
        <li>Pronunciation & confidence building</li>
        <li>Interview answers & job communication</li>
      </ul>

      {/* 👩‍🏫 TRAINER */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Meet Your Trainer
        </h2>
        <div className="flex flex-col items-center">
          <img
            src="/nanda-nagar/teacher.jpg"
            alt="English Trainer - Nanda Nagar"
            className="w-32 h-32 rounded-full object-cover mb-3"
          />
          <p className="font-semibold">Senior English Trainer</p>
          <p className="text-sm text-gray-600">
            8+ years experience | Trained 1000+ students
          </p>
        </div>
      </section>

      {/* 🖼️ GALLERY */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Nanda Nagar Classroom Gallery
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <img
              key={i}
              src={`/nanda-nagar/gallery-${i}.jpg`}
              alt={`English Club Nanda Nagar class ${i}`}
              className="rounded-xl object-cover h-32 w-full"
            />
          ))}
        </div>
      </section>

      {/* 📥 NOTES DOWNLOAD */}
      <section className="mb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">
            📘 Download Sample Spoken English Notes
          </h2>
          <a
            href="/nanda-nagar/notes-spoken-english.pdf"
            download
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm"
          >
            Download PDF
          </a>
        </div>
      </section>

      {/* ⭐ REVIEWS (UNCHANGED – TRUST) */}
      <section className="py-10">
        <h2 className="text-xl font-bold text-center mb-6">
          What Students Say – Nanda Nagar
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              img: "/nanda-nagar/review-1.jpg",
              name: "Riya",
              text:
                "English bolne ka confidence aa gaya. Daily speaking practice se kaafi improvement hui.",
            },
            {
              img: "/nanda-nagar/review-2.jpg",
              name: "Aman",
              text:
                "Teachers bahut supportive hain aur environment friendly hai.",
            },
            {
              img: "/nanda-nagar/review-3.jpg",
              name: "Neha",
              text:
                "Interview preparation ke liye best jagah. Highly recommended.",
            },
          ].map((r, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={r.img}
                  alt={r.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-gray-500">Nanda Nagar Branch</p>
                </div>
              </div>
              <p className="text-yellow-500 text-sm mb-2">⭐⭐⭐⭐⭐</p>
              <p className="text-gray-700 text-sm">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📍 LOCATION */}
      <h2 className="text-xl font-semibold mb-2">
        Visit Our Nanda Nagar Branch
      </h2>
      <p className="mb-4 text-gray-700">
        📍 Nanda Nagar, Indore <br />
        📞 <a href="tel:9713014234" className="text-blue-600">9713014234</a>
      </p>

      <iframe
        src="https://www.google.com/maps?q=English+Club+Nanda+Nagar+Indore&output=embed"
        width="100%"
        height="320"
        loading="lazy"
        className="rounded-xl mb-6"
      ></iframe>

      {/* CTA */}
      <div className="flex gap-4 mb-10">
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
