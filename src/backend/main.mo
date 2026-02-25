import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Anonymous user profile type (no internal principal)
  type AnonymousProfile = {
    fullName : Text;
    userClass : UserClass;
    contactNumber : Text;
  };

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
    questionImageData : Text; // Base64-encoded image data
    optionImageData : [Text]; // Array of 4 base64-encoded image data
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

  // Persistent admin principal: set on first claim and kept forever
  var adminPrincipal : ?Principal = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  let questions = Map.empty<Text, Question>();
  let tests = Map.empty<Text, Test>();
  let results = Map.empty<Text, TestResult>();

  // -------------------------- Persistent Admin Management -----------------------

  public shared ({ caller }) func claimAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot claim admin");
    };
    switch (adminPrincipal) {
      case (?admin) {
        if (caller != admin) {
          Runtime.trap("Unauthorized: Admin has already been claimed by another principal");
        };
        // Already admin - no-op
      };
      case (null) {
        adminPrincipal := ?caller;
      };
    };
  };

  func requirePersistentAdminQuery(caller : Principal) {
    switch (adminPrincipal) {
      case (?admin) {
        if (caller != admin) {
          Runtime.trap("Unauthorized: Only the persistent admin can perform this action");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: No admin has been designated yet. Call claimAdmin first");
      };
    };
  };

  func requirePersistentAdminUpdate(caller : Principal) {
    switch (adminPrincipal) {
      case (?admin) {
        if (caller != admin) {
          Runtime.trap("Unauthorized: Only the persistent admin can perform this action");
        };
      };
      case (null) {
        if (caller.isAnonymous()) {
          Runtime.trap("Anonymous principals cannot become admin");
        };
        adminPrincipal := ?caller;
      };
    };
  };

  func isPersistentAdmin(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (?admin) { caller == admin };
      case (null) { false };
    };
  };

  // -------------------------- Required Frontend Profile Functions -------------
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

  // ------------------------------- User Profile Helpers --------------------------
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

  public query ({ caller }) func isProfileComplete() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check profile status");
    };
    users.containsKey(caller);
  };

  // ----------------------------- Admin Functions ---------------------------------
  func generateUUID(caller : Principal) : Text {
    (caller.toText() # "_" # debug_show (Time.now()));
  };

  /// ADMIN: Add image-based question with base64 image data
  public shared ({ caller }) func addQuestion(
    questionImageData : Text,
    optionImageData : [Text],
    correctOption : Nat,
  ) : async Text {
    requirePersistentAdminUpdate(caller);
    if (optionImageData.size() != 4) { Runtime.trap("Exactly 4 option images required") };
    if (correctOption >= 4) { Runtime.trap("Invalid correct option index") };
    let id = generateUUID(caller);
    let question = {
      id;
      questionImageData;
      optionImageData;
      correctOption;
      createdAt = Time.now();
    };
    questions.add(id, question);
    id;
  };

  /// ADMIN: Get all questions (returns image-based Question schema)
  public query ({ caller }) func getAllQuestions() : async [Question] {
    requirePersistentAdminQuery(caller);
    questions.values().toArray().sort();
  };

  /// ADMIN: Create test
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

  /// ADMIN: Publish/unpublish test
  public shared ({ caller }) func setTestPublished(testId : Text, published : Bool) : async () {
    requirePersistentAdminUpdate(caller);
    switch (tests.get(testId)) {
      case (?test) {
        tests.add(testId, { test with isPublished = published });
      };
      case (null) { Runtime.trap("Test not found") };
    };
  };

  /// ADMIN: Get all users (anonymous profiles)
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

  /// ADMIN: Get all test results sorted by submittedAt
  public query ({ caller }) func getAllResults() : async [TestResult] {
    requirePersistentAdminQuery(caller);
    results.values().toArray().sort();
  };

  /// ADMIN: Get all tests (published and unpublished)
  public query ({ caller }) func getAllTests() : async [Test] {
    requirePersistentAdminQuery(caller);
    tests.values().toArray().sort(
      func(a, b) {
        Int.compare(b.createdAt, a.createdAt);
      }
    );
  };

  // -------------------------- Test-Taking (User) Functions ---------------------------
  public query ({ caller }) func getPublishedTests() : async [TestSummary] {
    // Published tests are visible to any caller (including guests)
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

  /// Requires authentication; admin can view any.
  public query ({ caller }) func getTestQuestions(testId : Text) : async [Question] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user) and not isPersistentAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can view test questions");
    };
    switch (tests.get(testId)) {
      case (?test) {
        // Non-admins: must be published
        if (not test.isPublished and not isPersistentAdmin(caller)) {
          Runtime.trap("Unauthorized: Test is not published");
        };
        test.questionIds.map(func(qid : Text) : ?Question { questions.get(qid) }).filterMap(func(x : ?Question) : ?Question { x });
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func submitTest(testId : Text, answers : [Nat]) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user) and not isPersistentAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users can submit tests");
    };
    switch (tests.get(testId)) {
      case (?test) {
        // Non-admins: must be published
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

  public query ({ caller }) func getMyResults() : async [TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access their results");
    };
    results.values().toArray().filter(func(r) { r.userId == caller }).sort().reverse();
  };

  /// Helper: calculate user stats
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

  /// ADMIN: Get leaderboard entries sorted by average score
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

  /// ADMIN: Get the admin principal (restricted to admin only)
  public query ({ caller }) func getAdminPrincipal() : async ?Principal {
    requirePersistentAdminQuery(caller);
    adminPrincipal;
  };
};
