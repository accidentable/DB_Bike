/**
 * src/pages/PurchasePage.tsx
 * 이용권 구매 페이지
 * 
 * 사용된 API:
 * - ticketApi: getTicketTypes, purchaseTicket
 * - authApi: isAuthenticated, getCurrentUser
 * - pointApi: getPointBalance, chargePoints
 */

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getTicketTypes, purchaseTicket } from "../api/ticketApi";
import type { TicketType } from "../api/ticketApi";
import { isAuthenticated, getCurrentUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { getPointBalance, chargePoints } from "../api/pointApi";
import { useAuth } from "../contexts/AuthContext";

const defaultTickets: TicketType[] = [
  {
    ticket_type_id: 1,
    name: "1시간권",
    duration_hours: 1,
    price: 1000,
    description: "1시간 동안 자유롭게 이용,1시간 이내 반납 시 추가요금 없음,전국 2500개 대여소 이용 가능",
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

  const fetchPointBalance = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await getPointBalance();
      if (response.success && response.data !== undefined) {
        setPointBalance(response.data);
      }
    } catch (err) {
      console.error("포인트 잔액 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPointBalance();
  }, [isLoggedIn]);

  const handlePurchase = async (ticketTypeId: number, ticketName: string, price: number) => {
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
        await fetchPointBalance();
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
                      if (response.success && response.data) {
                        // DB에서 반환된 실제 잔액으로 업데이트
                        const newBalance = response.data.new_balance;
                        alert(`${chargeAmount.toLocaleString()}P가 충전되었습니다.\n현재 잔액: ${newBalance.toLocaleString()}P`);
                        setPointBalance(newBalance);
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
                    className={`w-full ${
                      isPopular ? "bg-[#00A862] hover:bg-[#008F54]" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {purchasingTicketId === ticket.ticket_type_id ? '구매 중...' : `${ticket.price}P로 구매하기`}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        
      </div>
    </div>
  );
}