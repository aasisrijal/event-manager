import React from 'react';
import './Auth.css';
import AuthContext from '../context/auth-context';


class AuthPage extends React.Component {
	state = {
		isLogin: true
	}

	static contextType = AuthContext;

	constructor(props) {
		super(props);
		this.emailEl = React.createRef();
		this.passwordEl = React.createRef();
	}

	submitHandler = (event) => {
		event.preventDefault();
		const email = this.emailEl.current.value;
		const password = this.passwordEl.current.value;

		if (email.trim().length === 0 || password.trim().length === 0) {
			return;
		}

		let requestBody = {
			query: `
				query {
					login(email: "${email}", password:"${password}") {
						userId
						token
						tokenExpiration
					}
				}
			`
		};

		if (!this.state.isLogin) {
		 requestBody = {
			query: `
				mutation {
					createUser(userInput: {email: "${email}", password: "${password}"}) {
						_id
						email
					}
				}
			`
		};
		}

		

		fetch('http://localhost:5000/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		}).then(res => {
			if (res.status !== 200 && res.status !== 201) {
				throw new Error('Failed');
			}
			return res.json();
		})
		.then( resData => {
			if (resData.data.login.token) {
				this.context.login(resData.data)
			}
		})
		.catch(err => {
			console.log(err);
		});
	}

	switchHandler = () => {
		this.setState(prevState => {
			return {isLogin: !prevState.isLogin}
		})
	}

	render() {
		return (
			<form className="auth-form" onSubmit={this.submitHandler} >
			<div className="form-control">
				<label htmlFor="email">Email</label>   
				<input type="email" id="email" ref={this.emailEl} />
			</div>
			<div className="form-control">
				<label htmlFor="password">Password</label>   
				<input type="password" id="password" ref={this.passwordEl} />
			</div>
			<div className="form-actions">
				<button type="submit">Submit</button> 
				<button type="submit" onClick={this.switchHandler} >Switch to {this.state.isLogin ? 'SignUp' : 'Login'} </button>   
				  
			</div>
			</form>
		)
	}
}

export default AuthPage;