import CommonTypes "../types/common";
import ComplaintTypes "../types/complaint";
import ComplaintLib "../lib/complaint";
import List "mo:core/List";

mixin (
  complaints : List.List<ComplaintTypes.Complaint>,
  complaintCounter : { var next : Nat },
) {

  /// Customer: submit a complaint.
  public shared ({ caller }) func submitComplaint(
    input : ComplaintTypes.SubmitComplaintInput,
  ) : async Nat {
    ComplaintLib.submitComplaint(complaints, complaintCounter, caller, input);
  };

  /// Owner: list all complaints.
  public shared query ({ caller }) func listComplaints() : async [ComplaintTypes.ComplaintPublic] {
    ComplaintLib.listComplaints(complaints);
  };
};
