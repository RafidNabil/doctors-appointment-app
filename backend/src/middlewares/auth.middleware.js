import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.split(" ")[1];

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      const role = await prisma.role.findUnique({
        where: {
          name: req.user.role,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const userPermissions = role.permissions.map(
        (rolePermission) => rolePermission.permission.name
      );

      const hasPermission = permissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};