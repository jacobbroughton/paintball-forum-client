import { useEffect, useState } from "react";
import { Comment } from "../Comment/Comment";
import { supabase } from "../../../utils/supabase";
import { useSelector } from "react-redux";
import { CommentsIcon } from "../Icons/CommentsIcon";
import "./CommentsList.css";
import { useNotification } from "../../../hooks/useNotification";

export const CommentsList = ({
  passedComments,
  handleDeleteComment,
  handleRepliesClickFromRootLevel,
  isRootLevel,
  setRootLevelComments,
  setError,
  getComments,
  repliesLoadingFromRootLevel,
  commentIdWithRepliesOpening,
  postType,
}) => {
  const { createNotification } = useNotification();
  const [localComments, setLocalComments] = useState(passedComments);
  const [commentWithReplyWindowID, setCommentWithReplyWindowID] = useState(null);
  const [newReplyBody, setNewReplyBody] = useState("");
  const [repliesLoading, setRepliesLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    setLocalComments(passedComments);
  }, [passedComments]);

  async function handleReplySubmit(e, repliedComment) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/add-comment", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          p_body: newReplyBody,
          p_created_by_id: user.auth_id,
          p_item_id: repliedComment.item_id,
          p_parent_id: repliedComment.id,
          p_post_type: postType,
        }),
      });

      if (!response.ok) throw new Error("Something happened at CommentsList add-comment");

      const data = await response.json();

      const { data: data3, error: error3 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      data[0] = {
        ...data[0],
        profile_picture_url: data3.publicUrl,
      };

      if (error3) throw error.message;

      if (repliedComment.created_by_id != user.auth_id) {
        await createNotification(user.auth_id, repliedComment.createdById, data[0].id, 2);
      }

      setCommentWithReplyWindowID(null);
      setLocalComments(
        localComments.map((comment) => {
          return {
            ...comment,
            ...(comment.id == repliedComment.id && {
              replies: [...(comment.replies || []), data[0]],
              reply_count: comment.reply_count ? comment.reply_count + 1 : 1,
            }),
          };
        })
      );

      setNewReplyBody("");
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleRepliesClick(e, commentWithReplies) {
    e.preventDefault();
    try {
      if (!commentWithReplies.repliesToggled) {
        setRepliesLoading(true);

        const queryParams = new URLSearchParams({
          item_id: commentWithReplies.item_id,
          parent_comment_id: commentWithReplies.id,
          post_type: postType,
        }).toString();

        const response = await fetch(
          `http://localhost:4000/get-child-comments/${queryParams}`
        );

        if (!response.ok) throw new Error("Something happened at get-child-comments");

        const data = await response.json();

        const replies = data.map((comment) => {
          const { data: data2, error: error2 } = supabase.storage
            .from("profile_pictures")
            .getPublicUrl(
              comment.profile_picture_path || "placeholders/user-placeholder"
            );

          if (error2) throw error.message;

          return {
            ...comment,
            profile_picture_url: data2.publicUrl,
          };
        });

        if (error) throw error.message;

        const updatedComments = localComments.map((comm) => {
          return {
            ...comm,
            tier: comm.tier + 1,
            ...(comm.id == commentWithReplies.id && {
              replies: replies,
              repliesToggled: !comm.repliesToggled,
            }),
          };
        });

        if (isRootLevel) {
          setRootLevelComments(updatedComments);
        } else {
          setLocalComments(updatedComments);
        }
      } else {
        const updatedComments = localComments.map((comm) => {
          return {
            ...comm,
            tier: comm.tier + 1,
            ...(comm.id == commentWithReplies.id && {
              replies: [],
              repliesToggled: !comm.repliesToggled,
            }),
          };
        });

        setLocalComments(updatedComments);
      }
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setRepliesLoading(false);
  }
  return (
    <div className={`comments-list ${isRootLevel ? "is-root-level" : ""}`}>
      {!localComments || localComments?.length == 0 ? (
        <div className="no-comments-container">
          <CommentsIcon />
          <p>No Comments Yet</p>
          <p>Be the first to share what you think!</p>
        </div>
      ) : (
        localComments.map((comment) => {
          return (
            <>
              <Comment
                comment={comment}
                commentWithReplyWindowID={commentWithReplyWindowID}
                setCommentWithReplyWindowID={setCommentWithReplyWindowID}
                handleCommentSubmit={(e) => handleReplySubmit(e, comment)}
                setNewReplyBody={setNewReplyBody}
                handleRepliesClick={
                  isRootLevel ? handleRepliesClickFromRootLevel : handleRepliesClick
                }
                handleDeleteComment={handleDeleteComment}
                newReplyBody={newReplyBody}
                isRootLevel={isRootLevel}
                setRootLevelComments={setRootLevelComments}
                getComments={getComments}
                setError={setError}
                repliesLoading={
                  isRootLevel
                    ? commentIdWithRepliesOpening == comment.id &&
                      repliesLoadingFromRootLevel
                    : repliesLoading
                }
                postType={postType}
              />
            </>
          );
        })
      )}
    </div>
  );
};
