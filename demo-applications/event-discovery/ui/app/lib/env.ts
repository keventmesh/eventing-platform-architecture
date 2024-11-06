export function requiredEnv(key: string) {
    return process.env[key] ?? (() => {
        throw new Error(`env.${key} required!`)
    })();
}

export function sessionSecrets(): string[] {
    // Add new secrets at the beginning.
    return requiredEnv("SESSION_SECRETS").split(',').map((value: string) => value.trim())
}