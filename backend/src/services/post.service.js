/**
 * src/services/post.service.js
 * 게시글 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - createPost: 게시글 생성
 * - getPosts: 게시글 목록 조회 (필터링, 정렬, 페이지네이션)
 * - getPostById: 게시글 상세 조회 (조회수 증가)
 * - updatePost: 게시글 수정
 * - deletePost: 게시글 삭제
 * - togglePinned: 게시글 고정/고정 해제 (관리자 전용)
 * - getPinnedPosts: 고정된 게시글 목록 조회
 * - getAttachment: 첨부파일 조회
 */

const postRepository = require('../repositories/post.repository');

const postService = {
  // 게시글 생성
  createPost: async (memberId, title, content, category, isPinned = false, userRole = 'user', images = [], attachments = []) => {
    if (isPinned && userRole !== 'admin') {
      throw new Error('고정 게시글은 관리자만 생성할 수 있습니다.');
    }

    if (!title || !title.trim()) {
      throw new Error('제목을 입력해주세요.');
    }
    if (!content || !content.trim()) {
      throw new Error('내용을 입력해주세요.');
    }
    if (!category) {
      throw new Error('카테고리를 선택해주세요.');
    }

    const newPost = await postRepository.createPost(
      memberId,
      title.trim(),
      content.trim(),
      category,
      isPinned,
      images,
      attachments
    );

    return newPost;
  },

  // 게시글 목록 조회
  getPosts: async (options = {}) => {
    const result = await postRepository.findAll(options);

    return {
      posts: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  },

  // 게시글 상세 조회
  getPostById: async (postId) => {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    postRepository.incrementViews(postId).catch(err => {
      console.error('Error incrementing views:', err);
    });

    return post;
  },

  // 게시글 수정
  updatePost: async (postId, memberId, title, content, category, userRole = 'user', newImages = [], deleteImages = [], newAttachments = [], deleteAttachments = []) => {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    if (post.member_id !== memberId && userRole !== 'admin') {
      throw new Error('게시글을 수정할 권한이 없습니다.');
    }

    if (!title || !title.trim()) {
      throw new Error('제목을 입력해주세요.');
    }
    if (!content || !content.trim()) {
      throw new Error('내용을 입력해주세요.');
    }
    if (!category) {
      throw new Error('카테고리를 선택해주세요.');
    }

    const updatedPost = await postRepository.updatePost(
      postId,
      title.trim(),
      content.trim(),
      category,
      newImages,
      deleteImages,
      newAttachments,
      deleteAttachments
    );

    return updatedPost;
  },

  // 게시글 삭제
  deletePost: async (postId, memberId, userRole = 'user') => {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    if (post.member_id !== memberId && userRole !== 'admin') {
      throw new Error('게시글을 삭제할 권한이 없습니다.');
    }

    await postRepository.deletePost(postId);
  },

  // 게시글 고정/고정 해제
  togglePinned: async (postId, isPinned, userRole = 'user') => {
    if (userRole !== 'admin') {
      throw new Error('관리자만 게시글을 고정할 수 있습니다.');
    }

    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const updatedPost = await postRepository.updatePinnedStatus(postId, isPinned);

    return updatedPost;
  },

  // 고정된 게시글 목록 조회
  getPinnedPosts: async () => {
    const pinnedPosts = await postRepository.findPinnedPosts();
    return pinnedPosts;
  },

  // 첨부파일 조회
  getAttachment: async (attachmentId) => {
    const attachment = await postRepository.findAttachmentById(attachmentId);
    return attachment;
  },
};

module.exports = postService;