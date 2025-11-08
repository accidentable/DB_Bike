// src/pages/PurchasePage.tsx
// (목업 데이터 제거 및 API 연동 뼈대 추가)

import { useState, useEffect } from "react";
import { Check, ThumbsUp, MessageCircle, Star } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import Header from "../components/layout/Header";
// (신규) 이용권 API 함수 (Person 1이 구현할 파일)
// import { getTicketPlans, purchaseTicket, likePlan, submitReview } from "../api/ticketApi"; 
import { useAuth } from "../contexts/AuthContext";

// --- 백엔드 응답 타입 정의 (Person 1의 ticketApi.ts에서 사용) ---
interface Plan {
  plan_id: number;
  name: string;
  price: number; // API는 number로 줄 확률 높음
  duration_days: number;
  features: string[];
  is_popular: boolean;
  likes_count: number; 
  reviews_count: number;
}
interface Review {
  review_id: number;
  author_name: string;
  rating: number;
  content: string;
  likes: number;
}
// ---

export default function PurchasePage() { // (props 제거)
  const { isLoggedIn, navigate } = useAuth(); // AuthContext 사용

  // (수정) initialPlans 목업 데이터 제거
  const [plans, setPlans] = useState<Plan[]>([]); 
  const [reviews, setReviews] = useState<Review[]>([]); // 현재 선택된 플랜의 리뷰
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. API 호출: 이용권 목록 가져오기 ---
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        // const response = await getTicketPlans(); // API 호출
        // if (response.success) {
        //   setPlans(response.data);
        // }
        
        // (API가 구현될 때까지 임시 목업 데이터를 사용)
        setPlans([
          { plan_id: 1, name: "1시간권", price: 1000, duration_days: 0, features: ["1시간 이용 가능", "추가 시간당 1,000원"], is_popular: false, likes_count: 245, reviews_count: 2 },
          { plan_id: 2, name: "1일권", price: 2000, duration_days: 1, features: ["24시간 무제한 이용", "1회 이용시간 2시간까지"], is_popular: true, likes_count: 892, reviews_count: 3 },
          { plan_id: 3, name: "정기권", price: 5000, duration_days: 30, features: ["30일간 무제한 이용", "1회 이용시간 2시간까지"], is_popular: false, likes_count: 1523, reviews_count: 3 },
        ]);
        
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // --- 2. API 연동: 구매하기 (결제 로직) ---
  const handlePurchase = async (planId: number) => {
    if (!isLoggedIn) return navigate('/login');
    
    // (Person 1이 결제 SDK 연동 후 이 로직을 구현)
    alert(`[결제 팝업 시뮬레이션] ${planId}번 플랜 결제 요청을 보냅니다.`);
    
    // try {
    //   const paymentResult = await openPaymentSDK(planId); // Toss/Portone SDK 호출
    //   const response = await purchaseTicket(planId, paymentResult.uid); // 백엔드 검증 API 호출
    //   if (response.success) {
    //     alert("이용권 구매 및 등록이 완료되었습니다.");
    //   }
    // } catch (err) {
    //   alert("결제 또는 등록에 실패했습니다.");
    // }
  };

  // --- 3. API 연동: 후기 작성/조회 ---
  const handleReviewClick = (planId: number) => {
    setSelectedPlanId(planId);
    // (신규) API 호출: getReviews(planId) 로 해당 플랜의 리뷰 목록을 가져와 setReviews에 저장
  };
  
  const handleSubmitReview = async (planId: number) => {
    if (!isLoggedIn) return alert('로그인이 필요합니다.');
    if (!reviewContent.trim()) return;

    // try {
    //   await submitReview(planId, reviewContent, reviewRating); // 백엔드 API 호출
    //   alert("후기가 등록되었습니다.");
    //   // handleReviewClick(planId); // 리뷰 목록 새로고침
    // } catch (err) {
    //   alert('리뷰 등록에 실패했습니다.');
    // }
    
    // (임시 목업 로직)
    setReviews([{ review_id: Date.now(), author_name: user?.username || '새로운 유저', rating: reviewRating, content: reviewContent, likes: 0 }]);

    setReviewContent("");
    setReviewRating(5);
    setShowReviewForm(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
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
              key={plan.plan_id}
              className={`p-6 relative ${
                plan.is_popular ? "border-[#00A862] border-2 shadow-lg" : "border-gray-200"
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A862] text-white px-4 py-1 rounded-full text-sm">
                  인기
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="mb-2">{plan.name}</h3>
                <div className="text-3xl text-[#00A862] mb-1">{plan.price.toLocaleString()}원</div>
                <p className="text-sm text-gray-600">{plan.duration_days}일</p>
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
                onClick={() => handlePurchase(plan.plan_id)}
                className={`w-full mb-4 ${
                  plan.is_popular ? "bg-[#00A862] hover:bg-[#008F54]" : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                구매하기
              </Button>

              {/* Like Button & Review Count (API 연동 필요) */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  // onClick={() => handleLikePlan(plan.plan_id)} // API 연동 필요
                  className={`flex items-center gap-2 text-gray-600`}
                >
                  <ThumbsUp className={`w-4 h-4`} />
                  <span>{plan.likes_count}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReviewClick(plan.plan_id)}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{plan.reviews_count}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Reviews Section (Review State 기반으로 렌더링) */}
        {selectedPlanId !== null && (
          <Card className="p-6 mb-12">
            {/* ... (리뷰 폼 UI는 원본과 동일하게 유지) ... */}
            <div className="flex items-center justify-between mb-6">
              <h3>{plans.find(p => p.plan_id === selectedPlanId)?.name} 후기</h3>
              <Button
                onClick={() => setShowReviewForm(showReviewForm === selectedPlanId ? null : selectedPlanId)}
                className="bg-[#00A862] hover:bg-[#008F54]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                후기 작성
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm === selectedPlanId && (
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
                            rating <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
                    onClick={() => handleSubmitReview(selectedPlanId)}
                    className="bg-[#00A862] hover:bg-[#008F54]"
                  >
                    등록
                  </Button>
                </div>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.review_id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{review.author_name}</span>
                        {/* <span className="text-xs text-gray-500">{review.date}</span> */}
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={() => handleLikeReview(selectedPlanId, review.review_id)} // API 연동 필요
                      className={`flex items-center gap-1 text-gray-600`}
                    >
                      <ThumbsUp className={`w-4 h-4`} />
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