
import { UserRole } from '../types';

export interface User {
  name: string;
  role: UserRole;
  department?: string;
}

export const MOCK_USER: User = {
  name: "Dr. Roberto Araújo",
  role: UserRole.MASTER,
  department: "Controladoria Geral"
};

export const hasPermission = (user: User, action: string): boolean => {
  if (user.role === UserRole.MASTER) return true;

  const permissions: Record<string, UserRole[]> = {
    'VIEW_AMENDMENTS': [UserRole.MASTER, UserRole.CONTROL, UserRole.GESTOR, UserRole.LEGAL],
    'EDIT_LEGISLATION': [UserRole.MASTER, UserRole.LEGAL, UserRole.CONTROL],
    'APPROVE_ACCOUNTABILITY': [UserRole.MASTER, UserRole.CONTROL, UserRole.TECH_FINANCIAL],
    'RELEASE_TRANCHE': [UserRole.MASTER, UserRole.CONTROL, UserRole.GESTOR],
    'CREATE_PARTNERSHIP': [UserRole.MASTER, UserRole.GESTOR, UserRole.LEGAL],
    'SUBMIT_DOCUMENTS': [UserRole.OSC_LEGAL, UserRole.OSC_USER],
    'CREATE_CHAMAMENTO': [UserRole.MASTER, UserRole.SELECTION_COMMISSION, UserRole.GESTOR],
    'VIEW_AUDIT_LOGS': [UserRole.MASTER, UserRole.CONTROL],
    'MANAGE_USERS': [UserRole.MASTER],
    'EDIT_WORKPLAN': [UserRole.MASTER, UserRole.GESTOR, UserRole.OSC_LEGAL]
  };

  return permissions[action]?.includes(user.role) ?? false;
};

export const getAccessibleRoutes = (role: UserRole): string[] => {
  if (role === UserRole.MASTER) return ['all'];

  const mapping: Record<UserRole, string[]> = {
    [UserRole.CONTROL]: ['/', '/accountability', '/oscs', '/reports', '/legislation', '/logs', '/manual', '/communication'],
    [UserRole.GESTOR]: ['/', '/amendments', '/pmis', '/chamamento', '/partnerships', '/accountability', '/reports', '/manual', '/communication'],
    [UserRole.LEGAL]: ['/', '/partnerships', '/legislation', '/communication', '/manual'],
    [UserRole.SELECTION_COMMISSION]: ['/', '/chamamento', '/pmis', '/manual'],
    [UserRole.MONITORING_COMMISSION]: ['/', '/partnerships', '/accountability', '/manual'],
    [UserRole.OSC_LEGAL]: ['/', '/partnerships', '/accountability', '/communication', '/oscs', '/manual'],
    [UserRole.OSC_USER]: ['/', '/partnerships', '/accountability', '/communication', '/manual'],
    [UserRole.TECH_PHYSICAL]: ['/', '/partnerships', '/accountability'],
    [UserRole.TECH_FINANCIAL]: ['/', '/partnerships', '/accountability', '/reports'],
    [UserRole.COUNCILS]: ['/', '/partnerships', '/reports', '/transparency'],
    [UserRole.MASTER]: ['all']
  };

  return mapping[role] || ['/'];
};
