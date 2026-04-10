import CommonTypes "../types/common";
import PickupTypes "../types/pickup";
import PickupLib "../lib/pickup";
import List "mo:core/List";

mixin (
  pickupRequests : List.List<PickupTypes.PickupRequest>,
  pickupCounter : { var next : Nat },
) {

  /// Customer: create a pickup request.
  public shared ({ caller }) func createPickupRequest(
    input : PickupTypes.CreatePickupInput,
  ) : async Nat {
    PickupLib.createRequest(pickupRequests, pickupCounter, caller, input);
  };

  /// Driver: accept a nearby pickup request.
  public shared ({ caller }) func acceptPickupRequest(requestId : Nat) : async Bool {
    PickupLib.acceptRequest(pickupRequests, caller, requestId);
  };

  /// Driver/Customer: update request status (complete/cancel).
  public shared ({ caller }) func updatePickupStatus(
    requestId : Nat,
    status : PickupTypes.PickupStatus,
  ) : async Bool {
    PickupLib.updateStatus(pickupRequests, requestId, caller, status);
  };

  /// Customer: view own request.
  public shared query ({ caller }) func getMyPickupRequest(requestId : Nat) : async ?PickupTypes.PickupRequestPublic {
    PickupLib.getRequest(pickupRequests, requestId);
  };

  /// Customer: list own requests.
  public shared query ({ caller }) func listMyPickupRequests() : async [PickupTypes.PickupRequestPublic] {
    PickupLib.listByCustomer(pickupRequests, caller);
  };

  /// Driver: list all pending requests.
  public shared query ({ caller }) func listPendingPickupRequests() : async [PickupTypes.PickupRequestPublic] {
    PickupLib.listPending(pickupRequests);
  };

  /// Owner: list all pickup requests.
  public shared query ({ caller }) func listAllPickupRequests() : async [PickupTypes.PickupRequestPublic] {
    PickupLib.listAll(pickupRequests);
  };
};
