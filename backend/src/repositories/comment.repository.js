/**
 * src/repositories/comment.repository.js
 * 댓글 데이터베이스 접근 계층 (Repository/DAO)
 */

const pool = require('../config/db.config');

const commentRepository = {
  /**
   * 댓글 작성
   */
  createComment: async (postId, memberId, content) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 댓글 삽입
      const insertQuery = `
        INSERT INTO comments (post_id, member_id, content)
        VALUES ($1, $2, $3)
        RETURNING comment_id, post_id, member_id, content, created_at, updated_at
      `;
      const commentResult = await client.query(insertQuery, [postId, memberId, content]);

      // 2. 게시글의 댓글 수 증가
      const updateQuery = `
        UPDATE posts
        SET comments_count = comments_count + 1
        WHERE post_id = $1
      `;
      await client.query(updateQuery, [postId]);

      await client.query('COMMIT');
      return commentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating comment:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * 게시글의 댓글 목록 조회
   */
  findByPostId: async (postId) => {
    try {
      const query = `
        SELECT 
          c.comment_id,
          c.post_id,
          c.member_id,
          c.content,
          c.created_at,
          c.updated_at,
          m.username,
          m.email
        FROM comments c
        INNER JOIN members m ON c.member_id = m.member_id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
      `;
      const { rows } = await pool.query(query, [postId]);
      return rows;
    } catch (error) {
      console.error('Error finding comments:', error);
      throw error;
    }
  },

  /**
   * 댓글 삭제
   */
  deleteComment: async (commentId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 댓글 정보 조회 (post_id 가져오기)
      const selectQuery = 'SELECT post_id FROM comments WHERE comment_id = $1';
      const selectResult = await client.query(selectQuery, [commentId]);
      
      if (selectResult.rows.length === 0) {
        throw new Error('댓글을 찾을 수 없습니다.');
      }
      
      const postId = selectResult.rows[0].post_id;

      // 2. 댓글 삭제
      const deleteQuery = 'DELETE FROM comments WHERE comment_id = $1';
      await client.query(deleteQuery, [commentId]);

      // 3. 게시글의 댓글 수 감소
      const updateQuery = `
        UPDATE posts
        SET comments_count = GREATEST(comments_count - 1, 0)
        WHERE post_id = $1
      `;
      await client.query(updateQuery, [postId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting comment:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * 댓글 ID로 조회
   */
  findById: async (commentId) => {
    try {
      const query = 'SELECT * FROM comments WHERE comment_id = $1';
      const { rows } = await pool.query(query, [commentId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding comment by id:', error);
      throw error;
    }
  }
};

module.exports = commentRepository;

