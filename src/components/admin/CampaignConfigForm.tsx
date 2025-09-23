import React, { useState, useEffect } from 'react';
import { CampaignConfig } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, RotateCcw, Download, Upload } from 'lucide-react';

interface CampaignConfigFormProps {
  initialConfig: CampaignConfig;
  onConfigChange: (config: CampaignConfig) => void;
  className?: string;
}

export function CampaignConfigForm({ initialConfig, onConfigChange, className = "" }: CampaignConfigFormProps) {
  const [config, setConfig] = useState<CampaignConfig>(initialConfig);
  const [isDirty, setIsDirty] = useState(false);

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

  const handleApply = () => {
    onConfigChange(config);
    setIsDirty(false);
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
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Campaign Configuration</h3>
        <div className="flex gap-2">
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
          >
            <Upload className="w-4 h-4 mr-2" />
            Load
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!isDirty}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleApply} disabled={!isDirty}>
            <Save className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["basic"]} className="w-full">
        {/* Basic Information */}
        <AccordionItem value="basic">
          <AccordionTrigger className="text-base font-semibold">
            Basic Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Sarah Johnson"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Campaign Name</Label>
                <Input
                  id="fullName"
                  value={config.fullName}
                  onChange={(e) => updateConfig({ fullName: e.target.value })}
                  placeholder="Sarah Johnson for Senate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={config.tagline}
                  onChange={(e) => updateConfig({ tagline: e.target.value })}
                  placeholder="Fighting for working families"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={config.website}
                  onChange={(e) => updateConfig({ website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => updateConfig({ contactEmail: e.target.value })}
                  placeholder="hello@example.com"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Address Information */}
        <AccordionItem value="address">
          <AccordionTrigger className="text-base font-semibold">
            Address Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => updateConfig({ address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={config.city}
                  onChange={(e) => updateConfig({ city: e.target.value })}
                  placeholder="Anytown"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={config.state}
                  onChange={(e) => updateConfig({ state: e.target.value })}
                  placeholder="NY"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={config.zipCode}
                  onChange={(e) => updateConfig({ zipCode: e.target.value })}
                  placeholder="12345"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Branding */}
        <AccordionItem value="branding">
          <AccordionTrigger className="text-base font-semibold">
            Branding & Visual Identity
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={config.logoUrl}
                  onChange={(e) => updateConfig({ logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoAlt">Logo Alt Text</Label>
                <Input
                  id="logoAlt"
                  value={config.logoAlt}
                  onChange={(e) => updateConfig({ logoAlt: e.target.value })}
                  placeholder="Campaign Logo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  type="url"
                  value={config.faviconUrl || ''}
                  onChange={(e) => updateConfig({ faviconUrl: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  value={config.primaryColor || ''}
                  onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                  placeholder="#1e40af"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Page Content */}
        <AccordionItem value="content">
          <AccordionTrigger className="text-base font-semibold">
            Page Content & Messaging
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="headerContent">Header Content (Markdown)</Label>
                <Textarea
                  id="headerContent"
                  value={config.headerContent}
                  onChange={(e) => updateConfig({ headerContent: e.target.value })}
                  placeholder="# Campaign Message&#10;&#10;Your campaign's message here..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input
                    id="pageTitle"
                    value={config.pageTitle || ''}
                    onChange={(e) => updateConfig({ pageTitle: e.target.value })}
                    placeholder="Donate | Campaign Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Input
                    id="metaDescription"
                    value={config.metaDescription || ''}
                    onChange={(e) => updateConfig({ metaDescription: e.target.value })}
                    placeholder="Support our campaign"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customFooterText">Footer Text</Label>
                <Textarea
                  id="customFooterText"
                  value={config.customFooterText || ''}
                  onChange={(e) => updateConfig({ customFooterText: e.target.value })}
                  placeholder="Help support our campaign..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationSuccessMessage">Success Message</Label>
                <Textarea
                  id="donationSuccessMessage"
                  value={config.donationSuccessMessage || ''}
                  onChange={(e) => updateConfig({ donationSuccessMessage: e.target.value })}
                  placeholder="Thank you for your support!"
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Donation Settings */}
        <AccordionItem value="donations">
          <AccordionTrigger className="text-base font-semibold">
            Donation Settings
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="defaultAmounts">Default Amounts (comma-separated)</Label>
                <Input
                  id="defaultAmounts"
                  value={config.defaultAmounts.join(', ')}
                  onChange={(e) => handleDefaultAmountsChange(e.target.value)}
                  placeholder="25, 50, 100, 250, 500, 1000, 3500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxContribution">Maximum Contribution</Label>
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

        {/* Legal Information */}
        <AccordionItem value="legal">
          <AccordionTrigger className="text-base font-semibold">
            Legal & Compliance
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name</Label>
                <Input
                  id="legalName"
                  value={config.legalName}
                  onChange={(e) => updateConfig({ legalName: e.target.value })}
                  placeholder="Campaign Committee Inc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecId">FEC ID (optional)</Label>
                <Input
                  id="fecId"
                  value={config.fecId || ''}
                  onChange={(e) => updateConfig({ fecId: e.target.value })}
                  placeholder="C00123456"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Unsaved Changes:</strong> You have unsaved changes. Click "Apply Changes" to see them in the preview above.
          </p>
        </div>
      )}
    </div>
  );
}
