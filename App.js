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
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';
import {activeBtnColor, defaultGray, dueColor, errorColor} from './ColorSchema';
import DueLayout from './DueHistory/DueLayout';
import InvoiceScreen from './InvoiceScreen';
import PrinterScreen from './PrinterScreen';
import {getBluetoothData} from './services/BluetoothService';
import {
  getUserApi,
  getUserData,
  saveUserApi,
  saveUserData,
} from './services/SetUserActivate';
import {userGlobalName} from './userGlobalInfo';

const App = () => {
  const [showPrinterScreen, setShowPrinterScreen] = useState(false);
  const [showInvoiceScreen, setShowInvoiceScreen] = useState(false);
  const [showDueHistoryScreen, setShowDueHistoryScreen] = useState(false);

  const [activeHours, setActiveHours] = useState(0);

  const [userActivatorData, setUserActivatorData] = useState(null);
  const [isUserActive, setUserActive] = useState(false);
  const [userApiCheck, setUserApiCheck] = useState(false);

  useEffect(() => {
    fetchDataLocalStorage();
  }, []);

  // ? check is local database exist  api
  // ? if exist then run app
  // ? if does not exist then this user is new and open code and url link input field
  const fetchDataLocalStorage = async () => {
    try {
      let userData = await getUserData(); // userId and time limit
      let apiUrl = await getUserApi();

      console.log('this is user data 1-> ', userData, apiUrl);

      // ? if user data not null then this is new user
      if (userData === null && apiUrl === null) {
        await saveUserApi('https://logic-lark-shop-pos-backend.vercel.app');

        // Get the current time in milliseconds since Unix Epoch
        const currentTime = new Date().getTime();

        // Add 72 hours (72 * 60 * 60 * 1000 milliseconds) to the current time
        const newTime = new Date(currentTime + 72 * 60 * 60 * 1000);

        await saveUserData(newTime);
      }

      userData = await getUserData(); // userId and time limit
      apiUrl = await getUserApi();

      // Convert the string to a Date object
      const dateObject = new Date(userData);

      setActiveHours(dateObject.getHours());

      console.log('this is user data 2-> ', userData, apiUrl);

      setUserApiCheck(!!apiUrl);

      setUserActivatorData(userData);

      // ? if user data exist then check valid or invalid
      if (userData) {
        const providedTime = new Date(userData);
        const currentTime = new Date();

        setUserActive(providedTime > currentTime);

        if (providedTime < currentTime) {
          setUserActive(false);
        }
      }
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
                এই অ্যাপটি অ্যাক্টিভ থাকবে আর {activeHours} ঘণ্টা
              </Text>
              <Text style={styles.availableBalance}>_____________</Text>
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
                  কাস্টমারের তথ্য 📃
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

          {
            // * when app's time limit end
          }
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

          {
            // * this is bluetooth
          }
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
