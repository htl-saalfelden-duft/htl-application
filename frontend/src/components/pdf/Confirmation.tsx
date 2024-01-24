import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Applicant } from '../../models/applicant.model';

interface Props {
    applicant: Applicant
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
});

// Create Document Component
export const Confirmation = (props: Props) => {
    const { applicant } = props

    return (
        <Document title="Anmeldebestätigung">
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>Bestätigung für</Text>
                    <Text>{applicant?.details?.firstname} {applicant?.details?.lastname}</Text>
                </View>
            </Page>
        </Document>
    )
}