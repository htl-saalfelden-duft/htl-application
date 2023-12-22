import React, {useContext, useState} from 'react'


interface Props {
    children: any
    index: number
}

interface ApplicationValues {
    index: number
}

const ApplicationContext = React.createContext<ApplicationValues>(undefined as any )

const useApplication = () => useContext(ApplicationContext)
const ApplicationProvider = (props: Props) => {

    const [index, setIndex] = useState(props.index)

    const value = {
        index
    }

    return (
        <ApplicationContext.Provider value={value}>{props.children}</ApplicationContext.Provider>
    )
}

export { ApplicationProvider, useApplication }
