import CommonTypes "../types/common";
import AuthTypes "../types/auth";
import AuthLib "../lib/auth";
import Map "mo:core/Map";

mixin (users : Map.Map<CommonTypes.UserId, CommonTypes.UserProfile>) {

  /// Register the caller with a chosen role and display name.
  public shared ({ caller }) func register(
    role : CommonTypes.Role,
    displayName : Text,
  ) : async AuthTypes.RegisterResult {
    AuthLib.register(users, caller, role, displayName);
  };

  /// Return the caller's role, or null if not registered.
  public shared query ({ caller }) func getMyRole() : async ?CommonTypes.Role {
    AuthLib.getRole(users, caller);
  };

  /// Return whether the caller is registered.
  public shared query ({ caller }) func isRegistered() : async Bool {
    AuthLib.isRegistered(users, caller);
  };
};
