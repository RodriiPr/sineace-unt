import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'Iniciar Sesión | SINEACE UNT',
}

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">SINEACE UNT</h1>
          <p className="text-slate-600">Sistema de Acreditación Universitaria</p>
          <div className="mt-4 inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            Modelo CONEAU 2025
          </div>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Credenciales de prueba:</p>
          <p className="font-mono mt-1 bg-slate-100 py-1 rounded">superadmin@unt.edu.pe / Sineace2025!</p>
        </div>
      </div>
    </div>
  )
}
