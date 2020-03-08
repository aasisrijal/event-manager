const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } =  require('graphql');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config();

const Event = require('./models/events');
const User = require('./models/user');

const app = express();
app.use(bodyParser.json());

const events =[];

//connect to db
mongoose.connect( process.env.MONGO_DB,
	{useNewUrlParser: true,
		useUnifiedTopology: true},
	 () => {
	console.log('connected to mongo atlas')
});

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
    	type Event {
    		_id: ID!
    		title: String!
    		description: String!
    		price: Float!
    		date: String!
    	}

        type User {
            _id: ID!
            email: String!
            password: String
       
        }

    	input EventInput {
    		title: String!
    		description: String!
    		price: String!
    		date: String!
    	}

        input UserInput {
            email: String!
            password: String!
        
        }

        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
      	return Event.find()
        	.then(events => {
        		return events.map(event => {
        			return { ...event._doc };
        		})
        	})
      },
      createEvent: (args) => {
        // const event = {
        // 	_id: Math.random().toString(),
        // 	title: args.eventInput.title,
        // 	description: args.eventInput.description,
        // 	price: +args.eventInput.price,
        // 	date: args.eventInput.date
        // };
        const event = new Event({
        	 	title: args.eventInput.title,
	        	description: args.eventInput.description,
	        	price: +args.eventInput.price,
	        	date: new Date(args.eventInput.date),
                creator: '5e64c42ef305521c4f1910f8'
        });
        let eventCreated;
        return event 
            .save()
        	.then(result => {
                eventCreated =  { ...result._doc,  _id: result.id };
                return User.findById('5e64c42ef305521c4f1910f8');
        		
        	})
            .then(user => {
                if(!user) {
                    throw new Error('User not found');
                }
                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return eventCreated;
            })
        	.catch(err => 
            {
        	console.log(err);
        	throw err;
       		 });
         },

         createUser: args => {
            return User.findOne({ email: args.userInput.email })
              .then(user => {
                if (user) {
                  throw new Error('User exists already.');
                }
                return bcrypt.hash(args.userInput.password, 12);
              })
              .then(hashedPassword => {
                const user = new User({
                  email: args.userInput.email,
                  password: hashedPassword
                });
                return user.save();
              })
              .then(result => {
                return { ...result._doc, password: null, _id: result.id };
              })
              .catch(err => {
                throw err;
              });
          }
    },
    graphiql: true
  })
);

app.listen(3000);