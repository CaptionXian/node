module.exports = Schema => ({
  User: require('./user')(Schema),
  Wxuser: require('./wxuser')(Schema),
  Hospital: require('./hospital')(Schema),
  News: require('./news')(Schema),
  Banner: require('./banner')(Schema),
  Department: require('./department')(Schema),
  Doctor: require('./doctor')(Schema),
  Wellness: require('./wellness')(Schema),
  PartyBuilding: require('./partybuilding')(Schema),
  Questionnaire: require('./questionnaire')(Schema),
  Record: require('./record')(Schema)
})
