export const sendDeclineCompletion = () => ({
  data: 'Everything is all good here'
});

export const sendBookNewTripMock = {
  attachments: [{
    actions: [
      {
        name: 'yes',
        style: 'primary',
        text: 'For Me',
        type: 'button',
        value: 'true'
      },
      {
        name: 'no',
        style: 'primary',
        text: 'For Someone',
        type: 'button',
        value: 'false'
      }],
    attachment_type: 'default',
    author_icon: undefined,
    author_name: undefined,
    buttonValue: 'defaultButton',
    callback_id: 'book_new_trip',
    color: '#3AAF85',
    fallback: 'fallback',
    fields: [],
    image_url: undefined,
    mrkdwn_in: [],
    text: undefined,
    title: undefined
  }, {
    actions: [{
      name: 'back',
      style: '#FFCCAA',
      text: '< Back',
      type: 'button',
      value:
        'back_to_launch'
    }, {
      confirm: {
        dismiss_text: 'No',
        ok_text: 'Yes',
        text: 'Do you really want to cancel?',
        title: 'Are you sure?'
      },
      name: 'cancel',
      style: 'danger',
      text: 'Cancel',
      type: 'button',
      value: 'cancel'
    }],
    attachment_type: 'default',
    author_icon: undefined,
    author_name: undefined,
    buttonValue: 'defaultButton',
    callback_id: 'back_to_launch',
    color: '#4285f4',
    fallback: 'fallback',
    fields: [],
    image_url: undefined,
    mrkdwn_in: [],
    text: undefined,
    title: undefined
  }],
  channel: undefined,
  response_type: 'ephemeral',
  text: 'Who are you booking for?',
  user: undefined,
  as_user: false
};

export const sendCompletionResponseMock = {
  attachments: [{
    actions: [{
      name: 'view', style: 'primary', text: 'View', type: 'button', value: 1
    }, {
      name: 'reschedule', style: 'primary', text: 'Reschedule ', type: 'button', value: 1
    }, {
      confirm: {
        dismiss_text: 'No',
        ok_text: 'Yes',
        text: 'Are you sure you want to cancel this trip',
        title: 'Are you sure?'
      },
      name: 'cancel_trip',
      style: 'danger',
      text: 'Cancel Trip',
      type: 'button',
      value: 1
    }, {
      confirm: {
        dismiss_text: 'No',
        ok_text: 'Yes',
        text: 'Do you really want to cancel?',
        title: 'Are you sure?'
      },
      name: 'cancel',
      style: 'danger',
      text: 'Cancel',
      type: 'button',
      value: 'cancel'
    }],
    attachment_type: 'default',
    author_icon: undefined,
    author_name: undefined,
    buttonValue: 'defaultButton',
    callback_id: 'itinerary_actions',
    color: '#3AAF85',
    fallback: 'fallback',
    fields: [],
    image_url: undefined,
    mrkdwn_in: [],
    text: undefined,
    title: undefined
  }],
  channel: undefined,
  response_type: 'ephemeral',
  text: 'Success! Trip request for <@UH1RT223> has been submitted.',
  user: undefined,
  as_user: false
};

export const tripHistoryMock = {
  user: undefined,
  as_user: false,
  attachments: [
    {
      actions: [],
      attachment_type: '',
      author_icon: '',
      author_name: '',
      color: 'good',
      fields: [
        {
          short: 'true',
          title: 'Pickup Location',
          value: 'ET'
        },
        {
          short: 'true',
          title: 'Destination',
          value: 'DOJO'
        }
      ],
      image_url: '',
      mrkdwn_in: ['text'],
      text: '*Date*: 22:00 12/12/2018',
      title: ''
    },
    {
      actions: [
        {
          name: 'back',
          style: '#FFCCAA',
          text: '< Back',
          type: 'button',
          value: 'view_trips_itinerary'
        },
        {
          confirm: {
            dismiss_text: 'No',
            ok_text: 'Yes',
            text: 'Do you really want to cancel?',
            title: 'Are you sure?'
          },
          name: 'cancel',
          style:
            'danger',
          text: 'Cancel',
          type: 'button',
          value: 'cancel'
        }
      ],
      attachment_type: 'default',
      author_icon: undefined,
      author_name: undefined,
      buttonValue: 'defaultButton',
      callback_id: 'welcome_message',
      color: '#4285f4',
      fallback: 'fallback',
      fields: [],
      image_url: undefined,
      mrkdwn_in: [],
      text: undefined,
      title: undefined
    }
  ],
  channel: undefined,
  color: undefined,
  response_type: 'ephemeral',
  text: '*Your trip history for the last 30 days*'
};
