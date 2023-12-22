import React, {useContext, useState} from 'react'


interface Props {
    children: any
    index: number
}

interface ContactValues {
    index: number
}

const ContactContext = React.createContext<ContactValues>(undefined as any )

const useContact = () => useContext(ContactContext)
const ContactProvider = (props: Props) => {

    const [index, setIndex] = useState(props.index)

    const value = {
        index
    }

    return (
        <ContactContext.Provider value={value}>{props.children}</ContactContext.Provider>
    )
}

export { ContactProvider, useContact }
