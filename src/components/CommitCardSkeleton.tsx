import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const CommitCardSkeleton: React.FC = () => {
  return (
    <Card className="flex items-center space-x-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col flex-grow gap-2">
        <Skeleton className="h-4 w-[300px]" />
        <Skeleton className="h-4 w-[140px]" />
      </div>
      <div>
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </Card>
  );
};

export default CommitCardSkeleton;
