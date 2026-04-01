import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { MedicalTest } from "./actions";

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30, fontFamily: 'Helvetica', fontSize: 10 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  title: { fontSize: 16, fontWeight: 'bold' },
  table: { display: "flex", width: "auto", marginBottom: 20 },
  tableRow: { flexDirection: "row", borderBottomColor: '#000000', borderBottomWidth: 0.5, minHeight: 20, alignItems: 'center' },
  tableHeaderRow: { flexDirection: "row", borderBottomColor: '#000000', borderBottomWidth: 1, paddingBottom: 2, marginBottom: 2 },
  tableCol: { paddingLeft: 4, paddingRight: 4 },
  tableCellHeader: { fontWeight: 'bold', fontSize: 10 },
  tableCell: { fontSize: 10 },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#000000', paddingTop: 5 },
});

export default function TestsPdfDocument({ tests, totalCount, searchQuery }: { tests: MedicalTest[], totalCount: number, searchQuery: string }) {
  const getColWidth = (key: string) => {
      if (key === 'id') return '10%';
      if (key === 'name') return '35%';
      if (key === 'category') return '25%';
      return '15%'; // unit, range
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Medical Tests</Text>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
            <Text style={{ fontSize: 10, marginBottom: 15 }}>Filtered by: {searchQuery || "None"}</Text>
        </View>

        <View style={styles.tableHeaderRow} fixed>
            <View style={{ ...styles.tableCol, width: getColWidth('id') }}><Text style={styles.tableCellHeader}>Row</Text></View>
            <View style={{ ...styles.tableCol, width: getColWidth('name') }}><Text style={styles.tableCellHeader}>Test Name</Text></View>
            <View style={{ ...styles.tableCol, width: getColWidth('category') }}><Text style={styles.tableCellHeader}>Category</Text></View>
            <View style={{ ...styles.tableCol, width: getColWidth('unit') }}><Text style={styles.tableCellHeader}>Unit</Text></View>
            <View style={{ ...styles.tableCol, width: getColWidth('range') }}><Text style={styles.tableCellHeader}>Range</Text></View>
        </View>

        <View style={styles.table}>
          {tests.map((test, index) => (
            <View key={test.id} style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: getColWidth('id') }}><Text style={styles.tableCell}>{index + 1}</Text></View>
              <View style={{ ...styles.tableCol, width: getColWidth('name') }}><Text style={styles.tableCell}>{test.name}</Text></View>
              <View style={{ ...styles.tableCol, width: getColWidth('category') }}><Text style={styles.tableCell}>{test.category}</Text></View>
              <View style={{ ...styles.tableCol, width: getColWidth('unit') }}><Text style={styles.tableCell}>{test.unit}</Text></View>
              <View style={{ ...styles.tableCol, width: getColWidth('range') }}><Text style={styles.tableCell}>{test.normalmin} - {test.normalmax}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed><Text>{tests.length} of {totalCount} Tests</Text></View>
      </Page>
    </Document>
  );
}