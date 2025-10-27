
import React, { useState, useMemo } from 'react'; // Removed useEffect, useCallback as per refactor needs if they aren't directly used
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Target, CheckCircle, FileText, Activity, XCircle, Zap, Repeat, Ban, HelpCircle } from 'lucide-react';
import { PledgeSession, Pledge, PledgeExecutionRecord, PledgeAuditLog } from '@/api/entities';
import { toast } from 'sonner';
import PledgeSessionCard from './PledgeSessionCard';
import PledgeSessionFormModal from './PledgeSessionFormModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// A simple utility function for confirmation, assuming a browser-native confirm.
// If a custom modal is preferred, this would be replaced with state management
// for a confirmation dialog component.
// Retaining the original confirm function for simplicity, as no useConfirm hook implementation was provided.
const confirm = async ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return window.confirm(`${title}\n\n${message}`);
};

export default function PledgeSessionManager({ user, sessions, pledges, onRefresh, onSessionUpdate }) { // Changed onDataUpdate to onRefresh and onSessionUpdate, kept user
  const [isLoading, setIsLoading] = useState(false); // New state for overall loading if needed (not directly used in outline, but good practice)
  const [isCreating, setIsCreating] = useState(false); // New state as per outline
  const [showCreateModal, setShowCreateModal] = useState(false); // Replaced showFormModal
  const [editingSession, setEditingSession] = useState(null); // Replaced sessionToEdit

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for tracking session execution
  const [isExecuting, setIsExecuting] = useState(null); // Will hold the ID of the session being executed

  // Removed `enrichedSessions` and `refreshSessions` as per the outline's implied refactor.
  // `sessions` prop is now directly used as the source of truth.

  // Function to get status info (text, icon, color)
  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { text: 'Draft', icon: FileText, color: 'text-gray-500' };
      case 'active':
        return { text: 'Active', icon: Activity, color: 'text-green-600' };
      case 'closed':
        return { text: 'Closed', icon: XCircle, color: 'text-orange-600' };
      case 'executing':
        return { text: 'Executing', icon: Zap, color: 'text-indigo-600' };
      case 'awaiting_sell_execution':
        return { text: 'Awaiting Sell', icon: Repeat, color: 'text-blue-600' };
      case 'completed':
        return { text: 'Completed', icon: CheckCircle, color: 'text-green-700' };
      case 'cancelled':
        return { text: 'Cancelled', icon: Ban, color: 'text-red-600' };
      default:
        return { text: 'Unknown', icon: HelpCircle, color: 'text-gray-500' };
    }
  };

  // Function to get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'executing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'awaiting_sell_execution':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // New handleUpdateSession function as per outline
  const handleUpdateSession = async (sessionId, updates) => {
    try {
      await PledgeSession.update(sessionId, updates);
      toast.success('Session updated successfully');
      
      // ✅ Update locally instead of reloading
      if (onSessionUpdate) {
        onSessionUpdate(sessionId, updates);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    }
  };

  // Recalculate session stats from pledges
  const recalculateSessionStats = async (sessionId) => {
    try {
      const sessionPledges = (pledges || []).filter(p => 
        p.session_id === sessionId && 
        (p.status === 'ready_for_execution' || p.status === 'executed')
      );

      let updates = {};

      if (sessionPledges.length === 0) {
        // Reset stats to zero if no valid pledges
        updates = {
          total_pledges: 0,
          total_pledge_value: 0,
          buy_pledges_count: 0,
          sell_pledges_count: 0,
          buy_pledges_value: 0,
          sell_pledges_value: 0,
        };
        toast.info('No relevant pledges found for session. Stats reset.');
      } else {
        // Calculate totals
        let totalPledges = sessionPledges.length;
        let totalValue = 0;
        let buyCount = 0;
        let sellCount = 0;
        let buyValue = 0;
        let sellValue = 0;

        sessionPledges.forEach(pledge => {
          const pledgeValue = pledge.qty * (pledge.price_target || 0);
          totalValue += pledgeValue;

          if (pledge.side === 'buy') {
            buyCount++;
            buyValue += pledgeValue;
          } else if (pledge.side === 'sell') {
            sellCount++;
            sellValue += pledgeValue;
          }
        });

        // Update session with calculated stats
        updates = {
          total_pledges: totalPledges,
          total_pledge_value: totalValue,
          buy_pledges_count: buyCount,
          sell_pledges_count: sellCount,
          buy_pledges_value: buyValue,
          sell_pledges_value: sellValue,
        };
      }
      
      await handleUpdateSession(sessionId, updates); // Use the new update handler
      console.log(`✅ Recalculated stats for session ${sessionId}:`, updates);
      toast.success('Session statistics updated successfully');

    } catch (error) {
      console.error('Error recalculating session stats:', error);
      toast.error('Failed to update session statistics');
    }
  };

  // Memoized filtering and sorting logic
  const filteredSessions = useMemo(() => {
    let filtered = sessions || []; // Use `sessions` directly as per outline

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.stock_symbol?.toLowerCase().includes(term) ||
        s.stock_name?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }

    // Sort: executing first, then active, then by created date
    filtered.sort((a, b) => {
      // Priority order: executing > active > closed > completed > awaiting_sell_execution > draft > cancelled
      const statusOrder = { 
        'executing': 0,
        'active': 1, 
        'closed': 2,
        'awaiting_sell_execution': 3,
        'completed': 4, 
        'draft': 5,
        'cancelled': 6 
      };
      
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      
      if (orderA !== orderB) return orderA - orderB;
      
      // If same status, sort by creation date (newest first)
      return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
    });

    return filtered;
  }, [sessions, statusFilter, searchTerm]); // Added 'sessions' as dependency as per outline

  // Create Session Handler (adapted from outline)
  const handleCreateSession = async (sessionData) => {
    setIsCreating(true);
    try {
      await PledgeSession.create(sessionData);
      toast.success('Session created successfully');
      setShowCreateModal(false); // Close modal on success
      if (onRefresh) onRefresh(); // Only refresh when creating new session
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  // Edit Session Handler (adapted to new state names)
  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowCreateModal(true);
  };

  // Clone Session Handler
  const handleCloneSession = async (session) => {
    try {
      const clonedData = {
        ...session,
        stock_symbol: `${session.stock_symbol}_COPY`,
        stock_name: `${session.stock_name} (Copy)`,
        status: 'draft',
        total_pledges: 0,
        total_pledge_value: 0,
        buy_pledges_count: 0,
        sell_pledges_count: 0,
        buy_pledges_value: 0,
        sell_pledges_value: 0,
        created_by: user.id, // Retained user.id as 'user' prop is kept
      };

      // Remove fields that shouldn't be cloned
      delete clonedData.id;
      delete clonedData.created_date;
      delete clonedData.updated_date;
      delete clonedData.last_executed_at;

      await PledgeSession.create(clonedData);
      toast.success('Session cloned successfully');
      if (onRefresh) onRefresh(); // Use onRefresh for full data fetch
    } catch (error) {
      console.error('Error cloning session:', error);
      toast.error('Failed to clone session');
    }
  };

  // Delete Session Handler (adapted from outline)
  const handleDeleteSession = async (sessionId) => {
    const confirmed = await confirm({
      title: 'Delete Session?',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await PledgeSession.delete(sessionId);
      toast.success('Session deleted successfully');
      if (onRefresh) onRefresh(); // Only refresh when deleting
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  // Activate Session Handler
  const handleActivateSession = async (sessionId) => {
    try {
      await handleUpdateSession(sessionId, { status: 'active' }); // Use new update handler
      toast.success('Session activated successfully');
    } catch (error) {
      console.error('Error activating session:', error);
      toast.error('Failed to activate session');
    }
  };

  // Close Session Handler
  const handleCloseSession = async (sessionId) => {
    const confirmed = await confirm({
      title: 'Close Session?',
      message: 'Are you sure you want to close this session? No new pledges will be accepted.',
      confirmText: 'Yes, Close Session'
    });

    if (!confirmed) return;

    try {
      await handleUpdateSession(sessionId, { status: 'closed' }); // Use new update handler
      toast.success('Session closed successfully');
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
    }
  };

  // Execute Session Handler - Implemented manual execution logic
  const handleExecuteSession = async (session) => {
    if (!session) return;

    const confirmation = await confirm({
      title: `Execute ${session.status === 'awaiting_sell_execution' ? 'SELL' : 'BUY'} Orders?`,
      message: `This will trigger the ${session.status === 'awaiting_sell_execution' ? 'sell' : 'buy'} execution for the session "${session.stock_symbol}". This action cannot be undone.`,
      confirmText: `Yes, Execute ${session.status === 'awaiting_sell_execution' ? 'Sell' : 'Buy'}`,
    });

    if (!confirmation) return;

    setIsExecuting(session.id);
    const toastId = toast.loading(`Executing ${session.status === 'awaiting_sell_execution' ? 'sell' : 'buy'} orders for ${session.stock_symbol}...`);

    try {
      if (session.session_mode === 'buy_sell_cycle' && session.status === 'awaiting_sell_execution') {
        // ---- SELL EXECUTION LOGIC ----
        console.log(`🚀 Starting SELL execution for session: ${session.id}`);

        const pledgesToSell = await Pledge.filter({
          session_id: session.id,
          status: 'executed', // Pledges that have been bought
        });

        if (pledgesToSell.length === 0) {
          toast.warning('No pledges found that are ready to be sold in this session.', { id: toastId });
          // If no pledges, it means the cycle is done or there were no buys, so mark as completed
          await handleUpdateSession(session.id, { status: 'completed', last_executed_at: new Date().toISOString() }); // Use new update handler
          if (onRefresh) onRefresh(); // Full refresh after complex execution logic
          return;
        }

        const buyExecutions = await PledgeExecutionRecord.filter({
          session_id: session.id,
          side: 'buy',
          status: 'completed'
        });
        const buyExecutionsMap = new Map(buyExecutions.map(e => [e.pledge_id, e]));

        let sellSuccessCount = 0;
        let sellFailCount = 0;

        for (const pledge of pledgesToSell) {
          try {
            const buyExec = buyExecutionsMap.get(pledge.id);
            if (!buyExec) {
              console.warn(`No corresponding BUY execution record found for pledge ${pledge.id}. Skipping SELL.`);
              sellFailCount++;
              await PledgeAuditLog.create({
                actor_id: user.id, // Retained user.id
                actor_role: 'system',
                action: 'sell_execution_skipped',
                target_type: 'pledge',
                target_pledge_id: pledge.id,
                target_session_id: session.id,
                payload_json: JSON.stringify({ reason: 'No corresponding BUY execution record found' }),
                success: false
              });
              continue;
            }

            console.log(`⚡ Executing SELL for pledge ${pledge.id}...`);
            const executedPrice = session.stock_price || pledge.price_target || 0;
            const totalExecutionValue = pledge.qty * executedPrice;

            await PledgeExecutionRecord.create({
              pledge_id: pledge.id,
              session_id: session.id,
              user_id: pledge.user_id,
              demat_account_id: pledge.demat_account_id,
              stock_symbol: session.stock_symbol,
              side: 'sell',
              pledged_qty: pledge.qty,
              executed_qty: pledge.qty,
              executed_price: executedPrice,
              total_execution_value: totalExecutionValue,
              platform_commission: 0,
              commission_rate: 0,
              broker_commission: 0,
              net_amount: totalExecutionValue,
              status: 'completed',
              executed_at: new Date().toISOString(),
              settlement_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            
            await PledgeAuditLog.create({
              actor_id: user.id, // Retained user.id
              actor_role: 'admin',
              action: 'sell_execution_completed',
              target_type: 'pledge',
              target_pledge_id: pledge.id,
              target_session_id: session.id,
              payload_json: JSON.stringify({
                execution_record_id: 'newly_created_id', // In a real system, this ID would be returned by `create`
                executed_qty: pledge.qty,
                executed_price: executedPrice
              }),
              success: true
            });
            sellSuccessCount++;
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
          } catch (error) {
            console.error(`❌ Failed to execute SELL for pledge ${pledge.id}:`, error);
            sellFailCount++;
            await PledgeExecutionRecord.create({
              pledge_id: pledge.id,
              session_id: session.id,
              user_id: pledge.user_id,
              demat_account_id: pledge.demat_account_id,
              stock_symbol: session.stock_symbol,
              side: 'sell',
              pledged_qty: pledge.qty,
              executed_qty: 0,
              status: 'failed',
              error_message: error.message || 'Sell execution failed',
              executed_at: new Date().toISOString(),
            });
            await PledgeAuditLog.create({
              actor_id: user.id, // Retained user.id
              actor_role: 'admin',
              action: 'sell_execution_failed',
              target_type: 'pledge',
              target_pledge_id: pledge.id,
              target_session_id: session.id,
              payload_json: JSON.stringify({ error: error.message }),
              success: false
            });
          }
        }
        
        await handleUpdateSession(session.id, { // Use new update handler
          status: 'completed',
          last_executed_at: new Date().toISOString()
        });
        
        toast.success(
          `Executed ${sellSuccessCount} sell orders for ${session.stock_symbol}.` +
          (sellFailCount > 0 ? ` ${sellFailCount} failed.` : ''),
          { id: toastId, duration: 5000 }
        );

      } else {
        // ---- BUY EXECUTION LOGIC ----
        console.log('🚀 Starting BUY execution for session:', session.id);
        
        // Update session status to executing
        await handleUpdateSession(session.id, { // Use new update handler
          status: 'executing',
          last_executed_at: new Date().toISOString()
        });

        const pledgesToExecute = await Pledge.filter({
          session_id: session.id,
          status: 'ready_for_execution',
        });

        console.log(`📊 Found ${pledgesToExecute.length} pledges ready for BUY execution`);

        if (pledgesToExecute.length === 0) {
          toast.warning('No pledges ready for BUY execution in this session.', { id: toastId });
          const nextStatusIfNoPledges = session.session_mode === 'buy_sell_cycle' ? 'awaiting_sell_execution' : 'completed';
          await handleUpdateSession(session.id, { status: nextStatusIfNoPledges, last_executed_at: new Date().toISOString() }); // Use new update handler
          if (onRefresh) onRefresh(); // Full refresh after complex execution logic
          return;
        }

        let successCount = 0;
        let failCount = 0;

        // Execute each pledge
        for (const pledge of pledgesToExecute) {
          try {
            console.log(`⚡ Executing BUY for pledge ${pledge.id}...`);
            
            const executedPrice = pledge.price_target || session.stock_price || 0;
            const totalExecutionValue = pledge.qty * executedPrice;
            
            const executionRecord = await PledgeExecutionRecord.create({
              pledge_id: pledge.id,
              session_id: session.id,
              user_id: pledge.user_id,
              demat_account_id: pledge.demat_account_id,
              stock_symbol: pledge.stock_symbol,
              side: 'buy',
              pledged_qty: pledge.qty,
              executed_qty: pledge.qty,
              executed_price: executedPrice,
              total_execution_value: totalExecutionValue,
              platform_commission: 0,
              commission_rate: 0,
              broker_commission: 0,
              net_amount: totalExecutionValue,
              status: 'completed',
              executed_at: new Date().toISOString(),
              settlement_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });

            console.log(`✅ Created BUY execution record: ${executionRecord.id}`);

            await Pledge.update(pledge.id, {
              status: 'executed'
            });

            await PledgeAuditLog.create({
              actor_id: user.id, // Retained user.id
              actor_role: 'admin',
              action: 'buy_execution_completed',
              target_type: 'pledge',
              target_pledge_id: pledge.id,
              target_session_id: session.id,
              payload_json: JSON.stringify({
                execution_record_id: executionRecord.id,
                executed_qty: pledge.qty,
                executed_price: executedPrice
              }),
              success: true
            });

            successCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`❌ Failed to execute BUY for pledge ${pledge.id}:`, error);
            failCount++;
            
            await PledgeExecutionRecord.create({
              pledge_id: pledge.id,
              session_id: session.id,
              user_id: pledge.user_id,
              demat_account_id: pledge.demat_account_id,
              stock_symbol: pledge.stock_symbol,
              side: 'buy',
              pledged_qty: pledge.qty,
              executed_qty: 0,
              status: 'failed',
              error_message: error.message || 'Execution failed',
              executed_at: new Date().toISOString(),
            });

            await PledgeAuditLog.create({
              actor_id: user.id, // Retained user.id
              actor_role: 'admin',
              action: 'buy_execution_failed',
              target_type: 'pledge',
              target_pledge_id: pledge.id,
              target_session_id: session.id,
              payload_json: JSON.stringify({ error: error.message }),
              success: false
            });
          }
        }

        const nextStatus = session.session_mode === 'buy_sell_cycle' ? 'awaiting_sell_execution' : 'completed';
        console.log(`✅ Updating session ${session.id} to status: ${nextStatus}`);
        await handleUpdateSession(session.id, { // Use new update handler
          status: nextStatus,
          last_executed_at: new Date().toISOString(),
          notification_sent: true,
        });

        toast.success(
          `Executed ${successCount} buy orders for ${session.stock_symbol}.` +
          (failCount > 0 ? ` ${failCount} failed.` : ''),
          { id: toastId, duration: 5000 }
        );
      }

      console.log('🔄 Triggering data refresh after execution...');
      if (onRefresh) onRefresh(); // Full refresh after complex execution logic

    } catch (error) {
      console.error('❌ Error during session execution:', error);
      toast.error(`Failed to execute session: ${error.message}`, { id: toastId });
      
      // Attempt to revert session status if overall execution failed
      if (session.status === 'executing' || session.status === 'awaiting_sell_execution') {
        try {
          await handleUpdateSession(session.id, { // Use new update handler
            status: 'active'
          });
          if (onRefresh) onRefresh(); // Full refresh in case of complex rollback
        } catch (revertError) {
          console.error('Failed to revert session status after execution error:', revertError);
        }
      }
    } finally {
      setIsExecuting(null);
    }
  };

  // Add recalculate button to actions
  const handleRecalculateStats = async (sessionId) => {
    await recalculateSessionStats(sessionId);
  };

  // Form Success Handler (Simplified as per new data flow: Modal's onCreate/onUpdate now handle data updates)
  const handleFormSuccess = () => {
    setShowCreateModal(false);
    setEditingSession(null);
  };

  // Determine if user can create sessions (e.g., based on authentication or role)
  const canCreateSessions = !!user;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Pledge Sessions ({filteredSessions.length})
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search stock symbol, name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="executing">Executing</SelectItem>
                  <SelectItem value="awaiting_sell_execution">Awaiting Sell</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {statusFilter !== 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => setStatusFilter('completed')}
                  className="whitespace-nowrap"
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  View Completed
                </Button>
              )}
              
              {canCreateSessions && (
                <Button 
                  onClick={() => {
                    setEditingSession(null); // Clear any previous edit data
                    setShowCreateModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isCreating} // Disable button when creation is in progress
                >
                  {isCreating ? 'Creating...' : <> <Plus className="w-4 h-4 mr-2" /> New Session </>}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No pledge sessions found</p>
              {canCreateSessions && (
                <Button 
                  onClick={() => {
                    setEditingSession(null);
                    setShowCreateModal(true);
                  }} 
                  className="mt-4"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Your First Session'}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSessions.map((session) => (
                <PledgeSessionCard
                  key={session.id}
                  session={session}
                  pledges={pledges?.filter(p => p.session_id === session.id) || []}
                  onEdit={() => handleEditSession(session)}
                  onClone={() => handleCloneSession(session)}
                  onDelete={() => handleDeleteSession(session.id)}
                  onActivate={() => handleActivateSession(session.id)}
                  onClose={() => handleCloseSession(session.id)}
                  onExecute={() => handleExecuteSession(session)}
                  onRecalculateStats={() => handleRecalculateStats(session.id)}
                  isExecuting={isExecuting === session.id}
                  getStatusInfo={getStatusInfo}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <PledgeSessionFormModal
        open={showCreateModal} // Use new state name
        onClose={() => {
          setShowCreateModal(false); // Use new state name
          setEditingSession(null); // Use new state name
        }}
        onSuccess={handleFormSuccess} // This is the modal's internal success handler, now simplified
        sessionToEdit={editingSession} // Use new state name
        onCreate={handleCreateSession} // Pass the new handleCreateSession for creation
        onUpdate={handleUpdateSession} // Pass the new handleUpdateSession for updates
        isSaving={isCreating} // Pass isCreating for form state management in the modal
      />
    </div>
  );
}
