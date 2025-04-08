import { format, formatDistanceToNow } from "date-fns";
import { Activity } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Client, Project } from "@shared/schema";
import { Loader2, CloudUpload, User, FileSpreadsheet, CheckCircle2, FileText } from "lucide-react";
import { Link } from "wouter";

type ActivityFeedProps = {
  activities: Activity[];
  isLoading?: boolean;
};

export default function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : activities.length > 0 ? (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No activity recorded yet
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/activities">
              <a className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all activity
              </a>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  // Fetch related client if available
  const { data: client } = useQuery<Client | null>({
    queryKey: [activity.clientId ? `/api/clients/${activity.clientId}` : null],
    enabled: !!activity.clientId,
  });

  // Fetch related project if available
  const { data: project } = useQuery<Project | null>({
    queryKey: [activity.projectId ? `/api/projects/${activity.projectId}` : null],
    enabled: !!activity.projectId,
  });

  // Format date
  const formattedDate = activity.createdAt 
    ? formatTimeAgo(new Date(activity.createdAt))
    : "";

  // Get activity icon
  const getActivityIcon = () => {
    switch (activity.type) {
      case "file_uploaded":
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <CloudUpload className="text-green-600 h-4 w-4" />
          </div>
        );
      case "client_created":
      case "client_updated":
      case "client_deleted":
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="text-blue-600 h-4 w-4" />
          </div>
        );
      case "estimate_created":
      case "estimate_updated":
      case "estimate_deleted":
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <FileSpreadsheet className="text-purple-600 h-4 w-4" />
          </div>
        );
      case "task_completed":
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="text-green-600 h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <FileText className="text-yellow-600 h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <li className="flex items-start space-x-3">
      {getActivityIcon()}
      
      <div>
        <p className="text-sm text-gray-800">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
      </div>
    </li>
  );
}

// Helper function to format dates in a human-readable format
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today at ${format(date, "h:mm a")}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  } else if (diffDays < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  }
}
