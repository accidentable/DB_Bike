/**
 * src/api/post.routes.js
 * 게시글 관련 API 라우터
 * 
 * 주요 엔드포인트:
 * - POST   /api/posts                            - 게시글 작성 (로그인 필요, 이미지/첨부파일 지원)
 * - GET    /api/posts                             - 게시글 목록 조회 (공개, category, sort_by, page, limit, search 파라미터 지원)
 * - GET    /api/posts/pinned                      - 고정된 게시글 목록 조회 (공개)
 * - GET    /api/posts/:id                         - 게시글 상세 조회 (공개)
 * - PUT    /api/posts/:id                         - 게시글 수정 (로그인 필요, 작성자 또는 관리자)
 * - DELETE /api/posts/:id                         - 게시글 삭제 (로그인 필요, 작성자 또는 관리자)
 * - PATCH  /api/posts/:id/pin                     - 게시글 고정/고정 해제 (관리자 전용)
 * - POST   /api/posts/:id/comments                - 댓글 작성 (로그인 필요)
 * - GET    /api/posts/:id/comments                - 게시글의 댓글 목록 조회 (공개)
 * - DELETE /api/posts/:postId/comments/:commentId - 댓글 삭제 (로그인 필요, 작성자 또는 관리자)
 * - POST   /api/posts/:id/like                    - 좋아요 토글 (로그인 필요)
 * - GET    /api/posts/:id/like                    - 게시글의 좋아요 정보 조회 (공개)
 * - GET    /api/posts/attachments/:attachmentId/download - 첨부파일 다운로드 (공개)
 */

