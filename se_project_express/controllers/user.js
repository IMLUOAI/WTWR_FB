const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  DuplicatedMongodbError,
  BadInternalServerError
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");
const { handleError } = require("../utils/handleError");

// getCurrentUser

module.exports.getCurrentUser = (req, res, next) =>
  User.findById({ _id: req.params.userId })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user with matching ID found');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("The id is an invalid format"));
      } else {
        next(err);
      }
    });

// updateCurrentUser

module.exports.updateCurrentUser = async (req, res) => {
  const { name, avatar } = req.body;
  const updateData = { name, avatar };

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    return res.send({ data: user });
  } catch (err) {
    return handleError(err, res);
  }
};

// createUser

module.exports.createUser = async (req, res) => {
  const { email, password, name, avatar } = req.body;
  if (!email || !password || !name || !avatar) {
    return res
      .status(INVALID_ID)
      .send({ message: "Name, email, password are required" });
  }
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = MONGODB_DUPLICATE_ERROR;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      avatar,
    });

    const saveUser = await newUser.save();
    const userResponse = saveUser.toObject();
    delete userResponse.password;

    return res.status(201).send({ data: userResponse });
  } catch (err) {
    return handleError(err, res);
  }
};

// login

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(INVALID_ID)
      .send({ message: "Email and password are required" });
  }

  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.send({ token });
  } catch (err) {
    if (err.message === "Incorrect email or password") {
      return res.status(UNAUTHORIZED).send({ message: err.message });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occured on the server" });
  }
};
