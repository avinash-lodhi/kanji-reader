import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import type { RootNavigationProp } from '../navigation/types';

export const ImageUploadScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const processImage = () => {
    if (!image) return;
    navigation.navigate('Results', { imageUri: image });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Kanji Image</Text>
      <Text style={styles.subtitle}>
        Select an image from your gallery to scan for Kanji.
      </Text>

      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title={image ? "Change Image" : "Select from Gallery"} 
          onPress={pickImage} 
          variant="secondary"
          style={styles.button}
        />
        
        {image && (
          <Button 
            title="Process Kanji" 
            onPress={processImage} 
            variant="primary"
            style={styles.button}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing[6],
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square container
    marginBottom: spacing[8],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: fontSizes.base,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing[4],
  },
  button: {
    width: '100%',
  },
});
