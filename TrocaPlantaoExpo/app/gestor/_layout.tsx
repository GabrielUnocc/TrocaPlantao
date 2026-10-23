import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GestorProvider, useGestor } from '@/hooks/use-gestor';

function GestorTabs() {
  const { trocas } = useGestor();
  const pendentes = trocas.filter((t) => t.status === 'pendente').length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2775F6',
        tabBarInactiveTintColor: '#596579',
        tabBarStyle: {
          backgroundColor: '#162030',
          borderTopColor: '#1E2A38',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="aprovacoes"
        options={{
          title: 'Aprovações',
          tabBarBadge: pendentes > 0 ? pendentes : undefined,
          tabBarBadgeStyle: { backgroundColor: '#F5A623', color: '#0F1923' },
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="equipe"
        options={{
          title: 'Equipe',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.3.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function GestorLayout() {
  return (
    <GestorProvider>
      <GestorTabs />
    </GestorProvider>
  );
}
