import { createFileRoute, Link } from '@tanstack/react-router';
import { useUsers } from '@/hooks/api/use-users';
import { useUserConnections, useUserDataSummary } from '@/hooks/api/use-health';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Activity, Moon, Zap, ArrowRight, Settings } from 'lucide-react';
import { StatsCard } from '@/components/pages/dashboard/stats-card';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: PersonalDashboardPage,
});

function PersonalDashboardPage() {
  const { data: users, isLoading: isLoadingUser } = useUsers({ limit: 1 });
  const user = users?.items?.[0];

  const { data: connections, isLoading: isLoadingConnections } = useUserConnections(
    user?.id ?? '',
    !!user?.id
  );

  const { data: summary, isLoading: isLoadingSummary } = useUserDataSummary(
    user?.id ?? ''
  );

  if (isLoadingUser || isLoadingConnections || isLoadingSummary) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <PageHeader title="My Dashboard" description="Loading your health data..." />
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted/60 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <PageHeader title="My Dashboard" description="Welcome to Open Wearables" />
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-12 text-center backdrop-blur-xl">
          <p className="text-muted-foreground mb-4">No personal profile found. Please restart the app.</p>
        </div>
      </div>
    );
  }

  const isConnected = connections && connections.length > 0;

  return (
    <div className="relative min-h-full p-6 md:p-8">
      {/* Ambient background gradient */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-[hsl(var(--primary)/0.04)] blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.03)] blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <PageHeader
          title="My Dashboard"
          description="Your personal health and activity overview"
        />

        {!isConnected ? (
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to your Personal Dashboard</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't connected any wearable devices or apps yet. Connect your Strava account to start syncing your workouts and health data.
            </p>
            <Link to="/settings">
              <Button size="lg" className="gap-2">
                <Settings className="h-4 w-4" />
                Go to Settings to Connect
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Total Workouts"
                value={summary?.total_workouts ?? 0}
                description="Recorded activities"
                icon={Activity}
              />
              <StatsCard
                title="Sleep Sessions"
                value={summary?.total_sleep_events ?? 0}
                description="Recorded nights"
                icon={Moon}
              />
              <StatsCard
                title="Total Data Points"
                value={summary?.total_data_points ?? 0}
                description="Metrics tracked"
                icon={Zap}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold mb-4">Connections</h3>
                <div className="space-y-4">
                  {connections.map((conn) => (
                    <div key={conn.provider} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border/50">
                          <img 
                            src={`/providers/${conn.provider}.svg`} 
                            alt={conn.provider} 
                            className="h-5 w-5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMmEyIDEgMCAwIDEtMS41IDFoLTFhMiAxIDAgMCAxLTIgMiAyIDEgMCAwIDEtMi0yaC0xYTIgMSAwIDAgMS0yLTJ2LTFhMiAxIDAgMCAxIDItMmgxYTIgMSAwIDAgMSAyLTIgMiAxIDAgMCAxIDIgMmgxYTIgMSAwIDAgMSAyIDJ2MXoiLz48L3N2Zz4='
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{conn.provider}</p>
                          <p className="text-xs text-muted-foreground">Status: {conn.status}</p>
                        </div>
                      </div>
                      <Link to="/syncs">
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
                {summary && Object.keys(summary.workout_type_counts || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(summary.workout_type_counts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific workout types recorded yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
