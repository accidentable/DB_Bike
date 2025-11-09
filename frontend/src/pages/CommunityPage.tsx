// src/pages/CommunityPage.tsx
// (API 연동 및 mock data 제거 완료)

import { useState, useEffect } from "react";
import { Calendar, Eye, MessageCircle, ThumbsUp, Edit3, Send, Filter, SortDesc, Pin, ArrowLeft, Paperclip, X, Trash2, Edit } from "lucide-react";

// 1. (수정) API 경로 및 Context 경로 수정
import { getPosts, createPost, getPost, updatePost, deletePost, type Post } from "../api/postApi";
import { createComment, getComments, deleteComment, type Comment } from "../api/commentApi";
import { toggleLike, getLikeInfo } from "../api/likeApi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위해 추가

// 2. (수정) UI 컴포넌트 경로 수정
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
// Header는 App.tsx에서 렌더링되므로 여기서 import 제거 (주석 처리)

// Select 컴포넌트 import (경로 수정)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// 4. (수정) 목업 데이터 삭제
// const initialPosts: Post[] = [ ... ]; // 삭제

// (props는 App.tsx에서 처리하므로 삭제)

export default function CommunityPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // --- API 데이터 상태 ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- UI 상태 ---
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [sortBy, setSortBy] = useState<"latest" | "views" | "likes">("latest"); // (수정) date -> latest
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "자유", // 기본 카테고리
  });
  const [editPost, setEditPost] = useState({
    post_id: 0,
    title: "",
    content: "",
    category: "자유",
  });
  const [newComment, setNewComment] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  
  // --- 5. (신규) API 호출 로직 ---
  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const options = {
            category: selectedCategory === "전체" ? undefined : selectedCategory,
            sortBy: sortBy,
            page: 1, // 페이지네이션은 추후 구현
            limit: 20,
            // searchQuery: undefined
        };
        const response = await getPosts(options); // API 호출
        if (response.success && response.data && response.data.posts) {
            // (수정) 고정글을 먼저 정렬해서 상태에 저장 (클라이언트 정렬 로직 대체)
            const pinned = response.data.posts.filter(p => p.is_pinned);
            const normal = response.data.posts.filter(p => !p.is_pinned);
            setPosts([...pinned, ...normal]);
        }
    } catch (err) {
        setError("게시글 목록을 불러오는데 실패했습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePostClick = async (postId: number) => {
    try {
        // (수정) 상세 API 호출 (조회수 증가 로직 포함)
        const response = await getPost(postId);
        if (response.success && response.data) {
            console.log('게시글 상세 정보:', response.data);
            console.log('현재 로그인 사용자:', user);
            setSelectedPost(response.data);
            
            // 댓글 목록 가져오기
            const commentsResponse = await getComments(postId);
            if (commentsResponse.success && commentsResponse.data) {
                setComments(commentsResponse.data);
            }
            
            // 좋아요 정보 가져오기
            const likeResponse = await getLikeInfo(postId);
            if (likeResponse.success && likeResponse.data) {
                setLikeCount(likeResponse.data.likeCount);
                setIsLiked(likeResponse.data.isLiked);
            }
            
            fetchPosts(); // 목록 페이지의 조회수 갱신을 위해 재호출 (옵션)
        }
    } catch (err) {
        setError("게시글 상세 정보를 불러오는데 실패했습니다.");
    }
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    
    if (!selectedPost) return;
    
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await createComment(selectedPost.post_id, newComment);
      if (response.success) {
        setNewComment("");
        // 댓글 목록 새로고침
        const commentsResponse = await getComments(selectedPost.post_id);
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data);
        }
        // 게시글 정보 새로고침 (댓글 수 업데이트)
        const postResponse = await getPost(selectedPost.post_id);
        if (postResponse.success && postResponse.data) {
          setSelectedPost(postResponse.data);
        }
      } else {
        alert(response.message || "댓글 작성에 실패했습니다.");
      }
    } catch (err) {
      console.error("댓글 작성 중 오류:", err);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!selectedPost) return;
    
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await deleteComment(selectedPost.post_id, commentId);
      if (response.success) {
        // 댓글 목록 새로고침
        const commentsResponse = await getComments(selectedPost.post_id);
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data);
        }
        // 게시글 정보 새로고침 (댓글 수 업데이트)
        const postResponse = await getPost(selectedPost.post_id);
        if (postResponse.success && postResponse.data) {
          setSelectedPost(postResponse.data);
        }
      } else {
        alert(response.message || "댓글 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("댓글 삭제 중 오류:", err);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  // 좋아요 토글
  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    
    if (!selectedPost) return;

    try {
      const response = await toggleLike(selectedPost.post_id);
      if (response.success && response.data) {
        setIsLiked(response.data.liked);
        // 좋아요 수 새로고침
        const likeResponse = await getLikeInfo(selectedPost.post_id);
        if (likeResponse.success && likeResponse.data) {
          setLikeCount(likeResponse.data.likeCount);
        }
        // 게시글 정보 새로고침 (좋아요 수 업데이트)
        const postResponse = await getPost(selectedPost.post_id);
        if (postResponse.success && postResponse.data) {
          setSelectedPost(postResponse.data);
        }
      } else {
        alert(response.message || "좋아요 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error("좋아요 처리 중 오류:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 수정 버튼 클릭 - 수정 모드로 전환
  const handleEditClick = () => {
    if (!selectedPost) return;
    
    setEditPost({
      post_id: selectedPost.post_id,
      title: selectedPost.title,
      content: selectedPost.content,
      category: selectedPost.category,
    });
    setIsEditing(true);
  };

  // 수정 제출
  const handleSubmitEdit = async () => {
    if (!editPost.title.trim() || !editPost.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await updatePost(editPost.post_id, {
        title: editPost.title,
        content: editPost.content,
        category: editPost.category,
      });

      if (response.success) {
        alert("게시글이 수정되었습니다.");
        setIsEditing(false);
        // 수정된 글 다시 불러오기
        const updatedResponse = await getPost(editPost.post_id);
        if (updatedResponse.success && updatedResponse.data) {
          setSelectedPost(updatedResponse.data);
        }
        fetchPosts(); // 목록 새로고침
      } else {
        alert(response.message || "게시글 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("게시글 수정 중 오류:", err);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  // 삭제 버튼 클릭
  const handleDelete = async () => {
    if (!selectedPost) return;
    
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await deletePost(selectedPost.post_id);
      
      if (response.success) {
        alert("게시글이 삭제되었습니다.");
        setSelectedPost(null);
        fetchPosts(); // 목록 새로고침
      } else {
        alert(response.message || "게시글 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("게시글 삭제 중 오류:", err);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  // 본인 글인지 확인하는 함수
  const isAuthor = (post: Post | null): boolean => {
    if (!post || !user) {
      console.log('isAuthor: post 또는 user가 없음', { post, user });
      return false;
    }
    console.log('isAuthor 체크:', {
      post_member_id: post.member_id,
      user_member_id: user.member_id,
      isMatch: post.member_id === user.member_id
    });
    return post.member_id === user.member_id;
  };

  const handleSubmitPost = async () => {
    if (!isLoggedIn) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
        // (수정) API 호출 (파일 첨부는 나중에 구현)
        const postData = {
            title: newPost.title.trim(),
            content: newPost.content.trim(),
            category: newPost.category
        };

        await createPost(postData); // API 호출
        
        // 성공 후 상태 초기화 및 목록 갱신
        setNewPost({ title: "", content: "", category: "자유" });
        setAttachedFiles([]);
        setFilePreviewUrls([]);
        setIsWriting(false);
        alert("게시글이 성공적으로 작성되었습니다!");
        fetchPosts(); // 목록 갱신
        
    } catch (err: any) {
        // 백엔드에서 권한 오류 (403) 등을 던질 수 있음
        alert(err.response?.data?.message || "게시글 작성에 실패했습니다.");
    }
  };
  
  // --- 6. (수정) useEffect 훅 ---
  
  // 카테고리나 정렬 기준 변경 시 목록 갱신
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy]); // (수정) 의존성 배열에 filter/sort 상태 추가

  // --- 7. (유지) UI 헬퍼 함수 ---
  const getCategoryColor = (category: string) => {
    // ... (카테고리 색상 로직 유지) ...
    switch (category) {
        case "공지사항": return "bg-red-500 text-white";
        case "이벤트": return "bg-orange-500 text-white";
        case "자유": return "bg-blue-500 text-white";
        case "질문": return "bg-yellow-500 text-white";
        case "후기": return "bg-[#00A862] text-white";
        case "제안": return "bg-purple-500 text-white";
        default: return "bg-gray-500 text-white";
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalFiles = attachedFiles.length + newFiles.length;
    
    if (totalFiles > 5) {
      alert("최대 5개까지 파일을 첨부할 수 있습니다.");
      return;
    }

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setAttachedFiles([...attachedFiles, ...newFiles]);
    setFilePreviewUrls([...filePreviewUrls, ...newPreviewUrls]);
  };

  const handleFileRemove = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    const newUrls = filePreviewUrls.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(filePreviewUrls[index]);
    
    setAttachedFiles(newFiles);
    setFilePreviewUrls(newUrls);
  };
  
  // --- 8. (수정) JSX 렌더링 ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header는 App.tsx에서 렌더링되므로 제거 */}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2">커뮤니티</h1>
            <p className="text-gray-600">따릉이 이용자들과 소통하세요</p>
          </div>
          {/* (수정) 글쓰기 버튼: 로그인해야만 보임 */}
          {!isWriting && !selectedPost && isLoggedIn && (
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-[#00A862] hover:bg-[#008F54]"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              글쓰기
            </Button>
          )}
        </div>

        {/* Category Filter & Sort */}
        {/* (수정) 정렬 기준 value를 latest, views, likes로 변경 */}
        {!isWriting && !selectedPost && (
          <div className="mb-6 flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="공지사항">공지사항</SelectItem>
                  <SelectItem value="이벤트">이벤트</SelectItem>
                  <SelectItem value="자유">자유</SelectItem>
                  <SelectItem value="질문">질문</SelectItem>
                  <SelectItem value="후기">후기</SelectItem>
                  <SelectItem value="제안">제안</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-gray-500" />
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as "latest" | "views" | "likes")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="views">조회수순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {isWriting ? (
          // Write Post View
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <h2 className="mb-6">게시글 작성</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <select
                    id="category"
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A862]"
                  >
                    <option value="자유">자유</option>
                    <option value="질문">질문</option>
                    <option value="후기">후기</option>
                    <option value="제안">제안</option>
                    {/* 공지/이벤트는 관리자만 작성 가능하므로 일반 유저 UI에서는 제거 */}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">* 공지사항과 이벤트는 관리자만 작성할 수 있습니다.</p>
                </div>

                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="제목을 입력하세요"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    placeholder="내용을 입력하세요"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="mt-1 min-h-[300px]"
                  />
                </div>

                {/* 파일 첨부 */}
                <div>
                  <Label>파일 첨부 (최대 5개)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="file-input"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.hwp"
                      onChange={handleFileAttach}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="w-full"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      파일 선택 ({attachedFiles.length}/5)
                    </Button>
                  </div>

                  {/* 첨부된 파일 목록 */}
                  {attachedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          {file.type.startsWith('image/') ? (
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={filePreviewUrls[index]} 
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <Paperclip className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFileRemove(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmitPost}
                    className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    작성완료
                  </Button>
                  <Button
                    onClick={() => {
                      setIsWriting(false);
                      setNewPost({ title: "", content: "", category: "자유" });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : selectedPost ? (
          // Post Detail View
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPost(null);
                  setIsEditing(false);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>

              {/* 작성자 본인에게만 수정/삭제 버튼 표시 */}
              {isAuthor(selectedPost) && !isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleEditClick}
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              // 수정 모드
              <Card className="p-8">
                <h2 className="mb-6">게시글 수정</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-category">카테고리</Label>
                    <Select
                      value={editPost.category}
                      onValueChange={(value) => setEditPost({ ...editPost, category: value })}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="자유">자유</SelectItem>
                        <SelectItem value="질문">질문</SelectItem>
                        <SelectItem value="정보">정보</SelectItem>
                        <SelectItem value="후기">후기</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-title">제목</Label>
                    <Input
                      id="edit-title"
                      value={editPost.title}
                      onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                      placeholder="제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-content">내용</Label>
                    <Textarea
                      id="edit-content"
                      value={editPost.content}
                      onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                      placeholder="내용을 입력하세요"
                      className="min-h-[300px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitEdit}
                      className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      수정 완료
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              // 상세 보기 모드
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {selectedPost.is_pinned && (
                      <Pin className="w-5 h-5 text-[#00A862]" />
                    )}
                    <Badge className={getCategoryColor(selectedPost.category)}>
                      {selectedPost.category}
                    </Badge>
                    {selectedPost.is_pinned && (
                      <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
                        고정
                      </Badge>
                    )}
                  </div>
                  <h2 className="mb-4">{selectedPost.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{selectedPost.username}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedPost.created_at.split('T')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      조회 {selectedPost.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      좋아요 {selectedPost.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      댓글 {selectedPost.comments_count}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {selectedPost.content}
                    </pre>
                  </div>
                </div>

                <div className="border-t pt-6 flex items-center gap-4 mb-6">
                  <Button 
                    variant="outline" 
                    className={`flex items-center gap-2 ${isLiked ? 'bg-[#00A862] text-white border-[#00A862]' : ''}`}
                    onClick={handleToggleLike}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    좋아요 {likeCount}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    댓글 {comments.length}
                  </Button>
                </div>

                {/* 댓글 섹션 */}
                <div className="border-t pt-6">
                  <h3 className="mb-4">댓글 {comments.length}개</h3>
                  
                  {/* 댓글 작성 폼 */}
                  {isLoggedIn ? (
                    <div className="mb-6">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요"
                        className="mb-2"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitComment}
                          className="bg-[#00A862] hover:bg-[#008F54]"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          댓글 작성
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        댓글을 작성하려면 <button onClick={() => navigate('/login')} className="text-[#00A862] underline">로그인</button>해주세요.
                      </p>
                    </div>
                  )}

                  {/* 댓글 목록 */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        첫 댓글을 작성해보세요!
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.comment_id} className="border-b pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{comment.username}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>
                            </div>
                            
                            {/* 본인 댓글에만 삭제 버튼 표시 */}
                            {user && comment.member_id === user.member_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.comment_id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          // Post List View
          <div className="max-w-4xl mx-auto">
            {isLoading && <div className="text-center py-10">목록을 불러오는 중입니다...</div>}
            
            <div className="space-y-3">
              {posts.map((post) => (
                <Card
                  key={post.post_id}
                  className={`p-5 cursor-pointer hover:shadow-md transition-shadow ${
                    post.is_pinned ? "border-2 border-[#00A862] bg-[#00A862]/5" : ""
                  }`}
                  onClick={() => handlePostClick(post.post_id)} // API 호출하도록 변경
                >
                  <div className="flex items-start gap-4">
                    {post.is_pinned && (
                      <Pin className="w-5 h-5 text-[#00A862] flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                        {post.is_pinned && (
                          <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
                            고정
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 truncate">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.username}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.created_at.split('T')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {!isLoading && posts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    게시글이 없습니다. 첫 게시글을 작성해보세요!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}