const express = require('express');
const router = express.Router();
const postService = require('../services/post.service');
const { verifyToken, isAdmin, optionalVerifyToken } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 이미지와 일반 첨부파일을 구분하여 저장
    if (file.fieldname === 'images') {
      cb(null, 'uploads/images/');
    } else {
      cb(null, 'uploads/attachments/');
    }
  },
  filename: function (req, file, cb) {
    // 파일명에 타임스탬프 추가하여 중복 방지
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 파일 필터링: 허용할 파일 형식 정의
const fileFilter = (req, file, cb) => {
  // 허용할 MIME 타입 목록
  const allowedMimeTypes = [
    // 이미지
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // 문서
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
    // 압축 파일
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // 실행 파일 (주의: 보안상 위험할 수 있음)
    'application/x-msdownload', // .exe
    'application/x-msdos-program',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`지원하지 않는 파일 형식입니다: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 제한
  }
});

/**
 * POST /api/posts
 * 게시글 작성 (이미지 + 첨부파일)
 */
router.post('/', verifyToken, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'attachments', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, content, category, is_pinned } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리를 모두 입력해주세요.'
      });
    }

    // 이미지 파일 처리
    const images = req.files && req.files['images'] 
      ? req.files['images'].map(file => file.path) 
      : [];

    // 첨부파일 처리
    const attachments = req.files && req.files['attachments']
      ? req.files['attachments'].map(file => ({
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          fileType: file.mimetype
        }))
      : [];

    const newPost = await postService.createPost(
      req.user.memberId,
      title,
      content,
      category,
      is_pinned === 'true',
      req.user.role,
      images,
      attachments
    );

    res.status(201).json({
      success: true,
      data: newPost
    });

  } catch (error) {
    const statusCode = error.message.includes('권한') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/posts
 * 게시글 목록 조회
 * * 쿼리 파라미터:
 * - category: string (선택) - 카테고리 필터
 * - sort_by: string (선택) - 정렬 기준 ('latest', 'views', 'likes')
 * - page: number (선택) - 페이지 번호 (기본값: 1)
 * - limit: number (선택) - 페이지당 항목 수 (기본값: 10)
 * - search: string (선택) - 검색어 (제목/내용 검색)
 * * 성공 응답 (200):
 * {
 * success: true,
 * data: {
 * posts: Array,      // 게시글 배열
 * pagination: {
 * total: number,   // 전체 게시글 수
 * page: number,     // 현재 페이지
 * limit: number,    // 페이지당 항목 수
 * totalPages: number // 전체 페이지 수
 * }
 * }
 * }
 */
router.get('/', async (req, res) => {
  try {
    // 1. 쿼리 파라미터 추출
    const {
      category,
      sort_by = 'latest',
      page = 1,
      limit = 10,
      search
    } = req.query;

    // 2. 서비스 계층의 getPosts 함수 호출
    const result = await postService.getPosts({
      category,
      sortBy: sort_by,
      page: parseInt(page),
      limit: parseInt(limit),
      searchQuery: search
    });

    // 3. 성공 응답 반환 (200 OK)
    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    // 4. 에러 처리
    res.status(500).json({
      success: false,
      message: error.message || '게시글 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/posts/pinned
 * 고정된 게시글 목록 조회 (공개)
 * * 성공 응답 (200):
 * {
 * success: true,
 * data: Array // 고정된 게시글 배열
 * }
 */
router.get('/pinned', async (req, res) => {
  try {
    const pinnedPosts = await postService.getPinnedPosts();
    res.status(200).json({
      success: true,
      data: pinnedPosts
    });
  } catch (error) {
    console.error('Error fetching pinned posts:', error);
    res.status(500).json({
      success: false,
      message: error.message || '고정된 게시글을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/posts/:id
 * 게시글 상세 조회
 * * 경로 파라미터:
 * - id: number (필수) - 게시글 ID
 * * 성공 응답 (200):
 * {
 * success: true,
 * data: { 게시글 상세 정보 }
 * }
 * * 실패 응답 (404):
 * {
 * success: false,
 * message: string
 * }
 */
router.get('/:id', async (req, res) => {
  try {
    // 1. 경로 파라미터에서 게시글 ID 추출
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    // 2. 서비스 계층의 getPostById 함수 호출
    // 내부적으로 조회수 증가 처리
    const post = await postService.getPostById(postId);

    // 3. 성공 응답 반환 (200 OK)
    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    // 4. 에러 처리
    const statusCode = error.message.includes('찾을 수 없습니다') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/posts/:id
 * 게시글 수정
 * * 경로 파라미터:
 * - id: number (필수) - 게시글 ID
 * * 요청 본문 (req.body):
 * - title: string (필수) - 게시글 제목
 * - content: string (필수) - 게시글 내용
 * - category: string (필수) - 게시글 카테고리
 * * 성공 응답 (200):
 * {
 * success: true,
 * data: { 수정된 게시글 정보 }
 * }
 * * 실패 응답 (400/403/404):
 * {
 * success: false,
 * message: string
 * }
 */
router.put('/:id', verifyToken, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'attachments', maxCount: 10 }
]), async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    const { title, content, category, deleteImages, deleteAttachments } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리를 모두 입력해주세요.'
      });
    }

    const newImages = req.files && req.files['images'] 
      ? req.files['images'].map(file => file.path) 
      : [];
    const parsedDeleteImages = deleteImages ? JSON.parse(deleteImages) : [];

    const newAttachments = req.files && req.files['attachments']
      ? req.files['attachments'].map(file => ({
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          fileType: file.mimetype
        }))
      : [];
    const parsedDeleteAttachments = deleteAttachments ? JSON.parse(deleteAttachments) : [];

    const updatedPost = await postService.updatePost(
      postId,
      req.user.memberId,
      title,
      content,
      category,
      req.user.role,
      newImages,
      parsedDeleteImages,
      newAttachments,
      parsedDeleteAttachments
    );

    res.status(200).json({
      success: true,
      data: updatedPost
    });

  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('찾을 수 없습니다')) statusCode = 404;
    else if (error.message.includes('권한')) statusCode = 403;
    else if (error.message.includes('입력')) statusCode = 400;

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/posts/:id
 * 게시글 삭제
 * * 경로 파라미터:
 * - id: number (필수) - 게시글 ID
 * * 성공 응답 (200):
 * {
 * success: true,
 * message: '게시글이 삭제되었습니다.'
 * }
 * * 실패 응답 (403/404):
 * {
 * success: false,
 * message: string
 * }
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // 1. 경로 파라미터에서 게시글 ID 추출
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    // 2. 서비스 계층의 deletePost 함수 호출
    // 작성자 또는 관리자만 삭제 가능
    await postService.deletePost(
      postId,
      req.user.memberId,  // 요청한 사용자 ID
      req.user.role       // 사용자 역할
    );

    // 3. 성공 응답 반환 (200 OK)
    res.status(200).json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    });

  } catch (error) {
    // 4. 에러 처리
    let statusCode = 500;
    if (error.message.includes('찾을 수 없습니다')) statusCode = 404;
    else if (error.message.includes('권한')) statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PATCH /api/posts/:id/pin
 * 게시글 고정/고정 해제 (관리자 전용)
 * * 경로 파라미터:
 * - id: number (필수) - 게시글 ID
 * * 요청 본문 (req.body):
 * - is_pinned: boolean (필수) - 고정 여부
 * * 성공 응답 (200):
 * {
 * success: true,
 * data: { 업데이트된 게시글 정보 }
 * }
 * * 실패 응답 (403/404):
 * {
 * success: false,
 * message: string
 * }
 */
router.patch('/:id/pin', verifyToken, isAdmin, async (req, res) => {
  try {
    // 1. 경로 파라미터에서 게시글 ID 추출
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    // 2. 요청 본문에서 고정 여부 추출
    const { is_pinned } = req.body;

    if (typeof is_pinned !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_pinned는 boolean 값이어야 합니다.'
      });
    }

    // 3. 서비스 계층의 togglePinned 함수 호출
    // 관리자만 가능 (isAdmin 미들웨어로 이미 검증됨)
    const updatedPost = await postService.togglePinned(
      postId,
      is_pinned,
      req.user.role
    );

    // 4. 성공 응답 반환 (200 OK)
    res.status(200).json({
      success: true,
      data: updatedPost
    });

  } catch (error) {
    // 5. 에러 처리
    let statusCode = 500;
    if (error.message.includes('찾을 수 없습니다')) statusCode = 404;
    else if (error.message.includes('관리자')) statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/posts/:id/comments
 * 댓글 작성
 */
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }

    const commentService = require('../services/comment.service');
    const newComment = await commentService.createComment(postId, req.user.memberId, content);

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || '댓글 작성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/posts/:id/comments
 * 게시글의 댓글 목록 조회
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    const commentService = require('../services/comment.service');
    const comments = await commentService.getCommentsByPostId(postId);

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: '댓글 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * DELETE /api/posts/:postId/comments/:commentId
 * 댓글 삭제
 */
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);

    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 댓글 ID가 아닙니다.'
      });
    }

    const commentService = require('../services/comment.service');
    await commentService.deleteComment(commentId, req.user.memberId, req.user.role);

    res.status(200).json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    const statusCode = error.message.includes('권한') ? 403 : 
                       error.message.includes('찾을 수 없습니다') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/posts/:id/like
 * 좋아요 토글 (추가/취소)
 */
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    const likeService = require('../services/like.service');
    const result = await likeService.toggleLike(postId, req.user.memberId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: '좋아요 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/posts/:id/like
 * 게시글의 좋아요 정보 조회
 */
router.get('/:id/like', optionalVerifyToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    const likeService = require('../services/like.service');
    const memberId = req.user ? (req.user.memberId || req.user.member_id) : null;
    const likeInfo = await likeService.getLikeInfo(postId, memberId);

    res.status(200).json({
      success: true,
      data: likeInfo
    });
  } catch (error) {
    console.error('Error fetching like info:', error);
    res.status(500).json({
      success: false,
      message: '좋아요 정보를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/posts/attachments/:attachmentId/download
 * 첨부파일 다운로드
 */
router.get('/attachments/:attachmentId/download', async (req, res) => {
  try {
    const attachmentId = parseInt(req.params.attachmentId);

    if (isNaN(attachmentId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 첨부파일 ID가 아닙니다.'
      });
    }

    const attachment = await postService.getAttachment(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: '첨부파일을 찾을 수 없습니다.'
      });
    }

    // 파일 다운로드
    res.download(attachment.file_path, attachment.file_name, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: '파일 다운로드 중 오류가 발생했습니다.'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error in download endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message || '파일 다운로드 중 오류가 발생했습니다.'
    });
  }
});

// 라우터를 모듈로 내보내기 (app.js에서 사용)
module.exports = router;