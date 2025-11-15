import { createClient } from '@/utils/supabase/server'
import { logout } from './actions'
import { MemoriesTable } from '@/components/admin/memories-table'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Panel de Administración</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Solicitudes Pendientes</h2>
            <p className="text-gray-600">Revisa y gestiona las memorias pendientes de aprobación</p>
          </div>
          <MemoriesTable />
        </div>
      </main>
    </div>
  )
}
