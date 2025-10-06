# Bitcoin Browser - Decentralized Web Browser for BitcoinSV

![Bitcoin Browser](https://img.shields.io/badge/Bitcoin-Browser-purple?style=for-the-badge)
![BSV](https://img.shields.io/badge/BitcoinSV-Enabled-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-Open%20BSV-green?style=for-the-badge)

## Overview

Bitcoin Browser is a revolutionary web browser built specifically for browsing and interacting with content stored on the BitcoinSV blockchain. It enables users to access on-chain websites, applications, and data through BSV transaction IDs and metanet protocols.

## 🎯 Core Features

### Blockchain Web Browsing
- **On-Chain Navigation**: Browse websites and content stored directly on BSV blockchain
- **Transaction ID URLs**: Access content via BSV transaction IDs (e.g., `bsv://txid`)
- **Metanet Protocol**: Support for hierarchical content structures using metanet
- **Micropayment Integration**: Built-in X402 payment protocol for premium content

### BSV Integration
- **Native Wallet**: Built-in BSV wallet for seamless transactions
- **HandCash Connect**: Support for HandCash wallet integration
- **BRC-100 Support**: Compatible with BRC-100 token standards
- **SPV Validation**: Simplified payment verification for trust

## 🏗️ Architecture

### Browser Engine
- **Content Rendering**: Parse and display on-chain HTML, CSS, and JavaScript
- **Security Sandbox**: Isolated execution environment for untrusted content
- **Protocol Handlers**: Custom URL schemes for blockchain content
- **Caching Layer**: Efficient storage of frequently accessed blockchain data

### Technical Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Blockchain**: BitcoinSV with BSV SDK integration
- **Wallet**: HandCash Connect and native wallet support
- **Payments**: X402 micropayment protocol
- **Database**: Local content caching and indexing

## 🚀 Browser Features

### For Users
- **Blockchain Navigation**: Browse BSV blockchain like the traditional web
- **Wallet Integration**: Send/receive BSV and tokens seamlessly
- **Content Discovery**: Find and explore on-chain applications
- **Micropayments**: Pay for premium content with satoshis

### For Developers
- **On-Chain Publishing**: Deploy websites directly to BSV blockchain
- **Metanet Tools**: Build hierarchical content structures
- **API Access**: RESTful APIs for blockchain interactions
- **Developer Console**: Debug on-chain applications

### For Content Creators
- **Monetization**: Instant micropayments for content access
- **Immutable Publishing**: Permanent, uncensorable content storage
- **Version Control**: Track content changes through blockchain history
- **Copyright Protection**: Timestamped proof of creation

## 📋 Current Implementation

### ✅ Completed
- [x] Next.js project structure with TypeScript
- [x] BSV SDK integration for blockchain connectivity
- [x] HandCash wallet integration foundation
- [x] Basic browser UI framework
- [x] Tailwind CSS styling with dark theme

### 🚧 In Development
- [ ] Transaction ID URL parsing and navigation
- [ ] On-chain content rendering engine
- [ ] Metanet protocol implementation
- [ ] X402 micropayment integration
- [ ] Browser security sandbox
- [ ] Content discovery and search

## 🌐 Supported Protocols

### URL Schemes
- `bsv://txid` - Direct transaction content access
- `metanet://node` - Metanet node navigation
- `bitcoin://address` - Bitcoin address interactions
- `handcash://handle` - HandCash user profiles

### Content Types
- **HTML Pages**: On-chain websites and applications
- **Images/Media**: Embedded multimedia content
- **Documents**: PDFs, text files, and data
- **Applications**: Interactive BSV-powered apps

## 🔧 Installation & Usage

```bash
# Clone the repository
git clone https://github.com/bitcoin-corp/bitcoin-browser.git
cd bitcoin-browser

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🎮 Example URLs

```
bsv://19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut  # Weather app
bsv://1BoatSLRHtKNngkdXEeobR76b53LETtpyT  # Social media post
metanet://blog/posts/hello-world           # Metanet blog post
bitcoin://1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa # Genesis address
```

## 🛡️ Security Features

- **Content Sandboxing**: Isolated execution of untrusted code
- **Payment Confirmation**: User approval required for all transactions
- **Address Validation**: Verify all Bitcoin addresses and signatures
- **Malware Protection**: Scan for malicious on-chain content

## 🗺️ Development Roadmap

### Phase 1: Core Browser (Current)
- Basic transaction content rendering
- Simple navigation interface
- Wallet integration

### Phase 2: Advanced Features
- Metanet protocol support
- Content discovery engine
- Developer tools

### Phase 3: Ecosystem
- Plugin architecture
- Mobile applications
- Enterprise features

## 📖 Documentation

- [Browser Architecture](./docs/ARCHITECTURE.md)
- [Protocol Documentation](./docs/PROTOCOLS.md)
- [API Reference](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [User Manual](./docs/USER_GUIDE.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📄 License

Open BSV License Version 5 - see [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- [BSV Blockchain](https://bsvblockchain.org/) - The scalable blockchain
- [HandCash](https://handcash.io/) - User-friendly BSV wallet
- [Metanet](https://metanet.icu/) - Protocol for on-chain data structures

## 🌟 Inspired By

This project builds upon the pioneering work of:
- **Bitpipe**: Transaction broadcast service
- **Metanet Desktop**: BRC-100 wallet application
- **BSV SPV Wallet**: Browser extension for BSV

## 📞 Contact

For development inquiries and partnership opportunities, contact The Bitcoin Corporation LTD.

---

**Browse the Future with Bitcoin SV 🚀**