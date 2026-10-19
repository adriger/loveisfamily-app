import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, Dimensions } from 'react-native';

const splashImages = [
  require('../../../assets/splash/splash-1.png'),
  require('../../../assets/splash/splash-2.png'),
  require('../../../assets/splash/splash-3.png'),
  require('../../../assets/splash/splash-4.png'),
  require('../../../assets/splash/splash-5.png'),
  require('../../../assets/splash/splash-6.png'),
  require('../../../assets/splash/splash-7.png'),
  require('../../../assets/splash/splash-8.png'),
  require('../../../assets/splash/splash-9.png'),
  require('../../../assets/splash/splash-final.png'),
];

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const { width, height } = Dimensions.get('window');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    let timeouts: NodeJS.Timeout[] = [];

    const animateToNextImage = () => {
      if (!isMounted) return;

      // Fade out current image
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;

        // Move to next image
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % splashImages.length;
          
          // Fade in next image
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();

          // Check if we're at the final image
          if (nextIndex === splashImages.length - 1) {
            // Wait 2 seconds on final image, then finish
            const finalTimeout = setTimeout(() => {
              if (isMounted) {
                onFinish();
              }
            }, 2000);
            timeouts.push(finalTimeout);
          } else {
            // Move to next image after 500ms
            const nextTimeout = setTimeout(animateToNextImage, 500);
            timeouts.push(nextTimeout);
          }

          return nextIndex;
        });
      });
    };

    // Start animation after 500ms
    const startTimeout = setTimeout(animateToNextImage, 500);
    timeouts.push(startTimeout);

    return () => {
      isMounted = false;
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [opacityAnim, onFinish]);

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Animated.Image
        source={splashImages[currentImageIndex]}
        style={{
          width,
          height,
          opacity: opacityAnim,
        }}
        resizeMode="cover"
      />
    </View>
  );
}
