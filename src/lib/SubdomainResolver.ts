export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface SubdomainConfig {
  domain: string;
  subdomain: string; // e.g., "coca-cola" for b.coca-cola.com
  contractAddress: string;
  contentHash: string;
  dnsRecords: DNSRecord[];
  governanceEnabled: boolean;
  lastUpdated: number;
  updateTxId: string;
}

export interface ResolutionResult {
  success: boolean;
  records: DNSRecord[];
  source: 'blockchain' | 'cache' | 'fallback';
  cacheTtl: number;
  error?: string;
}

export class SubdomainResolver {
  private cache: Map<string, {config: SubdomainConfig; expires: number}> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly BSV_RPC_ENDPOINT = process.env.BSV_RPC_ENDPOINT || 'https://api.whatsonchain.com/v1/bsv/main';

  async resolveSubdomain(fullDomain: string): Promise<ResolutionResult> {
    try {
      // Parse domain (e.g., "b.coca-cola.com" -> "coca-cola")
      const subdomain = this.extractSubdomain(fullDomain);
      if (!subdomain) {
        return {
          success: false,
          records: [],
          source: 'fallback',
          cacheTtl: 0,
          error: 'Invalid subdomain format'
        };
      }

      // Check cache first
      const cached = this.getCachedConfig(subdomain);
      if (cached) {
        return {
          success: true,
          records: cached.dnsRecords,
          source: 'cache',
          cacheTtl: this.CACHE_TTL
        };
      }

      // Resolve from blockchain
      const config = await this.resolveFromBlockchain(subdomain);
      if (!config) {
        return this.getFallbackResolution(fullDomain);
      }

      // Cache the result
      this.cacheConfig(subdomain, config);

      return {
        success: true,
        records: config.dnsRecords,
        source: 'blockchain',
        cacheTtl: this.CACHE_TTL
      };

    } catch (error) {
      console.error('DNS resolution error:', error);
      return this.getFallbackResolution(fullDomain);
    }
  }

  private extractSubdomain(fullDomain: string): string | null {
    // Extract subdomain from "b.company.com" format
    const match = fullDomain.match(/^b\.([^.]+)\.com$/);
    return match ? match[1] : null;
  }

  private getCachedConfig(subdomain: string): SubdomainConfig | null {
    const cached = this.cache.get(subdomain);
    if (cached && cached.expires > Date.now()) {
      return cached.config;
    }
    if (cached) {
      this.cache.delete(subdomain);
    }
    return null;
  }

