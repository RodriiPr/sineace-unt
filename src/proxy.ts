import { auth } from '@/lib/auth'

export default auth

export const config = {
  // Configuración del matcher para aplicar el middleware
  // Ignora _next/static, _next/image, favicon.ico, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
