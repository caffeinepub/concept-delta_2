import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type UserProfile = {
    principal : Principal;
    fullName : Text;
    userClass : {
      #eleventh;
      #twelfth;
      #dropper;
    };
    contactNumber : Text;
    registeredAt : Time.Time;
  };

  type LegacyQuestion = {
    id : Text;
    questionText : Text;
    optionTexts : [Text];
    correctOption : Nat;
    createdAt : Time.Time;
  };

  type Question = {
    id : Text;
    questionImageUrl : Text;
    optionImageUrls : [Text];
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
    userId : Principal;
    testId : Text;
    answers : [Nat];
    score : Nat;
    submittedAt : Time.Time;
  };

  type OldActor = {
    adminPrincipal : ?Principal;
    users : Map.Map<Principal, UserProfile>;
    questions : Map.Map<Text, LegacyQuestion>;
    tests : Map.Map<Text, Test>;
    results : Map.Map<Text, TestResult>;
  };

  type NewActor = {
    adminPrincipal : ?Principal;
    users : Map.Map<Principal, UserProfile>;
    questions : Map.Map<Text, Question>;
    tests : Map.Map<Text, Test>;
    results : Map.Map<Text, TestResult>;
  };

  public func run(old : OldActor) : NewActor {
    let migratedQuestions = old.questions.map<Text, LegacyQuestion, Question>(
      func(_id, legacy) {
        {
          legacy with
          questionImageUrl = legacy.questionText;
          optionImageUrls = legacy.optionTexts;
        };
      }
    );
    {
      old with
      questions = migratedQuestions;
    };
  };
};
