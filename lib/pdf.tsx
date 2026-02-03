import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FocusCustomer } from "./types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 8 },
  section: { marginBottom: 12 },
  heading: { fontSize: 13, fontWeight: 600, marginBottom: 6 },
  body: { fontSize: 11, lineHeight: 1.4 }
});

export function ReportPdf({
  title,
  weekLabel,
  summary,
  focusCustomers
}: {
  title: string;
  weekLabel: string;
  summary: string;
  focusCustomers: FocusCustomer[];
}) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Solutions Engineering Weekly Report</Text>
          <Text style={styles.subtitle}>{weekLabel}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Executive Summary</Text>
          <Text style={styles.body}>{summary}</Text>
        </View>
        {focusCustomers.map((customer) => (
          <View key={customer.accountName} style={styles.section}>
            <Text style={styles.heading}>{customer.accountName}</Text>
            <Text style={styles.body}>{customer.detail?.narrative ?? ""}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
