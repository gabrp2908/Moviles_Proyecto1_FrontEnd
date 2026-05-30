import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function BackgroundWrapper({ children, style }) {
  return (
    <ImageBackground 
      source={require('../../assets/images/background.jpg')} 
      style={styles.background}
      resizeMode="repeat"
    >
      <View style={[styles.overlay, style]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    // You can add a semi-transparent overlay if needed to make text readable
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
});
