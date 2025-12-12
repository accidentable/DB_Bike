/**
 * src/services/comment.service.js
 * 댓글 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - createComment: 댓글 작성
 * - getCommentsByPostId: 게시글의 댓글 목록 조회
 * - deleteComment: 댓글 삭제 (작성자 또는 관리자만 가능)
 */

const commentRepository = require('../repositories/comment.repository');

const commentService = {
  // 댓글 작성
  createComment: async (postId, memberId, content) => {
    if (!content || content.trim().length === 0) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    const newComment = await commentRepository.createComment(postId, memberId, content.trim());
    return newComment;
  },

  // 게시글의 댓글 목록 조회
  getCommentsByPostId: async (postId) => {
    const comments = await commentRepository.findByPostId(postId);
    return comments;
  },

  // 댓글 삭제
  deleteComment: async (commentId, memberId, userRole) => {
    const comment = await commentRepository.findById(commentId);
    
    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.member_id !== memberId && userRole !== 'admin') {
      throw new Error('댓글을 삭제할 권한이 없습니다.');
    }

    await commentRepository.deleteComment(commentId);
  }
};

module.exports = commentService;

