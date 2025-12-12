/**
 * src/pages/CommunityPage.tsx
 * 커뮤니티 게시판 페이지
 * 
 * 사용된 API:
 * - postApi: getPosts, createPost, getPost, updatePost, deletePost, 
 *            getPinnedPosts, downloadAttachment
 * - commentApi: createComment, getComments, deleteComment
 * - likeApi: toggleLike, getLikeInfo
 */

import { useState, useEffect } from "react";
import { Calendar, Eye, MessageCircle, ThumbsUp, Edit3, Send, Filter, SortDesc, Pin, ArrowLeft, Paperclip, X, Trash2, Edit, Download } from "lucide-react";
import { getPosts, createPost, getPost, updatePost, deletePost, getPinnedPosts, downloadAttachment, type Post } from "../api/postApi";
import { createComment, getComments, deleteComment, type Comment } from "../api/commentApi";
import { toggleLike, getLikeInfo } from "../api/likeApi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function CommunityPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]); // 고정된 게시글 상태 추가
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [sortBy, setSortBy] = useState<"latest" | "views" | "likes">("latest");
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // 이미지 파일
  const [attachedDocuments, setAttachedDocuments] = useState<File[]>([]); // 일반 첨부파일
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [deleteImages, setDeleteImages] = useState<string[]>([]);
  const [deleteAttachments, setDeleteAttachments] = useState<number[]>([]); // 삭제할 첨부파일 ID
  const [existingAttachments, setExistingAttachments] = useState<Array<{attachment_id: number, file_name: string, file_path: string, file_size: number, file_type: string}>>([]);

  const fetchPinnedPosts = async () => {
    setError(null);
    try {
      const response = await getPinnedPosts();
      if (response.success && response.data) {
        setPinnedPosts(response.data);
      }
    } catch (err) {
      setError("고정된 게시글을 불러오는데 실패했습니다.");
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const options = {
            category: selectedCategory === "전체" ? undefined : selectedCategory,
            sort_by: sortBy, // API는 sort_by를 기대함
            page: 1, // 페이지네이션은 추후 구현
            limit: 20,
            // searchQuery: undefined
        };
        const response = await getPosts(options);
        if (response.success && response.data && response.data.posts) {
            const normalPosts = response.data.posts.filter(p => !p.is_pinned);
            setPosts(normalPosts);
        }
    } catch (err) {
        setError("게시글 목록을 불러오는데 실패했습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePostClick = async (postId: number) => {
    try {
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
            fetchPinnedPosts(); // 고정 게시글 목록도 갱신
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

  const handleEditClick = () => {
    if (!selectedPost) return;
    
    setEditPost({
      post_id: selectedPost.post_id,
      title: selectedPost.title,
      content: selectedPost.content,
      category: selectedPost.category,
    });
    setAttachedFiles([]); // 새로 추가할 이미지 파일
    setFilePreviewUrls(selectedPost.images || []); // 기존 이미지 URL
    setAttachedDocuments([]); // 새로 추가할 첨부파일
    setExistingAttachments(selectedPost.attachments || []); // 기존 첨부파일 목록
    setDeleteImages([]); // 삭제할 이미지 URL
    setDeleteAttachments([]); // 삭제할 첨부파일 ID
    setIsEditing(true);
  };

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
        images: attachedFiles,
        deleteImages: deleteImages,
        attachments: attachedDocuments,
        deleteAttachments: deleteAttachments,
      });

      if (response.success) {
        alert("게시글이 수정되었습니다.");
        setIsEditing(false);
        // 상태 초기화
        setAttachedFiles([]);
        setAttachedDocuments([]);
        setFilePreviewUrls([]);
        setDeleteImages([]);
        setDeleteAttachments([]);
        setExistingAttachments([]);
        const updatedResponse = await getPost(editPost.post_id);
        if (updatedResponse.success && updatedResponse.data) {
          setSelectedPost(updatedResponse.data);
        }
        fetchPosts(); // 목록 새로고침
        fetchPinnedPosts(); // 고정 게시글 목록도 갱신
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
        fetchPinnedPosts(); // 고정 게시글 목록도 갱신
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
        const postData = {
            title: newPost.title.trim(),
            content: newPost.content.trim(),
            category: newPost.category,
            images: attachedFiles,
            attachments: attachedDocuments,
        };

        const response = await createPost(postData);
        
        if (response.success && response.data) {
            setNewPost({ title: "", content: "", category: "자유" });
            setAttachedFiles([]);
            setAttachedDocuments([]);
            setFilePreviewUrls([]);
            setIsWriting(false);
            alert("게시글이 성공적으로 작성되었습니다!");
            
            // 새 게시글을 목록의 맨 위에 추가
            setPosts([response.data, ...posts]);
            fetchPinnedPosts(); // 고정 게시글 목록도 갱신
        } else {
            alert(response.message || "게시글 작성에 실패했습니다.");
        }
        
    } catch (err: any) {
        alert(err.response?.data?.message || "게시글 작성에 실패했습니다.");
    }
  };
  
  useEffect(() => {
    fetchPosts();
    fetchPinnedPosts();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    fetchPinnedPosts();
  }, []);

  //  UI 헬퍼 함수 ---
  const getCategoryColor = (category: string) => {
    // 카테고리 색상 로직 유지
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

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>, isDocument: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    if (isDocument) {
      const totalFiles = attachedDocuments.length + newFiles.length;
      if (totalFiles > 10) {
        alert("최대 10개까지 첨부파일을 첨부할 수 있습니다.");
        return;
      }
      setAttachedDocuments([...attachedDocuments, ...newFiles]);
    } else {
      const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      const totalImages = attachedFiles.length + imageFiles.length;
      
      if (imageFiles.length !== newFiles.length) {
        alert("이미지 파일만 선택해주세요. 다른 파일은 '첨부파일' 버튼을 사용해주세요.");
        return;
      }
      
      if (totalImages > 5) {
        alert("최대 5개까지 이미지를 첨부할 수 있습니다.");
        return;
      }

      const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
      
      setAttachedFiles([...attachedFiles, ...imageFiles]);
      setFilePreviewUrls([...filePreviewUrls, ...newPreviewUrls]);
    }
    
    // 입력 초기화
    e.target.value = '';
  };

  const handleFileRemove = (index: number) => {
    const blobUrls = filePreviewUrls.filter(url => url.startsWith('blob:'));
    if (index >= blobUrls.length) return;
    
    const blobUrlToRemove = blobUrls[index];
    URL.revokeObjectURL(blobUrlToRemove);
    
    const newAttachedFiles = attachedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = filePreviewUrls.filter(url => url !== blobUrlToRemove);

    setAttachedFiles(newAttachedFiles);
    setFilePreviewUrls(newPreviewUrls);
  };

  const handleDocumentRemove = (index: number) => {
    const newDocuments = attachedDocuments.filter((_, i) => i !== index);
    setAttachedDocuments(newDocuments);
  };

  return (
    <div className="min-h-screen bg-gray-50">

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
                onValueChange={(value) => {
                  setSortBy(value as "latest" | "views" | "likes");
                }}
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
                    {user?.role === 'admin' && (
                      <>
                        <option value="공지사항">공지사항</option>
                        <option value="이벤트">이벤트</option>
                      </>
                    )}
                    <option value="자유">자유</option>
                    <option value="질문">질문</option>
                    <option value="후기">후기</option>
                    <option value="제안">제안</option>
                  </select>
                  {user?.role !== 'admin' && (
                    <p className="text-xs text-gray-500 mt-1">* 공지사항과 이벤트는 관리자만 작성할 수 있습니다.</p>
                  )}
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

                {/* --- (수정) 파일 첨부 섹션 시작 --- */}

                {/* 1. 이미지 첨부 */}
                <div>
                  <Label>이미지 첨부 (최대 5개)</Label>
                  <div className="mt-2">
                    {/* 기존 이미지 버튼 */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileAttach(e, false)}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="w-full"
                    >
                      파일 선택 ({attachedFiles.length}/5)
                    </Button>
                  </div>

                  {/* 첨부된 이미지 목록 */}
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

                {/* 2. 일반 첨부파일 (신규 추가) */}
                <div>
                  <Label>첨부파일 (최대 10개)</Label>
                  <div className="mt-2">
                    {/* 새로 추가: 첨부파일 버튼 */}
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileAttach(e, true)}
                      className="hidden"
                      id="document-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('document-upload')?.click()}>
                      <Paperclip className="w-4 h-4 mr-2" />
                      첨부파일 ({attachedDocuments.length}/10)
                    </Button>
                  </div>
                </div>

                {/* 첨부파일 목록 표시 (신규 추가) */}
                {attachedDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachedDocuments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <Paperclip className="w-4 h-4" />
                        <span className="flex-1 text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDocumentRemove(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* --- (수정) 파일 첨부 섹션 끝 --- */}


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

                  {/* 이미지 첨부 (수정 모드) */}
                  <div>
                    <Label>이미지 첨부 (최대 5개)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="edit-image-input"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileAttach(e, false)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-image-input')?.click()}
                        className="w-full"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        이미지 선택 ({(filePreviewUrls.length + attachedFiles.length)}/5)
                      </Button>
                    </div>

                    {/* 기존 이미지 및 새로 추가한 이미지 목록 */}
                    {(filePreviewUrls.length > 0 || attachedFiles.length > 0) && (
                      <div className="mt-3 space-y-2">
                        {/* 기존 이미지 (서버에 저장된 이미지) */}
                        {filePreviewUrls
                          .filter(url => !url.startsWith('blob:'))
                          .map((url, index) => (
                            <div key={`existing-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              <img 
                                  src={`http://localhost:3000/${url}`}
                                  alt={`existing image ${index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">기존 이미지</p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                  setDeleteImages([...deleteImages, url]);
                                  setFilePreviewUrls(filePreviewUrls.filter(u => u !== url));
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        {/* 새로 추가한 이미지 (blob URL) */}
                        {attachedFiles.map((file, index) => {
                          const blobUrls = filePreviewUrls.filter(url => url.startsWith('blob:'));
                          const previewUrl = blobUrls[index];
                          
                          if (!previewUrl) return null;
                          
                          return (
                            <div key={`new-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={previewUrl}
                                  alt={`new image ${index}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{file.name}</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // blob URL도 함께 제거
                                  const blobIndex = filePreviewUrls.findIndex(url => url === previewUrl);
                                  if (blobIndex !== -1) {
                                    URL.revokeObjectURL(previewUrl);
                                    setFilePreviewUrls(filePreviewUrls.filter((_, i) => i !== blobIndex));
                                  }
                                  handleFileRemove(index);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 첨부파일 (문서) (수정 모드) */}
                  <div>
                    <Label>첨부파일 (문서) (최대 10개)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="edit-document-input"
                        multiple
                        accept=".pdf,.doc,.docx,.hwp,.txt,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleFileAttach(e, true)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-document-input')?.click()}
                        className="w-full"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        첨부파일 선택 ({(existingAttachments.length + attachedDocuments.length)}/10)
                      </Button>
                    </div>

                    {/* 기존 첨부파일 목록 */}
                    {existingAttachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm text-gray-600">기존 첨부파일</Label>
                        {existingAttachments.map((attachment) => (
                          <div key={attachment.attachment_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                            <Paperclip className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteAttachments([...deleteAttachments, attachment.attachment_id]);
                                setExistingAttachments(existingAttachments.filter(a => a.attachment_id !== attachment.attachment_id));
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 새로 추가한 첨부파일 목록 */}
                    {attachedDocuments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm text-gray-600">새 첨부파일</Label>
                        {attachedDocuments.map((file, index) => (
                          <div key={`new-doc-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                            <Paperclip className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                  </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDocumentRemove(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      onClick={() => {
                        setIsEditing(false);
                        // 상태 초기화
                        setAttachedFiles([]);
                        setAttachedDocuments([]);
                        setFilePreviewUrls([]);
                        setDeleteImages([]);
                        setDeleteAttachments([]);
                        setExistingAttachments([]);
                      }}
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
                  {/* 이미지 표시 */}
                  {selectedPost.images && selectedPost.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {selectedPost.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:3000/${image}`}
                          alt={`post image ${index + 1}`}
                          className="rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* --- (신규) 첨부파일 목록 섹션 --- */}
                  {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        첨부파일 ({selectedPost.attachments.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedPost.attachments.map((attachment) => (
                          <button
                            key={attachment.attachment_id}
                            onClick={() => downloadAttachment(attachment.attachment_id, attachment.file_name)}
                            className="flex items-center gap-3 p-3 bg-white rounded border hover:bg-gray-50 w-full text-left"
                          >
                            <Paperclip className="w-5 h-5 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{attachment.file_name}</p>
                              <p className="text-xs text-gray-500">
                                {/* file_size가 bytes 단위라고 가정 */}
                                {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* --- (신규) 첨부파일 목록 섹션 끝 --- */}

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
            
            {/* 고정된 게시글 섹션 */}
            {pinnedPosts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-[#00A862] flex items-center gap-2">
                  <Pin className="w-6 h-6" /> 고정된 게시글
                </h2>
                <div className="space-y-3">
                  {pinnedPosts.map((post) => (
                    <Card
                      key={`pinned-${post.post_id}`}
                      className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 border-[#00A862] bg-[#00A862]/5"
                      onClick={() => handlePostClick(post.post_id)}
                    >
                      <div className="flex items-start gap-4">
                        <Pin className="w-5 h-5 text-[#00A862] flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(post.category)}>
                              {post.category}
                            </Badge>
                            <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
                              고정
                            </Badge>
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
                </div>
              </div>
            )}

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