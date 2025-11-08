import { Smartphone, MapPin, Unlock, BikeIcon } from "lucide-react";
import { Card } from "./ui/card";

const steps = [
  {
    icon: Smartphone,
    title: "1. 회원가입",
    description: "앱 또는 웹사이트에서 간편하게 회원가입을 진행하세요",
  },
  {
    icon: MapPin,
    title: "2. 대여소 찾기",
    description: "가까운 대여소를 찾아 이용 가능한 자전거를 확인하세요",
  },
  {
    icon: Unlock,
    title: "3. 자전거 대여",
    description: "QR 코드를 스캔하거나 자전거 번호를 입력해 잠금을 해제하세요",
  },
  {
    icon: BikeIcon,
    title: "4. 안전하게 이용",
    description: "목적지까지 안전하게 이동 후 가까운 대여소에 반납하세요",
  },
];

export function HowToUse() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">이용방법</h2>
          <p className="text-gray-600">
            따릉이는 누구나 쉽고 간편하게 이용할 수 있습니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#00A862] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
