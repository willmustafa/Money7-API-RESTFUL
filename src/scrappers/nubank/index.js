const { NubankApi } = require("nubank-api"); // CommonJS syntax
const uuidv4 = require("uuid").v4;
const readline = require("readline");
const fs = require("fs");

const Cartoes = require("../../models/TransactionModel");

const { NubankAccountTransaction } = require("../../models/Parser/nubank");

// const cert = fs.readFileSync('./auth/cert.p12');
// const authState = JSON.parse(fs.readFileSync('./auth/auth-state-cert.json').toString('utf8'));

// const api = new NubankApi({
//   ...authState,
//   clientName: 'willian felipe mustafa',
//   cert,
// });

(async () => {
  // const feedCard = await api.card.getFeed()
  // fs.writeFileSync('./feedCard.json', JSON.stringify(feedCard));

  // const feedAccount = await api.account.getBills()
  // fs.writeFileSync('./bills.json', JSON.stringify(feedAccount));

  // await api.auth.authenticateWithCertificate('', '')
  // await fs.writeFileSync('./auth-state-cert.json', JSON.stringify(api.authState));

  // const feedAccount = await api.account.getInvestments()
  // fs.writeFileSync('./investment-TEST.json', JSON.stringify(feedAccount));

  // const feedAccount = await api.account.getFeed()
  // fs.writeFileSync('./auth/account-feed.json', JSON.stringify(feedAccount));

  // const feedBalance = await api.account.getBalance()
  // fs.writeFileSync('./auth/account-balance.json', JSON.stringify(feedBalance));

  // const feedBills = await api.account.getBills()
  // fs.writeFileSync('./auth/account-bills.json', JSON.stringify(feedBills));

  // const feedTransaction = await api.account.getTransactions()
  // fs.writeFileSync('./auth/account-transactions.json', JSON.stringify(feedTransaction));

  // const accountBalance = fs.readFileSync('./auth/account-balance.json');

  const accountFeed = JSON.parse(
    fs.readFileSync("./auth/account-feed.json").toString("utf8")
  );

  for (const transaction of accountFeed.filter(
    (el) => el.__typename !== "WelcomeEvent"
  )) {
    const parser = new NubankAccountTransaction();
    console.log(parser.handle(transaction));

    Cartoes.create(parser.handle(transaction));
  }
})();
