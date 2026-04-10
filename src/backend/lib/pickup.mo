import PickupTypes "../types/pickup";
import CommonTypes "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type PickupList = List.List<PickupTypes.PickupRequest>;

  func toPublic(r : PickupTypes.PickupRequest) : PickupTypes.PickupRequestPublic {
    {
      id = r.id;
      customerId = r.customerId;
      driverId = r.driverId;
      latitude = r.latitude;
      longitude = r.longitude;
      address = r.address;
      status = r.status;
      createdAt = r.createdAt;
      updatedAt = r.updatedAt;
    };
  };

  public func createRequest(
    requests : PickupList,
    counter : { var next : Nat },
    customerId : CommonTypes.UserId,
    input : PickupTypes.CreatePickupInput,
  ) : Nat {
    let id = counter.next;
    counter.next += 1;
    let now = Time.now();
    let r : PickupTypes.PickupRequest = {
      id = id;
      customerId = customerId;
      var driverId = null;
      latitude = input.latitude;
      longitude = input.longitude;
      address = input.address;
      var status = #pending;
      createdAt = now;
      var updatedAt = now;
    };
    requests.add(r);
    id;
  };

  public func acceptRequest(
    requests : PickupList,
    driverId : CommonTypes.UserId,
    requestId : Nat,
  ) : Bool {
    switch (requests.find(func(r : PickupTypes.PickupRequest) : Bool { r.id == requestId and r.status == #pending })) {
      case (?r) {
        r.driverId := ?driverId;
        r.status := #accepted;
        r.updatedAt := Time.now();
        true;
      };
      case null false;
    };
  };

  public func updateStatus(
    requests : PickupList,
    requestId : Nat,
    _callerId : CommonTypes.UserId,
    status : PickupTypes.PickupStatus,
  ) : Bool {
    switch (requests.find(func(r : PickupTypes.PickupRequest) : Bool { r.id == requestId })) {
      case (?r) {
        r.status := status;
        r.updatedAt := Time.now();
        true;
      };
      case null false;
    };
  };

  public func getRequest(
    requests : PickupList,
    requestId : Nat,
  ) : ?PickupTypes.PickupRequestPublic {
    switch (requests.find(func(r : PickupTypes.PickupRequest) : Bool { r.id == requestId })) {
      case (?r) ?toPublic(r);
      case null null;
    };
  };

  public func listByCustomer(
    requests : PickupList,
    customerId : CommonTypes.UserId,
  ) : [PickupTypes.PickupRequestPublic] {
    requests
      .filter(func(r : PickupTypes.PickupRequest) : Bool { r.customerId == customerId })
      .map<PickupTypes.PickupRequest, PickupTypes.PickupRequestPublic>(toPublic)
      .toArray();
  };

  public func listPending(
    requests : PickupList,
  ) : [PickupTypes.PickupRequestPublic] {
    requests
      .filter(func(r : PickupTypes.PickupRequest) : Bool { r.status == #pending })
      .map<PickupTypes.PickupRequest, PickupTypes.PickupRequestPublic>(toPublic)
      .toArray();
  };

  public func listAll(
    requests : PickupList,
  ) : [PickupTypes.PickupRequestPublic] {
    requests.map<PickupTypes.PickupRequest, PickupTypes.PickupRequestPublic>(toPublic).toArray();
  };
};
