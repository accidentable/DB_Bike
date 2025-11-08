import { useState, useEffect } from "react";
import { getPosts } from "../api/client";
import { Calendar, Eye, MessageCircle, ThumbsUp, Edit3, Send, Filter, SortDesc, Pin, ArrowLeft, Paperclip, X } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Header } from "../components/layout/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface CommunityPageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  category: "공지사항" | "이벤트" | "자유" | "질문" | "후기" | "제안";
  isPinned?: boolean;
  attachments?: { name: string; url: string; type: string }[];
}

export function CommunityPage({ onClose, onLoginClick, onSignupClick, onStationFinderClick, onNoticeClick, onPurchaseClick, onFaqClick, onHomeClick, onProfileClick, onRankingClick }: CommunityPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Post["category"] | "전체">("전체");
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes">("date");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "자유" as Post["category"],
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  // 게시글 로드
  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy]);

  const loadPosts = async () => {
    try {
      const params: any = {};
      if (selectedCategory !== "전체") {
        params.category = selectedCategory;
      }
      if (sortBy === "views") params.sortBy = "views";
      if (sortBy === "likes") params.sortBy = "likes";
      
      const result = await getPosts(params);
      if (result.success && result.data) {
        setPosts(result.data.posts || []);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  // 고정 글을 먼저 상단에 표시
  const pinnedPosts = posts.filter(post => post.isPinned);
  const normalPosts = posts.filter(post => !post.isPinned);

  const filteredAndSortedPosts = [
    ...pinnedPosts.filter(post => selectedCategory === "전체" ? true : post.category === selectedCategory),
    ...normalPosts
      .filter(post => selectedCategory === "전체" ? true : post.category === selectedCategory)
      .sort((a, b) => {
        if (sortBy === "date") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "views") {
          return b.views - a.views;
        } else {
          return b.likes - a.likes;
        }
      })
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "공지사항":
        return "bg-red-500 text-white";
      case "이벤트":
        return "bg-orange-500 text-white";
      case "자유":
        return "bg-blue-500 text-white";
      case "질문":
        return "bg-yellow-500 text-white";
      case "후기":
        return "bg-[#00A862] text-white";
      case "제안":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const post: Post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: "사용자" + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().split("T")[0],
      views: 0,
      likes: 0,
      comments: 0,
      category: newPost.category,
    };

    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", category: "자유" });
    setAttachedFiles([]);
    setFilePreviewUrls([]);
    setIsWriting(false);
    alert("게시글이 작성되었습니다");
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

    // 파일 미리보기 URL 생성
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setAttachedFiles([...attachedFiles, ...newFiles]);
    setFilePreviewUrls([...filePreviewUrls, ...newPreviewUrls]);
  };

  const handleFileRemove = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    const newUrls = filePreviewUrls.filter((_, i) => i !== index);
    
    // 메모리 해제
    URL.revokeObjectURL(filePreviewUrls[index]);
    
    setAttachedFiles(newFiles);
    setFilePreviewUrls(newUrls);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onClose}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onRankingClick={onRankingClick}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
            <p className="text-gray-600">따릉이 사용자들과 소통하세요</p>
          </div>
          {!isWriting && !selectedPost && (
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
        {!isWriting && !selectedPost && (
          <div className="mb-6 flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Post["category"] | "전체")}
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
                onValueChange={(value) => setSortBy(value as "date" | "views" | "likes")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">최신순</SelectItem>
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
              <h2 className="text-2xl font-bold mb-6">게시글 작성</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <select
                    id="category"
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value as Post["category"] })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A862]"
                  >
                    <option value="자유">자유</option>
                    <option value="질문">질문</option>
                    <option value="후기">후기</option>
                    <option value="제안">제안</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">* 공지사항과 이벤트는 관리자가 작성할 수 있습니다.</p>
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
            <Button
              variant="outline"
              onClick={() => setSelectedPost(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>

            <Card className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {selectedPost.isPinned && (
                    <Pin className="w-5 h-5 text-[#00A862]" />
                  )}
                  <Badge className={getCategoryColor(selectedPost.category)}>
                    {selectedPost.category}
                  </Badge>
                  {selectedPost.isPinned && (
                    <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
                      고정
                    </Badge>
                  )}
                </div>
                <h2 className="mb-4">{selectedPost.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{selectedPost.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    조회 {selectedPost.views}
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

              <div className="border-t pt-6 flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  좋아요 {selectedPost.likes}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  댓글 {selectedPost.comments}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          // Post List View
          <div className="max-w-4xl mx-auto">
            <div className="space-y-3">
              {filteredAndSortedPosts.map((post) => (
                <Card
                  key={post.id}
                  className={`p-5 cursor-pointer hover:shadow-md transition-shadow ${
                    post.isPinned ? "border-2 border-[#00A862] bg-[#00A862]/5" : ""
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-start gap-4">
                    {post.isPinned && (
                      <Pin className="w-5 h-5 text-[#00A862] flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                        {post.isPinned && (
                          <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
                            고정
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 truncate">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
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
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
