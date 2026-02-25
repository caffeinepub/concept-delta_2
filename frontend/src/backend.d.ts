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
export interface AnonymousProfile {
    fullName: string;
    contactNumber: string;
    userClass: UserClass;
}
export interface Question {
    id: string;
    correctOption: bigint;
    questionImageUrl: string;
    createdAt: Time;
    optionImageUrls: Array<string>;
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
     * / Adds a question. Admin only.
     */
    addQuestion(questionImageUrl: string, optionImageUrls: Array<string>, correctOption: bigint): Promise<string>;
    /**
     * / Returns all user profiles. Admin only.
     */
    adminGetAllUsers(): Promise<Array<AnonymousProfile>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Claims admin rights if no admin exists yet; the first caller becomes the permanent admin.
     * / Subsequent calls from a different principal are rejected.
     */
    claimAdmin(): Promise<void>;
    /**
     * / Creates a test. Admin only.
     */
    createTest(name: string, subject: string | null, durationSeconds: bigint, questionIds: Array<string>): Promise<string>;
    /**
     * / Returns the current admin principal. Publicly readable so the frontend can check.
     */
    getAdminPrincipal(): Promise<Principal | null>;
    /**
     * / Returns all questions. Admin only.
     */
    getAllQuestions(): Promise<Array<Question>>;
    /**
     * / Returns all test results. Admin only.
     */
    getAllResults(): Promise<Array<TestResult>>;
    /**
     * / Returns the caller's own profile. Requires authenticated user.
     */
    getCallerUserProfile(): Promise<AnonymousProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Returns aggregated stats for all users sorted by average score descending. Admin only.
     */
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    /**
     * / Returns the caller's own profile (anonymous shape). Requires authenticated user.
     */
    getMyProfile(): Promise<AnonymousProfile | null>;
    /**
     * / Returns all test results for the caller (most recent first). Requires authenticated user.
     */
    getMyResults(): Promise<Array<TestResult>>;
    /**
     * / Returns summaries of all published tests. Available to any caller (no auth required).
     */
    getPublishedTests(): Promise<Array<TestSummary>>;
    /**
     * / Returns questions for a published test. Requires authenticated user (or admin).
     */
    getTestQuestions(testId: string): Promise<Array<Question>>;
    /**
     * / Fetches another user's profile. Caller can view their own; admins can view any.
     */
    getUserProfile(user: Principal): Promise<AnonymousProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Returns whether the caller has completed profile setup. Requires authenticated user.
     */
    isProfileComplete(): Promise<boolean>;
    /**
     * / Saves the caller's own profile. Requires authenticated user.
     */
    saveCallerUserProfile(profile: AnonymousProfile): Promise<void>;
    /**
     * / Saves or updates the caller's profile. Requires authenticated user.
     */
    saveUserProfile(fullName: string, userClass: UserClass, contactNumber: string): Promise<void>;
    /**
     * / Publishes or unpublishes a test. Admin only.
     */
    setTestPublished(testId: string, published: boolean): Promise<void>;
    /**
     * / Submits answers for a test, stores the result, and returns the score. Requires authenticated user.
     */
    submitTest(testId: string, answers: Array<bigint>): Promise<bigint>;
}
