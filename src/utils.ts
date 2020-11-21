export const wait = (n: number) =>
    new Promise((resolve) => setTimeout(resolve, n));

export function normalizePath(url: string) {
    const parts = url.split('/').filter((part) => part);
    return `${parts.join('/')}`;
}
