import { Bet, BetType, OddsFormat } from '../types';
import { format, parse } from 'date-fns';

export const exportToCSV = (bets: Bet[]): void => {
  const headers = [
    'Date',
    'Sport',
    'League',
    'Event',
    'Bet Type',
    'Stake',
    'Odds',
    'Sportsbook',
    'Status',
    'Profit',
    'Description'
  ].join(',');

  const rows = bets.map(bet => [
    format(new Date(bet.placedAt), 'yyyy-MM-dd HH:mm:ss'),
    bet.sport,
    bet.league,
    bet.event,
    bet.betType,
    bet.stake,
    bet.odds.value,
    bet.sportsbook,
    bet.status,
    bet.profit,
    `"${bet.description.replace(/"/g, '""')}"`
  ].join(','));

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `betting-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const importFromCSV = async (file: File): Promise<Bet[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const bets: Bet[] = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            const bet: Bet = {
              id: crypto.randomUUID(),
              sport: values[1],
              league: values[2],
              event: values[3],
              betType: values[4] as BetType,
              stake: parseFloat(values[5]),
              odds: {
                value: parseFloat(values[6]),
                format: 'decimal' as OddsFormat
              },
              sportsbook: values[7],
              placedAt: format(
                parse(values[0], 'yyyy-MM-dd HH:mm:ss', new Date()),
                'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''
              ),
              status: values[8] as 'pending' | 'won' | 'lost',
              profit: parseFloat(values[9]),
              description: values[10]?.replace(/^"|"$/g, '').replace(/""/g, '"') || ''
            };
            return bet;
          });
        
        resolve(bets);
      } catch (error) {
        reject(new Error('Failed to parse CSV file. Please ensure the file format is correct.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsText(file);
  });
};