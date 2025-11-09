/**
 * src/services/like.service.js
 * 좋아요 비즈니스 로직 계층
 */

const likeRepository = require('../repositories/like.repository');

const likeService = {
  /**
   * 좋아요 토글 (추가/취소)
   */
  toggleLike: async (postId, memberId) => {
    // 현재 좋아요 상태 확인
    const isLiked = await likeRepository.checkLiked(postId, memberId);

    if (isLiked) {
      // 이미 좋아요를 눌렀다면 취소
      await likeRepository.removeLike(postId, memberId);
      return { liked: false, message: '좋아요를 취소했습니다.' };
    } else {
      // 좋아요 추가
      await likeRepository.addLike(postId, memberId);
      return { liked: true, message: '좋아요를 눌렀습니다.' };
    }
  },

  /**
   * 게시글의 좋아요 정보 조회
   */
  getLikeInfo: async (postId, memberId) => {
    const likeCount = await likeRepository.countLikes(postId);
    const isLiked = memberId ? await likeRepository.checkLiked(postId, memberId) : false;

    return {
      likeCount,
      isLiked
    };
  }
};

module.exports = likeService;

