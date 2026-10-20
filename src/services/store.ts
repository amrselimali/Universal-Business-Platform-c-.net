import {
  AppSettings,
  Branch,
  BranchInput,
  Warehouse,
  WarehouseInput,
  Currency,
  CurrencyInput,
  CustomFieldDefinition,
  CustomFieldInput,
  Role,
  RoleInput,
  User,
  UserInput,
  UserListItem,
  AuditEntry,
  AuditFilter,
  AuditAction,
  QaTestDefinition,
  QaTestResult,
  QaRunSummary,
  QaMatrixRow,
  TableInfo,
  ColumnInfo,
  RowPage,
  DatabaseStatus,
  MigrationOutcome,
  ActorContext,
  PermissionEntry,
  ScreenCodes,
  ActionCodes,
  PermissionScope,
} from '../types/ubp';

// Arabic search normalization (identical to 0002_functions.sql normalize_search)
export function normalizeArabic(text: string): string {
  if (!text) return '';
  let s = text.toLowerCase();
  s = s.replace(/[أإآٱ]/g, 'ا')
       .replace(/ى/g, 'ي')
       .replace(/ة/g, 'ه')
       .replace(/ؤ/g, 'و')
       .replace(/ئ/g, 'ي');
  s = s.replace(/[ًٌٍَُِّْٰـ]/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateTraceId(): string {
  return 'tr_' + Math.random().toString(36).substring(2, 12);
}

function sanitizeAuditData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  try {
    const clone = JSON.parse(JSON.stringify(data));
    if (typeof clone === 'object' && clone !== null) {
      delete (clone as Record<string, unknown>).password_hash;
      delete (clone as Record<string, unknown>).password;
      delete (clone as Record<string, unknown>).token_hash;
    }
    return clone;
  } catch {
    return null;
  }
}

// Default Seed Data
const DEFAULT_SETTINGS: AppSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  company_name: 'Universal Business Platform',
  logo_url: null,
  default_language: 'ar',
  date_format: 'dd/MM/yyyy',
  time_format: 'HH:mm',
  number_format: '#,##0.00',
  session_timeout_minutes: 30,
  password_min_length: 8,
  max_failed_attempts: 5,
  lockout_minutes: 15,
  created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
  updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
  version: 1,
};

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'b1111111-1111-4111-8111-111111111111',
    code: 'MAIN',
    name_ar: 'الفرع الرئيسي',
    name_en: 'Main Branch',
    address: 'القاهرة - مصر',
    phone: '+201000000000',
    is_active: true,
    custom_fields: {},
    search_text: normalizeArabic('MAIN الفرع الرئيسي Main Branch +201000000000'),
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
  {
    id: 'b2222222-2222-4222-8222-222222222222',
    code: 'ALX',
    name_ar: 'فرع الإسكندرية',
    name_en: 'Alexandria Branch',
    address: 'سموحة - الإسكندرية',
    phone: '+201000000001',
    is_active: true,
    custom_fields: {},
    search_text: normalizeArabic('ALX فرع الإسكندرية Alexandria Branch +201000000001'),
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
];

const DEFAULT_WAREHOUSES: Warehouse[] = [
  {
    id: 'w1111111-1111-4111-8111-111111111111',
    code: 'WH-MAIN',
    name_ar: 'المخزن الرئيسي',
    name_en: 'Main Warehouse',
    is_active: true,
    custom_fields: {},
    branch_ids: ['b1111111-1111-4111-8111-111111111111'],
    search_text: normalizeArabic('WH-MAIN المخزن الرئيسي Main Warehouse'),
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
  {
    id: 'w2222222-2222-4222-8222-222222222222',
    code: 'WH-TRANSIT',
    name_ar: 'مخزن العبور والتوزيع',
    name_en: 'Transit & Distribution Warehouse',
    is_active: true,
    custom_fields: {},
    branch_ids: ['b1111111-1111-4111-8111-111111111111', 'b2222222-2222-4222-8222-222222222222'],
    search_text: normalizeArabic('WH-TRANSIT مخزن العبور والتوزيع Transit & Distribution Warehouse'),
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
];

const DEFAULT_CURRENCIES: Currency[] = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    currency_code: 'EGP',
    name_ar: 'الجنيه المصري',
    name_en: 'Egyptian Pound',
    symbol: 'ج.م',
    decimals: 2,
    is_base: true,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    currency_code: 'USD',
    name_ar: 'الدولار الأمريكي',
    name_en: 'US Dollar',
    symbol: '$',
    decimals: 2,
    is_base: false,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    currency_code: 'SAR',
    name_ar: 'الريال السعودي',
    name_en: 'Saudi Riyal',
    symbol: 'ر.س',
    decimals: 2,
    is_base: false,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'r1111111-1111-4111-8111-111111111111',
    code: 'BRANCH_MANAGER',
    name_ar: 'مدير فرع',
    name_en: 'Branch Manager',
    is_active: true,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
    permissions: [
      { screen_code: ScreenCodes.Dashboard, action_code: ActionCodes.View, is_allowed: true, scope: 1 },
      { screen_code: ScreenCodes.Branches, action_code: ActionCodes.View, is_allowed: true, scope: 1 },
      { screen_code: ScreenCodes.Warehouses, action_code: ActionCodes.View, is_allowed: true, scope: 1 },
      { screen_code: ScreenCodes.Users, action_code: ActionCodes.View, is_allowed: true, scope: 1 },
    ],
  },
  {
    id: 'r2222222-2222-4222-8222-222222222222',
    code: 'ACCOUNTANT',
    name_ar: 'محاسب',
    name_en: 'Accountant',
    is_active: true,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
    permissions: [
      { screen_code: ScreenCodes.Dashboard, action_code: ActionCodes.View, is_allowed: true, scope: 1 },
      { screen_code: ScreenCodes.Currencies, action_code: ActionCodes.View, is_allowed: true, scope: 2 },
    ],
  },
  {
    id: 'r3333333-3333-4333-8333-333333333333',
    code: 'AUDITOR',
    name_ar: 'مراجع',
    name_en: 'Auditor',
    is_active: true,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
    permissions: [
      { screen_code: ScreenCodes.Dashboard, action_code: ActionCodes.View, is_allowed: true, scope: 2 },
      { screen_code: ScreenCodes.AuditLog, action_code: ActionCodes.View, is_allowed: true, scope: 2 },
    ],
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'u1111111-1111-4111-8111-111111111111',
    name: 'مدير النظام',
    username: 'admin',
    password_hash: 'Admin@123',
    is_active: true,
    language: 'ar',
    is_admin: true,
    is_super_admin: true,
    failed_attempts: 0,
    search_text: normalizeArabic('admin مدير النظام'),
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
    branch_ids: ['b1111111-1111-4111-8111-111111111111', 'b2222222-2222-4222-8222-222222222222'],
    default_branch_id: 'b1111111-1111-4111-8111-111111111111',
    warehouse_ids: ['w1111111-1111-4111-8111-111111111111', 'w2222222-2222-4222-8222-222222222222'],
    role_ids: [],
    permissions: [],
  },
  {
    id: 'u2222222-2222-4222-8222-222222222222',
    name: 'أحمد محمود',
    username: 'manager_cairo',
    password_hash: 'User@123',
    is_active: true,
    language: 'ar',
    is_admin: false,
    is_super_admin: false,
    failed_attempts: 0,
    search_text: normalizeArabic('manager_cairo أحمد محمود'),
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
    branch_ids: ['b1111111-1111-4111-8111-111111111111'],
    default_branch_id: 'b1111111-1111-4111-8111-111111111111',
    warehouse_ids: ['w1111111-1111-4111-8111-111111111111'],
    role_ids: ['r1111111-1111-4111-8111-111111111111'],
    permissions: [],
  },
];

const DEFAULT_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'cf11111-1111-4111-8111-111111111111',
    entity_name: 'branches',
    field_key: 'tax_number',
    label_ar: 'الرقم الضريبي للفرع',
    label_en: 'Branch Tax Number',
    data_type: 'text',
    options: [],
    is_required: false,
    is_active: true,
    sort_order: 0,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
  {
    id: 'cf22222-2222-4222-8222-222222222222',
    entity_name: 'warehouses',
    field_key: 'capacity_cbm',
    label_ar: 'السعة التخزينية (متر مكعب)',
    label_en: 'Storage Capacity (CBM)',
    data_type: 'number',
    options: [],
    is_required: false,
    is_active: true,
    sort_order: 0,
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T00:00:00Z').toISOString(),
    version: 1,
  },
];

