import { NextRequest, NextResponse } from 'next/server';

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

// Mock proposal data - in production this would query the blockchain
const mockProposals: Record<string, Proposal[]> = {
  'coca-cola': [
    {
      id: 'prop-001',
      title: 'Update Homepage Content',
      description: 'Proposal to update the homepage content to reflect our new sustainability initiatives and carbon-neutral goals.',
      proposalType: 'content_update',
      proposer: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      createdAt: '2024-12-01T10:00:00Z',
      votingEndsAt: '2024-12-08T10:00:00Z',
      status: 'active',
      votesFor: '750000000000', // 7500 tokens
      votesAgainst: '150000000000', // 1500 tokens
      totalVotingPower: '10000000000000', // 100,000 tokens
      canVote: true
    },
    {
      id: 'prop-002',
      title: 'Quarterly Revenue Distribution',
      description: 'Approve the distribution of Q4 2024 revenue to token holders based on their shareholding percentage.',
      proposalType: 'revenue_distribution',
      proposer: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      createdAt: '2024-11-28T15:30:00Z',
      votingEndsAt: '2024-12-05T15:30:00Z',
      status: 'succeeded',
      votesFor: '5200000000000', // 52,000 tokens
      votesAgainst: '800000000000', // 8,000 tokens
      totalVotingPower: '10000000000000',
      canVote: false
    },
    {
      id: 'prop-003',
      title: 'New Template Design',
      description: 'Switch to a new modern template design that better represents our brand values and improves user experience.',
      proposalType: 'template_change',
      proposer: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      createdAt: '2024-11-25T09:15:00Z',
      votingEndsAt: '2024-12-02T09:15:00Z',
      status: 'defeated',
      votesFor: '2100000000000', // 21,000 tokens
      votesAgainst: '4300000000000', // 43,000 tokens
      totalVotingPower: '10000000000000',
      canVote: false
    }
  ],
  'microsoft': [
    {
      id: 'prop-ms-001',
      title: 'Azure Integration Announcement',
      description: 'Proposal to add Azure cloud services integration announcement to the subdomain homepage.',
      proposalType: 'content_update',
      proposer: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      createdAt: '2024-12-01T14:00:00Z',
      votingEndsAt: '2024-12-08T14:00:00Z',
      status: 'active',
      votesFor: '1200000000000',
      votesAgainst: '300000000000',
      totalVotingPower: '20000000000000',
      canVote: true
    }
  ],
  'nike': [
    {
      id: 'prop-nike-001',
      title: 'Just Do It Campaign Update',
      description: 'Update the subdomain to feature our latest Just Do It campaign and athlete partnerships.',
      proposalType: 'content_update',
      proposer: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      createdAt: '2024-11-30T11:00:00Z',
      votingEndsAt: '2024-12-07T11:00:00Z',
      status: 'active',
      votesFor: '950000000000',
      votesAgainst: '200000000000',
      totalVotingPower: '15000000000000',
      canVote: true
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    
    // In production, this would query the blockchain smart contracts
    const proposals = mockProposals[domain] || [];
    
    return NextResponse.json({
      proposals,
      total: proposals.length,
      active: proposals.filter(p => p.status === 'active').length
    });

  } catch (error: unknown) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    const proposalData = await request.json();
    
    // In production, this would:
    // 1. Verify the proposer has sufficient tokens
    // 2. Create a transaction on the blockchain
    // 3. Deploy the proposal to the smart contract
    
    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      title: proposalData.title,
      description: proposalData.description,
      proposalType: proposalData.proposalType,
      proposer: proposalData.proposer,
      createdAt: new Date().toISOString(),
      votingEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'active',
      votesFor: '0',
      votesAgainst: '0',
      totalVotingPower: '10000000000000', // Mock total
      canVote: true
    };

    // Add to mock data
    if (!mockProposals[domain]) {
      mockProposals[domain] = [];
    }
    mockProposals[domain].unshift(newProposal);

    return NextResponse.json({
      success: true,
      proposal: newProposal,
      message: 'Proposal created successfully'
    });

  } catch (error: unknown) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}