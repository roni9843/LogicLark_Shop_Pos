import React, {useEffect} from 'react';
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';

// import BluetoothEscposPrinter from 'react-native-bluetooth-escpos-printer';

import {useState} from 'react';
import {API_URL} from './api_link';
import PrintInvoicePrinter from './services/PrintInvoicePrinter';
import {
  getDataFromLocalStorage,
  saveDataToLocalStorage,
} from './services/ProductNameLocalService';

const InvoiceScreen = ({onBack}) => {
  const [allProductName, setAllProductName] = useState({});

  const [localDataRaw, setLocalDataRaw] = useState([]);

  // ? call local storage
  useEffect(() => {
    getValueFromLocalStorage();
  }, []);

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

  const handleSuggestionPress = (suggestion, index) => {
    const updatedProducts = [...products];
    updatedProducts[index].name = suggestion;
    setProducts(updatedProducts);
    setSuggestions(prevSuggestions => ({
      ...prevSuggestions,
      [index]: [],
    }));
  };

  const [products, setProducts] = useState([
    {name: '', price: '', qty: '', total: 0},
  ]);
  const [finalTotal, setFinalTotal] = useState(0);
  const [discount, setDiscount] = useState(''); // Use a string to handle empty input
  const [receivedAmount, setReceivedAmount] = useState(0); // Use a string to handle empty input
  const [suggestions, setSuggestions] = useState([]);
  const [customerName, setCustomerName] = useState('');
  // const [customerDetails, setCustomerDetails] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // ? The customer history
  const [customerInfoFetch, setCustomerInfoFetch] = useState([]);

  // ? previous total due
  const [previousTotalDue, setPreviousTotalDue] = useState(0);

  const calculateSubtotal = () => {
    return products.reduce(
      (acc, curr) => acc + (parseFloat(curr.total) || 0),
      0,
    );
  };

  useEffect(() => {
    if (customerPhone !== '') {
      // Assuming customersData is the array containing customer data as shown in the comment

      // Find the customer with the matching phone number
      const customer = customerInfoFetch.find(
        customer => customer.user_phone === customerPhone,
      );

      if (customer) {
        setPreviousTotalDue(customer.due_amount);
      }
    }
  }, [customerPhone]);

  useEffect(() => {
    if (customerPhone.length > 4) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${API_URL}/findBy1stNumber`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstDigits: customerPhone.toString(),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Handle the data received from the API
            console.log('Data from API:', data);
            setCustomerInfoFetch(data);
          } else {
            console.error('Failed to fetch data:', response.status);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [customerPhone]);

  const updateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    const discountValue = parseFloat(discount === '' ? 0 : discount);
    const totalAfterDiscount = subtotal - discountValue;
    setFinalTotal(totalAfterDiscount);
  };

  useEffect(() => {
    updateFinalTotal();
  }, [products, discount]);

  const handleChangeText = (text, index, field) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = text;

    // Calculate total if price or qty changes
    if (field === 'price' || field === 'qty') {
      const price = parseFloat(updatedProducts[index].price) || 0;
      const qty = parseFloat(updatedProducts[index].qty) || 0;
      updatedProducts[index].total = price * qty;
    }

    setProducts(updatedProducts);

    // Add new product row if last row's name, price, and qty are filled
    if (
      index === products.length - 1 &&
      products[index].name &&
      products[index].price &&
      products[index].qty
    ) {
      setProducts([
        ...updatedProducts,
        {name: '', price: '', qty: '', total: 0},
      ]);
    }

    // Update suggestions based on user input
    if (field === 'name' && text.length >= 3) {
      const filteredSuggestions = Object.values(allProductName).filter(
        productName => productName.toLowerCase().includes(text.toLowerCase()),
      );
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        [index]: filteredSuggestions,
      }));
    } else {
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        [index]: [],
      }));
    }
  };

  const pSaveAndPrint = async () => {
    const constFilterProduct = products.filter(p => p.total !== 0);

    const detailsConsole = {
      products: constFilterProduct,
      subtotal: calculateSubtotal().toFixed(2),
      discount: discount,
      finalTotal: finalTotal.toFixed(2),
      customerName: customerName,
      // customerDetails: customerDetails,
      customerPhone: customerPhone,
      finalTotal: finalTotal,
      receivedAmount: receivedAmount,
      due: finalTotal - receivedAmount,
    };

    const newData = detailsConsole.products.map(item => ({
      productName: item.name,
    }));

    console.log('--> ', detailsConsole);

    // ? get local storage data
    const localDataNewGet = await getDataFromLocalStorage();

    // console.log('6666666 -> ', pName);

    getValueFromLocalStorage();

    const uncommonObjects = findUncommonObjects(localDataNewGet, newData); // find uncommon value [{"productName": "Applxcv"}, {"productName": "Zbxbdbfbf"}]

    // ? set local storage
    saveDataToLocalStorage(uncommonObjects);

    return detailsConsole;
  };

  const getValueFromLocalStorage = async () => {
    const pName = await getDataFromLocalStorage();

    setLocalDataRaw(pName);

    const allProductNameLocal = pName.reduce((acc, item, index) => {
      acc[`product${index + 1}`] = item.productName;
      return acc;
    }, {});

    setAllProductName(allProductNameLocal);
  };

  const findUncommonObjects = (array1, array2) => {
    const productsInArray1 = array1.map(obj => obj.productName);
    const uncommonObjectsInArray2 = array2.filter(
      obj2 => !productsInArray1.includes(Object.values(obj2)[0]),
    );

    return uncommonObjectsInArray2;
  };

  const [error, setError] = useState({
    state: false,
    msg: '',
  });

  const [printCountValidation, setPrintCountValidation] = useState(1);

  const showSuccessAlert = () => {
    Alert.alert(
      'Success!',
      'Successfully Save And ready to Print!!!',
      [
        {
          text: 'OK',
          onPress: () => console.log('print'),
        },
      ],
      {cancelable: false},
    );
  };

  const finalPrint = async () => {
    const invoiceDetails = await pSaveAndPrint();

    if (invoiceDetails.customerName === '') {
      setError({
        state: true,
        msg: 'Please enter customer name ',
      });

      return;
    }
    if (invoiceDetails.customerPhone === '') {
      setError({
        state: true,
        msg: 'Please enter customer phone number ',
      });

      return;
    }
    if (!invoiceDetails.products.length === true) {
      setError({
        state: true,
        msg: 'Please enter product list',
      });

      return;
    }

    const printItemDetails = async () => {
      for (const dt of invoiceDetails.products) {
        // await BluetoothEscposPrinter.printText(`${dt.qty}     `, {
        //   align: 'left',
        // });
        // await BluetoothEscposPrinter.printText(`${dt.name}     `, {});
        // await BluetoothEscposPrinter.printText(`${dt.price}    `, {
        //   align: 'right',
        // });
        // await BluetoothEscposPrinter.printText(`${dt.total}\r\n`, {
        //   align: 'right',
        // });

        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [
            `${dt.name}`,
            `${dt.qty}`,
            `${parseInt(dt.price).toFixed(2)}`,
            `${parseInt(dt.total).toFixed(2)}`,
          ],
          {},
        );
        // await BluetoothEscposPrinter.printText('\n\r', {});
      }
    };

    const date = new Date('2024-02-05T19:31:00');
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    if (printCountValidation === 1) {
      const fetchData = {
        user_name: invoiceDetails.customerName,
        user_phone: `${invoiceDetails.customerPhone}`,
        inId: '609db63b0b24c939cc41a898',
        details: invoiceDetails.products,
        subTotal: parseInt(invoiceDetails.subtotal),
        discount: parseInt(invoiceDetails.discount),
        total: parseInt(invoiceDetails.finalTotal),
        accountReceived: parseInt(invoiceDetails.receivedAmount),
        due: parseInt(invoiceDetails.due),
      };

      try {
        const response = await fetch(`${API_URL}/createUserAndDue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fetchData),
        });

        if (response.ok) {
          const data = await response.json();
          // Handle the data received from the API
          console.log('Data from API:', data);
          console.log('Data from fetchData:', fetchData);

          showSuccessAlert();

          setProducts([{name: '', price: '', qty: '', total: 0}]);
          setCustomerPhone('');
          setCustomerName('');

          setFinalTotal(0);
          setDiscount('');
          setReceivedAmount(0);

          setCustomerInfoFetch([]);
          setPreviousTotalDue(0);
        } else {
          console.error('Failed to fetch data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    // ? ===== start ============
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.setBlob(1);
    await BluetoothEscposPrinter.printText("Hasan's Store\n\r", {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 0,
    });
    await BluetoothEscposPrinter.setBlob(0);
    await BluetoothEscposPrinter.printText('New Sonakanda, BussStand\n\r', {});
    await BluetoothEscposPrinter.printText('Ruhitpur, Keranigonj, Dhaka\n\r', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 0,
    });
    await BluetoothEscposPrinter.printText('01813048283\n\r', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 0,
    });
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.LEFT,
    );
    await BluetoothEscposPrinter.printText(`Date: ${formattedDate}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Customer: ${invoiceDetails.customerName}\n\r`,
      {},
    );
    await BluetoothEscposPrinter.printText(
      `Mobile: ${invoiceDetails.customerPhone}\n\r`,
      {},
    );

    // await BluetoothEscposPrinter.printText('Salesperson: 18664896621\n\r', {});
    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );
    let columnWidths = [12, 6, 6, 8];
    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ['Product', 'Qty', 'U P', 'Amount'],
      {},
    );
    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );

    await printItemDetails();

    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Subtotal', `${calculateSubtotal().toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Discount', `-${invoiceDetails.discount}`],
      {},
    );

    await BluetoothEscposPrinter.printText(
      '--------------------------------\n\r',
      {},
    );

    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Grand Total', `${finalTotal.toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Paid Amount', `${receivedAmount.toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Due Amount', `${(finalTotal - receivedAmount).toFixed(2)}`],
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Previous Due', `${previousTotalDue.toFixed(2)}`],
      {},
    );

    await BluetoothEscposPrinter.printText('\n\r', {});

    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    await BluetoothEscposPrinter.printText(
      'Thank you for shopping with us!\r\n',
      {},
    );
    await BluetoothEscposPrinter.printText('Powered By:\r\n', {});
    await BluetoothEscposPrinter.printText('LogicLark. 01927574610\r\n', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
  };

  const [keyboardStatus, setKeyboardStatus] = useState('');

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text style={styles.textLabel}>Bell</Text>
        <Text style={styles.balanceTitle}>Hasan's Store</Text>
        <Text style={styles.textLabel}>User</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View>
            <Text style={{color: 'black', marginVertical: 5}}>
              Customer details :
            </Text>
          </View>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#4F8EF7',
                  marginRight: 10,
                  padding: 10,
                  flex: 1,
                  borderRadius: 5,
                  color: '#4F8EF7',
                  marginVertical: 5,
                }}
                onChangeText={text => setCustomerPhone(text)}
                value={customerPhone}
                keyboardType="numeric"
                placeholder="Customer's phone"
                placeholderTextColor="#A9A9A9"
              />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#4F8EF7',
                  marginRight: 10,
                  padding: 10,
                  flex: 1,
                  borderRadius: 5,
                  color: '#4F8EF7',
                  marginVertical: 5,
                }}
                onChangeText={text => setCustomerName(text)}
                value={customerName}
                placeholder="Customer's name"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}>
              {customerInfoFetch.map(p => (
                <TouchableOpacity
                  onPress={() => {
                    setCustomerPhone(p.user_phone);

                    setCustomerName(p.user_name);
                  }}
                  style={styles.suggestionItem}>
                  <Text>{p.user_phone}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/**
           *   <TextInput
              // multiline={true}
              // numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: '#4F8EF7',
                marginRight: 10,
                padding: 10,
                flex: 1,
                borderRadius: 5,
                color: '#4F8EF7',
                marginVertical: 5,
                marginBottom: 10,
              }}
              onChangeText={text => setCustomerDetails(text)}
              value={customerDetails}
              placeholder="Customer's address"
              placeholderTextColor="#A9A9A9"
            />
           */}
          </View>

          <View>
            <Text style={{color: 'black', marginVertical: 5, marginTop: 25}}>
              Product list :
            </Text>
          </View>
          {products.map((product, index) => (
            <View key={index}>
              {suggestions[index] && (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {suggestions[index].map(suggestion => (
                    <TouchableOpacity
                      key={suggestion}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(suggestion, index)}>
                      <Text>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <View style={styles.row}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#4F8EF7',
                    marginRight: 10,
                    padding: 10,
                    flex: 5,
                    borderRadius: 5,
                    color: '#4F8EF7',
                  }}
                  onChangeText={text => handleChangeText(text, index, 'name')}
                  value={product.name}
                  placeholder="Product Name"
                  placeholderTextColor="#A9A9A9"
                />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#4F8EF7',
                    marginRight: 10,
                    padding: 10,
                    flex: 1,
                    borderRadius: 5,
                    color: '#4F8EF7',
                    textAlign: 'right',
                  }}
                  onChangeText={text => handleChangeText(text, index, 'price')}
                  value={product.price}
                  placeholder="Price"
                  keyboardType="numeric"
                  placeholderTextColor="#A9A9A9"
                />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#4F8EF7',
                    marginRight: 10,
                    padding: 10,
                    flex: 1,
                    borderRadius: 5,
                    color: '#4F8EF7',
                    textAlign: 'right',
                  }}
                  onChangeText={text => handleChangeText(text, index, 'qty')}
                  value={product.qty}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  placeholderTextColor="#A9A9A9"
                />
                <Text style={styles.total}>= {product.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              color: 'black',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'black',
              }}>
              -----------------------------------------
            </Text>
          </View>
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Subtotal:</Text>
            <Text style={styles.finalTotal}>
              {calculateSubtotal().toFixed(2)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginBottom: 10,
              marginTop: 10,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <Text
              style={{
                color: 'black',
                flex: 3,
                textAlign: 'right',
                fontSize: 16,
              }}>
              Discount :{' '}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#4F8EF7',
                // marginRight: 50,
                // marginLeft: 200,
                padding: 10,
                flex: 1,
                borderRadius: 5,
                color: 'red',
                textAlign: 'right',
              }}
              onChangeText={text => setDiscount(text)}
              value={discount}
              placeholder="Discount"
              keyboardType="numeric"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              color: 'black',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'black',
              }}>
              -----------------------------------------
            </Text>
          </View>
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Final Total: </Text>
            <Text style={styles.finalTotal}>{finalTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Previous Due: </Text>
            <Text style={styles.finalTotal}>{previousTotalDue}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginBottom: 10,
              marginTop: 0,
              alignItems: 'center',
            }}>
            <Text style={{color: 'black'}}>Received Amount : </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#4F8EF7',
                marginRight: 10,
                padding: 10,
                flex: 1,
                borderRadius: 5,
                color: 'black',
              }}
              onChangeText={text => setReceivedAmount(text)}
              value={receivedAmount}
              placeholder="Receive"
              keyboardType="numeric"
            />
            <Text style={{color: 'black'}}>Due Amount : </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'black',
                marginLeft: 20,
              }}>
              {(finalTotal - receivedAmount).toFixed(2)}
            </Text>
          </View>

          {error.state === true && (
            <View
              style={{
                backgroundColor: 'red',
                borderRadius: 10,
                padding: 10,
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <Text style={{color: 'white', textAlign: 'center'}}>
                {error.msg}
              </Text>
            </View>
          )}

          <PrintInvoicePrinter finalPrint={finalPrint}></PrintInvoicePrinter>
        </View>
      </ScrollView>
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

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4F8EF7',
    marginRight: 10,
    padding: 10,
    flex: 1,
    borderRadius: 5,
  },
  total: {
    fontWeight: 'bold',
    color: 'black',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 5,
    color: 'black',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    color: 'black',
  },
  finalTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    overflow: 'scroll',
  },
  suggestionItem: {
    padding: 10,
    backgroundColor: 'white',
    marginHorizontal: 5,
    marginBottom: 5,
    backgroundColor: '#4F8EF7',
    borderRadius: 5,
  },
});
export default InvoiceScreen;
