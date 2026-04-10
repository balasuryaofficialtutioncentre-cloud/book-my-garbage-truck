import Common "common";

module {
  public type UserId = Common.UserId;
  public type Role = Common.Role;

  public type RegisterResult = {
    #ok : UserId;
    #alreadyExists;
  };

  public type LoginResult = {
    #ok : Role;
    #notRegistered;
  };
};
