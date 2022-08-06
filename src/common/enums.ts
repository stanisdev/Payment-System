export enum UserTokenType {
    ACCESS = 'Access',
    REFRESH = 'Refresh',
}

export enum UserAction {
    LOGIN = 'Login',
    LOGOUT = 'Logout',
    CREATE = 'Create',
    CHANGE = 'Change',
    REMOVE = 'Remove',
    CONFIRM_EMAIL = 'ConfirmEmail',
    RESTORE_PASSWORD_INITIATE = 'RestoreRasswordInitiate',
    RESTORE_PASSWORD_COMPLETE = 'RestorePasswordComplete',
}

export enum Currency {
    US_DOLLAR = 1,
    EURO = 2,
    GOLD = 3,
    BITCOIN = 4,
}

export enum LoggerTemplate {
    SIGNUP = 'Member ID: ',
    SIGNIN = 'IP: ',
    PASSWORD_CHANGED = 'Password has been changed',
    PAYEE_ADDED = 'Added a payee: ',
    PAYEE_UPDATED = 'Payee updated: ',
    PAYEE_REMOVED = 'Payee removed: ',
    PLAIN = '',
}

export enum TransferType {
    INTERNAL = 'Internal',
    WITHDRAWAL = 'Withdrawal',
    REPLENISHMENT = 'Replenishment',
    REFUND = 'Refund',
    INVOICE_CREATED = 'InvoiceCreated',
    INVOICE_PAID = 'InvoicePaid',
}

export enum MailerTemplate {
    SIGNUP = 'signUp',
    RESTORE_PASSWORD = 'restorePassword',
}

export enum UserStatus {
    BLOCKED = -1,
    EMAIL_NOT_CONFIRMED = 0,
    EMAIL_CONFIRMED = 1,
}

export enum AdminAction {
    LOGIN = 'Login',
    LOGOUT = 'Logout',
    CREATE = 'Create',
    CHANGE = 'Change',
    REMOVE = 'Remove',
}

export enum AdminStatus {
    ACTIVE = 1,
    BLOCKED = 0,
}