  private cacheConfig(subdomain: string, config: SubdomainConfig): void {
    this.cache.set(subdomain, {
      config,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  private async resolveFromBlockchain(subdomain: string): Promise<SubdomainConfig | null> {
    try {
      // Query blockchain for subdomain configuration
      // This would use BSV APIs to find the domain's smart contract
      const contractAddress = await this.findDomainContract(subdomain);
      if (!contractAddress) {
        return null;
      }

      // Get latest configuration from the contract
      const config = await this.getContractConfig(contractAddress);
      return config;

    } catch (error) {
      console.error('Blockchain resolution error:', error);
      return null;
    }
  }

  private async findDomainContract(subdomain: string): Promise<string | null> {
    // This would search the blockchain for domain registration transactions
    // For now, return a mock contract address
    const mockContracts: Record<string, string> = {
      'coca-cola': '1CocaColaContractAddress123456789',
      'microsoft': '1MicrosoftContractAddress123456789',
      'apple': '1AppleContractAddress123456789'
    };

    return mockContracts[subdomain] || null;
  }

  private async getContractConfig(contractAddress: string): Promise<SubdomainConfig | null> {
    // This would read the current configuration from the smart contract
    // Including any governance-approved updates
    
    // Mock configuration for demonstration
    const mockConfig: SubdomainConfig = {
      domain: 'coca-cola.com',
      subdomain: 'coca-cola',
      contractAddress,
      contentHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      dnsRecords: [
        {
          type: 'A',
          name: 'b.coca-cola.com',
          value: '203.0.113.42',
          ttl: 300
        },
        {
          type: 'CNAME',
          name: 'www.b.coca-cola.com',
          value: 'b.coca-cola.com',
          ttl: 300
        },
        {
          type: 'TXT',
          name: 'b.coca-cola.com',
          value: 'bitcoin-dns-v1 contract=' + contractAddress,
          ttl: 300
        }
      ],
      governanceEnabled: true,
      lastUpdated: Date.now() - 3600000, // 1 hour ago
      updateTxId: 'abc123def456'
    };

    return mockConfig;
  }

  private getFallbackResolution(fullDomain: string): ResolutionResult {
    // Fallback to traditional DNS or return a default page
    return {
      success: true,
      records: [
        {
          type: 'A',
          name: fullDomain,
          value: '192.168.1.100', // Bitcoin DNS portal server
          ttl: 60
        },
        {
          type: 'TXT',
          name: fullDomain,
          value: 'bitcoin-dns-portal subdomain-not-configured',
          ttl: 60
        }
      ],
      source: 'fallback',
      cacheTtl: 60,
      error: 'Subdomain not found on blockchain'
    };
  }

  // Update DNS records through governance proposal
  async proposeRecordUpdate(
    subdomain: string,
    newRecords: DNSRecord[],
    proposer: string
  ): Promise<string> {
    const config = await this.resolveFromBlockchain(subdomain);
    if (!config) {
      throw new Error('Subdomain not found');
    }

    // This would create a governance proposal for the DNS update
    const proposalId = await this.createGovernanceProposal(
      config.contractAddress,
      'subdomain_config',
      { dnsRecords: newRecords },
      proposer
    );

    return proposalId;
  }

  private async createGovernanceProposal(
    contractAddress: string,
    proposalType: string,
    data: Record<string, unknown>,
    proposer: string
  ): Promise<string> {
    // This would interact with the governance contract
    console.log('Creating governance proposal:', {
      contractAddress,
      proposalType,
      data,
      proposer
    });

    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get subdomain status and statistics
  async getSubdomainStatus(subdomain: string): Promise<{
    exists: boolean;
    config?: SubdomainConfig;
    shareholders: number;
    lastGovernanceAction: number;
    revenueGenerated: number;
    queryCount24h: number;
  }> {
    const config = await this.resolveFromBlockchain(subdomain);
    
    if (!config) {
      return {
        exists: false,
        shareholders: 0,
        lastGovernanceAction: 0,
        revenueGenerated: 0,
        queryCount24h: 0
      };
    }

    // This would query actual statistics from the blockchain and payment system
    return {
      exists: true,
      config,
      shareholders: 150, // Mock data
      lastGovernanceAction: Date.now() - 86400000, // 1 day ago
      revenueGenerated: 50000, // satoshis
      queryCount24h: 1247
    };
  }

  // Validate subdomain name for registration
  validateSubdomainName(subdomain: string): {
    valid: boolean;
    errors: string[];
    suggestions?: string[];
  } {
    const errors: string[] = [];
    
    if (subdomain.length < 3) {
      errors.push('Subdomain must be at least 3 characters long');
    }
    
    if (subdomain.length > 63) {
      errors.push('Subdomain cannot exceed 63 characters');
    }
    
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }
    
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      errors.push('Subdomain cannot start or end with a hyphen');
    }
    
    if (subdomain.includes('--')) {
      errors.push('Subdomain cannot contain consecutive hyphens');
    }

    // Check for reserved names
    const reserved = ['www', 'mail', 'ftp', 'admin', 'root', 'api', 'cdn'];
    if (reserved.includes(subdomain)) {
      errors.push('This subdomain name is reserved');
    }

    const suggestions = errors.length > 0 ? this.generateSuggestions(subdomain) : undefined;

    return {
      valid: errors.length === 0,
      errors,
      suggestions
    };
  }

  private generateSuggestions(subdomain: string): string[] {
    // Generate alternative subdomain suggestions
    const suggestions: string[] = [];
    
    // Remove invalid characters
    const cleaned = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleaned !== subdomain && cleaned.length >= 3) {
      suggestions.push(cleaned);
    }
    
    // Add suffixes
    if (subdomain.length < 60) {
      suggestions.push(subdomain + '-corp');
      suggestions.push(subdomain + '-inc');
      suggestions.push(subdomain + '-co');
    }
    
    return suggestions.slice(0, 5);
  }

  // Clear cache for a specific subdomain
  invalidateCache(subdomain: string): void {
    this.cache.delete(subdomain);
  }

  // Clear all cached entries
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): {
    entries: number;
    hitRate: number;
    oldestEntry: number;
  } {
    return {
      entries: this.cache.size,
      hitRate: 0.85, // Mock hit rate
      oldestEntry: Date.now() - 300000 // 5 minutes ago
    };
  }
}