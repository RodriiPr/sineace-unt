import { Rol } from '@prisma/client'

// Definimos los permisos disponibles en el sistema
export type Permission =
  | 'indicador:read'
  | 'indicador:create'
  | 'indicador:update'
  | 'indicador:delete'
  | 'indicador:calcular'
  | 'indicador:exportar'
  | 'acreditacion:read'
  | 'acreditacion:create'
  | 'acreditacion:update'
  | 'acreditacion:delete'
  | 'alerta:read'
  | 'alerta:atender'
  | 'reporte:generar'
  | 'carrera:create'
  | 'carrera:update'
  | 'carrera:delete'
  | 'facultad:create'
  | 'facultad:update'
  | 'facultad:delete'

// Matriz RBAC (Role-Based Access Control)
export const PERMISSIONS: Record<Permission, Rol[]> = {
  // Módulo de Indicadores SINEACE
  'indicador:read': [
    Rol.SUPERADMIN,
    Rol.VICERRECTOR,
    Rol.DECANO,
    Rol.COORDINADOR_CALIDAD,
    Rol.EVALUADOR_EXTERNO,
  ],
  'indicador:create': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'indicador:update': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'indicador:delete': [Rol.SUPERADMIN],
  'indicador:calcular': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'indicador:exportar': [
    Rol.SUPERADMIN,
    Rol.VICERRECTOR,
    Rol.DECANO,
    Rol.COORDINADOR_CALIDAD,
  ],

  // Módulo de Acreditaciones
  'acreditacion:read': [
    Rol.SUPERADMIN,
    Rol.VICERRECTOR,
    Rol.DECANO,
    Rol.COORDINADOR_CALIDAD,
    Rol.EVALUADOR_EXTERNO,
  ],
  'acreditacion:create': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'acreditacion:update': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'acreditacion:delete': [Rol.SUPERADMIN],

  // Alertas
  'alerta:read': [
    Rol.SUPERADMIN,
    Rol.VICERRECTOR,
    Rol.DECANO,
    Rol.COORDINADOR_CALIDAD,
  ],
  'alerta:atender': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],

  // Reportes
  'reporte:generar': [
    Rol.SUPERADMIN,
    Rol.VICERRECTOR,
    Rol.DECANO,
    Rol.COORDINADOR_CALIDAD,
    Rol.EVALUADOR_EXTERNO,
  ],

  // Catálogo (Carreras y Facultades)
  'carrera:create': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'carrera:update': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'carrera:delete': [Rol.SUPERADMIN],
  'facultad:create': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'facultad:update': [Rol.SUPERADMIN, Rol.COORDINADOR_CALIDAD],
  'facultad:delete': [Rol.SUPERADMIN],
}

// Función helper para verificar permisos
export function hasPermission(userRole: Rol, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(userRole)
}
