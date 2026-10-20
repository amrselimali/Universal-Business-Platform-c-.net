export interface AppSettings {
  id: string;
  company_name: string;
  logo_url?: string | null;
  default_language: 'ar' | 'en';
  date_format: string;
  time_format: string;
  number_format: string;
  session_timeout_minutes: number;
  password_min_length: number;
  max_failed_attempts: number;
  lockout_minutes: number;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Branch {
  id: string;
  code: string;
  name_ar: string;
  name_en?: string | null;
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
  custom_fields: Record<string, unknown>;
  search_text?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface BranchInput {
  code: string;
  name_ar: string;
  name_en?: string | null;
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
  custom_fields?: Record<string, unknown>;
}

export interface Warehouse {
  id: string;
  code: string;
  name_ar: string;
  name_en?: string | null;
  is_active: boolean;
  custom_fields: Record<string, unknown>;
  branch_ids: string[];
  search_text?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface WarehouseInput {
  code: string;
  name_ar: string;
  name_en?: string | null;
  is_active: boolean;
  custom_fields?: Record<string, unknown>;
  branch_ids: string[];
}

export interface Currency {
  id: string;
  currency_code: string;
  name_ar: string;
  name_en?: string | null;
  symbol?: string | null;
  decimals: number;
  is_base: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CurrencyInput {
  currency_code: string;
  name_ar: string;
  name_en?: string | null;
  symbol?: string | null;
  decimals: number;
  is_base: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  entity_name: 'branches' | 'warehouses' | string;
  field_key: string;
  label_ar: string;
  label_en?: string | null;
  data_type: 'text' | 'number' | 'date' | 'bool' | 'list';
  options: string[];
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CustomFieldInput {
  entity_name: string;
  field_key: string;
  label_ar: string;
  label_en?: string | null;
  data_type: 'text' | 'number' | 'date' | 'bool' | 'list';
  options: string[];
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface PermissionEntry {
  screen_code: string;
  action_code: string;
  is_allowed: boolean;
  scope: number; // 0 = Own, 1 = Branches, 2 = All
}

export interface Role {
  id: string;
  code: string;
  name_ar: string;
  name_en?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  permissions?: PermissionEntry[];
}

export interface RoleInput {
  code: string;
  name_ar: string;
  name_en?: string | null;
  is_active: boolean;
  permissions: PermissionEntry[];
}

export interface User {
  id: string;
  name?: string | null;
  username: string;
  password_hash: string;
  is_active: boolean;
  language: 'ar' | 'en';
  is_admin: boolean;
  is_super_admin: boolean;
  failed_attempts: number;
  locked_until?: string | null;
  last_login_at?: string | null;
  search_text?: string;
  created_at: string;
  updated_at: string;
  version: number;
  branch_ids: string[];
  default_branch_id?: string | null;
  warehouse_ids: string[];
  role_ids: string[];
  permissions?: PermissionEntry[];
}

export interface UserListItem {
  id: string;
  name?: string | null;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  is_locked: boolean;
  last_login_at?: string | null;
  created_at: string;
  version: number;
  branch_count: number;
  warehouse_count: number;
  role_names: string[];
  search_text?: string;
}

export interface UserInput {
  name?: string | null;
  username: string;
  password?: string;
  is_active: boolean;
  language: 'ar' | 'en';
  is_admin: boolean;
  is_super_admin: boolean;
  branch_ids: string[];
  default_branch_id?: string | null;
  warehouse_ids: string[];
  role_ids: string[];
}

export type AuditAction =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PERMISSION_CHANGE'
  | 'PASSWORD_RESET'
  | 'MIGRATION';

export interface AuditEntry {
  id: number;
  user_id?: string | null;
  username?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  table_name: string;
  record_id: string;
  action: AuditAction | string;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  ip_address?: string | null;
  trace_id?: string | null;
  created_at: string;
}

export interface AuditFilter {
  from?: string;
  to?: string;
  user_id?: string;
  branch_id?: string;
  table_name?: string;
  action?: string;
  limit?: number;
}

export interface QaTestDefinition {
  code: string;
  name_ar: string;
  name_en: string;
  category: 'Security' | 'Database' | string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

export interface QaTestResult {
  test_code: string;
  status: 'Passed' | 'Failed' | 'Error';
  duration_ms: number;
  message?: string;
  trace_id?: string;
}

export interface QaRunSummary {
  id: string;
  environment: string;
  code_revision: string;
  status: 'Completed' | 'Failed';
  total_count: number;
  passed_count: number;
  failed_count: number;
  trace_id?: string;
  started_at: string;
  finished_at?: string;
  results?: QaTestResult[];
}

export interface QaMatrixRow {
  definition: QaTestDefinition;
  status: 'Untested' | 'Passed' | 'Failed' | 'Error';
  last_run_at?: string | null;
}

export interface TableInfo {
  name: string;
  rows_count: number;
  columns_count: number;
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
}

export interface RowPage {
  table: string;
  total_rows: number;
  page: number;
  page_size: number;
  rows: Record<string, unknown>[];
  columns: ColumnInfo[];
}

export interface DatabaseStatus {
  connected: boolean;
  server: string;
  database: string;
  user: string;
  error?: string | null;
  tables: TableInfo[];
  applied: string[];
  pending: string[];
}

export interface MigrationOutcome {
  Success: boolean;
  Error?: string | null;
  Executed: string[];
}

export interface ActorContext {
  user_id: string;
  username: string;
  display_name: string;
  is_admin: boolean;
  is_super_admin: boolean;
  language: 'ar' | 'en';
  current_branch_id?: string | null;
  allowed_branch_ids: string[];
  trace_id: string;
}

export const ScreenCodes = {
  Dashboard: 'DASHBOARD',
  SettingsGeneral: 'SETTINGS_GENERAL',
  Branches: 'BRANCHES',
  Warehouses: 'WAREHOUSES',
  Currencies: 'CURRENCIES',
  CustomFields: 'CUSTOM_FIELDS',
  Users: 'USERS',
  Roles: 'ROLES',
  AuditLog: 'AUDIT_LOG',
  DatabaseAdmin: 'DATABASE_ADMIN',
  QaCenter: 'QA_CENTER',
} as const;

export const ActionCodes = {
  View: 'VIEW',
  Add: 'ADD',
  Edit: 'EDIT',
  Delete: 'DELETE',
  ToggleActive: 'TOGGLE_ACTIVE',
  LinkBranches: 'LINK_BRANCHES',
  ManageBranches: 'MANAGE_BRANCHES',
  ManageWarehouses: 'MANAGE_WAREHOUSES',
  ManageRoles: 'MANAGE_ROLES',
  ManagePermissions: 'MANAGE_PERMISSIONS',
  ResetPassword: 'RESET_PASSWORD',
  Unlock: 'UNLOCK',
  RunMigrations: 'RUN_MIGRATIONS',
  EditRows: 'EDIT_ROWS',
  RunTests: 'RUN_TESTS',
} as const;

export const PermissionScope = {
  Own: 0,
  Branches: 1,
  All: 2,
  normalize(val: number): number {
    return val >= 0 && val <= 2 ? val : 1;
  },
  max(a: number, b: number): number {
    return this.normalize(a) >= this.normalize(b) ? this.normalize(a) : this.normalize(b);
  },
};

export interface ScreenAction {
  code: string;
  title_key: string;
}

export interface ScreenDefinition {
  code: string;
  route: string;
  icon: string;
  title_key: string;
  group_key: string;
  actions: ScreenAction[];
}

export const AppRegistryScreens: ScreenDefinition[] = [
  {
    code: ScreenCodes.Dashboard,
    route: '/',
    icon: 'LayoutDashboard',
    title_key: 'screen.dashboard',
    group_key: 'group.main',
    actions: [{ code: ActionCodes.View, title_key: 'action.view' }],
  },
  {
    code: ScreenCodes.SettingsGeneral,
    route: '/settings/general',
    icon: 'Sliders',
    title_key: 'screen.settings_general',
    group_key: 'group.definitions',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
    ],
  },
  {
    code: ScreenCodes.Branches,
    route: '/settings/branches',
    icon: 'GitFork',
    title_key: 'screen.branches',
    group_key: 'group.definitions',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Add, title_key: 'action.add' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
      { code: ActionCodes.Delete, title_key: 'action.delete' },
      { code: ActionCodes.ToggleActive, title_key: 'action.toggle_active' },
    ],
  },
  {
    code: ScreenCodes.Warehouses,
    route: '/settings/warehouses',
    icon: 'Warehouse',
    title_key: 'screen.warehouses',
    group_key: 'group.definitions',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Add, title_key: 'action.add' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
      { code: ActionCodes.Delete, title_key: 'action.delete' },
      { code: ActionCodes.ToggleActive, title_key: 'action.toggle_active' },
      { code: ActionCodes.LinkBranches, title_key: 'action.link_branches' },
    ],
  },
  {
    code: ScreenCodes.Currencies,
    route: '/settings/currencies',
    icon: 'Coins',
    title_key: 'screen.currencies',
    group_key: 'group.definitions',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Add, title_key: 'action.add' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
      { code: ActionCodes.Delete, title_key: 'action.delete' },
    ],
  },
  {
    code: ScreenCodes.CustomFields,
    route: '/settings/custom-fields',
    icon: 'SlidersHorizontal',
    title_key: 'screen.custom_fields',
    group_key: 'group.definitions',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Add, title_key: 'action.add' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
      { code: ActionCodes.Delete, title_key: 'action.delete' },
    ],
  },
  {
    code: ScreenCodes.Users,
    route: '/users',
    icon: 'Users',
    title_key: 'screen.users',
    group_key: 'group.security',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Add, title_key: 'action.add' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
      { code: ActionCodes.Delete, title_key: 'action.delete' },
      { code: ActionCodes.ManageBranches, title_key: 'action.manage_branches' },
      { code: ActionCodes.ManageWarehouses, title_key: 'action.manage_warehouses' },
      { code: ActionCodes.ManageRoles, title_key: 'action.manage_roles' },
      { code: ActionCodes.ManagePermissions, title_key: 'action.manage_permissions' },
      { code: ActionCodes.ResetPassword, title_key: 'action.reset_password' },
      { code: ActionCodes.Unlock, title_key: 'action.unlock' },
    ],
  },
  {
    code: ScreenCodes.Roles,
    route: '/roles',
    icon: 'ShieldCheck',
    title_key: 'screen.roles',
    group_key: 'group.security',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.Add, title_key: 'action.add' },
      { code: ActionCodes.Edit, title_key: 'action.edit' },
      { code: ActionCodes.Delete, title_key: 'action.delete' },
      { code: ActionCodes.ManagePermissions, title_key: 'action.manage_permissions' },
    ],
  },
  {
    code: ScreenCodes.AuditLog,
    route: '/audit',
    icon: 'History',
    title_key: 'screen.audit',
    group_key: 'group.security',
    actions: [{ code: ActionCodes.View, title_key: 'action.view' }],
  },
  {
    code: ScreenCodes.QaCenter,
    route: '/qa',
    icon: 'FlaskConical',
    title_key: 'screen.qa',
    group_key: 'group.system',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.RunTests, title_key: 'action.run_tests' },
    ],
  },
  {
    code: ScreenCodes.DatabaseAdmin,
    route: '/admin/database',
    icon: 'Database',
    title_key: 'screen.database_admin',
    group_key: 'group.system',
    actions: [
      { code: ActionCodes.View, title_key: 'action.view' },
      { code: ActionCodes.RunMigrations, title_key: 'action.run_migrations' },
      { code: ActionCodes.EditRows, title_key: 'action.edit_rows' },
    ],
  },
];
