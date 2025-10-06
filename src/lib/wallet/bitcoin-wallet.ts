import { WalletConnection, TokenHolding, WalletAuth, GovernanceSignature, WalletError, WalletErrorCode } from './types';

declare global {
  interface Window {
    bitcoinWallet?: {
      connect(): Promise<Record<string, unknown>>;
      disconnect(): Promise<void>;
      signMessage(message: string): Promise<string>;
      signTransaction(transaction: Record<string, unknown>): Promise<string>;
      getAddress(): Promise<string>;
      getPublicKey(): Promise<string>;
      getNetwork(): Promise<'mainnet' | 'testnet'>;
      isConnected(): Promise<boolean>;
      on(event: string, callback: (data: Record<string, unknown>) => void): void;
      off(event: string, callback: (data: Record<string, unknown>) => void): void;
    };
  }
}

export class BitcoinWalletAuth implements WalletAuth {
  private connection: WalletConnection | null = null;
  private eventListeners: Map<string, ((data?: Record<string, unknown>) => void)[]> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    if (typeof window !== 'undefined' && window.bitcoinWallet) {
      window.bitcoinWallet.on('accountChanged', this.handleAccountChanged.bind(this));
      window.bitcoinWallet.on('disconnect', this.handleDisconnect.bind(this));
      window.bitcoinWallet.on('networkChanged', this.handleNetworkChanged.bind(this));
    }
  }

  private handleAccountChanged(account: Record<string, unknown>) {
    if (this.connection) {
      this.connection.address = account.address as string;
      this.connection.publicKey = account.publicKey as string;
    }
    this.emit('accountChanged', account);
  }

  private handleDisconnect() {
    this.connection = null;
    this.emit('disconnect');
  }

  private handleNetworkChanged(data: Record<string, unknown>) {
    const network = data as unknown as 'mainnet' | 'testnet';
    if (this.connection) {
      this.connection.networkType = network;
    }
    this.emit('networkChanged', { network });
  }

  private emit(event: string, data?: Record<string, unknown>) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  public on(event: string, callback: (data?: Record<string, unknown>) => void) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  public off(event: string, callback: (data?: Record<string, unknown>) => void) {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  async connectWallet(): Promise<WalletConnection> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }

      if (!window.bitcoinWallet) {
        throw this.createWalletError(
          WalletErrorCode.NOT_INSTALLED,
          'Bitcoin Wallet extension not found. Please install bitcoin-wallet to continue.'
        );
      }

      await window.bitcoinWallet.connect();
      const address = await window.bitcoinWallet.getAddress();
      const publicKey = await window.bitcoinWallet.getPublicKey();
      const network = await window.bitcoinWallet.getNetwork();

      this.connection = {
        address,
        publicKey,
        isConnected: true,
        walletType: 'bitcoin-wallet',
        networkType: network
      };

      return this.connection;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw this.createWalletError(
        WalletErrorCode.CONNECTION_REFUSED,
        `Failed to connect wallet: ${errorMessage}`,
        error
      );
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (window.bitcoinWallet) {
        await window.bitcoinWallet.disconnect();
      }
      this.connection = null;
    } catch (error: unknown) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection) {
      throw this.createWalletError(
        WalletErrorCode.CONNECTION_REFUSED,
        'Wallet not connected'
      );
    }

    try {
      return await window.bitcoinWallet!.signMessage(message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw this.createWalletError(
        WalletErrorCode.SIGNATURE_FAILED,
        `Failed to sign message: ${errorMessage}`,
        error
      );
    }
  }

  async signTransaction(transaction: Record<string, unknown>): Promise<string> {
    if (!this.connection) {
      throw this.createWalletError(
        WalletErrorCode.CONNECTION_REFUSED,
        'Wallet not connected'
      );
    }

    try {
      return await window.bitcoinWallet!.signTransaction(transaction);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw this.createWalletError(
        WalletErrorCode.TRANSACTION_FAILED,
        `Failed to sign transaction: ${errorMessage}`,
        error
      );
    }
  }

  async verifyTokenHolding(domain: string): Promise<TokenHolding | null> {
    if (!this.connection) {
      throw this.createWalletError(
        WalletErrorCode.CONNECTION_REFUSED,
        'Wallet not connected'
      );
    }

    try {
      // Query the domain's token contract for this address
      const response = await fetch(`/api/domains/${domain}/token-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: this.connection.address,
          publicKey: this.connection.publicKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.balance === '0') {
        return null; // No tokens held
      }

      return {
        domain,
        tokenSymbol: data.tokenSymbol,
        tokenName: data.tokenName,
        balance: BigInt(data.balance),
        votingPower: BigInt(data.votingPower),
        delegatedPower: data.delegatedPower ? BigInt(data.delegatedPower) : undefined,
        percentage: parseFloat(data.percentage),
        lastActivity: new Date(data.lastActivity),
        contractAddress: data.contractAddress
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw this.createWalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        `Failed to verify token holding: ${errorMessage}`,
        error
      );
    }
  }

  async getTokenHoldings(): Promise<TokenHolding[]> {
    if (!this.connection) {
      throw this.createWalletError(
        WalletErrorCode.CONNECTION_REFUSED,
        'Wallet not connected'
      );
    }

    try {
      const response = await fetch('/api/wallet/token-holdings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: this.connection.address,
          publicKey: this.connection.publicKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.holdings.map((holding: Record<string, unknown>) => ({
        domain: holding.domain as string,
        tokenSymbol: holding.tokenSymbol as string,
        tokenName: holding.tokenName as string,
        balance: BigInt(holding.balance as string),
        votingPower: BigInt(holding.votingPower as string),
        delegatedPower: holding.delegatedPower ? BigInt(holding.delegatedPower as string) : undefined,
        percentage: parseFloat(holding.percentage as string),
        lastActivity: new Date(holding.lastActivity as string),
        contractAddress: holding.contractAddress as string
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw this.createWalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        `Failed to get token holdings: ${errorMessage}`,
        error
      );
    }
  }

  async signGovernanceAction(
    proposalId: string,
    vote: boolean,
    votingPower: bigint
  ): Promise<GovernanceSignature> {
    if (!this.connection) {
      throw this.createWalletError(
        WalletErrorCode.CONNECTION_REFUSED,
        'Wallet not connected'
      );
    }

    const timestamp = Date.now();
    const message = JSON.stringify({
      proposalId,
      vote,
      voter: this.connection.address,
      votingPower: votingPower.toString(),
      timestamp
    });

    try {
      const signature = await this.signMessage(message);
      
      return {
        proposalId,
        vote,
        voter: this.connection.address,
        votingPower,
        signature,
        timestamp
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw this.createWalletError(
        WalletErrorCode.SIGNATURE_FAILED,
        `Failed to sign governance action: ${errorMessage}`,
        error
      );
    }
  }

  getConnection(): WalletConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  private createWalletError(code: WalletErrorCode, message: string, details?: unknown): WalletError {
    return {
      code,
      message,
      details
    } as WalletError;
  }
}

// Singleton instance
export const bitcoinWallet = new BitcoinWalletAuth();