export interface DriverProfile {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;

    // Documents
    cnhFrontUrl?: string;
    cnhBackUrl?: string;
    cnhNumber?: string;
    cnhStatus: DocumentStatus;
    cnhRejectionReason?: string;

    // Vehicle Info
    vehicleModel?: string;
    vehiclePlate?: string;
    vehiclePhotoUrl?: string;
    vehicleStatus: DocumentStatus;
    vehicleRejectionReason?: string;

    // Overall Status
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'incomplete';

    createdAt: string;
    updatedAt: string;
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'not_uploaded';

export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
}

export interface UploadDocumentRequest {
    documentType: 'cnh_front' | 'cnh_back' | 'vehicle_photo';
    file: {
        uri: string;
        name: string;
        type: string;
    };
}

export interface UploadDocumentResponse {
    url: string;
    documentType: string;
}

export interface ImageAsset {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string | null;
    fileSize?: number;
}
