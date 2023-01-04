const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your mail'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'], //INBUILT VALIDATOR
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // CUSTOM VALIDATION
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  // VERIFICATION FEATURES
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  verifyEmailToken: String,
  verifyEmailTokenExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  favorite: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
  ],
});

// PRE QUERY MIDDLEWARES

// HASHING PASSWORD
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// SAVING THE TIME WHEN PASSWORD HAS BEEN CHANGED
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// FINDING ACTIVE USER
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// ADDING FAVORITES (VIRTUAL POPULATE)
userSchema.pre(/^find/, function (next) {
  this.populate('favorite');
  next();
});

// COMPARING SAVED AND ENTERED PASSWORD TO LOGIN
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// METHODS TO SET PASSWORD CHANGING TOKEN.'

// 1) CHECKING WHETHER PASSWORD IS CHANGED AFTER CREATING JWT TOKEN
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// 2) IF NO, UPDATE PASSWORD, HASH IT AND CREATE TOKEN
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3) SETTING WHEN THE TOKEN SHALL EXPIRE
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// ADDING FAVORITE TOUR FOR A USER (REFERENCING TO TOUR)
userSchema.methods.addFavorite = function (tourId) {
  this.favorite.push(tourId);
};

// REMOVING FAVORITE
userSchema.methods.removeFavorite = function (tourId) {
  this.favorite.pull(tourId);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
