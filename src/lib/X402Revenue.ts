export interface X402Payment {
  id: string;
  domain: string;
  amount: number; // satoshis
  source: 'dns_query' | 'subdomain_visit' | 'premium_service' | 'governance_fee';
  timestamp: number;
  txId: string;
  distributed: boolean;
}

export interface RevenueDistribution {
  shareholders: number; // percentage
  development: number;  // percentage
  operations: number;   // percentage
}

export interface ShareholderPayout {
  address: string;
  shares: number;
  percentage: number;
  amount: number; // satoshis
  txId?: string;
}

export interface DistributionReport {
  period: string;
  domain: string;
  totalRevenue: number;
  paymentsProcessed: number;
  distributions: {
    shareholders: ShareholderPayout[];
    development: number;
    operations: number;
  };
  gasCosts: number;
  netDistributed: number;
}

export class X402RevenueManager {
  private domain: string;
  private revenueDistribution: RevenueDistribution;
  private shareholders: Map<string, number>; // address -> share count
  private totalShares: number;
  private pendingPayments: X402Payment[] = [];

  constructor(
    domain: string,
    revenueDistribution: RevenueDistribution,
    shareholders: Map<string, number>,
    totalShares: number
  ) {
    this.domain = domain;
    this.revenueDistribution = revenueDistribution;
    this.shareholders = shareholders;
    this.totalShares = totalShares;
  }

  // Record incoming X402 payment
  recordPayment(payment: Omit<X402Payment, 'id' | 'distributed'>): X402Payment {
    const fullPayment: X402Payment = {
      ...payment,
      id: this.generatePaymentId(),
      distributed: false
    };

    this.pendingPayments.push(fullPayment);
    return fullPayment;
  }

  // Process revenue distribution for a batch of payments
  async distributeRevenue(paymentIds: string[]): Promise<DistributionReport> {
    const payments = this.pendingPayments.filter(p => paymentIds.includes(p.id));
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalRevenue === 0) {
      throw new Error('No revenue to distribute');
    }

    // Calculate distribution amounts
    const shareholderRevenue = Math.floor(totalRevenue * (this.revenueDistribution.shareholders / 100));
    const developmentRevenue = Math.floor(totalRevenue * (this.revenueDistribution.development / 100));
    const operationsRevenue = Math.floor(totalRevenue * (this.revenueDistribution.operations / 100));

    // Calculate individual shareholder payouts
    const shareholderPayouts: ShareholderPayout[] = [];
    for (const [address, shares] of this.shareholders.entries()) {
      const percentage = (shares / this.totalShares) * 100;
      const amount = Math.floor(shareholderRevenue * (shares / this.totalShares));
      
      if (amount > 0) {
        shareholderPayouts.push({
          address,
          shares,
          percentage,
          amount
        });
      }
    }

    // Execute payouts
    const gasCosts = await this.executePayouts(shareholderPayouts, developmentRevenue, operationsRevenue);

    // Mark payments as distributed
    payments.forEach(p => p.distributed = true);

    const report: DistributionReport = {
      period: new Date().toISOString(),
      domain: this.domain,
      totalRevenue,
      paymentsProcessed: payments.length,
      distributions: {
        shareholders: shareholderPayouts,
        development: developmentRevenue,
        operations: operationsRevenue
      },
      gasCosts,
      netDistributed: totalRevenue - gasCosts
    };

