import React, {useEffect} from 'react';
import {
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

  const print = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
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

  const calculateSubtotal = () => {
    return products.reduce(
      (acc, curr) => acc + (parseFloat(curr.total) || 0),
      0,
    );
  };

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

  const finalPrint = async () => {
    console.log('------------------------------------------------');

    const invoiceDetails = await pSaveAndPrint();

    if (invoiceDetails.customerName === '') {
      setError({
        state: true,
        msg: 'Please enter customer name ',
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
    // await BluetoothEscposPrinter.printColumn(
    //   columnWidths,
    //   [
    //     BluetoothEscposPrinter.ALIGN.LEFT,
    //     BluetoothEscposPrinter.ALIGN.LEFT,
    //     BluetoothEscposPrinter.ALIGN.CENTER,
    //     BluetoothEscposPrinter.ALIGN.RIGHT,
    //   ],
    //   [
    //     'React-Native Custom Development I am a longer position do you see if this is the case?',
    //     '1',
    //     '32000',
    //     '32000',
    //   ],
    //   {},
    // );
    // await BluetoothEscposPrinter.printText('\n\r', {});
    // await BluetoothEscposPrinter.printColumn(
    //   columnWidths,
    //   [
    //     BluetoothEscposPrinter.ALIGN.LEFT,
    //     BluetoothEscposPrinter.ALIGN.LEFT,
    //     BluetoothEscposPrinter.ALIGN.CENTER,
    //     BluetoothEscposPrinter.ALIGN.RIGHT,
    //   ],
    //   [
    //     'React-Native Custom Development I am a longer position do you see if this is the case?',
    //     '1',
    //     '32000',
    //     '32000',
    //   ],
    //   {},
    // );
    // await BluetoothEscposPrinter.printText('\n\r', {});

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

    console.log('this is roniiiiiiiiiii ', invoiceDetails.discount);

    //   await BluetoothEscposPrinter.printText('\n\r', {});
    // await BluetoothEscposPrinter.printColumn(
    //   [16, 16],
    //   [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
    //   [
    //     'Discount',
    //     `${invoiceDetails.discount}`,
    //     `- ${invoiceDetails.discount}`,
    //   ],
    //   {},
    // );
    //  await BluetoothEscposPrinter.printText('\n\r', {});

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

    await BluetoothEscposPrinter.printText('\n\r', {});

    // await BluetoothEscposPrinter.printText('Discount Rate: 100%\n\r', {});
    // await BluetoothEscposPrinter.printText(
    //   'After Discount Receivable: 64000.00\n\r',
    //   {},
    // );
    // await BluetoothEscposPrinter.printText(
    //   'Membership Card Payment: 0.00\n\r',
    //   {},
    // );
    // await BluetoothEscposPrinter.printText('Points Deduction: 0.00\n\r', {});
    // await BluetoothEscposPrinter.printText('Payment Amount: 64000.00\n\r', {});
    // await BluetoothEscposPrinter.printText(
    //   'Settlement Account: Cash Account\n\r',
    //   {},
    // );
    // await BluetoothEscposPrinter.printText('Remarks: None\n\r', {});
    // await BluetoothEscposPrinter.printText('Courier Number: None\n\r', {});

    // await BluetoothEscposPrinter.printText(
    //   '--------------------------------\n\r',
    //   {},
    // );
    // await BluetoothEscposPrinter.printText('Phone:\n\r', {});
    // await BluetoothEscposPrinter.printText('Address:\n\r\n\r', {});
    // await BluetoothEscposPrinter.printerAlign(
    //   BluetoothEscposPrinter.ALIGN.CENTER,
    // );
    // await BluetoothEscposPrinter.printText(
    //   'Welcome to visit next time\n\r\n\r\n\r',
    //   {},
    // );
    // await BluetoothEscposPrinter.printerAlign(
    //   BluetoothEscposPrinter.ALIGN.LEFT,
    // );

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

    // ? ----- end

    // ! ---------- start
    //   await BluetoothEscposPrinter.printText('LogicLark', {});
    //   await BluetoothEscposPrinter.printText('LogicLark', {});

    //   await BluetoothEscposPrinter.printText('New Sonakanda Bus Stand\r\n', {});

    //   await BluetoothEscposPrinter.printText(
    //     'Rohitpur, Keranigonj, Dhaka\r\n',
    //     {},
    //   );

    //   // await BluetoothEscposPrinter.setBlob(1);
    //   await BluetoothEscposPrinter.printText("Hasan's Store\r\n", {});

    //   await BluetoothEscposPrinter.printText('New Sonakanda Bus Stand\r\n', {});
    //   await BluetoothEscposPrinter.printText(
    //     'Rohitpur, Keranigonj, Dhaka\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText('Mobile: 01813048283\r\n', {});

    //   await BluetoothEscposPrinter.printText(
    //     '------------------------------\n',
    //     {},
    //   );

    //   // Print the transaction information
    //   // await BluetoothEscposPrinter.setBlob(0);
    //   // await BluetoothEscposPrinter.printText(`Date:${formattedDate}\r\n`, {});

    //   // await BluetoothEscposPrinter.setAbsolutePrintPosition({x: 100, y: 0}); // Set starting position (X-coordinate)
    //   // await BluetoothEscposPrinter.setBlob(1);
    //   await BluetoothEscposPrinter.printText(`Date:${formattedDate}\r\n`, {});

    //   // await BluetoothEscposPrinter.printText(
    //   //   `${formattedDate}          \r\n`,
    //   //   {},
    //   // );
    //   // await BluetoothEscposPrinter.printText(
    //   //   'Customer:                     \r\n',
    //   //   {},
    //   // );
    //   await BluetoothEscposPrinter.printText(
    //     `Customer: ${invoiceDetails.customerName}\r\n`,
    //     {},
    //   );
    //   // await BluetoothEscposPrinter.printText(
    //   //   'Customer phone:               \r\n',
    //   //   {},
    //   // );
    //   await BluetoothEscposPrinter.printText(
    //     `Customer phone: ${invoiceDetails.customerPhone}\r\n`,
    //     {},
    //   );
    //   // await BluetoothEscposPrinter.printText(
    //   //   'Customer Address:             \r\n',
    //   //   {},
    //   // );
    //   // await BluetoothEscposPrinter.printText(
    //   //   `${invoiceDetails.customerDetails}\r\n`,
    //   //   {},
    //   // );

    //   await BluetoothEscposPrinter.printText(
    //     '------------------------------\r\n',
    //     {},
    //   );

    //   // Print the items purchased
    //   await BluetoothEscposPrinter.printText(
    //     'QTY  ITEM    PRICE   total\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     '------------------------------\r\n',
    //     {},
    //   );
    //   // // Example for one item, repeat for each item
    //   // await BluetoothEscposPrinter.printText(
    //   //   '1    AMERICAN HARVEST    270.00\r\n', // for qty align left , product name center and product price right..now how to
    //   //   {},
    //   // );

    //   await printItemDetails();

    //   // ... print other items

    //   // Print the summary of the transaction
    //   await BluetoothEscposPrinter.printText(
    //     '------------------------------\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     `Subtotal:              ${calculateSubtotal().toFixed(2)}\r\n`,
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     `Discount:                ${
    //       invoiceDetails.discount === '%'
    //         ? 0
    //         : (calculateSubtotal().toFixed(2) - finalTotal.toFixed(2)).toFixed(2)
    //     }\r\n`,
    //     {},
    //   );

    //   await BluetoothEscposPrinter.printText(
    //     '-------------------------------\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     `Grand Total:           ${finalTotal.toFixed(2)}\r\n`,
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     '------------------------------\r\n',
    //     {},
    //   );

    //   // Print the footer of the receipt
    //   await BluetoothEscposPrinter.printText(
    //     'Thank you for shopping with us!\r\n',
    //     {},
    //   );
    //   //  await BluetoothEscposPrinter.printText('Please visit again.\r\n', {});
    //   await BluetoothEscposPrinter.printText('Powered By: LogicLark.', {});
    //   // await BluetoothEscposPrinter.printText(
    //   //   '--------------------------------\r\n',
    //   //   {},
    //   // );

    //   // End the transaction with some space
    //   // await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
    // };

    // const printItemDetails = async () => {
    //   for (const dt of nameDD) {
    //     await BluetoothEscposPrinter.printText(`1    ${dt}    270.00\r\n`, {});
    //   }
    // };

    // const printFunction = async () => {
    //   // Begin the transaction with some space
    //   await BluetoothEscposPrinter.printText('\r\n\r\n', {});

    //   // Print the header of the receipt
    //   await BluetoothEscposPrinter.printerAlign(
    //     BluetoothEscposPrinter.ALIGN.CENTER,
    //   );
    //   await BluetoothEscposPrinter.printText('LAZZ PHARMA LIMITED\r\n', {});
    //   await BluetoothEscposPrinter.printText('Rajshahi Branch\r\n', {});
    //   await BluetoothEscposPrinter.printText(
    //     '159/A, Keranigonj, Rajshahi-6100\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText('Mobile: 01766765252\r\n', {});
    //   await BluetoothEscposPrinter.printText(
    //     '---------------------------------\r\n',
    //     {},
    //   );

    //   // Print the transaction information
    //   //  await BluetoothEscposPrinter.setBlob(0);
    //   await BluetoothEscposPrinter.printText(
    //     'Date:                   Bill No:\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     '2024/02/05 19:31          240205\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     'Customer name:                  \r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     '2024/02/05 19:31          240205\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     'Customer Address:              \r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     '2024/02/05 19:31          240205\r\n',
    //     {},
    //   );

    //   await BluetoothEscposPrinter.printText('----------------\r\n', {});

    //   // Print the items purchased
    //   await BluetoothEscposPrinter.printText(
    //     'QTY  ITEM DESCRIPTION      PRICE\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText('--------------------\r\n', {});
    //   // Example for one item, repeat for each item
    //   await BluetoothEscposPrinter.printText(
    //     '1    AMERICAN HARVEST    270.00\r\n', // for qty align left , product name center and product price right..now how to
    //     {},
    //   );

    //   await printItemDetails();

    //   // ... print other items

    //   // Print the summary of the transaction
    //   await BluetoothEscposPrinter.printText('-------------\r\n', {});
    //   await BluetoothEscposPrinter.printText(
    //     'Subtotal:              1445.00\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     'Discount:                72.25\r\n',
    //     {},
    //   );

    //   await BluetoothEscposPrinter.printText('-----------\r\n', {});
    //   await BluetoothEscposPrinter.printText(
    //     'Grand Total:           1445.00\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText('---------------------\r\n', {});

    //   // Print the footer of the receipt
    //   await BluetoothEscposPrinter.printText(
    //     'Thank you for shopping with us!\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText('Please visit again.\r\n', {});
    //   await BluetoothEscposPrinter.printText(
    //     'Powered By: Taj Tech Ltd. (01774020251)\r\n',
    //     {},
    //   );
    //   await BluetoothEscposPrinter.printText(
    //     '------------------------------------------\r\n',
    //     {},
    //   );

    // ! ---------- end
    // // End the transaction with some space
    // await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text style={styles.textLabel}>Bell</Text>
        <Text style={styles.balanceTitle}>Hasan's Store</Text>
        <Text style={styles.textLabel}>User</Text>
      </View>
      <ScrollView>
        <View style={styles.container}>
          <View>
            <Text style={{color: 'black', marginVertical: 5}}>
              Customer details :
            </Text>
          </View>
          <View>
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
            <TextInput
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
              onChangeText={text => setCustomerPhone(text)}
              value={customerPhone}
              keyboardType="numeric"
              placeholder="Customer's phone"
              placeholderTextColor="#A9A9A9"
            />
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            }}>
            <Text style={{color: 'black'}}>Discount : </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#4F8EF7',
                marginRight: 10,
                padding: 10,
                flex: 1,
                borderRadius: 5,
                color: 'red',
              }}
              onChangeText={text => setDiscount(text)}
              value={discount}
              placeholder="Discount"
              keyboardType="numeric"
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'red',
                marginLeft: 20,
              }}>
              -{' '}
              {(calculateSubtotal().toFixed(2) - finalTotal.toFixed(2)).toFixed(
                2,
              )}
            </Text>
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
