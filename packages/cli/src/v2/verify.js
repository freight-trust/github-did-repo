const ghdid = require('github-did-library-web3');
const fse = require('fs-extra');
const path = require('path');

module.exports = (vorpal) => {
  vorpal
    .command('verify <pathToFile>', 'verify signed JSON-LD')
    .action(async ({ pathToFile }) => {
      const payload = JSON.parse(
        fse.readFileSync(path.resolve(process.cwd(), pathToFile)),
      );
      const verified = await ghdid.verifyWithResolver(payload, ghdid.resolver);
      await vorpal.logger.log({
        level: 'info',
        message: `${pathToFile} ${
          verified ? 'proof is valid' : 'proof is not valid'
        } `,
      });
      return vorpal.wait(1);
    });
};
