'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Vote, 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Settings, 
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import WalletConnect from '@/components/auth/WalletConnect';
import { bitcoinWallet } from '@/lib/wallet/bitcoin-wallet';
import { WalletConnection, TokenHolding } from '@/lib/wallet/types';

interface AdminPageProps {
  params: Promise<{
    domain: string;
  }>;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposalType: string;
  proposer: string;
  createdAt: string;
  votingEndsAt: string;
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed';
  votesFor: string;
  votesAgainst: string;
  totalVotingPower: string;
  userVote?: 'for' | 'against' | null;
  canVote: boolean;
}

interface DomainStats {
  totalShares: number;
  totalHolders: number;
  activeProposals: number;
  totalRevenue: string;
  userBalance: string;
  userVotingPower: string;
  userPercentage: number;
}

export default function AdminPage({ params }: AdminPageProps) {
  const { domain } = use(params);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [tokenHolding, setTokenHolding] = useState<TokenHolding | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'proposals' | 'revenue' | 'settings'>('dashboard');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [domainStats, setDomainStats] = useState<DomainStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, [domain]);

  const checkAuthentication = async () => {
    const connection = bitcoinWallet.getConnection();
    if (!connection) {
      setLoading(false);
      return;
    }

    try {
      const holding = await bitcoinWallet.verifyTokenHolding(domain);
      if (holding && holding.balance > 0) {
        setWalletConnection(connection);
        setTokenHolding(holding);
        setIsAuthenticated(true);
        await loadDashboardData();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnection = async (connected: boolean, connection?: WalletConnection) => {
    if (connected && connection) {
      try {
        const holding = await bitcoinWallet.verifyTokenHolding(domain);
        if (holding && holding.balance > 0) {
          setWalletConnection(connection);
          setTokenHolding(holding);
          setIsAuthenticated(true);
          await loadDashboardData();
        } else {
          setError('You do not hold any tokens for this domain');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      }
    } else {
      setIsAuthenticated(false);
      setWalletConnection(null);
      setTokenHolding(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load proposals
      const proposalsResponse = await fetch(`/api/domains/${domain}/proposals`);
      if (proposalsResponse.ok) {
        const proposalsData = await proposalsResponse.json();
        setProposals(proposalsData.proposals);
      }

      // Load domain stats
      const statsResponse = await fetch(`/api/domains/${domain}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDomainStats(statsData);
      }
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleVote = async (proposalId: string, vote: boolean) => {
    if (!tokenHolding || !walletConnection) return;

    try {
      const signature = await bitcoinWallet.signGovernanceAction(
        proposalId,
        vote,
        tokenHolding.votingPower
      );

      const response = await fetch(`/api/domains/${domain}/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signature)
      });

      if (response.ok) {
        await loadDashboardData(); // Refresh data
      } else {
        throw new Error('Failed to submit vote');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  const formatBalance = (balance: string | bigint) => {
    const num = typeof balance === 'string' ? BigInt(balance) : balance;
    return (Number(num) / 100000000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-400">Loading governance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-8">
            <button
              onClick={() => router.push(`/b/${domain}`)}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {domain}</span>
            </button>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Governance Dashboard
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Token holder authentication required to access governance features
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <WalletConnect
            onConnectionChange={handleWalletConnection}
            requiredDomain={domain}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/b/${domain}`)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {domain} Governance
                </h1>
                <p className="text-gray-400 text-sm">
                  {tokenHolding && `${formatBalance(tokenHolding.balance)} ${tokenHolding.tokenSymbol} • ${tokenHolding.percentage.toFixed(2)}% voting power`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{walletConnection?.address.slice(0, 6)}...{walletConnection?.address.slice(-4)}</p>
                <p className="text-gray-400 text-xs">Connected</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'proposals', label: 'Proposals', icon: Vote },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'dashboard' | 'proposals' | 'revenue' | 'settings')}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-purple-600 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && domainStats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-medium text-gray-300">Total Holders</h3>
                </div>
                <p className="text-2xl font-bold text-white">{domainStats.totalHolders}</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-300">Total Shares</h3>
                </div>
                <p className="text-2xl font-bold text-white">{domainStats.totalShares.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Vote className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-medium text-gray-300">Active Proposals</h3>
                </div>
                <p className="text-2xl font-bold text-white">{domainStats.activeProposals}</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-medium text-gray-300">Total Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-white">{formatBalance(domainStats.totalRevenue)} BSV</p>
              </div>
            </div>

            {/* Your Holdings */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Holdings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Token Balance</p>
                  <p className="text-xl font-bold text-white">{formatBalance(domainStats.userBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Voting Power</p>
                  <p className="text-xl font-bold text-white">{formatBalance(domainStats.userVotingPower)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Ownership</p>
                  <p className="text-xl font-bold text-white">{domainStats.userPercentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Governance Proposals</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Create Proposal</span>
              </button>
            </div>

            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{proposal.title}</h3>
                      <p className="text-gray-400 mb-3">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                        <span>•</span>
                        <span>Created {new Date(proposal.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Ends {new Date(proposal.votingEndsAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        proposal.status === 'active' ? 'bg-green-900/30 text-green-300' :
                        proposal.status === 'succeeded' ? 'bg-blue-900/30 text-blue-300' :
                        proposal.status === 'defeated' ? 'bg-red-900/30 text-red-300' :
                        'bg-gray-900/30 text-gray-300'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">For</span>
                        <span className="text-sm text-green-400">{formatBalance(proposal.votesFor)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ 
                            width: `${(Number(proposal.votesFor) / Number(proposal.totalVotingPower)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Against</span>
                        <span className="text-sm text-red-400">{formatBalance(proposal.votesAgainst)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ 
                            width: `${(Number(proposal.votesAgainst) / Number(proposal.totalVotingPower)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {proposal.canVote && proposal.status === 'active' && !proposal.userVote && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleVote(proposal.id, true)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Vote For</span>
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, false)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Vote Against</span>
                      </button>
                    </div>
                  )}

                  {proposal.userVote && (
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-200 text-sm">
                        You voted <strong>{proposal.userVote === 'for' ? 'For' : 'Against'}</strong> this proposal
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {proposals.length === 0 && (
                <div className="text-center py-12">
                  <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No proposals yet</h3>
                  <p className="text-gray-500">Create the first governance proposal for this domain</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Revenue Dashboard</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400">Revenue tracking and distribution features coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Domain Settings</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400">Domain configuration settings coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}