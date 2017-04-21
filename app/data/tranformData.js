const mysql = require('../connection/mysql_connect');
const queryString = require('../queries/queryString');
const LogPumpingModel = require('../models/LogPumpingModel');
const PortFolioService = require('../service/PortFolioService');
const entities = require('entities');
const commonFunctions = require('../commons/commonFunctions');

function removeHtmlTag(data) {
  return data.replace(/<(?!\/?(li|br|a)(?=>|\s.*>))\/?.*?>/ig, '');
}

function decodeHtml(data) {
  if (Array.isArray(data)) {
    return data.map(item => entities.decodeHTML(item));
  }
  return entities.decodeHTML(data);
}

function addTagLi(data) {
  return data.map(item => item.replace(/^/, '<li>'));
}

function addTagBr(data) {
  return data.map((item) => {
    const text = item.substr(item.length - 4);
    if (text !== '<br>') {
      return item.replace(/$/, '<br>');
    }
    return item;
  });
}

function getDataBussRouteAndMass(jobCode) {
  return Promise.all([
    mysql.query(queryString.queryBusRoute(jobCode)),
    mysql.query(queryString.queryMasstransit(jobCode)),
  ]);
}

function replaceBullet(messsage) {
  return messsage.replace(/•/g, '<li>');
}

function replaceTab(messsage) {
  return messsage.replace(/\\t/g, '');
}

function splitTag(messsage) {
  let result = messsage.split('\\r\\n');
  result = result.map(item => item.trim());
  result = result.filter(item => item !== '');
  return result;
}
function manageTag(messsage) {
  let data = '';
  data = decodeHtml(messsage);
  data = replaceBullet(data);
  data = replaceTab(data);
  data = removeHtmlTag(data);
  data = splitTag(data);
  data = addTagBr(data);
  return data;
}



function tranformJobs(message, jobCode, resultBusRoute, resultMasstransit) {
  const jobs = {};
  jobs._id = jobCode || null;
  jobs.companyId = Number(message.companycode) || null;
  jobs.title = message.jobtitle || null;
  jobs.jobType = message.jobtype || null;
  jobs.subJobType = message.subjobtype || null;
  jobs.contactAddress = message.contactaddress || null;
  jobs.contactName = message.contactname || null;
  jobs.contactTel = message.contacttel || null;
  jobs.provinceCode = message.provincecode || null;
  jobs.districtCode = message.amphoecode || null;
  jobs.subdistrictCode = message.tamboncode || null;
  jobs.numOfPosition = message.numberofposition || null;
  jobs.salary = message.salary || null;
  jobs.disabledPerson = Number(message.isfordisabled) || null;
  jobs.urgentJob = message.marqueeurgent || null;
  const attr = [];
  for (let i = 1; i <= 10; i += 1) {
    if (message[`attr${i}`] !== '') {
      attr.push((message[`attr${i}`]));
    }
  }
  jobs.properties = addTagLi(decodeHtml(attr)) || null;
  jobs.description = message.jobdescription === '' ? [] : manageTag(message.jobdescription) || null;
  jobs.masstransits = resultMasstransit.length <= 0 ? [] : resultMasstransit.map((item) => {
    const masstransit = {};
    masstransit.id = item.label;
    masstransit.distance = item.Distance;
    return masstransit;
  }) || null; // array
  jobs.busRoutes = resultBusRoute.length <= 0 ? [] : resultBusRoute.map((item) => {
    const bus = {};
    bus.id = item.BUS_NO_LABEL;
    bus.distance = item.MaxDistance;
    return bus;
  }) || null; // array
  jobs.industrial = message.industrialestate || null;
  jobs.lat = message.coord_y || null;
  jobs.lng = message.coord_x || null;
  jobs.workLocation = removeHtmlTag(message.worklocation) || null;
  jobs.lastupdate = message.updatemajorfields || null;
  jobs.timestamp = new Date();
  return jobs;
}

function tranformCompanies(message, message2) {
  const company = {};
  company._id = message2.FieldValue || null;
  company.nameTH = message.companyname || null;
  company.business = message.business || null;
  company.website = message.website || null;
  company.email = message.email || null;
  company.tel = message.tel || null;
  company.userId = message.user_id || null;
  company.applyMethod = manageTag(message.applymethod) || null; // เป็น array
  company.benefit = manageTag(message.benefit) || null; // เป็น array
  company.detail = manageTag(message.detail) || null; // เป็น array
  company.contactName = message.contactname || null;
  company.addressTH = message.address || null;
  company.provinceCode = message.provincecode || null;
  company.distinctCode = message.amphoecode || null;
  company.subdistinctCode = message.tamboncode || null;
  company.applyEnglish = message.englishapply || null;
  company.zipCode = message.postalcode || null;
  company.latitude = message.coord_y || null;
  company.longitude = message.coord_x || null;
  company.industrial = message.industrialestate || null;
  company.travel = manageTag(message.traveltothiscompany) || null; // เป็น array
  company.logo = message.logonamenew || null;
  company.map = message.mapnamenew || null;
  return company;
}

function createLog(response) {
  const dateTime = new Date();
  const timestamp = dateTime.getTime();
  const log = {
    timestamp,
    data: response,
  };
  return LogPumpingModel.create(log);
}

module.exports = {
  tranform: (message) => {
    const updataTable = message.UpdateTable;
    if (updataTable === 'Companies') {
      const companies = tranformCompanies(message.SetField, message.WhereCondition);
      return createLog(companies).then((log) => {
        const start = commonFunctions.getDate();
        const companyData = {};
        companyData["log"] = log.ops[0];
        companyData["data"] = companies;
        return PortFolioService.postCompany(companyData).then(() => {
          console.log(`Send company to portfolioservice success : ${companies._id}`);
          const end = commonFunctions.getDate();
          const time = commonFunctions.calculateTime(start, end);
          return LogPumpingModel.updateIntervalTime(log.ops[0]._id, 'data.postDataTime', time);
        }).catch((err) => {
          console.log(`Send company to portfolioservice : ${err}`);
        });
      });
    } else if (updataTable === 'Jobs') {
      const jobCode = message.WhereCondition.FieldValue;
      return getDataBussRouteAndMass(jobCode)
      .then(result => (
        tranformJobs(message.SetField, jobCode, result[0], result[1])
      ))
      .then((response) => {
        return createLog(response).then((log) => {
          const start = commonFunctions.getDate();
          const jobData = {};
          jobData["log"] = log.ops[0];
          jobData["data"] = response;
          return PortFolioService.postJob(jobData).then(() => {
            console.log(`Send job to portfolioservice success : ${response._id}`);
            const end = commonFunctions.getDate();
            const time = commonFunctions.calculateTime(start, end);
            return LogPumpingModel.updateIntervalTime(log.ops[0]._id, 'data.postDataTime', time);
          }).catch((err) => {
            console.log(`Send job to portfolioservice : ${err}`);
          });
        });
      });
    }
  },
};

