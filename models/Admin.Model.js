const {Schema, model} = require('mongoose');

const AdminSchema = new Schema(
  {
     email: {
      type: String,
      required: [true, 'Please enter email']
    },
     passwordHash: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'admin'
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('Admin', AdminSchema);