import CloseIcon from "../../UIComponents/Icons/Close";
import tripsService from "../../../services/tripsService";
import "./style.css";
import { MdDelete } from "react-icons/md";

interface Comment {
  _id?: string;
  imgUrl?: string;
  ownerId?: string;
  owner?: string;
  comment: string;
  date: string;
}

interface ViewCommentProps {
  comments?: Comment[];
  closeComments: () => void;
  tripId: string;
  onCommentDeleted: () => void;
}

const ViewComment = ({
  comments = [],
  closeComments,
  tripId,
  onCommentDeleted,
}: ViewCommentProps) => {
  const loggedUserId = localStorage.getItem("loggedUserId");

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await tripsService.deleteComment(tripId, commentId);
        console.log(`Comment with ID: ${commentId} deleted successfully.`);
        onCommentDeleted();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  return (
    <section className="comments-section flex-center-column-large-gap">
      <div className="close-comments">
        <CloseIcon color="#fff" onClose={closeComments} />
      </div>
      {comments.map(
        (comment, index) =>
          comment ? ( // לוודא שהתגובה לא ריקה
            <div key={index} className="comment-container">
              <img
                className="user-comment-img"
                src={comment.imgUrl || "/images/user.png"}
                alt="Profile"
              />
              <div className="comment-content">
                <p>{comment.comment}</p>
                <div className="comment-details">
                  <p className="comment-owner">{comment.owner}</p>
                  <p className="comment-date">
                    <p className="comment-date">
                      <p className="comment-date">
                        {new Date(comment.date).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </p>
                  </p>
                </div>
                {comment.ownerId === loggedUserId && (
                  <MdDelete
                    onClick={() => handleDeleteComment(comment._id!)}
                    className="delete-comment-icon"
                  />
                )}
              </div>
            </div>
          ) : null // במידה והתגובה ריקה, לא להציג אותה
      )}
    </section>
  );
};

export default ViewComment;
