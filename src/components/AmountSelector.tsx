import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCampaign } from '../contexts/CampaignContext';

interface AmountSelectorProps {
  onAmountChange?: (amount: number, isCustom: boolean) => void;
  selectedAmount?: number;
  customAmount?: number;
  initialAmount?: number;
}

export function AmountSelector({ onAmountChange, selectedAmount, customAmount, initialAmount }: AmountSelectorProps) {
  const campaign = useCampaign();
  const PRESET_AMOUNTS = campaign.defaultAmounts;
  
  // Determine initial state based on initialAmount from URL parameters
  const getInitialState = () => {
    if (initialAmount && initialAmount > 0) {
      // Check if initial amount matches a preset
      if (PRESET_AMOUNTS.includes(initialAmount)) {
        return { activeAmount: initialAmount, customValue: '' };
      } else {
        // Use as custom amount
        return { activeAmount: null, customValue: initialAmount.toFixed(2) };
      }
    }
    // Fallback to provided props or defaults
    return {
      activeAmount: selectedAmount || null,
      customValue: customAmount ? customAmount.toString() : ''
    };
  };
  
  const initialState = getInitialState();
  const [activeAmount, setActiveAmount] = useState<number | null>(initialState.activeAmount);
  const [customValue, setCustomValue] = useState<string>(initialState.customValue);

  const handlePresetClick = (amount: number) => {
    setActiveAmount(amount);
    setCustomValue(''); // Clear custom amount when preset is selected
    onAmountChange?.(amount, false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value) || 0;
    
    // Enforce maximum contribution limit
    if (numericValue > campaign.maxContribution) {
      setCustomValue(campaign.maxContribution.toString());
      setActiveAmount(null);
      onAmountChange?.(campaign.maxContribution, true);
      return;
    }
    
    setCustomValue(value);
    setActiveAmount(null); // Clear preset selection when custom is entered
    onAmountChange?.(numericValue, true);
  };

  return (
    <div className="amount-section space-y-4">
      <h3 className="text-lg font-semibold">Select Amount</h3>
      
      {/* Preset Amount Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={activeAmount === amount ? "default" : "outline"}
            className="h-12 text-sm font-medium"
            onClick={() => handlePresetClick(amount)}
          >
            ${amount === 1000 ? '1,000' : amount === 3500 ? '3,500' : amount}
          </Button>
        ))}
        
        {/* Custom Amount Input integrated into the grid */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            $
          </span>
          <Input
            type="number"
            placeholder="0.00"
            min="1"
            max={campaign.maxContribution.toString()}
            step="0.01"
            value={customValue}
            onChange={handleCustomAmountChange}
            className="pl-7 h-12"
          />
        </div>
      </div>

      {/* Optional: Show selected amount clearly */}
      {(activeAmount || (customValue && parseFloat(customValue) > 0)) && (
        <div className="text-sm text-muted-foreground">
          Selected: ${activeAmount ? (activeAmount === 1000 ? '1,000' : activeAmount === 3500 ? '3,500' : activeAmount) : parseFloat(customValue || '0').toFixed(2)}
        </div>
      )}
    </div>
  );
}
