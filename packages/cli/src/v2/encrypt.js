const ghdid = require('@github-did/lib');
const fse = require('fs-extra');
const path = require('path');

module.exports = (vorpal) => {
  vorpal
    .command(
      'encrypt <password> <pathToFile> <pathToOutFile> <fromPublicKeyId> <toPublicKeyId>',
      'encrypt JSON-LD from a did key to a did key.',
    )
    .types({ string: ['_'] })
    .action(
      async ({
        password,
        pathToFile,
        pathToOutFile,
        fromPublicKeyId,
        toPublicKeyId,
      }) => {
        // required because vorpal escapes # used in kid.

        // eslint-disable-next-line
        fromPublicKeyId = process.argv[4].replace(/['"]+/g, '');
        // eslint-disable-next-line
        toPublicKeyId = process.argv[5].replace(/['"]+/g, '');

        const payload = JSON.parse(fse.readFileSync(path.resolve(pathToFile)));
        const encrypedWebWallet = fse
          .readFileSync(vorpal.webWalletFilePath)
          .toString();
        const wallet = ghdid.createWallet(encrypedWebWallet);
        wallet.unlock(password);

        const encryptedPaylaod = await ghdid.encryptForWithWalletAndResolver({
          data: payload,
          fromPublicKeyId,
          toPublicKeyId,
          wallet,
          resolver: ghdid.resolver,
        });

        await fse.outputFile(
          path.resolve(pathToOutFile),
          JSON.stringify(encryptedPaylaod, null, 2),
        );

        await vorpal.logger.log({
          level: 'info',
          message: `${pathToOutFile} created.`,
        });
        return vorpal.wait(1);
      },
    );
};
