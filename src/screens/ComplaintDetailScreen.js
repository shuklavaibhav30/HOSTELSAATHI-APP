import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { ArrowLeft, Home, Calendar, Image as ImageIcon, X, ShieldAlert, UserCheck } from 'lucide-react-native';
import { getComplaintById } from '../api/complaintApi';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusHistoryTimeline } from '../components/StatusHistoryTimeline';
import { Loader } from '../components/Loader';
import { COLORS } from '../constants/colors';

export const ComplaintDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getComplaintById(id);
        if (res?.data) {
          setComplaint(res.data);
        }
      } catch (err) {
        console.error('Fetch complaint detail error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return <Loader message="Loading complaint details..." />;
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Complaint Not Found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedId = complaint?._id
    ? `#${complaint._id.toString().slice(-6).toUpperCase()}`
    : '#UNKNOWN';

  const formattedDate = complaint?.createdAt
    ? new Date(complaint.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBackBtn}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Complaint Details</Text>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>{formattedId}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status & Header Summary Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <CategoryBadge category={complaint?.category} />
            <StatusBadge status={complaint?.status} />
          </View>

          <Text style={styles.title}>{complaint?.title}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Home size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{complaint?.hostel}, Room {complaint?.roomNumber}</Text>
            </View>

            <View style={styles.metaItem}>
              <Calendar size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{complaint?.description}</Text>
        </View>

        {/* Proof Images Gallery */}
        {complaint?.proofImages && complaint.proofImages.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Attached Evidence ({complaint.proofImages.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {complaint.proofImages.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setPreviewImage(img.url)}
                  activeOpacity={0.85}
                  style={styles.galleryItem}
                >
                  <Image source={{ uri: img.url }} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Status History Timeline */}
        <StatusHistoryTimeline history={complaint?.statusHistory} />

        {/* Warden & Administration Contact Info */}
        <View style={styles.card}>
          <View style={styles.adminHeader}>
            <UserCheck size={18} color={COLORS.primary} />
            <Text style={styles.adminTitle}>Assigned Administration</Text>
          </View>
          <Text style={styles.adminText}>
            This complaint is assigned to the Warden of <Text style={styles.highlightText}>{complaint?.hostel}</Text>. Official notifications will be sent to your registered college email address.
          </Text>
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setPreviewImage(null)}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.fullPreviewImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBackBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topBarTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  idBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  idBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 12,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  metaGrid: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeading: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  descriptionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  galleryScroll: {
    gap: 10,
  },
  galleryItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  adminText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  fullPreviewImage: {
    width: '90%',
    height: '75%',
  },
});
