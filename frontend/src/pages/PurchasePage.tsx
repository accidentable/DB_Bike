import { useState } from "react";
import { Check, ThumbsUp, MessageCircle, Star } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Header } from "./Header";

interface PurchasePageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
}

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  content: string;
  likes: number;
  liked: boolean;
}

interface Plan {
  name: string;
  price: string;
  duration: string;
  features: string[];
  popular: boolean;
  likes: number;
  liked: boolean;
  reviews: Review[];
}

const initialPlans: Plan[] = [
  {
    name: "1시간권",
    price: "1,000원",
    duration: "1시간",
    features: [
      "1시간 이용 가능",
      "추가 시간당 1,000원",
      "모든 대여소 이용 가능",
      "24시간 이용 가능",
    ],
    popular: false,
    likes: 245,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "김철수",
        date: "2025.10.28",
        rating: 4,
        content: "짧은 거리 이동할 때 딱 좋아요! 가격도 저렴하고 편리합니다.",
        likes: 12,
        liked: false,
      },
      {
        id: 2,
        author: "이영희",
        date: "2025.10.25",
        rating: 5,
        content: "가끔 이용하는데 1시간이면 충분해서 이용권 자주 구매합니다.",
        likes: 8,
        liked: false,
      },
    ],
  },
  {
    name: "1일권",
    price: "2,000원",
    duration: "24시간",
    features: [
      "24시간 무제한 이용",
      "1회 이용시간 2시간까지",
      "모든 대여소 이용 가능",
      "당일 자정까지 유효",
    ],
    popular: true,
    likes: 892,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "박민수",
        date: "2025.10.30",
        rating: 5,
        content: "하루 종일 여러 곳 돌아다닐 때 최고예요. 가성비 끝판왕!",
        likes: 45,
        liked: false,
      },
      {
        id: 2,
        author: "정수진",
        date: "2025.10.29",
        rating: 5,
        content: "주말에 서울 구경할 때 사용했는데 너무 좋았어요. 추천합니다!",
        likes: 32,
        liked: false,
      },
      {
        id: 3,
        author: "최동욱",
        date: "2025.10.27",
        rating: 4,
        content: "가격 대비 만족도가 높습니다. 2시간마다 반납하면 되니까 불편함도 없어요.",
        likes: 18,
        liked: false,
      },
    ],
  },
  {
    name: "정기권",
    price: "5,000원",
    duration: "30일",
    features: [
      "30일간 무제한 이용",
      "1회 이용시간 2시간까지",
      "모든 대여소 이용 가능",
      "365일 24시간 이용",
    ],
    popular: false,
    likes: 1523,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "강지훈",
        date: "2025.10.31",
        rating: 5,
        content: "출퇴근용으로 완벽합니다. 한 달에 5천원이면 정말 저렴해요!",
        likes: 67,
        liked: false,
      },
      {
        id: 2,
        author: "윤서아",
        date: "2025.10.28",
        rating: 5,
        content: "매일 이용하는데 정기권이 제일 경제적이에요. 강추!",
        likes: 54,
        liked: false,
      },
      {
        id: 3,
        author: "임태윤",
        date: "2025.10.26",
        rating: 4,
        content: "자주 이용한다면 정기권이 답입니다. 한달 내내 부담 없이 타요.",
        likes: 29,
        liked: false,
      },
    ],
  },
  {
    name: "연간권",
    price: "30,000원",
    duration: "365일",
    features: [
      "1년간 무제한 이용",
      "1회 이용시간 2시간까지",
      "모든 대여소 이용 가능",
      "가장 경제적인 선택",
    ],
    popular: false,
    likes: 2341,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "송민호",
        date: "2025.10.30",
        rating: 5,
        content: "1년 동안 쓰니까 한 달에 2,500원 꼴이에요. 완전 혜자!",
        likes: 89,
        liked: false,
      },
      {
        id: 2,
        author: "한지민",
        date: "2025.10.27",
        rating: 5,
        content: "매일 출퇴근에 이용하는데 연간권이 제일 합리적이에요. 최고입니다!",
        likes: 76,
        liked: false,
      },
      {
        id: 3,
        author: "오성민",
        date: "2025.10.24",
        rating: 5,
        content: "작년에 이어 올해도 연간권 끊었어요. 자주 타면 이게 제일 이득!",
        likes: 62,
        liked: false,
      },
      {
        id: 4,
        author: "백현우",
        date: "2025.10.22",
        rating: 4,
        content: "일주일에 3번 이상만 타도 본전 뽑는 것 같아요. 좋습니다.",
        likes: 41,
        liked: false,
      },
    ],
  },
];

