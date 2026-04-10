import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Message = {
    id : Nat;
    senderId : UserId;
    receiverId : UserId;
    text : Text;
    timestamp : Timestamp;
    var read : Bool;
  };

  public type MessagePublic = {
    id : Nat;
    senderId : UserId;
    receiverId : UserId;
    text : Text;
    timestamp : Timestamp;
    read : Bool;
  };

  public type ConversationKey = (UserId, UserId);   // always sorted low-high
};
