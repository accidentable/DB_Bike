import { Check } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const plans = [
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
  },
];

export function Pricing() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">이용요금</h2>
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
                className={`w-full ${
                  plan.popular
                    ? "bg-[#00A862] hover:bg-[#008F54]"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                구매하기
              </Button>
            </Card>
          ))}
        </div>

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
    </section>
  );
}
