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

    console.log(
      'Notification title:',
      title
    );

    console.log(
      'Notification body:',
      body
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

    // ==========================================
    // READ RESPONSE
    // ==========================================

    const responseData =
      await response.json();

    console.log(
      'Notification: Expo response:',
      responseData
    );

    // ==========================================
    // HTTP ERROR
    // ==========================================

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

    // ==========================================
    // EXPO TICKET ERROR
    // ==========================================

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

    // ==========================================
    // SUCCESS
    // ==========================================

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
};