import DriverTypes "../types/driver";
import CommonTypes "../types/common";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type DriverProfileMap = Map.Map<CommonTypes.UserId, DriverTypes.DriverProfile>;
  public type DriverStateMap = Map.Map<CommonTypes.UserId, DriverTypes.DriverState>;

  func toProfilePublic(p : DriverTypes.DriverProfile) : DriverTypes.DriverProfilePublic {
    {
      id = p.id;
      name = p.name;
      age = p.age;
      phone = p.phone;
      bloodGroup = p.bloodGroup;
      address = p.address;
      photoKey = p.photoKey;
    };
  };

  func toLocationPublic(loc : DriverTypes.GpsLocation) : DriverTypes.GpsLocationPublic {
    {
      latitude = loc.latitude;
      longitude = loc.longitude;
      timestamp = loc.timestamp;
      active = loc.active;
    };
  };

  func toStatePublic(s : DriverTypes.DriverState) : DriverTypes.DriverStatePublic {
    {
      id = s.id;
      dutyStatus = s.dutyStatus;
      location = switch (s.location) {
        case (?loc) ?toLocationPublic(loc);
        case null null;
      };
      fillPercent = s.fillPercent;
    };
  };

  func ensureState(states : DriverStateMap, driverId : CommonTypes.UserId) : DriverTypes.DriverState {
    switch (states.get(driverId)) {
      case (?s) s;
      case null {
        let s : DriverTypes.DriverState = {
          id = driverId;
          var dutyStatus = #offDuty;
          var location = null;
          var fillPercent = 0;
        };
        states.add(driverId, s);
        s;
      };
    };
  };

  public func upsertProfile(
    profiles : DriverProfileMap,
    caller : CommonTypes.UserId,
    name : Text,
    age : Nat,
    phone : Text,
    bloodGroup : Text,
    address : Text,
    photoKey : ?Text,
  ) {
    switch (profiles.get(caller)) {
      case (?p) {
        p.name := name;
        p.age := age;
        p.phone := phone;
        p.bloodGroup := bloodGroup;
        p.address := address;
        p.photoKey := photoKey;
      };
      case null {
        let p : DriverTypes.DriverProfile = {
          id = caller;
          var name = name;
          var age = age;
          var phone = phone;
          var bloodGroup = bloodGroup;
          var address = address;
          var photoKey = photoKey;
        };
        profiles.add(caller, p);
      };
    };
  };

  public func getProfile(
    profiles : DriverProfileMap,
    driverId : CommonTypes.UserId,
  ) : ?DriverTypes.DriverProfilePublic {
    switch (profiles.get(driverId)) {
      case (?p) ?toProfilePublic(p);
      case null null;
    };
  };

  public func listProfiles(
    profiles : DriverProfileMap,
  ) : [DriverTypes.DriverProfilePublic] {
    profiles.values().map(toProfilePublic).toArray();
  };

  public func setDutyStatus(
    states : DriverStateMap,
    driverId : CommonTypes.UserId,
    status : DriverTypes.DutyStatus,
  ) {
    let s = ensureState(states, driverId);
    s.dutyStatus := status;
  };

  public func updateLocation(
    states : DriverStateMap,
    driverId : CommonTypes.UserId,
    latitude : Float,
    longitude : Float,
    active : Bool,
  ) {
    let s = ensureState(states, driverId);
    let loc : DriverTypes.GpsLocation = {
      latitude = latitude;
      longitude = longitude;
      timestamp = Time.now();
      var active = active;
    };
    s.location := ?loc;
  };

  public func setFillPercent(
    states : DriverStateMap,
    driverId : CommonTypes.UserId,
    percent : Nat,
  ) {
    let s = ensureState(states, driverId);
    s.fillPercent := if (percent > 100) 100 else percent;
  };

  public func getState(
    states : DriverStateMap,
    driverId : CommonTypes.UserId,
  ) : ?DriverTypes.DriverStatePublic {
    switch (states.get(driverId)) {
      case (?s) ?toStatePublic(s);
      case null null;
    };
  };

  public func listStates(
    states : DriverStateMap,
  ) : [DriverTypes.DriverStatePublic] {
    states.values().map(toStatePublic).toArray();
  };
};
