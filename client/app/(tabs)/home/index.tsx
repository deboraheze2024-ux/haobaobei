import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://47.106.123.69:9091';

interface FeatureCard {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  route: string;
}

const features: FeatureCard[] = [
  {
    id: '1',
    title: '今日打卡',
    icon: '📋',
    color: '#F59E0B',
    description: '培养好习惯，从每日打卡开始',
    route: '/checkin',
  },
  {
    id: '2',
    title: '成长目标',
    icon: '🎯',
    color: '#8B5CF6',
    description: '设定目标，AI 帮你拆解任务',
    route: '/goals',
  },
  {
    id: '3',
    title: '话术速查',
    icon: '💬',
    color: '#10B981',
    description: '正面管教实用话术收藏',
    route: '/phrases',
  },
  {
    id: '4',
    title: '家庭会议',
    icon: '👨‍👩‍👧',
    color: '#3B82F6',
    description: '记录家庭温馨时刻',
    route: '/meeting',
  },
  {
    id: '5',
    title: '成长档案',
    icon: '📚',
    color: '#EC4899',
    description: '记录孩子成长点滴',
    route: '/profile',
  },
  {
    id: '6',
    title: '父母园地',
    icon: '🌱',
    color: '#6366F1',
    description: '学习心得与复盘记录',
    route: '/parenting',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>你好，</Text>
          <Text style={styles.title}>好宝贝用户</Text>
          <Text style={styles.subtitle}>正面管教，陪伴成长</Text>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🌟 每天进步一点点，成为更好的父母
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>核心功能</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, { borderLeftColor: feature.color }]}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>后端服务: {API_BASE}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#EA580C',
    marginTop: 8,
  },
  banner: {
    backgroundColor: '#EA580C',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  featureDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
