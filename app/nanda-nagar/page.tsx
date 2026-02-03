import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Nanda Nagar Indore | English Club",
  description:
    "English Club Nanda Nagar offers spoken English classes with daily speaking practice, experienced trainer, flexible batch timings and real classroom learning. Since 2010. Call 9713014234.",
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
        Indore. We focus on daily speaking practice, correct grammar usage
        and confidence building. Helping students since <strong>2010</strong>.
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
        {[
          { icon: "⏰", text: "Flexible Timings" },
          { icon: "👩‍🏫", text: "Experienced Trainer" },
          { icon: "🎤", text: "Daily Speaking Practice" },
          { icon: "📍", text: "Nanda Nagar" },
        ].map((item) => (
          <div key={item.text} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-xl">{item.icon}</div>
            <p className="font-semibold mt-1 text-sm">{item.text}</p>
          </div>
        ))}
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
        {["8:00 AM","9:00 AM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"].map(
          (time) => (
            <div key={time} className="bg-white border rounded-xl p-3 text-center">
              {time}
            </div>
          )
        )}
      </div>

      {/* 📘 SYLLABUS */}
      <h2 className="text-xl font-semibold mb-2">What You Will Learn</h2>
      <ul className="list-disc ml-6 mb-10 text-gray-700">
        <li>Daily sentence speaking practice</li>
        <li>Grammar for correct spoken English</li>
        <li>Pronunciation & confidence building</li>
        <li>Interview answers & office communication</li>
      </ul>

      {/* 👩‍🏫 TRAINER – UPGRADED */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Meet Your Trainer
        </h2>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <img
            src="/nanda-nagar/teacher.jpg"
            alt="English Trainer Nanda Nagar"
            className="w-44 h-44 rounded-2xl object-cover"
          />

          <div>
            <h3 className="text-lg font-bold mb-1">
              Senior Spoken English Trainer
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              8+ years experience | Trained 1000+ students
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Specialised in teaching spoken English to Hindi-medium
              students. Focuses on daily speaking, correct sentence
              formation, pronunciation and interview confidence.
              Friendly teaching style with real-life examples.
            </p>
          </div>
        </div>
      </section>

      {/* 🖼️ GALLERY – REEL STYLE (HOME PAGE LIKE) */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Nanda Nagar Classroom Gallery
        </h2>

        <div className="gallery-track px-1">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div className="gallery-item" key={i}>
              <img
                src={`/nanda-nagar/gallery-${i}.jpg`}
                alt={`English Club Nanda Nagar class ${i}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 📥 NOTES */}
      <section className="mb-14">
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
        className="rounded-xl mb-4"
      ></iframe>

      <a
        href="https://www.google.com/maps/dir/?api=1&destination=English+Club+Nanda+Nagar+Indore"
        target="_blank"
        className="inline-block mb-10 bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        📍 Get Directions from your location
      </a>

      {/* CTA */}
      <div className="flex gap-4">
        <a href="tel:9713014234" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
          Call Now
        </a>
        <a href="https://wa.me/919713014234" className="bg-green-600 text-white px-6 py-3 rounded-xl">
          WhatsApp Now
        </a>
      </div>

      {/* GALLERY STYLES (same as home) */}
      <style>{`
        .gallery-track {
          display: flex;
          gap: 16px;
        }
        .gallery-item {
          flex-shrink: 0;
          width: 80%;
          height: 220px;
          border-radius: 16px;
          overflow: hidden;
          background: #f3f4f6;
        }
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @media (min-width: 769px) {
          .gallery-track {
            animation: scrollGallery 22s linear infinite;
          }
          .gallery-item {
            width: 260px;
            height: 160px;
          }
          @keyframes scrollGallery {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        }
        @media (max-width: 768px) {
          .gallery-track {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
          }
          .gallery-item {
            scroll-snap-align: start;
          }
          .gallery-track::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

    </main>
  );
}
