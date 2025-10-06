# Smart Contracts Specification

## 🤝 Contract Architecture

Bitcoin DNS uses a modular smart contract architecture built on Bitcoin SV blockchain, implementing BRC-100 protocol standards for tokenization and governance.

## 📋 Contract Specifications

### 1. Domain Registry Contract

The master registry tracking all registered domains and their governance contracts.

```typescript
interface DomainRegistry {
  // Domain registration
  registerDomain(
    name: string,
    owner: string,
    initialSupply: bigint,
    governanceConfig: GovernanceConfig
  ): Promise<{
    contractAddress: string;
    tokenId: string;
    transactionId: string;
  }>;

  // Domain lookup
  getDomain(name: string): Promise<DomainInfo | null>;
  
  // Owner verification
  isOwner(domain: string, address: string): Promise<boolean>;
  
  // Transfer ownership
  transferDomain(
    domain: string,
    from: string,
    to: string,
    signature: string
  ): Promise<string>;
}

interface DomainInfo {
  name: string;
  contractAddress: string;
  tokenSymbol: string;
  totalSupply: bigint;
  owner: string;
  createdAt: number;
  lastUpdated: number;
  status: 'active' | 'suspended' | 'transferred';
}

interface GovernanceConfig {
  quorumThreshold: number;    // Percentage required for quorum (e.g., 51)
  votingPeriod: number;       // Voting period in blocks
  executionDelay: number;     // Delay before execution in blocks
  proposalBond: bigint;       // Tokens required to create proposal
  minVotingPower: bigint;     // Minimum tokens to vote
}
```

### 2. Domain Governance Contract

Individual governance contract deployed for each registered domain.

```typescript
interface DomainGovernanceContract {
  // Proposal management
  createProposal(
    proposalType: ProposalType,
    title: string,
    description: string,
    data: ProposalData,
    proposer: string
  ): Promise<string>; // Returns proposal ID

  vote(
    proposalId: string,
    support: boolean,
    voter: string,
    signature: string
  ): Promise<string>; // Returns transaction ID

  executeProposal(
    proposalId: string,
    executor: string
  ): Promise<string>; // Returns execution transaction ID

  // Token management
  mintTokens(
    to: string,
    amount: bigint,
    reason: string
  ): Promise<string>;

  burnTokens(
    from: string,
    amount: bigint,
    signature: string
  ): Promise<string>;

  // Revenue distribution
  distributeRevenue(
    totalAmount: bigint,
    sourceTransaction: string
  ): Promise<string[]>; // Returns distribution transaction IDs

  // Getters
  getProposal(proposalId: string): Promise<Proposal>;
  getTokenBalance(address: string): Promise<bigint>;
  getVotingPower(address: string): Promise<bigint>;
  getGovernanceStats(): Promise<GovernanceStats>;
}

enum ProposalType {
  CONTENT_UPDATE = 'content_update',
  TEMPLATE_CHANGE = 'template_change',
  GOVERNANCE_CONFIG = 'governance_config',
  REVENUE_DISTRIBUTION = 'revenue_distribution',
  TOKEN_ISSUANCE = 'token_issuance',
  SUBDOMAIN_CONFIG = 'subdomain_config',
  ACCESS_CONTROL = 'access_control'
}

interface Proposal {
  id: string;
  proposalType: ProposalType;
  title: string;
  description: string;
  data: ProposalData;
  proposer: string;
  createdAt: number;
  votingEndsAt: number;
  executionTime: number;
  status: ProposalStatus;
  votesFor: bigint;
  votesAgainst: bigint;
  totalVotingPower: bigint;
  executed: boolean;
  executionTx?: string;
}

enum ProposalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUCCEEDED = 'succeeded',
  DEFEATED = 'defeated',
  QUEUED = 'queued',
  EXECUTED = 'executed',
  EXPIRED = 'expired'
}

interface ProposalData {
  // Content updates
  contentHash?: string;
  ipfsHash?: string;
  
  // Template changes
  templateId?: string;
  templateConfig?: Record<string, any>;
  
  // Governance configuration
  newQuorum?: number;
  newVotingPeriod?: number;
  
  // Revenue distribution
  distributionRules?: DistributionRule[];
  
  // Token operations
  tokenRecipient?: string;
  tokenAmount?: bigint;
  
  // Access control
  accessList?: AccessRule[];
}

interface DistributionRule {
  address: string;
  percentage: number;
  reason: string;
}

interface AccessRule {
  address: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}
```

