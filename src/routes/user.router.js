// routes/user.router.js
import express from 'express';
import * as userController from "../dao/fileSystem/controllers/user/userController.js";

const router = express.Router();

router.get('/current', userController.getCurrentUser);

router.put('/premium/:uid', async (req, res) => {
    const { uid } = req.params;
  
    try {
      const updatedUser = await userController.toggleUserRole(uid);
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      res.json({ message: 'Rol de usuario actualizado con éxito', user: updatedUser });
    } catch (error) {
      console.error(`Error en la ruta /premium/:uid: ${error.message}`);
      res.status(500).json({ error: 'Error al actualizar el rol de usuario', message: error.message });
    }
  });

  
  
  export default router;