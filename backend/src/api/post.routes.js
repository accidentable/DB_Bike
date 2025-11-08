/**
 * src/api/post.routes.js
 * 게시글 관련 API 라우터
 * * 역할: HTTP 요청을 받아서 서비스 계층에 작업을 요청하고, 응답을 반환합니다.
 * - 클라이언트로부터 받은 요청 데이터 검증
 * - postService를 호출하여 비즈니스 로직 실행
 * - 적절한 HTTP 상태 코드와 함께 응답 반환
 * * 엔드포인트:
 * POST   /api/posts          - 게시글 작성
 * GET    /api/posts          - 게시글 목록 조회
 * GET    /api/posts/:id      - 게시글 상세 조회
 * PUT    /api/posts/:id      - 게시글 수정
 * DELETE /api/posts/:id      - 게시글 삭제
 * PATCH  /api/posts/:id/pin  - 게시글 고정/고정 해제 (관리자)
 */

const express = require('express');
const router = express.Router();
const postService = require('../services/post.service');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

/**
 * POST /api/posts
 * 게시글 작성
 * * 요청 본문 (req.body):
 * - title: string (필수) - 게시글 제목
 * - content: string (필수) - 게시글 내용
 * - category: string (필수) - 게시글 카테고리 (notice, event, review 등)
 * - is_pinned: boolean (선택) - 고정 여부 (관리자만 가능)
 * * 성공 응답 (201):
 * {
 * success: true,
 * data: { 게시글 정보 }
 * }
 * * 실패 응답 (400/403):
 * {
 * success: false,
 * message: string
 * }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    // 1. 요청 본문에서 게시글 정보 추출
    const { title, content, category, is_pinned } = req.body;
    
    // 2. 필수 입력값 검증
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리를 모두 입력해주세요.'
      });
    }

    // 3. 서비스 계층의 createPost 함수 호출
    // verifyToken 미들웨어를 통해 req.user에 사용자 정보가 설정됨
    const newPost = await postService.createPost(
      req.user.memberId,  // 작성자 ID
      title,
      content,
      category,
      is_pinned || false,  // 기본값: false
      req.user.role        // 사용자 역할 (권한 확인용)
    );

    // 4. 성공 응답 반환 (201 Created)
    res.status(201).json({
      success: true,
      data: newPost
    });

  } catch (error) {
    // 5. 에러 처리
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
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // 1. 경로 파라미터에서 게시글 ID 추출
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 게시글 ID가 아닙니다.'
      });
    }

    // 2. 요청 본문에서 수정 정보 추출
    const { title, content, category } = req.body;

    // 3. 필수 입력값 검증
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리를 모두 입력해주세요.'
      });
    }

    // 4. 서비스 계층의 updatePost 함수 호출
    // 작성자 또는 관리자만 수정 가능
    const updatedPost = await postService.updatePost(
      postId,
      req.user.memberId,  // 요청한 사용자 ID
      title,
      content,
      category,
      req.user.role       // 사용자 역할
    );

    // 5. 성공 응답 반환 (200 OK)
    res.status(200).json({
      success: true,
      data: updatedPost
    });

  } catch (error) {
    // 6. 에러 처리
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

// 라우터를 모듈로 내보내기 (app.js에서 사용)
module.exports = router;