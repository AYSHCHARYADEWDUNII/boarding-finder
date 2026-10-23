import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RoomGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Loading rooms"
      aria-busy="true"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} className="overflow-hidden rounded-xl">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <CardHeader className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-6 w-1/2 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
