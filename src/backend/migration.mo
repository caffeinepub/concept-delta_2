import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type AnonymousProfile = {
    fullName : Text;
    userClass : UserClass;
    contactNumber : Text;
  };

  type UserProfile = {
    principal : Principal.Principal;
    fullName : Text;
    userClass : UserClass;
    contactNumber : Text;
    registeredAt : Time.Time;
  };

  type UserClass = {
    #eleventh;
    #twelfth;
    #dropper;
  };

  type Question = {
    id : Text;
    questionImageData : Text;
    optionImageData : [Text];
    correctOption : Nat;
    createdAt : Time.Time;
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
    userId : Principal.Principal;
    testId : Text;
    answers : [Nat];
    score : Nat;
    submittedAt : Time.Time;
  };

  type OldActor = {
    adminPrincipal : ?Principal.Principal;
    users : Map.Map<Principal.Principal, UserProfile>;
    questions : Map.Map<Text, Question>;
    tests : Map.Map<Text, Test>;
    results : Map.Map<Text, TestResult>;
  };

  type NewActor = {
    adminPrincipal : ?Principal.Principal;
    users : Map.Map<Principal.Principal, UserProfile>;
    questions : Map.Map<Text, Question>;
    tests : Map.Map<Text, Test>;
    results : Map.Map<Text, TestResult>;
  };

  public func run(old : OldActor) : NewActor {
    { old with adminPrincipal = old.adminPrincipal };
  };
};
