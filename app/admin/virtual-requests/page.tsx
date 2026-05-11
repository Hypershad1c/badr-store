'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Monitor,
  Filter,
  MessageSquare,
  StickyNote,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { VirtualRequest, RequestStatus, Product, Profile } from '@/types';

const requestStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function VirtualRequestsPage() {
  const [requests, setRequests] = useState<(VirtualRequest & { product?: Product; user?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VirtualRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('virtual_requests')
      .select('*, product:products(*), user:profiles!virtual_requests_user_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data as (VirtualRequest & { product?: Product; user?: Profile })[]);
    }
    setLoading(false);
  }

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  async function updateRequestStatus(requestId: string, status: RequestStatus) {
    const { error } = await supabase
      .from('virtual_requests')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    }
  }

  function openNotesDialog(request: VirtualRequest) {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setNotesDialogOpen(true);
  }

  async function saveNotes() {
    if (!selectedRequest) return;
    setSaving(true);
    const { error } = await supabase
      .from('virtual_requests')
      .update({ admin_notes: adminNotes })
      .eq('id', selectedRequest.id);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, admin_notes: adminNotes } : r
        )
      );
      setNotesDialogOpen(false);
      setSelectedRequest(null);
    }
    setSaving(false);
  }

  const statusFlow: RequestStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Virtual Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage virtual product requests from customers. {requests.length} requests total.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by status:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusFlow.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Clear filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Monitor className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter !== 'all'
                  ? `No requests with status "${statusFilter.replace('_', ' ')}".`
                  : 'No virtual requests yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs">
                      {request.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {request.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.user?.email || ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.product?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="truncate text-sm">{request.message || 'No message'}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(v) =>
                          updateRequestStatus(request.id, v as RequestStatus)
                        }
                      >
                        <SelectTrigger className="h-7 w-[140px] text-xs">
                          <SelectValue>
                            <Badge
                              variant="secondary"
                              className={requestStatusColors[request.status] || ''}
                            >
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusFlow.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openNotesDialog(request)}
                        title="Add admin notes"
                      >
                        <StickyNote className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Admin Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Admin Notes
            </DialogTitle>
            <DialogDescription>
              Add or update notes for request {selectedRequest?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer Message</p>
              <p className="mt-1 rounded-lg bg-muted p-3 text-sm">
                {selectedRequest?.message || 'No message'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Product</p>
              <p className="mt-1 text-sm">
                {selectedRequest?.product?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                className="mt-1.5 min-h-[100px]"
                placeholder="Add notes about this request..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNotes} disabled={saving}>
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
