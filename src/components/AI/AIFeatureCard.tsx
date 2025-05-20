import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface AIFeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
  badges?: string[];
}

export function AIFeatureCard({ icon: Icon, title, description, badges }: AIFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 