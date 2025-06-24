import User from "../model/user.js";
class adminController {
  async getAllUsers(req, res, next) {
    try {
      const adminId = req.user.userId;
      if (!adminId) {
        res.status(401).json({ error: "Authorization required" });
      }
      const users = await User.find();
      res.status(200).json({
        users: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { targetedUserId } = req.params;
      const adminId = req.user.userId;

      if (!adminId) {
        res.status(401).json({ error: "Authorization required" });
      }

      if (targetedUserId === adminId.toString()) {
        return res
          .status(400)
          .json({ error: "You can't delete yourself as admin" });
      }

      const user = await User.findByIdAndDelete(targetedUserId);

      if (!user) {
        res.status(404).json({
          error: " User not found",
        });
      }

      res.status(200).json({ message: "successfully deleted user" });
    } catch (error) {
      next(error);
    }
  }
}

export default new adminController();
