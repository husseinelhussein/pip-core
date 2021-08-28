const getErrorMessage = (statusCode: number) => {
    switch (statusCode) {
        case 400:
            return 'The request was poorly formed.';
        case 401:
            return 'Unable to authenticate this request.';
        case 403:
            return "You're not authorized to take this action.";
        case 404:
            return 'Requested pagination not found.';
        case 422:
            return 'Unprocessable Entity.';
        default:
            return 'There was an error.';
    }
};

export class HttpError extends Error {
    public statusCode: number;

    constructor(statusCode: number, customMessage?: string) {
        const message = customMessage || getErrorMessage(statusCode);
        super(customMessage || message); // 'Error' breaks prototype chain here
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
