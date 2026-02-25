import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserProfile = {
    principal : Principal;
    fullName : Text;
    userClass : UserClass;
    contactNumber : Text;
    registeredAt : Time.Time;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Principal.compare(p1.principal, p2.principal);
    };
  };

  type UserClass = {
    #eleventh;
    #twelfth;
    #dropper;
  };

  type Question = {
    id : Text;
    questionImageUrl : Text;
    optionImageUrls : [Text];
    correctOption : Nat;
    createdAt : Time.Time;
  };

  module Question {
    public func compare(q1 : Question, q2 : Question) : Order.Order {
      switch (Text.compare(q1.id, q2.id)) {
        case (#equal) { Int.compare(q1.createdAt, q2.createdAt) };
        case (order) { order };
      };
    };
  };

  type Test = {
    id : Text;
    name : Text;
    subject : ?Text;
    durationSeconds : Nat;
    questionIds : [Text];
    isPublished : Bool;
    createdAt : Time.Time;
  };

  module Test {
    public func compare(t1 : Test, t2 : Test) : Order.Order {
      switch (Text.compare(t1.id, t2.id)) {
        case (#equal) { Int.compare(t1.createdAt, t2.createdAt) };
        case (order) { order };
      };
    };
  };

  type TestResult = {
    id : Text;
    userId : Principal;
    testId : Text;
    answers : [Nat];
    score : Nat;
    submittedAt : Time.Time;
  };

  module TestResult {
    public func compare(r1 : TestResult, r2 : TestResult) : Order.Order {
      Int.compare(r1.submittedAt, r2.submittedAt);
    };
  };

  type TestSummary = {
    id : Text;
    name : Text;
    subject : ?Text;
    durationSeconds : Nat;
    questionCount : Nat;
  };

  type LeaderboardEntry = {
    principal : Principal;
    fullName : Text;
    totalTests : Nat;
    averageScore : Nat;
    bestScore : Nat;
  };

  // The public-facing profile type (without internal principal field)
  type AnonymousProfile = {
    fullName : Text;
    userClass : UserClass;
    contactNumber : Text;
  };

  // Admin principal for persistent storage across upgrades
  var adminPrincipal : ?Principal = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  let questions = Map.empty<Text, Question>();
  let tests = Map.empty<Text, Test>();
  let results = Map.empty<Text, TestResult>();

  // ── Persistent Admin Management ───────────

  /// Claims admin rights if no admin exists yet; the first caller becomes the permanent admin.
  /// Subsequent calls from a different principal are rejected.
  public shared ({ caller }) func claimAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot claim admin");
    };
    switch (adminPrincipal) {
      case (?admin) {
        if (caller != admin) {
          Runtime.trap("Unauthorized: Admin has already been claimed by another principal");
        };
        // Caller is already the admin; no-op.
      };
      case (null) {
        adminPrincipal := ?caller;
      };
    };
  };

  /// Enforces that the caller is the persistent admin (update context — may not mutate state here).
  /// Used in update calls only.
  func requirePersistentAdminUpdate(caller : Principal) {
    switch (adminPrincipal) {
      case (?admin) {
        if (caller != admin) {
          Runtime.trap("Unauthorized: Only the persistent admin can perform this action");
        };
      };
      case (null) {
        // No admin has been set yet; the first caller to an admin-gated update becomes admin.
        if (caller.isAnonymous()) {
          Runtime.trap("Anonymous principals cannot become admin");
        };
        adminPrincipal := ?caller;
      };
    };
  };

  /// Enforces that the caller is the persistent admin (query context — must NOT mutate state).
  func requirePersistentAdminQuery(caller : Principal) {
    switch (adminPrincipal) {
      case (?admin) {
        if (caller != admin) {
          Runtime.trap("Unauthorized: Only the persistent admin can perform this action");
        };
      };
      case (null) {
        // No admin set yet; reject all query-context admin checks until claimAdmin is called.
        Runtime.trap("Unauthorized: No admin has been designated yet. Call claimAdmin first.");
      };
    };
  };

  /// Returns true if the caller is the persistent admin.
  func isPersistentAdmin(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (?admin) { caller == admin };
      case (null) { false };
    };
  };

  // ── Required frontend profile functions ───────────────────────────────

  /// Returns the caller's own profile. Requires authenticated user.
  public query ({ caller }) func getCallerUserProfile() : async ?AnonymousProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (users.get(caller)) {
      case (?profile) {
        ?{
          fullName = profile.fullName;
          userClass = profile.userClass;
          contactNumber = profile.contactNumber;
        };
      };
      case (null) { null };
    };
  };

  /// Saves the caller's own profile. Requires authenticated user.
  public shared ({ caller }) func saveCallerUserProfile(profile : AnonymousProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let fullProfile = {
      principal = caller;
      fullName = profile.fullName;
      userClass = profile.userClass;
      contactNumber = profile.contactNumber;
      registeredAt = Time.now();
    };
    users.add(caller, fullProfile);
  };

  /// Fetches another user's profile. Caller can view their own; admins can view any.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?AnonymousProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller) and not isPersistentAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (?profile) {
        ?{
          fullName = profile.fullName;
          userClass = profile.userClass;
          contactNumber = profile.contactNumber;
        };
      };
      case (null) { null };
    };
  };

  // ── User-facing profile helpers ────────────────────────────────────

  /// Saves or updates the caller's profile. Requires authenticated user.
  public shared ({ caller }) func saveUserProfile(fullName : Text, userClass : UserClass, contactNumber : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile = {
      principal = caller;
      fullName;
      userClass;
      contactNumber;
      registeredAt = Time.now();
    };
    users.add(caller, profile);
  };

  /// Returns the caller's own profile (anonymous shape). Requires authenticated user.
  public query ({ caller }) func getMyProfile() : async ?AnonymousProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (users.get(caller)) {
      case (?profile) {
        ?{
          fullName = profile.fullName;
          userClass = profile.userClass;
          contactNumber = profile.contactNumber;
        };
      };
      case (null) { null };
    };
  };

  /// Returns whether the caller has completed profile setup. Requires authenticated user.
  public query ({ caller }) func isProfileComplete() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check profile status");
    };
    users.containsKey(caller);
  };

  // ── Admin Functions ────────────────────────────────────────────────

  /// Generates a simple unique ID using principal and time.
  func generateUUID(caller : Principal) : Text {
    (caller.toText() # "_" # debug_show (Time.now()));
  };

  /// Adds a question. Admin only.
  public shared ({ caller }) func addQuestion(questionImageUrl : Text, optionImageUrls : [Text], correctOption : Nat) : async Text {
    requirePersistentAdminUpdate(caller);
    if (optionImageUrls.size() != 4) { Runtime.trap("Exactly 4 option images required") };
    if (correctOption >= 4) { Runtime.trap("Invalid correct option index") };
    let id = generateUUID(caller);
    let question = {
      id;
      questionImageUrl;
      optionImageUrls;
      correctOption;
      createdAt = Time.now();
    };
    questions.add(id, question);
    id;
  };

  /// Returns all questions. Admin only.
  public query ({ caller }) func getAllQuestions() : async [Question] {
    requirePersistentAdminQuery(caller);
    questions.values().toArray().sort();
  };

  /// Creates a test. Admin only.
  public shared ({ caller }) func createTest(name : Text, subject : ?Text, durationSeconds : Nat, questionIds : [Text]) : async Text {
    requirePersistentAdminUpdate(caller);
    let id = generateUUID(caller);
    let newTest = {
      id;
      name;
      subject;
      durationSeconds;
      questionIds;
      isPublished = false;
      createdAt = Time.now();
    };
    tests.add(id, newTest);
    id;
  };

  /// Publishes or unpublishes a test. Admin only.
  public shared ({ caller }) func setTestPublished(testId : Text, published : Bool) : async () {
    requirePersistentAdminUpdate(caller);
    switch (tests.get(testId)) {
      case (?test) {
        tests.add(testId, { test with isPublished = published });
      };
      case (null) { Runtime.trap("Test not found") };
    };
  };

  /// Returns all user profiles. Admin only.
  public query ({ caller }) func adminGetAllUsers() : async [AnonymousProfile] {
    requirePersistentAdminQuery(caller);
    users.values().toArray().map(
      func(p : UserProfile) : AnonymousProfile {
        {
          fullName = p.fullName;
          userClass = p.userClass;
          contactNumber = p.contactNumber;
        };
      }
    );
  };

  /// Returns all test results. Admin only.
  public query ({ caller }) func getAllResults() : async [TestResult] {
    requirePersistentAdminQuery(caller);
    results.values().toArray().sort();
  };

  // ── Test-Taking Functions ───────────────────────────────────────────

  /// Returns summaries of all published tests. Available to any caller (no auth required).
  public query ({ caller }) func getPublishedTests() : async [TestSummary] {
    tests.values().toArray().filter(func(t : Test) : Bool { t.isPublished }).map(
      func(t : Test) : TestSummary {
        {
          id = t.id;
          name = t.name;
          subject = t.subject;
          durationSeconds = t.durationSeconds;
          questionCount = t.questionIds.size();
        };
      }
    );
  };

  /// Returns questions for a published test. Requires authenticated user (or admin).
  public query ({ caller }) func getTestQuestions(testId : Text) : async [Question] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user) and not isPersistentAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can view test questions");
    };
    switch (tests.get(testId)) {
      case (?test) {
        // Non-admins may only access published tests
        if (not test.isPublished and not isPersistentAdmin(caller)) {
          Runtime.trap("Unauthorized: Test is not published");
        };
        test.questionIds.map(func(qid : Text) : ?Question { questions.get(qid) }).filterMap(func(x : ?Question) : ?Question { x });
      };
      case (null) { [] };
    };
  };

  /// Submits answers for a test, stores the result, and returns the score. Requires authenticated user.
  public shared ({ caller }) func submitTest(testId : Text, answers : [Nat]) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user) and not isPersistentAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users can submit tests");
    };
    switch (tests.get(testId)) {
      case (?test) {
        if (not test.isPublished and not isPersistentAdmin(caller)) {
          Runtime.trap("Unauthorized: Test is not published");
        };
        let questionIds = test.questionIds;
        if (answers.size() != questionIds.size()) {
          Runtime.trap("Number of answers does not match questions");
        };
        var score = 0;
        for (i in Nat.range(0, answers.size())) {
          switch (questions.get(questionIds[i])) {
            case (?q) {
              if (answers[i] == q.correctOption) { score += 1 };
            };
            case (null) {};
          };
        };
        let resultId = generateUUID(caller);
        let result = {
          id = resultId;
          userId = caller;
          testId;
          answers;
          score;
          submittedAt = Time.now();
        };
        results.add(resultId, result);
        score;
      };
      case (null) { Runtime.trap("Test not found") };
    };
  };

  // ── User Results/Leaderboard ─────────────────────────────────────────

  /// Returns all test results for the caller (most recent first). Requires authenticated user.
  public query ({ caller }) func getMyResults() : async [TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access their results");
    };
    results.values().toArray().filter(func(r) { r.userId == caller }).sort().reverse();
  };

  /// Helper: compute (totalTests, averageScore, bestScore) for a set of results.
  func calculateUserStats(userResults : [TestResult]) : (Nat, Nat, Nat) {
    let totalTests = userResults.size();
    if (totalTests == 0) { return (0, 0, 0) };
    var scoreSum = 0;
    var bestScore = 0;
    for (result in userResults.values()) {
      scoreSum += result.score;
      if (result.score > bestScore) { bestScore := result.score };
    };
    let average = scoreSum / totalTests;
    (totalTests, average, bestScore);
  };

  /// Returns aggregated stats for all users sorted by average score descending. Admin only.
  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    requirePersistentAdminQuery(caller);
    let entries = users.toArray().map(
      func((principal, profile)) {
        let userResults = results.values().toArray().filter(
          func(r) { r.userId == principal }
        );
        let (totalTests, averageScore, bestScore) = calculateUserStats(userResults);
        {
          principal;
          fullName = profile.fullName;
          totalTests;
          averageScore;
          bestScore;
        };
      }
    );
    let sortedEntries = entries.sort(
      func(a, b) {
        switch (Nat.compare(b.averageScore, a.averageScore)) {
          case (#equal) {
            switch (Nat.compare(b.bestScore, a.bestScore)) {
              case (#equal) { Nat.compare(b.totalTests, a.totalTests) };
              case (order) { order };
            };
          };
          case (order) { order };
        };
      }
    );
    sortedEntries;
  };

  // ── Admin Principal Query ─────────────────────────────────────────────

  /// Returns the current admin principal. Publicly readable so the frontend can check.
  public query ({ caller }) func getAdminPrincipal() : async ?Principal {
    adminPrincipal;
  };
};
