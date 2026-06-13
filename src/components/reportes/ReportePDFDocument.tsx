import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica', fontWeight: 'normal' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
})

const colors = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  accent: '#0ea5e9',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  muted: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
  },
  // Cover page
  coverPage: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  coverLogo: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 40,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  coverLine: {
    width: 120,
    height: 3,
    backgroundColor: colors.accent,
    marginBottom: 32,
  },
  coverInfo: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 1.8,
  },
  coverDate: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 60,
  },
  // Header / Footer
  header: {
    position: 'absolute',
    top: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    fontSize: 8,
    color: colors.muted,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    fontSize: 8,
    color: colors.muted,
  },
  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
    marginTop: 12,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 16,
  },
  sectionLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.accent,
    marginBottom: 16,
  },
  // Standard block
  standardBlock: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  standardCode: {
    fontSize: 8,
    color: colors.secondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  standardName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  // Table
  table: {
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 22,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: colors.primary,
    borderBottomWidth: 0,
  },
  tableHeaderCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
    padding: '4 6',
  },
  tableCell: {
    fontSize: 8,
    padding: '4 6',
    color: '#1e293b',
  },
  colCodigo: { width: '10%' },
  colIndicador: { width: '32%' },
  colValor: { width: '14%' },
  colReferencial: { width: '14%' },
  colEstado: { width: '14%' },
  colTendencia: { width: '16%' },
  // Compliance badges
  badgeCumple: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.success,
    backgroundColor: '#f0fdf4',
    padding: '2 6',
    borderRadius: 4,
    textAlign: 'center',
  },
  badgeNoCumple: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.danger,
    backgroundColor: '#fef2f2',
    padding: '2 6',
    borderRadius: 4,
    textAlign: 'center',
  },
  badgeSinCalcular: {
    fontSize: 7,
    color: colors.muted,
    backgroundColor: '#f1f5f9',
    padding: '2 6',
    borderRadius: 4,
    textAlign: 'center',
  },
  // Analysis
  analysisContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  analysisCard: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analysisNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  analysisLabel: {
    fontSize: 8,
    color: colors.muted,
    textAlign: 'center',
  },
  // Improvement plan
  improvementItem: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff7ed',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  improvementCode: {
    width: '10%',
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.warning,
  },
  improvementDesc: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  improvementAction: {
    width: '30%',
    fontSize: 8,
    color: colors.muted,
    textAlign: 'right',
  },
  // TOC
  tocItem: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tocNumber: {
    width: '10%',
    fontSize: 10,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  tocTitle: {
    flex: 1,
    fontSize: 10,
    color: '#1e293b',
  },
  tocDots: {
    fontSize: 10,
    color: colors.border,
  },
  tocPage: {
    width: '10%',
    fontSize: 10,
    color: colors.muted,
    textAlign: 'right',
  },
  // Tendencia
  tendenciaUp: { color: colors.success, fontSize: 8, fontWeight: 'bold' },
  tendenciaDown: { color: colors.danger, fontSize: 8, fontWeight: 'bold' },
  tendenciaStable: { color: colors.muted, fontSize: 8 },
})

function IndicadorRow({ indicador, registro, registroAnterior }: any) {
  let tendenciaLabel = '—'
  let tendenciaStyle = styles.tendenciaStable

  if (registro && registroAnterior) {
    const diff = Number(registro.valorCalculado) - Number(registroAnterior.valorCalculado)
    if (diff > 0.5) {
      tendenciaLabel = `↗ +${diff.toFixed(1)}`
      tendenciaStyle = styles.tendenciaUp
    } else if (diff < -0.5) {
      tendenciaLabel = `↘ ${diff.toFixed(1)}`
      tendenciaStyle = styles.tendenciaDown
    } else {
      tendenciaLabel = '→ Estable'
      tendenciaStyle = styles.tendenciaStable
    }
  }

  const estado = !registro ? 'Sin calcular' : registro.cumpleReferencial ? 'Cumple' : 'No cumple'
  const badgeStyle = !registro ? styles.badgeSinCalcular : registro.cumpleReferencial ? styles.badgeCumple : styles.badgeNoCumple

  return (
    <View style={styles.tableRow} wrap={false}>
      <Text style={[styles.tableCell, styles.colCodigo]}>{indicador.codigo}</Text>
      <Text style={[styles.tableCell, styles.colIndicador]}>{indicador.nombre}</Text>
      <Text style={[styles.tableCell, styles.colValor]}>{registro ? Number(registro.valorCalculado).toFixed(2) : '—'}</Text>
      <Text style={[styles.tableCell, styles.colReferencial]}>{indicador.valorReferencial}</Text>
      <View style={[styles.colEstado, { padding: '4 6' }]}>
        <Text style={badgeStyle}>{estado}</Text>
      </View>
      <Text style={[styles.tableCell, styles.colTendencia, tendenciaStyle]}>{tendenciaLabel}</Text>
    </View>
  )
}

