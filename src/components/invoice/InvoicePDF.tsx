import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Invoice } from '../../types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    alignItems: 'center',
    paddingVertical: 8,
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
    borderTopColor: '#000000',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  clientName: string;
}

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const InvoicePDFDocument: React.FC<InvoicePDFProps> = ({ invoice, clientName }) => (
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

        {invoice.items?.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.description}>{item.name}</Text>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <Text style={styles.amount}>{formatAmount(item.price)}</Text>
            <Text style={styles.total}>{formatAmount(item.quantity * item.price)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.description}>Subtotal</Text>
          <Text style={styles.quantity}></Text>
          <Text style={styles.amount}></Text>
          <Text style={styles.total}>{formatAmount(invoice.subtotal)}</Text>
        </View>

        {(invoice.taxAmount ?? 0) > 0 && (
          <View style={styles.row}>
            <Text style={styles.description}>Tax</Text>
            <Text style={styles.quantity}></Text>
            <Text style={styles.amount}></Text>
            <Text style={styles.total}>{formatAmount(invoice.taxAmount)}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.description}>Total</Text>
          <Text style={styles.quantity}></Text>
          <Text style={styles.amount}></Text>
          <Text style={styles.total}>{formatAmount(invoice.total)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
);

const InvoicePDF: React.FC<InvoicePDFProps> = (props) => {
  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument {...props} />}
      fileName={`invoice-${props.invoice.invoiceNumber}.pdf`}
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {({ loading }) =>
        loading ? 'Preparing PDF...' : 'Download PDF'
      }
    </PDFDownloadLink>
  );
};

export default InvoicePDF;
