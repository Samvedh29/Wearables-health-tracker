import { Provider } from '@/lib/api/types';
import { API_CONFIG } from '@/lib/api/config';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUpdateProviderLiveSyncMode, useUpdateProviderSetting } from '@/hooks/api/use-oauth-providers';
import { useUsers } from '@/hooks/api/use-users';
import { Timer, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProviderItemProps {
  provider: Provider;
  localToggleState: boolean;
  onToggle: () => void;
}

export function ProviderItem({
  provider,
  localToggleState,
  onToggle,
}: ProviderItemProps) {
  const { data: users } = useUsers({ limit: 1 });
  const user = users?.items?.[0];
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientId, setClientId] = useState(provider.client_id || '');
  const [clientSecret, setClientSecret] = useState(provider.client_secret || '');

  const isEnabledInBackend = provider.is_enabled;
  const iconUrl = provider.icon_url
    ? new URL(provider.icon_url, API_CONFIG.baseUrl).toString()
    : null;

  const { mutate: updateLiveSyncMode, isPending: isModePending } =
    useUpdateProviderLiveSyncMode(provider.provider);

  const { mutate: updateSettings, isPending: isSettingsPending } =
    useUpdateProviderSetting(provider.provider);

  const currentMode = provider.live_sync_mode ?? 'pull';

  const handleSaveCredentials = () => {
    updateSettings({ client_id: clientId, client_secret: clientSecret });
  };

  return (
    <div className="px-6 py-4 hover:bg-muted/40 transition-colors flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0 p-2 rounded-lg overflow-hidden bg-white">
            {iconUrl && !imageError ? (
              <img
                src={iconUrl}
                alt={provider.name}
                className="h-12 w-12 object-contain"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div className="h-12 w-12 bg-white text-muted-foreground font-medium rounded-lg flex items-center justify-center">
                {provider.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-foreground">
                {provider.name}
              </h4>
              {isEnabledInBackend ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  Disabled
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-4">
              {provider.live_sync_configurable ? (
                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-card border border-border/60">
                  {(
                    [
                      { mode: 'pull', label: 'Periodic pull', Icon: Timer },
                      { mode: 'webhook', label: 'Webhook', Icon: Zap },
                    ] as const
                  ).map(({ mode, label, Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      disabled={isModePending}
                      onClick={() => updateLiveSyncMode(mode)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                        currentMode === mode && mode === 'webhook'
                          ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30'
                          : currentMode === mode && mode === 'pull'
                            ? 'bg-muted-foreground/40 text-foreground shadow-sm border border-zinc-600'
                            : 'text-muted-foreground hover:text-foreground/90 hover:bg-muted/60'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  {currentMode === 'webhook' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Zap className="h-3 w-3" />
                      Webhook only
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                      <Timer className="h-3 w-3" />
                      Periodic pull only
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? (
                  <>Hide Credentials <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Configure Credentials <ChevronDown className="h-3 w-3" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-4">
          <Switch
            checked={localToggleState}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${provider.name} provider`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-[76px] pr-4 pb-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${provider.provider}-client-id`} className="text-xs text-muted-foreground">Client ID</Label>
              <Input
                id={`${provider.provider}-client-id`}
                placeholder="e.g. 12345"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${provider.provider}-client-secret`} className="text-xs text-muted-foreground">Client Secret</Label>
              <Input
                id={`${provider.provider}-client-secret`}
                type="password"
                placeholder="e.g. deadbeef..."
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              size="sm" 
              onClick={handleSaveCredentials} 
              disabled={isSettingsPending || (clientId === (provider.client_id || '') && clientSecret === (provider.client_secret || ''))}
            >
              {isSettingsPending ? 'Saving...' : 'Save Credentials'}
            </Button>
            {user?.id && provider.client_id && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => {
                  window.location.href = `${API_CONFIG.baseUrl}/api/v1/oauth/${provider.provider}/authorize?user_id=${user.id}&redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard')}`;
                }}
              >
                Connect Account
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
