'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe, Users, TrendingUp, Settings, Lock } from 'lucide-react';
import WalletConnect from '@/components/auth/WalletConnect';
import { WalletConnection } from '@/lib/wallet/types';

interface DomainInfo {
  domain: string;
  companyName: string;
  description: string;
  tokenSymbol: string;
  totalShares: number;
  currentHolders: number;
  template: DomainTemplate;
  isActive: boolean;
  createdAt: string;
}

interface DomainTemplate {
  id: string;
  name: string;
  description: string;
  components: TemplateComponent[];
  styles: Record<string, unknown>;
}

interface TemplateComponent {
  id: string;
  type: 'hero' | 'stats' | 'features' | 'governance' | 'footer';
  props: Record<string, unknown>;
  order: number;
}

interface SubdomainPageProps {
  params: Promise<{
    domain: string;
  }>;
}

export default function SubdomainPage({ params }: SubdomainPageProps) {
  const { domain } = use(params);
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTokenHolder, setIsTokenHolder] = useState(false);

  const loadDomainInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/domains/${domain}`);
      
      if (response.status === 404) {
        notFound();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to load domain information');
      }
      
      const data = await response.json();
      setDomainInfo(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    loadDomainInfo();
  }, [loadDomainInfo]);

  const handleWalletConnection = async (connected: boolean, connection?: WalletConnection) => {
    setIsTokenHolder(false);

    if (connected && connection && domainInfo) {
      try {
        const response = await fetch(`/api/domains/${domain}/verify-holder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: connection.address,
            publicKey: connection.publicKey
          })
        });

        if (response.ok) {
          const data = await response.json();
          setIsTokenHolder(data.isHolder);
        }
      } catch (err: unknown) {
        console.error('Failed to verify token holding:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-400">Loading domain information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Error Loading Domain</h1>
          <p className="text-gray-400 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!domainInfo) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  b.{domainInfo.domain}.com
                </h1>
                <p className="text-gray-400 text-sm">{domainInfo.companyName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isTokenHolder && (
                <a
                  href={`/b/${domain}/admin`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Governance</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to {domainInfo.companyName}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {domainInfo.description}
            </p>
            
            <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-500/30 px-4 py-2 rounded-full">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200 text-sm">
                Blockchain-Governed Domain
              </span>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {domainInfo.totalShares.toLocaleString()}
                </h3>
                <p className="text-gray-400">Total Shares</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {domainInfo.currentHolders}
                </h3>
                <p className="text-gray-400">Token Holders</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {domainInfo.tokenSymbol}
                </h3>
                <p className="text-gray-400">Token Symbol</p>
              </div>
            </div>
          </div>
        </section>

        {/* Governance Access */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Token Holder Access
              </h2>
              <p className="text-gray-400 text-lg">
                Connect your wallet to access governance features and participate in domain decisions
              </p>
            </div>

            <WalletConnect
              onConnectionChange={handleWalletConnection}
              requiredDomain={domain}
              className="max-w-md mx-auto"
            />

            {isTokenHolder && (
              <div className="mt-8 text-center">
                <a
                  href={`/b/${domain}/admin`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span>Access Governance Dashboard</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Domain Information */}
        <section className="py-16 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">About This Domain</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-purple-300 mb-4">Governance Model</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Token-weighted voting system</li>
                    <li>• Democratic content decisions</li>
                    <li>• Transparent revenue distribution</li>
                    <li>• BRC-100 protocol compliance</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-4">Technical Details</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Built on Bitcoin SV blockchain</li>
                    <li>• Smart contract governance</li>
                    <li>• X402 micropayment integration</li>
                    <li>• Enterprise-grade security</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Domain registered: {new Date(domainInfo.createdAt).toLocaleDateString()}</span>
                  <span>Status: {domainInfo.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Powered by{' '}
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              Bitcoin DNS
            </Link>{' '}
            - Decentralized Domain Governance
          </p>
        </div>
      </footer>
    </div>
  );
}