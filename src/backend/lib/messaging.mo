import MsgTypes "../types/messaging";
import CommonTypes "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type MessageList = List.List<MsgTypes.Message>;

  func toPublic(m : MsgTypes.Message) : MsgTypes.MessagePublic {
    {
      id = m.id;
      senderId = m.senderId;
      receiverId = m.receiverId;
      text = m.text;
      timestamp = m.timestamp;
      read = m.read;
    };
  };

  func inThread(m : MsgTypes.Message, userA : CommonTypes.UserId, userB : CommonTypes.UserId) : Bool {
    (m.senderId == userA and m.receiverId == userB) or
    (m.senderId == userB and m.receiverId == userA);
  };

  public func sendMessage(
    messages : MessageList,
    counter : { var next : Nat },
    senderId : CommonTypes.UserId,
    receiverId : CommonTypes.UserId,
    text : Text,
  ) : Nat {
    let id = counter.next;
    counter.next += 1;
    let msg : MsgTypes.Message = {
      id = id;
      senderId = senderId;
      receiverId = receiverId;
      text = text;
      timestamp = Time.now();
      var read = false;
    };
    messages.add(msg);
    id;
  };

  public func getThread(
    messages : MessageList,
    userA : CommonTypes.UserId,
    userB : CommonTypes.UserId,
  ) : [MsgTypes.MessagePublic] {
    messages
      .filter(func(m : MsgTypes.Message) : Bool { inThread(m, userA, userB) })
      .map<MsgTypes.Message, MsgTypes.MessagePublic>(toPublic)
      .toArray();
  };

  public func markRead(
    messages : MessageList,
    receiverId : CommonTypes.UserId,
    senderId : CommonTypes.UserId,
  ) {
    messages.mapInPlace(func(m : MsgTypes.Message) : MsgTypes.Message {
      if (m.receiverId == receiverId and m.senderId == senderId and not m.read) {
        m.read := true;
      };
      m;
    });
  };

  public func unreadCount(
    messages : MessageList,
    receiverId : CommonTypes.UserId,
    senderId : CommonTypes.UserId,
  ) : Nat {
    messages.foldLeft<Nat, MsgTypes.Message>(
      0,
      func(acc, m) {
        if (m.receiverId == receiverId and m.senderId == senderId and not m.read) {
          acc + 1;
        } else {
          acc;
        };
      },
    );
  };
};
