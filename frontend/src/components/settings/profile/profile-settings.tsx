import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateDeveloper } from '@/hooks/api/use-developers';

const profileSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { me } = useAuth();
  const updateMutation = useUpdateDeveloper();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: me?.first_name || '',
      last_name: me?.last_name || '',
      email: me?.email || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (!me) return;
    updateMutation.mutate({
      id: me.id,
      data: {
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email,
      },
    });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60">
        <h3 className="text-sm font-medium text-foreground">Profile Information</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Update your personal information and email address.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name" className="text-xs text-foreground/90">
              First Name
            </Label>
            <Input
              id="first_name"
              type="text"
              {...form.register('first_name')}
              className="bg-card/40 border-border/60"
              placeholder="John"
            />
            {form.formState.errors.first_name && (
              <p className="text-xs text-[hsl(var(--destructive-muted))]">
                {form.formState.errors.first_name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name" className="text-xs text-foreground/90">
              Last Name
            </Label>
            <Input
              id="last_name"
              type="text"
              {...form.register('last_name')}
              className="bg-card/40 border-border/60"
              placeholder="Doe"
            />
            {form.formState.errors.last_name && (
              <p className="text-xs text-[hsl(var(--destructive-muted))]">
                {form.formState.errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-foreground/90">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            className="bg-card/40 border-border/60"
            placeholder="developer@example.com"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-[hsl(var(--destructive-muted))]">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full sm:w-auto min-w-[140px]"
            disabled={updateMutation.isPending || !form.formState.isDirty}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
