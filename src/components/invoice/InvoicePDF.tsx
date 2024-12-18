import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { Invoice } from '../../types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
    fontStyle: 'bold',
  },
  description: {
    width: '60%',
  },
  amount: {
    width: '15%',
    textAlign: 'right',
  },
  quantity: {
    width: '15%',
    textAlign: 'right',
  },
  total: {
    width: '15%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    alignItems: 'center',
    height: 24,
    fontStyle: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  clientName: string;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, clientName }) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Invoice</Text>
            <Text>Invoice Number: {invoice.invoiceNumber}</Text>
            <Text>Date: {new Date(invoice.date).toLocaleDateString()}</Text>
            <Text>Client: {clientName}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.description}>Description</Text>
              <Text style={styles.quantity}>Quantity</Text>
              <Text style={styles.amount}>Price</Text>
              <Text style={styles.total}>Total</Text>
            </View>

            {invoice.items.map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.description}>{item.name}</Text>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Text style={styles.amount}>{formatCurrency(item.price)}</Text>
                <Text style={styles.total}>{formatCurrency(item.quantity * item.price)}</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.description}>Total</Text>
              <Text style={styles.quantity}></Text>
              <Text style={styles.amount}></Text>
              <Text style={styles.total}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default InvoicePDF;
