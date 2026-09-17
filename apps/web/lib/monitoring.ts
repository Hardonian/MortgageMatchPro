export const analytics = { track: (...args: any[]) => {} }
export const errorTracking = { capture: (...args: any[]) => {} }
export function performHealthCheck() { return { status: 'ok' } }
export function captureException(e: any) {}
export default { analytics, errorTracking, performHealthCheck, captureException }