### 3. BRC-100 Token Contract

Compliant with BRC-100 standard for domain-specific tokens.

```typescript
interface BRC100DomainToken {
  // Standard BRC-100 functions
  symbol(): Promise<string>;          // e.g., "bDNS-COKE"
  name(): Promise<string>;            // e.g., "Bitcoin DNS Coca Cola"
  decimals(): Promise<number>;        // Standard: 8
  totalSupply(): Promise<bigint>;
  
  balanceOf(address: string): Promise<bigint>;
  transfer(to: string, amount: bigint, from: string): Promise<string>;
  
  // Governance extensions (BRC-101)
  delegate(delegator: string, delegatee: string): Promise<string>;
  undelegate(delegator: string): Promise<string>;
  
  votingPowerOf(address: string): Promise<bigint>;
  delegatedVotingPower(address: string): Promise<bigint>;
  
  // Domain-specific functions
  lockTokensForVoting(
    holder: string,
    amount: bigint,
    proposalId: string
  ): Promise<string>;
  
  unlockTokensAfterVoting(
    holder: string,
    proposalId: string
  ): Promise<string>;
  
  // Revenue sharing
  claimRevenue(holder: string): Promise<string>;
  getUnclaimedRevenue(holder: string): Promise<bigint>;
  
  // Snapshots for governance
  createSnapshot(): Promise<string>;
  getSnapshotBalance(
    address: string,
    snapshotId: string
  ): Promise<bigint>;
}

interface TokenMetadata {
  domain: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  externalUrl: string;
  attributes: TokenAttribute[];
}

interface TokenAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'number' | 'date' | 'boost_number' | 'boost_percentage';
}
```

### 4. Revenue Distribution Contract

Handles X402 micropayments and automated revenue distribution.

```typescript
interface RevenueDistributionContract {
  // Revenue collection
  recordRevenue(
    domain: string,
    amount: bigint,
    source: RevenueSource,
    sourceTransaction: string
  ): Promise<string>;

  // Distribution configuration
  setDistributionRules(
    domain: string,
    rules: DistributionRule[],
    authorizer: string
  ): Promise<string>;

  // Execute distributions
  distributeRevenue(
    domain: string,
    distributionId: string
  ): Promise<string[]>;

  // Automatic distribution (called by oracle)
  autoDistribute(domain: string): Promise<string[]>;

  // Claim mechanism
  claimRevenue(
    domain: string,
    beneficiary: string
  ): Promise<string>;

  // Analytics
  getRevenueStats(domain: string): Promise<RevenueStats>;
  getDistributionHistory(
    domain: string,
    limit?: number
  ): Promise<Distribution[]>;
}

enum RevenueSource {
  SUBDOMAIN_VISITS = 'subdomain_visits',    // X402 micropayments
  TRANSACTION_FEES = 'transaction_fees',    // Governance fees
  TEMPLATE_SALES = 'template_sales',        // Template marketplace
  API_USAGE = 'api_usage',                  // API access fees
  PREMIUM_FEATURES = 'premium_features',    // Enhanced features
  EXTERNAL_INTEGRATION = 'external_integration' // Third-party revenue
}

interface Distribution {
  id: string;
  domain: string;
  totalAmount: bigint;
  distributedAmount: bigint;
  recipients: DistributionRecipient[];
  createdAt: number;
  executedAt?: number;
  status: 'pending' | 'executed' | 'failed';
  transactionIds: string[];
}

interface DistributionRecipient {
  address: string;
  amount: bigint;
  percentage: number;
  claimed: boolean;
  claimTransaction?: string;
}

interface RevenueStats {
  totalRevenue: bigint;
  distributedRevenue: bigint;
  unclaimedRevenue: bigint;
  revenueBySource: Record<RevenueSource, bigint>;
  averageRevenuePerDay: bigint;
  topHolders: { address: string; percentage: number }[];
}
```

## 🔧 Implementation Details

### Contract Deployment Flow