    return report;
  }

  private async executePayouts(
    shareholderPayouts: ShareholderPayout[],
    developmentAmount: number,
    operationsAmount: number
  ): Promise<number> {
    let totalGasCosts = 0;

    // Execute shareholder payouts
    for (const payout of shareholderPayouts) {
      try {
        const txId = await this.sendBSVPayment(payout.address, payout.amount);
        payout.txId = txId;
        totalGasCosts += this.estimateTransactionFee();
      } catch (error) {
        console.error(`Failed to pay shareholder ${payout.address}:`, error);
      }
    }

    // Execute development fund payment
    if (developmentAmount > 0) {
      try {
        await this.sendBSVPayment(this.getDevelopmentAddress(), developmentAmount);
        totalGasCosts += this.estimateTransactionFee();
      } catch (error) {
        console.error('Failed to pay development fund:', error);
      }
    }

    // Execute operations payment
    if (operationsAmount > 0) {
      try {
        await this.sendBSVPayment(this.getOperationsAddress(), operationsAmount);
        totalGasCosts += this.estimateTransactionFee();
      } catch (error) {
        console.error('Failed to pay operations fund:', error);
      }
    }

    return totalGasCosts;
  }

  private async sendBSVPayment(address: string, amount: number): Promise<string> {
    // This would integrate with BSV wallet/payment system
    // For now, return a mock transaction ID
    console.log(`Sending ${amount} satoshis to ${address}`);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateTransactionFee(): number {
    // BSV transaction fees are very low, typically 1-5 satoshis
    return 2;
  }

  private getDevelopmentAddress(): string {
    // This would be configured per domain or use a default development fund address
    return '1DevelopmentFundAddressForBitcoinDNS';
  }

  private getOperationsAddress(): string {
    // This would be configured per domain or use a default operations address
    return '1OperationsFundAddressForBitcoinDNS';
  }

  // Get revenue analytics
  getRevenueAnalytics(days: number = 30): {
    totalRevenue: number;
    averageDaily: number;
    paymentBreakdown: Record<X402Payment['source'], number>;
    topSources: Array<{source: X402Payment['source']; amount: number; count: number}>;
  } {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentPayments = this.pendingPayments
      .concat(this.getDistributedPayments())
      .filter(p => p.timestamp >= cutoffDate);

    const totalRevenue = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    const averageDaily = totalRevenue / days;

    const paymentBreakdown: Record<X402Payment['source'], number> = {
      dns_query: 0,
      subdomain_visit: 0,
      premium_service: 0,
      governance_fee: 0
    };

    recentPayments.forEach(p => {
      paymentBreakdown[p.source] += p.amount;
    });

    const topSources = Object.entries(paymentBreakdown)
      .map(([source, amount]) => ({
        source: source as X402Payment['source'],
        amount,
        count: recentPayments.filter(p => p.source === source).length
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalRevenue,
      averageDaily,
      paymentBreakdown,
      topSources
    };
  }

  private getDistributedPayments(): X402Payment[] {
    // This would query distributed payments from persistent storage
    return [];
  }

  private generatePaymentId(): string {
    return `pay_${this.domain}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update revenue distribution settings (requires governance approval)
  updateRevenueDistribution(newDistribution: RevenueDistribution): void {
    if (newDistribution.shareholders + newDistribution.development + newDistribution.operations !== 100) {
      throw new Error('Revenue distribution percentages must sum to 100%');
    }
    this.revenueDistribution = newDistribution;
  }

  // Get pending revenue ready for distribution
  getPendingRevenue(): {
    totalAmount: number;
    paymentCount: number;
    oldestPayment: number;
    readyForDistribution: boolean;
  } {
    const pendingRevenue = this.pendingPayments
      .filter(p => !p.distributed)
      .reduce((sum, p) => sum + p.amount, 0);

    const oldestPending = this.pendingPayments
      .filter(p => !p.distributed)
      .sort((a, b) => a.timestamp - b.timestamp)[0];

    const readyForDistribution = pendingRevenue >= 1000 || // Minimum 1000 satoshis
      (oldestPending && Date.now() - oldestPending.timestamp > 24 * 60 * 60 * 1000); // Or 24 hours old

    return {
      totalAmount: pendingRevenue,
      paymentCount: this.pendingPayments.filter(p => !p.distributed).length,
      oldestPayment: oldestPending?.timestamp || 0,
      readyForDistribution
    };
  }
}