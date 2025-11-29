// ============================================================================
// ICARUS v6.0 - MOBILE APP (React Native + Expo SDK 50)
// ============================================================================

// ==================== app.json (Expo Config) ====================
/*
{
  "expo": {
    "name": "ICARUS Mobile",
    "slug": "icarus-mobile",
    "version": "6.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#0a0a0f" },
    "assetBundlePatterns": ["**/*"],
    "ios": { "supportsTablet": true, "bundleIdentifier": "br.com.icarus.mobile" },
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#0a0a0f" }, "package": "br.com.icarus.mobile" },
    "plugins": ["expo-router", "expo-secure-store"],
    "scheme": "icarus"
  }
}
*/

// ==================== app/_layout.tsx ====================
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0f' } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="cirurgia/[id]" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

// ==================== app/(tabs)/_layout.tsx ====================
import { Tabs } from 'expo-router';
import { Home, Calendar, Package, MessageCircle, Settings } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#12121a', borderTopColor: 'rgba(255,255,255,0.1)', height: 80, paddingBottom: 20 },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#64748b',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="cirurgias" options={{ title: 'Cirurgias', tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} />
      <Tabs.Screen name="estoque" options={{ title: 'Estoque', tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'IcarusBrain', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Config', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}

// ==================== app/(tabs)/index.tsx (Dashboard) ====================
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { KPICard } from '../../components/ui/KPICard';
import { AlertList } from '../../components/AlertList';
import { useDashboard } from '../../hooks/useDashboard';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { kpis, alerts, cirurgiasHoje, loading, refetch } = useDashboard();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 8 }}>Dashboard</Text>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <KPICard title="Cirurgias Hoje" value={kpis?.cirurgiasHoje || 0} trend={kpis?.trendCirurgias} icon="calendar" color="blue" style={{ flex: 1 }} />
          <KPICard title="Alertas" value={kpis?.alertasPendentes || 0} icon="alert-triangle" color={kpis?.alertasPendentes > 5 ? 'red' : 'amber'} style={{ flex: 1 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <KPICard title="Estoque Crítico" value={kpis?.estoqueCritico || 0} icon="package" color="red" style={{ flex: 1 }} />
          <KPICard title="Faturamento" value={`R$ ${(kpis?.faturamentoMes || 0).toLocaleString('pt-BR')}`} trend={kpis?.trendFaturamento} icon="dollar-sign" color="green" style={{ flex: 1 }} />
        </View>

        <GlassCard style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 12 }}>Cirurgias de Hoje</Text>
          {cirurgiasHoje?.map((c: any) => (
            <View key={c.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <View>
                <Text style={{ color: '#f8fafc', fontWeight: '500' }}>{c.procedimento}</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{c.hospital?.nome} • {c.medico?.nome}</Text>
              </View>
              <Text style={{ color: '#3b82f6' }}>{c.hora_prevista?.slice(0, 5)}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 12 }}>Alertas Recentes</Text>
          <AlertList alerts={alerts?.slice(0, 5) || []} />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== app/(tabs)/cirurgias.tsx ====================
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { useCirurgias } from '../../hooks/useCirurgias';
import { Calendar, MapPin, User } from 'lucide-react-native';

const statusColors: Record<string, string> = { agendada: '#3b82f6', confirmada: '#22c55e', em_andamento: '#f59e0b', concluida: '#14b8a6', cancelada: '#ef4444' };

export default function Cirurgias() {
  const router = useRouter();
  const { cirurgias, loading } = useCirurgias();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#f8fafc' }}>Cirurgias</Text>
      </View>
      <FlatList
        data={cirurgias}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/cirurgia/${item.id}`)}>
            <GlassCard style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '600', flex: 1 }}>{item.procedimento}</Text>
                <Badge text={item.status} color={statusColors[item.status] || '#64748b'} />
              </View>
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="#94a3b8" />
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(item.data_agendamento).toLocaleDateString('pt-BR')} às {item.hora_prevista?.slice(0, 5)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="#94a3b8" />
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>{item.hospital?.nome}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <User size={14} color="#94a3b8" />
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>Dr. {item.medico?.nome}</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// ==================== app/(tabs)/estoque.tsx ====================
import { FlatList, View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { useEstoque } from '../../hooks/useEstoque';
import { Search, Package, AlertTriangle } from 'lucide-react-native';

export default function Estoque() {
  const [search, setSearch] = useState('');
  const { produtos, alertas, loading } = useEstoque();
  const filtered = produtos?.filter((p: any) => p.nome.toLowerCase().includes(search.toLowerCase()) || p.codigo.includes(search)) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 16 }}>Estoque</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 12 }}>
          <Search size={20} color="#64748b" />
          <TextInput placeholder="Buscar produto..." placeholderTextColor="#64748b" value={search} onChangeText={setSearch} style={{ flex: 1, padding: 12, color: '#f8fafc' }} />
        </View>
        {alertas.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
            <AlertTriangle size={16} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontSize: 13 }}>{alertas.length} produto(s) com estoque crítico</Text>
          </View>
        )}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.produto_id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <GlassCard style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '600' }}>{item.nome}</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{item.codigo} • ANVISA: {item.registro_anvisa || 'N/A'}</Text>
              </View>
              <Badge text={item.status_estoque === 'normal' ? 'OK' : item.status_estoque === 'sem_estoque' ? 'Sem Estoque' : 'Crítico'} color={item.status_estoque === 'normal' ? '#22c55e' : '#ef4444'} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <View>
                <Text style={{ color: '#64748b', fontSize: 11 }}>Disponível</Text>
                <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '700' }}>{item.quantidade_disponivel}</Text>
              </View>
              <View>
                <Text style={{ color: '#64748b', fontSize: 11 }}>Reservado</Text>
                <Text style={{ color: '#f59e0b', fontSize: 18, fontWeight: '700' }}>{item.quantidade_reservada}</Text>
              </View>
              <View>
                <Text style={{ color: '#64748b', fontSize: 11 }}>Mínimo</Text>
                <Text style={{ color: '#94a3b8', fontSize: 18, fontWeight: '700' }}>{item.estoque_minimo}</Text>
              </View>
            </View>
          </GlassCard>
        )}
      />
    </SafeAreaView>
  );
}

// ==================== app/(tabs)/chat.tsx (IcarusBrain) ====================
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useIcarusBrain } from '../../hooks/useIcarusBrain';
import { Send, Bot, User } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Chat() {
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, loading, sendMessage } = useIcarusBrain();

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#f8fafc' }}>IcarusBrain</Text>
        <Text style={{ color: '#64748b', fontSize: 13 }}>Assistente IA do ICARUS</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Animated.View entering={FadeInUp} style={{ flexDirection: 'row', gap: 8, justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {item.role === 'assistant' && <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }}><Bot size={18} color="#fff" /></View>}
            <GlassCard style={{ maxWidth: '80%', padding: 12, backgroundColor: item.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)' }}>
              <Text style={{ color: '#f8fafc', fontSize: 14, lineHeight: 20 }}>{item.content}</Text>
            </GlassCard>
            {item.role === 'user' && <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#fff" /></View>}
          </Animated.View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Digite sua mensagem..." placeholderTextColor="#64748b" onSubmitEditing={handleSend}
            style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#f8fafc', fontSize: 15 }} />
          <TouchableOpacity onPress={handleSend} disabled={loading || !input.trim()}
            style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: loading ? '#1e293b' : '#3b82f6', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== components/ui/GlassCard.tsx ====================
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface GlassCardProps { children: React.ReactNode; style?: ViewStyle; elevated?: boolean; animated?: boolean; }

export function GlassCard({ children, style, elevated, animated }: GlassCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { if (animated) scale.value = withSpring(0.98); };
  const handlePressOut = () => { if (animated) scale.value = withSpring(1); };

  return (
    <Animated.View style={[styles.container, elevated && styles.elevated, style, animated && animatedStyle]} onTouchStart={handlePressIn} onTouchEnd={handlePressOut}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 8 },
  content: { position: 'relative', zIndex: 1 },
});

// ==================== components/ui/KPICard.tsx ====================
import { View, Text, ViewStyle } from 'react-native';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Calendar, Package, AlertTriangle, DollarSign } from 'lucide-react-native';

const icons: Record<string, any> = { calendar: Calendar, package: Package, 'alert-triangle': AlertTriangle, 'dollar-sign': DollarSign };
const colors: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', amber: '#f59e0b', red: '#ef4444', cyan: '#14b8a6' };

interface KPICardProps { title: string; value: string | number; trend?: number; icon?: string; color?: string; style?: ViewStyle; }

export function KPICard({ title, value, trend, icon, color = 'blue', style }: KPICardProps) {
  const Icon = icon ? icons[icon] : null;
  const accentColor = colors[color] || colors.blue;

  return (
    <GlassCard style={style}>
      <View style={{ height: 3, backgroundColor: accentColor }} />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{title}</Text>
          {Icon && <View style={{ padding: 6, borderRadius: 8, backgroundColor: `${accentColor}20` }}><Icon size={16} color={accentColor} /></View>}
        </View>
        <Text style={{ color: '#f8fafc', fontSize: 28, fontWeight: '700' }}>{value}</Text>
        {trend !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {trend > 0 ? <TrendingUp size={14} color="#22c55e" /> : <TrendingDown size={14} color="#ef4444" />}
            <Text style={{ color: trend > 0 ? '#22c55e' : '#ef4444', fontSize: 12 }}>{trend > 0 ? '+' : ''}{trend}%</Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

// ==================== components/ui/Badge.tsx ====================
import { View, Text } from 'react-native';

interface BadgeProps { text: string; color?: string; }

export function Badge({ text, color = '#3b82f6' }: BadgeProps) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: `${color}20` }}>
      <Text style={{ color, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{text.replace('_', ' ')}</Text>
    </View>
  );
}

// ==================== hooks/useDashboard.ts ====================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cirurgiasHoje, setCirurgiasHoje] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const hoje = new Date().toISOString().split('T')[0];
    
    const [cirurgiasRes, alertasRes, estoqueRes] = await Promise.all([
      supabase.from('cirurgias').select('*, hospital:hospitais(*), medico:medicos(*)').eq('data_agendamento', hoje),
      supabase.from('alertas_financeiros').select('*').in('status', ['novo', 'em_analise']).limit(10),
      supabase.from('vw_estoque').select('*').neq('status_estoque', 'normal'),
    ]);

    setCirurgiasHoje(cirurgiasRes.data || []);
    setAlerts(alertasRes.data || []);
    setKpis({
      cirurgiasHoje: cirurgiasRes.data?.length || 0,
      alertasPendentes: alertasRes.data?.length || 0,
      estoqueCritico: estoqueRes.data?.length || 0,
      faturamentoMes: 0, // Calculate from faturas
      trendCirurgias: 12,
      trendFaturamento: 8,
    });
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { kpis, alerts, cirurgiasHoje, loading, refetch };
}

// ==================== hooks/useCirurgias.ts & useEstoque.ts & useIcarusBrain.ts ====================
// Same as web version, adapted for React Native (see lib/index.ts)
