/**
 * src/repositories/like.repository.js
 * 좋아요 데이터베이스 접근 계층 (Repository/DAO)
 */

const pool = require('../config/db.config');

const likeRepository = {
  /**
   * 좋아요 추가
   */
  addLike: async (postId, memberId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 좋아요 삽입 (중복 방지: UNIQUE 제약조건)
      const insertQuery = `
        INSERT INTO post_likes (post_id, member_id)
        VALUES ($1, $2)
        ON CONFLICT (post_id, member_id) DO NOTHING
        RETURNING like_id
      `;
      const insertResult = await client.query(insertQuery, [postId, memberId]);

      // 이미 좋아요를 눌렀다면 아무 작업 안 함
      if (insertResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { alreadyLiked: true };
      }

      // 2. 게시글의 좋아요 수 증가
      const updateQuery = `
        UPDATE posts
        SET likes = likes + 1
        WHERE post_id = $1
      `;
      await client.query(updateQuery, [postId]);

      await client.query('COMMIT');
      return { alreadyLiked: false };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding like:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * 좋아요 취소
   */
  removeLike: async (postId, memberId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 좋아요 삭제
      const deleteQuery = `
        DELETE FROM post_likes
        WHERE post_id = $1 AND member_id = $2
        RETURNING like_id
      `;
      const deleteResult = await client.query(deleteQuery, [postId, memberId]);

      // 좋아요가 없었다면 아무 작업 안 함
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { notLiked: true };
      }

      // 2. 게시글의 좋아요 수 감소
      const updateQuery = `
        UPDATE posts
        SET likes = GREATEST(likes - 1, 0)
        WHERE post_id = $1
      `;
      await client.query(updateQuery, [postId]);

      await client.query('COMMIT');
      return { notLiked: false };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error removing like:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * 특정 사용자가 특정 게시글에 좋아요를 눌렀는지 확인
   */
  checkLiked: async (postId, memberId) => {
    try {
      const query = `
        SELECT like_id
        FROM post_likes
        WHERE post_id = $1 AND member_id = $2
      `;
      const { rows } = await pool.query(query, [postId, memberId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking like:', error);
      throw error;
    }
  },

  /**
   * 게시글의 좋아요 수 조회
   */
  countLikes: async (postId) => {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM post_likes
        WHERE post_id = $1
      `;
      const { rows } = await pool.query(query, [postId]);
      return parseInt(rows[0].count);
    } catch (error) {
      console.error('Error counting likes:', error);
      throw error;
    }
  }
};

module.exports = likeRepository;

