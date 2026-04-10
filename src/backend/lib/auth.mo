import CommonTypes "../types/common";
import AuthTypes "../types/auth";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

module {
  public type UserMap = Map.Map<CommonTypes.UserId, CommonTypes.UserProfile>;

  public func register(
    users : UserMap,
    caller : CommonTypes.UserId,
    role : CommonTypes.Role,
    displayName : Text,
  ) : AuthTypes.RegisterResult {
    if (users.containsKey(caller)) {
      return #alreadyExists;
    };
    let profile : CommonTypes.UserProfile = {
      id = caller;
      var role = role;
      var displayName = displayName;
    };
    users.add(caller, profile);
    #ok(caller);
  };

  public func getRole(
    users : UserMap,
    caller : CommonTypes.UserId,
  ) : ?CommonTypes.Role {
    switch (users.get(caller)) {
      case (?p) ?p.role;
      case null null;
    };
  };

  public func isRegistered(
    users : UserMap,
    caller : CommonTypes.UserId,
  ) : Bool {
    users.containsKey(caller);
  };

  public func requireRole(
    users : UserMap,
    caller : CommonTypes.UserId,
    expected : CommonTypes.Role,
  ) {
    switch (users.get(caller)) {
      case (?p) {
        if (p.role != expected) {
          Runtime.trap("Unauthorized: wrong role");
        };
      };
      case null {
        Runtime.trap("Unauthorized: not registered");
      };
    };
  };
};
