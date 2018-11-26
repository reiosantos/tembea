export const sendBookNewTripMock = {
  attachments: [{
    actions: [{
      name:
   'yes',
      style: 'primary',
      text: 'For Me',
      type: 'button',
      value: 'true'
    }, {
      name: 'no', style: 'primary', text: 'For Someone', type: 'button', value: 'false'
    }],
    attachment_type: 'default',
    author_icon: undefined,
    author_name: undefined,
    callback_id: 'book_new_trip',
    color: '#FFCCAA',
    fallback: 'fallback',
    fields: [],
    image_url: undefined,
    text: undefined,
    title: undefined
  }, {
    actions: [{
      name: 'back', style: '#FFCCAA', text: '< Back', type: 'button', value: 'back_to_launch'
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
    callback_id: 'back_to_launch',
    color: '#FFCCAA',
    fallback: 'fallback',
    fields: [],
    image_url: undefined,
    text: undefined,
    title: undefined
  }],
  channel: undefined,
  response_type: 'ephemeral',
  text: 'Who are you booking for?'
};

export const sendCompletionResponseMock = {
  attachments: [{
    actions: [{
      name: 'view', style: 'primary', text: 'View', type: 'button', value: '1 1'
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
        dismiss_text: 'No', ok_text: 'Yes', text: 'Do you really want to cancel?', title: 'Are you sure?'
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
    callback_id: 'itinerary_actions',
    color: '#FFCCAA',
    fallback: 'fallback',
    fields: [],
    image_url: undefined,
    text: undefined,
    title: undefined
  }],
  channel: undefined,
  response_type: 'ephemeral',
  text: 'Success! Your request has been submitted.'
};
