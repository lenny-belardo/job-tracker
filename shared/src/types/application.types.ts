export enum ApplicationStatus {
    WISHLIST = 'WISHLIST',
    APPLIED = 'APPLIED',
    PHONE_SCREEN = 'PHONE_SCREEN',
    TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
    ONSITE_INTERVIEW = 'ONSITE_INTERVIEW',
    OFFER = 'OFFER',
    REJECTED = 'REJECTED',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    WHITHDRAWN = 'WHITHDRAWN'
}

export enum JobType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    CONTRACT = 'CONTRACT',
    INTERNSHIP = 'INTERNSHIP',
    FREELANCE = 'FREELANCE'
}

export enum WorkLocation {
    REMOTE = 'REMOTE',
    ONSITE = 'ONSITE',
    HUBRID = 'HYBRID'
}

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface Company {
    id: string;
    name: string;
    website?: string | null;
    industry?: string | null;
    location?: string | null;
    size?: string | null;
    logoUrl?: string | null;
}

export interface Application {
    id: string;
    jobTitle: string;
    status: ApplicationStatus;
    priority: Priority;
    jobType?: JobType | null;
    workLocation?: WorkLocation | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    applicationDate?: Date | null;
    company: Company;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateApplicationDTO {
    jobTitle: string;
    companyId: string;
    status?: ApplicationStatus;
    priority?: Priority;
    jobType?: JobType;
    workLocation?: WorkLocation;
    salaryMin?: number;
    salaryMax?: number;
    applicationDate?: string;
    notes?: string;
}

export interface UpdateApplicationDTO extends Partial<CreateApplicationDTO> {}

export interface CreateCompanyDTO {
    name: string;
    website?: string;
    industry?: string;
    location?: string;
    size?: string;
}
