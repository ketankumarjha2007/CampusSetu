const Notification = require('../models/Notification');

const createInAppNotification = async ({
  recipientId,
  title,
  body,
  type = 'system',
  issueId = null,
  complaintId = '',
}) => {
  try {
    if (!recipientId) return null;
    const item = await Notification.create({
      recipient: recipientId,
      title,
      body,
      type,
      issueId,
      complaintId,
      read: false,
    });
    return item;
  } catch (err) {
    console.error('Failed to create in-app notification:', err.message);
    return null;
  }
};

const sendPushNotification = async ({
  pushToken,
  title,
  body,
  data = {},
}) => {
  try {
    // ==========================================
    // VALIDATE TOKEN
    // ==========================================

    if (
      !pushToken ||
      typeof pushToken !== 'string' ||
      !pushToken.trim()
    ) {
      console.log(
        'Notification: No valid push token provided.'
      );

      return {
        success: false,
        message: 'No valid push token',
      };
    }

    const normalizedToken =
      pushToken.trim();

    // ==========================================
    // CREATE MESSAGE
    // ==========================================

    const message = {
      to: normalizedToken,
      sound: 'default',
      title,
      body,
      data,
    };

    console.log(
      'Notification: Sending push notification...'
    );

    // ==========================================
    // SEND TO EXPO PUSH SERVICE
    // ==========================================

    const response =
      await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',
          headers: {
            Accept:
              'application/json',
            'Accept-encoding':
              'gzip, deflate',
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(
            message
          ),
        }
      );

    const responseData =
      await response.json();

    if (!response.ok) {
      console.error(
        'Notification: Expo request failed.'
      );

      return {
        success: false,
        message:
          'Expo notification request failed',
        response:
          responseData,
      };
    }

    const ticket =
      responseData?.data;

    if (
      ticket?.status === 'error'
    ) {
      console.error(
        'Notification: Expo returned an error:',
        ticket
      );

      return {
        success: false,
        message:
          ticket.message ||
          'Expo notification failed',
        response:
          responseData,
      };
    }

    console.log(
      'Notification: Push notification sent successfully.'
    );

    return {
      success: true,
      message:
        'Push notification sent successfully',
      response:
        responseData,
    };
  } catch (error) {
    console.error(
      'Notification: Send error:',
      error.message
    );

    return {
      success: false,
      message:
        'Failed to send push notification',
      error:
        error.message,
    };
  }
};

module.exports = {
  sendPushNotification,
  createInAppNotification,
};