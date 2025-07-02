import User from "../model/user.js";

class adminController {
  async getAllUsers(req, res, next) {
    try {
      const adminId = req.user.userId;
      if (!adminId) {
        return res.status(401).json({ error: "Authorization required" });
      }

      const users = await User.find().select('-password -refreshToken -__v');
      
     
      const transformedUsers = users.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar || '/default-avatar.png',
        role: user.roles,
        status: user.isActive ? 'active' : 'suspended',
        joinDate: new Date(user.createdAt).toLocaleDateString(),
        lastActive: new Date(user.updatedAt).toLocaleString(),
        coursesEnrolled: user.courses?.length || 0,
        coursesCreated: user.taughtCourses?.length || 0
      }));

      res.status(200).json({
        success: true,
        count: transformedUsers.length,
        data: transformedUsers,
        message: "Users retrieved successfully"
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
        return res.status(401).json({ 
          success: false,
          error: "Authorization required" 
        });
      }

      if (targetedUserId === adminId.toString()) {
        return res.status(400).json({ 
          success: false,
          error: "You can't delete yourself as admin" 
        });
      }

      const user = await User.findByIdAndDelete(targetedUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.status(200).json({ 
        success: true,
        message: "User deleted successfully",
        deletedUserId: targetedUserId
      });
    } catch (error) {
      next(error);
    }
  }

   async suspendUser(req, res, next) {
    try {
      const { targetedUserId } = req.params;
      const adminId = req.user.userId;

      if (!adminId) {
        return res.status(401).json({ 
          success: false,
          error: "Authorization required" 
        });
      }

      if (targetedUserId === adminId.toString()) {
        return res.status(400).json({ 
          success: false,
          error: "You can't suspend yourself as admin" 
        });
      }

      const user = await User.findById(targetedUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      // Toggle suspension status
      user.isActive = !user.isActive;
      await user.save();

      res.status(200).json({ 
        success: true,
        message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
        userId: targetedUserId,
        newStatus: user.isActive ? 'active' : 'suspended'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new adminController();