import api from "./api";

export const postService = {
  // Récupère les posts avec support recherche, tri et pagination
  getAllPosts: async ({ search = '', sort = 'date', page = 1 } = {}) => {
    const params = { page };
    if (search) params.search = search;
    if (sort) params.sort = sort;
    const response = await api.get("/posts", { params });
    return response.data; // { data, current_page, last_page, total }
  },

  // Crée un post avec image optionnelle (multipart/form-data)
  createPost: async (content, imageFile = null) => {
    const formData = new FormData();
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    const response = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updatePost: async (postId, content) => {
    const response = await api.put(`/posts/${postId}`, { content });
    return response.data;
  },

  deletePost: async (postId) => {
    await api.delete(`/posts/${postId}`);
  },

  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
};

export const userService = {
  // Upload de la photo de profil
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

