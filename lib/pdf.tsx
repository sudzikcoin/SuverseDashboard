import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import ReactPDF from '@react-pdf/renderer'
import { formatDate } from './date'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    marginLeft: 10,
    marginBottom: 3,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  tableCell: {
    flex: 1,
  },
})

export async function generateBrokerPackagePDF(data: {
  poNumber: string
  buyerName: string
  creditType: string
  taxYear: number
  amountUSD: number
  pricePerDollar: number
  totalUSD: number
  documents: Array<{ type: string; url: string }>
}) {
  const BrokerPackageDoc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Broker Package</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Purchase Order #: {data.poNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Buyer Information:</Text>
          <Text style={styles.value}>Company: {data.buyerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Credit Details:</Text>
          <Text style={styles.value}>Type: {data.creditType}</Text>
          <Text style={styles.value}>Tax Year: {data.taxYear}</Text>
          <Text style={styles.value}>Face Value: ${data.amountUSD.toLocaleString()}</Text>
          <Text style={styles.value}>Price per Dollar: ${data.pricePerDollar}</Text>
          <Text style={styles.value}>Total Amount: ${data.totalUSD.toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>KYC Documents:</Text>
          {data.documents.map((doc, i) => (
            <Text key={i} style={styles.value}>
              {i + 1}. {doc.type}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Execution Checklist:</Text>
          <Text style={styles.value}>☐ Verify buyer identity</Text>
          <Text style={styles.value}>☐ Review compliance documents</Text>
          <Text style={styles.value}>☐ Prepare transfer forms</Text>
          <Text style={styles.value}>☐ Execute transfer</Text>
          <Text style={styles.value}>☐ Generate closing certificate</Text>
        </View>
      </Page>
    </Document>
  )

  return await ReactPDF.renderToBuffer(BrokerPackageDoc)
}

export async function generateClosingCertificatePDF(data: {
  poNumber: string
  buyerName: string
  creditType: string
  taxYear: number
  amountUSD: number
  pricePerDollar: number
  totalUSD: number
  approvedDate: Date
}) {
  const hash = `CERT-${data.poNumber}-${Date.now().toString(36).toUpperCase()}`
  
  const ClosingCertDoc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Closing Certificate</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Certificate ID: {hash}</Text>
          <Text style={styles.value}>Date: {formatDate(data.approvedDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Purchase Order #: {data.poNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Buyer:</Text>
          <Text style={styles.value}>{data.buyerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tax Credit Details:</Text>
          <Text style={styles.value}>Credit Type: {data.creditType}</Text>
          <Text style={styles.value}>Tax Year: {data.taxYear}</Text>
          <Text style={styles.value}>Face Value: ${data.amountUSD.toLocaleString()}</Text>
          <Text style={styles.value}>Price per Dollar of Credit: ${data.pricePerDollar}</Text>
          <Text style={styles.value}>Total Purchase Price: ${data.totalUSD.toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Terms:</Text>
          <Text style={styles.value}>
            This certificate confirms the successful transfer of the above-referenced
            tax credits. All terms and conditions as agreed in the purchase order apply.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Signature:</Text>
          <Text style={styles.value}>_______________________________</Text>
          <Text style={styles.value}>SuVerse Tax Credits</Text>
          <Text style={styles.value}>Authorized Signatory</Text>
        </View>
      </Page>
    </Document>
  )

  return await ReactPDF.renderToBuffer(ClosingCertDoc)
}
