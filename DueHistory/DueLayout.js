import React, {useEffect, useState} from 'react';
import {BackHandler, StyleSheet, Text, View} from 'react-native';

const DueLayout = ({onBack}) => {
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Sample data for demonstration
  const cardData = [
    {
      name: 'John Doe',
      phoneNumber: '123-456-7890',
      dueHistory: 'Due history for John Doe',
    },
    {
      name: 'Jane Smith',
      phoneNumber: '987-654-3210',
      dueHistory: 'Due history for Jane Smith',
    },
    // Add more sample data as needed
  ];

  // ? handle back start

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    console.log('back press');
    onBack();
    return true; // Default behavior (exit the app)
  };

  // ? handle back end

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textLabel}>Bell</Text>
        <Text style={styles.balanceTitle}>Hasan's Store</Text>
        <Text style={styles.textLabel}>User</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
    paddingHorizontal: 5,
    backgroundColor: '#F5F5F5', // Light gray background
    //marginBottom: 70,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  balanceTitle: {
    fontSize: 24,
    color: '#4F8EF7',
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default DueLayout;
