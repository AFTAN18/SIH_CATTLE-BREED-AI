import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, Signal, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from './AccessibilityProvider';

interface NetworkStatus {
  online: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface FieldWorkerSettings {
  lowDataMode: boolean;
  offlineMode: boolean;
  voiceGuidance: boolean;
  simplifiedUI: boolean;
  autoSave: boolean;
  batteryOptimization: boolean;
}

export const FieldWorkerOptimizations: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });
  
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);
  const [settings, setSettings] = useState<FieldWorkerSettings>({
    lowDataMode: false,
    offlineMode: false,
    voiceGuidance: true,
    simplifiedUI: false,
    autoSave: true,
    batteryOptimization: false
  });

  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('field_worker_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load field worker settings:', error);
      }
    }

    // Monitor network status
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      });
    };

    // Monitor battery status
    const updateBatteryStatus = async () => {
      try {
        const battery = await (navigator as any).getBattery?.();
        if (battery) {
          setBatteryStatus({
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          });

          // Add battery event listeners
          battery.addEventListener('levelchange', updateBatteryStatus);
          battery.addEventListener('chargingchange', updateBatteryStatus);
        }
      } catch (error) {
        console.log('Battery API not supported');
      }
    };

    // Event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();
    updateBatteryStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  useEffect(() => {
    // Save settings
    localStorage.setItem('field_worker_settings', JSON.stringify(settings));

    // Apply optimizations based on settings
    applyOptimizations();
  }, [settings]);

  useEffect(() => {
    // Auto-enable optimizations based on conditions
    const shouldOptimize = 
      !networkStatus.online || 
      networkStatus.effectiveType === 'slow-2g' || 
      networkStatus.effectiveType === '2g' ||
      (batteryStatus && batteryStatus.level < 0.2);

    if (shouldOptimize && !settings.batteryOptimization) {
      setSettings(prev => ({
        ...prev,
        batteryOptimization: true,
        lowDataMode: true
      }));
      
      announceToScreenReader('Battery optimization enabled due to low battery or poor connection');
    }
  }, [networkStatus, batteryStatus, settings.batteryOptimization, announceToScreenReader]);

  const applyOptimizations = () => {
    const root = document.documentElement;

    // Low data mode
    if (settings.lowDataMode) {
      root.classList.add('low-data-mode');
    } else {
      root.classList.remove('low-data-mode');
    }

    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }

    // Battery optimization
    if (settings.batteryOptimization) {
      root.classList.add('battery-optimization');
      // Reduce screen brightness
      document.body.style.filter = 'brightness(0.8)';
    } else {
      root.classList.remove('battery-optimization');
      document.body.style.filter = '';
    }
  };

  const updateSetting = (key: keyof FieldWorkerSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    announceToScreenReader(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const getNetworkIcon = () => {
    if (!networkStatus.online) return <WifiOff className="w-4 h-4 text-red-500" />;
    
    switch (networkStatus.effectiveType) {
      case '4g':
        return <Signal className="w-4 h-4 text-green-500" />;
      case '3g':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case '2g':
      case 'slow-2g':
        return <Signal className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBatteryIcon = () => {
    if (!batteryStatus) return null;
    
    const level = batteryStatus.level;
    const charging = batteryStatus.charging;
    
    let color = 'text-green-500';
    if (level < 0.2) color = 'text-red-500';
    else if (level < 0.5) color = 'text-yellow-500';
    
    return (
      <div className={`flex items-center ${color}`}>
        <Battery className="w-4 h-4" />
        <span className="text-xs ml-1">
          {Math.round(level * 100)}%{charging && '⚡'}
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Field Worker Mode
          <div className="flex items-center space-x-2">
            {getNetworkIcon()}
            {getBatteryIcon()}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Network Status</span>
            {networkStatus.online ? (
              <span className="text-green-600 text-xs">Online</span>
            ) : (
              <span className="text-red-600 text-xs">Offline</span>
            )}
          </div>
          {networkStatus.online && (
            <div className="text-xs text-gray-600">
              <div>Type: {networkStatus.effectiveType}</div>
              {networkStatus.downlink > 0 && (
                <div>Speed: {networkStatus.downlink} Mbps</div>
              )}
            </div>
          )}
        </div>

        {/* Battery Status */}
        {batteryStatus && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Battery</span>
              <span className="text-xs">
                {Math.round(batteryStatus.level * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  batteryStatus.level > 0.5 ? 'bg-green-500' :
                  batteryStatus.level > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${batteryStatus.level * 100}%` }}
              />
            </div>
            {batteryStatus.charging && (
              <div className="text-xs text-green-600 mt-1">Charging</div>
            )}
          </div>
        )}

        {/* Optimization Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="low-data" className="text-sm font-medium">
              Low Data Mode
            </label>
            <Switch
              id="low-data"
              checked={settings.lowDataMode}
              onCheckedChange={(checked) => updateSetting('lowDataMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="offline-mode" className="text-sm font-medium">
              Offline Mode
            </label>
            <Switch
              id="offline-mode"
              checked={settings.offlineMode}
              onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="voice-guidance" className="text-sm font-medium">
              Voice Guidance
            </label>
            <Switch
              id="voice-guidance"
              checked={settings.voiceGuidance}
              onCheckedChange={(checked) => updateSetting('voiceGuidance', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="simplified-ui" className="text-sm font-medium">
              Simplified UI
            </label>
            <Switch
              id="simplified-ui"
              checked={settings.simplifiedUI}
              onCheckedChange={(checked) => updateSetting('simplifiedUI', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="auto-save" className="text-sm font-medium">
              Auto Save
            </label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="battery-opt" className="text-sm font-medium">
              Battery Optimization
            </label>
            <Switch
              id="battery-opt"
              checked={settings.batteryOptimization}
              onCheckedChange={(checked) => updateSetting('batteryOptimization', checked)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  lowDataMode: true,
                  batteryOptimization: true,
                  simplifiedUI: true
                }));
                announceToScreenReader('Field mode activated');
              }}
            >
              <Sun className="w-4 h-4 mr-1" />
              Field Mode
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  lowDataMode: false,
                  batteryOptimization: false,
                  simplifiedUI: false
                }));
                announceToScreenReader('Normal mode activated');
              }}
            >
              <Moon className="w-4 h-4 mr-1" />
              Normal Mode
            </Button>
          </div>
        </div>

        {/* Data Usage Indicator */}
        <div className="text-xs text-gray-500 text-center">
          {settings.lowDataMode && (
            <div className="text-green-600">⚡ Data saving active</div>
          )}
          {settings.offlineMode && (
            <div className="text-blue-600">📱 Offline mode enabled</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// CSS for field worker optimizations
export const fieldWorkerStyles = `
  .low-data-mode img,
  .low-data-mode video {
    filter: blur(1px);
    transform: scale(0.9);
  }
  
  .low-data-mode .bg-gradient-to-br,
  .low-data-mode .bg-gradient-to-r {
    background: #f3f4f6 !important;
  }
  
  .simplified-ui .card,
  .simplified-ui .btn {
    border-radius: 4px !important;
    box-shadow: none !important;
  }
  
  .simplified-ui .text-sm {
    font-size: 1rem !important;
  }
  
  .battery-optimization * {
    animation: none !important;
    transition: none !important;
  }
  
  .battery-optimization .bg-gradient-to-br,
  .battery-optimization .bg-gradient-to-r {
    background: #1f2937 !important;
    color: #f9fafb !important;
  }
  
  @media (max-width: 768px) {
    .field-worker-mode .container {
      padding: 0.5rem !important;
    }
    
    .field-worker-mode .card {
      margin: 0.25rem !important;
    }
    
    .field-worker-mode button {
      min-height: 44px !important;
      font-size: 1rem !important;
    }
  }
`;

export default FieldWorkerOptimizations;
