'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2, User, LogIn, MapPin, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import type { Address } from '@/types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  CUSTOMER: 'bg-blue-100 text-blue-800 border-blue-200',
  BUSINESS_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { line1: '', line2: '', city: '', country: '', postal_code: '' },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile) {
      profileForm.reset({ name: profile.name });
    }
  }, [user, authLoading, profile, router, profileForm]);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]);
      } else {
        setAddresses((data as Address[]) || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleUpdateName = async (data: ProfileFormData) => {
    if (!user) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update name');
      } else {
        toast.success('Name updated successfully');
        setEditingName(false);
        // Refresh profile by refetching
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (updatedProfile) {
          profileForm.reset({ name: updatedProfile.name });
        }
      }
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleAddAddress = async (data: AddressFormData) => {
    if (!user) return;
    setSavingAddress(true);
    try {
      const { error } = await supabase.from('addresses').insert({
        user_id: user.id,
        line1: data.line1,
        line2: data.line2 || '',
        city: data.city,
        country: data.country,
        postal_code: data.postal_code,
      });

      if (error) {
        toast.error('Failed to add address');
      } else {
        toast.success('Address added successfully');
        setShowAddressForm(false);
        addressForm.reset();
        await fetchAddresses();
      }
    } catch {
      toast.error('Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        toast.error('Failed to delete address');
      } else {
        toast.success('Address deleted');
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      }
    } catch {
      toast.error('Failed to delete address');
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<LogIn className="h-8 w-8" />}
          title="Sign in to view your profile"
          description="You need to be logged in to view and manage your profile."
          action={
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          }
        />
      </div>
    );
  }

  const avatarUrl = profile?.avatar || '';
  const initials = getInitials(profile?.name || user.email || 'U');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings and addresses
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile?.name || 'User avatar'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-semibold text-xl">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              {editingName ? (
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(handleUpdateName)}
                    className="flex items-end gap-3"
                  >
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" disabled={savingName}>
                      {savingName ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingName(false)}
                    >
                      Cancel
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{profile?.name || 'No name set'}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingName(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={ROLE_COLORS[profile?.role || 'CUSTOMER'] || ''}
                  variant="outline"
                >
                  {(profile?.role || 'CUSTOMER').replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(profile?.created_at || user.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Addresses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Saved Addresses
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddressForm(!showAddressForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {/* Add Address Form */}
          {showAddressForm && (
            <div className="mb-6 rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-4">New Address</h4>
              <Form {...addressForm}>
                <form
                  onSubmit={addressForm.handleSubmit(handleAddAddress)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={addressForm.control}
                      name="line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="line2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt, suite, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="submit" size="sm" disabled={savingAddress}>
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddressForm(false);
                        addressForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Address List */}
          {loadingAddresses ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-8 w-8" />}
              title="No saved addresses"
              description="Add an address to speed up checkout."
              className="py-8"
            />
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{address.line1}</p>
                    {address.line2 && (
                      <p className="text-sm text-muted-foreground">{address.line2}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.country} {address.postal_code}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
