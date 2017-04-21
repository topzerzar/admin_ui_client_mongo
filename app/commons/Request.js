const axios = require('axios');

const domain = '';
let headers = { Accept: 'application/json' };

exports.getHeader = () => headers;

exports.setHeader = (data) => {
  headers = Object.assign(headers, data);
};

exports.get = (path, params = {}) => axios.get(`${domain}${path}`, { headers: this.getHeader(), params });

exports.all = (params = []) => axios.all(params);

exports.post = (path, params = {}) => axios.post(`${domain}${path}`,
    params, { headers: this.getHeader() });

exports.put = (path, params = {}) => axios.put(`${domain}${path}`,
    params, { headers: this.getHeader() });

exports.delete = (path, params = {}) => axios.delete(`${domain}${path}`, { headers: this.getHeader(), params });
