import { useState } from "react";
import { Calendar, Eye, MessageCircle, ThumbsUp, Edit3, Send, Filter, SortDesc, Pin, ArrowLeft, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Header } from "./Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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

const initialPosts: Post[] = [
  {
    id: 1,
    title: "강남역 4번 출구 대여소 신규 개설 안내",
    content: `안녕하세요, 서울자전거 따릉이입니다.

강남역 4번 출구 인근에 새로운 대여소가 개설되었습니다.

📍 위치: 서울시 강남구 강남대로 지하 400 (강남역 4번 출구 도보 1분)
🚲 자전거 수: 30대
⏰ 운영 시간: 24시간

많은 이용 부탁드립니다.

감사합니다.`,
    author: "관리자",
    date: "2025-11-05",
    views: 1234,
    likes: 89,
    comments: 15,
    category: "공지사항",
    isPinned: true,
  },
  {
    id: 2,
    title: "11월 따릉이 이벤트 - 100km 챌린지!",
    content: `11월 한 달 동안 따릉이로 총 100km를 달성하신 분들께 스타벅스 기프티콘을 드립니다!

📅 기간: 2025.11.01 - 2025.11.30
🎁 경품: 스타벅스 아메리카노 기프티콘
📊 참여 방법: 앱에서 자동 집계됩니다

많은 참여 부탁드립니다!`,
    author: "관리자",
    date: "2025-11-01",
    views: 892,
    likes: 145,
    comments: 32,
    category: "이벤트",
    isPinned: true,
  },
  {
    id: 3,
    title: "출퇴근 따릉이 이용 꿀팁 공유합니다!",
    content: `출퇴근할 때 따릉이 이용하는데 몇 가지 팁 공유드려요.

1. 아침 출근시간에는 역 근처 대여소가 금방 동나니 조금 떨어진 곳에서 빌리세요
2. 배터리 70% 이상인 자전거를 고르면 언덕길도 편해요
3. 반납할 때는 미리 앱에서 자리 확인하고 가세요!

다들 안전하게 이용하시길 바랍니다 :)`,
    author: "출퇴근라이더",
    date: "2025-11-02",
    views: 423,
    likes: 52,
    comments: 8,
    category: "후기",
  },
  {
    id: 4,
    title: "한강 따릉이 코스 추천해주세요",
    content: `주말에 한강에서 따릉이 타려고 하는데 좋은 코스 있을까요?
뚝섬에서 출발하려고 하는데 왕복 2시간 안에 가능한 코스면 좋겠습니다!`,
    author: "주말라이더",
    date: "2025-11-01",
    views: 234,
    likes: 15,
    comments: 12,
    category: "질문",
  },
  {
    id: 5,
    title: "따릉이 앱 업데이트 후 편해졌네요",
    content: `최근 앱 업데이트 하고 나서 QR 스캔이 훨씬 빨라진 것 같아요.
그리고 대여소 실시간 현황도 더 정확해진 느낌!
개발자분들 고생 많으셨습니다 👍`,
    author: "앱유저",
    date: "2025-10-31",
    views: 567,
    likes: 89,
    comments: 23,
    category: "후기",
  },
  {
    id: 6,
    title: "신촌 근처 대여소 더 늘려주면 좋겠어요",
    content: `신촌역 주변에 대여소가 부족한 것 같습니다.
특히 저녁시간에는 자전거를 찾기가 너무 힘들어요.
검토 부탁드립니다!`,
    author: "신촌주민",
    date: "2025-10-30",
    views: 312,
    likes: 34,
    comments: 7,
    category: "제안",
  },
  {
    id: 7,
    title: "야간에 따릉이 타도 안전한가요?",
    content: `밤늦게 따릉이 이용하려고 하는데 안전한지 궁금합니다.
전조등은 있는 걸로 아는데 밝기가 어떤가요?`,
    author: "야간라이더",
    date: "2025-10-29",
    views: 189,
    likes: 8,
    comments: 15,
    category: "질문",
  },
];

export function CommunityPage({ onClose, onLoginClick, onSignupClick, onStationFinderClick, onNoticeClick, onPurchaseClick, onFaqClick, onHomeClick, onProfileClick, onRankingClick }: CommunityPageProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
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

  // 고정 글은 항상 상단에 표시
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
    alert("게시글이 작성되었습니다!");
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
            <h1 className="mb-2">커뮤니티</h1>
            <p className="text-gray-600">따릉이 이용자들과 소통하세요</p>
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
              <h2 className="mb-6">게시글 작성</h2>
              
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