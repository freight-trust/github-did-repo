const ghdid = require('github-did-library-web3');
const fse = require('fs-extra');
const path = require('path');
const os = require('os');

module.exports = (vorpal) => {
  vorpal
    .command('sign <password> <pathToFile> <pathToOutFile>', 'sign JSON-LD')
    .action(async ({ password, pathToFile, pathToOutFile }) => {
      const payload = JSON.parse(
        fse.readFileSync(path.resolve(process.cwd(), pathToFile)),
      );
      const encrypedWebWallet = fse
        .readFileSync(vorpal.webWalletFilePath)
        .toString();
      const wallet = ghdid.createWallet(encrypedWebWallet);
      wallet.unlock(password);

      const rootDIDPath = path.resolve(
        os.homedir(),
        '.github-did',
        'ghdid',
        'index.jsonld',
      );
      const rootDID = JSON.parse(fse.readFileSync(rootDIDPath));
      const [did, kid] = rootDID.publicKey[1].id.split('#kid=');

      const signedPayload = await ghdid.signWithWallet(
        payload,
        did,
        kid,
        wallet,
      );

      await fse.outputFile(
        path.resolve(process.cwd(), pathToOutFile),
        JSON.stringify(signedPayload, null, 2),
      );

      await vorpal.logger.log({
        level: 'info',
        message: `${pathToOutFile} created.`,
      });
      return vorpal.wait(1);
    });
};
