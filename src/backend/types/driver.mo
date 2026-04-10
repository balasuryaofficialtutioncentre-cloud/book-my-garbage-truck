import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type DriverProfile = {
    id : UserId;
    var name : Text;
    var age : Nat;
    var phone : Text;
    var bloodGroup : Text;
    var address : Text;
    var photoKey : ?Text;   // object-storage blob key
  };

  public type DutyStatus = {
    #onDuty;
    #offDuty;
  };

  public type GpsLocation = {
    latitude : Float;
    longitude : Float;
    timestamp : Timestamp;
    var active : Bool;
  };

  public type DriverState = {
    id : UserId;
    var dutyStatus : DutyStatus;
    var location : ?GpsLocation;
    var fillPercent : Nat;   // 0-100
  };

  // Shared (API-boundary) types — no mutable fields
  public type DriverProfilePublic = {
    id : UserId;
    name : Text;
    age : Nat;
    phone : Text;
    bloodGroup : Text;
    address : Text;
    photoKey : ?Text;
  };

  public type DriverStatePublic = {
    id : UserId;
    dutyStatus : DutyStatus;
    location : ?GpsLocationPublic;
    fillPercent : Nat;
  };

  public type GpsLocationPublic = {
    latitude : Float;
    longitude : Float;
    timestamp : Timestamp;
    active : Bool;
  };
};
