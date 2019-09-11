const SlackControllerMock = {
  attachments: [{
    actions: [{
      name: 'book',
      style: 'primary',
      text: 'Schedule a Trip',
      type: 'button',
      value: 'book_new_trip'
    }, {
      name: 'view',
      style: 'primary',
      text: 'See Trip Itinerary',
      type: 'button',
      value: 'view_trips_itinerary'
    }, {
      name: 'changeLocation',
      style: 'primary',
      text: 'Change Location',
      type: 'button',
      value: 'change_location',
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
    author_icon: '',
    author_name: 'Tembea',
    buttonValue: 'defaultButton',
    callback_id: 'welcome_message',
    color: '#3AA3E3',
    fallback: '/fallback',
    fields: [],
    image_url: '',
    mrkdwn_in: [],
    text: 'What would you like to do today?',
    title: 'I am your trip operations assistant at Andela'
  }],
  response_type: 'ephemeral',
  text: 'Welcome to Tembea! \n _Your current home base is 🇰🇪 *Nairobi*_',
  as_user: false
};
export default SlackControllerMock;
