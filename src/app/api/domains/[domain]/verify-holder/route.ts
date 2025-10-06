import { NextRequest, NextResponse } from 'next/server';

interface TokenHolderVerification {
  address: string;
  publicKey: string;
}

// Mock token holder data - in production this would query the blockchain
const mockTokenHolders: Record<string, Record<string, unknown>> = {
  'coca-cola': {
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': {
      balance: '150000000000', // 1500 tokens in satoshis
      votingPower: '150000000000',
      percentage: 1.5,
      isHolder: true
    },
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2': {
      balance: '250000000000', // 2500 tokens in satoshis
      votingPower: '250000000000',
      percentage: 2.5,
      isHolder: true
    }
  },
  'microsoft': {
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': {
      balance: '500000000000', // 5000 tokens in satoshis
      votingPower: '500000000000',
      percentage: 2.5,
      isHolder: true
    }
  },
  'nike': {
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2': {
      balance: '300000000000', // 3000 tokens in satoshis
      votingPower: '300000000000',
      percentage: 2.0,
      isHolder: true
    }
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    const body: TokenHolderVerification = await request.json();
    
    const { address, publicKey } = body;
    
    if (!address || !publicKey) {
      return NextResponse.json(
        { error: 'Address and public key are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Verify the public key matches the address
    // 2. Query the blockchain for token balance
    // 3. Check smart contract for voting power
    
    const domainHolders = mockTokenHolders[domain];
    if (!domainHolders) {
      return NextResponse.json({
        isHolder: false,
        balance: '0',
        votingPower: '0',
        percentage: 0,
        message: 'Domain not found'
      });
    }

    const holderData = domainHolders[address] as Record<string, unknown>;
    if (!holderData) {
      return NextResponse.json({
        isHolder: false,
        balance: '0',
        votingPower: '0',
        percentage: 0,
        message: 'No tokens held for this domain'
      });
    }

    return NextResponse.json({
      isHolder: holderData.isHolder as boolean,
      balance: holderData.balance as string,
      votingPower: holderData.votingPower as string,
      percentage: holderData.percentage as number,
      message: 'Token holding verified'
    });

  } catch (error: unknown) {
    console.error('Error verifying token holder:', error);
    return NextResponse.json(
      { error: 'Failed to verify token holding' },
      { status: 500 }
    );
  }
}