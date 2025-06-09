import { sqlConnect, sql } from "../utils/sql.js";
import crypto from "crypto";

export const getUsers = async (req, res) => {
  try {
    const pool = await sqlConnect();
    const result = await pool.request().query("SELECT * FROM dbo.Users");

    res.status(200).json({
      success: true,
      users: result.recordset,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sqlConnect();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM dbo.Users WHERE UserID = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, lastname, phone, email } = req.body;

    const pool = await sqlConnect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("username", sql.VarChar, username)
      .input("lastname", sql.VarChar, lastname || null)
      .input("phone", sql.VarChar, phone || null)
      .input("email", sql.VarChar, email || null).query(`
        UPDATE dbo.Users
        SET username = @username, lastname = @lastname, phone = @phone, email = @email
        WHERE UserID = @id
      `);

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sqlConnect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM dbo.Users WHERE UserID = @id");

    res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva contraseña son requeridas",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "La nueva contraseña debe ser diferente a la contraseña actual",
      });
    }

    const pool = await sqlConnect();

    // Obtener datos actuales del usuario
    const userData = await pool
      .request()
      .input("userId", sql.Int, id)
      .query("SELECT UserID, password FROM dbo.Users WHERE UserID = @userId");

    if (userData.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const user = userData.recordset[0];

    // Verificar usuario actual
    const currentSalt = user.password.slice(0, 10);
    const currentPreHash = currentSalt + currentPassword;
    const currentHashing = crypto.createHash("sha256");
    const currentHash = currentHashing.update(currentPreHash).digest("hex");
    const currentHashSalt = currentSalt + currentHash;

    if (user.password !== currentHashSalt) {
      return res.status(401).json({
        success: false,
        message: "La contraseña actual es incorrecta",
      });
    }

    // Hasheo
    const newSalt = crypto.randomBytes(5).toString("hex");
    const newPreHash = newSalt + newPassword;
    const newHashing = crypto.createHash("sha256");
    const newHash = newHashing.update(newPreHash).digest("hex");
    const newHashedPassword = newSalt + newHash;

    // Actualizar
    await pool
      .request()
      .input("userId", sql.Int, id)
      .input("newPassword", sql.VarChar, newHashedPassword)
      .query(
        "UPDATE dbo.Users SET password = @newPassword WHERE UserID = @userId"
      );

    res.status(200).json({
      success: true,
      message: "Contraseña cambiada exitosamente",
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};
