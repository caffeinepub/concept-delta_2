import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TestSummary {
    id: string;
    subject?: string;
    name: string;
    durationSeconds: bigint;
    questionCount: bigint;
}
export interface LeaderboardEntry {
    principal: Principal;
    totalTests: bigint;
    fullName: string;
    bestScore: bigint;
    averageScore: bigint;
}
export type Time = bigint;
export interface Test {
    id: string;
    isPublished: boolean;
    subject?: string;
    name: string;
    createdAt: Time;
    durationSeconds: bigint;
    questionIds: Array<string>;
}
export interface Question {
    id: string;
    correctOption: bigint;
    createdAt: Time;
    optionImageData: Array<string>;
    questionImageData: string;
}
export interface AnonymousProfile {
    fullName: string;
    contactNumber: string;
    userClass: UserClass;
}
export interface TestResult {
    id: string;
    userId: Principal;
    answers: Array<bigint>;
    submittedAt: Time;
    score: bigint;
    testId: string;
}
export enum UserClass {
    dropper = "dropper",
    eleventh = "eleventh",
    twelfth = "twelfth"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / ADMIN: Add image-based question with base64 image data
     */
    addQuestion(questionImageData: string, optionImageData: Array<string>, correctOption: bigint): Promise<string>;
    /**
     * / ADMIN: Get all users (anonymous profiles)
     */
    adminGetAllUsers(): Promise<Array<AnonymousProfile>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<void>;
    /**
     * / ADMIN: Create test
     */
    createTest(name: string, subject: string | null, durationSeconds: bigint, questionIds: Array<string>): Promise<string>;
    /**
     * / ADMIN: Get the admin principal (restricted to admin only)
     */
    getAdminPrincipal(): Promise<Principal | null>;
    /**
     * / ADMIN: Get all questions (returns image-based Question schema)
     */
    getAllQuestions(): Promise<Array<Question>>;
    /**
     * / ADMIN: Get all test results sorted by submittedAt
     */
    getAllResults(): Promise<Array<TestResult>>;
    /**
     * / ADMIN: Get all tests (published and unpublished)
     */
    getAllTests(): Promise<Array<Test>>;
    getCallerUserProfile(): Promise<AnonymousProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / ADMIN: Get leaderboard entries sorted by average score
     */
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMyProfile(): Promise<AnonymousProfile | null>;
    getMyResults(): Promise<Array<TestResult>>;
    getPublishedTests(): Promise<Array<TestSummary>>;
    /**
     * / Requires authentication; admin can view any.
     */
    getTestQuestions(testId: string): Promise<Array<Question>>;
    getUserProfile(user: Principal): Promise<AnonymousProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isProfileComplete(): Promise<boolean>;
    saveCallerUserProfile(profile: AnonymousProfile): Promise<void>;
    saveUserProfile(fullName: string, userClass: UserClass, contactNumber: string): Promise<void>;
    /**
     * / ADMIN: Publish/unpublish test
     */
    setTestPublished(testId: string, published: boolean): Promise<void>;
    submitTest(testId: string, answers: Array<bigint>): Promise<bigint>;
}
