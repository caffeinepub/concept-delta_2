module {
  type OldActor = {};
  type NewActor = {
    adminPrincipal : ?Principal;
  };

  public func run(old : OldActor) : NewActor {
    { adminPrincipal = null };
  };
};
