'use client';

import { useState } from 'react';
import { Globe, Search, ArrowLeft, ArrowRight, RotateCcw, Home, Shield, Wallet } from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  title: string;
  content?: string;
  loading?: boolean;
}

export default function BrowserPage() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'home', url: 'bitcoin://home', title: 'Bitcoin Browser' }
  ]);
  const [addressBar, setAddressBar] = useState('bitcoin://home');
  const [history, setHistory] = useState<string[]>(['bitcoin://home']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigate = (url: string) => {
    if (url === addressBar) return;
    
    setAddressBar(url);
    const newHistory = [...history.slice(0, historyIndex + 1), url];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Update current tab
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTab 
        ? { ...tab, url, title: getPageTitle(url), loading: true }
        : tab
    );
    setTabs(updatedTabs);

    // Simulate loading
    setTimeout(() => {
      setTabs(tabs => tabs.map(tab => 
        tab.id === activeTab 
          ? { ...tab, loading: false, content: getPageContent(url) }
          : tab
      ));
    }, 1000);
  };

  const getPageTitle = (url: string): string => {
    if (url === 'bitcoin://home') return 'Bitcoin Browser';
    if (url.startsWith('bsv://')) return 'BSV Transaction';
    if (url.startsWith('metanet://')) return 'Metanet Content';
    if (url.startsWith('handcash://')) return 'HandCash Profile';
    return 'Loading...';
  };

  const getPageContent = (url: string): string => {
    if (url === 'bitcoin://home') return 'home';
    if (url.startsWith('bsv://')) return 'transaction';
    if (url.startsWith('metanet://')) return 'metanet';
    if (url.startsWith('handcash://')) return 'handcash';
    return 'content';
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const goBack = () => {
    if (canGoBack) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAddressBar(history[newIndex]);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAddressBar(history[newIndex]);
    }
  };

  const refresh = () => {
    handleNavigate(addressBar);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-gray-900 border-b border-gray-800">
        {/* Tab Bar */}
        <div className="flex items-center px-2 pt-2">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg cursor-pointer text-sm ${
                activeTab === tab.id 
                  ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.title}
            </div>
          ))}
          <button className="ml-2 w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300">
            +
          </button>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={refresh}
            className="p-2 rounded hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => handleNavigate('bitcoin://home')}
            className="p-2 rounded hover:bg-gray-700"
          >
            <Home className="w-4 h-4 text-gray-300" />
          </button>

          {/* Address Bar */}
          <div className="flex-1 flex items-center bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-2">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <input
              type="text"
              value={addressBar}
              onChange={(e) => setAddressBar(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(addressBar)}
              className="flex-1 bg-transparent text-white px-2 py-2 outline-none"
              placeholder="Enter bitcoin://, bsv://, or metanet:// URL"
            />
            <button
              onClick={() => handleNavigate(addressBar)}
              className="p-2 hover:bg-gray-700 rounded-r-lg"
            >
              <Search className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Wallet Button */}
          <button className="p-2 rounded hover:bg-gray-700 bg-purple-600">
            <Wallet className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 bg-black">
          {currentTab?.loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading blockchain content...</p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {addressBar === 'bitcoin://home' && <HomePage />}
              {addressBar.startsWith('bsv://') && <TransactionPage txId={addressBar.replace('bsv://', '')} />}
              {addressBar.startsWith('metanet://') && <MetanetPage path={addressBar.replace('metanet://', '')} />}
              {addressBar.startsWith('handcash://') && <HandCashPage handle={addressBar.replace('handcash://', '')} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const exampleUrls = [
    { url: 'bsv://19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut', title: 'Weather App', description: 'On-chain weather application' },
    { url: 'bsv://1BoatSLRHtKNngkdXEeobR76b53LETtpyT', title: 'Social Post', description: 'Blockchain social media content' },
    { url: 'metanet://blog/posts/hello-world', title: 'Blog Post', description: 'Metanet structured content' },
    { url: 'handcash://satoshi', title: 'User Profile', description: 'HandCash user profile' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Globe className="w-16 h-16 text-purple-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Bitcoin Browser
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Browse the decentralized web on Bitcoin SV blockchain
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {exampleUrls.map((item, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 cursor-pointer transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 mb-3">{item.description}</p>
            <code className="text-sm text-purple-300 bg-gray-800 px-2 py-1 rounded">{item.url}</code>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gray-900 border border-gray-800 rounded-lg">
          <Globe className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">On-Chain Content</h3>
          <p className="text-gray-400">Access websites and data stored permanently on BSV blockchain</p>
        </div>
        <div className="text-center p-6 bg-gray-900 border border-gray-800 rounded-lg">
          <Wallet className="w-8 h-8 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Integrated Wallet</h3>
          <p className="text-gray-400">Built-in BSV wallet for seamless micropayments and transactions</p>
        </div>
        <div className="text-center p-6 bg-gray-900 border border-gray-800 rounded-lg">
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Secure Browsing</h3>
          <p className="text-gray-400">Sandboxed execution and verified blockchain content</p>
        </div>
      </div>
    </div>
  );
}

function TransactionPage({ txId }: { txId: string }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">BSV Transaction Content</h2>
        <p className="text-gray-400 mb-4">Transaction ID: <code className="text-purple-300">{txId}</code></p>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-300">Loading transaction content from BSV blockchain...</p>
          <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded">
            <p className="text-blue-200">This would display the actual content stored in the transaction's OP_RETURN data or referenced files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetanetPage({ path }: { path: string }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Metanet Content</h2>
        <p className="text-gray-400 mb-4">Path: <code className="text-purple-300">{path}</code></p>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-300">Loading metanet structured content...</p>
          <div className="mt-4 p-4 bg-purple-900/30 border border-purple-500/30 rounded">
            <p className="text-purple-200">This would display content organized using the Metanet protocol with hierarchical structure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HandCashPage({ handle }: { handle: string }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">HandCash Profile</h2>
        <p className="text-gray-400 mb-4">Handle: <code className="text-purple-300">@{handle}</code></p>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-300">Loading HandCash user profile...</p>
          <div className="mt-4 p-4 bg-green-900/30 border border-green-500/30 rounded">
            <p className="text-green-200">This would display the user's HandCash profile information and public content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}