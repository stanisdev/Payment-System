export enum UserTokenType {
    ACCESS = 'Access',
    REFRESH = 'Refresh',
}

export enum UserAction {
    LOGIN = 'Login',
    LOGOUT = 'Logout',
    CREATE = 'Create',
    CHANGE = 'Change',
}

export enum WalletType {
    US_DOLLAR = 1,
    EURO = 2,
    GOLD = 3,
    BITCOIN = 4,
}

export enum LoggerTemplate {
    SIGNUP = 'Member ID: ',
    SIGNIN = 'IP: ',
    PLAIN = '',
}
