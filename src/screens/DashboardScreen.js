import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, RefreshCw, Home, Sparkles, Clock, CheckCircle2, FileText } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getStudentComplaints } from '../api/complaintApi';
import { ComplaintCard } from '../components/ComplaintCard';
import { FilterBar } from '../components/FilterBar';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { COLORS } from '../constants/colors';

// In-memory cache to guarantee zero-latency rendering when switching tabs or reopening dashboard
let cachedComplaints = null;

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();

  const [complaints, setComplaints] = useState(cachedComplaints || []);
  const [loading, setLoading] = useState(!cachedComplaints);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    let salutation = 'Hello';
    let emoji = '✨';

    if (hour >= 5 && hour < 12) {
      salutation = 'Good Morning';
      emoji = '🌅';
    } else if (hour >= 12 && hour < 17) {
      salutation = 'Good Afternoon';
      emoji = '☀️';
    } else if (hour >= 17 && hour < 22) {
      salutation = 'Good Evening';
      emoji = '🌆';
    } else {
      salutation = 'Late Night Desk';
      emoji = '🌙';
    }

    const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
    return { text: `${salutation}, ${firstName}`, emoji, subtitle: 'HostelSaathi Dashboard' };
  };

  const greeting = getDynamicGreeting();

  const fetchComplaints = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else if (!cachedComplaints) setLoading(true);

      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await getStudentComplaints(params);
      if (res?.data) {
        setComplaints(res.data);
        cachedComplaints = res.data; // Store in memory cache
      }
    } catch (err) {
      console.error('Fetch complaints error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [selectedStatus, selectedCategory])
  );

  const handleRefresh = useCallback(() => {
    fetchComplaints(true);
  }, [selectedStatus, selectedCategory]);

  // Memoize filtered results to prevent CPU spikes during fast scrolling with 500+ items
  const filteredComplaints = useMemo(() => {
    if (!searchQuery.trim()) return complaints;
    const q = searchQuery.toLowerCase().trim();
    return complaints.filter((item) => {
      const formattedId = item._id ? `#${item._id.toString().slice(-6).toLowerCase()}` : '';
      return (
        item.title?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.roomNumber?.toString().includes(q) ||
        formattedId.includes(q)
      );
    });
  }, [complaints, searchQuery]);

  // Calculate metrics
  const totalCount = complaints.length;
  const pendingCount = useMemo(() => complaints.filter(c => c.status === 'pending').length, [complaints]);
  const resolvedCount = useMemo(() => complaints.filter(c => c.status === 'resolved').length, [complaints]);

  // Memoized renderItem for FlatList high-frequency scrolling efficiency
  const renderItem = useCallback(({ item }) => (
    <ComplaintCard
      complaint={item}
      onPress={() => navigation.navigate('ComplaintDetail', { id: item._id })}
    />
  ), [navigation]);

  const keyExtractor = useCallback((item) => item._id, []);

  // Responsive font size
  const isSmallScreen = windowWidth < 360;
  const titleFontSize = isSmallScreen ? 14 : windowWidth < 480 ? 15 : 17;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Navbar with official AKGEC & HostelSaathi branding */}
        <Header />

        {/* Dynamic Glassmorphic Welcome Banner */}
        <Animated.View style={[styles.welcomeBanner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.welcomeLeft}>
            <View style={styles.avatarPill}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </Text>
            </View>
            <View style={styles.greetingTextGroup}>
              <Text style={[styles.greetingTitle, { fontSize: titleFontSize }]} numberOfLines={1}>
                {greeting.text} {greeting.emoji}
              </Text>
              <View style={styles.taglineRow}>
                <Sparkles size={12} color={COLORS.primary} />
                <Text style={styles.greetingSub} numberOfLines={1}>{greeting.subtitle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.hostelBadge}>
            <Home size={12} color={COLORS.primary} />
            <Text style={styles.hostelBadgeText} numberOfLines={1}>
              {user?.hostel}, Rm {user?.roomNumber}
            </Text>
          </View>
        </Animated.View>

        {/* Quick Stats Overview Section */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={[styles.statCard, styles.statCardTotal]}>
            <View style={styles.statTop}>
              <FileText size={16} color={COLORS.primary} />
              <Text style={styles.statNumber}>{totalCount}</Text>
            </View>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPending]}>
            <View style={styles.statTop}>
              <Clock size={16} color={COLORS.pending} />
              <Text style={[styles.statNumber, { color: COLORS.pending }]}>{pendingCount}</Text>
            </View>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, styles.statCardResolved]}>
            <View style={styles.statTop}>
              <CheckCircle2 size={16} color={COLORS.resolved} />
              <Text style={[styles.statNumber, { color: COLORS.resolved }]}>{resolvedCount}</Text>
            </View>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </Animated.View>

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Complaints Feed with High-Scalability Virtualization Settings */}
        {loading && !refreshing ? (
          <Loader message="Fetching grievances..." />
        ) : (
          <FlatList
            data={filteredComplaints}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <RefreshCw size={36} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No Complaints Found</Text>
                <Text style={styles.emptySub}>
                  {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
                    ? 'No grievances match your applied search filter.'
                    : 'You have not submitted any complaints yet.'}
                </Text>

                <TouchableOpacity
                  style={styles.newGrievanceBtn}
                  onPress={() => navigation.navigate('RaiseComplaint')}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color="#ffffff" />
                  <Text style={styles.newGrievanceText}>Raise New Complaint</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 4,
  },
  avatarPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  greetingTextGroup: {
    flex: 1,
    gap: 2,
  },
  greetingTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  hostelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    gap: 4,
    flexShrink: 0,
  },
  hostelBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statCardTotal: {
    backgroundColor: '#ffffff',
  },
  statCardPending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  statCardResolved: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    marginTop: 40,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  newGrievanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  newGrievanceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
