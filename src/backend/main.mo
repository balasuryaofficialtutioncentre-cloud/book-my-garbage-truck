import CommonTypes "types/common";
import DriverTypes "types/driver";
import VehicleTypes "types/vehicle";
import PickupTypes "types/pickup";
import MsgTypes "types/messaging";
import TipTypes "types/tip";
import ComplaintTypes "types/complaint";

import AuthMixin "mixins/auth-api";
import DriverMixin "mixins/driver-api";
import VehicleMixin "mixins/vehicle-api";
import PickupMixin "mixins/pickup-api";
import MessagingMixin "mixins/messaging-api";
import TipMixin "mixins/tip-api";
import ComplaintMixin "mixins/complaint-api";

import Map "mo:core/Map";
import List "mo:core/List";

actor {
  // ── Auth state ────────────────────────────────────────────────────────────
  let users = Map.empty<CommonTypes.UserId, CommonTypes.UserProfile>();

  // ── Driver state ──────────────────────────────────────────────────────────
  let driverProfiles = Map.empty<CommonTypes.UserId, DriverTypes.DriverProfile>();
  let driverStates   = Map.empty<CommonTypes.UserId, DriverTypes.DriverState>();

  // ── Vehicle state ─────────────────────────────────────────────────────────
  let vehicles       = List.empty<VehicleTypes.Vehicle>();
  var vehicleCounter = { var next : Nat = 0 };

  // ── Pickup state ──────────────────────────────────────────────────────────
  let pickupRequests = List.empty<PickupTypes.PickupRequest>();
  var pickupCounter  = { var next : Nat = 0 };

  // ── Messaging state ───────────────────────────────────────────────────────
  let messages   = List.empty<MsgTypes.Message>();
  var msgCounter = { var next : Nat = 0 };

  // ── Tip state ─────────────────────────────────────────────────────────────
  let tips       = List.empty<TipTypes.Tip>();
  var tipCounter = { var next : Nat = 0 };

  // ── Complaint state ───────────────────────────────────────────────────────
  let complaints       = List.empty<ComplaintTypes.Complaint>();
  var complaintCounter = { var next : Nat = 0 };

  // ── Mixin composition ─────────────────────────────────────────────────────
  include AuthMixin(users);
  include DriverMixin(driverProfiles, driverStates);
  include VehicleMixin(vehicles, vehicleCounter);
  include PickupMixin(pickupRequests, pickupCounter);
  include MessagingMixin(messages, msgCounter);
  include TipMixin(tips, messages, tipCounter, msgCounter);
  include ComplaintMixin(complaints, complaintCounter);
};
