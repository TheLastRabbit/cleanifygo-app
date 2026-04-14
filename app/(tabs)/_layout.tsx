import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'

function TabIcon({ name }: { name: React.ComponentProps<typeof FontAwesome>['name'] }) {
  return (props: { color: string }) => (
    <FontAwesome size={22} style={{ marginBottom: -3 }} name={name} color={props.color} />
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { borderTopColor: '#e2e8f0' },
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: '#0f172a', fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: TabIcon({ name: 'briefcase' }),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: TabIcon({ name: 'comments' }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: TabIcon({ name: 'user' }),
        }}
      />
    </Tabs>
  )
}
