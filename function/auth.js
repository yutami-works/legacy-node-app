const ActiveDirectory = require('activedirectory2');

// ActiveDirectory information
const adServer = process.env.AD;
const domain = process.env.DOMAIN;
const [secondDomain, topDomain] = domain.split('.').map(domainStr => domainStr);

// connection information
let ldapConfig = {
  url: `ldap://${adServer}.${domain}`,
  baseDN: `dc=${secondDomain},dc=${topDomain}`
};

// AD authentication Promise function
const authnticateAd = (upn, password) => {
  return new Promise((resolve, reject) => {
    // AD instance for authentication
    const nonAuthAd = new ActiveDirectory(ldapConfig);
    nonAuthAd.authenticate(upn, password, (err, auth) => {
      if (auth) {
        // AD authentication OK
        console.log('AD authentication succeeded!');
        resolve(auth); // return true
      } else {
        // no auth is all failed
        console.error('AD authentication failed...');
        resolve(auth); // can not use reject without try catch
      }
    });
  });
}

// security group Promise function
const checkAdGroupMember = (upn, password) => {
  return new Promise((resolve, reject) => {
    // add authentication information
    ldapConfig.username = upn;
    ldapConfig.password = password;
    // AD instance
    const ad = new ActiveDirectory(ldapConfig);
    const authorizedGroup = process.env.AD_AUTH_GROUP;

    // check user is a group member
    ad.isUserMemberOf(upn, authorizedGroup, (err, isMember) => {
      if (isMember) {
        console.log('Member check succeeded!');
        resolve(isMember);
      } else {
        // err and not is member  is all failed
        console.error('Member check failed...');
        resolve(isMember); // can not use reject without try catch
      }
    });
  });
}

// login app function
const authenticateApp = async (username, password) => {
  // authentication result
  let authResult = {
    auth: false,
    msg: ''
  };

  const upn = `${username}@${domain}`;

  // AD authentication
  const adAuth = await authnticateAd(upn, password);

  if (!adAuth) {
    authResult,msg = 'ユーザー名またはパスワードが違います。';
    return authResult;
  }

  // app authentication
  const isMember = await checkAdGroupMember(upn, password);

  if (!isMember) {
    authResult.msg = 'ログイン権限がありません。';
    return authResult;
  }

  authResult.auth = true;
  return authResult;
}

module.exports = {
  authenticateApp
};