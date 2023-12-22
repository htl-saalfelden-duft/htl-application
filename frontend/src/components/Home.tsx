import { TabsProvider } from "../contexts/tabs.context"
import ApplicationForm from "./ApplicationForm"


const Home = () => {

    return (
        <TabsProvider>
            <ApplicationForm />
        </TabsProvider>
    )
}

export default Home