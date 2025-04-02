export const debug = {
    auth: (...args: any[]) => console.log('[Auth]', ...args),
    api: (...args: any[]) => console.log('[API]', ...args),
    error: (...args: any[]) => console.error('[Error]', ...args)
};