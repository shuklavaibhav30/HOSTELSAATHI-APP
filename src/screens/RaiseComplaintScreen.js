import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Send, AlertCircle, Home } from 'lucide-react-native';
import { CustomDropdown } from '../components/CustomDropdown';
import { CameraViewfinderModal } from './CameraViewfinderModal';
import { ComplaintSuccessModal } from '../components/ComplaintSuccessModal';
import { createComplaint } from '../api/complaintApi';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

// Categories matching backend complaint.model.js ["electricity", "plumbing", "mess", "furniture", "internet", "other"]
const CATEGORIES = [
  'Electricity',
  'Plumbing',
  'Mess',
  'Furniture',
  'Internet / Wi-Fi',
  'Other'
];

export const RaiseComplaintScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle image selected from Live Camera Viewfinder
  const handleCameraCapture = (imageUri) => {
    if (selectedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 proof images per complaint.');
      return;
    }
    setSelectedImages((prev) => [...prev, imageUri]);
  };

  // Handle image selected from Photo Gallery
  const handlePickFromGallery = async () => {
    if (selectedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 proof images per complaint.');
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Gallery access permission is required to select proof photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedImages.length,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...uris].slice(0, 5));
      }
    } catch (error) {
      Alert.alert('Gallery Error', 'Failed to select image from gallery.');
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const mapCategoryToBackend = (catName) => {
    const norm = (catName || '').toLowerCase();
    if (norm.includes('electr')) return 'electricity';
    if (norm.includes('plumb')) return 'plumbing';
    if (norm.includes('mess')) return 'mess';
    if (norm.includes('furn')) return 'furniture';
    if (norm.includes('net') || norm.includes('wi-fi')) return 'internet';
    return 'other';
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!category) {
      setErrorMsg('Please select a complaint category.');
      return;
    }
    if (!roomNumber.trim()) {
      setErrorMsg('Please enter your room number.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a brief title for your complaint.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide details in the description field.');
      return;
    }

    try {
      setLoading(true);

      const backendCategory = mapCategoryToBackend(category);

      const formData = new FormData();
      formData.append('category', backendCategory);
      formData.append('roomNumber', roomNumber.trim());
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      // Append proof images
      selectedImages.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `proof_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('proofImages', {
          uri,
          name: filename,
          type,
        });
      });

      const res = await createComplaint(formData);
      const newId = res?.data?._id || '';
      setSubmittedId(newId);

      // Show Complaint Submitted Screen with animated checkmark
      setSuccessModalVisible(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint. Please check connection.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDoneSuccess = () => {
    setSuccessModalVisible(false);
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setSelectedImages([]);
    setSubmittedId('');
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Title Banner */}
          <View style={styles.headerBanner}>
            <Text style={styles.headerTitle}>Lodge New Grievance</Text>
            <Text style={styles.headerSub}>Submit your hostel issue directly to hostel administration</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Category Dropdown */}
            <CustomDropdown
              label="Complaint Category"
              options={CATEGORIES}
              value={category}
              onSelect={setCategory}
              placeholder="Select category (e.g. Electricity)"
            />

            {/* Room Number */}
            <View style={styles.field}>
              <Text style={styles.label}>Room Number</Text>
              <View style={styles.inputBox}>
                <Home size={18} color={COLORS.textMuted} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 302"
                  placeholderTextColor={COLORS.textMuted}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                />
              </View>
            </View>

            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.label}>Complaint Title</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ceiling fan regulator not working"
                  placeholderTextColor={COLORS.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Detailed Description</Text>
              <View style={[styles.inputBox, styles.textAreaBox]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the issue clearly..."
                  placeholderTextColor={COLORS.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Image Attachments Section */}
            <View style={styles.field}>
              <Text style={styles.label}>Proof / Evidence Photos ({selectedImages.length}/5)</Text>

              <View style={styles.mediaButtonsRow}>
                {/* Live Camera Button */}
                <TouchableOpacity
                  style={styles.cameraActionBtn}
                  onPress={() => setCameraModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Camera size={18} color="#ffffff" />
                  <Text style={styles.cameraActionText}>CLICK PICTURE</Text>
                </TouchableOpacity>

                {/* Gallery Upload Button */}
                <TouchableOpacity
                  style={styles.galleryActionBtn}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                >
                  <ImageIcon size={18} color={COLORS.primary} />
                  <Text style={styles.galleryActionText}>UPLOAD IMAGE</Text>
                </TouchableOpacity>
              </View>

              {/* Image Previews Grid */}
              {selectedImages.length > 0 ? (
                <View style={styles.imageGrid}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageThumbContainer}>
                      <Image source={{ uri }} style={styles.imageThumb} />
                      <TouchableOpacity
                        style={styles.removeBadge}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <X size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Submit Grievance Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Send size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Submit Grievance</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Live Camera Viewfinder Modal ("CLICK PICTURE") */}
      <CameraViewfinderModal
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
        onCapture={handleCameraCapture}
      />

      {/* Animated Complaint Submitted Success Screen */}
      <ComplaintSuccessModal
        visible={successModalVisible}
        complaintId={submittedId}
        onDone={handleDoneSuccess}
      />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  headerBanner: {
    gap: 4,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
  },
  textAreaBox: {
    height: 100,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: '100%',
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cameraActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 46,
    gap: 8,
  },
  cameraActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  galleryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
    height: 46,
    gap: 8,
  },
  galleryActionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  imageThumbContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    padding: 10,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
