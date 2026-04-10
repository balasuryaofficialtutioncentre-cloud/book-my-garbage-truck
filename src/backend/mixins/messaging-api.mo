import CommonTypes "../types/common";
import MsgTypes "../types/messaging";
import MsgLib "../lib/messaging";
import List "mo:core/List";

mixin (
  messages : List.List<MsgTypes.Message>,
  msgCounter : { var next : Nat },
) {

  /// Send a message to another user.
  public shared ({ caller }) func sendMessage(
    receiverId : CommonTypes.UserId,
    text : Text,
  ) : async Nat {
    MsgLib.sendMessage(messages, msgCounter, caller, receiverId, text);
  };

  /// Get message thread between caller and another user.
  public shared query ({ caller }) func getMessageThread(
    otherId : CommonTypes.UserId,
  ) : async [MsgTypes.MessagePublic] {
    MsgLib.getThread(messages, caller, otherId);
  };

  /// Mark all messages from a sender as read.
  public shared ({ caller }) func markThreadRead(senderId : CommonTypes.UserId) : async () {
    MsgLib.markRead(messages, caller, senderId);
  };

  /// Count unread messages from a specific sender.
  public shared query ({ caller }) func unreadMessageCount(
    senderId : CommonTypes.UserId,
  ) : async Nat {
    MsgLib.unreadCount(messages, caller, senderId);
  };
};
