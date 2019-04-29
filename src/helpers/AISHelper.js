const partnerData = [{
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

export default partnerData;
