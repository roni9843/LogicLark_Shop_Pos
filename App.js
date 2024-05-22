import React, {useCallback, useEffect, useState} from 'react';
import {
  DeviceEventEmitter,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import DeviceInfo from 'react-native-device-info';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';
import {activeBtnColor, defaultGray, dueColor, errorColor} from './ColorSchema';
import DueLayout from './DueHistory/DueLayout';
import InvoiceScreen from './InvoiceScreen';
import PrinterScreen from './PrinterScreen';
import {API_URL} from './api_link';
import {getBluetoothData} from './services/BluetoothService';
import {
  getUserData,
  saveUserApi,
  saveUserData,
} from './services/SetUserActivate';
import {userGlobalName} from './userGlobalInfo';

const App = () => {
  // const [showPrinterScreen, setShowPrinterScreen] = useState(false);
  // const [showInvoiceScreen, setShowInvoiceScreen] = useState(false);
  // const [showDueHistoryScreen, setShowDueHistoryScreen] = useState(false);

  // // ** user activator
  // const [userID, setUserID] = useState('');
  // const [userApi, setUserApi] = useState('');
  // const [userActivatorData, setUserActivatorData] = useState(null);
  // const [isUserActive, setUserActive] = useState(false);
  // const [userApiCheck, setUserApiCheck] = useState(false);

  // useEffect(() => {
  //   fetchDataLocalStorage();
  // }, []);

  // const fetchDataLocalStorage = async () => {
  //   const userData = await getUserData();
  //   const apiUrl = await API_URL;

  //   // return console.log(apiUrl, '======');

  //   setUserApiCheck(apiUrl ? true : false);

  //   setUserActivatorData(userData);
  //   console.log('local host geeeeet ', userData);

  //   if (userData) {
  //     // Provided time
  //     var providedTime = new Date(userData.userTimeLimit);

  //     // Current time
  //     var currentTime = new Date();

  //     // Compare
  //     if (providedTime < currentTime) {
  //       handleButtonPress(userData.userID, apiUrl);
  //       setUserActive(false);
  //     } else {
  //       setUserActive(true);
  //     }
  //   } else {
  //     setUserActive(false);
  //   }
  // };

  // const handleButtonPress = async userID => {
  //   console.log('call', userID);

  //   try {
  //     const response = await fetch(
  //       'https://logic-lark-shop-pos-security.vercel.app/findUserTimeLimit',
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           //   userId: userID,
  //           userId: `${userID}`,
  //         }),
  //       },
  //     );

  //     // if (!response.ok) {
  //     //   throw new Error('Network response was not ok');
  //     // }

  //     const data = await response.json();

  //     if (data.status === true) {
  //       // Provided time
  //       var providedTime = new Date(data.user.timeLimit);

  //       // Current time
  //       var currentTime = new Date();

  //       // Compare
  //       if (providedTime < currentTime) {
  //         setUserActive(false);

  //         // Save data using saveUserData function

  //         const apiUrl = await API_URL;

  //         if (apiUrl) {
  //           await saveUserData(data.user._id, data.user.timeLimit);

  //           await saveUserApi(apiUrl);
  //         } else {
  //           await saveUserData(data.user._id, data.user.timeLimit);
  //           await saveUserApi(userApi);
  //         }

  //         setUserActivatorData(true);
  //       } else {
  //         setUserActive(true);

  //         const apiUrl = await API_URL;
  //         if (apiUrl) {
  //           await saveUserData(data.user._id, data.user.timeLimit);

  //           await saveUserApi(apiUrl);
  //         } else {
  //           await saveUserData(data.user._id, data.user.timeLimit);
  //           await saveUserApi(userApi);
  //         }

  //         setUserActivatorData(data);
  //       }
  //     } else {
  //       setUserActive(false);
  //     }

  //     console.log('Data fetched and saved successfully:', data);
  //   } catch (error) {
  //     console.error('Error fetching or saving data:', error);
  //   }
  // };

  const [showPrinterScreen, setShowPrinterScreen] = useState(false);
  const [showInvoiceScreen, setShowInvoiceScreen] = useState(false);
  const [showDueHistoryScreen, setShowDueHistoryScreen] = useState(false);

  const [userID, setUserID] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [userApi, setUserApi] = useState('');
  const [userActivatorData, setUserActivatorData] = useState(null);
  const [isUserActive, setUserActive] = useState(false);
  const [userApiCheck, setUserApiCheck] = useState(false);

  useEffect(() => {
    postDeviceId();
  }, []);

  useEffect(() => {
    fetchDataLocalStorage();
  }, []);

  // ? post user device id
  const postDeviceId = async () => {
    const id = await DeviceInfo.getUniqueId();

    const apiUrl = await API_URL;

    if (!apiUrl) {
      try {
        const response = await fetch(
          'https://logic-lark-shop-pos-security.vercel.app/RequestDeviceId',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({deviceId: id}),
          },
        );

        if (response.ok) {
          console.log('PermissionDeviceIdNumber created successfully');
          // Handle success as needed, such as showing a success message or redirecting
        } else {
          console.error('Failed to create PermissionDeviceIdNumber');
          // Handle failure, such as showing an error message
        }
      } catch (error) {
        console.error('Error creating PermissionDeviceIdNumber:', error);
        // Handle error, such as showing an error message
      }
    }
  };

  // ? check is local database exist  api
  // ? if exist then run app
  // ? if does not exist then this user is new and open code and url link input field
  const fetchDataLocalStorage = async () => {
    try {
      const userData = await getUserData();
      const apiUrl = await API_URL;
      setUserApiCheck(!!apiUrl);

      setUserActivatorData(userData);

      if (userData) {
        const providedTime = new Date(userData.userTimeLimit);
        const currentTime = new Date();

        setUserActive(providedTime > currentTime);

        if (providedTime < currentTime) {
          await handleButtonPress(userData.userID, apiUrl);
          setUserActive(false);
        }
      }
    } catch (error) {
      console.error('Error fetching or saving data:', error);
    }
  };

  const [isReStart, setIsReStart] = useState(false);

  const handleButtonPress = async (userID, apiUrl) => {
    try {
      const response = await fetch(
        'https://logic-lark-shop-pos-security.vercel.app/findUserTimeLimit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: `${userID}`}),
        },
      );

      const data = await response.json();

      if (data.status === true) {
        const providedTime = new Date(data.user.timeLimit);
        const currentTime = new Date();

        setUserActive(providedTime > currentTime);

        if (providedTime < currentTime) {
          setUserActive(false);
          await saveUserDataAndApi(data.user._id, data.user.timeLimit, apiUrl);
        } else {
          await saveUserDataAndApi(
            data.user._id,
            data.user.timeLimit,
            apiUrl || userApi,
          );
          setUserActivatorData(data);
        }
      } else {
        setUserActive(false);
      }

      console.log('Data fetched and saved successfully:', data);
      setIsReStart(true);
    } catch (error) {
      console.error('Error fetching or saving data:', error);
    }
  };

  const saveUserDataAndApi = async (userID, timeLimit, apiUrl) => {
    await saveUserData(userID, timeLimit);
    await saveUserApi(apiUrl);
  };

  const handleInvoiceButtonPress = () => {
    setShowInvoiceScreen(true);
    setShowPrinterScreen(false);
    setShowDueHistoryScreen(false);
  };

  const handleBluetoothButtonPress = () => {
    setShowPrinterScreen(true);
    setShowInvoiceScreen(false);
    setShowDueHistoryScreen(false);
  };

  const handelDueHistoryButton = () => {
    //console.log('clicked');

    setShowDueHistoryScreen(true);
    setShowPrinterScreen(false);
    setShowInvoiceScreen(false);
  };

  const handleBack = () => {
    setShowPrinterScreen(false);
    setShowInvoiceScreen(false);
    setShowDueHistoryScreen(false);
  };

  // ? bluetooth

  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [boundAddress, setBoundAddress] = useState('');

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      enabled => {
        setBleOpend(Boolean(enabled));
        setLoading(false);
      },
      err => {
        err;
      },
    );

    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('');
          setBoundAddress('');
        },
      );
    } else if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('');
          setBoundAddress('');
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
        () => {
          ToastAndroid.show(
            'Device Not Support Bluetooth !',
            ToastAndroid.LONG,
          );
        },
      );
    }
    if (pairedDevices.length < 1) {
      scan();
    }
  }, [boundAddress, deviceAlreadPaired, deviceFoundEvent, pairedDevices, scan]);

  const deviceAlreadPaired = useCallback(
    rsp => {
      var ds = null;
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices;
      } else {
        try {
          ds = JSON.parse(rsp.devices);
        } catch (e) {}
      }
      if (ds && ds.length) {
        let pared = pairedDevices;
        if (pared.length < 1) {
          pared = pared.concat(ds || []);
        }
        setPairedDevices(pared);
      }
    },
    [pairedDevices],
  );

  const deviceFoundEvent = useCallback(
    rsp => {
      var r = null;
      try {
        if (typeof rsp.device === 'object') {
          r = rsp.device;
        } else {
          r = JSON.parse(rsp.device);
        }
      } catch (e) {
        // ignore error
      }

      if (r) {
        let found = foundDs || [];
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x) {
            return x.address == r.address;
          });
          if (duplicated == -1) {
            found.push(r);
            setFoundDs(found);
          }
        }
      }
    },
    [foundDs],
  );

  const connect = row => {
    setLoading(true);
    BluetoothManager.connect(row.address).then(
      s => {
        setLoading(false);
        setBoundAddress(row.address);
        setName(row.name || 'UNKNOWN');
      },
      e => {
        setLoading(false);
        alert(e);
      },
    );
  };

  const unPair = address => {
    setLoading(true);
    BluetoothManager.unpaire(address).then(
      s => {
        setLoading(false);
        setBoundAddress('');
        setName('');
      },
      e => {
        setLoading(false);
        alert(e);
      },
    );
  };

  const scanDevices = useCallback(() => {
    setLoading(true);
    BluetoothManager.scanDevices().then(
      s => {
        // const pairedDevices = s.paired;
        var found = s.found;
        try {
          found = JSON.parse(found); //@FIX_it: the parse action too weired..
        } catch (e) {
          //ignore
        }
        var fds = foundDs;
        if (found && found.length) {
          fds = found;
        }
        setFoundDs(fds);
        setLoading(false);
      },
      er => {
        setLoading(false);
        // ignore
      },
    );
  }, [foundDs]);

  const scan = useCallback(() => {
    try {
      async function blueTooth() {
        const permissions = {
          title: 'HSD bluetooth meminta izin untuk mengakses bluetooth',
          message:
            'HSD bluetooth memerlukan akses ke bluetooth untuk proses koneksi ke bluetooth printer',
          buttonNeutral: 'Lain Waktu',
          buttonNegative: 'Tidak',
          buttonPositive: 'Boleh',
        };

        const bluetoothConnectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          permissions,
        );
        if (bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED) {
          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            permissions,
          );
          if (bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED) {
            scanDevices();
          }
        } else {
          // ignore akses ditolak
        }
      }
      blueTooth();
    } catch (err) {
      console.warn(err);
    }
  }, [scanDevices]);

  const scanBluetoothDevice = async () => {
    setLoading(true);
    try {
      const request = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ]);

      if (
        request['android.permission.ACCESS_FINE_LOCATION'] === RESULTS.GRANTED
      ) {
        scanDevices();
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const currentDate = new Date();

  // Format the date
  const formattedDate = `${currentDate.getDate()}/${
    currentDate.getMonth() + 1
  }/${currentDate.getFullYear()}`;

  // Format the time
  const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

  // Combine date and time
  const dateTime = `${formattedDate} ${formattedTime}`;

  // ? call bluetooth
  useEffect(() => {
    callBluetooth();
  }, []);

  const callBluetooth = async () => {
    // Get Bluetooth data
    const retrievedData = await getBluetoothData();

    //  console.log(retrievedData);

    console.log('555 _> ', retrievedData);

    if (retrievedData !== null) {
      connect(retrievedData);
    }
  };

  return (
    <ScrollView style={[styles.container]}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {!showPrinterScreen && !showInvoiceScreen && !showDueHistoryScreen && (
        <View>
          <View style={styles.header}>
            <Text style={styles.textLabel}>Bell</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceTitle}>{userGlobalName}</Text>
              <Text style={{fontSize: 16, color: '#2c3e50'}}>
                নতুন সোনাকান্দা, রোহিতপুর,
              </Text>
              <Text style={styles.availableBalance}>কেরানীগঞ্জ, ঢাকা</Text>
            </View>

            <Text style={styles.textLabel}>User</Text>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>{dateTime}</Text>
          </View>
          <View style={styles.menu}>
            {isUserActive !== false && !userApiCheck === false && (
              <TouchableOpacity
                style={
                  // ! --**-- this is old with bluetooth
                  // boundAddress.length < 1
                  //   ? styles.menuItemInvoiceDisActive
                  //   : styles.menuItemInvoiceActive

                  // * --**-- this is new without bluetooth

                  styles.menuItemInvoiceActive
                }
                disabled={
                  // ! --**-- this is old with bluetooth
                  // boundAddress.length < 1 ? true : false

                  // * --**-- this is new without bluetooth
                  false
                }
                onPress={handleInvoiceButtonPress}>
                <Text style={styles.menuItemInvoiceActiveTextLabel}>
                  InVoice 🖨️
                </Text>
              </TouchableOpacity>
            )}

            {!userApiCheck === false && (
              <TouchableOpacity
                onPress={handelDueHistoryButton}
                style={styles.menuItemDueDisActive}>
                <Text style={styles.menuItemInBluetoothActiveTextLabel}>
                  বাকির তথ্য 📃
                </Text>
              </TouchableOpacity>
            )}

            {isUserActive !== false && !userApiCheck === false && (
              <TouchableOpacity
                onPress={handleBluetoothButtonPress}
                style={
                  boundAddress.length < 1
                    ? styles.menuItemBluetoothDisActive
                    : styles.menuItemBluetoothActive
                }>
                <Text style={styles.menuItemInBluetoothActiveTextLabel}>
                  Bluetooth ➕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {userActivatorData === null && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#f0f0f0',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: 30,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <TextInput
                    style={{
                      height: 50,
                      width: 350,
                      borderColor: defaultGray,
                      borderWidth: 2,
                      paddingHorizontal: 10,
                      //   marginBottom: 20,
                      borderRadius: 8,
                      backgroundColor: '#fff',
                      color: 'black',
                    }}
                    placeholder="Enter Device Code"
                    placeholderTextColor="#999"
                    onChangeText={text => setDeviceId(text)}
                    value={deviceId}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#f0f0f0',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: 20,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <TextInput
                    style={{
                      height: 50,
                      width: 350,
                      borderColor: defaultGray,
                      borderWidth: 2,
                      paddingHorizontal: 10,
                      //   marginBottom: 20,
                      borderRadius: 8,
                      backgroundColor: '#fff',
                      color: 'black',
                    }}
                    placeholder="Enter User Code"
                    placeholderTextColor="#999"
                    onChangeText={text => setUserID(text)}
                    value={userID}
                  />
                </View>
              </View>
              <View
                style={{
                  // flexDirection: 'row',
                  //  backgroundColor: '#f0f0f0',
                  marginTop: 20,
                  // justifyContent: 'center',
                  // alignContent: 'center',
                  // alignItems: 'center',
                  // alignSelf: 'center',
                }}>
                <View
                  style={{
                    //  flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    //  alignContent: 'center',
                    //  alignItems: 'center',
                    //  alignSelf: 'center',
                  }}>
                  {!userApiCheck && (
                    <TextInput
                      style={{
                        height: 50,
                        width: 350,
                        borderColor: defaultGray,
                        borderWidth: 2,
                        paddingHorizontal: 10,
                        //   marginBottom: 20,
                        borderRadius: 8,
                        backgroundColor: '#fff',
                        color: 'black',
                      }}
                      placeholder="Enter Api Link"
                      placeholderTextColor="#999"
                      onChangeText={text => setUserApi(text)}
                      value={userApi}
                    />
                  )}

                  <TouchableOpacity
                    onPress={async () => {
                      const thisUserDeviceId = await DeviceInfo.getUniqueId();

                      thisUserDeviceId == deviceId &&
                        userID &&
                        userApi &&
                        handleButtonPress(userID);
                    }}
                    style={{
                      backgroundColor: activeBtnColor,
                      borderRadius: 5,
                      marginLeft: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      marginTop: 20,
                    }}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>
                      Activate
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {isReStart === true && (
            <View
              style={{
                backgroundColor: activeBtnColor,
                marginHorizontal: 30,
                textAlign: 'center',
                marginTop: 100,
                borderRadius: 5,
                padding: 5,
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  textAlign: 'center',
                  color: '#fff',
                }}>
                সফল ভাবে অ্যাক্টিভ হয়েছে!!!
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  textAlign: 'center',
                  color: '#fff',
                }}>
                অনুগ্রহ করে অ্যাপটি বন্ধ করে আবার চালু করুন
              </Text>
            </View>
          )}

          {isUserActive === false && (
            <View
              style={{
                backgroundColor: errorColor,
                marginHorizontal: 30,
                textAlign: 'center',
                marginTop: 100,
                borderRadius: 5,
                paddingVertical: 5,
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  textAlign: 'center',
                  color: '#fff',
                }}>
                আপনার স্টোরটি চালু করতে নিচের নাম্বারে যোগাযোগ করুন
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  textAlign: 'center',
                  color: '#fff',
                }}>
                01927574613, 01874374269
              </Text>
            </View>
          )}

          {boundAddress.length > 0 && (
            <TouchableOpacity style={styles.upgrade}>
              <Text style={styles.upgradeText}>Bluetooth : {name}</Text>
              <Text style={styles.upgradeSubtext}>{boundAddress}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Conditionally render the screens */}
      {showPrinterScreen && (
        <PrinterScreen
          onBack={handleBack}
          bleOpend={bleOpend}
          boundAddress={boundAddress}
          scanBluetoothDevice={scanBluetoothDevice}
          unPair={unPair}
          connect={connect}
          pairedDevices={pairedDevices}
          loading={loading}
          name={name}
        />
      )}
      {showInvoiceScreen && <InvoiceScreen onBack={handleBack} />}

      {showDueHistoryScreen && <DueLayout onBack={handleBack}></DueLayout>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  horizontalButton: {
    flexDirection: 'row',
    // backgroundColor: "#f0f4f7",
    // backgroundColor: "#f0f4f7",
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    //color: "#007AFF",
    color: '#2c3e50',
    fontSize: 16,

    marginLeft: 10,
  },

  additionalText: {
    color: 'gray', // Adjust the color as needed
    fontSize: 16, // Adjust the font size as needed
    // marginRight: 10, // Add margin to separate it from the button
    textAlign: 'right',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  textLabel: {
    color: 'white',
    opacity: 0,
  },

  container: {
    flex: 1,
    //  backgroundColor: '#f0f4f7',
    backgroundColor: 'white',
    // marginTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // marginBottom: 10,
  },
  balanceTitle: {
    fontSize: 40,
    //color: '#4F8EF7',
    color: defaultGray,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  availableBalance: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
  },
  menuItemBluetoothDisActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: errorColor,
    padding: 10,
    borderRadius: 10,
    paddingVertical: 15,
  },
  menuItemBluetoothActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: activeBtnColor,
    padding: 10,
    borderRadius: 10,
    paddingVertical: 15,
  },
  menuItemInvoiceDisActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: errorColor,
    padding: 10,
    borderRadius: 10,
    paddingVertical: 15,
  },
  menuItemInvoiceActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: activeBtnColor,
    padding: 10,
    borderRadius: 10,
    paddingVertical: 15,
  },
  menuItemDueDisActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dueColor,
    padding: 10,
    borderRadius: 10,
    paddingVertical: 15,
  },
  menuItemInvoiceActiveTextLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  menuItemInBluetoothActiveTextLabel: {
    color: 'white',
    fontWeight: 'bold',
  },

  upgrade: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  upgradeText: {
    color: '#2ECC71',
    fontSize: 18,
    fontWeight: 'bold',
  },
  upgradeSubtext: {
    color: '#7f8c8d',
  },
  transactionHistory: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  transactionTitle: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  transactionText: {
    flex: 1,
    marginLeft: 10,
  },
  transactionItemTitleActive: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },
  transactionItemTitle: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  transactionItemDate: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  transactionItemAmount: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  transactionItemAmountActive: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },
});

export default App;
