import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
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
          title: 'Trocas',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="arrow.2.squarepath" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="criar"
        options={{
          title: 'Criar',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="plus.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="minhas-trocas"
        options={{
          title: 'Minhas Trocas',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="demo" options={{ href: null }} />
    </Tabs>
  );
}
