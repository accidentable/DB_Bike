/**
 * src/services/post.service.js
 * 게시글 관련 비즈니스 로직 서비스
 * 
 * 역할: 실제 비즈니스 로직을 처리합니다.
 * - 게시글 생성/수정/삭제
 * - 게시글 목록 조회 (필터링, 정렬, 페이지네이션)
 * - 게시글 상세 조회 (조회수 증가)
 * - 권한 검증
 * 
 * 의존성:
 *   - postRepository: 데이터베이스 접근을 위한 Repository
 */

const postRepository = require('../repositories/post.repository');

const postService = {
  /**
   * 게시글 생성
   * 
   * @param {number} memberId - 작성자 ID
   * @param {string} title - 제목
   * @param {string} content - 내용
   * @param {string} category - 카테고리
   * @param {boolean} isPinned - 고정 여부 (관리자만 설정 가능)
   * @param {string} userRole - 사용자 역할 (권한 확인용)
   * @returns {Promise<Object>} - 생성된 게시글 정보
   */
  createPost: async (memberId, title, content, category, isPinned = false, userRole = 'user') => {
    // 권한 검증: 일반 사용자는 고정 게시글을 생성할 수 없음
    if (isPinned && userRole !== 'admin') {
      throw new Error('Only administrators can create pinned posts.');
    }

    // 입력값 검증
    if (!title || !title.trim()) {
      throw new Error('Title is required.');
    }
    if (!content || !content.trim()) {
      throw new Error('Content is required.');
    }
    if (!category) {
      throw new Error('Category is required.');
    }

    // Repository를 통해 게시글 생성
    const newPost = await postRepository.createPost(
      memberId,
      title.trim(),
      content.trim(),
      category,
      isPinned
    );

    return newPost;
  },

  /**
   * 게시글 목록 조회
   * 
   * @param {Object} options - 조회 옵션
   *   - category: string (선택) - 카테고리 필터
   *   - sortBy: string (선택) - 정렬 기준
   *   - page: number (선택) - 페이지 번호
   *   - limit: number (선택) - 페이지당 항목 수
   *   - searchQuery: string (선택) - 검색어
   * @returns {Promise<Object>} - 게시글 목록과 메타 정보
   */
  getPosts: async (options = {}) => {
    // Repository를 통해 게시글 목록 조회
    const result = await postRepository.findAll(options);

    // 응답 데이터 가공
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

  /**
   * 게시글 상세 조회
   * 
   * @param {number} postId - 게시글 ID
   * @returns {Promise<Object>} - 게시글 상세 정보
   */
  getPostById: async (postId) => {
    // 게시글 조회
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('Post not found.');
    }

    // 조회수 증가 (비동기로 처리하여 응답 속도 향상)
    postRepository.incrementViews(postId).catch(err => {
      console.error('Error incrementing views:', err);
      // 조회수 증가 실패해도 게시글은 반환
    });

    return post;
  },

  /**
   * 게시글 수정
   * 
   * @param {number} postId - 게시글 ID
   * @param {number} memberId - 요청한 사용자 ID
   * @param {string} title - 제목
   * @param {string} content - 내용
   * @param {string} category - 카테고리
   * @param {string} userRole - 사용자 역할
   * @returns {Promise<Object>} - 수정된 게시글 정보
   */
  updatePost: async (postId, memberId, title, content, category, userRole = 'user') => {
    // 게시글 조회
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('Post not found.');
    }

    // 권한 검증: 작성자 또는 관리자만 수정 가능
    if (post.member_id !== memberId && userRole !== 'admin') {
      throw new Error('You do not have permission to edit this post.');
    }

    // 입력값 검증
    if (!title || !title.trim()) {
      throw new Error('Title is required.');
    }
    if (!content || !content.trim()) {
      throw new Error('Content is required.');
    }
    if (!category) {
      throw new Error('Category is required.');
    }

    // Repository를 통해 게시글 수정
    const updatedPost = await postRepository.updatePost(
      postId,
      title.trim(),
      content.trim(),
      category
    );

    return updatedPost;
  },

  /**
   * 게시글 삭제
   * 
   * @param {number} postId - 게시글 ID
   * @param {number} memberId - 요청한 사용자 ID
   * @param {string} userRole - 사용자 역할
   * @returns {Promise<void>}
   */
  deletePost: async (postId, memberId, userRole = 'user') => {
    // 게시글 조회
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('Post not found.');
    }

    // 권한 검증: 작성자 또는 관리자만 삭제 가능
    if (post.member_id !== memberId && userRole !== 'admin') {
      throw new Error('You do not have permission to delete this post.');
    }

    // Repository를 통해 게시글 삭제
    await postRepository.deletePost(postId);
  },

  /**
   * 게시글 고정/고정 해제 (관리자 전용)
   * 
   * @param {number} postId - 게시글 ID
   * @param {boolean} isPinned - 고정 여부
   * @param {string} userRole - 사용자 역할
   * @returns {Promise<Object>} - 업데이트된 게시글 정보
   */
  togglePinned: async (postId, isPinned, userRole = 'user') => {
    // 권한 검증: 관리자만 가능
    if (userRole !== 'admin') {
      throw new Error('Only administrators can pin posts.');
    }

    // 게시글 조회
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('Post not found.');
    }

    // Repository를 통해 고정 상태 업데이트
    const updatedPost = await postRepository.updatePinnedStatus(postId, isPinned);

    return updatedPost;
  },
};

module.exports = postService;

