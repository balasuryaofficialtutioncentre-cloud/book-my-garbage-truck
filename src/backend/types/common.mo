module {
  public type UserId = Principal;
  public type Timestamp = Int;

  public type Role = {
    #owner;
    #driver;
    #customer;
  };

  public type UserProfile = {
    id : UserId;
    var role : Role;
    var displayName : Text;
  };
};
