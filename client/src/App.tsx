import React from 'react'
import {Route, Switch} from 'react-router-dom'
import LoginPage from "./Components/Auth/LoginPage"
import Header from "./Components/Main/Header"
import UserPage from "./Components/User/UserPage"
import MainPage from "./Components/Main/MainPage/MainPage";
import { CategoryPage } from './Components/Categories/CategoryPage'

const App: React.FC = () => {
    console.log('a')
    return (
        <>
            <Header/>
            <div className={'container'}>
                <Switch>
                    <Route path={'/'} exact render={() => <MainPage/>}/>
                    <Route path={'/login'} render={() => <LoginPage/>}/>
                    <Route path={'/userPage'} render={() => <UserPage/>}/>
                    <Route path={'/category'} render={() => <CategoryPage/>}/>
                </Switch>
            </div>
        </>
    )
}

export default App
