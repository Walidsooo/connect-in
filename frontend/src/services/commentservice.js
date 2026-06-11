import api from "./api";

const commentService = {
  createComment: async (postId, content) => {
    const response = await api.post("/comments", {
      post_id: postId,
      content: content,
    });
    return response.data.comment;
  },

  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data.comment;
  },

  deleteComment: async (commentId) => {
    await api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
