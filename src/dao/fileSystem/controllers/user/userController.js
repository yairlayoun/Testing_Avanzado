// controllers/userController.js
import UserDto from '../dto/user.dto.js';
import userRepository from '../dao/repositories/userRepository.js';
import { Router } from "express";
import CustomError from "../../../../utils/errors/Custom.error.js";
import generateUserErrorInfo from "../../../../utils/errors/info.error.js";
import EnumError from "../../../../utils/errors/enum.error.js";
import generateUsers from require('../../../../utils/mock.util.js')
import logger from '../../../../middleware/logger/loggerCustomLevelOptions.js';

const router = Router();
const users = [];

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.getUserByEmail(email);
    if (user) {
      const userDto = new UserDto(user._id, user.email, user.first_name);
      req.session.user = userDto; 
      res.json({ message: 'Inicio de sesión exitoso' });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', message: error.message });
  }
};

export const showProfile = (req, res) => {
  try {
    const userDto = req.session.user;

    if (!userDto) {
      // Si el usuario no está autenticado, redirige al login u otra acción
      return res.redirect('/login');
    }

    res.render('index', { user: userDto });
  } catch (error) {
    logger.error("Error en showProfile controller", error);
    res.status(500).json({ error: 'Error al mostrar el perfil', message: error.message });
  }
};

router.get('/', (req, res) => {
  const { numUsers = 1 } = req.query
  const user = generateUsers(numUsers)

  res.json({ message: user })
})


router.post("/", (req, res) => {
  const { first_name, last_name, age, email } = req.body;
  if (!first_name || !last_name || !email) {
    CustomError.createError({
      name: "User creation error",
      cause: generateUserErrorInfo({ first_name, last_name, email }),
      message: "Error trying to create an user",
      code: EnumError.INVALID_TYPES_ERROR,
    });
  }

  const user = {
    first_name,
    last_name,
    age,
    email,
  };

  if (users.length === 0) {
    user.id = 1;
  } else {
    user.id = users[users.length - 1].id + 1;
  }

  users.push(user);

  res.json({ message: user });
});

export const toggleUserRole = async (userId) => {
  try {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new CustomError({
        name: 'User not found',
        cause: generateUserErrorInfo({ userId }),
        message: 'User not found',
        code: EnumError.NOT_FOUND_ERROR,
      });
    }

    // Cambiar el rol del usuario
    const newRole = user.role === 'user' ? 'premium' : 'user';
    const updatedUser = await userRepository.updateUserRole(userId, newRole);

    return updatedUser;
  } catch (error) {
    throw new CustomError({
      name: 'Toggle user role error',
      cause: generateUserErrorInfo({ userId }),
      message: 'Error toggling user role',
      code: EnumError.INTERNAL_SERVER_ERROR,
    });
  }
};

export default router;
