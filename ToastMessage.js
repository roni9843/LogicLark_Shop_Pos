import React, {useEffect, useState} from 'react';
import {Animated, Dimensions, Text} from 'react-native';
import {activeBtnColor} from './ColorSchema';

const ToastMessage = ({message, isVisible, onHide}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => onHide(), 2000);
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: Dimensions.get('window').height * 0.1,
        left: 0,
        right: 0,
        backgroundColor: activeBtnColor,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeAnim,
      }}>
      <Text
        style={{
          color: '#fff',
          fontSize: 16,
          textAlign: 'center',
        }}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default ToastMessage;
