import { Calendar, Eye, Pin, Filter, SortDesc } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Header } from "./Header";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface NoticePageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
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
    date: "2025-11-01",
    views: 1234,
    isPinned: true,
    category: "개설",
  },
  {
    id: 2,
    title: "잠실역 7번 출구 대여소 임시 폐쇄 안내",
    content: `안녕하세요, 서울자전거 따릉이입니다.

공사로 인해 잠실역 7번 출구 대여소가 임시 폐쇄됩니다.

📍 위치: 서울시 송파구 올림픽로 지하 265
⏰ 폐쇄 기간: 2025-11-03 ~ 2025-11-30
💡 대체 대여소: 잠실역 2번 출구 대여소 (도보 5분)

이용에 불편을 드려 죄송합니다.

감사합니다.`,
    date: "2025-10-30",
    views: 892,
    isPinned: true,
    category: "폐쇄",
  },
  {
    id: 3,
    title: "홍대입구역 3번 출구 대여소 신규 개설",
    content: `안녕하세요, 서울자전거 따릉이입니다.

홍대입구역 3번 출구 인근에 새로운 대여소가 개설되었습니다.

📍 위치: 서울시 마포구 양화로 지하 188
🚲 자전거 수: 25대
⏰ 운영 시간: 24시간

많은 이용 부탁드립니다.`,
    date: "2025-10-28",
    views: 756,
    isPinned: false,
    category: "개설",
  },
  {
    id: 4,
    title: "시청역 12번 출구 대여소 영구 폐쇄 안내",
    content: `안녕하세요, 서울자전거 따릉이입니다.

시청역 12번 출구 대여소가 주변 개발로 인해 영구 폐쇄됩니다.

📍 위치: 서울시 중구 세종대로 지하 99
⏰ 폐쇄 일자: 2025-10-25
💡 대체 대여소: 
   - 시청역 4번 출구 대여소 (도보 3분)
   - 광화문역 5번 출구 대여소 (도보 7분)

이용에 불편을 드려 죄송합니다.`,
    date: "2025-10-25",
    views: 1567,
    isPinned: false,
    category: "폐쇄",
  },
  {
    id: 5,
    title: "신림역 1번 출구 대여소 신규 개설",
    content: `안녕하세요, 서울자전거 따릉이입니다.

신림역 1번 출구 인근에 새로운 대여소가 개설되었습니다.

📍 위치: 서울시 관악구 신림로 지하 330
🚲 자전거 수: 20대
⏰ 운영 시간: 24시간

많은 이용 부탁드립니다.`,
    date: "2025-10-20",
    views: 543,
    isPinned: false,
    category: "개설",
  },
  {
    id: 6,
    title: "11월 정기 점검으로 인한 일부 대여소 운영 중단",
    content: `안녕하세요, 서울자전거 따릉이입니다.

11월 정기 점검으로 인해 일부 대여소가 임시 운영 중단됩니다.

⏰ 점검 일자: 2025-11-15 (수) 02:00 ~ 06:00
📍 대상 대여소: 강남구, 서초구 전체 대여소

점검 시간에는 대여 및 반납이 불가능합니다.
이용에 불편을 드려 죄송합니다.

감사합니다.`,
    date: "2025-10-15",
    views: 2103,
    isPinned: false,
    category: "일반",
  },
];

export function NoticePage({ onClose, onLoginClick, onSignupClick, onStationFinderClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick }: NoticePageProps) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Notice["category"] | "전체">("전체");
  const [sortBy, setSortBy] = useState<"date" | "views">("date");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "개설":
        return "bg-[#00A862] text-white";
      case "폐쇄":
        return "bg-red-500 text-white";
      case "일반":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
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
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onClose}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
      />

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
