import { Check } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const plans = [
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
  },
];

export function Pricing() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">?´ìš©?”ê¸ˆ</h2>
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
                className={`w-full ${
                  plan.popular
                    ? "bg-[#00A862] hover:bg-[#008F54]"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                êµ¬ë§¤?˜ê¸°
              </Button>
            </Card>
          ))}
        </div>

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
    </section>
  );
}
