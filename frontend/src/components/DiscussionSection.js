import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./DiscussionSection.css";

const DiscussionSection = ({ problemId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
  });
  const [newComment, setNewComment] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  useEffect(() => {
    if (problemId) {
      fetchDiscussions();
    }
  }, [problemId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/problems/${problemId}/discussions`);
      setDiscussions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching discussions:", err);
      setError("Failed to load discussions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (discussionId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [discussionId]: true }));
      const response = await api.get(
        `/api/problems/discussions/${discussionId}/comments`
      );
      setComments((prev) => ({ ...prev, [discussionId]: response.data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [discussionId]: false }));
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/api/problems/${problemId}/discussions`,
        newDiscussion
      );
      setDiscussions([response.data, ...discussions]);
      setNewDiscussion({ title: "", content: "" });
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError("Failed to create discussion. Please try again.");
    }
  };

  const handleCreateComment = async (e, discussionId) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/api/problems/discussions/${discussionId}/comments`,
        {
          content: newComment,
        }
      );

      // Update comments list
      setComments((prev) => ({
        ...prev,
        [discussionId]: [...(prev[discussionId] || []), response.data],
      }));

      // Update discussion comment count
      setDiscussions((prev) =>
        prev.map((d) => {
          if (d.id === discussionId) {
            return { ...d, comment_count: (d.comment_count || 0) + 1 };
          }
          return d;
        })
      );

      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Failed to create comment. Please try again.");
    }
  };

  const handleViewComments = async (discussionId) => {
    if (selectedDiscussion === discussionId) {
      setSelectedDiscussion(null);
    } else {
      setSelectedDiscussion(discussionId);
      if (!comments[discussionId]) {
        await fetchComments(discussionId);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading discussions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="discussion-section">
      <div className="new-discussion-form">
        <h3>Start a New Discussion</h3>
        <form onSubmit={handleCreateDiscussion}>
          <input
            type="text"
            placeholder="Discussion Title"
            value={newDiscussion.title}
            onChange={(e) =>
              setNewDiscussion({ ...newDiscussion, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Write your discussion here..."
            value={newDiscussion.content}
            onChange={(e) =>
              setNewDiscussion({ ...newDiscussion, content: e.target.value })
            }
            required
          />
          <button type="submit">Create Discussion</button>
        </form>
      </div>

      <div className="discussions-list">
        {discussions.length === 0 ? (
          <div className="no-discussions">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion.id} className="discussion-item">
              <div className="discussion-header">
                <h4>{discussion.title}</h4>
                <span className="discussion-meta">
                  by {discussion.username} on{" "}
                  {new Date(discussion.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="discussion-content">{discussion.content}</div>
              <button
                className="view-comments-btn"
                onClick={() => handleViewComments(discussion.id)}
              >
                {selectedDiscussion === discussion.id
                  ? "Hide Comments"
                  : `View Comments (${discussion.comment_count || 0})`}
              </button>

              {selectedDiscussion === discussion.id && (
                <div className="comments-section">
                  {loadingComments[discussion.id] ? (
                    <div className="loading">Loading comments...</div>
                  ) : (
                    <>
                      <div className="comments-list">
                        {comments[discussion.id]?.length > 0 ? (
                          comments[discussion.id].map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-content">
                                {comment.content}
                              </div>
                              <div className="comment-meta">
                                by {comment.username} on{" "}
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-comments">No comments yet</div>
                        )}
                      </div>
                      <form
                        className="new-comment-form"
                        onSubmit={(e) => handleCreateComment(e, discussion.id)}
                      >
                        <textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                        />
                        <button type="submit">Add Comment</button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionSection;
