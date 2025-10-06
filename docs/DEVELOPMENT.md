# Development Guide

## 🛠️ Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher
- **Git**: For version control
- **bitcoin-wallet**: Browser extension for testing authentication

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/bitcoin-corp/bitcoin_dns.git
cd bitcoin_dns
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Test Subdomain Pages

Visit these demo subdomains:
- [http://localhost:3000/b/coca-cola](http://localhost:3000/b/coca-cola)
- [http://localhost:3000/b/microsoft](http://localhost:3000/b/microsoft)
- [http://localhost:3000/b/nike](http://localhost:3000/b/nike)

### 4. Test Token Holder Authentication

1. Install bitcoin-wallet browser extension
2. Visit a subdomain admin page: `/b/coca-cola/admin`
3. Connect wallet using mock addresses:
   - `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (has tokens for coca-cola, microsoft)
   - `1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2` (has tokens for coca-cola, nike)

## 🏗️ Project Structure

```
bitcoin_dns/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Main domain registration portal
│   │   ├── b/[domain]/        # Dynamic subdomain pages
│   │   │   ├── page.tsx       # Public subdomain page
│   │   │   └── admin/         # Token holder admin area
│   │   └── api/               # API routes
│   │       └── domains/       # Domain-related APIs
│   ├── components/            # Reusable components
│   │   └── auth/              # Authentication components
│   ├── lib/                   # Utility libraries
│   │   └── wallet/            # Wallet integration
│   └── types/                 # TypeScript type definitions
├── docs/                      # Comprehensive documentation
└── README.md                  # Project overview
```

## 🔧 Development Features

### Mock Data System

The application includes comprehensive mock data for development:

- **Domain Information**: Coca-Cola, Microsoft, Nike examples
- **Token Holdings**: Mock BRC-100 token balances
- **Governance Proposals**: Sample voting scenarios
- **Revenue Statistics**: Mock earnings and distributions

### Authentication Testing

Mock wallet addresses with predefined token holdings:

```typescript
// Coca-Cola token holders
'1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': 1500 tokens (1.5%)
'1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2': 2500 tokens (2.5%)

// Microsoft token holders  
'1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': 5000 tokens (2.5%)

// Nike token holders
'1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2': 3000 tokens (2.0%)
```

### API Endpoints

All API routes are functional with mock data:

- `GET /api/domains/[domain]` - Domain information
- `POST /api/domains/[domain]/verify-holder` - Token verification
- `GET /api/domains/[domain]/proposals` - Governance proposals
- `GET /api/domains/[domain]/stats` - Domain statistics

## 📱 Component Development

### Wallet Integration

The `WalletConnect` component provides:
- BRC-100 wallet connection
- Token holding verification
- Authentication state management
- Error handling and user feedback

```tsx
import WalletConnect from '@/components/auth/WalletConnect';

<WalletConnect
  onConnectionChange={handleConnection}
  requiredDomain="coca-cola"
/>
```

### Subdomain Pages

Dynamic routing for `b.[domain].com` functionality:
- Public pages at `/b/[domain]`
- Token holder admin at `/b/[domain]/admin`
- Automatic authentication verification
- Template system integration

## 🧪 Testing Strategy

### Manual Testing Scenarios

1. **Domain Registration Flow**
   - Visit main portal
   - Fill out registration form
   - Test validation and error states

2. **Subdomain Access**
   - Visit public subdomain pages
   - Verify branding and content
   - Test responsive design

3. **Token Holder Authentication**
   - Connect wallet with token-holding address
   - Access admin dashboard
   - Test voting on proposals
   - Verify permission restrictions

4. **Governance Features**
   - View active proposals
   - Submit votes (for/against)
   - Check voting power calculations
   - Test proposal status updates

### Error Testing

- Invalid domain names
- Non-token-holding wallet addresses
- Network connection issues
- API failures and timeouts

## 🎨 Styling Guidelines

### Color Scheme
- **Primary**: Purple (`#8B5CF6`) and Blue (`#3B82F6`)
- **Background**: Black (`#000000`) with gray cards
- **Text**: White headings, gray body text
- **Accents**: Green for success, red for errors, yellow for warnings

### Component Patterns
- Consistent card layouts with `bg-gray-800 border border-gray-700`
- Purple/blue gradients for primary actions
- Responsive grid layouts
- Accessible color contrasts

## 🔧 Build and Deployment

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Environment Configuration

Create `.env.local` for development:

```env
# Bitcoin SV Network
BSV_NETWORK=testnet
BSV_API_URL=https://api.whatsonchain.com/v1/bsv/test

# Database (when implemented)
DATABASE_URL=postgresql://...

# Authentication (when implemented)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## 🐛 Debugging

### Common Issues

1. **Wallet Connection Fails**
   - Ensure bitcoin-wallet extension is installed
   - Check console for connection errors
   - Verify mock addresses are used

2. **Subdomain 404 Errors**
   - Confirm domain exists in mock data
   - Check dynamic route parameters
   - Verify API endpoints are accessible

3. **Authentication Loops**
   - Clear browser storage
   - Refresh page to reset state
   - Check wallet connection status

### Debug Tools

- Browser DevTools for wallet API calls
- Network tab for API request monitoring
- React DevTools for component state
- Console logs for wallet interactions

## 📦 Dependencies

### Core Dependencies
- **Next.js 15**: React framework with app directory
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Development Dependencies
- **ESLint**: Code linting and formatting
- **@types/***: TypeScript definitions
- **Tailwind PostCSS**: CSS processing

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Implement feature with tests
   - Update documentation
   - Create pull request

2. **Code Standards**
   - TypeScript strict mode
   - ESLint compliance
   - Consistent component patterns
   - Comprehensive error handling

3. **Documentation**
   - Update README for new features
   - Add API documentation
   - Include testing instructions
   - Maintain changelog

---

*For production deployment and blockchain integration, see the full architecture documentation.*