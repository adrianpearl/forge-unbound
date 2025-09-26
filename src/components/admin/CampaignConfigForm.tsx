import React, { useState, useEffect } from 'react';
import { CampaignConfig } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ColorPicker } from '@/components/ui/color-picker';
import { Save, RotateCcw, Download, Upload, Link } from 'lucide-react';

interface CampaignConfigFormProps {
  initialConfig: CampaignConfig;
  onConfigChange: (config: CampaignConfig) => Promise<void> | void;
  className?: string;
}

export function CampaignConfigForm({ initialConfig, onConfigChange, className = "" }: CampaignConfigFormProps) {
  const [config, setConfig] = useState<CampaignConfig>(initialConfig);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update local state when initialConfig changes
  useEffect(() => {
    setConfig(initialConfig);
    setIsDirty(false);
  }, [initialConfig]);

  const updateConfig = (updates: Partial<CampaignConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setIsDirty(true);
  };

  const handleApply = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onConfigChange(config);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(initialConfig);
    setIsDirty(false);
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${config.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedConfig = JSON.parse(e.target?.result as string);
        setConfig(loadedConfig);
        setIsDirty(true);
      } catch (error) {
        console.error('Error loading config:', error);
        alert('Error loading config file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDefaultAmountsChange = (value: string) => {
    try {
      const amounts = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      updateConfig({ defaultAmounts: amounts });
    } catch (error) {
      // Invalid format, keep current value
    }
  };

  return (
<div className={`space-y-6 ${className}`} id="donation-config">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-medium space-x-2">
          <span>Configuration</span>
          <a href='/#donation-config'><Link className="inline size-5 text-blue-500 hover:text-blue-700" /></a>
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleLoad}
            className="hidden"
            id="load-config"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('load-config')?.click()}
            className="text-xs sm:text-sm"
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Load</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            className="text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            disabled={!isDirty}
            className="text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!isDirty || isSaving}
            size="sm"
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Apply Changes'}</span>
            <span className="sm:hidden">{isSaving ? '...' : 'Apply'}</span>
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["donations", "content"]} className="w-full">
        {/* Donation Settings */}
        <AccordionItem value="donations">
          <AccordionTrigger className="text-base font-semibold">
            Donation Amounts & Limits
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 px-1">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="defaultAmounts">Preset Amounts (comma-separated, in dollars)</Label>
                <Input
                  id="defaultAmounts"
                  value={config.defaultAmounts.join(', ')}
                  onChange={(e) => handleDefaultAmountsChange(e.target.value)}
                  placeholder="25, 50, 100, 250, 500, 1000, 3500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxContribution">Maximum Contribution ($)</Label>
                <Input
                  id="maxContribution"
                  type="number"
                  value={config.maxContribution}
                  onChange={(e) => updateConfig({ maxContribution: parseInt(e.target.value) || 3500 })}
                  placeholder="3500"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Page Content & Messaging */}
        <AccordionItem value="content">
          <AccordionTrigger className="text-base font-semibold">
            Page Content & Messaging
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 px-1">
              <div className="space-y-2">
                <Label htmlFor="headerContent">Donation Page Message (Markdown supported)</Label>
                <Textarea
                  id="headerContent"
                  value={config.headerContent}
                  onChange={(e) => updateConfig({ headerContent: e.target.value })}
                  placeholder="# Help Us Win\n\nYour support makes the difference in this critical race..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageTitle">Browser Tab Title</Label>
                  <Input
                    id="pageTitle"
                    value={config.pageTitle || ''}
                    onChange={(e) => updateConfig({ pageTitle: e.target.value })}
                    placeholder="Donate | Sarah Johnson for Senate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donationSuccessMessage">Thank You Message</Label>
                  <Input
                    id="donationSuccessMessage"
                    value={config.donationSuccessMessage || ''}
                    onChange={(e) => updateConfig({ donationSuccessMessage: e.target.value })}
                    placeholder="Thank you for your support!"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Visual Customization */}
        <AccordionItem value="branding">
          <AccordionTrigger className="text-base font-semibold">
            Visual Customization
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 px-1">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <ColorPicker
                  value={config.primaryColor || '#1e40af'}
                  onChange={(color) => updateConfig({ primaryColor: color })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Campaign Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={config.logoUrl}
                  onChange={(e) => updateConfig({ logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Unsaved Changes:</strong> You have unsaved changes. Click "Apply Changes" to save them and see them in the preview.
          </p>
        </div>
      )}
      
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Save Failed:</strong> {saveError}
          </p>
        </div>
      )}
    </div>
  );
}
