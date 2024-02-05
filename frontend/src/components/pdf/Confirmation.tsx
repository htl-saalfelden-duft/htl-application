import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Applicant } from '../../models/applicant.model';
import moment from 'moment';
import htlLogo128 from '../../assets/images/htl-saalfelden-logo_128.png'

interface Props {
    applicant: Applicant
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row'
    },
    title1: {
        fontSize: 20,
    },
    title2: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 12
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
                <View style={{position: 'absolute', top: '40px', right: '40px'}}>
                    <Image src={htlLogo128} style={{width: '50px', height: '50px'}}/>
                </View>
                <View style={{textAlign: 'center', margin: 20, marginTop: 150, width: '100%'}}>
                    <Text style={styles.title1}>Anmeldung für das Schuljahr 2024/2025</Text>

                    <Text style={{...styles.title2, marginTop: 40}}>{applicant?.details?.firstname} {applicant?.details?.moreFirstname && `${applicant?.details?.moreFirstname} `}{applicant?.details?.lastname}, geboren am {moment(applicant?.details?.birthdate).format('DD.MM.YYYY')}</Text>
                    <Text style={{...styles.text, marginTop: 15, marginBottom: 15}}>meldet sich an der HTL Saalfelden für die Abteilung/en:</Text>
                    {applicant?.applications?.map(app => <Text key={app.priority} style={{...styles.title2, marginBottom: 5}}>{app.priority}. {app.schoolClass?.title}</Text>)}
                    <Text style={{...styles.text, marginTop: 15}}>an.</Text>

                    <Text style={{...styles.text, textAlign: 'right', marginTop: 50}}>---------------------------------------------------------</Text>
                    <Text style={{...styles.text, textAlign: 'right'}}>Unterschrift des/der Erziehungsberechtigen</Text>

                    <Text style={{...styles.text, textAlign: 'left', marginTop: 5}}>optionale Angaben:</Text>
                    <Text style={{...styles.text, textAlign: 'left', marginTop: 15}}>
                        Zudem gebe ich die Einwilligung, dass Fotos bzw. Videos, welche in Schulveranstaltungen erstellt werden, auf der Homepage der Schule, auf Instagramm, im Jahresbericht der Schule, lokalen Medien und Berichten in Tageszeitungen, Rundfunk und Fernsehen veröffentlicht werden dürfen. <br />
                        Dem Unterfertigten steht grundsätzlich das Recht auf Auskunft, Berechtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu. Diese Rechte können gegenüber der Höhere Technische Bundeslehranstalt Saalfelden geltend gemacht werden, wenn die Verarbeitung der personenbezogenen Daten gegen geltendes Datenschutzrecht verstößt oder datenschutzrechtliche Ansprüche sonst in einer Weise verletzt worden sind. Dann ist eine Beschwerde an die Österreichische Datenschutzbehörde als zuständige Aufsichtsbehörde gemäß Art. 77 DSGVO zu erheben. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt. 
                    </Text>

                    <Text style={{...styles.text, textAlign: 'right', marginTop: 50}}>---------------------------------------------------------</Text>
                    <Text style={{...styles.text, textAlign: 'right'}}>Unterschrift des/der Erziehungsberechtigen</Text>
                </View>
            </Page>
        </Document>
    )
}