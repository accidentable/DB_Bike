import { useState } from "react";
import { Check, ThumbsUp, MessageCircle, Star } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Header } from "../components/layout/Header";

interface PurchasePageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
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
    name: "1?œê°„ê¶?,
    price: "1,000??,
    duration: "1?œê°„",
    features: [
      "1?œê°„ ?´ìš© ê°€??,
      "ì¶”ê? ?œê°„??1,000??,
      "ëª¨ë“  ?€?¬ì†Œ ?´ìš© ê°€??,
      "24?œê°„ ?´ìš© ê°€??,
    ],
    popular: false,
    likes: 245,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "ê¹€ì² ìˆ˜",
        date: "2025.10.28",
        rating: 4,
        content: "ì§§ì? ê±°ë¦¬ ?´ë™??????ì¢‹ì•„?? ê°€ê²©ë„ ?€?´í•˜ê³??¸ë¦¬?©ë‹ˆ??",
        likes: 12,
        liked: false,
      },
      {
        id: 2,
        author: "?´ì˜??,
        date: "2025.10.25",
        rating: 5,
        content: "ê°€???´ìš©?˜ëŠ”??1?œê°„?´ë©´ ì¶©ë¶„?´ì„œ ?´ìš©ê¶??ì£¼ êµ¬ë§¤?©ë‹ˆ??",
        likes: 8,
        liked: false,
      },
    ],
  },
  {
    name: "1?¼ê¶Œ",
    price: "2,000??,
    duration: "24?œê°„",
    features: [
      "24?œê°„ ë¬´ì œ???´ìš©",
      "1???´ìš©?œê°„ 2?œê°„ê¹Œì?",
      "ëª¨ë“  ?€?¬ì†Œ ?´ìš© ê°€??,
      "?¹ì¼ ?ì •ê¹Œì? ? íš¨",
    ],
    popular: true,
    likes: 892,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "ë°•ë???,
        date: "2025.10.30",
        rating: 5,
        content: "?˜ë£¨ ì¢…ì¼ ?¬ëŸ¬ ê³??Œì•„?¤ë‹ ??ìµœê³ ?ˆìš”. ê°€?±ë¹„ ?íŒ??",
        likes: 45,
        liked: false,
      },
      {
        id: 2,
        author: "?•ìˆ˜ì§?,
        date: "2025.10.29",
        rating: 5,
        content: "ì£¼ë§???œìš¸ êµ¬ê²½?????¬ìš©?ˆëŠ”???ˆë¬´ ì¢‹ì•˜?´ìš”. ì¶”ì²œ?©ë‹ˆ??",
        likes: 32,
        liked: false,
      },
      {
        id: 3,
        author: "ìµœë™??,
        date: "2025.10.27",
        rating: 4,
        content: "ê°€ê²??€ë¹?ë§Œì¡±?„ê? ?’ìŠµ?ˆë‹¤. 2?œê°„ë§ˆë‹¤ ë°˜ë‚©?˜ë©´ ?˜ë‹ˆê¹?ë¶ˆí¸?¨ë„ ?†ì–´??",
        likes: 18,
        liked: false,
      },
    ],
  },
  {
    name: "?•ê¸°ê¶?,
    price: "5,000??,
    duration: "30??,
    features: [
      "30?¼ê°„ ë¬´ì œ???´ìš©",
      "1???´ìš©?œê°„ 2?œê°„ê¹Œì?",
      "ëª¨ë“  ?€?¬ì†Œ ?´ìš© ê°€??,
      "365??24?œê°„ ?´ìš©",
    ],
    popular: false,
    likes: 1523,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "ê°•ì???,
        date: "2025.10.31",
        rating: 5,
        content: "ì¶œí‡´ê·¼ìš©?¼ë¡œ ?„ë²½?©ë‹ˆ?? ???¬ì— 5ì²œì›?´ë©´ ?•ë§ ?€?´í•´??",
        likes: 67,
        liked: false,
      },
      {
        id: 2,
        author: "?¤ì„œ??,
        date: "2025.10.28",
        rating: 5,
        content: "ë§¤ì¼ ?´ìš©?˜ëŠ”???•ê¸°ê¶Œì´ ?œì¼ ê²½ì œ?ì´?ìš”. ê°•ì¶”!",
        likes: 54,
        liked: false,
      },
      {
        id: 3,
        author: "?„íƒœ??,
        date: "2025.10.26",
        rating: 4,
        content: "?ì£¼ ?´ìš©?œë‹¤ë©??•ê¸°ê¶Œì´ ?µì…?ˆë‹¤. ?œë‹¬ ?´ë‚´ ë¶€???†ì´ ?€??",
        likes: 29,
        liked: false,
      },
    ],
  },
  {
    name: "?°ê°„ê¶?,
    price: "30,000??,
    duration: "365??,
    features: [
      "1?„ê°„ ë¬´ì œ???´ìš©",
      "1???´ìš©?œê°„ 2?œê°„ê¹Œì?",
      "ëª¨ë“  ?€?¬ì†Œ ?´ìš© ê°€??,
      "ê°€??ê²½ì œ?ì¸ ? íƒ",
    ],
    popular: false,
    likes: 2341,
    liked: false,
    reviews: [
      {
        id: 1,
        author: "?¡ë???,
        date: "2025.10.30",
        rating: 5,
        content: "1???™ì•ˆ ?°ë‹ˆê¹????¬ì— 2,500??ê¼´ì´?ìš”. ?„ì „ ?œì!",
        likes: 89,
        liked: false,
      },
      {
        id: 2,
        author: "?œì?ë¯?,
        date: "2025.10.27",
        rating: 5,
        content: "ë§¤ì¼ ì¶œí‡´ê·¼ì— ?´ìš©?˜ëŠ”???°ê°„ê¶Œì´ ?œì¼ ?©ë¦¬?ì´?ìš”. ìµœê³ ?…ë‹ˆ??",
        likes: 76,
        liked: false,
      },
      {
        id: 3,
        author: "?¤ì„±ë¯?,
        date: "2025.10.24",
        rating: 5,
        content: "?‘ë…„???´ì–´ ?¬í•´???°ê°„ê¶??Šì—ˆ?´ìš”. ?ì£¼ ?€ë©??´ê²Œ ?œì¼ ?´ë“!",
        likes: 62,
        liked: false,
      },
      {
        id: 4,
        author: "ë°±í˜„??,
        date: "2025.10.22",
        rating: 4,
        content: "?¼ì£¼?¼ì— 3ë²??´ìƒë§??€??ë³¸ì „ ë½‘ëŠ” ê²?ê°™ì•„?? ì¢‹ìŠµ?ˆë‹¤.",
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
      author: "?¬ìš©?? + Math.floor(Math.random() * 1000),
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
          <h1 className="mb-2">?´ìš©ê¶?êµ¬ë§¤</h1>
          <p className="text-gray-600">
            ?©ë¦¬?ì¸ ê°€ê²©ìœ¼ë¡??¸ë¦¬?˜ê²Œ ?´ìš©?˜ì„¸??
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
                  ?¸ê¸°
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
                êµ¬ë§¤?˜ê¸°
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
              <h3>{plans[selectedPlan].name} ?„ê¸°</h3>
              <Button
                onClick={() =>
                  setShowReviewForm(
                    showReviewForm === selectedPlan ? null : selectedPlan
                  )
                }
                className="bg-[#00A862] hover:bg-[#008F54]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                ?„ê¸° ?‘ì„±
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm === selectedPlan && (
              <Card className="p-4 mb-6 bg-gray-50">
                <div className="mb-4">
                  <label className="block text-sm mb-2">?‰ì </label>
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
                  placeholder="?´ìš©ê¶Œì— ?€???„ê¸°ë¥??‘ì„±?´ì£¼?¸ìš”"
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
                    ì·¨ì†Œ
                  </Button>
                  <Button
                    onClick={() => handleSubmitReview(selectedPlan)}
                    className="bg-[#00A862] hover:bg-[#008F54]"
                  >
                    ?±ë¡
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
          <h3 className="mb-4">?’¡ ?Œì•„?ì„¸??/h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>??1???´ìš©?œê°„ ì´ˆê³¼ ??ì¶”ê? ?”ê¸ˆ??ë¶€ê³¼ë©?ˆë‹¤ (5ë¶„ë‹¹ 200??</li>
            <li>???€????2?œê°„ ?´ë‚´ ?¤ë¥¸ ?€?¬ì†Œ??ë°˜ë‚©?˜ì‹œë©?ì¶”ê? ?”ê¸ˆ???†ìŠµ?ˆë‹¤</li>
            <li>???•ê¸°ê¶? ?°ê°„ê¶Œì? 1???´ìš© ??2?œê°„ ?´ë‚´ ë°˜ë‚© ??ë¬´ë£Œë¡??¬ë???ê°€?¥í•©?ˆë‹¤</li>
            <li>???ì „ê±??¼ì† ë°?ë¶„ì‹¤ ??ë³„ë„ ë°°ìƒ ì±…ì„???ˆìŠµ?ˆë‹¤</li>
            <li>??ëª¨ë“  ?”ê¸ˆ?œëŠ” ?œìš¸???„ì—­ 2,500ê°??´ìƒ???€?¬ì†Œ?ì„œ ?´ìš© ê°€?¥í•©?ˆë‹¤</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
