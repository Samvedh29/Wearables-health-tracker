import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { ProfileTab } from './settings/-profile-tab';
import { SecurityTab } from './settings/-security-tab';
import { ProvidersTab } from './settings/-providers-tab';
import { PrioritiesTab } from './settings/-priorities-tab';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});

interface TabConfig {
  id: string;
  label: string;
  component: React.ComponentType;
}

const tabs: TabConfig[] = [
  {
    id: 'profile',
    label: 'Profile',
    component: ProfileTab,
  },
  {
    id: 'security',
    label: 'Security',
    component: SecurityTab,
  },
  {
    id: 'providers',
    label: 'Providers & Strava Connect',
    component: ProvidersTab,
  },
  {
    id: 'priorities',
    label: 'Priorities',
    component: PrioritiesTab,
  },
];


function SettingsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your settings and preferences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border border-border/60 bg-card/40 backdrop-blur-xl">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="mt-6 focus-visible:outline-none"
          >
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
