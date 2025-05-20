import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { FiSettings, FiKey, FiShield } from 'react-icons/fi';

interface AIConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  apiKey: string;
  saveHistory: boolean;
  privateMode: boolean;
}

export const ConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    apiKey: '',
    saveHistory: true,
    privateMode: false,
  });

  const handleConfigChange = <K extends keyof AIConfig>(
    key: K,
    value: AIConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configurações</h3>
        <Button variant="outline" size="sm">
          <FiSettings className="h-4 w-4 mr-2" />
          Restaurar Padrões
        </Button>
      </div>

      <Tabs defaultValue="model" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="model">Modelo</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperatura</Label>
                <span className="text-sm text-muted-foreground">
                  {config.temperature}
                </span>
              </div>
              <Slider
                value={[config.temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) =>
                  handleConfigChange('temperature', value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Controla a criatividade das respostas. Valores mais altos geram respostas mais diversas.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Top P</Label>
                <span className="text-sm text-muted-foreground">
                  {config.topP}
                </span>
              </div>
              <Slider
                value={[config.topP]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => handleConfigChange('topP', value)}
              />
              <p className="text-xs text-muted-foreground">
                Controla a diversidade do texto gerado. Valores mais baixos tornam o texto mais focado.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Máximo de Tokens</Label>
                <span className="text-sm text-muted-foreground">
                  {config.maxTokens}
                </span>
              </div>
              <Slider
                value={[config.maxTokens]}
                min={256}
                max={4096}
                step={256}
                onValueChange={([value]) =>
                  handleConfigChange('maxTokens', value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Limite máximo de tokens por resposta.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiKey className="h-4 w-4 text-muted-foreground" />
                <Label>Chave da API</Label>
              </div>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Sua chave da API será criptografada e armazenada com segurança.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Switch
                  checked={config.saveHistory}
                  onCheckedChange={(checked) =>
                    handleConfigChange('saveHistory', checked)
                  }
                />
                <div className="space-y-1">
                  <Label>Salvar Histórico</Label>
                  <p className="text-sm text-muted-foreground">
                    Mantenha um histórico das suas conversas para referência futura.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Switch
                  checked={config.privateMode}
                  onCheckedChange={(checked) =>
                    handleConfigChange('privateMode', checked)
                  }
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label>Modo Privado</Label>
                    <FiShield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Não salve nenhum dado da conversa localmente ou na nuvem.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 