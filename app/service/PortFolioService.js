const request = require('../commons/Request');

const baseUrl = `${process.env.PORTFOLIO_SERVICE_URL}`;

module.exports = {
  postJob: (position) => {
    const positionURL = `${baseUrl}/api/v1/position`;
    return request.post(positionURL, position);
  },
  postCompany: (data) => {
    const companyURL = `${baseUrl}/api/v1/company`;
    console.log(companyURL);
    return request.post(companyURL, data);
  },
};
