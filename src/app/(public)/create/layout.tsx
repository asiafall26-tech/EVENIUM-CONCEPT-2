export default function CreateEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-serif text-gray-900">Création de votre événement</h2>
          <p className="mt-2 text-sm text-gray-600">
            Laissez-vous guider étape par étape.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
