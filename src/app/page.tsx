export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-center mb-12">
        Sistema de Gestión
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="border border-gray-300 rounded-lg p-8 flex items-center justify-center min-h-[400px] bg-gray-50">
          <p className="text-xl text-gray-600">Aquí va el libro</p>
        </div>

        <div className="border border-gray-300 rounded-lg p-8 flex items-center justify-center min-h-[400px] bg-gray-50">
          <p className="text-xl text-gray-600">Aquí la subida de archivo</p>
        </div>
      </div>
    </div>
  );
}
