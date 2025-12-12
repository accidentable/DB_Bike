/**
 * src/services/like.service.js
 * 좋아요 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - toggleLike: 좋아요 토글 (추가/취소)
 * - getLikeInfo: 게시글의 좋아요 정보 조회
 */

const likeRepository = require('../repositories/like.repository');

const likeService = {
  // 좋아요 토글 (추가/취소)
  toggleLike: async (postId, memberId) => {
    const isLiked = await likeRepository.checkLiked(postId, memberId);

    if (isLiked) {
      await likeRepository.removeLike(postId, memberId);
      return { liked: false, message: '좋아요를 취소했습니다.' };
    } else {
      await likeRepository.addLike(postId, memberId);
      return { liked: true, message: '좋아요를 눌렀습니다.' };
    }
  },

  // 게시글의 좋아요 정보 조회
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

