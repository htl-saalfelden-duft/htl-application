import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function main() {
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
            key: 'inProgress',
            title: "in Arbeit"
        },
        {
            key: 'completed',
            title: "abgeschlossen"
        }
    ]
    applicationStatuses.forEach(async (appStatus) => {
        await prisma.applicationStatus.upsert({
            where: { key: appStatus.key  },
            update: {},
            create: appStatus
        })
    })

    const religions = ["AAGÖ","ALEVI","altkath.","armen.-apostol.","armen.-kath.","äthiopisch-katholisch","Bahai","buddhist.","bulgarisch-katholisch","bulg.-orth.","byzantinisch-katholisch","chaldäisch-katholisch","CofE","Christengemeinschaft","EmK","evang. A.B.","evang. H.B.","freikl.","freikl. BBGÖ","freikl. BEG","freikl. ECG","freikl. FCGÖ","freikl. MFÖ","griech.-kath.","griech.-orth.","hinduistisch","HRÖ","islam. (IGGÖ)","israel.","italo-albanisch","Jehovas Zeugen","Kirche der STA","Kirche Jesu Christi HLT","koptisch-katholisch","kopt.-orth.","maronitisch-katholisch","melkitisch-katholisch","neuapostol.","o.B.","orth.","PfK Gem. Gottes iÖ","röm.-kath.","rumänisch-katholisch","rumän.-orth.","russ.-orth.","ruthenisch-katholisch","islam. (SCHIA)","Sikh","slowakisch-katholisch","sonst","syrisch-katholisch","syro-malabar-katholisch","syro-malankar-katholisch","ukrainisch-katholisch","ungarisch-katholisch","VPKÖ","Vereinigungskirsch","",]
    religions.forEach(async (title) => {
        await prisma.religion.upsert({
            where: { title},
            update: {},
            create: {
                title
            }
        })
    })

    const languages = ["Malayisch","Maltesisch","Mongolisch","Niederländisch/Flämisch","Norwegisch","Pashto","Persisch (Farsi)","Polnisch","Portugiesisch","Punjabi","Rätoromanisch/Rumantsch","Romanes","Rumänisch","Russisch","Schwedisch","Serbisch","Serbokroatisch","Singalesisch","Slowakisch","Slowenisch","Sonstige afrikanische Sprachen","Sonstige asiatische Sprachen","Sonstige europäische Sprachen","Sonstige Sprache(n)","Spanisch","Suaheli","Syrisch","Tagalog","Tamilisch","Thailändisch","Tschechisch","Tschetschenisch","Türkisch","Ukrainisch","Ungarisch","Urdu","Vietnamesisch","Vlachisch","Weißrussisch","Windisch","Yoruba","",]
    languages.forEach(async (title) => {
        await prisma.language.upsert({
            where: { title},
            update: {},
            create: {
                title
            }
        })
    })
    
    const countries = ["Afghanistan","Ägypten","Albanien","Algerien","Andorra","Angola","Antigua und Barbuda","Argentinien","Armenien","Aserbaidschan","Äthiopien","Australien","Bahamas","Bahrein","Bangladesch","Barbados","Belgien","Belize","Benin","Bhutan","Bolivien","Bosnien-Herzegowina","Botswana","Brasilien","Brunei","Bulgarien","Burkina Faso","Burundi","Chile","China (Republik/Taiwan)","China (Volksrepublik)","Cote d'Ivoire","Dänemark","Deutschland","Dominica","Dominikanische Republik","Dschibuti","Ekuador","El Salvador","Eritrea","Estland","Fidschi","Finnland","Frankreich","Gabun","Gambia","Georgien","Ghana","Grenada","Griechenland","Großbritannien","Guatemala","Guinea","Guinea (Äquatorial-G.)","Guinea-Bissau","Guyana","Haiti","Honduras","Indien","Indonesien","Irak","Iran","Irland","Island","Israel","Italien","Jamaika","Japan","Jemen","Jordanien","Kambodscha","Kamerun","Kanada","Kap Verde","Kasachstan","Katar","Kenia","Kirgisien","Kiribati","Kolumbien","Komoren","Kongo (Demokrat.Republik)","Kongo (Republik)","Korea (demokrat. VR/Nord)","Korea (Republik/Süd)","Kosovo","Kostarika","Kroatien","Kuba","Kuwait","Laos","Lesotho","Lettland","Libanon","Liberia","Libyen","Liechtenstein","Litauen","Luxemburg","Madagaskar","Malawi","Malaysia","Malediven","Mali","Malta","Marokko","Marshallinseln","Mauretanien","Mauritius","Mazedonien","Mexiko","Mikronesien","Moldova","Monaco","Mongolei","Montenegro","Mosambik","Myanmar (Birma)","Namibia","Nauru","Nepal","Neuseeland","Niederlande","Niger","Nigeria","Nikaragua","Niue","Norwegen","Oman","Österreich","Osttimor","Pakistan","Palästina","Palau Inseln","Panama","Papua-Neuguinea","Paraguay","Peru","Philippinen","Polen","Portugal","Ruanda","Rumänien","Russland","Sahara","Salomonen","Sambia","Samoa","San Marino","Sankt Kitts und Nevis","Sankt Lucia","Sankt Vincent/Grenadinen","Sao Tome und Principe","Saudi-Arabien","Schweden","Schweiz","Senegal","Serbien","Serbien und Montenegro","Seychellen","Sierra Leone","Simbabwe","Singapur","Slowakei","Slowenien","Somalia","Spanien","Sri Lanka","Staatenlos","Staatsbürgerschaft ungeklärt","Südafrika","Sudan","Surinam","Swasiland","Syrien","Tadschikistan","Tansania","Thailand","Togo","Tonga","Trinidad und Tobago","Tschad","Tschechien","Tunesien","Türkei","Turkmenistan","Tuvalu","Uganda","Ukraine","Unbekannt","Ungarn","Uruguay","Usbekistan","Vanuatu","Vatikan","Venezuela","Vereinigte arab. Emirate","Vereinigte Staaten von Amerika","Vietnam","Weißrussland","Zentralafrikan. Republik","Zypern"]
    countries.forEach(async (title) => {
        await prisma.country.upsert({
            where: { title},
            update: {},
            create: {
                title
            }
        })
    })
    
    const contactTypes = [
    {
        key: "own",
        title: "Eigene"
    },
    {
        key: "mother",
        title: "Mutter"
    },
    {
        key: "father",
        title: "Vater"
    }]
    contactTypes.forEach(async (contType) => {
        await prisma.contactType.upsert({
            where: { key: contType.key },
            update: {},
            create: contType
        })
    })

    const sex = ["männlich","weiblich","divers","offen","keine Angabe","inter",]
    sex.forEach(async (title) => {
        await prisma.sex.upsert({
            where: { title},
            update: {},
            create: {
                title
            }
        })
    })    
    
    const schoolClass: Prisma.SchoolClassCreateWithoutApplicationsInput = {
        title: "1AHINF",
        year: "24/25",
        maxPupils: 36
    }

    await prisma.schoolClass.upsert({
        where: { title_year: {title: schoolClass.title, year: schoolClass.year}},
        update: {},
        create: schoolClass
    })

    const schoolReportGroups = ["AHS","Standard",]
    schoolReportGroups.forEach(async (title) => {
        await prisma.schoolReportGroup.upsert({
            where: { title},
            update: {},
            create: {
                title
            }
        })
    }) 
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