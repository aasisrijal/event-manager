import React from 'react';
import './Events.css';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';


class EventsPage extends React.Component {
	state = {
		creating: false,
		events: []
	}

	constructor(props) {
		super(props);
		this.titleEl = React.createRef();
		this.priceEl = React.createRef();
		this.dateEl = React.createRef();
		this.descriptionEl = React.createRef();
	}

	static contextType = AuthContext;

	componentDidMount() {
		this.fetchEvents();
	}

	startCreateEventHandler = () => {
		this.setState({creating: true});
	}

	modalConfrimHandler = () => {
		this.setState({creating: false});
		const title = this.titleEl.current.value;
		const price = +this.priceEl.current.value;
		const date = this.dateEl.current.value;
		const description = this.descriptionEl.current.value;

		if (title.trim().length === 0 || price.length  <= 0 || date.trim().length === 0 || description.trim().length === 0 ){
			return;
		}

		const event = {title, price, date, description};
		console.log(event);

		
		const requestBody = {
			query: `
				mutation {
					createEvent(eventInput: {title: "${title}", description: "${description}", price: "${price}", date:"${date}"}) {
						_id
						title
						description
						price
						date
						creator {
							_id
							email
						}
					}
				}
			`
		};
		

		const token = this.context.token.login.token;
		

		fetch('http://localhost:5000/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+ token
			},
			body: JSON.stringify(requestBody)
		}).then(res => {
			if (res.status !== 200 && res.status !== 201) {
				throw new Error('Failed');
			}
			return res.json();
		})
		.then( resData => {
			if (resData) {
				console.log(resData);
				this.fetchEvents();
			}
		})
		.catch(err => {
			console.log(err);
		});

	};

	modalCancelHandler = () => {
		this.setState({creating: false});
	};

	fetchEvents() {
		const requestBody = {
			query: `
				query {
					events {
						_id
						title
						description
						price
						date
						creator {
							_id
							email
						}
					}
				}
			`
		};
		
		

		fetch('http://localhost:5000/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				
			},
			body: JSON.stringify(requestBody)
		}).then(res => {
			if (res.status !== 200 && res.status !== 201) {
				throw new Error('Failed');
			}
			return res.json();
		})
		.then( resData => {
			if (resData) {
				const events = resData.data.events;
				this.setState({events: events});
			}
		})
		.catch(err => {
			console.log(err);
		});

	}


	render() {
		const eventList = this.state.events.map(event => {
			return <li className="events-item-list" key={event._id} >{event.title} </li>
		});

		return (
			<React.Fragment>
				{this.state.creating && <Backdrop />}
				{this.state.creating && <Modal title="Add Event" canCancel canConfirm onCancel={this.modalCancelHandler} onConfirm={this.modalConfrimHandler} >
					<form>
						<div className="form-control">
						<label htmlFor="title">Title</label>   
						<input type="text" id="title" ref={this.titleEl} />
					</div>
					<div className="form-control">
						<label htmlFor="price">Price</label>   
						<input type="number" id="price" ref={this.priceEl} />
						</div>
					<div className="form-control">
						<label htmlFor="date">Date</label>   
						<input type="date" id="date" ref={this.dateEl} />
					</div>
					<div className="form-control">
						<label htmlFor="description">Description</label>   
						<textarea id="description" rows="4" ref={this.descriptionEl} ></textarea>
					</div>
					</form>
				</Modal>}
			{this.context.token && <div className="event-control">
				<p>Share your events</p>
					<button className="btn" onClick={this.startCreateEventHandler} >Create Event</button>   
					
				</div>}

			<ul className="events-list">
				{eventList}
			</ul>
			</React.Fragment>
		)
	}
}

export default EventsPage;