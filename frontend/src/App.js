import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth';
import EventsPage from './pages/Events';
import BookingsPage from './pages/Bookings';
import MainNav from './components/Navigation/MainNav';
import AuthContext from './context/auth-context';
import './App.css';

class App extends React.Component {
  state = {
    token: null, 
    userId: null
  };

  login = (token, userId, tokenExpiration) => {
    this.setState({token:token, userId:userId});
  }

  logout = () => {
    this.setState({ token:null, userId:null });
  }

  render() {
  return (
    <BrowserRouter>
    <AuthContext.Provider value={{
        token:this.state.token,
        userId:this.state.userId,
        login:this.login,
        logout:this.logout
       }} >
    	<MainNav />
    	<main className="main-content">
	    	<Switch>
	        {!this.state.token && <Redirect from='/' to='/auth' exact />} 
          {this.state.token && <Redirect from='/' to='/events' exact />} 
          {this.state.token && <Redirect from='/auth' to='/events' exact />} 
	        {!this.state.token && <Route path='/auth' component={AuthPage} /> }  
	        <Route path='/events' component={EventsPage} />   
	        {this.state.token && <Route path='/bookings' component={BookingsPage} /> }       
	        </Switch>
        </main>
      </AuthContext.Provider >
    </BrowserRouter>
  );
}
}

export default App;
