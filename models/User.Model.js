const {Schema, model} = require('mongoose');

const UserSchema = new Schema(
  {
     username: {
       type: String,
       required: [true, 'Please enter username']
     }, 
     email: {
      type: String,
      required: [true, 'Please enter email']
    },
     passwordHash: {
      type: String,
      required: true
    },
    name:{
      firstName: String,
      lastName: String
    },
    address:{
      address: String,
      postalCode: String,
      city: String,
      coordinates:{
        lat: Number,
        lng: Number
      }
    },
    orderHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'order'
    }],
  },
  {
    timestamps: true
  }
);

UserSchema.index({ 'email': 1}, {unique: true});
UserSchema.index({ 'username': 1}, {unique: true});

module.exports = model('User', UserSchema);