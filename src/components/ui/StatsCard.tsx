import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'border-primary/20 bg-primary/5',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    info: 'border-info/20 bg-info/5'
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    return null;
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={`p-2 rounded-lg ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon()}
            <span className={`text-xs ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Predefined stats cards for common metrics
export const PlacementStats = ({ 
  totalPlacements, 
  activeApplications, 
  completedInterviews, 
  offersReceived 
}: {
  totalPlacements: number;
  activeApplications: number;
  completedInterviews: number;
  offersReceived: number;
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Placements"
        value={totalPlacements}
        description="Applications tracked"
        icon={<Building2 className="h-4 w-4" />}
        variant="default"
      />
      <StatsCard
        title="Active Applications"
        value={activeApplications}
        description="In progress"
        icon={<Clock className="h-4 w-4" />}
        variant="info"
      />
      <StatsCard
        title="Interviews Completed"
        value={completedInterviews}
        description="Rounds finished"
        icon={<Users className="h-4 w-4" />}
        variant="warning"
      />
      <StatsCard
        title="Offers Received"
        value={offersReceived}
        description="Success stories"
        icon={<CheckCircle className="h-4 w-4" />}
        variant="success"
      />
    </div>
  );
};

export default StatsCard;
