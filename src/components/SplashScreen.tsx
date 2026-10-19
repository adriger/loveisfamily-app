import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const splashImages = [
  require('../../assets/splash/splash-1.png'),
  require('../../assets/splash/splash-2.png'),
  require('../../assets/splash/splash-3.png'),
  require('../../assets/splash/splash-4.png'),
  require('../../assets/splash/splash-5.png'),
  require('../../assets/splash/splash-6.png'),
  require('../../assets/splash/splash-7.png'),
  require('../../assets/splash/splash-8.png'),
  require('../../assets/splash/splash-9.png'),
  require('../../assets/splash/splash-final.png'),
];

interface SplashScreenComponentProps {
  onFinish: () => void;
}

export const SplashScreenComponent: React.FC<SplashScreenComponentProps> = ({ onFinish }) => {
  const { width, height } = Dimensions.get('window');
  const currentImageIndex = useRef(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    let timeout: NodeJS.Timeout;

    const animateToNextImage = () => {
      if (!isMounted) return;

      // Fade out current image
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;

        currentImageIndex.current = (currentImageIndex.current + 1) % splashImages.length;

        // Fade in next image
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Check if we're at the final image
        if (currentImageIndex.current === splashImages.length - 1) {
          // Wait 2 seconds on final image, then finish
          timeout = setTimeout(() => {
            if (isMounted) {
              onFinish();
            }
          }, 2000);
        } else {
          // Move to next image after 500ms
          timeout = setTimeout(animateToNextImage, 500);
        }
      });
    };

    // Start animation after 500ms
    timeout = setTimeout(animateToNextImage, 500);

    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [opacityAnim, onFinish]);

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Animated.Image
        source={splashImages[currentImageIndex.current]}
        style={{
          width,
          height,
          opacity: opacityAnim,
        }}
        resizeMode="cover"
      />
    </View>
  );
};
