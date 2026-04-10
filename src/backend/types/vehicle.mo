import Common "common";

module {
  public type UserId = Common.UserId;

  public type Vehicle = {
    id : Nat;
    var vehicleNumber : Text;
    var makeModel : Text;
    var assignedDriverId : ?UserId;
  };

  public type VehiclePublic = {
    id : Nat;
    vehicleNumber : Text;
    makeModel : Text;
    assignedDriverId : ?UserId;
  };
};
