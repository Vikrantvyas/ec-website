export default function TrustSection() {
  return (
    <section className="py-10 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8">
        Trusted by Learners in Indore
      </h2>

      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
            ⏱️
          </div>
          <p className="text-2xl font-bold">15+</p>
          <p className="text-sm text-gray-600">Years Experience</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl">
            👥
          </div>
          <p className="text-2xl font-bold">1000s</p>
          <p className="text-sm text-gray-600">Students Trained</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
            🏫
          </div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm text-gray-600">Branches in Indore</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
            🎤
          </div>
          <p className="text-2xl font-bold">Daily</p>
          <p className="text-sm text-gray-600">Speaking Practice</p>
        </div>
      </div>
    </section>
  );
}
