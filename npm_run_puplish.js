 /*jshint esversion: 6 */
 const ghPages = require('gh-pages');
 const path = require('path');
 const fs = require('fs-extra')

 const pathOfPublic = path.join(__dirname, 'public');


 function copyVersion(version) {

     const pathOfVersion = path.join(pathOfPublic, 'v' + version);
     const pathOfApps = path.join(pathOfVersion, 'apps');
     const pathOfList = path.join(pathOfVersion, 'autoGeneratedList.json');

     return fs.readdir(pathOfApps)
         .then(function (items) {

             const apps = items.filter(v => v.includes('.json'));
             const appDetails = [];

             for (var i = 0; i < apps.length; i++) {
                 const contentString = fs.readFileSync(path.join(pathOfApps, apps[i]));
                 const content = JSON.parse(contentString)
                 const captainVersion = (content.captainVersion + '');
                 const versionString = (version + '');
                 if (versionString !== captainVersion)
                     throw new Error(`unmatched versions   ${versionString}  ${captainVersion} for ${apps[i]}`)
                 if (captainVersion === "1") {
                     if (contentString.includes("$$cap_root_domain"))
                         throw new Error('V1 should not have root domain')
                 }

                 apps[i] = apps[i].replace('.json', '');

                 if (captainVersion + '' === '2') {
                     if (!content.displayName) content.displayName = apps[i]
                     if (!content.description) content.description = ''

                         appDetails[i] = {
                             name: apps[i],
                             displayName: content.displayName,
                             description: content.description,
                             logoUrl: content.hasLogo ? (apps[i] + '.png') : 'https://caprover.com/img/logo.png',
                         }
                 }

             }

             fs.outputJsonSync(pathOfList, {
                 appList: apps,
                 appDetails: appDetails
             });

         })
 }


 Promise.resolve()
     .then(function () {
         return copyVersion(1)
     })
     .then(function () {
         return copyVersion(2)
     })
     .then(function () {
         ghPages.publish('public', function (err) {
             if (err)
                 console.log(err);
             else
                 console.log('Built and deployed successfully');
         });
     })
     .catch(function (err) {
         console.error(err)
     })