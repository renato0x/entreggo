export enum ProblemType {
    RECIPIENT_ABSENT = 'RECIPIENT_ABSENT',
    RECIPIENT_REFUSED = 'RECIPIENT_REFUSED',
    ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',
    WRONG_ADDRESS = 'WRONG_ADDRESS',
    UNSAFE_LOCATION = 'UNSAFE_LOCATION',
    OTHER = 'OTHER',
}

export class ReportProblemDto {
    problemType!: ProblemType;
    description?: string;
    attemptedContact?: boolean;
}

export enum ProblemResolution {
    DISCARD = 'DISCARD',
    RETURN = 'RETURN',
}

export class ResolveProblemDto {
    resolution!: ProblemResolution;
    notes?: string;
}
