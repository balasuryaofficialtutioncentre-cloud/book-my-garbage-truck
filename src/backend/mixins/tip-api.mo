import CommonTypes "../types/common";
import TipTypes "../types/tip";
import MsgTypes "../types/messaging";
import TipLib "../lib/tip";
import List "mo:core/List";

mixin (
  tips : List.List<TipTypes.Tip>,
  messages : List.List<MsgTypes.Message>,
  tipCounter : { var next : Nat },
  msgCounter : { var next : Nat },
) {

  /// Customer: submit a tip to a driver. Auto-sends thank-you message.
  public shared ({ caller }) func submitTip(input : TipTypes.SubmitTipInput) : async Nat {
    TipLib.submitTip(tips, messages, tipCounter, msgCounter, caller, input);
  };

  /// Driver: list tips received.
  public shared query ({ caller }) func listMyTips() : async [TipTypes.TipPublic] {
    TipLib.listTipsByDriver(tips, caller);
  };
};
