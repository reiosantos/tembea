// eslint-disable-next-line import/prefer-default-export
export const calculateDistanceMock = {
  data: {
    rows: [{
      elements: [{
        distance: { text: '1.272, 30.33', value: '1.2223, 32.222' }
      }],
    }]
  }
};

export const noGoogleKeysMock = {
  data: {
    status: 'REQUEST_DENIED',
  }
};

export const invalidLocationMock = {
  data: {
    rows: [{
      elements: [{
        status: 'ZERO_RESULTS',
      }]
    }]
  }
};
