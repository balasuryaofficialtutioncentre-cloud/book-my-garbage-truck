import CommonTypes "../types/common";
import VehicleTypes "../types/vehicle";
import VehicleLib "../lib/vehicle";
import List "mo:core/List";

mixin (
  vehicles : List.List<VehicleTypes.Vehicle>,
  vehicleCounter : { var next : Nat },
) {

  /// Owner: add a new vehicle.
  public shared ({ caller }) func addVehicle(
    vehicleNumber : Text,
    makeModel : Text,
    assignedDriverId : ?CommonTypes.UserId,
  ) : async Nat {
    VehicleLib.addVehicle(vehicles, vehicleCounter, vehicleNumber, makeModel, assignedDriverId);
  };

  /// Owner/Driver: get a vehicle by id.
  public shared query ({ caller }) func getVehicle(id : Nat) : async ?VehicleTypes.VehiclePublic {
    VehicleLib.getVehicle(vehicles, id);
  };

  /// Owner: list all vehicles.
  public shared query ({ caller }) func listVehicles() : async [VehicleTypes.VehiclePublic] {
    VehicleLib.listVehicles(vehicles);
  };

  /// Owner: assign or unassign a driver to a vehicle.
  public shared ({ caller }) func assignDriver(
    vehicleId : Nat,
    driverId : ?CommonTypes.UserId,
  ) : async () {
    VehicleLib.assignDriver(vehicles, vehicleId, driverId);
  };
};
