import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ComplaintCategory = {
    #missedPickup;
    #driverBehavior;
    #vehicleCondition;
    #other : Text;
  };

  public type Complaint = {
    id : Nat;
    customerId : UserId;
    category : ComplaintCategory;
    text : Text;
    timestamp : Timestamp;
  };

  public type ComplaintPublic = {
    id : Nat;
    customerId : UserId;
    category : ComplaintCategory;
    text : Text;
    timestamp : Timestamp;
  };

  public type SubmitComplaintInput = {
    category : ComplaintCategory;
    text : Text;
  };
};