export function PurchasePage({ onClose, onLoginClick, onSignupClick, onStationFinderClick, onNoticeClick, onCommunityClick, onFaqClick, onHomeClick }: PurchasePageProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const handleLikePlan = (index: number) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan, i) =>
        i === index
          ? {
              ...plan,
              liked: !plan.liked,
              likes: plan.liked ? plan.likes - 1 : plan.likes + 1,
            }
          : plan
      )
    );
  };

  const handleLikeReview = (planIndex: number, reviewId: number) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan, i) =>
        i === planIndex
          ? {
              ...plan,
              reviews: plan.reviews.map((review) =>
                review.id === reviewId
                  ? {
                      ...review,
                      liked: !review.liked,
                      likes: review.liked ? review.likes - 1 : review.likes + 1,
                    }
                  : review
              ),
            }
          : plan
      )
    );
  };

  const handleSubmitReview = (planIndex: number) => {
    if (!reviewContent.trim()) return;

    const newReview: Review = {
      id: Date.now(),
      author: "사용자" + Math.floor(Math.random() * 1000),
      date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").slice(0, -1),
      rating: reviewRating,
      content: reviewContent,
      likes: 0,
      liked: false,
    };

    setPlans((prevPlans) =>
      prevPlans.map((plan, i) =>
        i === planIndex
          ? {
              ...plan,
              reviews: [newReview, ...plan.reviews],
            }
          : plan
      )
    );

    setReviewContent("");
    setReviewRating(5);
    setShowReviewForm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onClose}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">이용권 구매</h1>
          <p className="text-gray-600">
            합리적인 가격으로 편리하게 이용하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 relative ${
                plan.popular
                  ? "border-[#00A862] border-2 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A862] text-white px-4 py-1 rounded-full text-sm">
                  인기
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="mb-2">{plan.name}</h3>
                <div className="text-3xl text-[#00A862] mb-1">{plan.price}</div>
                <p className="text-sm text-gray-600">{plan.duration}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mb-4 ${
                  plan.popular
                    ? "bg-[#00A862] hover:bg-[#008F54]"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                구매하기
              </Button>

              {/* Like Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePlan(index)}
                  className={`flex items-center gap-2 ${
                    plan.liked ? "text-[#00A862]" : "text-gray-600"
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${plan.liked ? "fill-current" : ""}`}
                  />
                  <span>{plan.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlan(selectedPlan === index ? null : index)}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{plan.reviews.length}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Reviews Section */}
        {selectedPlan !== null && (
          <Card className="p-6 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3>{plans[selectedPlan].name} 후기</h3>
              <Button
                onClick={() =>
                  setShowReviewForm(
                    showReviewForm === selectedPlan ? null : selectedPlan
                  )
                }
                className="bg-[#00A862] hover:bg-[#008F54]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                후기 작성
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm === selectedPlan && (
              <Card className="p-4 mb-6 bg-gray-50">
                <div className="mb-4">
                  <label className="block text-sm mb-2">평점</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= reviewRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="이용권에 대한 후기를 작성해주세요"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="mb-4"
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(null);
                      setReviewContent("");
                      setReviewRating(5);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => handleSubmitReview(selectedPlan)}
                    className="bg-[#00A862] hover:bg-[#008F54]"
                  >
                    등록
                  </Button>
                </div>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {plans[selectedPlan].reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{review.author}</span>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeReview(selectedPlan, review.id)}
                      className={`flex items-center gap-1 ${
                        review.liked ? "text-[#00A862]" : "text-gray-600"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${
                          review.liked ? "fill-current" : ""
                        }`}
                      />
                      <span className="text-sm">{review.likes}</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">{review.content}</p>
                </Card>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-8 bg-blue-50 border-blue-200">
          <h3 className="mb-4">💡 알아두세요</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 1회 이용시간 초과 시 추가 요금이 부과됩니다 (5분당 200원)</li>
            <li>• 대여 후 2시간 이내 다른 대여소에 반납하시면 추가 요금이 없습니다</li>
            <li>• 정기권, 연간권은 1회 이용 후 2시간 이내 반납 시 무료로 재대여 가능합니다</li>
            <li>• 자전거 훼손 및 분실 시 별도 배상 책임이 있습니다</li>
            <li>• 모든 요금제는 서울시 전역 2,500개 이상의 대여소에서 이용 가능합니다</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
