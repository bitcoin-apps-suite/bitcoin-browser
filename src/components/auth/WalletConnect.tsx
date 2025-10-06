'use client';

import { useState, useEffect } from 'react';
import { Wallet, LogOut, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { bitcoinWallet } from '@/lib/wallet/bitcoin-wallet';
import { WalletConnection, TokenHolding, WalletError } from '@/lib/wallet/types';

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean, connection?: WalletConnection) => void;
  requiredDomain?: string;
  className?: string;
}

export default function WalletConnect({ 
  onConnectionChange, 
  requiredDomain,
  className = ''
}: WalletConnectProps) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if already connected on mount
    const existingConnection = bitcoinWallet.getConnection();
    if (existingConnection) {
      setConnection(existingConnection);
      loadTokenHoldings();
    }

    // Listen for wallet events
    const handleAccountChanged = (_account?: Record<string, unknown>) => {
      loadTokenHoldings();
    };

    const handleDisconnect = () => {
      setConnection(null);
      setTokenHoldings([]);
      onConnectionChange?.(false);
    };

    bitcoinWallet.on('accountChanged', handleAccountChanged);
    bitcoinWallet.on('disconnect', handleDisconnect);

    return () => {
      bitcoinWallet.off('accountChanged', handleAccountChanged);
      bitcoinWallet.off('disconnect', handleDisconnect);
    };
  }, [onConnectionChange]);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const walletConnection = await bitcoinWallet.connectWallet();
      setConnection(walletConnection);
      
      await loadTokenHoldings();
      onConnectionChange?.(true, walletConnection);
    } catch (err: unknown) {
      const walletError = err as WalletError;
      setError(walletError.message);
      console.error('Wallet connection error:', walletError);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await bitcoinWallet.disconnectWallet();
      setConnection(null);
      setTokenHoldings([]);
      onConnectionChange?.(false);
    } catch (err: unknown) {
      console.error('Disconnect error:', err);
    }
  };

  const loadTokenHoldings = async () => {
    try {
      const holdings = await bitcoinWallet.getTokenHoldings();
      setTokenHoldings(holdings);
    } catch (err: unknown) {
      console.error('Failed to load token holdings:', err);
    }
  };

  const formatTokenBalance = (balance: bigint) => {
    return (Number(balance) / 100000000).toLocaleString(); // Convert from satoshis
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const hasRequiredToken = requiredDomain 
    ? tokenHoldings.some(holding => holding.domain === requiredDomain && holding.balance > 0)
    : true;

  if (!connection) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Connect Your Bitcoin Wallet
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {requiredDomain 
                ? `Connect your wallet to access ${requiredDomain} governance features`
                : 'Connect your wallet to access token holder features'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connect Bitcoin Wallet</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500">
            Requires <a href="https://bitcoin-wallet.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">bitcoin-wallet</a> extension
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
              <p className="text-gray-400 text-sm">{formatAddress(connection.address)}</p>
            </div>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Disconnect wallet"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Token Holdings</h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {tokenHoldings.length === 0 ? (
            <div className="text-center py-4">
              <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No domain tokens found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokenHoldings.map((holding) => (
                <div
                  key={holding.domain}
                  className={`p-3 rounded-lg border ${
                    requiredDomain === holding.domain
                      ? 'bg-purple-900/30 border-purple-500/30'
                      : 'bg-gray-800 border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{holding.tokenSymbol}</p>
                      <p className="text-gray-400 text-xs">{holding.domain}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono text-sm">
                        {formatTokenBalance(holding.balance)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {holding.percentage.toFixed(2)}% voting power
                      </p>
                    </div>
                  </div>

                  {showDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-600 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Voting Power:</span>
                        <span className="text-gray-300">{formatTokenBalance(holding.votingPower)}</span>
                      </div>
                      {holding.delegatedPower && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Delegated:</span>
                          <span className="text-gray-300">{formatTokenBalance(holding.delegatedPower)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Last Activity:</span>
                        <span className="text-gray-300">{holding.lastActivity.toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {requiredDomain && !hasRequiredToken && (
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-200 text-sm">
                You need {requiredDomain} tokens to access governance features
              </span>
            </div>
          </div>
        )}

        {requiredDomain && hasRequiredToken && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-200 text-sm">
                Access granted to {requiredDomain} governance
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}