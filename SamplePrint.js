import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import {hsdLogo} from './dummy-logo';

const SamplePrint = () => {
  return (
    <View>
      <Text>Sample Print Instruction</Text>
      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printBarCode(
              '123456789012',
              BluetoothEscposPrinter.BARCODETYPE.JAN13,
              3,
              120,
              0,
              2,
            );
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print BarCode"
        />
      </View>
      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printQRCode(
              'https://hsd.co.id',
              280,
              BluetoothEscposPrinter.ERROR_CORRECTION.L,
            ); //.then(()=>{alert('done')},(err)=>{alert(err)});
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print QRCode"
        />
      </View>

      <View style={styles.btn}>
        <Button
          onPress={async () => {
            // Begin the transaction with some space
            await BluetoothEscposPrinter.printText('\r\n\r\n', {});

            // Print the header of the receipt
            await BluetoothEscposPrinter.printerAlign(
              BluetoothEscposPrinter.ALIGN.CENTER,
            );
            await BluetoothEscposPrinter.printText(
              'LAZZ PHARMA LIMITED\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText('Rajshahi Branch\r\n', {});
            await BluetoothEscposPrinter.printText(
              '159/A, Kadırgonj, Rajshahi-6100\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Mobile: 01766765252\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );

            // Print the transaction information
            await BluetoothEscposPrinter.setBlob(0);
            await BluetoothEscposPrinter.printText(
              'Date: 2024/02/05 19:31    Bill No: 2402050043777\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Cashier: Emon            Pay Mode: American Express\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText('Duplicate copy\r\n', {});
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );

            // Print the items purchased
            await BluetoothEscposPrinter.printText(
              'QTY  ITEM DESCRIPTION        PRICE   TOTAL\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );
            // Example for one item, repeat for each item
            await BluetoothEscposPrinter.printText(
              '1    AMERICAN HARVEST        270.00  270.00\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '     PROMEGRAN DRINK 290ML\r\n',
              {},
            );
            // ... print other items

            // Print the summary of the transaction
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Subtotal:                             1445.00\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Discount:                               72.25\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'VAT:                                    72.25\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Grand Total:                         1445.00\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );

            // Print customer loyalty points information
            await BluetoothEscposPrinter.printText(
              'Customer Name: TANZILUR\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Previous points:       125\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              "Today's points:         14\r\n",
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Total points:          139\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );

            // Print the footer of the receipt
            await BluetoothEscposPrinter.printText(
              'Thank you for shopping with us!\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Please visit again.\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              'Powered By: Taj Tech Ltd. (01774020251)\r\n',
              {},
            );
            await BluetoothEscposPrinter.printText(
              '------------------------------------------\r\n',
              {},
            );

            // End the transaction with some space
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print UnderLine 333"
        />
      </View>

      <View style={styles.btn}>
        <Button
          onPress={async () => {
            `[HEADER]
          ------------------------------------------
                        LAZZ PHARMA LIMITED
                         Rajshahi Branch
                    159/A, Kadırgonj, Rajshahi-6100
                          Mobile: 01766765252
          ------------------------------------------
          Date: 2024/02/05 19:31    Bill No: 2402050043777
          Cashier: Emon            Pay Mode: American Express
          Duplicate copy
          
          [ITEMS]
          ------------------------------------------
          QTY  ITEM DESCRIPTION        PRICE   TOTAL
          ------------------------------------------
          1    AMERICAN HARVEST        270.00  270.00
               PROMEGRAN DRINK 290ML
          1    NIVEA SOFT CREAM JAR    125.00  125.00
               25ML
          1    KELLOGGS CHOCOS         430.00  430.00
               375 GM
          1    LAYS INDIAS AMERICAN    220.00  220.00
               CREAM & ONION 90GM
          1    KF ALOO PURI            140.00  140.00
               10 PCS
          1    KF CHICKEN STRIPS       260.00  260.00
               (12PCS)
          
          [SUMMARY]
          ------------------------------------------
          Subtotal:                             1445.00
          Discount:                               72.25
          VAT:                                    72.25
          ------------------------------------------
          Grand Total:                         1445.00
          ------------------------------------------
          Customer Name: TANZILUR
          Previous points:       125
          Today's points:         14
          Total points:          139
          ------------------------------------------
          
          [FOOTER]
          Thank you for shopping with us!
          Please visit again.
          
          Powered By: Taj Tech Ltd. (01774020251)
          ------------------------------------------
          `;
          }}
          title="Print UnderLine 22"
        />
      </View>

      <View style={styles.btn}>
        <Button
          title="Print Struk Belanja"
          onPress={async () => {
            let columnWidths = [8, 20, 20];
            try {
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
              await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER,
              );
              // Assuming hsdLogo is the logo you want to print, adjust according to your actual logo variable.
              await BluetoothEscposPrinter.printPic(hsdLogo, {
                width: 250,
                left: 150,
              });

              // Center-align store information.
              await BluetoothEscposPrinter.printText(
                'Lazz Pharma Limited\r\n',
                {},
              );
              await BluetoothEscposPrinter.printText('Rajshahi branch\r\n', {});
              await BluetoothEscposPrinter.printText(
                '159/A, Kadırgonj, Rajshahi-6100\r\n',
                {},
              );
              await BluetoothEscposPrinter.printText(
                'Mobile: 01766765252\r\n',
                {},
              );

              // Print dotted line.
              await BluetoothEscposPrinter.printText(
                '----------------------------------------------\r\n',
                {},
              );

              // Print transaction information like date, time, customer name, etc.
              // Replace 'Tanziul' with the variable holding the customer's name.
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Customer', 'Tanziul'],
                {},
              );

              // Print items.
              await BluetoothEscposPrinter.printText('Products\r\n', {});
              await BluetoothEscposPrinter.printText(
                '----------------------------------------------\r\n',
                {},
              );

              // Replace with actual items, quantities, and prices.
              // Example of printing one item; repeat for each item.
              await BluetoothEscposPrinter.printColumn(
                [8, 20, 20],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'AMERICAN HARVEST', 'Tk.270.00'],
                {},
              );

              // Print dotted line.
              await BluetoothEscposPrinter.printText(
                '----------------------------------------------\r\n',
                {},
              );

              // Print total.
              // Replace '1445.00' with the variable holding the total amount.
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Total', 'Tk.1445.00'],
                {},
              );

              // Finish with spacing.
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
            } catch (e) {
              alert(e.message || 'ERROR');
            }
          }}
        />
      </View>
    </View>
  );
};

export default SamplePrint;

const styles = StyleSheet.create({
  btn: {
    marginBottom: 8,
  },
});
