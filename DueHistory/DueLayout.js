import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {defaultGray} from '../ColorSchema';
import {API_URL} from '../api_link';
import {userGlobalName} from '../userGlobalInfo';
import DueHistoryDetails from './DueHistoryDetails';
import DueHistoryScreen from './DueHistoryScreen';

const DueLayout = ({onBack}) => {
  const [pageState, setPageState] = useState('history');
  const [individualUserDue, setIndividualUserDue] = useState();
  const [allUserInfo, setAllUserInfo] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [pageState]);

  const handleBackPress = () => {
    if (pageState === 'details') {
      setPageState('history');
      console.log('Switching to history');
      return true; // Prevent default back behavior
    } else if (pageState === 'history') {
      onBack();
      console.log('Calling onBack');
      return true; // Prevent default back behavior
    }

    // In any other case, let the default back behavior happen
    return false;
  };

  const ApiCall = async () => {
    try {
      const apiUrl = await API_URL;

      console.log(99999, apiUrl);

      callFetch(apiUrl);
    } catch (error) {
      console.error('Error fetching API URL:', error);
    }
  };

  useEffect(() => {
    ApiCall();
  }, []);

  const callFetch = async apiUrl => {
    try {
      const response = await fetch(`${apiUrl}/findAllPhoneWithDue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the data received from the API
        console.log('Data from API:', data);
        setAllUserInfo(data.reverse());
      } else {
        console.error('Failed to fetch data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const [totalAmount, setTotalAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState(0);

  const handleAddUser = () => {
    // Process the form submission (e.g., send data to the server)
    console.log('Name:', name);
    console.log('Phone Number:', phoneNumber);
    console.log('totalAmount:', totalAmount);
    console.log('receiveAmount:', receiveAmount);
    console.log('result :', totalAmount - receiveAmount);

    // Reset the input fields
    setName('');
    setPhoneNumber('');
    setAmount('');

    // Hide the input fields
    setInputVisible(false);
  };

  // ? handel add ammount

  const totalAmountHandle = amount => {
    // Ensure only numeric input and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(amount) || amount === '') {
      // Update the amount if it's valid
      setTotalAmount(parseInt(amount));
    }
  };

  // ? handel add ammount

  const receiveAmountHandle = amount => {
    // Ensure only numeric input and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(amount) || amount === '') {
      // Update the amount if it's valid
      setReceiveAmount(parseInt(amount));
    }
  };

  return (
    <View style={styles.container}>
      {pageState === 'history' ? (
        <View>
          <View style={styles.header}>
            <Text style={styles.backButton} onPress={() => handleBackPress()}>
              👈
            </Text>
            <Text style={styles.balanceTitle}>{userGlobalName}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setInputVisible(!inputVisible)}>
              <Text style={{fontSize: 18}}>➕</Text>
            </TouchableOpacity>
          </View>
          {inputVisible && (
            <View style={styles.card}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  color: '#000',
                }}>
                নতুন দেনাদার যুক্ত করুন
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                keyboardType="numeric"
                onChangeText={setPhoneNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Amount"
                value={totalAmount}
                keyboardType="numeric"
                onChangeText={totalAmountHandle}
              />

              <Text style={{marginBottom: 10}}>
                বাকি রইল :{parseInt(totalAmount)} - {parseInt(receiveAmount)} ={' '}
                {parseInt(receiveAmount) - parseInt(totalAmount)}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Receive Amount"
                keyboardType="numeric"
                value={receiveAmount}
                onChangeText={receiveAmountHandle}
              />

              <TouchableOpacity style={styles.button} onPress={handleAddUser}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          <DueHistoryScreen
            setIndividualUserDue={setIndividualUserDue}
            allUserInfo={allUserInfo}
            setPageState={setPageState}
          />
        </View>
      ) : (
        <View>
          <View style={styles.header}>
            <Text style={styles.backButton} onPress={() => handleBackPress()}>
              👈
            </Text>
            <Text style={styles.balanceTitle}>{userGlobalName}</Text>
          </View>
          <DueHistoryDetails
            callFetchParent={callFetch}
            individualUserDue={individualUserDue}
            setPageState={setPageState}
            onBack={onBack}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
    paddingHorizontal: 5,
    backgroundColor: '#fff', // Light gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 3,
    position: 'relative',
  },
  balanceTitle: {
    fontSize: 24,
    color: defaultGray,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    fontSize: 18,
  },
  addButton: {
    position: 'absolute',
    right: 20,
  },
  card: {
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: defaultGray,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: defaultGray,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DueLayout;
