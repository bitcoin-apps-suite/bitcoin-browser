import { NextRequest, NextResponse } from 'next/server';

interface DomainStats {
  totalShares: number;
  totalHolders: number;
  activeProposals: number;
  totalRevenue: string;
  userBalance: string;
  userVotingPower: string;
  userPercentage: number;
}

// Mock stats data - in production this would aggregate from blockchain and database
const mockStats: Record<string, DomainStats> = {
  'coca-cola': {
    totalShares: 1000000,
    totalHolders: 156,
    activeProposals: 1,
    totalRevenue: '250000000', // 2.5 BSV in satoshis
    userBalance: '150000000000', // 1500 tokens
    userVotingPower: '150000000000',
    userPercentage: 1.5
  },
  'microsoft': {
    totalShares: 2000000,
    totalHolders: 342,
    activeProposals: 1,
    totalRevenue: '500000000', // 5.0 BSV in satoshis
    userBalance: '500000000000', // 5000 tokens
    userVotingPower: '500000000000',
    userPercentage: 2.5
  },
  'nike': {
    totalShares: 1500000,
    totalHolders: 278,
    activeProposals: 1,
    totalRevenue: '180000000', // 1.8 BSV in satoshis
    userBalance: '300000000000', // 3000 tokens
    userVotingPower: '300000000000',
    userPercentage: 2.0
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    
    // In production, this would:
    // 1. Query blockchain for total supply and holder count
    // 2. Query database for proposal counts
    // 3. Query revenue contract for earnings
    // 4. Calculate user-specific stats based on their address
    
    const stats = mockStats[domain];
    if (!stats) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // If no user address provided, return generic stats
    if (!userAddress) {
      return NextResponse.json({
        totalShares: stats.totalShares,
        totalHolders: stats.totalHolders,
        activeProposals: stats.activeProposals,
        totalRevenue: stats.totalRevenue,
        userBalance: '0',
        userVotingPower: '0',
        userPercentage: 0
      });
    }

    return NextResponse.json(stats);

  } catch (error: unknown) {
    console.error('Error fetching domain stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain statistics' },
      { status: 500 }
    );
  }
}