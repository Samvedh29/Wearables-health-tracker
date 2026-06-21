import { ProfileSettings } from '@/components/settings/profile/profile-settings';

export function ProfileTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      <ProfileSettings />
    </div>
  );
}
