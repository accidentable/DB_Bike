/**
 * src/pages/NoticePage.tsx
 * 공지사항 페이지
 * 
 * 사용된 API:
 * (현재 API 미사용 - 정적 데이터)
 */

import { Calendar, Eye, Pin, Filter, SortDesc, ArrowLeft } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface NoticePageProps {
  onClose?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onStationFinderClick?: () => void;
  onCommunityClick?: () => void;
  onPurchaseClick?: () => void;
  onFaqClick?: () => void;
  onHomeClick?: () => void;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  views: number;
  isPinned: boolean;
  category: "개설" | "폐쇄" | "일반";
}

const notices: Notice[] = [
  { id: 1, title: "강남역 4번 출구 대여소 신규 개설 안내", content: `...`, date: "2025-11-01", views: 1234, isPinned: true, category: "개설" },
  { id: 2, title: "잠실역 7번 출구 대여소 임시 폐쇄 안내", content: `...`, date: "2025-10-30", views: 892, isPinned: true, category: "폐쇄" },
  { id: 3, title: "홍대입구역 3번 출구 대여소 신규 개설", content: `...`, date: "2025-10-28", views: 756, isPinned: false, category: "개설" },
  { id: 4, title: "시청역 12번 출구 대여소 영구 폐쇄 안내", content: `...`, date: "2025-10-25", views: 1567, isPinned: false, category: "폐쇄" },
  { id: 5, title: "신림역 1번 출구 대여소 신규 개설", content: `...`, date: "2025-10-20", views: 543, isPinned: false, category: "개설" },
  { id: 6, title: "11월 정기 점검으로 인한 일부 대여소 운영 중단", content: `...`, date: "2025-10-15", views: 2103, isPinned: false, category: "일반" },
];

export default function NoticePage(_props: NoticePageProps = {}) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Notice["category"] | "전체">("전체");
  const [sortBy, setSortBy] = useState<"date" | "views">("date");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "개설": return "bg-[#00A862] text-white";
      case "폐쇄": return "bg-red-500 text-white";
      case "일반": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const filteredAndSortedNotices = notices
    .filter(notice => selectedCategory === "전체" ? true : notice.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.views - a.views;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header는 App.tsx에서 렌더링되므로 제거 */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">공지사항</h1>
          <p className="text-gray-600">따릉이의 새로운 소식을 확인하세요</p>
        </div>

        {/* Category Filter & Sort */}
        {!selectedNotice && (
          <div className="mb-6 flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Notice["category"] | "전체")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="개설">개설</SelectItem>
                  <SelectItem value="폐쇄">폐쇄</SelectItem>
                  <SelectItem value="일반">일반</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-gray-500" />
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as "date" | "views")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">최신순</SelectItem>
                  <SelectItem value="views">조회수순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedNotice ? (
          // Notice Detail View
          <div className="max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setSelectedNotice(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>

            <Card className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {selectedNotice.isPinned && (
                    <Pin className="w-5 h-5 text-[#00A862]" />
                  )}
                  <Badge className={getCategoryColor(selectedNotice.category)}>
                    {selectedNotice.category}
                  </Badge>
                </div>
                <h2 className="mb-4">{selectedNotice.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedNotice.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    조회 {selectedNotice.views.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">
                    {selectedNotice.content}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // Notice List View
          <div className="max-w-4xl mx-auto">
            <div className="space-y-3">
              {filteredAndSortedNotices.map((notice) => (
                <Card
                  key={notice.id}
                  className="p-5 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedNotice(notice)}
                >
                  <div className="flex items-start gap-4">
                    {notice.isPinned && (
                      <Pin className="w-5 h-5 text-[#00A862] flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(notice.category)}>
                          {notice.category}
                        </Badge>
                        {notice.isPinned && (
                          <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
                            공지
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 truncate">{notice.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {notice.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {notice.views.toLocaleString()}
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