import ComplaintTypes "../types/complaint";
import CommonTypes "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type ComplaintList = List.List<ComplaintTypes.Complaint>;

  func toPublic(c : ComplaintTypes.Complaint) : ComplaintTypes.ComplaintPublic {
    {
      id = c.id;
      customerId = c.customerId;
      category = c.category;
      text = c.text;
      timestamp = c.timestamp;
    };
  };

  public func submitComplaint(
    complaints : ComplaintList,
    counter : { var next : Nat },
    caller : CommonTypes.UserId,
    input : ComplaintTypes.SubmitComplaintInput,
  ) : Nat {
    let id = counter.next;
    counter.next += 1;
    let c : ComplaintTypes.Complaint = {
      id = id;
      customerId = caller;
      category = input.category;
      text = input.text;
      timestamp = Time.now();
    };
    complaints.add(c);
    id;
  };

  public func listComplaints(
    complaints : ComplaintList,
  ) : [ComplaintTypes.ComplaintPublic] {
    complaints.map<ComplaintTypes.Complaint, ComplaintTypes.ComplaintPublic>(toPublic).toArray();
  };
};
