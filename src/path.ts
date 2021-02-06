export function getLocalPath(action: string, persist?: boolean) {
    return [`LOCAL${persist ? '-PERSIST' : ''}`, action];
}
