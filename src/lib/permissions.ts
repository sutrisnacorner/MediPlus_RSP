export const PERMISSIONS: Record<string, Record<string, string[]>> = {
  jadwal_dokter: {
    view: ['super_admin', 'admin', 'staff'],
    edit: ['super_admin', 'admin'],
    print: ['super_admin', 'admin', 'staff'],
  },
  notes: {
    view: ['super_admin', 'admin', 'staff'],
    edit: ['super_admin', 'admin'],
  },
  settings_users: {
    view: ['super_admin', 'admin'],
    edit: ['super_admin'],
  },
  settings_templates: {
    view: ['super_admin', 'admin'],
    edit: ['super_admin', 'admin'],
  },
  settings_doctors: {
    view: ['super_admin', 'admin'],
    edit: ['super_admin', 'admin'],
  },
  patient_status: {
    edit: ['super_admin', 'admin'],
  },
  whatsapp: {
    send: ['super_admin', 'admin'],
  },
  consultation_requests: {
    view: ['super_admin', 'admin', 'staff'],
    create: ['super_admin', 'admin', 'staff'],
  },
  cuti_dokter: {
    view: ['super_admin', 'admin', 'staff'],
  },
}

export function canView(resource: string, role: string): boolean {
  return PERMISSIONS[resource]?.view?.includes(role) ?? false
}

export function canEdit(resource: string, role: string): boolean {
  return PERMISSIONS[resource]?.edit?.includes(role) ?? false
}

export function canSend(resource: string, role: string): boolean {
  return PERMISSIONS[resource]?.send?.includes(role) ?? false
}

export function canPrint(resource: string, role: string): boolean {
  return PERMISSIONS[resource]?.print?.includes(role) ?? false
}

export function canCreate(resource: string, role: string): boolean {
  return PERMISSIONS[resource]?.create?.includes(role) ?? false
}
