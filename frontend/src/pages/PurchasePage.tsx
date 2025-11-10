// src/pages/PurchasePage.tsx
import { useState, useEffect } from "react";
import { Check, ThumbsUp, MessageCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getTicketTypes, purchaseTicket } from "../api/ticketApi";
import type { TicketType } from "../api/ticketApi";
import { isAuthenticated, getCurrentUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { getPointBalance, chargePoints } from "../api/pointApi";
import { useAuth } from "../contexts/AuthContext";

// 기본 이용권 데이터 (서버 연결 실패시 사용)
const defaultTickets: TicketType[] = [
  {
    ticket_type_id: 1,
    name: "1시간권",
    duration_hours: 1,
    price: 1000,
    description: "1시간 동안 자유롭게 이용,2시간 이내 반납 시 추가요금 없음,전국 2500개 대여소 이용 가능",
    ride_limit_minutes: 60,
    created_at: new Date().toISOString()
  },
  {
    ticket_type_id: 2,
    name: "1일권",
    duration_hours: 24,
    price: 3000,
    description: "24시간 동안 자유롭게 이용,2시간 이내 반납 시 추가요금 없음,전국 2500개 대여소 이용 가능",
    ride_limit_minutes: 120,
    created_at: new Date().toISOString()
  },
  {
    ticket_type_id: 3,
    name: "정기권",
    duration_hours: 720,
    price: 15000,
    description: "30일 동안 무제한 이용,2시간 이내 반납 시 무료 재대여,전국 2500개 대여소 이용 가능",
    ride_limit_minutes: 120,
    created_at: new Date().toISOString()
  },
  {
    ticket_type_id: 4,
    name: "연간권",
    duration_hours: 8760,
    price: 30000,
    description: "365일 동안 무제한 이용,2시간 이내 반납 시 무료 재대여,전국 2500개 대여소 이용 가능",
    ride_limit_minutes: 120,
    created_at: new Date().toISOString()
  }
];

// 이용권별 좋아요/후기 수 (Mock 데이터)
const ticketStats: { [key: string]: { likes: number; reviews: number } } = {
  "1시간권": { likes: 245, reviews: 2 },
  "1일권": { likes: 892, reviews: 3 },
  "정기권": { likes: 1523, reviews: 3 },
  "연간권": { likes: 2341, reviews: 4 },
};

export default function PurchasePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchasingTicketId, setPurchasingTicketId] = useState<number | null>(null);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeAmount, setChargeAmount] = useState<number>(0);

  // --- 1. 이용권 목록 가져오기 ---
  useEffect(() => {
    const fetchTicketTypes = async () => {
      setIsLoading(true);
      try {
        const response = await getTicketTypes();
        console.log('Ticket types response:', response);
        if (response.success && response.data && response.data.length > 0) {
          setTicketTypes(response.data);
        } else {
          console.warn('Using default ticket types due to API error or empty response');
          setTicketTypes(defaultTickets);
        }
      } catch (err) {
        console.error("이용권 목록 불러오기 실패:", err);
        setTicketTypes(defaultTickets);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicketTypes();
  }, []);

  // --- 2. 이용권 구매 ---
  const handlePurchase = async (ticketTypeId: number, ticketName: string, price: number) => {
    // 로그인 확인
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    // 포인트 잔액 확인
    if (pointBalance < price) {
      const wantToCharge = window.confirm(
        `포인트가 부족합니다.\n현재 잔액: ${pointBalance}P\n필요 금액: ${price}P\n\n포인트를 충전하시겠습니까?`
      );
      if (wantToCharge) {
        setChargeAmount(price - pointBalance);
        setShowChargeModal(true);
      }
      return;
    }

    // 구매 확인
    const confirmed = window.confirm(
      `${ticketName}을(를) ${price}P로 구매하시겠습니까?\n(현재 잔액: ${pointBalance}P)`
    );
    if (!confirmed) return;

    setPurchasingTicketId(ticketTypeId);

    try {
      const response = await purchaseTicket(ticketTypeId);
      
      if (response.success && response.data) {
        alert(`${response.message || '이용권 구매가 완료되었습니다!'}\n만료 시간: ${new Date(response.data.expiry_time).toLocaleString()}`);
        // 구매 완료 후 프로필 페이지로 이동 (이용권 확인)
        navigate('/profile');
      } else {
        alert(response.message || '이용권 구매에 실패했습니다.');
      }
    } catch (err) {
      console.error('이용권 구매 중 오류:', err);
      alert('이용권 구매 중 오류가 발생했습니다.');
    } finally {
      setPurchasingTicketId(null);
    }
  };

  // 이용권의 duration_hours를 사람이 읽기 쉬운 형식으로 변환
  const formatDuration = (hours: number): string => {
    if (hours < 24) return `${hours}시간`;
    if (hours < 720) return `${Math.floor(hours / 24)}일`;
    if (hours < 8760) return `${Math.floor(hours / 720)}개월`;
    return `${Math.floor(hours / 8760)}년`;
  };

  // 이용권 설명을 배열로 변환
  const parseFeatures = (description: string): string[] => {
    return description.split(',').map(f => f.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">이용권 구매</h1>
          <p className="text-gray-600">
            합리적인 가격으로 편리하게 이용하세요
          </p>
          {isLoggedIn && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">현재 포인트</span>
                <p className="text-xl font-bold text-[#00A862]">{pointBalance.toLocaleString()}P</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setChargeAmount(5000);
                  setShowChargeModal(true);
                }}
              >
                충전하기
              </Button>
            </div>
          )}
        </div>

        {showChargeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">포인트 충전</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    충전할 금액
                  </label>
                  <input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="flex gap-2">
                  {[5000, 10000, 30000, 50000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setChargeAmount(amount)}
                      className={`flex-1 py-2 px-3 rounded ${
                        chargeAmount === amount
                          ? 'bg-[#00A862] text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {amount.toLocaleString()}원
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowChargeModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 bg-[#00A862] hover:bg-[#007F4E]"
                  onClick={async () => {
                    try {
                      const response = await chargePoints(chargeAmount);
                      if (response.success) {
                        alert(`${chargeAmount.toLocaleString()}P가 충전되었습니다.`);
                        setPointBalance(prev => prev + chargeAmount);
                        setShowChargeModal(false);
                      } else {
                        alert(response.message || '충전에 실패했습니다.');
                      }
                    } catch (err) {
                      console.error('포인트 충전 중 오류:', err);
                      alert('충전 중 오류가 발생했습니다.');
                    }
                  }}
                >
                  충전하기
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">이용권 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {ticketTypes.map((ticket) => {
              const isPopular = ticket.name === '1일권'; // 1일권을 인기로 설정
              
              return (
                <Card
                  key={ticket.ticket_type_id}
                  className={`p-6 relative ${
                    isPopular ? "border-[#00A862] border-2 shadow-lg" : "border-gray-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A862] text-white px-4 py-1 rounded-full text-sm">
                      인기
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{ticket.name}</h3>
                    <div className="text-3xl font-bold text-[#00A862] mb-1">
                      {ticket.price.toLocaleString()}원
                    </div>
                    <p className="text-sm text-gray-600">{formatDuration(ticket.duration_hours)}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {parseFeatures(ticket.description).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handlePurchase(ticket.ticket_type_id, ticket.name, ticket.price)}
                    disabled={purchasingTicketId === ticket.ticket_type_id}
                    className={`w-full mb-4 ${
                      isPopular ? "bg-[#00A862] hover:bg-[#008F54]" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {purchasingTicketId === ticket.ticket_type_id ? '구매 중...' : `${ticket.price}P로 구매하기`}
                  </Button>

                  {/* 좋아요 & 후기 영역 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#00A862]"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 좋아요 기능 (나중에 구현)
                      }}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{ticketStats[ticket.name]?.likes || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#00A862]"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 후기 보기 기능 (나중에 구현)
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{ticketStats[ticket.name]?.reviews || 0}</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="p-8 bg-blue-50 border-blue-200 mt-12">
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