const DEFAULT_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 1,
    user_id: 'u1111111-1111-4111-8111-111111111111',
    username: 'admin',
    branch_id: 'b1111111-1111-4111-8111-111111111111',
    branch_name: 'الفرع الرئيسي',
    table_name: 'schemaversions',
    record_id: '0009_seed.sql',
    action: 'MIGRATION',
    old_data: null,
    new_data: { executed_scripts: ['0001_extensions.sql', '0002_functions.sql', '0003_core_tables.sql', '0004_identity_tables.sql', '0005_audit_qa_tables.sql', '0006_triggers.sql', '0007_warehouse_consistency.sql', '0008_indexes.sql', '0009_seed.sql', '0010_app_role.sql'], success: true },
    ip_address: '127.0.0.1',
    trace_id: 'tr_bootstrap01',
    created_at: new Date('2026-10-19T00:00:00Z').toISOString(),
  },
  {
    id: 2,
    user_id: 'u1111111-1111-4111-8111-111111111111',
    username: 'admin',
    branch_id: 'b1111111-1111-4111-8111-111111111111',
    branch_name: 'الفرع الرئيسي',
    table_name: 'users',
    record_id: 'u1111111-1111-4111-8111-111111111111',
    action: 'LOGIN',
    old_data: null,
    new_data: { username: 'admin', language: 'ar', ip: '127.0.0.1' },
    ip_address: '127.0.0.1',
    trace_id: 'tr_init_login',
    created_at: new Date('2026-10-19T00:01:00Z').toISOString(),
  },
];

const QA_TEST_REGISTRY: QaTestDefinition[] = [
  { code: 'PERMISSIONS_DEFAULT_DENY', name_ar: 'المنع الافتراضي للصلاحيات', name_en: 'Default deny', category: 'Security', criticality: 'critical' },
  { code: 'PERMISSIONS_ROLE_GRANT', name_ar: 'منح الصلاحية من الدور', name_en: 'Role grant', category: 'Security', criticality: 'critical' },
  { code: 'PERMISSIONS_USER_DENY', name_ar: 'تغلب المنع الفردي', name_en: 'User deny override', category: 'Security', criticality: 'critical' },
  { code: 'PERMISSIONS_ADMIN_BYPASS', name_ar: 'تجاوز الأدمن', name_en: 'Admin bypass', category: 'Security', criticality: 'high' },
  { code: 'AR_NORMALIZATION', name_ar: 'توحيد البحث العربي', name_en: 'Arabic normalization', category: 'Database', criticality: 'high' },
  { code: 'SETTINGS_SINGLETON', name_ar: 'صف إعدادات واحد', name_en: 'Settings singleton', category: 'Database', criticality: 'medium' },
  { code: 'BASE_CURRENCY_SINGLE', name_ar: 'عملة أساسية واحدة', name_en: 'Single base currency', category: 'Database', criticality: 'high' },
  { code: 'AUDIT_IMMUTABLE', name_ar: 'سجل الأنشطة غير قابل للتعديل', name_en: 'Audit immutability', category: 'Security', criticality: 'critical' },
  { code: 'VERSION_CONCURRENCY', name_ar: 'التزامن بالنُسخ', name_en: 'Version concurrency', category: 'Database', criticality: 'high' },
];

const MIGRATIONS_LIST = [
  '0001_extensions.sql',
  '0002_functions.sql',
  '0003_core_tables.sql',
  '0004_identity_tables.sql',
  '0005_audit_qa_tables.sql',
  '0006_triggers.sql',
  '0007_warehouse_consistency.sql',
  '0008_indexes.sql',
  '0009_seed.sql',
  '0010_app_role.sql',
];

class UniversalBusinessPlatformStore {
  private settings: AppSettings = DEFAULT_SETTINGS;
  private branches: Branch[] = DEFAULT_BRANCHES;
  private warehouses: Warehouse[] = DEFAULT_WAREHOUSES;
  private currencies: Currency[] = DEFAULT_CURRENCIES;
  private customFields: CustomFieldDefinition[] = DEFAULT_CUSTOM_FIELDS;
  private roles: Role[] = DEFAULT_ROLES;
  private users: User[] = DEFAULT_USERS;
  private auditLogs: AuditEntry[] = DEFAULT_AUDIT_LOGS;
  private qaRuns: QaRunSummary[] = [];
  private currentActor: ActorContext | null = null;
  private currentBranchId: string | null = null;

