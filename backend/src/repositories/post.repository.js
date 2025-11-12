/**
 * src/repositories/post.repository.js
 * 게시글(Post) 데이터베이스 접근 계층 (Repository/DAO)
 * * 역할: 데이터베이스와 직접 통신하는 계층입니다.
 * - SQL 쿼리 실행
 * - 데이터베이스 결과를 JavaScript 객체로 변환
 * - 에러 처리 및 로깅
 * * 의존성:
 * - db.config: PostgreSQL 연결 풀 (Pool 객체)
 */

const pool = require('../config/db.config');

const postRepository = {
  /**
   * 새 게시글 생성
   * * @param {number} memberId - 작성자 ID
   * @param {string} title - 게시글 제목
   * @param {string} content - 게시글 내용
   * @param {string} category - 게시글 카테고리 (notice, event, review 등)
   * @param {boolean} isPinned - 고정 여부 (기본값: false)
   * @returns {Promise<Object>} - 생성된 게시글 정보
   */
  createPost: async (memberId, title, content, category, isPinned = false, images = [], attachments = []) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const postQuery = `
        INSERT INTO posts (member_id, title, content, category, is_pinned)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING post_id, member_id, title, content, category, views, likes, comments_count, is_pinned, created_at, updated_at;
      `;
      const postValues = [memberId, title, content, category, isPinned];
      const { rows } = await client.query(postQuery, postValues);
      const newPost = rows[0];

      if (images.length > 0) {
        const imageQuery = `
          INSERT INTO post_images (post_id, image_url)
          SELECT $1, unnest($2::text[])
        `;
        await client.query(imageQuery, [newPost.post_id, images]);
      }

      if (attachments.length > 0) {
        for (const attachment of attachments) {
          const attachmentQuery = `
            INSERT INTO post_attachments (post_id, file_name, file_path, file_size, file_type)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(attachmentQuery, [
            newPost.post_id,
            attachment.fileName,
            attachment.filePath,
            attachment.fileSize,
            attachment.fileType
          ]);
        }
      }

      await client.query('COMMIT');
      
      newPost.images = images;
      newPost.attachments = attachments;
      return newPost;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating post with files:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * 게시글 목록 조회 (필터링, 정렬, 페이지네이션)
   * * @param {Object} options - 조회 옵션
   * - category: string (선택) - 카테고리 필터
   * - sortBy: string (선택) - 정렬 기준 ('latest', 'views', 'likes')
   * - page: number (선택) - 페이지 번호 (기본값: 1)
   * - limit: number (선택) - 페이지당 항목 수 (기본값: 10)
   * - searchQuery: string (선택) - 검색어 (제목/내용 검색)
   * @returns {Promise<Object>} - 게시글 목록과 총 개수
   * {
   * posts: Array,  // 게시글 배열
   * total: number, // 전체 게시글 수
   * page: number,  // 현재 페이지
   * limit: number  // 페이지당 항목 수
   * }
   */
  findAll: async (options = {}) => {
    try {
      const {
        category,
        sortBy = 'latest',
        page = 1,
        limit = 10,
        searchQuery
      } = options;

      // WHERE 조건 구성
      const whereConditions = [];
      const queryParams = [];
      let paramIndex = 1;

      // 카테고리 필터
      if (category) {
        whereConditions.push(`p.category = $${paramIndex}`);
        queryParams.push(category);
        paramIndex++;
      }

      // 검색어 필터 (제목 또는 내용에서 검색)
      if (searchQuery) {
        whereConditions.push(`(p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`);
        queryParams.push(`%${searchQuery}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // 정렬 기준 설정
      let orderBy;
      switch (sortBy) {
        case 'views':
          orderBy = 'p.views DESC, p.created_at DESC';
          break;
        case 'likes':
          orderBy = 'p.likes DESC, p.created_at DESC';
          break;
        case 'latest':
        default:
          orderBy = 'p.is_pinned DESC, p.created_at DESC';
          break;
      }

      // 전체 개수 조회
      const countQuery = `
        SELECT COUNT(*) as total
        FROM posts p
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // 게시글 목록 조회 (작성자 정보 포함)
      const offset = (page - 1) * limit;
      const query = `
        SELECT 
          p.post_id,
          p.member_id,
          p.title,
          p.content,
          p.category,
          p.views,
          p.likes,
          p.comments_count,
          p.is_pinned,
          p.created_at,
          p.updated_at,
          m.username,
          m.email,
          COALESCE(
            (
              SELECT ARRAY_AGG(pi.image_url)
              FROM post_images pi
              WHERE pi.post_id = p.post_id
            ),
            '{}'::text[]
          ) AS images
        FROM posts p
        INNER JOIN members m ON p.member_id = m.member_id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);
      
      const { rows } = await pool.query(query, queryParams);

      return {
        posts: rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error finding posts:', error);
      throw error;
    }
  },

  /**
   * 게시글 ID로 상세 조회
   * * @param {number} postId - 게시글 ID
   * @returns {Promise<Object|undefined>} - 게시글 정보 또는 undefined
   */
  findById: async (postId) => {
    try {
      const query = `
        SELECT 
          p.post_id,
          p.member_id,
          p.title,
          p.content,
          p.category,
          p.views,
          p.likes,
          p.comments_count,
          p.is_pinned,
          p.created_at,
          p.updated_at,
          m.username,
          m.email,
          COALESCE(
            (
              SELECT ARRAY_AGG(pi.image_url)
              FROM post_images pi
              WHERE pi.post_id = p.post_id
            ),
            '{}'::text[]
          ) AS images,
          COALESCE(
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'attachment_id', pa.attachment_id,
                  'file_name', pa.file_name,
                  'file_path', pa.file_path,
                  'file_size', pa.file_size,
                  'file_type', pa.file_type,
                  'created_at', pa.created_at
                )
              )
              FROM post_attachments pa
              WHERE pa.post_id = p.post_id
            ),
            '[]'::json
          ) AS attachments
        FROM posts p
        INNER JOIN members m ON p.member_id = m.member_id
        WHERE p.post_id = $1
      `;
      const { rows } = await pool.query(query, [postId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding post by id:', error);
      throw error;
    }
  },

  /**
   * 조회수 증가
   * * @param {number} postId - 게시글 ID
   * @returns {Promise<void>}
   */
  incrementViews: async (postId) => {
    try {
      const query = `
        UPDATE posts
        SET views = views + 1
        WHERE post_id = $1
      `;
      await pool.query(query, [postId]);
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  },

  /**
   * 게시글 수정
   * * @param {number} postId - 게시글 ID
   * @param {string} title - 제목
   * @param {string} content - 내용
   * @param {string} category - 카테고리
   * @returns {Promise<Object>} - 수정된 게시글 정보
   */
  updatePost: async (postId, title, content, category, newImages = [], deleteImages = [], newAttachments = [], deleteAttachments = []) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const postQuery = `
        UPDATE posts
        SET title = $1, content = $2, category = $3, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $4
        RETURNING post_id, member_id, title, content, category, views, likes, comments_count, is_pinned, created_at, updated_at;
      `;
      const { rows } = await client.query(postQuery, [title, content, category, postId]);
      const updatedPost = rows[0];

      // 이미지 삭제
      if (deleteImages.length > 0) {
        const deleteQuery = `
          DELETE FROM post_images
          WHERE post_id = $1 AND image_url = ANY($2::text[])
        `;
        await client.query(deleteQuery, [postId, deleteImages]);
      }

      // 새 이미지 추가
      if (newImages.length > 0) {
        const imageQuery = `
          INSERT INTO post_images (post_id, image_url)
          SELECT $1, unnest($2::text[])
        `;
        await client.query(imageQuery, [postId, newImages]);
      }

      // 첨부파일 삭제
      if (deleteAttachments.length > 0) {
        const deleteAttachQuery = `
          DELETE FROM post_attachments
          WHERE post_id = $1 AND attachment_id = ANY($2::int[])
        `;
        await client.query(deleteAttachQuery, [postId, deleteAttachments]);
      }

      // 새 첨부파일 추가
      if (newAttachments.length > 0) {
        for (const attachment of newAttachments) {
          const attachmentQuery = `
            INSERT INTO post_attachments (post_id, file_name, file_path, file_size, file_type)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(attachmentQuery, [
            postId,
            attachment.fileName,
            attachment.filePath,
            attachment.fileSize,
            attachment.fileType
          ]);
        }
      }

      await client.query('COMMIT');

      // 최종 이미지 목록
      const imageQuery = 'SELECT image_url FROM post_images WHERE post_id = $1';
      const imageResult = await client.query(imageQuery, [postId]);
      updatedPost.images = imageResult.rows.map(row => row.image_url);

      // 최종 첨부파일 목록
      const attachQuery = 'SELECT * FROM post_attachments WHERE post_id = $1';
      const attachResult = await client.query(attachQuery, [postId]);
      updatedPost.attachments = attachResult.rows;

      return updatedPost;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating post with files:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * 게시글 삭제
   * * @param {number} postId - 게시글 ID
   * @returns {Promise<void>}
   */
  deletePost: async (postId) => {
    try {
      const query = 'DELETE FROM posts WHERE post_id = $1';
      await pool.query(query, [postId]);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  /**
   * 게시글 고정/고정 해제 (관리자 전용)
   * * @param {number} postId - 게시글 ID
   * @param {boolean} isPinned - 고정 여부
   * @returns {Promise<Object>} - 업데이트된 게시글 정보
   */
  updatePinnedStatus: async (postId, isPinned) => {
    try {
      const query = `
        UPDATE posts
        SET is_pinned = $1, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $2
        RETURNING post_id, is_pinned;
      `;
      const { rows } = await pool.query(query, [isPinned, postId]);
      return rows[0];
    } catch (error) {
      console.error('Error updating pinned status:', error);
      throw error;
    }
  },

  /**
   * 고정된 게시글 목록 조회
   * @returns {Promise<Array>} - 고정된 게시글 배열
   */
  findPinnedPosts: async () => {
    try {
      const query = `
        SELECT 
          p.post_id,
          p.member_id,
          p.title,
          p.content,
          p.category,
          p.views,
          p.likes,
          p.comments_count,
          p.is_pinned,
          p.created_at,
          p.updated_at,
          m.username,
          m.email,
          COALESCE(
            (
              SELECT ARRAY_AGG(pi.image_url)
              FROM post_images pi
              WHERE pi.post_id = p.post_id
            ),
            '{}'::text[]
          ) AS images
        FROM posts p
        INNER JOIN members m ON p.member_id = m.member_id
        WHERE p.is_pinned = TRUE
        ORDER BY p.created_at DESC;
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error finding pinned posts:', error);
      throw error;
    }
  },

  /**
   * 첨부파일 ID로 조회
   * @param {number} attachmentId - 첨부파일 ID
   * @returns {Promise<Object|undefined>} - 첨부파일 정보 또는 undefined
   */
  findAttachmentById: async (attachmentId) => {
    try {
      const query = `
        SELECT 
          attachment_id,
          post_id,
          file_name,
          file_path,
          file_size,
          file_type,
          created_at
        FROM post_attachments
        WHERE attachment_id = $1
      `;
      const { rows } = await pool.query(query, [attachmentId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding attachment by id:', error);
      throw error;
    }
  },
};

module.exports = postRepository;