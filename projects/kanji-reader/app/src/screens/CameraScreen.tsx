import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import type { RootNavigationProp } from '../navigation/types';

export default function CameraScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.primary} />
          <Text style={styles.message}>Camera access is needed to scan Kanji</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function handleCapture() {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        navigation.navigate('Results', { imageUri: photo.uri });
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.hint}>Position Japanese text in the frame</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.shutterButton, isCapturing && styles.shutterButtonDisabled]} 
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
          
          <View style={styles.spacer} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  message: {
    textAlign: 'center',
    paddingVertical: 20,
    color: colors.text,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '80%',
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    fontSize: 14,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingBottom: 48,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonDisabled: {
    opacity: 0.6,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  spacer: {
    width: 50,
  },
});
