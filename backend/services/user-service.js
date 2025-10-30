const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { admin, db } = require('../firebase-config');

// Get users collection from shared Firebase instance
const usersCollection = db ? db.collection('users') : null;

class UserService {
  /**
   * Find or create user from OAuth data
   * @param {Object} userData - User data from OAuth provider
   * @returns {Promise<Object>} User object
   */
  async findOrCreateUser(userData) {
    try {
      const { appleId, googleId, email, name, photo, authProvider } = userData;

      // Try to find user by OAuth ID
      let query;
      if (appleId) {
        query = usersCollection.where('appleId', '==', appleId);
      } else if (googleId) {
        query = usersCollection.where('googleId', '==', googleId);
      }

      const snapshot = await query.get();

      if (!snapshot.empty) {
        // User exists, return it
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        };
      }

      // Check if user exists with same email
      const emailQuery = usersCollection.where('email', '==', email);
      const emailSnapshot = await emailQuery.get();

      if (!emailSnapshot.empty) {
        // User exists with same email, update OAuth ID
        const doc = emailSnapshot.docs[0];
        const updateData = {};
        if (appleId) updateData.appleId = appleId;
        if (googleId) updateData.googleId = googleId;
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await doc.ref.update(updateData);

        return {
          id: doc.id,
          ...doc.data(),
          ...updateData,
        };
      }

      // Create new user
      const newUser = {
        email,
        name: name || email.split('@')[0],
        photo: photo || null,
        authProvider,
        appleId: appleId || null,
        googleId: googleId || null,
        subscription: {
          status: 'none',
          plan: null,
          trialEndsAt: null,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await usersCollection.add(newUser);

      logger.info('New user created', { userId: docRef.id, email });

      return {
        id: docRef.id,
        ...newUser,
      };
    } catch (error) {
      logger.error('Error in findOrCreateUser', error);
      throw error;
    }
  }

  /**
   * Create user with email/password
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const { email, password, name, authProvider } = userData;

      // Check if user exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        email,
        password: hashedPassword,
        name,
        authProvider: authProvider || 'email',
        subscription: {
          status: 'none',
          plan: null,
          trialEndsAt: null,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await usersCollection.add(newUser);

      logger.info('User created with email/password', { userId: docRef.id, email });

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return {
        id: docRef.id,
        ...userWithoutPassword,
      };
    } catch (error) {
      logger.error('Error creating user', error);
      throw error;
    }
  }

  /**
   * Authenticate user with email/password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object|null>} User object or null if invalid
   */
  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return null;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error authenticating user', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(userId) {
    try {
      const doc = await usersCollection.doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      // Remove password from returned data
      const { password, ...userData } = data;

      return {
        id: doc.id,
        ...userData,
      };
    } catch (error) {
      logger.error('Error getting user by ID', error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByEmail(email) {
    try {
      const snapshot = await usersCollection.where('email', '==', email).limit(1).get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      logger.error('Error getting user by email', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUserProfile(userId, profileData) {
    try {
      const updateData = {
        ...profileData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.appleId;
      delete updateData.googleId;

      await usersCollection.doc(userId).update(updateData);

      logger.info('User profile updated', { userId });

      return await this.getUserById(userId);
    } catch (error) {
      logger.error('Error updating user profile', error);
      throw error;
    }
  }

  /**
   * Update user subscription status
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<void>}
   */
  async updateUserSubscription(userId, subscriptionData) {
    try {
      await usersCollection.doc(userId).update({
        subscription: subscriptionData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info('User subscription updated', { userId, status: subscriptionData.status });
    } catch (error) {
      logger.error('Error updating user subscription', error);
      throw error;
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      await usersCollection.doc(userId).delete();
      logger.info('User deleted', { userId });
    } catch (error) {
      logger.error('Error deleting user', error);
      throw error;
    }
  }
}

module.exports = new UserService();