```typescript
// Domain registration deployment sequence
async function deployDomainContracts(registrationData: DomainRegistration) {
  // 1. Deploy governance contract
  const governanceContract = await deployGovernanceContract({
    domain: registrationData.domain,
    config: registrationData.governanceConfig
  });

  // 2. Deploy BRC-100 token contract
  const tokenContract = await deployTokenContract({
    symbol: `bDNS-${registrationData.domain.toUpperCase()}`,
    name: `Bitcoin DNS ${registrationData.companyName}`,
    totalSupply: registrationData.initialShares,
    governanceContract: governanceContract.address
  });

  // 3. Deploy revenue distribution contract
  const revenueContract = await deployRevenueContract({
    domain: registrationData.domain,
    tokenContract: tokenContract.address,
    governanceContract: governanceContract.address
  });

  // 4. Link contracts together
  await governanceContract.setTokenContract(tokenContract.address);
  await governanceContract.setRevenueContract(revenueContract.address);
  await tokenContract.setGovernanceContract(governanceContract.address);

  // 5. Mint initial tokens to registrant
  await tokenContract.mint(
    registrationData.owner,
    registrationData.initialShares
  );

  // 6. Register in domain registry
  await domainRegistry.registerDomain(
    registrationData.domain,
    governanceContract.address,
    tokenContract.address,
    revenueContract.address
  );

  return {
    governance: governanceContract.address,
    token: tokenContract.address,
    revenue: revenueContract.address
  };
}
```

### Security Mechanisms

#### Multi-Signature Requirements
```typescript
interface MultiSigConfig {
  threshold: number;          // Required signatures
  signers: string[];         // Authorized signers
  timelock: number;          // Delay before execution
}

// Critical operations requiring multi-sig
const MULTI_SIG_OPERATIONS = [
  'GOVERNANCE_CONFIG_CHANGE',
  'LARGE_TOKEN_ISSUANCE',
  'REVENUE_RULE_CHANGE',
  'CONTRACT_UPGRADE',
  'EMERGENCY_PAUSE'
];
```

#### Access Control
```typescript
enum Role {
  OWNER = 'owner',                    // Full control
  ADMIN = 'admin',                    // Administrative functions
  PROPOSER = 'proposer',              // Can create proposals
  VOTER = 'voter',                    // Can vote on proposals
  REVENUE_CLAIMER = 'revenue_claimer' // Can claim revenue
}

interface AccessControl {
  hasRole(address: string, role: Role): Promise<boolean>;
  grantRole(address: string, role: Role, granter: string): Promise<string>;
  revokeRole(address: string, role: Role, revoker: string): Promise<string>;
  getRoleMembers(role: Role): Promise<string[]>;
}
```

### Gas Optimization

#### Batch Operations
```typescript
// Batch multiple operations to reduce transaction costs
interface BatchOperation {
  votes: VoteOperation[];
  distributions: DistributionOperation[];
  tokenTransfers: TransferOperation[];
}

// Optimize for BSV's low fees but high throughput
const BATCH_SIZE = 100;  // Operations per batch
const MAX_GAS_PRICE = 1; // Satoshis per byte
```

#### State Minimization
```typescript
// Use efficient data structures
interface CompactProposal {
  id: string;           // 32 bytes
  type: number;         // 1 byte (enum)
  votes: bigint;        // 8 bytes
  endTime: number;      // 4 bytes
  status: number;       // 1 byte
  dataHash: string;     // 32 bytes (IPFS hash)
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('DomainGovernanceContract', () => {
  test('should create valid proposal', async () => {
    const proposalId = await governance.createProposal(
      ProposalType.CONTENT_UPDATE,
      'Update homepage',
      'New homepage design',
      { contentHash: 'QmNewHash...' },
      ownerAddress
    );
    
    const proposal = await governance.getProposal(proposalId);
    expect(proposal.status).toBe(ProposalStatus.PENDING);
  });

  test('should distribute revenue correctly', async () => {
    await revenue.recordRevenue(
      'coca-cola',
      BigInt(1000000), // 0.01 BSV
      RevenueSource.SUBDOMAIN_VISITS,
      'tx123'
    );
    
    const distributions = await revenue.distributeRevenue('coca-cola', 'dist1');
    expect(distributions.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
describe('Full Domain Registration Flow', () => {
  test('should complete end-to-end registration', async () => {
    // 1. Register domain
    const result = await registerDomain({
      domain: 'test-company',
      owner: testAddress,
      initialShares: BigInt(1000000)
    });

    // 2. Verify contracts deployed
    expect(result.governance).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.revenue).toBeDefined();

    // 3. Test governance functionality
    const proposalId = await createTestProposal(result.governance);
    await voteOnProposal(proposalId, true);
    
    // 4. Test revenue distribution
    await recordTestRevenue(result.revenue);
    await distributeRevenue(result.revenue);
  });
});
```

---

*These contracts form the foundation of Bitcoin DNS's decentralized governance system, enabling secure, transparent, and automated domain management on the Bitcoin SV blockchain.*