import React, { useState, useEffect } from 'react';
import { PlusCircle, Dices, Calculator } from 'lucide-react';
import type { Bet, BetType, OddsFormat } from '../types';
import { convertOdds } from '../utils/odds';
import toast from 'react-hot-toast';

interface BetFormProps {
  onAddBet: (bet: Omit<Bet, 'id' | 'profit'>) => void;
}

const SPORTS = [
  'Football',
  'Basketball',
  'Baseball',
  'Hockey',
  'Soccer',
  'Tennis',
  'MMA',
  'Boxing',
  'Golf',
  'Other'
];

const COMMON_LEAGUES: Record<string, string[]> = {
  Football: ['NFL', 'NCAAF'],
  Basketball: ['NBA', 'NCAAB', 'EuroLeague'],
  Baseball: ['MLB', 'NPB'],
  Hockey: ['NHL', 'KHL'],
  Soccer: ['Premier League', 'La Liga', 'Champions League', 'MLS'],
  Tennis: ['ATP', 'WTA', 'Grand Slam'],
  MMA: ['UFC', 'Bellator'],
  Boxing: ['WBA', 'WBC', 'WBO', 'IBF'],
  Golf: ['PGA', 'European Tour', 'LPGA'],
};

const BET_TYPES: BetType[] = [
  'moneyline',
  'spread',
  'over/under',
  'parlay',
  'prop',
  'other'
];

const ODDS_FORMATS: OddsFormat[] = ['american', 'decimal', 'fractional'];

const SPORTSBOOKS = [
  'DraftKings',
  'FanDuel',
  'BetMGM',
  'Caesars',
  'PointsBet',
  'Other'
];

const QUICK_STAKES = [5, 10, 25, 50, 100, 250, 500];

export function BetForm({ onAddBet }: BetFormProps) {
  const [sport, setSport] = useState('');
  const [league, setLeague] = useState('');
  const [event, setEvent] = useState('');
  const [betType, setBetType] = useState<BetType>('moneyline');
  const [stake, setStake] = useState('');
  const [oddsValue, setOddsValue] = useState('');
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('american');
  const [sportsbook, setSportsbook] = useState('');
  const [description, setDescription] = useState('');
  const [potentialWin, setPotentialWin] = useState<number | null>(null);

  // Auto-populate leagues based on selected sport
  useEffect(() => {
    if (sport && COMMON_LEAGUES[sport]?.length > 0) {
      setLeague(COMMON_LEAGUES[sport][0]);
    } else {
      setLeague('');
    }
  }, [sport]);

  // Calculate potential winnings
  useEffect(() => {
    if (stake && oddsValue) {
      try {
        let decimalOdds = parseFloat(oddsValue);
        if (oddsFormat === 'american') {
          decimalOdds = convertOdds.americanToDecimal(parseFloat(oddsValue));
        } else if (oddsFormat === 'fractional') {
          decimalOdds = convertOdds.fractionalToDecimal(oddsValue);
        }
        const stakeNum = parseFloat(stake);
        const winnings = stakeNum * (decimalOdds - 1);
        setPotentialWin(winnings);
      } catch {
        setPotentialWin(null);
      }
    } else {
      setPotentialWin(null);
    }
  }, [stake, oddsValue, oddsFormat]);

  const validateForm = (): boolean => {
    if (!sport || !league || !event || !betType || !stake || !oddsValue || !sportsbook) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const stakeNum = parseFloat(stake);
    if (isNaN(stakeNum) || stakeNum <= 0) {
      toast.error('Stake must be a positive number');
      return false;
    }

    const oddsNum = parseFloat(oddsValue);
    if (isNaN(oddsNum)) {
      toast.error('Invalid odds format');
      return false;
    }

    return true;
  };

  const handleQuickStake = (amount: number) => {
    setStake(amount.toString());
  };

  const handleRandomize = () => {
    const randomSport = SPORTS[Math.floor(Math.random() * SPORTS.length)];
    const randomLeagues = COMMON_LEAGUES[randomSport] || [];
    const randomLeague = randomLeagues[Math.floor(Math.random() * randomLeagues.length)] || '';
    const randomBetType = BET_TYPES[Math.floor(Math.random() * BET_TYPES.length)];
    const randomSportsbook = SPORTSBOOKS[Math.floor(Math.random() * SPORTSBOOKS.length)];
    
    setSport(randomSport);
    setLeague(randomLeague);
    setBetType(randomBetType);
    setSportsbook(randomSportsbook);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let decimalOdds = parseFloat(oddsValue);
    if (oddsFormat === 'american') {
      decimalOdds = convertOdds.americanToDecimal(parseFloat(oddsValue));
    } else if (oddsFormat === 'fractional') {
      decimalOdds = convertOdds.fractionalToDecimal(oddsValue);
    }

    onAddBet({
      sport,
      league,
      event,
      betType,
      stake: parseFloat(stake),
      odds: {
        value: decimalOdds,
        format: oddsFormat
      },
      sportsbook,
      placedAt: new Date().toISOString(),
      status: 'pending',
      description
    });

    // Reset form
    setSport('');
    setLeague('');
    setEvent('');
    setBetType('moneyline');
    setStake('');
    setOddsValue('');
    setSportsbook('');
    setDescription('');
    setPotentialWin(null);
    
    toast.success('Bet added successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="arcade-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-arcade-cyan">
          <PlusCircle className="w-6 h-6" />
          Add New Bet
        </h2>
        <button
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-2 text-arcade-yellow hover:text-arcade-cyan transition-colors"
        >
          <Dices className="w-5 h-5" />
          <span className="text-sm">Randomize</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="form-group">
          <label className="form-label">Sport</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="arcade-select w-full"
            required
          >
            <option value="">Select Sport</option>
            {SPORTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">League</label>
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="arcade-select w-full"
            required
          >
            <option value="">Select League</option>
            {sport && COMMON_LEAGUES[sport]?.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Event/Match</label>
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="arcade-input w-full"
            required
            placeholder="Lakers vs Warriors"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bet Type</label>
          <select
            value={betType}
            onChange={(e) => setBetType(e.target.value as BetType)}
            className="arcade-select w-full"
            required
          >
            {BET_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Stake Amount</label>
          <div className="space-y-2">
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="arcade-input w-full"
              required
              min="0.01"
              step="0.01"
              placeholder="100.00"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_STAKES.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickStake(amount)}
                  className="text-xs px-2 py-1 rounded bg-arcade-cyan/20 hover:bg-arcade-cyan/30 transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Odds</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={oddsValue}
              onChange={(e) => setOddsValue(e.target.value)}
              className="arcade-input"
              required
              placeholder="+150"
            />
            <select
              value={oddsFormat}
              onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
              className="arcade-select"
            >
              {ODDS_FORMATS.map(format => (
                <option key={format} value={format}>
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {potentialWin !== null && (
            <div className="mt-2 text-sm flex items-center gap-1 text-arcade-yellow">
              <Calculator className="w-4 h-4" />
              Potential win: ${potentialWin.toFixed(2)}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Sportsbook</label>
          <select
            value={sportsbook}
            onChange={(e) => setSportsbook(e.target.value)}
            className="arcade-select w-full"
            required
          >
            <option value="">Select Sportsbook</option>
            {SPORTSBOOKS.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="form-label">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="arcade-input w-full"
            rows={2}
            placeholder="Additional details about the bet..."
          />
        </div>
      </div>

      <button
        type="submit"
        className="arcade-button mt-6 w-full"
      >
        Add Bet
      </button>
    </form>
  );
}