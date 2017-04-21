const queryBusRoute = (jobCode) => {
  const busRoute = `
    SELECT
    GROUP_CONCAT(DISTINCT BUS_JOB.Distance) as ListDiatance,
    MAX(BUS_JOB.Distance) as MaxDistance,
    BUS_ROUTE.BUS_NO_LABEL,
    BUS_JOB.JobCode
    FROM BUS_JOB
    LEFT JOIN BUS_ROUTE
    ON BUS_JOB.OGR_FID = BUS_ROUTE.OGR_FID 
    where JobCode = ${jobCode} 
    group by BUS_ROUTE.BUS_NO_LABEL
  `;
  return busRoute;
};


const queryMasstransit = (jobCode) => {
  const masstransit = `
    SELECT j.RunningNumber as jcode,
    STATION_ID AS label,
    Distance
    FROM Jobs j
    LEFT JOIN MST_MASSTRANSIT_JOB mj
    ON j.RunningNumber = mj.JobCode
    WHERE mj.JobCode = ${jobCode}
    GROUP BY jcode,label
  `;
  return masstransit;
};

module.exports = {
  queryBusRoute,
  queryMasstransit,
};