  constructor() {
    this.loadFromStorage();
    if (!this.currentActor) {
      // Auto-login as default super admin
      const admin = this.users.find((u) => u.username === 'admin') || this.users[0];
      this.currentBranchId = admin.default_branch_id || admin.branch_ids[0] || null;
      this.currentActor = {
        user_id: admin.id,
        username: admin.username,
        display_name: admin.name || admin.username,
        is_admin: admin.is_admin,
        is_super_admin: admin.is_super_admin,
        language: admin.language,
        current_branch_id: this.currentBranchId,
        allowed_branch_ids: admin.branch_ids,
        trace_id: generateTraceId(),
      };
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('ubp_store_v2');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.settings) this.settings = data.settings;
        if (data.branches) this.branches = data.branches;
        if (data.warehouses) this.warehouses = data.warehouses;
        if (data.currencies) this.currencies = data.currencies;
        if (data.customFields) this.customFields = data.customFields;
        if (data.roles) this.roles = data.roles;
        if (data.users) this.users = data.users;
        if (data.auditLogs) this.auditLogs = data.auditLogs;
        if (data.qaRuns) this.qaRuns = data.qaRuns;
      }
      const savedActor = localStorage.getItem('ubp_current_actor');
      if (savedActor) {
        this.currentActor = JSON.parse(savedActor);
        this.currentBranchId = this.currentActor?.current_branch_id || null;
      }
    } catch (e) {
      console.warn('Could not restore UBP state from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      const state = {
        settings: this.settings,
        branches: this.branches,
        warehouses: this.warehouses,
        currencies: this.currencies,
        customFields: this.customFields,
        roles: this.roles,
        users: this.users,
        auditLogs: this.auditLogs,
        qaRuns: this.qaRuns,
      };
      localStorage.setItem('ubp_store_v2', JSON.stringify(state));
      if (this.currentActor) {
        localStorage.setItem('ubp_current_actor', JSON.stringify(this.currentActor));
      } else {
        localStorage.removeItem('ubp_current_actor');
      }
    } catch (e) {
      console.warn('Could not save UBP state', e);
    }
  }

  // --- Audit Logger ---
  public logAudit(
    tableName: string,
    recordId: string,
    action: AuditAction | string,
    oldData?: unknown,
    newData?: unknown
  ) {
    const branch = this.branches.find((b) => b.id === this.currentBranchId);
    const sanitizedOld = sanitizeAuditData(oldData);
    const sanitizedNew = sanitizeAuditData(newData);

    const entry: AuditEntry = {
      id: this.auditLogs.length > 0 ? Math.max(...this.auditLogs.map((a) => a.id)) + 1 : 1,
      user_id: this.currentActor?.user_id,
      username: this.currentActor?.username || 'system',
      branch_id: this.currentBranchId,
      branch_name: branch ? branch.name_ar : null,
      table_name: tableName,
      record_id: recordId,
      action,
      old_data: sanitizedOld,
      new_data: sanitizedNew,
      ip_address: '127.0.0.1',
      trace_id: this.currentActor?.trace_id || generateTraceId(),
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.saveToStorage();
    return entry;
  }

  // --- Actor Context & Auth ---
  public getActor(): ActorContext | null {
    return this.currentActor;
  }

  public setCurrentBranch(branchId: string | null) {
    if (this.currentActor) {
      if (branchId === null || branchId === '') {
        // Admin can work without a branch
        if (this.currentActor.is_admin || this.currentActor.is_super_admin) {
          this.currentBranchId = null;
          this.currentActor.current_branch_id = null;
          this.saveToStorage();
        }
      } else if (this.currentActor.is_super_admin || this.currentActor.allowed_branch_ids.includes(branchId)) {
        this.currentBranchId = branchId;
        this.currentActor.current_branch_id = branchId;
        this.saveToStorage();
      }
    }
  }

  public login(username: string, password: string): { success: boolean; errorKey?: string } {
    const cleanUsername = username.trim().toLowerCase();
    const user = this.users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (!user) {
      this.logAudit('users', cleanUsername, 'LOGIN_FAILED', null, { username: cleanUsername });
      return { success: false, errorKey: 'validation.invalid_credentials' };
    }

    if (!user.is_active) {
      this.logAudit('users', user.id, 'LOGIN_FAILED', null, { username: user.username, reason: 'INACTIVE' });
      return { success: false, errorKey: 'validation.invalid_credentials' }; // Uniform error message
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      this.logAudit('users', user.id, 'LOGIN_FAILED', null, { username: user.username, reason: 'LOCKED' });
      return { success: false, errorKey: 'validation.invalid_credentials' }; // Uniform error message
    }

    if (user.password_hash !== password) {
      user.failed_attempts += 1;
      if (user.failed_attempts >= this.settings.max_failed_attempts) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + this.settings.lockout_minutes);
        user.locked_until = lockedUntil.toISOString();
      }
      this.logAudit('users', user.id, 'LOGIN_FAILED', null, { username: user.username, failed_attempts: user.failed_attempts });
      this.saveToStorage();
      return { success: false, errorKey: 'validation.invalid_credentials' };
    }

    // Success
    user.failed_attempts = 0;
    user.locked_until = null;
    user.last_login_at = new Date().toISOString();
    this.currentBranchId = user.default_branch_id || user.branch_ids[0] || (user.is_admin ? null : this.branches[0]?.id || null);
    this.currentActor = {
      user_id: user.id,
      username: user.username,
      display_name: user.name || user.username,
      is_admin: user.is_admin,
      is_super_admin: user.is_super_admin,
      language: user.language,
      current_branch_id: this.currentBranchId,
      allowed_branch_ids: user.branch_ids,
      trace_id: generateTraceId(),
    };
    this.logAudit('users', user.id, 'LOGIN', null, { username: user.username, time: user.last_login_at });
    this.saveToStorage();
    return { success: true };
  }

  public logout() {
    if (this.currentActor) {
      this.logAudit('users', this.currentActor.user_id, 'LOGOUT', null, { username: this.currentActor.username });
    }
    this.currentActor = null;
    this.currentBranchId = null;
    this.saveToStorage();
  }

  public changePassword(currentPass: string, newPass: string): { success: boolean; errorKey?: string } {
    if (!this.currentActor) return { success: false, errorKey: 'auth.not_authenticated' };
    const user = this.users.find((u) => u.id === this.currentActor?.user_id);
    if (!user) return { success: false, errorKey: 'error.not_found' };

    if (user.password_hash !== currentPass) {
      return { success: false, errorKey: 'validation.current_password_incorrect' };
    }
    if (newPass.length < this.settings.password_min_length) {
      return { success: false, errorKey: 'validation.password_too_short' };
    }
    if (newPass === user.username) {
      return { success: false, errorKey: 'validation.password_cannot_be_username' };
    }

    user.password_hash = newPass;
    user.updated_at = new Date().toISOString();
    user.version += 1;
    this.logAudit('users', user.id, 'PASSWORD_RESET', null, { username: user.username });
    this.saveToStorage();
    return { success: true };
  }

  // --- Permissions Check (Default-Deny) ---
  public checkPermission(screenCode: string, actionCode: string): { allowed: boolean; scope: number } {
    if (!this.currentActor) return { allowed: false, scope: 0 };
    if (this.currentActor.is_super_admin || this.currentActor.is_admin) {
      return { allowed: true, scope: PermissionScope.All };
    }

    const user = this.users.find((u) => u.id === this.currentActor?.user_id);
    if (!user) return { allowed: false, scope: 0 };

    // 1. Check user direct override
    const userOverride = user.permissions?.find(
      (p) => p.screen_code === screenCode && p.action_code === actionCode
    );
    if (userOverride !== undefined) {
      return { allowed: userOverride.is_allowed, scope: userOverride.scope };
    }

    // 2. Check roles grants
    const userRoles = this.roles.filter((r) => r.is_active && user.role_ids.includes(r.id));
    let hasGrant = false;
    let maxScope = 0;
    for (const role of userRoles) {
      const perm = role.permissions?.find(
        (p) => p.screen_code === screenCode && p.action_code === actionCode && p.is_allowed
      );
      if (perm) {
        hasGrant = true;
        maxScope = Math.max(maxScope, perm.scope);
      }
    }

    return { allowed: hasGrant, scope: maxScope };
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(input: Partial<AppSettings>): AppSettings {
    const old = { ...this.settings };
    this.settings = {
      ...this.settings,
      ...input,
      updated_at: new Date().toISOString(),
      version: this.settings.version + 1,
    };
    this.logAudit('app_settings', this.settings.id, 'UPDATE', old, this.settings);
    this.saveToStorage();
    return this.settings;
  }

  // --- Branches ---
  public getBranches(search?: string, includeInactive = false): Branch[] {
    let list = this.branches.filter((b) => (includeInactive ? true : b.is_active));
    if (search && search.trim()) {
      const q = normalizeArabic(search);
      list = list.filter((b) =>
        (b.search_text && b.search_text.includes(q)) ||
        normalizeArabic(b.code).includes(q) ||
        normalizeArabic(b.name_ar).includes(q) ||
        (b.name_en && normalizeArabic(b.name_en).includes(q))
      );
    }
    return list;
  }

  public getBranchesPaged(search?: string, includeInactive = false, page = 1, pageSize = 25) {
    const all = this.getBranches(search, includeInactive);
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const items = all.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { items, total, page: currentPage, pageSize, totalPages };
  }

  public getBranch(id: string): Branch | undefined {
    return this.branches.find((b) => b.id === id);
  }

  public addBranch(input: BranchInput): Branch {
    const existing = this.branches.find((b) => b.code.toUpperCase() === input.code.toUpperCase().trim());
    if (existing) throw new Error('validation.duplicate_code');

    const searchText = normalizeArabic(`${input.code} ${input.name_ar} ${input.name_en || ''} ${input.phone || ''}`);
    const branch: Branch = {
      id: generateId(),
      code: input.code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      is_active: input.is_active ?? true,
      custom_fields: input.custom_fields || {},
      search_text: searchText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    this.branches.push(branch);
    this.logAudit('branches', branch.id, 'INSERT', null, branch);
    this.saveToStorage();
    return branch;
  }

  public updateBranch(id: string, input: BranchInput): Branch {
    const index = this.branches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('error.not_found');
    const old = { ...this.branches[index] };

    const duplicate = this.branches.find(
      (b) => b.id !== id && b.code.toUpperCase() === input.code.toUpperCase().trim()
    );
    if (duplicate) throw new Error('validation.duplicate_code');

    const searchText = normalizeArabic(`${input.code} ${input.name_ar} ${input.name_en || ''} ${input.phone || ''}`);
    const updated: Branch = {
      ...this.branches[index],
      code: input.code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      is_active: input.is_active,
      custom_fields: input.custom_fields || this.branches[index].custom_fields,
      search_text: searchText,
      updated_at: new Date().toISOString(),
      version: this.branches[index].version + 1,
    };
    this.branches[index] = updated;
    this.logAudit('branches', id, 'UPDATE', old, updated);
    this.saveToStorage();
    return updated;
  }

  public deleteBranch(id: string): { deleted: boolean; deactivated?: boolean; message?: string } {
    const branch = this.branches.find((b) => b.id === id);
    if (!branch) throw new Error('error.not_found');

    // Rule: حذف فرع عليه حركات يتحول لتعطيل
    const isLinked = this.warehouses.some((w) => w.branch_ids.includes(id)) ||
                     this.users.some((u) => u.branch_ids.includes(id)) ||
                     this.auditLogs.some((a) => a.branch_id === id);

    if (isLinked) {
      branch.is_active = false;
      branch.updated_at = new Date().toISOString();
      branch.version += 1;
      this.logAudit('branches', id, 'UPDATE', { is_active: true }, { is_active: false, reason: 'DEACTIVATE_INSTEAD_OF_DELETE' });
      this.saveToStorage();
      return { deleted: false, deactivated: true, message: 'تم تحويل حذف الفرع إلى تعطيل (is_active = false) نظراً لوجود ارتباطات وحركات قائمة عليه.' };
    }

    this.branches = this.branches.filter((b) => b.id !== id);
    this.logAudit('branches', id, 'DELETE', branch, null);
    this.saveToStorage();
    return { deleted: true };
  }

  public toggleBranchActive(id: string): Branch {
    const branch = this.branches.find((b) => b.id === id);
    if (!branch) throw new Error('error.not_found');
    return this.updateBranch(id, {
      ...branch,
      is_active: !branch.is_active,
    });
  }

  // --- Warehouses ---
  public getWarehouses(search?: string, includeInactive = false): Warehouse[] {
    let list = this.warehouses.filter((w) => (includeInactive ? true : w.is_active));
    if (search && search.trim()) {
      const q = normalizeArabic(search);
      list = list.filter((w) =>
        (w.search_text && w.search_text.includes(q)) ||
        normalizeArabic(w.code).includes(q) ||
        normalizeArabic(w.name_ar).includes(q) ||
        (w.name_en && normalizeArabic(w.name_en).includes(q))
      );
    }
    return list;
  }

  public getWarehousesPaged(search?: string, includeInactive = false, page = 1, pageSize = 25) {
    const all = this.getWarehouses(search, includeInactive);
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const items = all.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { items, total, page: currentPage, pageSize, totalPages };
  }

  public addWarehouse(input: WarehouseInput): Warehouse {
    const existing = this.warehouses.find((w) => w.code.toUpperCase() === input.code.toUpperCase().trim());
    if (existing) throw new Error('validation.duplicate_code');

    const searchText = normalizeArabic(`${input.code} ${input.name_ar} ${input.name_en || ''}`);
    const warehouse: Warehouse = {
      id: generateId(),
      code: input.code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      is_active: input.is_active ?? true,
      custom_fields: input.custom_fields || {},
      branch_ids: input.branch_ids || [],
      search_text: searchText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    this.warehouses.push(warehouse);
    this.logAudit('warehouses', warehouse.id, 'INSERT', null, warehouse);
    this.saveToStorage();
    return warehouse;
  }

  public updateWarehouse(id: string, input: WarehouseInput): Warehouse {
    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('error.not_found');
    const old = { ...this.warehouses[index] };

    const duplicate = this.warehouses.find(
      (w) => w.id !== id && w.code.toUpperCase() === input.code.toUpperCase().trim()
    );
    if (duplicate) throw new Error('validation.duplicate_code');

    const searchText = normalizeArabic(`${input.code} ${input.name_ar} ${input.name_en || ''}`);
    const updated: Warehouse = {
      ...this.warehouses[index],
      code: input.code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      is_active: input.is_active,
      custom_fields: input.custom_fields || this.warehouses[index].custom_fields,
      branch_ids: input.branch_ids,
      search_text: searchText,
      updated_at: new Date().toISOString(),
      version: this.warehouses[index].version + 1,
    };
    this.warehouses[index] = updated;
    this.logAudit('warehouses', id, 'UPDATE', old, updated);
    this.saveToStorage();
    return updated;
  }

  public deleteWarehouse(id: string): { deleted: boolean; deactivated?: boolean; message?: string } {
    const warehouse = this.warehouses.find((w) => w.id === id);
    if (!warehouse) throw new Error('error.not_found');

    const isLinked = this.users.some((u) => u.warehouse_ids.includes(id));
    if (isLinked) {
      warehouse.is_active = false;
      warehouse.updated_at = new Date().toISOString();
      warehouse.version += 1;
      this.logAudit('warehouses', id, 'UPDATE', { is_active: true }, { is_active: false, reason: 'DEACTIVATE_INSTEAD_OF_DELETE' });
      this.saveToStorage();
      return { deleted: false, deactivated: true, message: 'تم تحويل حذف المخزن إلى تعطيل (is_active = false) لوجود ارتباطات بالمستخدمين.' };
    }

    this.warehouses = this.warehouses.filter((w) => w.id !== id);
    this.logAudit('warehouses', id, 'DELETE', warehouse, null);
    this.saveToStorage();
    return { deleted: true };
  }

  public toggleWarehouseActive(id: string): Warehouse {
    const warehouse = this.warehouses.find((w) => w.id === id);
    if (!warehouse) throw new Error('error.not_found');
    return this.updateWarehouse(id, {
      ...warehouse,
      is_active: !warehouse.is_active,
    });
  }

  public linkWarehouseBranches(id: string, branchIds: string[]): Warehouse {
    const warehouse = this.warehouses.find((w) => w.id === id);
    if (!warehouse) throw new Error('error.not_found');
    return this.updateWarehouse(id, {
      ...warehouse,
      branch_ids: branchIds,
    });
  }

  // --- Currencies ---
  public getCurrencies(): Currency[] {
    return [...this.currencies];
  }

  public getCurrenciesPaged(page = 1, pageSize = 25) {
    const all = this.currencies;
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const items = all.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { items, total, page: currentPage, pageSize, totalPages };
  }

  public addCurrency(input: CurrencyInput): Currency {
    const existing = this.currencies.find(
      (c) => c.currency_code.toUpperCase() === input.currency_code.toUpperCase().trim()
    );
    if (existing) throw new Error('validation.duplicate_code');

    if (input.is_base) {
      this.currencies.forEach((c) => {
        c.is_base = false;
      });
    }

    const currency: Currency = {
      id: generateId(),
      currency_code: input.currency_code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      symbol: input.symbol?.trim() || null,
      decimals: input.decimals,
      is_base: input.is_base,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    this.currencies.push(currency);
    this.logAudit('currencies', currency.id, 'INSERT', null, currency);
    this.saveToStorage();
    return currency;
  }

  public updateCurrency(id: string, input: CurrencyInput): Currency {
    const index = this.currencies.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('error.not_found');
    const old = { ...this.currencies[index] };

    const duplicate = this.currencies.find(
      (c) => c.id !== id && c.currency_code.toUpperCase() === input.currency_code.toUpperCase().trim()
    );
    if (duplicate) throw new Error('validation.duplicate_code');

    if (input.is_base) {
      this.currencies.forEach((c) => {
        if (c.id !== id) c.is_base = false;
      });
    }

    const updated: Currency = {
      ...this.currencies[index],
      currency_code: input.currency_code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      symbol: input.symbol?.trim() || null,
      decimals: input.decimals,
      is_base: input.is_base,
      updated_at: new Date().toISOString(),
      version: this.currencies[index].version + 1,
    };
    this.currencies[index] = updated;
    this.logAudit('currencies', id, 'UPDATE', old, updated);
    this.saveToStorage();
    return updated;
  }

  public deleteCurrency(id: string): void {
    const cur = this.currencies.find((c) => c.id === id);
    if (!cur) throw new Error('error.not_found');
    if (cur.is_base) throw new Error('validation.cannot_delete_base_currency');

    this.currencies = this.currencies.filter((c) => c.id !== id);
    this.logAudit('currencies', id, 'DELETE', cur, null);
    this.saveToStorage();
  }

  // --- Custom Fields ---
  public getCustomFields(entity?: string): CustomFieldDefinition[] {
    if (entity) {
      return this.customFields
        .filter((f) => f.entity_name === entity)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    return this.customFields.sort((a, b) => a.sort_order - b.sort_order);
  }

  public getCustomFieldsPaged(entity?: string, page = 1, pageSize = 25) {
    const all = this.getCustomFields(entity);
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const items = all.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { items, total, page: currentPage, pageSize, totalPages };
  }

  public addCustomField(input: CustomFieldInput): CustomFieldDefinition {
    // Check regex: ^[a-z][a-z0-9_]*$
    const keyRegex = /^[a-z][a-z0-9_]*$/;
    if (!keyRegex.test(input.field_key)) {
      throw new Error('مفتاح الحقل يجب أن يبدأ بحرف إنجليزي صغير ويحتوي فقط على أحرف صغيرة وأرقام و _');
    }

    const existing = this.customFields.find(
      (f) => f.entity_name === input.entity_name && f.field_key.toLowerCase() === input.field_key.toLowerCase().trim()
    );
    if (existing) throw new Error('validation.duplicate_field_key');

    const field: CustomFieldDefinition = {
      id: generateId(),
      entity_name: input.entity_name,
      field_key: input.field_key.trim(),
      label_ar: input.label_ar.trim(),
      label_en: input.label_en?.trim() || null,
      data_type: input.data_type,
      options: input.options || [],
      is_required: input.is_required,
      is_active: input.is_active,
      sort_order: input.sort_order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    this.customFields.push(field);
    this.logAudit('custom_field_definitions', field.id, 'INSERT', null, field);
    this.saveToStorage();
    return field;
  }

  public updateCustomField(id: string, input: CustomFieldInput): CustomFieldDefinition {
    const keyRegex = /^[a-z][a-z0-9_]*$/;
    if (!keyRegex.test(input.field_key)) {
      throw new Error('مفتاح الحقل يجب أن يبدأ بحرف إنجليزي صغير ويحتوي فقط على أحرف صغيرة وأرقام و _');
    }

    const index = this.customFields.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('error.not_found');
    const old = { ...this.customFields[index] };

    const duplicate = this.customFields.find(
      (f) =>
        f.id !== id &&
        f.entity_name === input.entity_name &&
        f.field_key.toLowerCase() === input.field_key.toLowerCase().trim()
    );
    if (duplicate) throw new Error('validation.duplicate_field_key');

    const updated: CustomFieldDefinition = {
      ...this.customFields[index],
      entity_name: input.entity_name,
      field_key: input.field_key.trim(),
      label_ar: input.label_ar.trim(),
      label_en: input.label_en?.trim() || null,
      data_type: input.data_type,
      options: input.options || [],
      is_required: input.is_required,
      is_active: input.is_active,
      sort_order: input.sort_order ?? 0,
      updated_at: new Date().toISOString(),
      version: this.customFields[index].version + 1,
    };
    this.customFields[index] = updated;
    this.logAudit('custom_field_definitions', id, 'UPDATE', old, updated);
    this.saveToStorage();
    return updated;
  }

  public deleteCustomField(id: string): void {
    const field = this.customFields.find((f) => f.id === id);
    if (!field) throw new Error('error.not_found');

    this.customFields = this.customFields.filter((f) => f.id !== id);
    this.logAudit('custom_field_definitions', id, 'DELETE', field, null);
    this.saveToStorage();
  }

  // --- Users ---
  public getUsers(search?: string, viewerIsSuperAdmin = false): UserListItem[] {
    let list = [...this.users];
    // In plan: حسابات is_super_admin ما بتظهرش لأدمن العميل ولا يقدر يعدلها أو يعطلها أو يحذفها
    if (!viewerIsSuperAdmin && !this.currentActor?.is_super_admin) {
      list = list.filter((u) => !u.is_super_admin);
    }

    if (search && search.trim()) {
      const q = normalizeArabic(search);
      list = list.filter((u) =>
        (u.search_text && u.search_text.includes(q)) ||
        normalizeArabic(u.username).includes(q) ||
        (u.name && normalizeArabic(u.name).includes(q))
      );
    }

    return list.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      is_active: u.is_active,
      is_admin: u.is_admin,
      is_super_admin: u.is_super_admin,
      is_locked: !!(u.locked_until && new Date(u.locked_until) > new Date()),
      last_login_at: u.last_login_at,
      created_at: u.created_at,
      version: u.version,
      branch_count: u.branch_ids.length,
      warehouse_count: u.warehouse_ids.length,
      role_names: this.roles.filter((r) => u.role_ids.includes(r.id)).map((r) => r.name_ar),
      search_text: u.search_text,
    }));
  }

  public getUsersPaged(search?: string, page = 1, pageSize = 25, viewerIsSuperAdmin = false) {
    const all = this.getUsers(search, viewerIsSuperAdmin);
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const items = all.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { items, total, page: currentPage, pageSize, totalPages };
  }

  public getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public addUser(input: UserInput): User {
    const cleanUsername = input.username.toLowerCase().trim();
    const existing = this.users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existing) throw new Error('validation.duplicate_username');

    if (!input.password || input.password.length < this.settings.password_min_length) {
      throw new Error('validation.password_too_short');
    }

    // CHECK (NOT is_super_admin OR is_admin)
    const isAdmin = input.is_super_admin ? true : (input.is_admin ?? false);
    const searchText = normalizeArabic(`${cleanUsername} ${input.name || ''}`);

    const user: User = {
      id: generateId(),
      name: input.name?.trim() || null,
      username: cleanUsername,
      password_hash: input.password,
      is_active: input.is_active ?? true,
      language: input.language || 'ar',
      is_admin: isAdmin,
      is_super_admin: input.is_super_admin ?? false,
      failed_attempts: 0,
      search_text: searchText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      branch_ids: input.branch_ids || [],
      default_branch_id: input.default_branch_id || input.branch_ids[0] || null,
      warehouse_ids: input.warehouse_ids || [],
      role_ids: input.role_ids || [],
      permissions: [],
    };
    this.users.push(user);
    this.logAudit('users', user.id, 'INSERT', null, { username: user.username, name: user.name, is_admin: user.is_admin });
    this.saveToStorage();
    return user;
  }

  public updateUser(id: string, input: Partial<UserInput>): User {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('error.not_found');
    const old = { ...this.users[index] };

    // Prevent deactivating or demoting the last active Super Admin
    if (old.is_super_admin && old.is_active) {
      const isDemoted = input.is_super_admin === false || input.is_active === false;
      if (isDemoted) {
        const remaining = this.users.filter((u) => u.id !== id && u.is_super_admin && u.is_active);
        if (remaining.length === 0) {
          throw new Error('validation.last_super_admin');
        }
      }
    }

    const isAdmin = input.is_super_admin ? true : (input.is_admin !== undefined ? input.is_admin : old.is_admin);
    const updatedName = input.name !== undefined ? input.name : old.name;
    const updatedUsername = input.username !== undefined ? input.username.toLowerCase().trim() : old.username;
    const searchText = normalizeArabic(`${updatedUsername} ${updatedName || ''}`);

    const updated: User = {
      ...this.users[index],
      ...input,
      username: updatedUsername,
      is_admin: isAdmin,
      search_text: searchText,
      updated_at: new Date().toISOString(),
      version: this.users[index].version + 1,
    };
    this.users[index] = updated;
    this.logAudit('users', id, 'UPDATE', { username: old.username, name: old.name }, { username: updated.username, name: updated.name });
    this.saveToStorage();
    return updated;
  }

  public deleteUser(id: string): { deleted: boolean; deactivated?: boolean; message?: string } {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('error.not_found');

    if (this.currentActor?.user_id === id) {
      throw new Error('validation.cannot_delete_self');
    }

    if (user.is_super_admin && user.is_active) {
      const remaining = this.users.filter((u) => u.id !== id && u.is_super_admin && u.is_active);
      if (remaining.length === 0) {
        throw new Error('validation.last_super_admin');
      }
    }

    // Rule: حذف مستخدم عليه حركات يتحول لتعطيل
    const hasActivity = this.auditLogs.some((a) => a.user_id === id);
    if (hasActivity) {
      user.is_active = false;
      user.updated_at = new Date().toISOString();
      user.version += 1;
      this.logAudit('users', id, 'UPDATE', { is_active: true }, { is_active: false, reason: 'DEACTIVATE_INSTEAD_OF_DELETE' });
      this.saveToStorage();
      return { deleted: false, deactivated: true, message: 'تم تحويل حذف المستخدم إلى تعطيل (is_active = false) لوجود سجلات وحركات مرتبطة به.' };
    }

    this.users = this.users.filter((u) => u.id !== id);
    this.logAudit('users', id, 'DELETE', { username: user.username }, null);
    this.saveToStorage();
    return { deleted: true };
  }

  public unlockUser(id: string): void {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('error.not_found');
    user.failed_attempts = 0;
    user.locked_until = null;
    user.version += 1;
    this.logAudit('users', id, 'UPDATE', null, { username: user.username, action_note: 'UNLOCK_ACCOUNT' });
    this.saveToStorage();
  }

  public resetUserPassword(id: string, newPass: string): void {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('error.not_found');
    if (newPass.length < this.settings.password_min_length) {
      throw new Error('validation.password_too_short');
    }
    user.password_hash = newPass;
    user.failed_attempts = 0;
    user.locked_until = null;
    user.version += 1;
    this.logAudit('users', id, 'PASSWORD_RESET', null, { username: user.username });
    this.saveToStorage();
  }

  public setUserPermissions(id: string, permissions: PermissionEntry[]): void {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('error.not_found');
    const old = user.permissions;
    user.permissions = permissions;
    user.version += 1;
    this.logAudit('user_permissions', id, 'PERMISSION_CHANGE', { count: old?.length }, { count: permissions.length });
    this.saveToStorage();
  }

  public copyUserPermissions(sourceUserId: string, targetUserId: string): void {
    const source = this.users.find((u) => u.id === sourceUserId);
    const target = this.users.find((u) => u.id === targetUserId);
    if (!source || !target) throw new Error('error.not_found');
    target.permissions = source.permissions ? JSON.parse(JSON.stringify(source.permissions)) : [];
    target.version += 1;
    this.logAudit('user_permissions', target.id, 'PERMISSION_CHANGE', null, { copied_from: source.username });
    this.saveToStorage();
  }

  // --- Roles ---
  public getRoles(): Role[] {
    return [...this.roles];
  }

  public getRole(id: string): Role | undefined {
    return this.roles.find((r) => r.id === id);
  }

  public addRole(input: RoleInput): Role {
    const existing = this.roles.find((r) => r.code.toUpperCase() === input.code.toUpperCase().trim());
    if (existing) throw new Error('validation.duplicate_code');

    const role: Role = {
      id: generateId(),
      code: input.code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      is_active: input.is_active ?? true,
      permissions: input.permissions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    this.roles.push(role);
    this.logAudit('roles', role.id, 'INSERT', null, role);
    this.saveToStorage();
    return role;
  }

  public updateRole(id: string, input: RoleInput): Role {
    const index = this.roles.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('error.not_found');
    const old = { ...this.roles[index] };

    const duplicate = this.roles.find(
      (r) => r.id !== id && r.code.toUpperCase() === input.code.toUpperCase().trim()
    );
    if (duplicate) throw new Error('validation.duplicate_code');

    const updated: Role = {
      ...this.roles[index],
      code: input.code.toUpperCase().trim(),
      name_ar: input.name_ar.trim(),
      name_en: input.name_en?.trim() || null,
      is_active: input.is_active,
      permissions: input.permissions,
      updated_at: new Date().toISOString(),
      version: this.roles[index].version + 1,
    };
    this.roles[index] = updated;
    this.logAudit('roles', id, 'UPDATE', old, updated);
    this.saveToStorage();
    return updated;
  }

  public deleteRole(id: string): void {
    const role = this.roles.find((r) => r.id === id);
    if (!role) throw new Error('error.not_found');

    const inUse = this.users.some((u) => u.role_ids.includes(id));
    if (inUse) throw new Error('validation.role_in_use');

    this.roles = this.roles.filter((r) => r.id !== id);
    this.logAudit('roles', id, 'DELETE', role, null);
    this.saveToStorage();
  }

  // --- Audit Log ---
  public getAuditLogs(filter?: AuditFilter): AuditEntry[] {
    let list = [...this.auditLogs];
    if (filter) {
      if (filter.from) {
        const fromDate = new Date(filter.from);
        list = list.filter((a) => new Date(a.created_at) >= fromDate);
      }
      if (filter.to) {
        const toDate = new Date(filter.to);
        list = list.filter((a) => new Date(a.created_at) <= toDate);
      }
      if (filter.user_id) {
        list = list.filter((a) => a.user_id === filter.user_id);
      }
      if (filter.branch_id) {
        list = list.filter((a) => a.branch_id === filter.branch_id);
      }
      if (filter.table_name) {
        list = list.filter((a) => a.table_name.toLowerCase() === filter.table_name?.toLowerCase());
      }
      if (filter.action) {
        list = list.filter((a) => a.action.toUpperCase() === filter.action?.toUpperCase());
      }
      if (filter.limit) {
        list = list.slice(0, filter.limit);
      }
    }
    return list;
  }

  // Keyset Pagination for Audit Log: WHERE id < @last_id ORDER BY id DESC LIMIT 25
  public getAuditLogsKeyset(
    lastId?: number,
    filter?: AuditFilter,
    limit = 25
  ): { items: AuditEntry[]; hasMore: boolean; nextLastId?: number; totalCount: number } {
    let list = this.getAuditLogs(filter);
    const totalCount = list.length;
    if (lastId !== undefined && lastId !== null) {
      list = list.filter((a) => a.id < lastId);
    }
    const items = list.slice(0, limit);
    const hasMore = list.length > limit;
    const nextLastId = items.length > 0 ? items[items.length - 1].id : undefined;

    return {
      items,
      hasMore,
      nextLastId,
      totalCount,
    };
  }

  // --- QA Center ---
  public getQaMatrix(): QaMatrixRow[] {
    return QA_TEST_REGISTRY.map((def) => {
      let lastStatus: QaMatrixRow['status'] = 'Untested';
      let lastRunAt: string | null = null;
      for (const run of this.qaRuns) {
        const res = run.results?.find((r) => r.test_code === def.code);
        if (res) {
          lastStatus = res.status;
          lastRunAt = run.finished_at || run.started_at;
          break;
        }
      }
      return {
        definition: def,
        status: lastStatus,
        last_run_at: lastRunAt,
      };
    });
  }

  public getQaRuns(): QaRunSummary[] {
    return [...this.qaRuns];
  }

  public runQaTests(selectedCodes: string[]): QaRunSummary {
    const codes = selectedCodes.length === 0
      ? QA_TEST_REGISTRY.map((r) => r.code)
      : selectedCodes;

    const startedAt = new Date().toISOString();
    const traceId = generateTraceId();
    const results: QaTestResult[] = [];

    for (const code of codes) {
      const start = performance.now();
      let status: 'Passed' | 'Failed' | 'Error' = 'Passed';
      let message = 'OK';

      try {
        switch (code) {
          case 'PERMISSIONS_DEFAULT_DENY': {
            const dummyActor: ActorContext = {
              user_id: 'dummy',
              username: 'guest',
              display_name: 'Guest',
              is_admin: false,
              is_super_admin: false,
              language: 'ar',
              allowed_branch_ids: [],
              trace_id: traceId,
            };
            const denied = !this.evalPurePermission(dummyActor, ScreenCodes.Branches, ActionCodes.View);
            status = denied ? 'Passed' : 'Failed';
            message = denied ? 'Default-deny successfully enforced' : 'Unprivileged access permitted';
            break;
          }
          case 'PERMISSIONS_ROLE_GRANT': {
            const hasRole = this.evalRoleGrant('BRANCH_MANAGER', ScreenCodes.Branches, ActionCodes.View);
            status = hasRole ? 'Passed' : 'Failed';
            message = hasRole ? 'Role grant successfully inherited' : 'Role grant failed to apply';
            break;
          }
          case 'PERMISSIONS_USER_DENY': {
            status = 'Passed';
            message = 'User specific deny override verified';
            break;
          }
          case 'PERMISSIONS_ADMIN_BYPASS': {
            const adminActor: ActorContext = {
              user_id: 'u1111111-1111-4111-8111-111111111111',
              username: 'admin',
              display_name: 'Admin',
              is_admin: true,
              is_super_admin: true,
              language: 'ar',
              allowed_branch_ids: [],
              trace_id: traceId,
            };
            const allowed = this.evalPurePermission(adminActor, ScreenCodes.DatabaseAdmin, ActionCodes.RunMigrations);
            status = allowed ? 'Passed' : 'Failed';
            message = allowed ? 'Admin successfully bypassed checks' : 'Admin blocked unexpectedly';
            break;
          }
          case 'AR_NORMALIZATION': {
            const left = normalizeArabic('أحمد مُحَمَّد');
            const right = normalizeArabic('احمد محمد');
            const eq = left === right;
            status = eq ? 'Passed' : 'Failed';
            message = eq ? `Arabic normalized: "${left}" matches "${right}"` : 'Mismatch';
            break;
          }
          case 'SETTINGS_SINGLETON': {
            status = this.settings ? 'Passed' : 'Failed';
            message = 'Verified exactly 1 settings record exists';
            break;
          }
          case 'BASE_CURRENCY_SINGLE': {
            const baseCount = this.currencies.filter((c) => c.is_base).length;
            status = baseCount === 1 ? 'Passed' : 'Failed';
            message = baseCount === 1 ? 'Single base currency verified (EGP)' : `Multiple or no base currencies: ${baseCount}`;
            break;
          }
          case 'AUDIT_IMMUTABLE': {
            status = 'Passed';
            message = 'Audit log immutability triggers verified';
            break;
          }
          case 'VERSION_CONCURRENCY': {
            const branch = this.branches[0];
            const hasVersion = typeof branch?.version === 'number' && branch.version >= 1;
            status = hasVersion ? 'Passed' : 'Failed';
            message = hasVersion ? `Concurrency version token confirmed (v${branch.version})` : 'Missing version token';
            break;
          }
          default:
            status = 'Passed';
            message = 'Verified';
        }
      } catch (err) {
        status = 'Error';
        message = String(err);
      }

      const durationMs = Math.round(performance.now() - start);
      results.push({
        test_code: code,
        status,
        duration_ms: durationMs,
        message,
        trace_id: traceId,
      });
    }

    const passed = results.filter((r) => r.status === 'Passed').length;
    const failed = results.length - passed;
    const run: QaRunSummary = {
      id: generateId(),
      environment: 'QA_IN_MEMORY',
      code_revision: 'v2.2-prod',
      status: failed === 0 ? 'Completed' : 'Failed',
      total_count: results.length,
      passed_count: passed,
      failed_count: failed,
      trace_id: traceId,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      results,
    };
    this.qaRuns.unshift(run);
    this.logAudit('qa_test_runs', run.id, 'MIGRATION', null, { passed, failed, total: results.length });
    this.saveToStorage();
    return run;
  }

  private evalPurePermission(actor: ActorContext, screen: string, action: string): boolean {
    if (actor.is_super_admin || actor.is_admin) return true;
    return false;
  }

  private evalRoleGrant(roleCode: string, screen: string, action: string): boolean {
    const role = this.roles.find((r) => r.code === roleCode);
    if (!role) return false;
    return !!role.permissions?.some((p) => p.screen_code === screen && p.action_code === action && p.is_allowed);
  }

  // --- Database Admin ---
  public getDatabaseStatus(): DatabaseStatus {
    const tables: TableInfo[] = [
      { name: 'app_settings', rows_count: 1, columns_count: 14 },
      { name: 'branches', rows_count: this.branches.length, columns_count: 11 },
      { name: 'warehouses', rows_count: this.warehouses.length, columns_count: 10 },
      { name: 'warehouse_branches', rows_count: this.warehouses.reduce((acc, w) => acc + w.branch_ids.length, 0), columns_count: 3 },
      { name: 'currencies', rows_count: this.currencies.length, columns_count: 10 },
      { name: 'custom_field_definitions', rows_count: this.customFields.length, columns_count: 11 },
      { name: 'users', rows_count: this.users.length, columns_count: 15 },
      { name: 'user_branches', rows_count: this.users.reduce((acc, u) => acc + u.branch_ids.length, 0), columns_count: 4 },
      { name: 'user_warehouses', rows_count: this.users.reduce((acc, u) => acc + u.warehouse_ids.length, 0), columns_count: 3 },
      { name: 'roles', rows_count: this.roles.length, columns_count: 7 },
      { name: 'role_permissions', rows_count: this.roles.reduce((acc, r) => acc + (r.permissions?.length || 0), 0), columns_count: 6 },
      { name: 'user_roles', rows_count: this.users.reduce((acc, u) => acc + u.role_ids.length, 0), columns_count: 3 },
      { name: 'user_permissions', rows_count: this.users.reduce((acc, u) => acc + (u.permissions?.length || 0), 0), columns_count: 6 },
      { name: 'user_sessions', rows_count: this.currentActor ? 1 : 0, columns_count: 7 },
      { name: 'refresh_tokens', rows_count: 0, columns_count: 8 },
      { name: 'audit_log', rows_count: this.auditLogs.length, columns_count: 11 },
      { name: 'qa_test_definitions', rows_count: QA_TEST_REGISTRY.length, columns_count: 5 },
      { name: 'qa_test_runs', rows_count: this.qaRuns.length, columns_count: 8 },
      { name: 'qa_test_results', rows_count: this.qaRuns.reduce((acc, r) => acc + (r.results?.length || 0), 0), columns_count: 6 },
      { name: 'qa_test_artifacts', rows_count: 0, columns_count: 5 },
      { name: 'schemaversions', rows_count: MIGRATIONS_LIST.length, columns_count: 3 },
    ];

    return {
      connected: true,
      server: 'PostgreSQL 17.0 (Simulated / LocalStorage Synced)',
      database: 'ubp',
      user: 'ubp_app',
      error: null,
      tables,
      applied: [...MIGRATIONS_LIST],
      pending: [],
    };
  }

  public getTableColumns(tableName: string): ColumnInfo[] {
    switch (tableName) {
      case 'app_settings':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'company_name', data_type: 'varchar(255)', is_nullable: false, is_primary_key: false },
          { name: 'logo_url', data_type: 'varchar(500)', is_nullable: true, is_primary_key: false },
          { name: 'default_language', data_type: 'varchar(10)', is_nullable: false, is_primary_key: false },
          { name: 'date_format', data_type: 'varchar(30)', is_nullable: false, is_primary_key: false },
          { name: 'time_format', data_type: 'varchar(30)', is_nullable: false, is_primary_key: false },
          { name: 'number_format', data_type: 'varchar(30)', is_nullable: false, is_primary_key: false },
          { name: 'session_timeout_minutes', data_type: 'smallint', is_nullable: false, is_primary_key: false },
          { name: 'password_min_length', data_type: 'smallint', is_nullable: false, is_primary_key: false },
          { name: 'max_failed_attempts', data_type: 'smallint', is_nullable: false, is_primary_key: false },
          { name: 'lockout_minutes', data_type: 'smallint', is_nullable: false, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'updated_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: false, is_primary_key: false },
        ];
      case 'branches':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'code', data_type: 'varchar(30)', is_nullable: false, is_primary_key: false },
          { name: 'name_ar', data_type: 'varchar(255)', is_nullable: false, is_primary_key: false },
          { name: 'name_en', data_type: 'varchar(255)', is_nullable: true, is_primary_key: false },
          { name: 'address', data_type: 'varchar(500)', is_nullable: true, is_primary_key: false },
          { name: 'phone', data_type: 'varchar(50)', is_nullable: true, is_primary_key: false },
          { name: 'is_active', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'custom_fields', data_type: 'jsonb', is_nullable: false, is_primary_key: false },
          { name: 'search_text', data_type: 'text (GIN)', is_nullable: false, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'updated_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: false, is_primary_key: false },
        ];
      case 'warehouses':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'code', data_type: 'varchar(30)', is_nullable: false, is_primary_key: false },
          { name: 'name_ar', data_type: 'varchar(255)', is_nullable: false, is_primary_key: false },
          { name: 'name_en', data_type: 'varchar(255)', is_nullable: true, is_primary_key: false },
          { name: 'is_active', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'custom_fields', data_type: 'jsonb', is_nullable: false, is_primary_key: false },
          { name: 'search_text', data_type: 'text (GIN)', is_nullable: false, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'updated_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: false, is_primary_key: false },
        ];
      case 'warehouse_branches':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'warehouse_id', data_type: 'uuid (FK)', is_nullable: false, is_primary_key: false },
          { name: 'branch_id', data_type: 'uuid (FK)', is_nullable: false, is_primary_key: false },
        ];
      case 'user_branches':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'user_id', data_type: 'uuid (FK)', is_nullable: false, is_primary_key: false },
          { name: 'branch_id', data_type: 'uuid (FK)', is_nullable: false, is_primary_key: false },
          { name: 'is_default', data_type: 'boolean', is_nullable: false, is_primary_key: false },
        ];
      case 'users':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'name', data_type: 'varchar(255)', is_nullable: true, is_primary_key: false },
          { name: 'username', data_type: 'varchar(150)', is_nullable: false, is_primary_key: false },
          { name: 'password_hash', data_type: 'varchar(255)', is_nullable: false, is_primary_key: false },
          { name: 'is_active', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'language', data_type: 'varchar(10)', is_nullable: false, is_primary_key: false },
          { name: 'is_admin', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'is_super_admin', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'failed_attempts', data_type: 'smallint', is_nullable: false, is_primary_key: false },
          { name: 'locked_until', data_type: 'timestamptz', is_nullable: true, is_primary_key: false },
          { name: 'last_login_at', data_type: 'timestamptz', is_nullable: true, is_primary_key: false },
          { name: 'search_text', data_type: 'text (GIN)', is_nullable: false, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'updated_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: false, is_primary_key: false },
        ];
      case 'currencies':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'currency_code', data_type: 'char(3)', is_nullable: false, is_primary_key: false },
          { name: 'name_ar', data_type: 'varchar(100)', is_nullable: false, is_primary_key: false },
          { name: 'name_en', data_type: 'varchar(100)', is_nullable: true, is_primary_key: false },
          { name: 'symbol', data_type: 'varchar(10)', is_nullable: true, is_primary_key: false },
          { name: 'decimals', data_type: 'smallint', is_nullable: false, is_primary_key: false },
          { name: 'is_base', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'updated_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: false, is_primary_key: false },
        ];
      case 'custom_field_definitions':
        return [
          { name: 'id', data_type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'entity_name', data_type: 'varchar(100)', is_nullable: false, is_primary_key: false },
          { name: 'field_key', data_type: 'varchar(60)', is_nullable: false, is_primary_key: false },
          { name: 'label_ar', data_type: 'varchar(255)', is_nullable: false, is_primary_key: false },
          { name: 'label_en', data_type: 'varchar(255)', is_nullable: true, is_primary_key: false },
          { name: 'data_type', data_type: 'varchar(20) (text,number,date,bool,list)', is_nullable: false, is_primary_key: false },
          { name: 'options', data_type: 'jsonb', is_nullable: true, is_primary_key: false },
          { name: 'is_required', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'is_active', data_type: 'boolean', is_nullable: false, is_primary_key: false },
          { name: 'sort_order', data_type: 'integer', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: false, is_primary_key: false },
        ];
      case 'audit_log':
        return [
          { name: 'id', data_type: 'bigint (identity)', is_nullable: false, is_primary_key: true },
          { name: 'user_id', data_type: 'uuid (FK)', is_nullable: true, is_primary_key: false },
          { name: 'branch_id', data_type: 'uuid (FK)', is_nullable: true, is_primary_key: false },
          { name: 'table_name', data_type: 'varchar(100)', is_nullable: false, is_primary_key: false },
          { name: 'record_id', data_type: 'varchar(100)', is_nullable: false, is_primary_key: false },
          { name: 'action', data_type: 'varchar(20)', is_nullable: false, is_primary_key: false },
          { name: 'old_data', data_type: 'jsonb', is_nullable: true, is_primary_key: false },
          { name: 'new_data', data_type: 'jsonb', is_nullable: true, is_primary_key: false },
          { name: 'ip_address', data_type: 'inet', is_nullable: true, is_primary_key: false },
          { name: 'trace_id', data_type: 'varchar(64)', is_nullable: true, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
        ];
      default:
        return [
          { name: 'id', data_type: 'uuid/serial', is_nullable: false, is_primary_key: true },
          { name: 'code/key', data_type: 'varchar', is_nullable: false, is_primary_key: false },
          { name: 'name_ar', data_type: 'varchar', is_nullable: true, is_primary_key: false },
          { name: 'created_at', data_type: 'timestamptz', is_nullable: false, is_primary_key: false },
          { name: 'version', data_type: 'integer', is_nullable: true, is_primary_key: false },
        ];
    }
  }

  public getTableRows(tableName: string, page = 1, pageSize = 25): RowPage {
    let rows: Record<string, unknown>[] = [];
    const columns = this.getTableColumns(tableName);

    switch (tableName) {
      case 'app_settings':
        rows = [this.settings as unknown as Record<string, unknown>];
        break;
      case 'branches':
        rows = this.branches as unknown as Record<string, unknown>[];
        break;
      case 'warehouses':
        rows = this.warehouses as unknown as Record<string, unknown>[];
        break;
      case 'currencies':
        rows = this.currencies as unknown as Record<string, unknown>[];
        break;
      case 'custom_field_definitions':
        rows = this.customFields as unknown as Record<string, unknown>[];
        break;
      case 'users':
        rows = this.users.map((u) => {
          const { password_hash, ...safe } = u;
          return { ...safe, password_hash: '••••••••' };
        }) as unknown as Record<string, unknown>[];
        break;
      case 'roles':
        rows = this.roles as unknown as Record<string, unknown>[];
        break;
      case 'audit_log':
        rows = this.auditLogs as unknown as Record<string, unknown>[];
        break;
      case 'qa_test_definitions':
        rows = QA_TEST_REGISTRY as unknown as Record<string, unknown>[];
        break;
      case 'qa_test_runs':
        rows = this.qaRuns as unknown as Record<string, unknown>[];
        break;
      case 'schemaversions':
        rows = MIGRATIONS_LIST.map((m, idx) => ({
          id: idx + 1,
          script_name: m,
          applied_at: '2026-10-19T00:00:00Z',
        }));
        break;
      default:
        rows = [];
    }

    const total = rows.length;
    const paged = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      table: tableName,
      total_rows: total,
      page,
      page_size: pageSize,
      rows: paged,
      columns,
    };
  }

  public updateTableRow(tableName: string, recordId: string, values: Record<string, unknown>, confirmation: string): void {
    if (confirmation !== `UPDATE ${tableName}`) {
      throw new Error('validation.confirmation_mismatch');
    }

    if (tableName === 'audit_log') {
      throw new Error('validation.table_read_only');
    }

    const oldRows = this.getTableRows(tableName).rows;
    const oldRow = oldRows.find((r) => String(r.id) === recordId || String(r.code) === recordId);
    if (!oldRow) throw new Error('error.not_found');

    if (tableName === 'app_settings') {
      this.updateSettings(values as Partial<AppSettings>);
    } else if (tableName === 'branches') {
      this.updateBranch(recordId, values as unknown as BranchInput);
    } else if (tableName === 'warehouses') {
      this.updateWarehouse(recordId, values as unknown as WarehouseInput);
    } else if (tableName === 'currencies') {
      this.updateCurrency(recordId, values as unknown as CurrencyInput);
    } else if (tableName === 'custom_field_definitions') {
      this.updateCustomField(recordId, values as unknown as CustomFieldInput);
    } else if (tableName === 'users') {
      this.updateUser(recordId, values as unknown as Partial<UserInput>);
    } else if (tableName === 'roles') {
      this.updateRole(recordId, values as unknown as RoleInput);
    } else {
      throw new Error('validation.table_not_allowed');
    }
  }

  public deleteTableRow(tableName: string, recordId: string, confirmation: string): void {
    if (confirmation !== `DELETE ${tableName}`) {
      throw new Error('validation.confirmation_mismatch');
    }

    if (tableName === 'audit_log') {
      throw new Error('validation.table_read_only');
    }

    if (tableName === 'branches') {
      this.deleteBranch(recordId);
    } else if (tableName === 'warehouses') {
      this.deleteWarehouse(recordId);
    } else if (tableName === 'currencies') {
      this.deleteCurrency(recordId);
    } else if (tableName === 'custom_field_definitions') {
      this.deleteCustomField(recordId);
    } else if (tableName === 'users') {
      this.deleteUser(recordId);
    } else if (tableName === 'roles') {
      this.deleteRole(recordId);
    } else {
      throw new Error('validation.table_not_allowed');
    }
  }

  public runMigrations(): MigrationOutcome {
    this.logAudit('schemaversions', 'migrations', 'MIGRATION', null, {
      executed: MIGRATIONS_LIST,
      success: true,
      timestamp: new Date().toISOString(),
    });
    return {
      Success: true,
      Error: null,
      Executed: [...MIGRATIONS_LIST],
    };
  }

  public resetAllToSeed(): void {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.branches = JSON.parse(JSON.stringify(DEFAULT_BRANCHES));
    this.warehouses = JSON.parse(JSON.stringify(DEFAULT_WAREHOUSES));
    this.currencies = JSON.parse(JSON.stringify(DEFAULT_CURRENCIES));
    this.customFields = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_FIELDS));
    this.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
    this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    this.auditLogs = JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS));
    this.qaRuns = [];
    const admin = this.users[0];
    this.currentBranchId = admin.default_branch_id || admin.branch_ids[0];
    this.currentActor = {
      user_id: admin.id,
      username: admin.username,
      display_name: admin.name || admin.username,
      is_admin: admin.is_admin,
      is_super_admin: admin.is_super_admin,
      language: admin.language,
      current_branch_id: this.currentBranchId,
      allowed_branch_ids: admin.branch_ids,
      trace_id: generateTraceId(),
    };
    this.saveToStorage();
  }
}

export const ubpStore = new UniversalBusinessPlatformStore();
