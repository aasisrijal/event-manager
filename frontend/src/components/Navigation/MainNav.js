import React, {useContext} from 'react';
import { NavLink } from 'react-router-dom';
import './MainNav.css';
import AuthContext from '../../context/auth-context';


const MainNav = props =>  {
	const context = useContext(AuthContext);
	
      return (
        <header className="main-nav">
          <div className="main-nav-logo">
            <h1>EasyEvent</h1>
          </div>
          <nav className="main-nav-items">
            <ul>
              {!context.token && (
                <li>
                  <NavLink to="/auth">Authenticate</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/events">Events</NavLink>
              </li>
              {context.token && (
              	<React.Fragment>
                <li>
                  <NavLink to="/bookings">Bookings</NavLink>
                </li>
                <li>
                  <button onClick={context.logout} >Logout</button>
                </li>
                </React.Fragment>
              )}
            </ul>
          </nav>
        </header>
      );
	   
};

export default MainNav;