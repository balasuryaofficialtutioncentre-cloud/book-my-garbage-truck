import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type PickupStatus = {
    #pending;
    #accepted;
    #completed;
    #cancelled;
  };

  public type PickupRequest = {
    id : Nat;
    customerId : UserId;
    var driverId : ?UserId;
    latitude : Float;
    longitude : Float;
    address : Text;
    var status : PickupStatus;
    createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  public type PickupRequestPublic = {
    id : Nat;
    customerId : UserId;
    driverId : ?UserId;
    latitude : Float;
    longitude : Float;
    address : Text;
    status : PickupStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type CreatePickupInput = {
    latitude : Float;
    longitude : Float;
    address : Text;
  };
};
