
import Cache from '../cache';

export const getRequest = async (id, type, getRequestByPk) => {
  let request;
  const result = await Cache.fetch(`${type}Request_${id}`);
  const requestType = `${type.toLowerCase()}Request`;
  if (result && result[requestType]) {
    ({ [requestType]: request } = result);
  } else {
    request = await getRequestByPk(id);
    await Cache.saveObject(`${type}Request_${request.id}`, { [requestType]: request });
  }
  return request;
};

export const updateRequest = async (id, data, getRequestByPk, type, route = '') => {
  const request = await getRequestByPk(id);
  await request.update(data);
  await Cache.save(`${type}Request_${request.id}`,
    `${type.toLowerCase()}${route}Request`, request);
  return request;
};
