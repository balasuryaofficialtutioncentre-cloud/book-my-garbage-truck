import VehicleTypes "../types/vehicle";
import CommonTypes "../types/common";
import List "mo:core/List";

module {
  public type VehicleList = List.List<VehicleTypes.Vehicle>;

  func toPublic(v : VehicleTypes.Vehicle) : VehicleTypes.VehiclePublic {
    {
      id = v.id;
      vehicleNumber = v.vehicleNumber;
      makeModel = v.makeModel;
      assignedDriverId = v.assignedDriverId;
    };
  };

  public func addVehicle(
    vehicles : VehicleList,
    counter : { var next : Nat },
    vehicleNumber : Text,
    makeModel : Text,
    assignedDriverId : ?CommonTypes.UserId,
  ) : Nat {
    let id = counter.next;
    counter.next += 1;
    let v : VehicleTypes.Vehicle = {
      id = id;
      var vehicleNumber = vehicleNumber;
      var makeModel = makeModel;
      var assignedDriverId = assignedDriverId;
    };
    vehicles.add(v);
    id;
  };

  public func getVehicle(
    vehicles : VehicleList,
    id : Nat,
  ) : ?VehicleTypes.VehiclePublic {
    switch (vehicles.find(func(v : VehicleTypes.Vehicle) : Bool { v.id == id })) {
      case (?v) ?toPublic(v);
      case null null;
    };
  };

  public func listVehicles(
    vehicles : VehicleList,
  ) : [VehicleTypes.VehiclePublic] {
    vehicles.map<VehicleTypes.Vehicle, VehicleTypes.VehiclePublic>(toPublic).toArray();
  };

  public func assignDriver(
    vehicles : VehicleList,
    vehicleId : Nat,
    driverId : ?CommonTypes.UserId,
  ) {
    switch (vehicles.find(func(v : VehicleTypes.Vehicle) : Bool { v.id == vehicleId })) {
      case (?v) { v.assignedDriverId := driverId };
      case null {};
    };
  };
};
