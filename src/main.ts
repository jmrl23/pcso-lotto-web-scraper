import LottoScrapper from './LottoScrapper';

async function main() {
  const lottoScrapper = new LottoScrapper();
  const results = await lottoScrapper.get({
    from: 'August 1 2024',
  });

  console.log(results);
}
void main();
