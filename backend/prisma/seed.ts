import { Prisma, PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()
async function main() {

    const admin = {
        name: 'Dietmar Duft',
        email: 'dietmar@duft.it',
        userRoleKey: 'admin',
        passwordHash: crypto.createHmac('sha512', process.env.HMAC_SECRET).update('secret').digest('hex')
    }

    await prisma.user.upsert({
        where: { email: admin.email },
        update: {},
        create: admin
    })

    const applicationStatuses = [
        {
            key: 'created',
            title: "angelegt"
        },
        {
            key: 'applied',
            title: "abgegeben"
        },
        {
            key: 'accepted',
            title: "angenommen"
        },
        {
            key: 'rejected',
            title: "abgelehnt"
        }
    ]
    for (let index = 0; index < applicationStatuses.length; index++) {
        const appStatus = applicationStatuses[index];

        await prisma.applicationStatus.upsert({
            where: { key: appStatus.key },
            update: {},
            create: appStatus
        })
    }

    const applicantStatuses = [
        {
            key: 'created',
            title: "angelegt"
        },
        {
            key: 'applied',
            title: "abgegeben"
        },
        {
            key: 'registered',
            title: "angemeldet"
        },        
        {
            key: 'completed',
            title: "abgeschlossen"
        }
    ]
    for (let index = 0; index < applicantStatuses.length; index++) {
        const appStatus = applicantStatuses[index];

        await prisma.applicantStatus.upsert({
            where: { key: appStatus.key },
            update: {},
            create: appStatus
        })
    }    

    const religions = ["AAGÖ", "ALEVI", "altkath.", "armen.-apostol.", "armen.-kath.", "äthiopisch-katholisch", "Bahai", "buddhist.", "bulgarisch-katholisch", "bulg.-orth.", "byzantinisch-katholisch", "chaldäisch-katholisch", "CofE", "Christengemeinschaft", "EmK", "evang. A.B.", "evang. H.B.", "freikl.", "freikl. BBGÖ", "freikl. BEG", "freikl. ECG", "freikl. FCGÖ", "freikl. MFÖ", "griech.-kath.", "griech.-orth.", "hinduistisch", "HRÖ", "islam. (IGGÖ)", "israel.", "italo-albanisch", "Jehovas Zeugen", "Kirche der STA", "Kirche Jesu Christi HLT", "koptisch-katholisch", "kopt.-orth.", "maronitisch-katholisch", "melkitisch-katholisch", "neuapostol.", "o.B.", "orth.", "PfK Gem. Gottes iÖ", "röm.-kath.", "rumänisch-katholisch", "rumän.-orth.", "russ.-orth.", "ruthenisch-katholisch", "islam. (SCHIA)", "Sikh", "slowakisch-katholisch", "sonst", "syrisch-katholisch", "syro-malabar-katholisch", "syro-malankar-katholisch", "ukrainisch-katholisch", "ungarisch-katholisch", "VPKÖ", "Vereinigungskirsch"]
    for (let index = 0; index < religions.length; index++) {
        const title = religions[index];
        await prisma.religion.upsert({
            where: { title },
            update: {},
            create: {
                title
            }
        })
    }

    const languages = ["Afrikaans", "Albanisch", "Amerikanische Sprachen", "Amharisch", "Arabisch", "Aramäisch", "Armenisch", "Bantusprachen", "Bengalisch", "BKS (Bosnisch/Kroatisch/Serbisch)", "Bosnisch", "Bulgarisch", "Burgenland-Kroatisch", "Chinesisch", "Chinesisch (Mandarin)", "Chinesisch (Kantonesisch)", "Dänisch", "Dari", "Deutsch", "Englisch", "Estnisch", "Finnisch", "Französisch", "Georgisch", "Griechisch", "Hebräisch", "Hindi", "Indonesisch", "Irisch", "Isländisch", "Italienisch", "Japanisch", "Kambodschanisch", "Koreanisch", "Kroatisch", "Kurdisch", "Ladinisch", "Lettisch", "Litauisch", "Makedonisch", "Malayalam", "Malayisch", "Maltesisch", "Mongolisch", "Niederländisch/Flämisch", "Norwegisch", "Pashto", "Persisch (Farsi)", "Polnisch", "Portugiesisch", "Punjabi", "Rätoromanisch/Rumantsch", "Romanes", "Rumänisch", "Russisch", "Schwedisch", "Serbisch", "Serbokroatisch", "Singalesisch", "Slowakisch", "Slowenisch", "Sonstige afrikanische Sprachen", "Sonstige asiatische Sprachen", "Sonstige europäische Sprachen", "Sonstige Sprache(n)", "Spanisch", "Suaheli", "Syrisch", "Tagalog", "Tamilisch", "Thailändisch", "Tschechisch", "Tschetschenisch", "Türkisch", "Ukrainisch", "Ungarisch", "Urdu", "Vietnamesisch", "Vlachisch", "Weißrussisch", "Windisch", "Yoruba"]
    for (let index = 0; index < languages.length; index++) {
        const title = languages[index];
        await prisma.language.upsert({
            where: { title },
            update: {},
            create: {
                title
            }
        })   
    }

    const countries = ["Afghanistan", "Ägypten", "Albanien", "Algerien", "Andorra", "Angola", "Antigua und Barbuda", "Argentinien", "Armenien", "Aserbaidschan", "Äthiopien", "Australien", "Bahamas", "Bahrein", "Bangladesch", "Barbados", "Belgien", "Belize", "Benin", "Bhutan", "Bolivien", "Bosnien-Herzegowina", "Botswana", "Brasilien", "Brunei", "Bulgarien", "Burkina Faso", "Burundi", "Chile", "China (Republik/Taiwan)", "China (Volksrepublik)", "Cote d'Ivoire", "Dänemark", "Deutschland", "Dominica", "Dominikanische Republik", "Dschibuti", "Ekuador", "El Salvador", "Eritrea", "Estland", "Fidschi", "Finnland", "Frankreich", "Gabun", "Gambia", "Georgien", "Ghana", "Grenada", "Griechenland", "Großbritannien", "Guatemala", "Guinea", "Guinea (Äquatorial-G.)", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Indien", "Indonesien", "Irak", "Iran", "Irland", "Island", "Israel", "Italien", "Jamaika", "Japan", "Jemen", "Jordanien", "Kambodscha", "Kamerun", "Kanada", "Kap Verde", "Kasachstan", "Katar", "Kenia", "Kirgisien", "Kiribati", "Kolumbien", "Komoren", "Kongo (Demokrat.Republik)", "Kongo (Republik)", "Korea (demokrat. VR/Nord)", "Korea (Republik/Süd)", "Kosovo", "Kostarika", "Kroatien", "Kuba", "Kuwait", "Laos", "Lesotho", "Lettland", "Libanon", "Liberia", "Libyen", "Liechtenstein", "Litauen", "Luxemburg", "Madagaskar", "Malawi", "Malaysia", "Malediven", "Mali", "Malta", "Marokko", "Marshallinseln", "Mauretanien", "Mauritius", "Mazedonien", "Mexiko", "Mikronesien", "Moldova", "Monaco", "Mongolei", "Montenegro", "Mosambik", "Myanmar (Birma)", "Namibia", "Nauru", "Nepal", "Neuseeland", "Niederlande", "Niger", "Nigeria", "Nikaragua", "Niue", "Norwegen", "Oman", "Österreich", "Osttimor", "Pakistan", "Palästina", "Palau Inseln", "Panama", "Papua-Neuguinea", "Paraguay", "Peru", "Philippinen", "Polen", "Portugal", "Ruanda", "Rumänien", "Russland", "Sahara", "Salomonen", "Sambia", "Samoa", "San Marino", "Sankt Kitts und Nevis", "Sankt Lucia", "Sankt Vincent/Grenadinen", "Sao Tome und Principe", "Saudi-Arabien", "Schweden", "Schweiz", "Senegal", "Serbien", "Serbien und Montenegro", "Seychellen", "Sierra Leone", "Simbabwe", "Singapur", "Slowakei", "Slowenien", "Somalia", "Spanien", "Sri Lanka", "Staatenlos", "Staatsbürgerschaft ungeklärt", "Südafrika", "Sudan", "Surinam", "Swasiland", "Syrien", "Tadschikistan", "Tansania", "Thailand", "Togo", "Tonga", "Trinidad und Tobago", "Tschad", "Tschechien", "Tunesien", "Türkei", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "Unbekannt", "Ungarn", "Uruguay", "Usbekistan", "Vanuatu", "Vatikan", "Venezuela", "Vereinigte arab. Emirate", "Vereinigte Staaten von Amerika", "Vietnam", "Weißrussland", "Zentralafrikan. Republik", "Zypern"]
    for (let index = 0; index < countries.length; index++) {
        const title = countries[index];
        await prisma.country.upsert({
            where: { title },
            update: {},
            create: {
                title
            }
        })
    }

    const userRoles = [
        {
            key: "admin",
            title: "Administrator"
        },
        {
            key: "keyuser",
            title: "Key-User"
        },
        {
            key: "user",
            title: "User"
        }
    ]
    for (let index = 0; index < userRoles.length; index++) {
        const userRole = userRoles[index];

        await prisma.userRole.upsert({
            where: { key: userRole.key },
            update: {},
            create: userRole
        })   
    }

    const contactTypes = [
        {
            key: "applicant",
            title: "Eigene"
        },
        {
            key: "mother",
            title: "Mutter"
        },
        {
            key: "father",
            title: "Vater"
        }
    ]
    for (let index = 0; index < contactTypes.length; index++) {
        const contType = contactTypes[index];

        await prisma.contactType.upsert({
            where: { key: contType.key },
            update: {},
            create: contType
        })
    }

    const sex = ["männlich", "weiblich", "divers", "offen", "keine Angabe", "inter",]
    for (let index = 0; index < sex.length; index++) {
        const title = sex[index];

        await prisma.sex.upsert({
            where: { title },
            update: {},
            create: {
                title
            }
        })
    }

    const schoolClasses: Prisma.SchoolClassCreateWithoutApplicationsInput[] = [
        {
            title: "Höhere Abteilung für Bautechnik - Saalfelden",
            year: "24/25",
            maxPupils: 36
        },
        {
            title: "Höhere Abteilung für Elektrotechnik - Saalfelden",
            year: "24/25",
            maxPupils: 36
        },
        {
            title: "Höhere Abteilung für Informatik - St.Johann",
            year: "24/25",
            maxPupils: 36
        },
        {
            title: "Höhere Abteilung für Mechatronik - Saalfelden",
            year: "24/25",
            maxPupils: 36
        },
        {
            title: "Höhere Abteilung für Mechatronik - St.Johann",
            year: "24/25",
            maxPupils: 36
        },
        {
            title: "Fachschule für Informationstechnik mit Sportschwerpunkt - Saalfelden",
            year: "24/25",
            maxPupils: 36
        },

    ]
    for (let index = 0; index < schoolClasses.length; index++) {
        const schoolClass = schoolClasses[index];

        await prisma.schoolClass.upsert({
            where: { title_year: { title: schoolClass.title, year: schoolClass.year } },
            update: {},
            create: schoolClass
        })   
    }


    const schoolReportGroups = ["AHS", "Standard"]
    for (let index = 0; index < schoolReportGroups.length; index++) {
        const title = schoolReportGroups[index];
        
        await prisma.schoolReportGroup.upsert({
            where: { title },
            update: {},
            create: {
                title
            }
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })