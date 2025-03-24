import React, { useState, useEffect } from 'react';
import { TowerControl as GameController } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import type { Bet, BetStats, BetFilters } from './types';
import { BetForm } from './components/BetForm';
import { BetList } from './components/BetList';
import { Stats } from './components/Stats';

function App() {
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [filters, setFilters] = useState<BetFilters>({
    dateRange: { from: null, to: null },
    sport: '',
    betType: '',
    sportsbook: ''
  });

  useEffect(() => {
    localStorage.setItem('bets', JSON.stringify(bets));
  }, [bets]);

  const calculateStats = (): BetStats => {
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    const lostBets = bets.filter(bet => bet.status === 'lost').length;
    const pendingBets = bets.filter(bet => bet.status === 'pending').length;
    
    const totalWon = bets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + bet.profit, 0);
    
    const totalLost = bets
      .filter(bet => bet.status === 'lost')
      .reduce((sum, bet) => sum + Math.abs(bet.profit), 0);
    
    const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalProfit = totalWon - totalLost;
    
    const roi = totalStaked > 0 
      ? (totalProfit / totalStaked) * 100 
      : 0;

    const winRate = (wonBets + lostBets) > 0
      ? (wonBets / (wonBets + lostBets)) * 100
      : 0;

    const averageOdds = bets.length > 0
      ? bets.reduce((sum, bet) => sum + bet.odds.value, 0) / bets.length
      : 0;

    const sportBreakdown = bets.reduce((acc, bet) => ({
      ...acc,
      [bet.sport]: (acc[bet.sport] || 0) + 1
    }), {} as Record<string, number>);

    const betTypeBreakdown = bets.reduce((acc, bet) => ({
      ...acc,
      [bet.betType]: (acc[bet.betType] || 0) + 1
    }), {} as Record<string, number>);

    return {
      totalBets: bets.length,
      wonBets,
      lostBets,
      pendingBets,
      totalStaked,
      totalProfit,
      roi,
      winRate,
      averageOdds,
      sportBreakdown,
      betTypeBreakdown
    };
  };

  const calculateProfitHistory = (): number[] => {
    return bets
      .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime())
      .reduce((acc: number[], bet) => {
        const lastProfit = acc.length > 0 ? acc[acc.length - 1] : 0;
        const profit = bet.status === 'pending' ? lastProfit : lastProfit + bet.profit;
        return [...acc, profit];
      }, []);
  };

  const handleAddBet = (newBet: Omit<Bet, 'id' | 'profit'>) => {
    const bet: Bet = {
      ...newBet,
      id: crypto.randomUUID(),
      profit: 0
    };
    setBets(prev => [bet, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: Bet['status']) => {
    setBets(prev => prev.map(bet => {
      if (bet.id === id) {
        const profit = status === 'won'
          ? bet.stake * (bet.odds.value - 1)
          : status === 'lost'
          ? -bet.stake
          : 0;
        
        return { ...bet, status, profit };
      }
      return bet;
    }));
  };

  const handleImportBets = (importedBets: Bet[]) => {
    setBets(prev => [...importedBets, ...prev]);
  };

  const filteredBets = bets.filter(bet => {
    if (filters.sport && bet.sport !== filters.sport) return false;
    if (filters.betType && bet.betType !== filters.betType) return false;
    if (filters.sportsbook && bet.sportsbook !== filters.sportsbook) return false;
    if (filters.dateRange.from && new Date(bet.placedAt) < filters.dateRange.from) return false;
    if (filters.dateRange.to && new Date(bet.placedAt) > filters.dateRange.to) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-arcade-dark to-arcade-purple/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-12 animate-float">
          <div className="bg-arcade-dark p-3 rounded-2xl border-2 border-arcade-cyan shadow-arcade">
            <GameController className="w-12 h-12 text-arcade-cyan" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-arcade-cyan to-arcade-yellow bg-clip-text text-transparent">
            OddShore
          </h1>
        </header>

        <div className="mb-12">
          <Stats 
            stats={calculateStats()} 
            profitHistory={calculateProfitHistory()}
          />
        </div>
        
        <div className="mb-12">
          <BetForm onAddBet={handleAddBet} />
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-arcade-cyan flex items-center gap-3">
            Your Bets
            <span className="text-sm font-normal bg-arcade-cyan/20 px-3 py-1 rounded-full">
              {filteredBets.length} total
            </span>
          </h2>
          <BetList 
            bets={filteredBets}
            filters={filters}
            onUpdateStatus={handleUpdateStatus}
            onFilterChange={setFilters}
            onImportBets={handleImportBets}
          />
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(26, 16, 60, 0.95)',
            color: '#E5E7EB',
            border: '2px solid #2DD4BF',
            backdropFilter: 'blur(8px)'
          },
          duration: 4000,
        }}
      />
    </div>
  );
}

export default App;