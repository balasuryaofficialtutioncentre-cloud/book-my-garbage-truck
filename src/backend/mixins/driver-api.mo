import CommonTypes "../types/common";
import DriverTypes "../types/driver";
import DriverLib "../lib/driver";
import Map "mo:core/Map";

mixin (
  driverProfiles : Map.Map<CommonTypes.UserId, DriverTypes.DriverProfile>,
  driverStates : Map.Map<CommonTypes.UserId, DriverTypes.DriverState>,
) {

  /// Driver: upsert own profile.
  public shared ({ caller }) func upsertDriverProfile(
    name : Text,
    age : Nat,
    phone : Text,
    bloodGroup : Text,
    address : Text,
    photoKey : ?Text,
  ) : async () {
    DriverLib.upsertProfile(driverProfiles, caller, name, age, phone, bloodGroup, address, photoKey);
  };

  /// Any authenticated user: fetch a driver's public profile.
  public shared query ({ caller }) func getDriverProfile(
    driverId : CommonTypes.UserId,
  ) : async ?DriverTypes.DriverProfilePublic {
    DriverLib.getProfile(driverProfiles, driverId);
  };

  /// Owner: list all driver profiles.
  public shared query ({ caller }) func listDriverProfiles() : async [DriverTypes.DriverProfilePublic] {
    DriverLib.listProfiles(driverProfiles);
  };

  /// Driver: toggle duty status.
  public shared ({ caller }) func setDutyStatus(status : DriverTypes.DutyStatus) : async () {
    DriverLib.setDutyStatus(driverStates, caller, status);
  };

  /// Driver: update GPS location.
  public shared ({ caller }) func updateLocation(
    latitude : Float,
    longitude : Float,
    active : Bool,
  ) : async () {
    DriverLib.updateLocation(driverStates, caller, latitude, longitude, active);
  };

  /// Driver: set garbage fill percentage (0-100).
  public shared ({ caller }) func setFillPercent(percent : Nat) : async () {
    DriverLib.setFillPercent(driverStates, caller, percent);
  };

  /// Any authenticated user: get a driver's current state.
  public shared query ({ caller }) func getDriverState(
    driverId : CommonTypes.UserId,
  ) : async ?DriverTypes.DriverStatePublic {
    DriverLib.getState(driverStates, driverId);
  };

  /// Owner/Public: list all driver states.
  public shared query ({ caller }) func listDriverStates() : async [DriverTypes.DriverStatePublic] {
    DriverLib.listStates(driverStates);
  };
};
