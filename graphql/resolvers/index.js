const bcrypt = require('bcryptjs');
const Event = require('../../models/events');
const User = require('../../models/user');


const events = eventIds => {
  return Event.find({_id: {$in: eventIds}})
  .then(events => {
    return events.map(event => {
      return {...event._doc,
             _id: event.id,
             date: new Date(event._doc.date).toISOString(),
              creator: user.bind(this, event.creator
            )}
    })
  })
  .catch(err => {
    throw err;
  })
}


const user = userId => {
  return User.findById(userId)
  .then(user => {
    
      return {...user._doc,
             _id: user.id,
              createdEvents: events.bind(this, user._doc.createdEvents
            )}
    })

  .catch(err => {
    throw err;
  })
}


module.exports = {
      events: () => {
      	return Event.find()
        	.then(events => {
        		return events.map(event => {
        			return { ...event._doc,
        					date: new Date(event._doc.date).toISOString(),
        					creator: user.bind(this, event.creator)
        					 };
        		})
        	})
      },
      createEvent: (args) => {
        
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
                eventCreated =  { ...result._doc,
                  _id: result.id,
                  date: new Date(event._doc.date).toISOString(),
                  creator: user.bind(this, result._doc.creator) };
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
                return { ...result._doc,
                		 password: null,
                		 date: new Date(result._doc.date).toISOString(),
                		  _id: result.id };
              })
              .catch(err => {
                throw err;
              });
          }
    }