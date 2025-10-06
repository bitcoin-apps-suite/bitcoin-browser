export interface WalletConnection {
  address: string;
  publicKey: string;
  isConnected: boolean;
  walletType: 'bitcoin-wallet' | 'handcash' | 'other';
  networkType: 'mainnet' | 'testnet';
}

export interface TokenHolding {
  domain: string;
  tokenSymbol: string;
  tokenName: string;
  balance: bigint;
  votingPower: bigint;
  delegatedPower?: bigint;
  percentage: number;
  lastActivity: Date;
  contractAddress: string;
}

export interface WalletAuth {
  connectWallet(): Promise<WalletConnection>;
  disconnectWallet(): Promise<void>;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: Record<string, unknown>): Promise<string>;
  verifyTokenHolding(domain: string): Promise<TokenHolding | null>;
  getTokenHoldings(): Promise<TokenHolding[]>;
}

export interface GovernanceSignature {
  proposalId: string;
  vote: boolean;
  voter: string;
  votingPower: bigint;
  signature: string;
  timestamp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  wallet: WalletConnection | null;
  tokenHoldings: TokenHolding[];
  selectedDomain: string | null;
  loading: boolean;
  error: string | null;
}

export interface WalletError {
  code: string;
  message: string;
  details?: unknown;
}

export enum WalletErrorCode {
  NOT_INSTALLED = 'wallet_not_installed',
  CONNECTION_REFUSED = 'connection_refused',
  INSUFFICIENT_TOKENS = 'insufficient_tokens',
  SIGNATURE_FAILED = 'signature_failed',
  NETWORK_MISMATCH = 'network_mismatch',
  TRANSACTION_FAILED = 'transaction_failed',
  UNKNOWN_ERROR = 'unknown_error'
}