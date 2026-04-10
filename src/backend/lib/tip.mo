import TipTypes "../types/tip";
import MsgTypes "../types/messaging";
import CommonTypes "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type TipList = List.List<TipTypes.Tip>;
  public type MessageList = List.List<MsgTypes.Message>;

  func providerName(p : TipTypes.TipProvider) : Text {
    switch p {
      case (#phonePe) "PhonePe";
      case (#gPay) "GPay";
      case (#paytm) "Paytm";
      case (#postOfficeSavings) "Post Office Savings";
      case (#other(name)) name;
    };
  };

  func toPublic(t : TipTypes.Tip) : TipTypes.TipPublic {
    {
      id = t.id;
      customerId = t.customerId;
      driverId = t.driverId;
      amount = t.amount;
      provider = t.provider;
      timestamp = t.timestamp;
    };
  };

  public func submitTip(
    tips : TipList,
    messages : MessageList,
    tipCounter : { var next : Nat },
    msgCounter : { var next : Nat },
    caller : CommonTypes.UserId,
    input : TipTypes.SubmitTipInput,
  ) : Nat {
    let tipId = tipCounter.next;
    tipCounter.next += 1;
    let now = Time.now();
    let tip : TipTypes.Tip = {
      id = tipId;
      customerId = caller;
      driverId = input.driverId;
      amount = input.amount;
      provider = input.provider;
      timestamp = now;
    };
    tips.add(tip);

    // Auto thank-you message from driver to customer
    let msgId = msgCounter.next;
    msgCounter.next += 1;
    let thankYouText = "Thank you for your generous tip of " # input.amount.toText() #
      " via " # providerName(input.provider) # "! We appreciate your support. 🙏";
    let msg : MsgTypes.Message = {
      id = msgId;
      senderId = input.driverId;
      receiverId = caller;
      text = thankYouText;
      timestamp = now;
      var read = false;
    };
    messages.add(msg);

    tipId;
  };

  public func listTipsByDriver(
    tips : TipList,
    driverId : CommonTypes.UserId,
  ) : [TipTypes.TipPublic] {
    tips
      .filter(func(t : TipTypes.Tip) : Bool { t.driverId == driverId })
      .map<TipTypes.Tip, TipTypes.TipPublic>(toPublic)
      .toArray();
  };
};
