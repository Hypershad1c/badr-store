'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Users as UsersIcon,
  Search,
  Shield,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { formatDate, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Profile, UserRole } from '@/types';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  BUSINESS_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CUSTOMER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as Profile[]);
    }
    setLoading(false);
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  async function changeRole(userId: string, role: UserRole) {
    setUpdatingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    }
    setUpdatingId(null);
  }

  async function toggleBan(userId: string, currentlyBanned: boolean) {
    setUpdatingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ banned: !currentlyBanned })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, banned: !currentlyBanned } : u
        )
      );
    }
    setUpdatingId(null);
  }

  const roles: UserRole[] = ['ADMIN', 'BUSINESS_MANAGER', 'CUSTOMER'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, roles, and access. {users.length} users total.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? 'No users match your search.' : 'No users yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => changeRole(user.id, v as UserRole)}
                        disabled={updatingId === user.id}
                      >
                        <SelectTrigger className="h-7 w-[160px] text-xs">
                          <SelectValue>
                            <Badge
                              variant="secondary"
                              className={roleColors[user.role] || ''}
                            >
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        >
                          Banned
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.banned ? 'outline' : 'ghost'}
                        size="sm"
                        className={
                          user.banned
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            : 'text-destructive hover:text-destructive'
                        }
                        onClick={() => toggleBan(user.id, user.banned)}
                        disabled={updatingId === user.id}
                      >
                        {user.banned ? (
                          <>
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Unban
                          </>
                        ) : (
                          <>
                            <ShieldBan className="mr-1 h-3.5 w-3.5" />
                            Ban
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
