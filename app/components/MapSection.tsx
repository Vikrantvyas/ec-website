export default function MapSection() {
  return (
    <section className="py-6 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-4">
        Visit English Club, Indore
      </h2>

      <div className="max-w-4xl mx-auto">
        <iframe
          src="https://www.google.com/maps?q=English+Club+Indore&output=embed"
          width="100%"
          height="300"
          loading="lazy"
          className="rounded-lg"
        ></iframe>

        <p className="text-center text-gray-600 mt-3">
          We have multiple branches across Indore.  
          Please select your nearest branch to view exact location details.
        </p>
      </div>
    </section>
  );
}
