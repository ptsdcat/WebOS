import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Wifi, WifiOff, Lock, Globe, Smartphone, Router, Shield, Signal } from 'lucide-react';

interface NetworkInterface {
  id: string;
  name: string;
  type: 'wifi' | 'ethernet' | 'cellular';
  status: 'connected' | 'disconnected' | 'connecting';
  signal?: number;
  encryption?: 'WPA2' | 'WPA3' | 'Open';
  speed?: string;
  ip?: string;
}

interface VPNConnection {
  id: string;
  name: string;
  server: string;
  status: 'connected' | 'disconnected';
  protocol: 'OpenVPN' | 'WireGuard' | 'IKEv2';
}

export const NetworkManager: FC = () => {
  const [networks, setNetworks] = useState<NetworkInterface[]>([]);
  const [vpnConnections, setVpnConnections] = useState<VPNConnection[]>([]);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'wifi' | 'ethernet' | 'vpn' | 'firewall'>('wifi');

  useEffect(() => {
    loadNetworks();
    loadVPNConnections();
  }, []);

  const loadNetworks = () => {
    const mockNetworks: NetworkInterface[] = [
      {
        id: '1',
        name: 'Home WiFi',
        type: 'wifi',
        status: 'connected',
        signal: 85,
        encryption: 'WPA3',
        speed: '867 Mbps',
        ip: '192.168.1.100'
      },
      {
        id: '2',
        name: 'Office Network',
        type: 'wifi',
        status: 'disconnected',
        signal: 65,
        encryption: 'WPA2'
      },
      {
        id: '3',
        name: 'Public WiFi',
        type: 'wifi',
        status: 'disconnected',
        signal: 40,
        encryption: 'Open'
      },
      {
        id: '4',
        name: 'Ethernet',
        type: 'ethernet',
        status: 'disconnected',
        speed: '1 Gbps'
      }
    ];
    setNetworks(mockNetworks);
  };

  const loadVPNConnections = () => {
    const mockVPNs: VPNConnection[] = [
      {
        id: '1',
        name: 'NordVPN',
        server: 'us-server-1.nordvpn.com',
        status: 'disconnected',
        protocol: 'WireGuard'
      },
      {
        id: '2',
        name: 'ExpressVPN',
        server: 'uk-server-2.expressvpn.com',
        status: 'disconnected',
        protocol: 'OpenVPN'
      }
    ];
    setVpnConnections(mockVPNs);
  };

  const scanNetworks = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      loadNetworks();
    }, 2000);
  };

  const connectToNetwork = (networkId: string) => {
    setNetworks(prev => prev.map(network => 
      network.id === networkId 
        ? { ...network, status: 'connecting' as const }
        : network
    ));

    setTimeout(() => {
      setNetworks(prev => prev.map(network => 
        network.id === networkId 
          ? { ...network, status: 'connected' as const, ip: '192.168.1.101' }
          : { ...network, status: 'disconnected' as const, ip: undefined }
      ));
    }, 2000);
  };

  const getSignalIcon = (signal?: number) => {
    if (!signal) return <WifiOff className="h-4 w-4" />;
    if (signal > 75) return <Signal className="h-4 w-4 text-green-500" />;
    if (signal > 50) return <Signal className="h-4 w-4 text-yellow-500" />;
    return <Signal className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary">Connecting...</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Network Manager</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'wifi' ? 'default' : 'outline'}
            onClick={() => setActiveTab('wifi')}
            size="sm"
          >
            <Wifi className="h-4 w-4 mr-2" />
            WiFi
          </Button>
          <Button
            variant={activeTab === 'ethernet' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ethernet')}
            size="sm"
          >
            <Router className="h-4 w-4 mr-2" />
            Ethernet
          </Button>
          <Button
            variant={activeTab === 'vpn' ? 'default' : 'outline'}
            onClick={() => setActiveTab('vpn')}
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            VPN
          </Button>
          <Button
            variant={activeTab === 'firewall' ? 'default' : 'outline'}
            onClick={() => setActiveTab('firewall')}
            size="sm"
          >
            <Lock className="h-4 w-4 mr-2" />
            Firewall
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'wifi' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Available Networks</h2>
              <Button onClick={scanNetworks} disabled={scanning} size="sm">
                {scanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>

            {scanning && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Scanning for networks...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {networks.filter(n => n.type === 'wifi').map((network) => (
                <Card key={network.id} className="hover:bg-accent cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSignalIcon(network.signal)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{network.name}</span>
                            {network.encryption !== 'Open' && <Lock className="h-3 w-3" />}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {network.encryption} • Signal: {network.signal}%
                            {network.speed && ` • ${network.speed}`}
                            {network.ip && ` • ${network.ip}`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(network.status)}
                        {network.status === 'disconnected' && (
                          <Button 
                            size="sm" 
                            onClick={() => connectToNetwork(network.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ethernet' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Wired Connections</h2>
            
            {networks.filter(n => n.type === 'ethernet').map((network) => (
              <Card key={network.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Router className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{network.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {network.speed && `Speed: ${network.speed}`}
                          {network.ip && ` • ${network.ip}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(network.status)}
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'vpn' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">VPN Connections</h2>
              <Button size="sm">Add VPN</Button>
            </div>

            <div className="space-y-2">
              {vpnConnections.map((vpn) => (
                <Card key={vpn.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{vpn.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vpn.server} • {vpn.protocol}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(vpn.status)}
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'firewall' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Firewall Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Firewall Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable Firewall</span>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Block Incoming Connections</span>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Stealth Mode</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Blocked Connections</span>
                      <span>127 today</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Usage</span>
                      <span>2.3 GB today</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};