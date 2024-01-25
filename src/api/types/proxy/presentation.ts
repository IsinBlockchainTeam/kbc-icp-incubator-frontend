export type PresentationTemplate = {
    id: string,
    domain: string,
    name: string,
    query: any
}

export type PresentationRequest = {
    id: string,
    callbackUrl: string,
    request: {
        from: string,
        created_time: number,
        expires_time: number,
        reply_url: string,
        reply_to: string[],
        body: {
            query: any,
            domain: string
        }
    }
}
