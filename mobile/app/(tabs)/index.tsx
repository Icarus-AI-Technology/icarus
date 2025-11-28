/**
 * ICARUS Mobile - Dashboard
 * 
 * Tela principal com KPIs e atalhos.
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { Colors } from '../../constants/Colors'
import { useCirurgiasHoje, useProximaCirurgia } from '../../hooks/useCirurgias'
import { useVoice } from '../../hooks/useVoice'

export default function DashboardScreen() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'dark']
  
  const { data: cirurgiasHoje, isLoading: loadingCirurgias } = useCirurgiasHoje()
  const { data: proximaCirurgia } = useProximaCirurgia()
  const { isListening, startListening, stopListening, speak } = useVoice()

  const styles = createStyles(colors)

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header com botão de voz */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Instrumentador</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={handleVoiceToggle}
        >
          <Ionicons 
            name={isListening ? 'mic' : 'mic-outline'} 
            size={24} 
            color={isListening ? '#FFF' : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* KPIs */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Ionicons name="medical" size={24} color={colors.primary} />
          <Text style={styles.kpiValue}>
            {loadingCirurgias ? '-' : cirurgiasHoje?.length || 0}
          </Text>
          <Text style={styles.kpiLabel}>Cirurgias Hoje</Text>
        </View>

        <View style={styles.kpiCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.kpiValue}>
            {cirurgiasHoje?.filter(c => c.status === 'concluida').length || 0}
          </Text>
          <Text style={styles.kpiLabel}>Concluídas</Text>
        </View>

        <View style={styles.kpiCard}>
          <Ionicons name="time" size={24} color={colors.warning} />
          <Text style={styles.kpiValue}>
            {cirurgiasHoje?.filter(c => c.status === 'em_andamento').length || 0}
          </Text>
          <Text style={styles.kpiLabel}>Em Andamento</Text>
        </View>

        <View style={styles.kpiCard}>
          <Ionicons name="alert-circle" size={24} color={colors.danger} />
          <Text style={styles.kpiValue}>3</Text>
          <Text style={styles.kpiLabel}>Alertas</Text>
        </View>
      </View>

      {/* Próxima Cirurgia */}
      {proximaCirurgia && (
        <Link href={`/cirurgia/${proximaCirurgia.id}`} asChild>
          <TouchableOpacity style={styles.nextSurgeryCard}>
            <View style={styles.nextSurgeryHeader}>
              <View style={styles.nextSurgeryBadge}>
                <Text style={styles.nextSurgeryBadgeText}>PRÓXIMA</Text>
              </View>
              <Text style={styles.nextSurgeryTime}>
                {proximaCirurgia.hora_inicio}
              </Text>
            </View>
            <Text style={styles.nextSurgeryPatient}>
              {proximaCirurgia.paciente?.nome || 'Paciente'}
            </Text>
            <Text style={styles.nextSurgeryProcedure}>
              {proximaCirurgia.procedimento}
            </Text>
            <View style={styles.nextSurgeryFooter}>
              <Text style={styles.nextSurgeryDoctor}>
                Dr. {proximaCirurgia.medico?.nome || 'Médico'}
              </Text>
              <Text style={styles.nextSurgeryHospital}>
                {proximaCirurgia.hospital?.nome_fantasia || 'Hospital'}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      )}

      {/* Ações Rápidas */}
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      <View style={styles.actionsGrid}>
        <Link href="/scanner" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="barcode" size={28} color={colors.primary} />
            <Text style={styles.actionText}>Scanner</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => speak('Consultando kit da próxima cirurgia')}
        >
          <Ionicons name="cube" size={28} color={colors.primary} />
          <Text style={styles.actionText}>Kit OPME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text" size={28} color={colors.primary} />
          <Text style={styles.actionText}>Relatório</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call" size={28} color={colors.primary} />
          <Text style={styles.actionText}>Suporte</Text>
        </TouchableOpacity>
      </View>

      {/* Comandos de Voz */}
      <Text style={styles.sectionTitle}>Comandos de Voz</Text>
      <View style={styles.voiceHints}>
        <Text style={styles.voiceHint}>• "Próxima cirurgia"</Text>
        <Text style={styles.voiceHint}>• "Kit da cirurgia"</Text>
        <Text style={styles.voiceHint}>• "Confirmar uso"</Text>
        <Text style={styles.voiceHint}>• "Verificar estoque"</Text>
      </View>
    </ScrollView>
  )
}

const createStyles = (colors: typeof Colors.dark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 4,
  },
  voiceButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  voiceButtonActive: {
    backgroundColor: colors.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginTop: 4,
  },
  nextSurgeryCard: {
    margin: 20,
    marginTop: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  nextSurgeryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextSurgeryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextSurgeryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  nextSurgeryTime: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  nextSurgeryPatient: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  nextSurgeryProcedure: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 4,
  },
  nextSurgeryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextSurgeryDoctor: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  nextSurgeryHospital: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginTop: 8,
  },
  voiceHints: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  voiceHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
})

