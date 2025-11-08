import { Calendar, Eye, Pin, Filter, SortDesc } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Header } from "../components/layout/Header";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  category: "ê°œì„¤" | "?ì‡„" | "?¼ë°˜";
}

const notices: Notice[] = [
  {
    id: 1,
    title: "ê°•ë‚¨??4ë²?ì¶œêµ¬ ?€?¬ì†Œ ? ê·œ ê°œì„¤ ?ˆë‚´",
    content: `?ˆë…•?˜ì„¸?? ?œìš¸?ì „ê±??°ë¦‰?´ì…?ˆë‹¤.

ê°•ë‚¨??4ë²?ì¶œêµ¬ ?¸ê·¼???ˆë¡œ???€?¬ì†Œê°€ ê°œì„¤?˜ì—ˆ?µë‹ˆ??

?“ ?„ì¹˜: ?œìš¸??ê°•ë‚¨êµ?ê°•ë‚¨?€ë¡?ì§€??400 (ê°•ë‚¨??4ë²?ì¶œêµ¬ ?„ë³´ 1ë¶?
?š² ?ì „ê±??? 30?€
???´ì˜ ?œê°„: 24?œê°„

ë§ì? ?´ìš© ë¶€?ë“œë¦½ë‹ˆ??

ê°ì‚¬?©ë‹ˆ??`,
    date: "2025-11-01",
    views: 1234,
    isPinned: true,
    category: "ê°œì„¤",
  },
  {
    id: 2,
    title: "? ì‹¤??7ë²?ì¶œêµ¬ ?€?¬ì†Œ ?„ì‹œ ?ì‡„ ?ˆë‚´",
    content: `?ˆë…•?˜ì„¸?? ?œìš¸?ì „ê±??°ë¦‰?´ì…?ˆë‹¤.

ê³µì‚¬ë¡??¸í•´ ? ì‹¤??7ë²?ì¶œêµ¬ ?€?¬ì†Œê°€ ?„ì‹œ ?ì‡„?©ë‹ˆ??

?“ ?„ì¹˜: ?œìš¸???¡íŒŒêµ??¬ë¦¼?½ë¡œ ì§€??265
???ì‡„ ê¸°ê°„: 2025-11-03 ~ 2025-11-30
?’¡ ?€ì²??€?¬ì†Œ: ? ì‹¤??2ë²?ì¶œêµ¬ ?€?¬ì†Œ (?„ë³´ 5ë¶?

?´ìš©??ë¶ˆí¸???œë ¤ ì£„ì†¡?©ë‹ˆ??

ê°ì‚¬?©ë‹ˆ??`,
    date: "2025-10-30",
    views: 892,
    isPinned: true,
    category: "?ì‡„",
  },
  {
    id: 3,
    title: "?ë??…êµ¬??3ë²?ì¶œêµ¬ ?€?¬ì†Œ ? ê·œ ê°œì„¤",
    content: `?ˆë…•?˜ì„¸?? ?œìš¸?ì „ê±??°ë¦‰?´ì…?ˆë‹¤.

?ë??…êµ¬??3ë²?ì¶œêµ¬ ?¸ê·¼???ˆë¡œ???€?¬ì†Œê°€ ê°œì„¤?˜ì—ˆ?µë‹ˆ??

?“ ?„ì¹˜: ?œìš¸??ë§ˆí¬êµ??‘í™”ë¡?ì§€??188
?š² ?ì „ê±??? 25?€
???´ì˜ ?œê°„: 24?œê°„

ë§ì? ?´ìš© ë¶€?ë“œë¦½ë‹ˆ??`,
    date: "2025-10-28",
    views: 756,
    isPinned: false,
    category: "ê°œì„¤",
  },
  {
    id: 4,
    title: "?œì²­??12ë²?ì¶œêµ¬ ?€?¬ì†Œ ?êµ¬ ?ì‡„ ?ˆë‚´",
    content: `?ˆë…•?˜ì„¸?? ?œìš¸?ì „ê±??°ë¦‰?´ì…?ˆë‹¤.

?œì²­??12ë²?ì¶œêµ¬ ?€?¬ì†Œê°€ ì£¼ë? ê°œë°œë¡??¸í•´ ?êµ¬ ?ì‡„?©ë‹ˆ??

?“ ?„ì¹˜: ?œìš¸??ì¤‘êµ¬ ?¸ì¢…?€ë¡?ì§€??99
???ì‡„ ?¼ì: 2025-10-25
?’¡ ?€ì²??€?¬ì†Œ: 
   - ?œì²­??4ë²?ì¶œêµ¬ ?€?¬ì†Œ (?„ë³´ 3ë¶?
   - ê´‘í™”ë¬¸ì—­ 5ë²?ì¶œêµ¬ ?€?¬ì†Œ (?„ë³´ 7ë¶?

?´ìš©??ë¶ˆí¸???œë ¤ ì£„ì†¡?©ë‹ˆ??`,
    date: "2025-10-25",
    views: 1567,
    isPinned: false,
    category: "?ì‡„",
  },
  {
    id: 5,
    title: "? ë¦¼??1ë²?ì¶œêµ¬ ?€?¬ì†Œ ? ê·œ ê°œì„¤",
    content: `?ˆë…•?˜ì„¸?? ?œìš¸?ì „ê±??°ë¦‰?´ì…?ˆë‹¤.

? ë¦¼??1ë²?ì¶œêµ¬ ?¸ê·¼???ˆë¡œ???€?¬ì†Œê°€ ê°œì„¤?˜ì—ˆ?µë‹ˆ??

?“ ?„ì¹˜: ?œìš¸??ê´€?…êµ¬ ? ë¦¼ë¡?ì§€??330
?š² ?ì „ê±??? 20?€
???´ì˜ ?œê°„: 24?œê°„

ë§ì? ?´ìš© ë¶€?ë“œë¦½ë‹ˆ??`,
    date: "2025-10-20",
    views: 543,
    isPinned: false,
    category: "ê°œì„¤",
  },
  {
    id: 6,
    title: "11???•ê¸° ?ê??¼ë¡œ ?¸í•œ ?¼ë? ?€?¬ì†Œ ?´ì˜ ì¤‘ë‹¨",
    content: `?ˆë…•?˜ì„¸?? ?œìš¸?ì „ê±??°ë¦‰?´ì…?ˆë‹¤.

11???•ê¸° ?ê??¼ë¡œ ?¸í•´ ?¼ë? ?€?¬ì†Œê°€ ?„ì‹œ ?´ì˜ ì¤‘ë‹¨?©ë‹ˆ??

???ê? ?¼ì: 2025-11-15 (?? 02:00 ~ 06:00
?“ ?€???€?¬ì†Œ: ê°•ë‚¨êµ? ?œì´ˆêµ??„ì²´ ?€?¬ì†Œ

?ê? ?œê°„?ëŠ” ?€??ë°?ë°˜ë‚©??ë¶ˆê??¥í•©?ˆë‹¤.
?´ìš©??ë¶ˆí¸???œë ¤ ì£„ì†¡?©ë‹ˆ??

ê°ì‚¬?©ë‹ˆ??`,
    date: "2025-10-15",
    views: 2103,
    isPinned: false,
    category: "?¼ë°˜",
  },
];

