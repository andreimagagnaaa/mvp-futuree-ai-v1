import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SettingsProps {
  className?: string;
}

export const Settings: React.FC<SettingsProps> = ({ className }) => {
  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div>
        <h2 className="text-lg font-medium mb-4">Configurações da IA</h2>
        
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Temperatura</Label>
            <Slider
              defaultValue={[0.7]}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Controla a criatividade das respostas (0 = mais focado, 1 = mais criativo)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Top P</Label>
            <Slider
              defaultValue={[0.9]}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Controla a diversidade das respostas
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Privacidade</h2>
        
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Salvar histórico</Label>
              <p className="text-sm text-muted-foreground">
                Manter histórico de conversas
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Modo privado</Label>
              <p className="text-sm text-muted-foreground">
                Não compartilhar dados para melhorias
              </p>
            </div>
            <Switch />
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Tokens e Créditos</h2>
        
        <Card className="p-4 space-y-4">
          <div>
            <Label>Tokens Disponíveis</Label>
            <p className="text-2xl font-bold">5,000</p>
            <p className="text-sm text-muted-foreground">
              Renovação em: 7 dias
            </p>
          </div>

          <div>
            <Label>Uso este mês</Label>
            <div className="h-2 bg-muted rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: '45%' }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              2,250 / 5,000 tokens usados
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}; 