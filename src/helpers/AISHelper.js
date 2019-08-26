export const partnerData = [{
  id: '-LRpI517GlyGbWQbxeDy',
  client: 'Microsoft Technology',
  status: 'External Engagements - Technology'
},
{
  id: '-TTpI517GlyGbWQbxeDy',
  client: 'Safaricom',
  status: 'External Engagements - Success'
},
{
  id: '-BNRpI517GlyGbWQbxeDy',
  client: 'England Tech',
  status: 'External Engagements - Operations'
},
{
  id: '-ZTpI516GlyGbWQbxeDy',
  client: 'England Tech',
  status: 'External Engagements - Technology'
},
{
  id: '-YTpI516GlyGbWQbxeDy',
  client: 'Pepsi Kenya',
  status: 'External Engagements - Success'
}
];
/* eslint-disable no-param-reassign */
const addDataValues = (obj) => {
  partnerData.forEach((partner) => {
    partner.type = obj.type;
    partner.start_date = obj.start_date;
    partner.end_date = obj.end_date;
    partner.salesforce_id = obj.salesforce_id;
    partner.updated_at = obj.updated_at;
    partner.created_at = obj.created_at;
    partner.updated_by = obj.updated_by;
    partner.next_available_date = obj.next_available_date;
    partner.client_id = obj.client_id;
  });
};
/* eslint-enable no-param-reassign */

addDataValues({
  type: 'recommendation',
  start_date: '2018-11-21T08:04:16.625Z',
  end_date: '',
  salesforce_id: '',
  updated_at: '2018-11-21T08:04:17.160Z',
  created_at: '2018-11-21T08:04:17.160Z',
  updated_by: 'Einstein Njoroge',
  next_available_date: '',
  client_id: ''
});

export const AisData = (email) => ({
  success: 'true',
  aisUserData: {
    id: '-Leq62lHFgakZGSjztk1',
    email,
    first_name: email.split('@')[0].split('.')[0],
    last_name: email.split('@')[0].split('.')[1],
    name: email.split('@')[0],
    api_token: '',
    picture: 'https://lh3.googleusercontent.com/-m00wMFFdllM/AAAAAAAAAAI/AAAAAAAAAAc/5aXzLWyz1Wk/s50/photo.jpg',
    status: 'active',
    roles: [
      {
        id: '-KXH7iME4ebMEXAEc7HP',
        name: 'Technology'
      },
      {
        id: '-KiihfZoseQeqC6bWTau',
        name: 'Andelan'
      }
    ],
    cohort: null,
    location: null,
    level: null,
    slogan: '',
    known_as: '',
    bio: '',
    github: '',
    slack: '',
    phone_number: '',
    organisation: null,
    progress: 0,
    access_token: '',
    promotion: '',
    last_login: '2019-05-14T11:31:04.910Z',
    created_at: '2019-05-14T11:31:04.934Z',
    updated_at: '2019-05-14T14:21:25.895Z',
    greenhouse_id: 0,
    bamboo_hr_id: 0,
    department_name: '',
    job_name: '',
    offer_start_date: '2019-05-14T11:31:04.913Z',
    department: null
  },
});