export function NoticePage({ onClose, onLoginClick, onSignupClick, onStationFinderClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick }: NoticePageProps) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Notice["category"] | "?„ì²´">("?„ì²´");
  const [sortBy, setSortBy] = useState<"date" | "views">("date");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ê°œì„¤":
        return "bg-[#00A862] text-white";
      case "?ì‡„":
        return "bg-red-500 text-white";
      case "?¼ë°˜":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredAndSortedNotices = notices
    .filter(notice => selectedCategory === "?„ì²´" ? true : notice.category === selectedCategory)
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
          <h1 className="mb-2">ê³µì??¬í•­</h1>
          <p className="text-gray-600">?°ë¦‰?´ì˜ ?ˆë¡œ???Œì‹???•ì¸?˜ì„¸??/p>
        </div>

        {/* Category Filter & Sort */}
        {!selectedNotice && (
          <div className="mb-6 flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Notice["category"] | "?„ì²´")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="ì¹´í…Œê³ ë¦¬ ? íƒ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="?„ì²´">?„ì²´</SelectItem>
                  <SelectItem value="ê°œì„¤">ê°œì„¤</SelectItem>
                  <SelectItem value="?ì‡„">?ì‡„</SelectItem>
                  <SelectItem value="?¼ë°˜">?¼ë°˜</SelectItem>
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
                  <SelectValue placeholder="?•ë ¬ ê¸°ì?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">ìµœì‹ ??/SelectItem>
                  <SelectItem value="views">ì¡°íšŒ?˜ìˆœ</SelectItem>
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
              ëª©ë¡?¼ë¡œ
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
                    ì¡°íšŒ {selectedNotice.views.toLocaleString()}
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
                            ê³µì?
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
