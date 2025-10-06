export interface ShareholderVote {
  address: string;
  shares: number;
  vote: 'approve' | 'reject';
  timestamp: number;
  signature: string;
}

export interface GovernanceProposal {
  id: string;
  domain: string;
  proposalType: 'content_update' | 'subdomain_config' | 'revenue_split' | 'ownership_transfer';
  data: Record<string, unknown>;
  proposer: string;
  createdAt: number;
  expiresAt: number;
  votes: ShareholderVote[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  executionTxId?: string;
}

export interface DomainContract {
  domain: string;
  totalShares: number;
  shareholders: Map<string, number>;
  minApprovalThreshold: number; // 51% by default
  activeProposals: GovernanceProposal[];
  contractAddress: string;
  nftContainerId: string;
}

export class DomainGovernanceContract {
  private domain: string;
  private contract: DomainContract;

  constructor(domain: string, contract: DomainContract) {
    this.domain = domain;
    this.contract = contract;
  }

  createProposal(
    proposalType: GovernanceProposal['proposalType'],
    data: Record<string, unknown>,
    proposer: string
  ): GovernanceProposal {
    const proposal: GovernanceProposal = {
      id: this.generateProposalId(),
      domain: this.domain,
      proposalType,
      data,
      proposer,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      votes: [],
      status: 'pending'
    };

    this.contract.activeProposals.push(proposal);
    return proposal;
  }

  vote(proposalId: string, voter: string, vote: 'approve' | 'reject', signature: string): boolean {
    const proposal = this.contract.activeProposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'pending' || proposal.expiresAt < Date.now()) {
      return false;
    }

    const shares = this.contract.shareholders.get(voter);
    if (!shares || shares === 0) {
      return false;
    }

    // Remove any existing vote from this voter
    proposal.votes = proposal.votes.filter(v => v.address !== voter);

    // Add new vote
    proposal.votes.push({
      address: voter,
      shares,
      vote,
      timestamp: Date.now(),
      signature
    });

    // Check if threshold is met
    this.updateProposalStatus(proposal);
    return true;
  }

  private updateProposalStatus(proposal: GovernanceProposal): void {
    const approvalShares = proposal.votes
      .filter(vote => vote.vote === 'approve')
      .reduce((sum, vote) => sum + vote.shares, 0);

    const approvalPercentage = (approvalShares / this.contract.totalShares) * 100;

    if (approvalPercentage >= this.contract.minApprovalThreshold) {
      proposal.status = 'approved';
      this.executeProposal(proposal);
    } else if (proposal.expiresAt < Date.now()) {
      proposal.status = 'expired';
    }
  }

  private executeProposal(proposal: GovernanceProposal): void {
    switch (proposal.proposalType) {
      case 'content_update':
        this.executeContentUpdate(proposal);
        break;
      case 'subdomain_config':
        this.executeSubdomainConfig(proposal);
        break;
      case 'revenue_split':
        this.executeRevenueSplit(proposal);
        break;
      case 'ownership_transfer':
        this.executeOwnershipTransfer(proposal);
        break;
    }
  }

  private executeContentUpdate(proposal: GovernanceProposal): void {
    // Execute content update on the blockchain
    console.log(`Executing content update for ${this.domain}:`, proposal.data);
    // This would interact with BSV to update the domain's content hash
  }

  private executeSubdomainConfig(proposal: GovernanceProposal): void {
    // Execute subdomain configuration changes
    console.log(`Executing subdomain config for ${this.domain}:`, proposal.data);
    // This would update DNS routing rules
  }

  private executeRevenueSplit(proposal: GovernanceProposal): void {
    // Execute revenue distribution changes
    console.log(`Executing revenue split for ${this.domain}:`, proposal.data);
    // This would update X402 payment distribution
  }

  private executeOwnershipTransfer(proposal: GovernanceProposal): void {
    // Execute ownership transfer
    console.log(`Executing ownership transfer for ${this.domain}:`, proposal.data);
    // This would transfer shares between addresses
  }

  private generateProposalId(): string {
    return `${this.domain}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getActiveProposals(): GovernanceProposal[] {
    return this.contract.activeProposals.filter(p => p.status === 'pending');
  }

  getShareholderVotingPower(address: string): number {
    const shares = this.contract.shareholders.get(address) || 0;
    return (shares / this.contract.totalShares) * 100;
  }
}