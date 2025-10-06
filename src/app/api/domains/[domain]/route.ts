import { NextRequest, NextResponse } from 'next/server';

interface DomainInfo {
  domain: string;
  companyName: string;
  description: string;
  tokenSymbol: string;
  totalShares: number;
  currentHolders: number;
  template: {
    id: string;
    name: string;
    description: string;
    components: Record<string, unknown>[];
    styles: Record<string, unknown>;
  };
  isActive: boolean;
  createdAt: string;
}

// Mock data - in production this would query the database and blockchain
const mockDomains: Record<string, DomainInfo> = {
  'coca-cola': {
    domain: 'coca-cola',
    companyName: 'The Coca-Cola Company',
    description: 'The world\'s largest beverage company, creating refreshing experiences for over 130 years. Now with blockchain-governed transparency and community ownership.',
    tokenSymbol: 'bDNS-COKE',
    totalShares: 1000000,
    currentHolders: 156,
    template: {
      id: 'enterprise-default',
      name: 'Enterprise Default',
      description: 'Professional template for enterprise clients',
      components: [],
      styles: {}
    },
    isActive: true,
    createdAt: '2024-12-01T00:00:00Z'
  },
  'microsoft': {
    domain: 'microsoft',
    companyName: 'Microsoft Corporation',
    description: 'Empowering every person and organization on the planet to achieve more through technology and innovation.',
    tokenSymbol: 'bDNS-MSFT',
    totalShares: 2000000,
    currentHolders: 342,
    template: {
      id: 'tech-corporate',
      name: 'Tech Corporate',
      description: 'Modern template for technology companies',
      components: [],
      styles: {}
    },
    isActive: true,
    createdAt: '2024-11-15T00:00:00Z'
  },
  'nike': {
    domain: 'nike',
    companyName: 'Nike, Inc.',
    description: 'Just Do It. Nike brings inspiration and innovation to every athlete in the world.',
    tokenSymbol: 'bDNS-NIKE',
    totalShares: 1500000,
    currentHolders: 278,
    template: {
      id: 'brand-lifestyle',
      name: 'Brand Lifestyle',
      description: 'Dynamic template for lifestyle brands',
      components: [],
      styles: {}
    },
    isActive: true,
    createdAt: '2024-11-20T00:00:00Z'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    
    // In production, this would query the database and blockchain
    const domainInfo = mockDomains[domain];
    
    if (!domainInfo) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(domainInfo);
  } catch (error: unknown) {
    console.error('Error fetching domain info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    const updates = await request.json();
    
    // In production, this would update the database and potentially create blockchain transactions
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Domain updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating domain:', error);
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}