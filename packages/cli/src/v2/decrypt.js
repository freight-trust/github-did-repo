const ghdid = require('github-did-library-web3');
const fse = require('fs-extra');
const path = require('path');

module.exports = (vorpal) => {
  vorpal
    .command(
      'decrypt <password> <pathToFile> <pathToOutFile>',
      'decrypt JSON-LD from a did key to a did key.',
    )
    .types({ string: ['_'] })
    .action(async ({ password, pathToFile, pathToOutFile }) => {
      const payload = JSON.parse(fse.readFileSync(path.resolve(pathToFile)));

      const encrypedWebWallet = fse
        .readFileSync(vorpal.webWalletFilePath)
        .toString();
      const wallet = ghdid.createWallet(encrypedWebWallet);
      wallet.unlock(password);

      const decryptedPaylaod = await ghdid.decryptForWithWalletAndResolver({
        data: payload.cipherText,
        fromPublicKeyId: payload.fromPublicKeyId,
        toPublicKeyId: payload.fromPublicKeyId,
        wallet,
        resolver: ghdid.resolver,
      });

      await fse.outputFile(
        path.resolve(pathToOutFile),
        JSON.stringify(decryptedPaylaod, null, 2),
      );

      await vorpal.logger.log({
        level: 'info',
        message: `${pathToOutFile} created.`,
      });
      return vorpal.wait(1);
    });
};
