export const checkAndGetEnvironmentVariable = (
    variable: string | undefined,
    errorMessage?: string
): string => {
    if (!variable)
        throw new Error(errorMessage ? errorMessage : `Environment variable is not defined`);
    return variable;
};
