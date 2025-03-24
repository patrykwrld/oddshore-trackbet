import React, { useState, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Download, Filter, Upload } from 'lucide-react';
import type { Bet, BetFilters } from '../types';
import { format } from 'date-fns';
import { exportToCSV, importFromCSV } from '../utils/csv';
import toast from 'react-hot-toast';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { convertOdds } from '../utils/odds';

interface BetListProps {
  bets: Bet[];
  filters: BetFilters;
  onUpdateStatus: (id: string, status: Bet['status']) => void;
  onFilterChange: (filters: BetFilters) => void;
  onImportBets?: (bets: Bet[]) => void;
}

export function BetList({ bets, filters, onUpdateStatus, onFilterChange, onImportBets }: BetListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedBets = await importFromCSV(file);
      onImportBets?.(importedBets);
      toast.success(`Successfully imported ${importedBets.length} bets`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import bets');
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const columnHelper = createColumnHelper<Bet>();

  const columns = [
    columnHelper.accessor('placedAt', {
      header: 'Date',
      cell: info => format(new Date(info.getValue()), 'MMM d, yyyy HH:mm'),
    }),
    columnHelper.accessor('sport', {
      header: 'Sport',
    }),
    columnHelper.accessor('league', {
      header: 'League',
    }),
    columnHelper.accessor('event', {
      header: 'Event',
    }),
    columnHelper.accessor('betType', {
      header: 'Type',
      cell: info => info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1),
    }),
    columnHelper.accessor('stake', {
      header: 'Stake',
      cell: info => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('odds.value', {
      header: 'Odds',
      cell: info => convertOdds.formatOdds(
        info.getValue(),
        info.row.original.odds.format
      ),
    }),
    columnHelper.accessor('sportsbook', {
      header: 'Sportsbook',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const icons = {
          pending: <Clock className="w-5 h-5 text-arcade-yellow" />,
          won: <CheckCircle className="w-5 h-5 text-green-500" />,
          lost: <XCircle className="w-5 h-5 text-red-500" />
        };
        return (
          <span className="flex items-center gap-1">
            {icons[status]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    }),
    columnHelper.accessor('profit', {
      header: 'Profit/Loss',
      cell: info => {
        const value = info.getValue();
        return (
          <span className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
            ${value.toFixed(2)}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: bets,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="arcade-card overflow-hidden">
      <div className="p-4 border-b border-arcade-cyan flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-arcade-cyan" />
          <select
            value={filters.sport}
            onChange={(e) => onFilterChange({ ...filters, sport: e.target.value })}
            className="arcade-select text-sm"
          >
            <option value="">All Sports</option>
            {Array.from(new Set(bets.map(bet => bet.sport))).map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
          <select
            value={filters.betType}
            onChange={(e) => onFilterChange({ ...filters, betType: e.target.value as any })}
            className="arcade-select text-sm"
          >
            <option value="">All Bet Types</option>
            {Array.from(new Set(bets.map(bet => bet.betType))).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="arcade-button flex items-center gap-1 text-sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => exportToCSV(bets)}
            className="arcade-button flex items-center gap-1 text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-arcade-cyan">
          <thead className="bg-arcade-dark">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-arcade-cyan uppercase tracking-wider cursor-pointer hover:bg-arcade-purple"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-arcade-cyan uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-arcade-cyan">
            {table.getRowModel().rows.map(row => (
              <tr key={row.original.id} className="hover:bg-arcade-purple/30">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {row.original.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateStatus(row.original.id, 'won')}
                        className="text-green-500 hover:text-green-400"
                      >
                        Win
                      </button>
                      <button
                        onClick={() => onUpdateStatus(row.original.id, 'lost')}
                        className="text-red-500 hover:text-red-400"
                      >
                        Loss
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}