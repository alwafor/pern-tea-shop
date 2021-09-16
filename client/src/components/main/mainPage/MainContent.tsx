import { SectionAll } from './contentSections/SectionAll'

const MainContent: React.FC = () => {

    return (
        <div className={'main_content'}>
            <div className={'main_section'}>
                <SectionAll/>
            </div>
        </div>
    )
}
export default MainContent