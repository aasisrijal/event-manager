const bcrypt = require('bcryptjs');
const Event = require('../../models/events');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const jwt = require('jsonwebtoken');


const transformEvent = event => {
  return {
      ...event._doc,
       _id: event.id,
       date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator
      )}

}


const transformBooking = booking => {
  return { 
      ...booking._doc,
       _id:booking.id,
       user: user.bind(this, booking._doc.user),
       event: singleEvent.bind(this, booking._doc.event),
       createdAt: new Date(booking._doc.createdAt).toISOString(),
       updatedAt: new Date(booking._doc.updatedAt).toISOString() };
}


const events = async eventIds => {

	try{
	
 	 const events = await Event.find({_id: {$in: eventIds}});
 
      return events.map(event => {
      return transformEvent(event);
    });
  }

  catch(err){
    throw err;
  }
}


const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};


const user = async userId => {
	try{
	  const user = await User.findById(userId);
  
      return {...user._doc,
             _id: user.id,
              createdEvents: events.bind(this, user._doc.createdEvents
            )};
    }
	  

  catch(err) {
    throw err;
  }
}


module.exports = {
  events: async () => {
  	try {
  		const events = await Event.find();
		return events.map(event => {
		return transformEvent(event);
	});
  	} catch(err) {
  		throw err;
  	}
  	
    
  },
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated.');
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });

    } catch(err) {
      throw err;
    }
  },

  createEvent: async (args, req) => {
    
    if (!req.isAuth) {
      throw new Error('Unauthenticated.');
    }
    const event = new Event({
    	 	title: args.eventInput.title,
      	description: args.eventInput.description,
      	price: +args.eventInput.price,
      	date: new Date(args.eventInput.date),
            creator: req.userId
    });
    let eventCreated;
    try {
    	const result = await event.save(); 
      	
        eventCreated =  transformEvent(result);
        const creator = await User.findById();
    
        
        if(!creator) {
            throw new Error('User not found');
        }
        creator.createdEvents.push(event);
        await creator.save();

        return eventCreated;
   
    }
	  catch(err)
        {
    	console.log(err);
    	throw err;
   		 };
     },

     createUser: async args => {
     	try {
     		const user = await User.findOne({ email: args.userInput.email });
        
        if (user) {
          throw new Error('User exists already.');
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

        const newUser = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        const result = await newUser.save();
     
        return { ...result._doc,
		  password: null,
  		  _id: result.id };


      } catch(err) {
        throw err;
     
      };
    },

    login: async ({ email, password }) => {
      const user = await User.findOne({ email: email});
      if(!user) {
        throw new Error('User does not exist');
      }
      const isTrue = await bcrypt.compare(password, user.password);
      if (!isTrue) {
        throw new Error('Password is incorrect');
      }
      const token = jwt.sign({userId: user.id, email: user.email}, process.env.SECRET_KEY, {
        expiresIn: '1h'
      });
      return {
        userId: user.id,
        token: token,
        tokenExpiration: 1
      }
    },

    bookEvent : async (args, req) => {
      if (!req.isAuth) {
      throw new Error('Unauthenticated.');
    }
      const fetchedEvent = await Event.findOne({_id: args.eventId})
      const booking = new Booking ({
        user: "5e64c42ef305521c4f1910f8",
        event: fetchedEvent
      });
      const result = await booking.save();
      return transformBooking(result);
    },

    cancelBooking: async (args, req) => {
      if (!req.isAuth) {
      throw new Error('Unauthenticated.');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }      
}
  