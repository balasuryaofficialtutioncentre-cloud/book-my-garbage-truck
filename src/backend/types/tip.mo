import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type TipProvider = {
    #phonePe;
    #gPay;
    #paytm;
    #postOfficeSavings;
    #other : Text;
  };

  public type Tip = {
    id : Nat;
    customerId : UserId;
    driverId : UserId;
    amount : Nat;         // in paise / smallest unit
    provider : TipProvider;
    timestamp : Timestamp;
  };

  public type TipPublic = {
    id : Nat;
    customerId : UserId;
    driverId : UserId;
    amount : Nat;
    provider : TipProvider;
    timestamp : Timestamp;
  };

  public type SubmitTipInput = {
    driverId : UserId;
    amount : Nat;
    provider : TipProvider;
  };
};
