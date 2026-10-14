const Notification = require('../models/Notification');
const User = require('../models/User');

const invalidatePushToken = async (pushToken) => {
  if (!pushToken || typeof pushToken !== 'string') {
    return;
  }

  try {
    await User.updateMany(
      { pushToken: pushToken.trim() },
      { $set: { pushToken: '' } }
    );
  } catch (error) {
    console.warn(
      'Notification: Could not invalidate expired push token:',
      error.message
    );
  }
};

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
      priority: 'high',
      channelId: 'default',
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
        'Notification: Expo request failed:',
        responseData?.errors || responseData
      );

      return {
        success: false,
        message:
          responseData?.errors?.[0]?.message ||
          'Expo notification request failed',
        response:
          responseData,
      };
    }

    const tickets = Array.isArray(responseData?.data)
      ? responseData.data
      : responseData?.data
        ? [responseData.data]
        : [];

    if (tickets.length === 0) {
      const errorMessage =
        responseData?.errors?.[0]?.message ||
        'Expo returned no push ticket';

      console.error(
        'Notification: Expo returned no push ticket:',
        errorMessage
      );

      if (
        /DeviceNotRegistered|InvalidCredentials|not registered|expired/i.test(
          errorMessage
        )
      ) {
        await invalidatePushToken(normalizedToken);
      }

      return {
        success: false,
        message: errorMessage,
        response:
          responseData,
      };
    }

    const failedTicket = tickets.find(
      (ticket) => ticket?.status !== 'ok'
    );

    if (failedTicket) {
      const failureMessage =
        failedTicket.message ||
        failedTicket.details?.error ||
        'Expo notification failed';

      console.error(
        'Notification: Expo push ticket failed:',
        {
          message: failureMessage,
          error: failedTicket.details?.error,
        }
      );

      if (
        /DeviceNotRegistered|InvalidCredentials|not registered|expired/i.test(
          failureMessage
        ) ||
        /DeviceNotRegistered|InvalidCredentials|not registered|expired/i.test(
          failedTicket.details?.error || ''
        )
      ) {
        await invalidatePushToken(normalizedToken);
      }

      return {
        success: false,
        message: failureMessage,
        response: responseData,
      };
    }

    console.log(
      'Notification: Expo accepted push notification:',
      tickets[0].id || 'ticket ID unavailable'
    );

    return {
      success: true,
      message: 'Expo accepted push notification',
      ticketId: tickets[0].id,
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