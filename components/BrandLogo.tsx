import { StyleSheet, Text, View } from 'react-native'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

const SIZE_MAP = {
  sm: {
    title: 18,
    tagline: 10,
  },
  md: {
    title: 22,
    tagline: 11,
  },
  lg: {
    title: 30,
    tagline: 12,
  },
} as const

export function BrandLogo({ size = 'md', showTagline = false }: BrandLogoProps) {
  const metrics = SIZE_MAP[size]

  return (
    <View>
      <Text style={[styles.title, { fontSize: metrics.title }]}>Cleanify<Text style={styles.titleAccent}>Go</Text></Text>
      {showTagline ? (
        <Text style={[styles.tagline, { fontSize: metrics.tagline }]}>Trusted cleaners, anytime.</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    color: '#0f172a',
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  titleAccent: {
    color: '#0ea5d6',
  },
  tagline: {
    color: '#0ea5d6',
    fontWeight: '600',
    marginTop: 2,
  },
})