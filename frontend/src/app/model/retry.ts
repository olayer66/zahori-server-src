export class Retry {
    retryId: number;
    active: boolean;

    constructor() {
        this.retryId = null;
        this.active = true;
    }
}