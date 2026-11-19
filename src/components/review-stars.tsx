import { BlankStarIcon, StarIcon } from "./svgs";
import { ReviewProp } from "@/types";

const ReviewStars: React.FC<ReviewProp> = ({ num, color }) => {
  const filled = Math.max(0, Math.min(5, Math.round(num)));
  const className = `text-sm ${color ?? "text-black"}`;

  return (
    <div className="flex" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i}>{i < filled ? <StarIcon className={className} /> : <BlankStarIcon className={className} />}</div>
      ))}
    </div>
  );
};

export default ReviewStars;