export function ReportePDFDocument({ data }: any) {
  const { carrera, periodo, estandares, totalIndicadores, indicadoresCumplen, indicadoresNoCumplen, indicadoresSinCalcular, fechaGeneracion } = data

  return (
    <Document title={`Reporte SINEACE - ${carrera.nombre}`} author="Sistema de Acreditación UNT" subject="Reporte Oficial de Indicadores SINEACE">
      {/* ========== PORTADA ========== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverLogo}>Universidad Nacional de Trujillo</Text>
          <Text style={styles.coverTitle}>Sistema de Gestión de Acreditación</Text>
          <Text style={styles.coverSubtitle}>Reporte Oficial de Indicadores SINEACE</Text>
          <View style={styles.coverLine} />
          <Text style={styles.coverInfo}>
            Modelo CONEAU 2025{'\n'}
            Resolución N.° 000106-2025-SINEACE/COSUSINEACE-P{'\n\n'}
            Carrera: {carrera.nombre} ({carrera.codigo}){'\n'}
            Facultad: {carrera.facultad.nombre}{'\n'}
            Periodo: {periodo}
          </Text>
          <Text style={styles.coverDate}>
            Generado el: {fechaGeneracion}
          </Text>
        </View>
      </Page>

      {/* ========== ÍNDICE ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>UNT — Sistema de Gestión de Acreditación</Text>
        <Text style={styles.sectionTitle}>Índice</Text>
        <View style={styles.sectionLine} />
        <View style={{ marginTop: 24 }}>
          {[
            { num: '1', title: 'Resultados por Estándar' },
            { num: '2', title: 'Análisis de Cumplimiento Global' },
            { num: '3', title: 'Plan de Mejoras para Indicadores Deficientes' },
          ].map((item) => (
            <View key={item.num} style={styles.tocItem}>
              <Text style={styles.tocNumber}>{item.num}</Text>
              <Text style={styles.tocTitle}>{item.title}</Text>
              <Text style={styles.tocDots}>{'. '.repeat(40)}</Text>
              <Text style={styles.tocPage}>{Number(item.num) + 1}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>Reporte SINEACE — {carrera.nombre}</Text>
      </Page>

      {/* ========== RESULTADOS POR ESTÁNDAR ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>UNT — Sistema de Gestión de Acreditación</Text>
        <Text style={styles.sectionTitle}>1. Resultados por Estándar</Text>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionSubtitle}>
          Desglose de los 29 indicadores del Modelo CONEAU 2025 agrupados por estándar. Periodo: {periodo}
        </Text>

        {estandares.map((estandar: any) => (
          <View key={estandar.id} style={styles.standardBlock} wrap={false}>
            <Text style={styles.standardCode}>Estándar {estandar.codigo}</Text>
            <Text style={styles.standardName}>{estandar.nombre}</Text>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableHeaderCell, styles.colCodigo]}>Cód.</Text>
                <Text style={[styles.tableHeaderCell, styles.colIndicador]}>Indicador</Text>
                <Text style={[styles.tableHeaderCell, styles.colValor]}>Valor Calc.</Text>
                <Text style={[styles.tableHeaderCell, styles.colReferencial]}>Ref.</Text>
                <Text style={[styles.tableHeaderCell, styles.colEstado]}>Estado</Text>
                <Text style={[styles.tableHeaderCell, styles.colTendencia]}>Tendencia</Text>
              </View>
              {estandar.indicadores.map((indicador: any) => (
                <IndicadorRow
                  key={indicador.id}
                  indicador={indicador}
                  registro={indicador.registroActual}
                  registroAnterior={indicador.registroAnterior}
                />
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>Reporte SINEACE — {carrera.nombre}</Text>
      </Page>

      {/* ========== ANÁLISIS DE CUMPLIMIENTO GLOBAL ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>UNT — Sistema de Gestión de Acreditación</Text>
        <Text style={styles.sectionTitle}>2. Análisis de Cumplimiento Global</Text>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionSubtitle}>
          Resumen del estado de cumplimiento de los 29 indicadores SINEACE para la carrera {carrera.nombre} en el periodo {periodo}.
        </Text>

        <View style={styles.analysisContainer}>
          <View style={[styles.analysisCard, { borderLeftColor: colors.success, borderLeftWidth: 3 }]}>
            <Text style={[styles.analysisNumber, { color: colors.success }]}>{indicadoresCumplen}</Text>
            <Text style={styles.analysisLabel}>Cumplen</Text>
          </View>
          <View style={[styles.analysisCard, { borderLeftColor: colors.danger, borderLeftWidth: 3 }]}>
            <Text style={[styles.analysisNumber, { color: colors.danger }]}>{indicadoresNoCumplen}</Text>
            <Text style={styles.analysisLabel}>No cumplen</Text>
          </View>
          <View style={[styles.analysisCard, { borderLeftColor: colors.muted, borderLeftWidth: 3 }]}>
            <Text style={[styles.analysisNumber, { color: colors.muted }]}>{indicadoresSinCalcular}</Text>
            <Text style={styles.analysisLabel}>Sin calcular</Text>
          </View>
        </View>

        <View style={{ marginTop: 8, padding: 12, backgroundColor: colors.background, borderRadius: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
            Resumen
          </Text>
          <Text style={{ fontSize: 9, lineHeight: 1.6, color: '#1e293b' }}>
            De un total de {totalIndicadores} indicadores obligatorios del Modelo CONEAU 2025:
            {'\n'}• {indicadoresCumplen} indicadores ({totalIndicadores > 0 ? ((indicadoresCumplen / totalIndicadores) * 100).toFixed(1) : 0}%) cumplen con el valor referencial establecido.
            {'\n'}• {indicadoresNoCumplen} indicadores ({totalIndicadores > 0 ? ((indicadoresNoCumplen / totalIndicadores) * 100).toFixed(1) : 0}%) NO alcanzan el valor mínimo requerido.
            {'\n'}• {indicadoresSinCalcular} indicadores aún no han sido calculados para este periodo.
            {'\n\n'}
            Porcentaje global de cumplimiento: {totalIndicadores > 0 ? ((indicadoresCumplen / totalIndicadores) * 100).toFixed(1) : 0}%
          </Text>
        </View>

        <Text style={styles.footer}>Reporte SINEACE — {carrera.nombre}</Text>
      </Page>

      {/* ========== PLAN DE MEJORAS ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>UNT — Sistema de Gestión de Acreditación</Text>
        <Text style={styles.sectionTitle}>3. Plan de Mejoras</Text>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionSubtitle}>
          Acciones correctivas para los indicadores que no cumplen el valor referencial.
        </Text>

        {estandares.flatMap((estandar: any) =>
          estandar.indicadores
            .filter((ind: any) => ind.registroActual && !ind.registroActual.cumpleReferencial)
            .map((indicador: any) => (
              <View key={indicador.id} style={styles.improvementItem} wrap={false}>
                <Text style={styles.improvementCode}>{indicador.codigo}</Text>
                <Text style={styles.improvementDesc}>
                  {indicador.nombre}{'\n'}
                  <Text style={{ fontSize: 7, color: colors.muted }}>
                    Actual: {Number(indicador.registroActual.valorCalculado).toFixed(2)} | Meta: {indicador.valorReferencial}
                  </Text>
                </Text>
                <Text style={styles.improvementAction}>
                  Revisar variables y{'\n'}fuente de datos
                </Text>
              </View>
            ))
        )}

        {estandares.every((est: any) =>
          est.indicadores.every((ind: any) => !ind.registroActual || ind.registroActual.cumpleReferencial)
        ) && (
          <View style={{ padding: 20, alignItems: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: colors.success, fontWeight: 'bold' }}>
              No se requieren mejoras
            </Text>
            <Text style={{ fontSize: 9, color: colors.muted, marginTop: 4 }}>
              Todos los indicadores evaluados cumplen con el valor referencial.
            </Text>
          </View>
        )}

        <Text style={styles.footer}>Reporte SINEACE — {carrera.nombre}</Text>
      </Page>
    </Document>
  )
}
